/**
 * Data Subject Type Definition
 *
 * Represents a data subject as defined in GDPR Article 4(1)
 */

export interface DataSubject {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  status?: 'active' | 'inactive' | 'deleted';
  metadata?: Record<string, any>;
}

export interface DataSubjectPreferences {
  dataSubjectId: string;
  language: string;
  timezone: string;
  notifications: boolean;
  marketing: boolean;
  analytics: boolean;
  updatedAt: Date;
}

export interface DataSubjectConsent {
  dataSubjectId: string;
  purpose: string;
  granted: boolean;
  grantedAt?: Date;
  withdrawnAt?: Date;
  legalBasis: 'consent' | 'contract' | 'legal-obligation' | 'vital-interests' | 'public-task' | 'legitimate-interests';
  evidence: string;
  version: string;
}
