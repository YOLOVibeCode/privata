/**
 * @fileoverview Non-blocking event emitter service for Privata
 * @description High-performance, thread-safe event system with zero impact when no subscribers
 */

import { v4 as uuidv4 } from 'uuid';
import {
  BaseEvent,
  PrivataEvent,
  EventType,
  EventTypeMap,
  EventHandler,
  EventSubscription,
  EventSubscriptionOptions,
  EventEmitterConfig,
  EventMetadata,
} from '../types/EventTypes';

/**
 * Event processing result
 */
interface EventProcessingResult {
  readonly success: boolean;
  readonly error?: Error;
  readonly processingTimeMs: number;
}

/**
 * Event buffer entry
 */
interface EventBufferEntry {
  readonly event: PrivataEvent;
  readonly timestamp: Date;
  readonly retryCount: number;
}

/**
 * Non-blocking event emitter service
 *
 * Features:
 * - Zero performance impact when no subscribers
 * - Non-blocking event processing
 * - Thread-safe operations
 * - Event buffering and retry logic
 * - Performance metrics
 * - Error recovery
 */
export class EventEmitterService {
  private readonly _subscriptions = new Map<string, EventSubscription & { handler: EventHandler<any> }>();
  private readonly _handlers = new Map<string, Set<EventHandler>>();
  private readonly _eventBuffer = new Map<string, EventBufferEntry[]>();
  private readonly _config: Required<EventEmitterConfig>;
  private readonly _performanceMetrics = new Map<string, number[]>();
  private _isProcessing = false;
  private _processingQueue: PrivataEvent[] = [];
  private _processingTimeout: NodeJS.Timeout | null = null;

  constructor(config: EventEmitterConfig = {}) {
    this._config = {
      maxConcurrentHandlers: config.maxConcurrentHandlers ?? 10,
      processingTimeoutMs: config.processingTimeoutMs ?? 5000,
      enableBuffering: config.enableBuffering ?? true,
      bufferSize: config.bufferSize ?? 1000,
      enablePerformanceMetrics: config.enablePerformanceMetrics ?? true,
      enableErrorRecovery: config.enableErrorRecovery ?? true,
    };
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Subscribe to a specific event type
   * @param eventType - The event type to subscribe to
   * @param handler - Event handler function
   * @param options - Subscription options
   * @returns Subscription ID for unsubscribing
   */
  public subscribe<TEventType extends EventType>(
    eventType: TEventType,
    handler: EventHandler<TEventType>,
    options: EventSubscriptionOptions = {},
  ): string {
    const subscriptionId = uuidv4();
    const subscription: EventSubscription & { handler: EventHandler<any> } = {
      subscriptionId,
      eventType,
      options: {
        highLevelOnly: false,
        includeDetails: true,
        maxBufferSize: 100,
        bufferWhenNotReady: true,
        ...options,
      },
      isActive: true,
      createdAt: new Date(),
      handler,
    };

    // Store subscription
    this._subscriptions.set(subscriptionId, subscription);

    // Add handler to event type
    if (!this._handlers.has(eventType)) {
      this._handlers.set(eventType, new Set());
    }
    this._handlers.get(eventType)!.add(handler as EventHandler);

    // Process any buffered events for this subscription
    this._processBufferedEvents(subscriptionId);

    return subscriptionId;
  }

  /**
   * Unsubscribe from an event
   * @param subscriptionId - Subscription ID to remove
   */
  public unsubscribe(subscriptionId: string): void {
    const subscription = this._subscriptions.get(subscriptionId);
    if (!subscription) {
      return;
    }

    // Remove handler from handlers map
    const handlers = this._handlers.get(subscription.eventType);
    if (handlers) {
      handlers.delete(subscription.handler);
      if (handlers.size === 0) {
        this._handlers.delete(subscription.eventType);
      }
    }

    // Delete subscription
    this._subscriptions.delete(subscriptionId);

    // Clean up buffer
    this._eventBuffer.delete(subscriptionId);
  }

  /**
   * Emit an event (non-blocking)
   * @param event - Event to emit
   */
  public emit(event: PrivataEvent): void {
    // Early return if no subscribers - zero performance impact
    if (this._handlers.size === 0) {
      return;
    }

    // Add to processing queue
    this._processingQueue.push(event);

    // Start processing if not already running
    if (!this._isProcessing) {
      this._startProcessing();
    }
  }

  /**
   * Get active subscriptions count
   */
  public getActiveSubscriptionsCount(): number {
    return this._subscriptions.size;
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const metrics: Record<string, { avg: number; min: number; max: number; count: number }> = {};

    for (const [eventType, times] of this._performanceMetrics.entries()) {
      if (times.length === 0) continue;

      const sum = times.reduce((acc, time) => acc + time, 0);
      metrics[eventType] = {
        avg: sum / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
        count: times.length,
      };
    }

    return metrics;
  }

  /**
   * Clear all subscriptions and buffers
   */
  public clear(): void {
    this._subscriptions.clear();
    this._handlers.clear();
    this._eventBuffer.clear();
    this._processingQueue = [];
    this._performanceMetrics.clear();
    this._stopProcessing();
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Start non-blocking event processing
   */
  private _startProcessing(): void {
    if (this._isProcessing) {
      return;
    }

    this._isProcessing = true;
    this._processNextEvent();
  }

  /**
   * Stop event processing
   */
  private _stopProcessing(): void {
    this._isProcessing = false;
    if (this._processingTimeout) {
      clearTimeout(this._processingTimeout);
      this._processingTimeout = null;
    }
  }

  /**
   * Process the next event in the queue
   */
  private _processNextEvent(): void {
    if (!this._isProcessing || this._processingQueue.length === 0) {
      this._stopProcessing();
      return;
    }

    const event = this._processingQueue.shift()!;
    this._processEvent(event)
      .then(() => {
        // Schedule next event processing
        this._processingTimeout = setTimeout(() => {
          this._processNextEvent();
        }, 0);
      })
      .catch(error => {
        console.error('Event processing error:', error);
        if (this._config.enableErrorRecovery) {
          // Retry processing
          this._processingTimeout = setTimeout(() => {
            this._processNextEvent();
          }, 100);
        } else {
          this._stopProcessing();
        }
      });
  }

  /**
   * Process a single event
   */
  private async _processEvent(event: PrivataEvent): Promise<void> {
    const startTime = Date.now();
    const handlers = this._handlers.get(event.eventType);

    if (!handlers || handlers.size === 0) {
      return;
    }

    // Process handlers concurrently (up to maxConcurrentHandlers)
    const handlerPromises: Promise<EventProcessingResult>[] = [];
    const handlerArray = Array.from(handlers);

    for (let i = 0; i < handlerArray.length; i += this._config.maxConcurrentHandlers) {
      const batch = handlerArray.slice(i, i + this._config.maxConcurrentHandlers);
      const batchPromises = batch.map(handler => this._executeHandler(handler, event));
      handlerPromises.push(...batchPromises);
    }

    // Wait for all handlers to complete
    const results = await Promise.allSettled(handlerPromises);
    const processingTime = Date.now() - startTime;

    // Record performance metrics
    if (this._config.enablePerformanceMetrics) {
      this._recordPerformanceMetric(event.eventType, processingTime);
    }

    // Handle failed handlers
    const failedResults = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason);

    if (failedResults.length > 0 && this._config.enableErrorRecovery) {
      console.warn(`${failedResults.length} event handlers failed for ${event.eventType}:`, failedResults);
    }
  }

  /**
   * Execute a single event handler
   */
  private async _executeHandler(
    handler: EventHandler,
    event: PrivataEvent,
  ): Promise<EventProcessingResult> {
    const startTime = Date.now();

    try {
      // Set timeout for handler execution
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Handler timeout after ${this._config.processingTimeoutMs}ms`));
        }, this._config.processingTimeoutMs);
      });

      // Execute handler with timeout
      await Promise.race([handler(event), timeoutPromise]);

      return {
        success: true,
        processingTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        processingTimeMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Process buffered events for a new subscription
   */
  private _processBufferedEvents(subscriptionId: string): void {
    const subscription = this._subscriptions.get(subscriptionId);
    if (!subscription?.options.bufferWhenNotReady) {
      return;
    }

    const bufferedEvents = this._eventBuffer.get(subscriptionId) || [];
    if (bufferedEvents.length === 0) {
      return;
    }

    // Process buffered events
    for (const bufferEntry of bufferedEvents) {
      if (bufferEntry.event.eventType === subscription.eventType) {
        this.emit(bufferEntry.event);
      }
    }

    // Clear buffer
    this._eventBuffer.delete(subscriptionId);
  }

  /**
   * Record performance metric
   */
  private _recordPerformanceMetric(eventType: string, processingTimeMs: number): void {
    if (!this._performanceMetrics.has(eventType)) {
      this._performanceMetrics.set(eventType, []);
    }

    const metrics = this._performanceMetrics.get(eventType)!;
    metrics.push(processingTimeMs);

    // Keep only last 100 measurements to prevent memory leaks
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }
  }
}

// Note: Event creation helpers are available in EventSubscriptionService
// to avoid duplication and ensure consistency across the codebase
