/**
 * @fileoverview Integration tests for the event system with GDPR/HIPAA workflows
 * @description Tests event system integration with compliance workflows and real-world scenarios
 */

import { Privata } from '../../src';
import {
  subscribeToEvent,
  unsubscribeFromEvent,
  emitEvent,
  createDataCreatedEvent,
  createDataUpdatedEvent,
  createDataDeletedEvent,
  createSystemErrorEvent,
} from '../../src';

describe('Event System Integration Tests', () => {
  let privata: Privata;
  let eventHandlers: Array<{ id: string; handler: jest.Mock }>;

  beforeEach(async () => {
    privata = new Privata({
      compliance: {
        gdpr: {
          enabled: true,
          dataSubjectRights: true,
          auditLogging: true,
        },
        hipaa: {
          enabled: true,
          phiProtection: true,
          breachNotification: true,
        },
      },
    });
    
    await privata.initialize();

    eventHandlers = [];
  });

  afterEach(() => {
    // Clean up all event subscriptions
    eventHandlers.forEach(({ id }) => {
      unsubscribeFromEvent(id);
    });
    eventHandlers = [];
  });

  const createEventHandler = (eventType: keyof import('../../src/types/EventTypes').EventTypeMap, handler: jest.Mock) => {
    const subscriptionId = subscribeToEvent(eventType, handler);
    eventHandlers.push({ id: subscriptionId, handler });
    return subscriptionId;
  };

  describe('GDPR Compliance Event Integration', () => {
    it('should emit events during GDPR access request workflow', async () => {
      const dataCreatedHandler = jest.fn();
      const dataUpdatedHandler = jest.fn();
      const gdprAccessHandler = jest.fn();

      createEventHandler('data.created', dataCreatedHandler);
      createEventHandler('data.updated', dataUpdatedHandler);
      createEventHandler('gdpr.access_request', gdprAccessHandler);

      // Simulate GDPR access request workflow
      const dataSubjectId = 'test-subject-123';
      
      // Create user data (should emit data.created)
      await privata.requestDataAccess(dataSubjectId, {
        format: 'JSON',
        includeDerivedData: true,
        includeThirdPartyData: true,
        includeAuditTrail: true,
      });

      // Verify events were emitted
      expect(dataCreatedHandler).toHaveBeenCalled();
      expect(gdprAccessHandler).toHaveBeenCalled();
    });

    it('should emit events during GDPR erasure workflow', async () => {
      const dataDeletedHandler = jest.fn();
      const gdprErasureHandler = jest.fn();

      createEventHandler('data.deleted', dataDeletedHandler);
      createEventHandler('gdpr.erasure_request', gdprErasureHandler);

      // Simulate GDPR erasure request workflow
      const dataSubjectId = 'test-subject-456';
      
      await privata.erasePersonalData({
        dataSubjectId,
        reason: 'withdrawal-of-consent',
        evidence: 'User requested data deletion',
        scope: 'specific-categories',
        dataCategories: ['marketing', 'analytics'],
        verificationMethod: 'email-confirmation',
      });

      // Verify events were emitted
      expect(dataDeletedHandler).toHaveBeenCalled();
      expect(gdprErasureHandler).toHaveBeenCalled();
    });

    it('should emit events during GDPR rectification workflow', async () => {
      const dataUpdatedHandler = jest.fn();
      const gdprRectificationHandler = jest.fn();

      createEventHandler('data.updated', dataUpdatedHandler);
      createEventHandler('data.updated', gdprRectificationHandler);

      // Simulate GDPR rectification request workflow
      const dataSubjectId = 'test-subject-789';
      
      await privata.rectifyPersonalData({
        dataSubjectId,
        corrections: {
          email: 'new@example.com',
          address: 'New Address',
        },
        reason: 'Incorrect information provided',
        evidence: 'User provided updated information',
      });

      // Verify events were emitted
      expect(dataUpdatedHandler).toHaveBeenCalled();
      expect(gdprRectificationHandler).toHaveBeenCalled();
    });
  });

  describe('HIPAA Compliance Event Integration', () => {
    it('should emit events during HIPAA PHI access workflow', async () => {
      const phiAccessHandler = jest.fn();
      const auditLogHandler = jest.fn();

      createEventHandler('hipaa.phi_access', phiAccessHandler);
      createEventHandler('audit.log_created', auditLogHandler);

      // Simulate HIPAA PHI access request workflow
      const patientId = 'test-patient-123';
      
      await privata.processPHIRequest({
        patientId,
        requestType: 'access',
        purpose: 'treatment',
        minimumNecessary: true,
        verificationMethod: 'identity-verification',
      });

      // Verify events were emitted
      expect(phiAccessHandler).toHaveBeenCalled();
      expect(auditLogHandler).toHaveBeenCalled();
    });

    it('should emit events during HIPAA PHI amendment workflow', async () => {
      const phiAmendmentHandler = jest.fn();
      const dataUpdatedHandler = jest.fn();

      createEventHandler('data.updated', phiAmendmentHandler);
      createEventHandler('data.updated', dataUpdatedHandler);

      // Simulate HIPAA PHI amendment request workflow
      const patientId = 'test-patient-456';
      
      await privata.processPHIRequest({
        patientId,
        requestType: 'amendment',
        purpose: 'treatment',
        minimumNecessary: true,
        verificationMethod: 'document-verification',
      });

      // Verify events were emitted
      expect(phiAmendmentHandler).toHaveBeenCalled();
      expect(dataUpdatedHandler).toHaveBeenCalled();
    });
  });

  describe('Cross-Compliance Event Integration', () => {
    it('should emit events for both GDPR and HIPAA workflows', async () => {
      const gdprHandler = jest.fn();
      const hipaaHandler = jest.fn();
      const dataCreatedHandler = jest.fn();
      const auditHandler = jest.fn();

      createEventHandler('gdpr.access_request', gdprHandler);
      createEventHandler('hipaa.phi_access', hipaaHandler);
      createEventHandler('data.created', dataCreatedHandler);
      createEventHandler('audit.log_created', auditHandler);

      // Simulate cross-compliance scenario
      const dataSubjectId = 'test-subject-hipaa-123';
      
      // GDPR access request
      await privata.requestDataAccess(dataSubjectId, {
        format: 'JSON',
        includeDerivedData: true,
        includeThirdPartyData: true,
        includeAuditTrail: true,
      });

      // HIPAA PHI access request
      await privata.processPHIRequest({
        patientId: dataSubjectId,
        requestType: 'access',
        purpose: 'treatment',
        minimumNecessary: true,
        verificationMethod: 'identity-verification',
      });

      // Verify all events were emitted
      expect(gdprHandler).toHaveBeenCalled();
      expect(hipaaHandler).toHaveBeenCalled();
      expect(dataCreatedHandler).toHaveBeenCalled();
      expect(auditHandler).toHaveBeenCalled();
    });
  });

  describe('System Error Event Integration', () => {
    it('should emit system error events when operations fail', async () => {
      const systemErrorHandler = jest.fn();
      const auditHandler = jest.fn();

      createEventHandler('system.error', systemErrorHandler);
      createEventHandler('audit.log_created', auditHandler);

      // Mock a failing operation - we'll test error handling through the public API

      // Attempt an operation that should fail
      try {
        await privata.requestDataAccess('test-subject-error', {
          format: 'JSON',
          includeDerivedData: true,
          includeThirdPartyData: true,
          includeAuditTrail: true,
        });
      } catch (error) {
        // Expected to fail
      }

      // Verify error events were emitted
      expect(systemErrorHandler).toHaveBeenCalled();
      expect(auditHandler).toHaveBeenCalled();
    });
  });

  describe('Performance Under Load', () => {
    it('should handle high-volume event emission efficiently', async () => {
      const dataCreatedHandler = jest.fn();
      const dataUpdatedHandler = jest.fn();
      const dataDeletedHandler = jest.fn();

      createEventHandler('data.created', dataCreatedHandler);
      createEventHandler('data.updated', dataUpdatedHandler);
      createEventHandler('data.deleted', dataDeletedHandler);

      const startTime = Date.now();
      const eventCount = 1000;

      // Emit events rapidly
      for (let i = 0; i < eventCount; i++) {
        emitEvent(createDataCreatedEvent('User', `user_${i}`, 'LoadTestService'));
        emitEvent(createDataUpdatedEvent('User', `user_${i}`, 'LoadTestService'));
        emitEvent(createDataDeletedEvent('User', `user_${i}`, 'LoadTestService'));
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000); // Less than 1 second for 3000 events

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify all events were processed
      expect(dataCreatedHandler).toHaveBeenCalledTimes(eventCount);
      expect(dataUpdatedHandler).toHaveBeenCalledTimes(eventCount);
      expect(dataDeletedHandler).toHaveBeenCalledTimes(eventCount);
    });
  });

  describe('Event Filtering Integration', () => {
    it('should filter events based on compliance requirements', async () => {
      const gdprOnlyHandler = jest.fn();
      const hipaaOnlyHandler = jest.fn();
      const allEventsHandler = jest.fn();

      // Subscribe with filters
      createEventHandler('gdpr.access_request', gdprOnlyHandler);
      createEventHandler('hipaa.phi_access', hipaaOnlyHandler);
      const subscriptionId = subscribeToEvent('data.created', allEventsHandler, {
        filter: (event: any) => event.payload.modelName === 'User',
      });
      eventHandlers.push({ id: subscriptionId, handler: allEventsHandler });

      // Simulate mixed workflow
      await privata.requestDataAccess('test-subject-filter', {
        format: 'JSON',
        includeDerivedData: true,
        includeThirdPartyData: true,
        includeAuditTrail: true,
      });

      await privata.processPHIRequest({
        patientId: 'test-patient-filter',
        requestType: 'access',
        purpose: 'treatment',
        minimumNecessary: true,
        verificationMethod: 'identity-verification',
      });

      // Verify filtered events
      expect(gdprOnlyHandler).toHaveBeenCalled();
      expect(hipaaOnlyHandler).toHaveBeenCalled();
      expect(allEventsHandler).toHaveBeenCalled();
    });
  });

  describe('Event Metadata Integration', () => {
    it('should include proper metadata in compliance events', async () => {
      const auditHandler = jest.fn();

      createEventHandler('audit.log_created', auditHandler);

      // Simulate GDPR access request with metadata
      await privata.requestDataAccess('test-subject-metadata', {
        format: 'JSON',
        includeDerivedData: true,
        includeThirdPartyData: true,
        includeAuditTrail: true,
      });

      // Verify metadata is included
      expect(auditHandler).toHaveBeenCalled();
      const auditEvent = auditHandler.mock.calls[0][0];
      expect(auditEvent.metadata).toBeDefined();
      expect(auditEvent.metadata?.requestId).toBe('req-metadata-123');
    });
  });

  describe('Event Cleanup Integration', () => {
    it('should properly clean up event subscriptions', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      const sub1 = createEventHandler('data.created', handler1);
      const sub2 = createEventHandler('data.updated', handler2);

      // Emit events
      emitEvent(createDataCreatedEvent('User', 'user_1', 'TestService'));
      emitEvent(createDataUpdatedEvent('User', 'user_1', 'TestService'));

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);

      // Unsubscribe one handler
      unsubscribeFromEvent(sub1);

      // Emit events again
      emitEvent(createDataCreatedEvent('User', 'user_2', 'TestService'));
      emitEvent(createDataUpdatedEvent('User', 'user_2', 'TestService'));

      // Only the remaining handler should be called
      expect(handler1).toHaveBeenCalledTimes(1); // No change
      expect(handler2).toHaveBeenCalledTimes(2); // Called again
    });
  });
});
