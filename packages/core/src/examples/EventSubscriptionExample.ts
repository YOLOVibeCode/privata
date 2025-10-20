/**
 * @fileoverview Example of painless event subscription in Privata
 * @description Simple, clean Node.js event subscription with zero performance impact when unused
 */

import {
  subscribeToEvent,
  unsubscribeFromEvent,
  emitEvent,
  createDataCreatedEvent,
  createDataUpdatedEvent,
  createDataDeletedEvent,
  createSystemErrorEvent,
  getEventService,
} from '../services/EventSubscriptionService';

/**
 * Example: Basic event subscription
 */
function basicEventSubscriptionExample(): void {
  console.log('=== Basic Event Subscription Example ===');

  // Subscribe to data creation events
  const subscriptionId = subscribeToEvent('data.created', (event) => {
    console.log('📝 Data created:', {
      model: event.payload.modelName,
      id: event.payload.recordId,
      region: event.payload.region,
      containsPII: event.payload.containsPII,
    });
  });

  // Emit a data creation event
  emitEvent(createDataCreatedEvent(
    'User',
    'user_123',
    'UserService',
    {
      region: 'US',
      dataCategories: ['identity', 'contact'],
      containsPII: true,
      containsPHI: false,
    }
  ));

  // Unsubscribe when done
  unsubscribeFromEvent(subscriptionId);
}

/**
 * Example: Multiple event subscriptions
 */
function multipleEventSubscriptionsExample(): void {
  console.log('\n=== Multiple Event Subscriptions Example ===');

  const subscriptions: string[] = [];

  // Subscribe to multiple event types
  subscriptions.push(subscribeToEvent('data.created', (event) => {
    console.log('✅ Created:', event.payload.modelName);
  }));

  subscriptions.push(subscribeToEvent('data.updated', (event) => {
    console.log('🔄 Updated:', event.payload.modelName);
  }));

  subscriptions.push(subscribeToEvent('data.deleted', (event) => {
    console.log('🗑️ Deleted:', event.payload.modelName);
  }));

  // Emit different types of events
  emitEvent(createDataCreatedEvent('User', 'user_456', 'UserService'));
  emitEvent(createDataUpdatedEvent('User', 'user_456', 'UserService', {
    updatedFields: ['email', 'lastLogin'],
  }));
  emitEvent(createDataDeletedEvent('User', 'user_456', 'UserService', {
    deletionReason: 'user_request',
  }));

  // Clean up all subscriptions
  subscriptions.forEach(id => unsubscribeFromEvent(id));
}

/**
 * Example: Event filtering
 */
function eventFilteringExample(): void {
  console.log('\n=== Event Filtering Example ===');

  // Subscribe with a filter - only show events for User model
  const subscriptionId = subscribeToEvent('data.created', (event) => {
    console.log('👤 User created:', event.payload.recordId);
  }, {
    filter: (event) => {
      if (event.eventType === 'data.created') {
        return event.payload.modelName === 'User';
      }
      return false;
    },
  });

  // Emit events for different models
  emitEvent(createDataCreatedEvent('User', 'user_789', 'UserService'));
  emitEvent(createDataCreatedEvent('Product', 'product_123', 'ProductService'));
  emitEvent(createDataCreatedEvent('Order', 'order_456', 'OrderService'));

  // Only the User event will be processed due to the filter
  unsubscribeFromEvent(subscriptionId);
}

/**
 * Example: Error handling
 */
function errorHandlingExample(): void {
  console.log('\n=== Error Handling Example ===');

  const subscriptionId = subscribeToEvent('system.error', (event) => {
    console.log('🚨 System error:', {
      code: event.payload.errorCode,
      message: event.payload.errorMessage,
      component: event.payload.component,
      severity: event.payload.severity,
    });
  });

  // Emit a system error
  emitEvent(createSystemErrorEvent(
    'AUTH_FAILED',
    'Authentication failed for user',
    'AuthService',
    {
      component: 'AuthService',
      severity: 'high',
    }
  ));

  unsubscribeFromEvent(subscriptionId);
}

/**
 * Example: Performance monitoring
 */
function performanceMonitoringExample(): void {
  console.log('\n=== Performance Monitoring Example ===');

  const eventService = getEventService();
  
  console.log('Active subscriptions:', eventService.getActiveSubscriptionsCount());
  console.log('Has subscribers:', eventService.hasSubscribers());

  // Subscribe to events
  const subscriptionId = subscribeToEvent('data.created', (event) => {
    console.log('📊 Performance event:', event.payload.modelName);
  });

  console.log('After subscription:');
  console.log('Active subscriptions:', eventService.getActiveSubscriptionsCount());
  console.log('Has subscribers:', eventService.hasSubscribers());

  // Emit event
  emitEvent(createDataCreatedEvent('Performance', 'perf_123', 'PerformanceService'));

  // Clean up
  unsubscribeFromEvent(subscriptionId);
  console.log('After cleanup:');
  console.log('Active subscriptions:', eventService.getActiveSubscriptionsCount());
  console.log('Has subscribers:', eventService.hasSubscribers());
}

/**
 * Example: Zero performance impact when no subscribers
 */
function zeroPerformanceImpactExample(): void {
  console.log('\n=== Zero Performance Impact Example ===');

  const eventService = getEventService();
  
  // No subscribers - should have zero performance impact
  console.log('Has subscribers:', eventService.hasSubscribers());
  
  // Emit events with no subscribers - should be very fast
  const startTime = Date.now();
  
  for (let i = 0; i < 1000; i++) {
    emitEvent(createDataCreatedEvent('Test', `test_${i}`, 'TestService'));
  }
  
  const endTime = Date.now();
  console.log(`Emitted 1000 events with no subscribers in ${endTime - startTime}ms`);
}

/**
 * Run all examples
 */
function runAllExamples(): void {
  console.log('🚀 Privata Event Subscription Examples\n');
  
  basicEventSubscriptionExample();
  multipleEventSubscriptionsExample();
  eventFilteringExample();
  errorHandlingExample();
  performanceMonitoringExample();
  zeroPerformanceImpactExample();
  
  console.log('\n✅ All examples completed!');
}

// Export for use in other files
export {
  basicEventSubscriptionExample,
  multipleEventSubscriptionsExample,
  eventFilteringExample,
  errorHandlingExample,
  performanceMonitoringExample,
  zeroPerformanceImpactExample,
  runAllExamples,
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}
