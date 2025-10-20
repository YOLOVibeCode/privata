/**
 * Access Request Type Definition
 *
 * Represents data subject access requests as defined in GDPR Article 15
 */

import { PersonalData, ProcessingPurpose, RetentionPeriod, ErasureCriteria, ThirdPartyRecipient } from './PersonalData';

export interface AccessRequest {
  id: string;
  dataSubjectId: string;
  requestedAt: Date;
  processedAt?: Date;
  responseTime?: number; // in milliseconds
  format: string;
  data: string;
  personalData: PersonalData[];
  processingPurposes: ProcessingPurpose[];
  legalBasis: LegalBasis[];
  retentionPeriods: RetentionPeriod[];
  erasureCriteria: ErasureCriteria[];
  thirdPartyRecipients: ThirdPartyRecipient[];
  safeguards: Safeguard[];
  dataSubjectRights: string[];
  complaintRights: ComplaintRights;
  complexRequest?: boolean | undefined;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface LegalBasis {
  purpose: string;
  basis: string;
  description: string;
  legitimateInterests?: string;
}

export interface Safeguard {
  type: string;
  description: string;
  implementation: string;
  effectiveness: string;
}

export interface ComplaintRights {
  supervisoryAuthority: {
    name: string;
    contactInformation: string;
  };
  contactInformation: string;
  procedure: string;
  timeline: string;
}

export interface AccessRequestOptions {
  format?: 'JSON' | 'CSV' | 'XML' | 'PDF';
  includeDerivedData?: boolean;
  includeThirdPartyData?: boolean;
  includeAuditTrail?: boolean;
  onProgress?: (progress: number) => void;
}

// Re-export types from PersonalData
export type { PersonalData, ProcessingPurpose, ThirdPartyRecipient, RetentionPeriod, ErasureCriteria } from './PersonalData';
