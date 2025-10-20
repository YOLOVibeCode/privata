/**
 * @fileoverview Painless event subscription service for Privata
 * @description Simple, clean Node.js event subscription with zero performance impact when unused
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  PrivataEvent,
  EventType,
  EventTypeMap,
  EventHandler,
  EventSubscriptionOptions,
  EventMetadata,
  DataCreatedPayload,
  DataUpdatedPayload,
  DataDeletedPayload,
  SystemErrorPayload,
} from '../types/EventTypes';

/**
 * Simple event subscription manager
 *
 * Features:
 * - Zero performance impact when no subscribers
 * - Clean, simple API
 * - Type-safe event handling
 * - Automatic cleanup
 * - Non-blocking event processing
 */
export class EventSubscriptionService extends EventEmitter {
  private readonly _subscriptions = new Map<string, {
    eventType: EventType;
    handler: EventHandler;
    options: EventSubscriptionOptions;
    isActive: boolean;
  }>();
  private _hasSubscribers = false;

  /**
   * Subscribe to a specific event type
   *
   * @param eventType - The event type to subscribe to
   * @param handler - Event handler function
   * @param options - Subscription options
   * @returns Subscription ID for unsubscribing
   *
   * @example
   * ```typescript
   * const subscriptionId = eventService.subscribe('data.created', (event) => {
   *   console.log('New data created:', event.payload);
   * });
   * ```
   */
  public subscribe<TEventType extends EventType>(
    eventType: TEventType,
    handler: EventHandler<TEventType>,
    options: EventSubscriptionOptions = {},
  ): string {
    const subscriptionId = uuidv4();

    this._subscriptions.set(subscriptionId, {
      eventType,
      handler: handler as EventHandler,
      options: {
        highLevelOnly: false,
        includeDetails: true,
        maxBufferSize: 100,
        bufferWhenNotReady: true,
        ...options,
      },
      isActive: true,
    });

    this._hasSubscribers = true;
    return subscriptionId;
  }

  /**
   * Unsubscribe from an event
   *
   * @param subscriptionId - Subscription ID to remove
   *
   * @example
   * ```typescript
   * eventService.unsubscribe(subscriptionId);
   * ```
   */
  public unsubscribe(subscriptionId: string): void {
    const subscription = this._subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.isActive = false;
      this._subscriptions.delete(subscriptionId);

      // Update hasSubscribers flag
      this._hasSubscribers = this._subscriptions.size > 0;
    }
  }

  /**
   * Emit an event (only if there are subscribers)
   *
   * @param event - Event to emit
   *
   * @example
   * ```typescript
   * eventService.emit({
   *   eventId: 'evt_123',
   *   eventType: 'data.created',
   *   timestamp: new Date(),
   *   source: 'UserService',
   *   payload: { modelName: 'User', recordId: 'user_123' },
   *   metadata: {}
   * });
   * ```
   */
  public emitEvent(event: PrivataEvent): void {
    // Early return if no subscribers - zero performance impact
    if (!this._hasSubscribers) {
      return;
    }

    // Find active subscribers for this event type
    const subscribers = Array.from(this._subscriptions.values())
      .filter(sub => sub.isActive && sub.eventType === event.eventType);

    if (subscribers.length === 0) {
      return;
    }

    // Process subscribers asynchronously to avoid blocking
    setImmediate(() => {
      for (const subscription of subscribers) {
        try {
          // Apply filter if provided
          if (subscription.options.filter && !subscription.options.filter(event)) {
            continue;
          }

          // Call handler
          const result = subscription.handler(event);

          // Handle async handlers
          if (result instanceof Promise) {
            result.catch(error => {
              console.error(`Event handler error for ${event.eventType}:`, error);
            });
          }
        } catch (error) {
          console.error(`Event handler error for ${event.eventType}:`, error);
        }
      }
    });
  }

  /**
   * Get active subscriptions count
   */
  public getActiveSubscriptionsCount(): number {
    return this._subscriptions.size;
  }

  /**
   * Check if there are any active subscribers
   */
  public hasSubscribers(): boolean {
    return this._hasSubscribers;
  }

  /**
   * Get subscriptions for a specific event type
   */
  public getSubscriptionsForEventType(eventType: EventType): string[] {
    return Array.from(this._subscriptions.entries())
      .filter(([_, subscription]) => subscription.isActive && subscription.eventType === eventType)
      .map(([id, _]) => id);
  }

  /**
   * Clear all subscriptions
   */
  public clear(): void {
    this._subscriptions.clear();
    this._hasSubscribers = false;
  }

  /**
   * Get all active subscription IDs
   */
  public getAllSubscriptionIds(): string[] {
    return Array.from(this._subscriptions.keys());
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create a simple event subscription
 *
 * @param eventType - Event type to subscribe to
 * @param handler - Event handler
 * @param options - Subscription options
 * @returns Subscription ID
 *
 * @example
 * ```typescript
 * const subscriptionId = subscribeToEvent('data.created', (event) => {
 *   console.log('Data created:', event.payload.modelName);
 * });
 * ```
 */
export function subscribeToEvent<TEventType extends EventType>(
  eventType: TEventType,
  handler: EventHandler<TEventType>,
  options?: EventSubscriptionOptions,
): string {
  return globalEventService.subscribe(eventType, handler, options);
}

/**
 * Unsubscribe from an event
 *
 * @param subscriptionId - Subscription ID to remove
 *
 * @example
 * ```typescript
 * unsubscribeFromEvent(subscriptionId);
 * ```
 */
export function unsubscribeFromEvent(subscriptionId: string): void {
  globalEventService.unsubscribe(subscriptionId);
}

/**
 * Emit an event
 *
 * @param event - Event to emit
 *
 * @example
 * ```typescript
 * emitEvent({
 *   eventId: 'evt_123',
 *   eventType: 'data.created',
 *   timestamp: new Date(),
 *   source: 'UserService',
 *   payload: { modelName: 'User', recordId: 'user_123' },
 *   metadata: {}
 * });
 * ```
 */
export function emitEvent(event: PrivataEvent): void {
  globalEventService.emitEvent(event);
}

/**
 * Get the global event service instance
 */
export function getEventService(): EventSubscriptionService {
  return globalEventService;
}

/**
 * Clear all event subscriptions (useful for testing)
 */
export function clearAllEventSubscriptions(): void {
  globalEventService.clear();
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

/**
 * Global event service instance
 * This provides a singleton pattern for easy access throughout the application
 */
const globalEventService = new EventSubscriptionService();

// ============================================================================
// EVENT CREATION HELPERS
// ============================================================================

/**
 * Create event metadata
 */
export function createEventMetadata(overrides: Partial<EventMetadata> = {}): EventMetadata {
  return {
    ...(overrides.userId !== undefined && { userId: overrides.userId }),
    ...(overrides.sessionId !== undefined && { sessionId: overrides.sessionId }),
    ...(overrides.requestId !== undefined && { requestId: overrides.requestId }),
    ...(overrides.ipAddress !== undefined && { ipAddress: overrides.ipAddress }),
    ...(overrides.userAgent !== undefined && { userAgent: overrides.userAgent }),
    ...(overrides.custom !== undefined && { custom: overrides.custom }),
  };
}

/**
 * Create a data created event
 */
export function createDataCreatedEvent(
  modelName: string,
  recordId: string,
  source: string,
  options: {
    pseudonym?: string;
    region?: string;
    dataCategories?: string[];
    containsPII?: boolean;
    containsPHI?: boolean;
    metadata?: EventMetadata;
  } = {},
): PrivataEvent {
  const payload: DataCreatedPayload = {
    modelName,
    recordId,
    region: options.region ?? 'US',
    dataCategories: options.dataCategories ?? [],
    containsPII: options.containsPII ?? false,
    containsPHI: options.containsPHI ?? false,
    ...(options.pseudonym !== undefined && { pseudonym: options.pseudonym }),
  };
  
  return {
    eventId: uuidv4(),
    eventType: 'data.created',
    timestamp: new Date(),
    source,
    payload,
    metadata: options.metadata ?? createEventMetadata(),
  };
}

/**
 * Create a data updated event
 */
export function createDataUpdatedEvent(
  modelName: string,
  recordId: string,
  source: string,
  options: {
    pseudonym?: string;
    region?: string;
    updatedFields?: string[];
    previousValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    dataCategories?: string[];
    metadata?: EventMetadata;
  } = {},
): PrivataEvent {
  const payload: DataUpdatedPayload = {
    modelName,
    recordId,
    region: options.region ?? 'US',
    updatedFields: options.updatedFields ?? [],
    newValues: options.newValues ?? {},
    dataCategories: options.dataCategories ?? [],
    ...(options.pseudonym !== undefined && { pseudonym: options.pseudonym }),
    ...(options.previousValues !== undefined && { previousValues: options.previousValues }),
  };
  
  return {
    eventId: uuidv4(),
    eventType: 'data.updated',
    timestamp: new Date(),
    source,
    payload,
    metadata: options.metadata ?? createEventMetadata(),
  };
}

/**
 * Create a data deleted event
 */
export function createDataDeletedEvent(
  modelName: string,
  recordId: string,
  source: string,
  options: {
    pseudonym?: string;
    region?: string;
    dataCategories?: string[];
    deletionReason?: 'user_request' | 'gdpr_erasure' | 'system_cleanup' | 'other';
    softDelete?: boolean;
    metadata?: EventMetadata;
  } = {},
): PrivataEvent {
  const payload: DataDeletedPayload = {
    modelName,
    recordId,
    region: options.region ?? 'US',
    dataCategories: options.dataCategories ?? [],
    deletionReason: options.deletionReason ?? 'other',
    softDelete: options.softDelete ?? false,
    ...(options.pseudonym !== undefined && { pseudonym: options.pseudonym }),
  };
  
  return {
    eventId: uuidv4(),
    eventType: 'data.deleted',
    timestamp: new Date(),
    source,
    payload,
    metadata: options.metadata ?? createEventMetadata(),
  };
}

/**
 * Create a system error event
 */
export function createSystemErrorEvent(
  errorCode: string,
  errorMessage: string,
  source: string,
  options: {
    stackTrace?: string;
    component?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    recovered?: boolean;
    metadata?: EventMetadata;
  } = {},
): PrivataEvent {
  const payload: SystemErrorPayload = {
    errorCode,
    errorMessage,
    component: options.component ?? source,
    severity: options.severity ?? 'medium',
    recovered: options.recovered ?? false,
    ...(options.stackTrace !== undefined && { stackTrace: options.stackTrace }),
  };
  
  return {
    eventId: uuidv4(),
    eventType: 'system.error',
    timestamp: new Date(),
    source,
    payload,
    metadata: options.metadata ?? createEventMetadata(),
  };
}
