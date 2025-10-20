/**
 * @fileoverview Event type definitions for Privata event system
 * @description Comprehensive event types with Node.js best practices and clean naming conventions
 */

// ============================================================================
// CORE EVENT TYPES
// ============================================================================

/**
 * Base event interface that all Privata events must extend
 * @template TPayload - The payload type for the specific event
 */
export interface BaseEvent<TPayload = unknown> {
  /** Unique event identifier */
  readonly eventId: string;
  /** Event type identifier */
  readonly eventType: string;
  /** Timestamp when event was created */
  readonly timestamp: Date;
  /** Event source identifier */
  readonly source: string;
  /** Event payload data */
  readonly payload: TPayload;
  /** Event metadata */
  readonly metadata: EventMetadata;
}

/**
 * Event metadata for additional context
 */
export interface EventMetadata {
  /** User ID who triggered the event */
  readonly userId?: string;
  /** Session ID */
  readonly sessionId?: string;
  /** Request ID for tracing */
  readonly requestId?: string;
  /** IP address */
  readonly ipAddress?: string;
  /** User agent */
  readonly userAgent?: string;
  /** Additional custom metadata */
  readonly custom?: Record<string, unknown>;
}

// ============================================================================
// DATA OPERATION EVENTS
// ============================================================================

/**
 * Data creation event payload
 */
export interface DataCreatedPayload {
  /** Model name that was created */
  readonly modelName: string;
  /** Created record ID */
  readonly recordId: string;
  /** Pseudonym if applicable */
  readonly pseudonym?: string;
  /** Region where data was stored */
  readonly region: string;
  /** Data categories affected */
  readonly dataCategories: string[];
  /** Whether PII was involved */
  readonly containsPII: boolean;
  /** Whether PHI was involved */
  readonly containsPHI: boolean;
}

/**
 * Data creation event
 */
export interface DataCreatedEvent extends BaseEvent<DataCreatedPayload> {
  readonly eventType: 'data.created';
}

/**
 * Data updated event payload
 */
export interface DataUpdatedPayload {
  /** Model name that was updated */
  readonly modelName: string;
  /** Updated record ID */
  readonly recordId: string;
  /** Pseudonym if applicable */
  readonly pseudonym?: string;
  /** Region where data was updated */
  readonly region: string;
  /** Fields that were updated */
  readonly updatedFields: string[];
  /** Previous values (if available) */
  readonly previousValues?: Record<string, unknown>;
  /** New values */
  readonly newValues: Record<string, unknown>;
  /** Data categories affected */
  readonly dataCategories: string[];
}

/**
 * Data updated event
 */
export interface DataUpdatedEvent extends BaseEvent<DataUpdatedPayload> {
  readonly eventType: 'data.updated';
}

/**
 * Data deleted event payload
 */
export interface DataDeletedPayload {
  /** Model name that was deleted */
  readonly modelName: string;
  /** Deleted record ID */
  readonly recordId: string;
  /** Pseudonym if applicable */
  readonly pseudonym?: string;
  /** Region where data was deleted */
  readonly region: string;
  /** Data categories affected */
  readonly dataCategories: string[];
  /** Deletion reason */
  readonly deletionReason: 'user_request' | 'gdpr_erasure' | 'system_cleanup' | 'other';
  /** Whether data was soft deleted */
  readonly softDelete: boolean;
}

/**
 * Data deleted event
 */
export interface DataDeletedEvent extends BaseEvent<DataDeletedPayload> {
  readonly eventType: 'data.deleted';
}

// ============================================================================
// GDPR COMPLIANCE EVENTS
// ============================================================================

/**
 * GDPR access request event payload
 */
export interface GDPRAccessRequestPayload {
  /** Data subject ID */
  readonly dataSubjectId: string;
  /** Request ID */
  readonly requestId: string;
  /** Request status */
  readonly status: 'initiated' | 'processing' | 'completed' | 'failed';
  /** Data categories requested */
  readonly requestedCategories: string[];
  /** Processing time in milliseconds */
  readonly processingTimeMs: number;
  /** Number of records returned */
  readonly recordsCount: number;
}

/**
 * GDPR access request event
 */
export interface GDPRAccessRequestEvent extends BaseEvent<GDPRAccessRequestPayload> {
  readonly eventType: 'gdpr.access_request';
}

/**
 * GDPR erasure request event payload
 */
export interface GDPRErasureRequestPayload {
  /** Data subject ID */
  readonly dataSubjectId: string;
  /** Request ID */
  readonly requestId: string;
  /** Request status */
  readonly status: 'initiated' | 'processing' | 'completed' | 'failed';
  /** Categories erased */
  readonly erasedCategories: string[];
  /** Categories retained */
  readonly retainedCategories: string[];
  /** Processing time in milliseconds */
  readonly processingTimeMs: number;
  /** Legal basis for retention */
  readonly legalBasisForRetention?: string;
}

/**
 * GDPR erasure request event
 */
export interface GDPRErasureRequestEvent extends BaseEvent<GDPRErasureRequestPayload> {
  readonly eventType: 'gdpr.erasure_request';
}

// ============================================================================
// HIPAA COMPLIANCE EVENTS
// ============================================================================

/**
 * HIPAA PHI access event payload
 */
export interface HIPAAPHIAccessPayload {
  /** Patient ID */
  readonly patientId: string;
  /** Request ID */
  readonly requestId: string;
  /** Access purpose */
  readonly purpose: 'treatment' | 'payment' | 'healthcare_operations' | 'other';
  /** Minimum necessary applied */
  readonly minimumNecessary: boolean;
  /** Data categories accessed */
  readonly accessedCategories: string[];
  /** Processing time in milliseconds */
  readonly processingTimeMs: number;
}

/**
 * HIPAA PHI access event
 */
export interface HIPAAPHIAccessEvent extends BaseEvent<HIPAAPHIAccessPayload> {
  readonly eventType: 'hipaa.phi_access';
}

// ============================================================================
// AUDIT EVENTS
// ============================================================================

/**
 * Audit log created event payload
 */
export interface AuditLogCreatedPayload {
  /** Audit log ID */
  readonly auditLogId: string;
  /** Event type that triggered the audit */
  readonly triggeredByEvent: string;
  /** Audit level */
  readonly auditLevel: 'info' | 'warning' | 'error' | 'critical';
  /** Audit message */
  readonly message: string;
  /** Additional audit data */
  readonly auditData: Record<string, unknown>;
}

/**
 * Audit log created event
 */
export interface AuditLogCreatedEvent extends BaseEvent<AuditLogCreatedPayload> {
  readonly eventType: 'audit.log_created';
}

// ============================================================================
// SYSTEM EVENTS
// ============================================================================

/**
 * System error event payload
 */
export interface SystemErrorPayload {
  /** Error code */
  readonly errorCode: string;
  /** Error message */
  readonly errorMessage: string;
  /** Error stack trace */
  readonly stackTrace?: string;
  /** Component where error occurred */
  readonly component: string;
  /** Error severity */
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  /** Whether error was recovered from */
  readonly recovered: boolean;
}

/**
 * System error event
 */
export interface SystemErrorEvent extends BaseEvent<SystemErrorPayload> {
  readonly eventType: 'system.error';
}

/**
 * Performance metric event payload
 */
export interface PerformanceMetricPayload {
  /** Metric name */
  readonly metricName: string;
  /** Metric value */
  readonly metricValue: number;
  /** Metric unit */
  readonly metricUnit: 'ms' | 'bytes' | 'count' | 'percentage';
  /** Component that generated the metric */
  readonly component: string;
  /** Additional metric tags */
  readonly tags: Record<string, string>;
}

/**
 * Performance metric event
 */
export interface PerformanceMetricEvent extends BaseEvent<PerformanceMetricPayload> {
  readonly eventType: 'system.performance_metric';
}

// ============================================================================
// UNION TYPES
// ============================================================================

/**
 * All possible Privata events
 */
export type PrivataEvent =
  | DataCreatedEvent
  | DataUpdatedEvent
  | DataDeletedEvent
  | GDPRAccessRequestEvent
  | GDPRErasureRequestEvent
  | HIPAAPHIAccessEvent
  | AuditLogCreatedEvent
  | SystemErrorEvent
  | PerformanceMetricEvent;

/**
 * Event type mapping for type-safe event handling
 */
export type EventTypeMap = {
  'data.created': DataCreatedEvent;
  'data.updated': DataUpdatedEvent;
  'data.deleted': DataDeletedEvent;
  'gdpr.access_request': GDPRAccessRequestEvent;
  'gdpr.erasure_request': GDPRErasureRequestEvent;
  'hipaa.phi_access': HIPAAPHIAccessEvent;
  'audit.log_created': AuditLogCreatedEvent;
  'system.error': SystemErrorEvent;
  'system.performance_metric': PerformanceMetricEvent;
};

/**
 * Event type names
 */
export type EventType = keyof EventTypeMap;

// ============================================================================
// EVENT SUBSCRIPTION TYPES
// ============================================================================

/**
 * Event subscription options
 */
export interface EventSubscriptionOptions {
  /** Whether to receive high-level events only */
  readonly highLevelOnly?: boolean;
  /** Whether to include detailed payload data */
  readonly includeDetails?: boolean;
  /** Event filter function */
  readonly filter?: (event: PrivataEvent) => boolean;
  /** Maximum number of events to buffer */
  readonly maxBufferSize?: number;
  /** Whether to buffer events when subscriber is not ready */
  readonly bufferWhenNotReady?: boolean;
}

/**
 * Event subscription handler
 * @template TEventType - The specific event type
 */
export type EventHandler<TEventType extends EventType = EventType> = (
  event: EventTypeMap[TEventType]
) => void | Promise<void>;

/**
 * Event subscription
 */
export interface EventSubscription {
  /** Subscription ID */
  readonly subscriptionId: string;
  /** Event type being subscribed to */
  readonly eventType: EventType;
  /** Subscription options */
  readonly options: EventSubscriptionOptions;
  /** Whether subscription is active */
  readonly isActive: boolean;
  /** When subscription was created */
  readonly createdAt: Date;
}

// ============================================================================
// EVENT EMITTER CONFIGURATION
// ============================================================================

/**
 * Event emitter configuration
 */
export interface EventEmitterConfig {
  /** Maximum number of concurrent event handlers */
  readonly maxConcurrentHandlers?: number;
  /** Event processing timeout in milliseconds */
  readonly processingTimeoutMs?: number;
  /** Whether to enable event buffering */
  readonly enableBuffering?: boolean;
  /** Buffer size for events */
  readonly bufferSize?: number;
  /** Whether to enable performance metrics */
  readonly enablePerformanceMetrics?: boolean;
  /** Whether to enable error recovery */
  readonly enableErrorRecovery?: boolean;
}
