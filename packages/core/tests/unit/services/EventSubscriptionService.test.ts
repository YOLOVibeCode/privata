/**
 * @fileoverview Unit tests for EventSubscriptionService
 * @description Tests the public API of the event subscription service
 */

import {
  subscribeToEvent,
  unsubscribeFromEvent,
  emitEvent,
  createDataCreatedEvent,
  createDataUpdatedEvent,
  createDataDeletedEvent,
  createSystemErrorEvent,
  createEventMetadata,
  clearAllEventSubscriptions,
} from '../../../src/services/EventSubscriptionService';

describe('EventSubscriptionService', () => {
  afterEach(() => {
    // Clear all subscriptions after each test to avoid interference
    clearAllEventSubscriptions();
  });

  describe('Basic Event Subscription', () => {
    it('should subscribe to events and receive them', (done) => {
      const testEvent = createDataCreatedEvent('User', 'user_123', 'TestService');
      
      subscribeToEvent('data.created', (event) => {
        expect(event.eventType).toBe('data.created');
        if (event.eventType === 'data.created') {
          expect(event.payload.modelName).toBe('User');
          expect(event.payload.recordId).toBe('user_123');
        }
        done();
      });

      emitEvent(testEvent);
    });

    it('should unsubscribe from events', (done) => {
      let callCount = 0;
      const handler = () => {
        callCount++;
      };
      
      const subscriptionId = subscribeToEvent('data.created', handler);
      
      emitEvent(createDataCreatedEvent('User', 'user_123', 'TestService'));
      
      setTimeout(() => {
        expect(callCount).toBe(1);
        
        unsubscribeFromEvent(subscriptionId);
        
        emitEvent(createDataCreatedEvent('User', 'user_456', 'TestService'));
        
        setTimeout(() => {
          expect(callCount).toBe(1); // Should still be 1, not called again
          done();
        }, 10);
      }, 10);
    });

    it('should handle multiple subscriptions to same event type', (done) => {
      let handler1Called = false;
      let handler2Called = false;
      
      subscribeToEvent('data.created', () => {
        handler1Called = true;
      });
      
      subscribeToEvent('data.created', () => {
        handler2Called = true;
        
        // Check after both handlers have had a chance to run
        setTimeout(() => {
          expect(handler1Called).toBe(true);
          expect(handler2Called).toBe(true);
          done();
        }, 10);
      });
      
      emitEvent(createDataCreatedEvent('User', 'user_123', 'TestService'));
    });
  });

  describe('Event Filtering', () => {
    it('should filter events based on custom filter function', (done) => {
      let callCount = 0;
      
      subscribeToEvent('data.created', () => {
        callCount++;
      }, {
        filter: (event) => {
          if (event.eventType === 'data.created') {
            return event.payload.modelName === 'User';
          }
          return false;
        },
      });
      
      emitEvent(createDataCreatedEvent('User', 'user_123', 'TestService'));
      emitEvent(createDataCreatedEvent('Product', 'product_456', 'TestService'));
      emitEvent(createDataCreatedEvent('User', 'user_789', 'TestService'));
      
      setTimeout(() => {
        expect(callCount).toBe(2); // Only User events
        done();
      }, 50);
    });
  });

  describe('Performance Optimization', () => {
    it('should have zero performance impact when no subscribers', () => {
      const startTime = Date.now();
      
      // Emit 1000 events with no subscribers
      for (let i = 0; i < 1000; i++) {
        emitEvent(createDataCreatedEvent('User', `user_${i}`, 'TestService'));
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should be very fast (less than 10ms for 1000 events)
      expect(duration).toBeLessThan(10);
    });

    it('should maintain performance with many subscribers', (done) => {
      let totalCalls = 0;
      const expectedCalls = 100 * 10; // 10 handlers * 100 events
      
      // Subscribe 10 handlers
      for (let i = 0; i < 10; i++) {
        subscribeToEvent('data.created', () => {
          totalCalls++;
        });
      }
      
      const startTime = Date.now();
      
      // Emit 100 events
      for (let i = 0; i < 100; i++) {
        emitEvent(createDataCreatedEvent('User', `user_${i}`, 'TestService'));
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should still be reasonably fast
      expect(duration).toBeLessThan(100);
      
      // Wait for all async handlers to complete
      setTimeout(() => {
        expect(totalCalls).toBe(expectedCalls);
        done();
      }, 100);
    });
  });

  describe('Event Creation Helpers', () => {
    it('should create data created events with correct structure', () => {
      const event = createDataCreatedEvent('User', 'user_123', 'TestService', {
        region: 'EU',
        containsPII: true,
        containsPHI: false,
      });
      
      expect(event.eventType).toBe('data.created');
      if (event.eventType === 'data.created') {
        expect(event.payload.modelName).toBe('User');
        expect(event.payload.recordId).toBe('user_123');
        expect(event.payload.region).toBe('EU');
        expect(event.payload.containsPII).toBe(true);
        expect(event.payload.containsPHI).toBe(false);
      }
      expect(event.source).toBe('TestService');
    });

    it('should create data updated events with correct structure', () => {
      const event = createDataUpdatedEvent('User', 'user_123', 'TestService', {
        updatedFields: ['email', 'name'],
        previousValues: { email: 'old@example.com' },
        newValues: { email: 'new@example.com' },
      });
      
      expect(event.eventType).toBe('data.updated');
      if (event.eventType === 'data.updated') {
        expect(event.payload.modelName).toBe('User');
        expect(event.payload.recordId).toBe('user_123');
        expect(event.payload.updatedFields).toEqual(['email', 'name']);
        expect(event.payload.previousValues).toEqual({ email: 'old@example.com' });
        expect(event.payload.newValues).toEqual({ email: 'new@example.com' });
      }
    });

    it('should create data deleted events with correct structure', () => {
      const event = createDataDeletedEvent('User', 'user_123', 'TestService', {
        deletionReason: 'gdpr_erasure',
        softDelete: true,
      });
      
      expect(event.eventType).toBe('data.deleted');
      if (event.eventType === 'data.deleted') {
        expect(event.payload.modelName).toBe('User');
        expect(event.payload.recordId).toBe('user_123');
        expect(event.payload.deletionReason).toBe('gdpr_erasure');
        expect(event.payload.softDelete).toBe(true);
      }
    });

    it('should create system error events with correct structure', () => {
      const event = createSystemErrorEvent('AUTH_FAILED', 'Authentication failed', 'AuthService', {
        severity: 'high',
        stackTrace: 'Error: Auth failed\n    at line 123',
      });
      
      expect(event.eventType).toBe('system.error');
      if (event.eventType === 'system.error') {
        expect(event.payload.errorCode).toBe('AUTH_FAILED');
        expect(event.payload.errorMessage).toBe('Authentication failed');
        expect(event.payload.component).toBe('AuthService');
        expect(event.payload.severity).toBe('high');
        expect(event.payload.stackTrace).toBe('Error: Auth failed\n    at line 123');
      }
    });
  });

  describe('Event Metadata', () => {
    it('should create event metadata with provided values', () => {
      const metadata = createEventMetadata({
        userId: 'user_123',
        sessionId: 'session_456',
        requestId: 'req_789',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        custom: { feature: 'beta' },
      });
      
      expect(metadata.userId).toBe('user_123');
      expect(metadata.sessionId).toBe('session_456');
      expect(metadata.requestId).toBe('req_789');
      expect(metadata.ipAddress).toBe('192.168.1.1');
      expect(metadata.userAgent).toBe('Mozilla/5.0');
      expect(metadata.custom).toEqual({ feature: 'beta' });
    });

    it('should create empty event metadata when no values provided', () => {
      const metadata = createEventMetadata();
      
      expect(metadata).toEqual({});
    });

    it('should create partial event metadata', () => {
      const metadata = createEventMetadata({
        userId: 'user_123',
        custom: { feature: 'beta' },
      });
      
      expect(metadata.userId).toBe('user_123');
      expect(metadata.custom).toEqual({ feature: 'beta' });
      expect(metadata.sessionId).toBeUndefined();
      expect(metadata.requestId).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in event handlers gracefully', (done) => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      subscribeToEvent('data.created', () => {
        throw new Error('Handler error');
      });
      
      // Should not throw
      expect(() => {
        emitEvent(createDataCreatedEvent('User', 'user_123', 'TestService'));
      }).not.toThrow();
      
      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
        done();
      }, 20);
    });

    it('should continue processing other handlers when one fails', (done) => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      let workingHandlerCalled = false;
      
      subscribeToEvent('data.created', () => {
        throw new Error('Handler error');
      });
      
      subscribeToEvent('data.created', () => {
        workingHandlerCalled = true;
      });
      
      emitEvent(createDataCreatedEvent('User', 'user_123', 'TestService'));
      
      setTimeout(() => {
        expect(workingHandlerCalled).toBe(true);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
        done();
      }, 20);
    });
  });

  describe('Event Type Coverage', () => {
    it('should handle all data operation events', (done) => {
      let createdCount = 0;
      let updatedCount = 0;
      let deletedCount = 0;
      
      subscribeToEvent('data.created', () => {
        createdCount++;
      });
      
      subscribeToEvent('data.updated', () => {
        updatedCount++;
      });
      
      subscribeToEvent('data.deleted', () => {
        deletedCount++;
      });
      
      emitEvent(createDataCreatedEvent('User', 'user_123', 'TestService'));
      emitEvent(createDataUpdatedEvent('User', 'user_123', 'TestService'));
      emitEvent(createDataDeletedEvent('User', 'user_123', 'TestService'));
      
      setTimeout(() => {
        expect(createdCount).toBe(1);
        expect(updatedCount).toBe(1);
        expect(deletedCount).toBe(1);
        done();
      }, 20);
    });

    it('should handle system error events', (done) => {
      let errorCount = 0;
      
      subscribeToEvent('system.error', () => {
        errorCount++;
      });
      
      emitEvent(createSystemErrorEvent('TEST_ERROR', 'Test error', 'TestService'));
      
      setTimeout(() => {
        expect(errorCount).toBe(1);
        done();
      }, 20);
    });
  });
});