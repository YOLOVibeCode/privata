/**
 * PHI Request Type Definition
 *
 * Represents Protected Health Information (PHI) requests as defined in HIPAA
 */

export interface PHIRequest {
  patientId: string;
  requestType: PHIRequestType;
  purpose: PHIPurpose;
  minimumNecessary?: boolean;
  authorizationRequired?: boolean;
  verificationMethod: 'identity-verification' | 'document-verification' | 'biometric-verification' | 'multi-factor-verification';
  businessAssociate?: BusinessAssociate;
  amendmentDetails?: AmendmentDetails;
  restrictionDetails?: RestrictionDetails;
  communicationDetails?: CommunicationDetails;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  requestedAt?: Date;
  metadata?: Record<string, any>;
}

export type PHIRequestType =
  | 'access'
  | 'disclosure'
  | 'amendment'
  | 'restriction'
  | 'confidential-communication'
  | 'breach-notification'
  | 'complaint'
  | 'audit';

export type PHIPurpose =
  | 'treatment'
  | 'payment'
  | 'healthcare-operations'
  | 'patient-request'
  | 'marketing'
  | 'research'
  | 'business-associate'
  | 'legal-requirement'
  | 'public-health'
  | 'law-enforcement';

export interface PHIResult {
  success: boolean;
  requestId?: string;
  processedAt?: Date;
  responseTime?: number; // in milliseconds
  minimumNecessaryApplied?: boolean;
  dataMinimized?: boolean;
  accessLevel?: string;
  dataCategories?: string[];
  authorizationRequired?: boolean;
  authorizationValid?: boolean;
  authorizationDetails?: AuthorizationDetails;
  authorizationExpiry?: Date;
  businessAssociateAgreement?: BusinessAssociateAgreement;
  patientAccessGranted?: boolean;
  accessFormat?: string;
  accessTimeline?: string;
  accessFees?: string;
  accessDenialReasons?: string[];
  amendmentProcessed?: boolean;
  amendmentStatus?: string;
  amendmentTimeline?: string;
  amendmentNotification?: string;
  restrictionProcessed?: boolean;
  restrictionStatus?: string;
  restrictionScope?: string;
  restrictionEnforcement?: string;
  confidentialCommunicationProcessed?: boolean;
  communicationMethod?: string;
  communicationSecurity?: string;
  communicationEnforcement?: string;
  administrativeSafeguards?: AdministrativeSafeguards;
  physicalSafeguards?: PhysicalSafeguards;
  technicalSafeguards?: TechnicalSafeguards;
  encryptionApplied?: boolean;
  encryptionMethod?: string;
  encryptionStrength?: string;
  encryptionCompliance?: boolean;
  accessControls?: AccessControls;
  breachDetected?: boolean;
  riskAssessment?: string;
  breachClassification?: string;
  notificationRequired?: boolean;
  patientNotificationRequired?: boolean;
  patientNotificationTimeline?: string;
  patientNotificationMethod?: string;
  patientNotificationContent?: string;
  hhsNotificationRequired?: boolean;
  hhsNotificationTimeline?: string;
  hhsNotificationMethod?: string;
  hhsNotificationContent?: string;
  mediaNotificationRequired?: boolean;
  mediaNotificationTimeline?: string;
  mediaNotificationMethod?: string;
  mediaNotificationContent?: string;
  breachDocumentation?: BreachDocumentation;
  complianceStatus?: string;
  complianceScore?: number;
  complianceIssues?: string[];
  recommendations?: string[];
  nextReviewDate?: Date;
  violationReported?: boolean;
  reportingTimeline?: string;
  reportingMethod?: string;
  reportingContent?: string;
  correctiveActionPlan?: CorrectiveActionPlan;
  privacyNotice?: PrivacyNotice;
  complaintProcessed?: boolean;
  complaintNumber?: string;
  investigationTimeline?: string;
  responseTimeline?: string;
  dataIntegrity?: boolean;
  checksumValidation?: boolean;
  auditTrail?: any[];
  integrityViolations?: string[];
  backupCompleted?: boolean;
  backupLocation?: string;
  backupEncryption?: boolean;
  backupVerification?: boolean;
  transmissionSecured?: boolean;
  transmissionLog?: any[];
  recipientVerification?: boolean;
  monitoringActive?: boolean;
  complianceMetrics?: any;
  alertThresholds?: any;
  reportingFrequency?: string;
  reportGenerated?: boolean;
  reportContent?: string;
  reportFormat?: string;
  reportDelivery?: string;
  auditTrailGenerated?: boolean;
  auditEvents?: any[];
  auditCompliance?: boolean;
  auditRetention?: string;
  complexRequest?: boolean;
  errors?: string[];
  processDescription?: string;
  timeline?: string;
  nextSteps?: string;
  contactInformation?: string;
  confirmationProvided?: boolean;
}

export interface BusinessAssociate {
  name: string;
  agreementId: string;
  agreementDate: Date;
  agreementValid: boolean;
  contactInformation: string;
  servicesProvided: string[];
  safeguardsRequired: boolean;
  complianceObligations: string[];
}

export interface BusinessAssociateAgreement {
  agreementId: string;
  agreementValid: boolean;
  safeguardsRequired: boolean;
  complianceObligations: string[];
  breachNotificationRequired: boolean;
  auditRights: boolean;
  terminationClause: string;
  dataReturnDestruction: string;
}

export interface AmendmentDetails {
  field: string;
  currentValue: any;
  requestedValue: any;
  reason: string;
  supportingDocumentation?: string;
  urgency?: 'low' | 'medium' | 'high';
}

export interface RestrictionDetails {
  restrictedUses: string[];
  restrictedDisclosures: string[];
  reason: string;
  scope: 'all' | 'specific' | 'partial';
  duration?: string;
  reviewDate?: Date;
}

export interface CommunicationDetails {
  preferredMethod: string;
  alternativeAddress: string;
  reason: string;
  urgency?: 'low' | 'medium' | 'high';
  securityLevel?: 'standard' | 'enhanced' | 'maximum';
}

export interface AuthorizationDetails {
  authorizationId: string;
  authorizationType: string;
  authorizationDate: Date;
  authorizationExpiry: Date;
  authorizationScope: string;
  authorizationRevocable: boolean;
  authorizationWitnessed: boolean;
  authorizationDocumented: boolean;
}

export interface AdministrativeSafeguards {
  securityOfficer: string;
  workforceTraining: string;
  accessManagement: string;
  auditControls: string;
  securityIncidentProcedures: string;
  contingencyPlan: string;
  businessAssociateContracts: string;
  evaluation: string;
}

export interface PhysicalSafeguards {
  facilityAccess: string;
  workstationUse: string;
  deviceControls: string;
  mediaControls: string;
  disposal: string;
  reuse: string;
  accountability: string;
  dataBackup: string;
}

export interface TechnicalSafeguards {
  accessControl: string;
  auditControls: string;
  integrity: string;
  transmissionSecurity: string;
  encryption: string;
  decryption: string;
  automaticLogoff: string;
  uniqueUserIdentification: string;
}

export interface AccessControls {
  userAuthentication: string;
  roleBasedAccess: string;
  accessLogging: string;
  accessMonitoring: string;
  accessReview: string;
  accessTermination: string;
  emergencyAccess: string;
  remoteAccess: string;
}

export interface BreachDocumentation {
  incidentReport: string;
  investigationReport: string;
  remediationPlan: string;
  retentionPeriod: string;
  documentationDate: Date;
  responsibleParty: string;
  approvalRequired: boolean;
  approvalDate?: Date;
}

export interface CorrectiveActionPlan {
  actionItems: string[];
  timeline: string;
  responsibilities: string[];
  monitoring: string;
  completionCriteria: string;
  reviewDate: Date;
  approvalRequired: boolean;
  approvalDate?: Date;
}

export interface PrivacyNotice {
  content: string;
  effectiveDate: Date;
  acknowledgmentRequired: boolean;
  language: string;
  format: string;
  accessibility: string;
  updates: string;
  distribution: string;
}

export interface BreachEvent {
  patientId: string;
  breachType: string;
  breachDescription: string;
  breachDate: Date;
  affectedRecords: number;
  riskAssessment: string;
  discoveredBy: string;
  discoveryDate: Date;
  containmentDate?: Date;
  investigationStatus: string;
  notificationStatus: string;
}

export interface BreachResult {
  success: boolean;
  breachId?: string;
  processedAt?: Date;
  breachDetected?: boolean;
  riskAssessment?: string;
  breachClassification?: string;
  notificationRequired?: boolean;
  patientNotificationRequired?: boolean;
  patientNotificationTimeline?: string;
  patientNotificationMethod?: string;
  patientNotificationContent?: string;
  hhsNotificationRequired?: boolean;
  hhsNotificationTimeline?: string;
  hhsNotificationMethod?: string;
  hhsNotificationContent?: string;
  mediaNotificationRequired?: boolean;
  mediaNotificationTimeline?: string;
  mediaNotificationMethod?: string;
  mediaNotificationContent?: string;
  breachDocumentation?: BreachDocumentation;
  errors?: string[];
}

export interface HIPAAViolation {
  patientId: string;
  violationType: string;
  violationDescription: string;
  violationDate: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  discoveredBy: string;
  discoveryDate: Date;
  investigationStatus: string;
  remediationStatus: string;
}

export interface HIPAAViolationResult {
  success: boolean;
  violationId?: string;
  processedAt?: Date;
  violationReported?: boolean;
  reportingTimeline?: string;
  reportingMethod?: string;
  reportingContent?: string;
  correctiveActionPlan?: CorrectiveActionPlan;
  errors?: string[];
}

export interface ComplianceCheckResult {
  success: boolean;
  complianceStatus: string;
  complianceScore: number;
  complianceIssues: string[];
  recommendations: string[];
  nextReviewDate: Date;
  auditTrail: any[];
  violations: string[];
  improvements: string[];
}

export interface PHIOptions {
  simulateBreach?: boolean;
  forceNotification?: boolean;
  skipValidation?: boolean;
  customProcessor?: string;
  dryRun?: boolean;
  encryptionLevel?: 'basic' | 'enhanced' | 'high';
  auditLevel?: 'basic' | 'enhanced' | 'strict';
}

export interface PHIHistory {
  requestId: string;
  patientId: string;
  requestType: string;
  purpose: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'rejected';
  dataCategories: string[];
  accessLevel: string;
  authorizationRequired: boolean;
  authorizationValid: boolean;
}

export interface PHIVerification {
  requestId: string;
  verificationMethod: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  verificationTimestamp: Date;
  verificationDetails: string;
  nextVerificationDate?: Date;
}

export interface PHICompliance {
  hipaaCompliant: boolean;
  privacyRuleCompliant: boolean;
  securityRuleCompliant: boolean;
  breachNotificationCompliant: boolean;
  enforcementRuleCompliant: boolean;
  complianceScore: number;
  complianceIssues: string[];
  recommendations: string[];
}
