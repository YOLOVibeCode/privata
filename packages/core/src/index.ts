/**
 * Privata Core Library
 * 
 * Transparent GDPR/HIPAA compliance library with automatic data separation
 * 
 * @packageDocumentation
 */

// Interfaces (ISP - Interface Segregation Principle)
export { IDatabaseReader } from './interfaces/IDatabaseReader';
export { IDatabaseWriter } from './interfaces/IDatabaseWriter';
export { IDatabaseTransaction } from './interfaces/IDatabaseTransaction';
export { ICacheReader } from './interfaces/ICacheReader';
export { ICacheWriter } from './interfaces/ICacheWriter';
export { IAuditLogger } from './interfaces/IAuditLogger';
export { IAuditQuery } from './interfaces/IAuditQuery';
export { IRegionDetector } from './interfaces/IRegionDetector';
export { IPseudonymGenerator } from './interfaces/IPseudonymGenerator';
export { IEncryptor } from './interfaces/IEncryptor';

// Services
export { PseudonymService } from './services/PseudonymService';
export { RegionDetectorService } from './services/RegionDetectorService';
export { DataSeparatorService } from './services/DataSeparatorService';
export { EncryptionService } from './services/EncryptionService';
export { ConsentManagerService } from './services/ConsentManagerService';
export { EventSubscriptionService } from './services/EventSubscriptionService';

// Types
export type { ReadOptions, Query } from './interfaces/IDatabaseReader';
export type { WriteOptions } from './interfaces/IDatabaseWriter';
export type { Transaction } from './interfaces/IDatabaseTransaction';
export type { CacheOptions } from './interfaces/ICacheReader';
export type { AuditEvent, AuditOptions } from './interfaces/IAuditLogger';
export type { AuditFilter, ExportFormat } from './interfaces/IAuditQuery';
export type { Region, RequestContext } from './interfaces/IRegionDetector';

// Service Types
export type { SeparationResult, SeparationSchema } from './services/DataSeparatorService';
export type { ConsentRecord } from './services/ConsentManagerService';

// Re-export everything for convenience
export * from './interfaces/IDatabaseReader';
export * from './interfaces/IDatabaseWriter';
export * from './interfaces/IDatabaseTransaction';
export * from './interfaces/ICacheReader';
export * from './interfaces/ICacheWriter';
export * from './interfaces/IAuditLogger';
export * from './interfaces/IAuditQuery';
export * from './interfaces/IRegionDetector';
export * from './interfaces/IPseudonymGenerator';
export * from './interfaces/IEncryptor';
export * from './services/PseudonymService';
export * from './services/RegionDetectorService';
export * from './services/DataSeparatorService';
export * from './services/EncryptionService';
export * from './services/ConsentManagerService';
export * from './services/EventSubscriptionService';

// Event System
export {
  subscribeToEvent,
  unsubscribeFromEvent,
  emitEvent,
  createDataCreatedEvent,
  createDataUpdatedEvent,
  createDataDeletedEvent,
  createSystemErrorEvent,
  getEventService,
  clearAllEventSubscriptions,
} from './services/EventSubscriptionService';

export * from './types/ReadOptions';
export * from './types/Query';
export * from './types/WriteOptions';
export * from './types/Transaction';
export * from './types/CacheOptions';
export * from './types/AuditEvent';
export * from './types/AuditOptions';
export * from './types/AuditFilter';
export * from './types/ExportFormat';
export * from './types/Region';
export * from './types/RequestContext';
export * from './types/DataSubject';
export * from './types/PersonalData';
export * from './types/AccessRequest';
export * from './types/EventTypes';

// Main Privata class
export * from './Privata';

// Models (NEW - CRUD with data separation)
export { ModelRegistry, Model } from './models/ModelRegistry';
export type { SchemaDefinition, FieldDefinition, ValidationResult } from './models/ModelRegistry';
export { PrivataModel } from './models/PrivataModel';
export type { DeleteOptions } from './models/PrivataModel';
