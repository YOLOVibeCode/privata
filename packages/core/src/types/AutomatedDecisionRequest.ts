/**
 * Automated Decision Request Type Definition
 *
 * Represents automated decision making requests as defined in GDPR Article 22
 */

export interface AutomatedDecisionRequest {
  dataSubjectId: string;
  decisionType: DecisionType;
  requestType: RequestType;
  reason?: string;
  verificationMethod: 'email-confirmation' | 'phone-verification' | 'document-verification' | 'in-person';
  decisionId?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  requestedAt?: Date;
  metadata?: Record<string, any>;
}

export type DecisionType =
  | 'credit-scoring'
  | 'employment-screening'
  | 'insurance-pricing'
  | 'marketing-profiling'
  | 'fraud-detection'
  | 'risk-assessment'
  | 'loan-approval'
  | 'recruitment-screening'
  | 'performance-evaluation'
  | 'behavioral-analysis';

export type RequestType =
  | 'information'
  | 'objection'
  | 'human-intervention'
  | 'express-viewpoint'
  | 'appeal'
  | 'review';

export interface AutomatedDecisionResult {
  success: boolean;
  decisionId?: string;
  processedAt?: Date;
  responseTime?: number; // in milliseconds
  decisionType?: string;
  requestType?: string;
  verificationCompleted?: boolean;
  verificationMethod?: string;
  verificationTimestamp?: Date;
  legalEffects?: boolean;
  significantEffects?: boolean;
  decisionDetails?: DecisionDetails;
  algorithmUsed?: string;
  dataCategories?: string[];
  decisionLogic?: string;
  algorithmDescription?: string;
  decisionSteps?: string[];
  thresholds?: Record<string, number>;
  consequences?: string[];
  significance?: string;
  envisagedEffects?: string[];
  impactAssessment?: string;
  dataSources?: string[];
  dataRetention?: string;
  dataAccuracy?: string;
  criteriaUsed?: string[];
  assessmentFactors?: string[];
  riskFactors?: string[];
  pricingModel?: string;
  profilingInvolved?: boolean;
  profileCategories?: string[];
  behavioralData?: string[];
  importanceWeights?: Record<string, number>;
  objectionProcessed?: boolean;
  humanReviewRequested?: boolean;
  reviewDeadline?: Date;
  objectionStatus?: string;
  reviewProcess?: string;
  reviewerAssignment?: string;
  viewpointRecorded?: boolean;
  viewpointDeadline?: Date;
  viewpointProcess?: string;
  viewpointConsideration?: string;
  rightsInformation?: string;
  objectionRights?: string;
  interventionRights?: string;
  viewpointRights?: string;
  appealProcess?: string;
  reviewTimeline?: string;
  reviewCriteria?: string;
  appealRights?: string;
  appealDeadline?: Date;
  appealCriteria?: string;
  supervisoryAuthority?: string;
  complaintRights?: string;
  complaintProcess?: string;
  complaintDeadline?: Date;
  monitoringEnabled?: boolean;
  complianceChecks?: ComplianceChecks;
  complexRequest?: boolean;
  errors?: string[];
  processDescription?: string;
  timeline?: string;
  nextSteps?: string;
  contactInformation?: string;
  auditTrail?: AutomatedDecisionAuditEntry[];
  confirmationProvided?: boolean;
}

export interface DecisionDetails {
  decision: string;
  score?: number;
  confidence?: number;
  factors: string[];
  reasoning: string;
  alternatives: string[];
  impact: string;
  timeline: string;
}

export interface ComplianceChecks {
  frequency: string;
  alertsEnabled: boolean;
  escalationThreshold: number;
  reportingRequired: boolean;
  lastCheckDate?: Date;
}

export interface AutomatedDecisionStatus {
  decisionActive: boolean;
  decisionId?: string;
  complianceStatus: 'compliant' | 'non-compliant' | 'pending-review';
  lastComplianceCheck?: Date;
  violations: AutomatedDecisionViolation[];
  nextReviewDate?: Date;
}

export interface AutomatedDecisionViolation {
  violationId: string;
  violationType: string;
  description: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolutionDate?: Date;
}

export interface AutomatedDecisionAppealRequest {
  decisionId: string;
  reason: string;
  evidence: string;
  verificationMethod: 'email-confirmation' | 'phone-verification' | 'document-verification' | 'in-person';
  requestedAt?: Date;
}

export interface AutomatedDecisionAppealResult {
  success: boolean;
  appealId?: string;
  processedAt?: Date;
  verificationCompleted?: boolean;
  verificationMethod?: string;
  verificationTimestamp?: Date;
  reviewProcess?: string;
  reviewDeadline?: Date;
  appealStatus?: string;
  auditTrail?: AutomatedDecisionAuditEntry[];
  errors?: string[];
}

export interface AutomatedDecisionAuditEntry {
  decisionCategory: string;
  decisionMethod: string;
  decisionTimestamp: Date;
  verificationStatus: 'verified' | 'pending' | 'failed';
  systemUpdated: string[];
  decisionType: string;
  requestType: string;
  complianceStatus: boolean;
  legalEffects: boolean;
  significantEffects: boolean;
}

export interface HumanReviewRequest {
  decisionId: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  requestedBy: string;
  requestedAt: Date;
  deadline?: Date;
  reviewerAssignment?: string;
  reviewStatus?: 'pending' | 'in-progress' | 'completed' | 'rejected';
}

export interface HumanReviewResult {
  reviewId: string;
  decisionId: string;
  reviewerId: string;
  reviewTimestamp: Date;
  reviewDecision: 'uphold' | 'overturn' | 'modify';
  reviewReasoning: string;
  newDecision?: string;
  confidence: number;
  auditTrail: AutomatedDecisionAuditEntry[];
}

export interface ViewpointExpression {
  decisionId: string;
  dataSubjectId: string;
  viewpoint: string;
  evidence?: string;
  urgency: 'low' | 'medium' | 'high';
  expressedAt: Date;
  deadline?: Date;
  considerationStatus?: 'pending' | 'considered' | 'rejected';
  considerationReason?: string;
}

export interface ViewpointResult {
  viewpointId: string;
  decisionId: string;
  recordedAt: Date;
  considerationDeadline: Date;
  considerationProcess: string;
  considerationStatus: string;
  auditTrail: AutomatedDecisionAuditEntry[];
}

export interface AutomatedDecisionOptions {
  simulateHumanReview?: boolean;
  forceNotification?: boolean;
  skipValidation?: boolean;
  customProcessor?: string;
  dryRun?: boolean;
  monitoringLevel?: 'basic' | 'enhanced' | 'strict';
  reviewUrgency?: 'low' | 'medium' | 'high' | 'critical';
}

export interface AutomatedDecisionHistory {
  decisionId: string;
  dataSubjectId: string;
  decisionType: string;
  requestType: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'rejected';
  decisionDetails: string;
  humanReviewRequired?: boolean;
  humanReviewCompleted?: boolean;
  appealRequested?: boolean;
  appealStatus?: string;
}

export interface AutomatedDecisionVerification {
  decisionId: string;
  verificationMethod: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  verificationTimestamp: Date;
  verificationDetails: string;
  nextVerificationDate?: Date;
}

export interface AlgorithmTransparency {
  algorithmName: string;
  algorithmVersion: string;
  algorithmDescription: string;
  dataCategories: string[];
  decisionFactors: string[];
  weights: Record<string, number>;
  thresholds: Record<string, number>;
  accuracy: number;
  biasAssessment: string;
  fairnessMetrics: string[];
  lastUpdated: Date;
}

export interface DecisionImpactAssessment {
  decisionId: string;
  impactType: 'legal' | 'significant' | 'minor';
  impactDescription: string;
  affectedRights: string[];
  mitigationMeasures: string[];
  reviewRequired: boolean;
  reviewDeadline?: Date;
  assessmentDate: Date;
}

export interface AutomatedDecisionCompliance {
  gdprCompliant: boolean;
  transparencyCompliant: boolean;
  objectionHandlingCompliant: boolean;
  humanInterventionCompliant: boolean;
  auditCompliant: boolean;
  complianceScore: number;
  complianceIssues: string[];
  recommendations: string[];
}
