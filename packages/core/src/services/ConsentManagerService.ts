/**
 * ConsentManagerService - Service for managing user consent
 *
 * This service provides a high-level interface for consent management operations,
 * following the Single Responsibility Principle and using dependency injection.
 *
 * @example
 * ```typescript
 * const reader = new DatabaseReader();
 * const writer = new DatabaseWriter();
 * const auditLogger = new AuditLogger();
 * const service = new ConsentManagerService(reader, writer, auditLogger);
 *
 * await service.grant('user-123', 'data_processing', { purpose: 'analytics' });
 * const hasConsent = await service.check('user-123', 'data_processing');
 * ```
 */

import { IDatabaseReader } from '../interfaces/IDatabaseReader';
import { IDatabaseWriter } from '../interfaces/IDatabaseWriter';
import { IAuditLogger } from '../interfaces/IAuditLogger';
import { AuditEvent } from '../types/AuditEvent';

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  granted: boolean;
  details: any;
  grantedAt: Date | null;
  expiresAt: Date | null;
  withdrawnAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ConsentManagerService {
  /**
   * Creates a new ConsentManagerService instance
   *
   * @param reader - Database reader for querying consent records
   * @param writer - Database writer for creating/updating consent records
   * @param auditLogger - Audit logger for tracking consent operations
   */
  constructor(
    private readonly reader: IDatabaseReader,
    private readonly writer: IDatabaseWriter,
    private readonly auditLogger: IAuditLogger,
  ) {}

  /**
   * Grant consent for a specific purpose
   *
   * @param userId - The user ID
   * @param consentType - The type of consent (e.g., 'data_processing', 'marketing')
   * @param details - Additional details about the consent
   * @returns Promise resolving to void
   *
   * @example
   * ```typescript
   * await service.grant('user-123', 'data_processing', {
   *   purpose: 'analytics',
   *   duration: '1 year'
   * });
   * ```
   */
  async grant(userId: string, consentType: string, details: any): Promise<void> {
    // Check for existing consent
    const existingConsents = await this.reader.findMany({
      userId,
      consentType,
      granted: true,
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year default

    if (existingConsents && existingConsents.length > 0) {
      // Update existing consent
      const existingConsent = existingConsents[0];
      await this.writer.update(existingConsent.id, {
        granted: true,
        grantedAt: now,
        expiresAt,
        details,
        updatedAt: now,
      });
    } else {
      // Create new consent
      await this.writer.create({
        userId,
        consentType,
        granted: true,
        details,
        grantedAt: now,
        expiresAt,
        withdrawnAt: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Log consent grant
    await this.auditLogger.log({
      id: `audit-${Date.now()}`,
      timestamp: now,
      action: 'CONSENT_GRANTED',
      entityType: 'Consent',
      entityId: (existingConsents && existingConsents.length > 0) ? existingConsents[0].id : 'new',
      userId,
      details: { consentType, details },
    });
  }

  /**
   * Check if user has valid consent for a specific purpose
   *
   * @param userId - The user ID
   * @param consentType - The type of consent to check
   * @returns Promise resolving to boolean indicating consent status
   *
   * @example
   * ```typescript
   * const hasConsent = await service.check('user-123', 'data_processing');
   * if (hasConsent) {
   *   // Process user data
   * }
   * ```
   */
  async check(userId: string, consentType: string): Promise<boolean> {
    const consents = await this.reader.findMany({
      userId,
      consentType,
      granted: true,
    }, {
      sort: { grantedAt: -1 },
    });

    if (!consents || consents.length === 0) {
      return false;
    }

    const latestConsent = consents[0];
    const now = new Date();

    // Check if consent is still valid (not expired and not withdrawn)
    return latestConsent.granted &&
           latestConsent.expiresAt &&
           latestConsent.expiresAt > now &&
           !latestConsent.withdrawnAt;
  }

  /**
   * Withdraw consent for a specific purpose
   *
   * @param userId - The user ID
   * @param consentType - The type of consent to withdraw
   * @returns Promise resolving to void
   *
   * @example
   * ```typescript
   * await service.withdraw('user-123', 'data_processing');
   * ```
   */
  async withdraw(userId: string, consentType: string): Promise<void> {
    const consents = await this.reader.findMany({
      userId,
      consentType,
      granted: true,
    });

    const now = new Date();

    if (consents && consents.length > 0) {
      // Update existing consent to withdrawn
      const consent = consents[0];
      await this.writer.update(consent.id, {
        granted: false,
        withdrawnAt: now,
        updatedAt: now,
      });

      // Log consent withdrawal
      await this.auditLogger.log({
        id: `audit-${Date.now()}`,
        timestamp: now,
        action: 'CONSENT_WITHDRAWN',
        entityType: 'Consent',
        entityId: consent.id,
        userId,
        details: { consentType },
      });
    } else {
      // Log attempted withdrawal of non-existent consent
      await this.auditLogger.log({
        id: `audit-${Date.now()}`,
        timestamp: now,
        action: 'CONSENT_WITHDRAWAL_ATTEMPTED',
        entityType: 'Consent',
        entityId: 'non-existent',
        userId,
        details: { consentType, found: false },
      });
    }
  }

  /**
   * Get consent history for a user
   *
   * @param userId - The user ID
   * @returns Promise resolving to array of consent records
   *
   * @example
   * ```typescript
   * const history = await service.getHistory('user-123');
   * console.log(`User has ${history.length} consent records`);
   * ```
   */
  async getHistory(userId: string): Promise<ConsentRecord[]> {
    return this.reader.findMany({
      userId,
    }, {
      sort: { grantedAt: -1 },
    });
  }
}
