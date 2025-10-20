/**
 * Personal Data Type Definition
 *
 * Represents personal data as defined in GDPR Article 4(1)
 */

export interface PersonalData {
  id: string;
  dataSubjectId: string;
  category: string;
  fields: Record<string, any>;
  source: DataSource;
  lastUpdated: Date;
  accuracy: 'verified' | 'unverified' | 'disputed';
  retentionPeriod?: number; // in days
  legalBasis?: string;
  processingPurpose?: string;
}

export interface DataSource {
  type: 'user-input' | 'system-generated' | 'third-party' | 'derived';
  timestamp: Date;
  method: string;
  metadata?: Record<string, any>;
}

export interface ProcessingPurpose {
  name: string;
  description: string;
  legalBasis: string;
  retentionPeriod: number;
  dataCategories: string[];
  thirdPartyRecipients?: ThirdPartyRecipient[];
}

export interface ThirdPartyRecipient {
  name: string;
  purpose: string;
  safeguards: string[];
  dataCategories: string[];
  transferMechanism?: string;
}

export interface RetentionPeriod {
  dataCategory: string;
  period: number; // in days
  criteria: string;
  legalBasis: string;
  autoDelete: boolean;
}

export interface ErasureCriteria {
  dataCategory: string;
  criteria: string;
  conditions: string[];
  exceptions?: string[];
}
