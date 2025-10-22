export interface PrivataConfig {
    database?: any;
    cache?: any;
    audit?: any;
    compliance?: {
        gdpr?: boolean;
        hipaa?: boolean;
        dataProtection?: boolean;
    };
}
export interface UserContext {
    userId: string;
    region?: string;
    permissions?: string[];
    consent?: Record<string, boolean>;
}
export interface GDPRContext {
    purpose: string;
    legalBasis: string;
    consentRequired?: boolean;
}
export interface QueryOptions {
    includePII?: boolean;
    includePHI?: boolean;
    includeAuditLogs?: boolean;
    complianceMode?: 'strict' | 'relaxed' | 'disabled';
}
export interface QueryResult<T = any> {
    data: T[];
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare class Privata {
    private config;
    private models;
    constructor(config: PrivataConfig);
    private validateConfig;
    model(name: string, schema: any): any;
    queryWithCompliance(_model: string, _query: any, _options: QueryOptions): Promise<QueryResult>;
    aggregateWithCompliance(_model: string, _pipeline: any[], _query: any, _options: QueryOptions): Promise<any>;
    validatePIIAccess(_context: GDPRContext): Promise<void>;
    validatePHIAccess(_context: GDPRContext): Promise<void>;
    requestDataAccess(_userId: string, _context: UserContext): Promise<any>;
    rectifyPersonalData(_userId: string, _data: any, _context: UserContext): Promise<void>;
    erasePersonalData(_userId: string, _context: UserContext): Promise<void>;
    restrictProcessing(_userId: string, _context: UserContext): Promise<void>;
    requestDataPortability(_userId: string, _context: UserContext): Promise<any>;
    objectToProcessing(_userId: string, _context: UserContext): Promise<void>;
    requestAutomatedDecisionReview(_userId: string, _context: UserContext): Promise<any>;
    getAdministrativeSafeguards(): Promise<any>;
    getPhysicalSafeguards(): Promise<any>;
    getTechnicalSafeguards(): Promise<any>;
    requestPHIAccess(_userId: string, _context: UserContext): Promise<any>;
    reportBreach(_incident: any, _context: UserContext): Promise<void>;
    getAuditLogs(_userId: string, _context: UserContext): Promise<any[]>;
    encryptField(_field: string, _data: any): Promise<string>;
    pseudonymizeData(_data: any, _context: UserContext): Promise<any>;
    minimizeData(_data: any, _context: UserContext): Promise<any>;
    limitPurpose(_data: any, _purpose: string): Promise<any>;
    verifyDataIntegrity(_data: any, _context: UserContext): Promise<boolean>;
    updateConsent(_userId: string, _consent: any, _context: UserContext): Promise<void>;
    exportData(_userId: string, _format: string): Promise<any>;
    deleteData(_userId: string, _context: UserContext): Promise<void>;
    getPrivacySettings(_userId: string): Promise<any>;
    private validateAccess;
    private validateGDPRAccess;
    private validateHIPAAAccess;
    private queryDatabase;
    private executeGDPRRight;
    private getUserData;
    private deleteUserData;
    private updateUserData;
    private exportUserData;
}
export default Privata;
//# sourceMappingURL=index.d.ts.map