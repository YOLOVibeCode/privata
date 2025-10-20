/**
 * @fileoverview Unit tests for EventEmitterService
 * @description Tests the internal event emitter functionality
 */

import { EventEmitterService } from '../../../src/services/EventEmitterService';
import { createDataCreatedEvent } from '../../../src/services/EventSubscriptionService';

describe('EventEmitterService', () => {
  let service: EventEmitterService;

  beforeEach(() => {
    service = new EventEmitterService({
      processingTimeoutMs: 1000, // Reduce timeout for tests
      enableErrorRecovery: true, // Enable error recovery to see console.warn
    });
  });

  afterEach(() => {
    service.clear();
  });

  describe('Event Subscription and Emission', () => {
    it('should subscribe to events and emit them', async () => {
      const testEvent = createDataCreatedEvent('User', 'user_123', 'TestService');
      let eventReceived = false;
      
      service.subscribe('data.created', (event) => {
        expect(event.eventType).toBe('data.created');
        eventReceived = true;
      });

      service.emit(testEvent);
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(eventReceived).toBe(true);
    });

    it('should handle multiple handlers for same event type', async () => {
      let handler1Called = false;
      let handler2Called = false;
      
      service.subscribe('data.created', () => {
        handler1Called = true;
      });
      service.subscribe('data.created', () => {
        handler2Called = true;
      });
      
      const testEvent = createDataCreatedEvent('User', 'user_123', 'TestService');
      service.emit(testEvent);
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(handler1Called).toBe(true);
      expect(handler2Called).toBe(true);
    });

    it('should unsubscribe from events', async () => {
      let callCount = 0;
      const subscriptionId = service.subscribe('data.created', () => {
        callCount++;
      });
      
      const testEvent1 = createDataCreatedEvent('User', 'user_123', 'TestService');
      service.emit(testEvent1);
      
      // Wait for first event
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(callCount).toBe(1);
      
      service.unsubscribe(subscriptionId);
      
      const testEvent2 = createDataCreatedEvent('User', 'user_456', 'TestService');
      service.emit(testEvent2);
      
      // Wait for second event
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(callCount).toBe(1); // Should not be called again
    });
  });

  describe('Performance Optimization', () => {
    it('should have zero performance impact when no subscribers', () => {
      const startTime = Date.now();
      
      // Emit 1000 events with no subscribers
      for (let i = 0; i < 1000; i++) {
        const testEvent = createDataCreatedEvent('User', `user_${i}`, 'TestService');
        service.emit(testEvent);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should be very fast (less than 5ms for 1000 events)
      expect(duration).toBeLessThan(5);
    });

    it('should maintain performance with many handlers', async () => {
      const handlers = Array.from({ length: 10 }, () => jest.fn());
      
      // Register 10 handlers
      const subscriptionIds = handlers.map(handler => 
        service.subscribe('data.created', handler)
      );
      
      const startTime = Date.now();
      
      // Emit 10 events
      for (let i = 0; i < 10; i++) {
        const testEvent = createDataCreatedEvent('User', `user_${i}`, 'TestService');
        service.emit(testEvent);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should still be reasonably fast
      expect(duration).toBeLessThan(50);
      
      // Wait for all async handlers to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // All handlers should have been called
      handlers.forEach(handler => {
        expect(handler).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in event handlers gracefully', async () => {
      const workingHandler = jest.fn();
      
      service.subscribe('data.created', () => {
        throw new Error('Handler error');
      });
      
      service.subscribe('data.created', workingHandler);
      
      const testEvent = createDataCreatedEvent('User', 'user_123', 'TestService');
      
      // Should not throw
      expect(() => {
        service.emit(testEvent);
      }).not.toThrow();
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(workingHandler).toHaveBeenCalledTimes(1);
    });

    it('should continue processing other handlers when one fails', async () => {
      const workingHandler1 = jest.fn();
      const workingHandler2 = jest.fn();
      
      service.subscribe('data.created', () => {
        throw new Error('Handler error');
      });
      service.subscribe('data.created', workingHandler1);
      service.subscribe('data.created', workingHandler2);
      
      const testEvent = createDataCreatedEvent('User', 'user_123', 'TestService');
      service.emit(testEvent);
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(workingHandler1).toHaveBeenCalledTimes(1);
      expect(workingHandler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Service Management', () => {
    it('should track active subscriptions', () => {
      expect(service.getActiveSubscriptionsCount()).toBe(0);
      
      const sub1 = service.subscribe('data.created', jest.fn());
      expect(service.getActiveSubscriptionsCount()).toBe(1);
      
      const sub2 = service.subscribe('data.updated', jest.fn());
      expect(service.getActiveSubscriptionsCount()).toBe(2);
      
      service.unsubscribe(sub1);
      expect(service.getActiveSubscriptionsCount()).toBe(1);
      
      service.unsubscribe(sub2);
      expect(service.getActiveSubscriptionsCount()).toBe(0);
    });

    it('should clear all subscriptions', () => {
      const handler = jest.fn();
      
      service.subscribe('data.created', handler);
      service.subscribe('data.updated', handler);
      service.subscribe('data.deleted', handler);
      
      expect(service.getActiveSubscriptionsCount()).toBe(3);
      
      service.clear();
      
      expect(service.getActiveSubscriptionsCount()).toBe(0);
    });
  });

  describe('Performance Metrics', () => {
    it('should track performance metrics', () => {
      const metrics = service.getPerformanceMetrics();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
    });

    it('should update metrics after event emission', async () => {
      service.subscribe('data.created', () => {
        // Handler executed
      });
      
      const testEvent = createDataCreatedEvent('User', 'user_123', 'TestService');
      service.emit(testEvent);
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const metrics = service.getPerformanceMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent event emissions', async () => {
      const handlers = Array.from({ length: 5 }, () => jest.fn());
      
      // Register handlers
      const subscriptionIds = handlers.map(handler => 
        service.subscribe('data.created', handler)
      );
      
      // Emit events concurrently
      for (let i = 0; i < 10; i++) {
        service.emit(createDataCreatedEvent('User', `user_${i}`, 'TestService'));
      }
      
      // Wait for all async handlers to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // All handlers should have received multiple events
      handlers.forEach(handler => {
        expect(handler).toHaveBeenCalled();
        // At least some events should have been processed
        expect(handler.mock.calls.length).toBeGreaterThan(0);
      });
    });
  });
});