import { Privata } from '@privata/core';
import { ODataServiceConfig, ODataEntitySet } from './ODataService';

export interface ParsedQuery {
  filters?: Array<{
    field: string;
    operator: string;
    value: any;
    dataType?: 'pii' | 'phi' | 'metadata';
  }>;
  sorts?: Array<{
    field: string;
    direction: 'asc' | 'desc';
    dataType?: 'pii' | 'phi' | 'metadata';
  }>;
  pagination?: {
    page: number;
    limit: number;
  };
  select?: string[];
  expand?: string[];
  search?: string;
}

export class ODataComplianceFilter {
  private privata: Privata;
  private config: ODataServiceConfig;

  constructor(privata: Privata, config: ODataServiceConfig) {
    this.privata = privata;
    this.config = config;
  }

  async applyFilters(
    entitySet: ODataEntitySet,
    parsedQuery: ParsedQuery,
    userContext?: any
  ): Promise<ParsedQuery> {
    const complianceQuery: ParsedQuery = { ...parsedQuery };

    // Apply GDPR compliance filters
    if (this.config.compliance.gdpr) {
      await this.applyGDPRFilters(entitySet, complianceQuery, userContext);
    }

    // Apply HIPAA compliance filters
    if (this.config.compliance.hipaa) {
      await this.applyHIPAAFilters(entitySet, complianceQuery, userContext);
    }

    // Apply data protection filters
    if (this.config.compliance.dataProtection) {
      await this.applyDataProtectionFilters(entitySet, complianceQuery, userContext);
    }

    return complianceQuery;
  }

  async validateData(
    entitySet: ODataEntitySet,
    data: any,
    userContext?: any
  ): Promise<any> {
    let validatedData = { ...data };

    // Apply GDPR data validation
    if (this.config.compliance.gdpr) {
      validatedData = await this.validateGDPRData(entitySet, validatedData, userContext);
    }

    // Apply HIPAA data validation
    if (this.config.compliance.hipaa) {
      validatedData = await this.validateHIPAAData(entitySet, validatedData, userContext);
    }

    // Apply data protection validation
    if (this.config.compliance.dataProtection) {
      validatedData = await this.validateDataProtection(entitySet, validatedData, userContext);
    }

    return validatedData;
  }

  private async applyGDPRFilters(
    entitySet: ODataEntitySet,
    query: ParsedQuery,
    userContext?: any
  ): Promise<void> {
    // Check if user has consent for PII access
    if (entitySet.compliance.pii) {
      const hasConsent = await this.privata.checkConsent(userContext?.userId || '', 'odata-access');

      if (!hasConsent) {
        // Remove PII fields from select
        if (query.select) {
          query.select = query.select.filter(field => !this.isPIIField(field));
        }

        // Add filters to exclude PII data
        if (query.filters) {
          query.filters.push({
            field: 'piiAccess',
            operator: 'eq',
            value: false,
            dataType: 'metadata'
          });
        }
      }
    }

    // Apply data minimization
    if (query.select && query.select.length > 0) {
      query.select = await this.minimizeDataFields(entitySet, query.select, userContext);
    }

    // Apply purpose limitation
    await this.applyPurposeLimitation(entitySet, query, userContext);
  }

  private async applyHIPAAFilters(
    entitySet: ODataEntitySet,
    query: ParsedQuery,
    userContext?: any
  ): Promise<void> {
    // Check if user has authorization for PHI access
    if (entitySet.compliance.phi) {
      const hasAuthorization = await this.privata.checkPHIAccess(userContext?.userId, {
        purpose: 'odata-access',
        authorization: 'patient'
      });

      if (!hasAuthorization) {
        // Remove PHI fields from select
        if (query.select) {
          query.select = query.select.filter(field => !this.isPHIField(field));
        }

        // Add filters to exclude PHI data
        if (query.filters) {
          query.filters.push({
            field: 'phiAccess',
            operator: 'eq',
            value: false,
            dataType: 'metadata'
          });
        }
      }
    }

    // Apply minimum necessary standard
    await this.applyMinimumNecessary(entitySet, query, userContext);
  }

  private async applyDataProtectionFilters(
    entitySet: ODataEntitySet,
    query: ParsedQuery,
    userContext?: any
  ): Promise<void> {
    // Apply encryption for sensitive fields
    if (query.select) {
      query.select = await this.encryptSensitiveFields(entitySet, query.select, userContext);
    }

    // Apply pseudonymization for PII fields
    if (query.select) {
      query.select = await this.pseudonymizePIIFields(entitySet, query.select, userContext);
    }

    // Apply data retention filters
    await this.applyDataRetention(entitySet, query, userContext);
  }

  private async validateGDPRData(
    entitySet: ODataEntitySet,
    data: any,
    userContext?: any
  ): Promise<any> {
    const validatedData = { ...data };

    // Validate consent for PII processing
    if (entitySet.compliance.pii) {
      const hasConsent = await this.privata.checkConsent(userContext?.userId || '', 'odata-create');

      if (!hasConsent) {
        // Remove PII fields
        for (const field of Object.keys(validatedData)) {
          if (this.isPIIField(field)) {
            delete validatedData[field];
          }
        }
      }
    }

    // Apply data minimization
    return await this.minimizeDataFields(entitySet, validatedData, userContext);
  }

  private async validateHIPAAData(
    entitySet: ODataEntitySet,
    data: any,
    userContext?: any
  ): Promise<any> {
    const validatedData = { ...data };

    // Validate authorization for PHI processing
    if (entitySet.compliance.phi) {
      const hasAuthorization = await this.privata.checkPHIAccess(userContext?.userId, {
        purpose: 'odata-create',
        authorization: 'patient'
      });

      if (!hasAuthorization) {
        // Remove PHI fields
        for (const field of Object.keys(validatedData)) {
          if (this.isPHIField(field)) {
            delete validatedData[field];
          }
        }
      }
    }

    // Apply minimum necessary standard
    return await this.applyMinimumNecessaryFields(entitySet, validatedData, userContext);
  }

  private async validateDataProtection(
    entitySet: ODataEntitySet,
    data: any,
    userContext?: any
  ): Promise<any> {
    let validatedData = { ...data };

    // Encrypt sensitive fields
    validatedData = await this.encryptSensitiveFields(entitySet, validatedData, userContext);

    // Pseudonymize PII fields
    validatedData = await this.pseudonymizePIIFields(entitySet, validatedData, userContext);

    return validatedData;
  }

  private isPIIField(field: string): boolean {
    const piiFields = [
      'firstName', 'lastName', 'email', 'phone', 'address',
      'ssn', 'dateOfBirth', 'gender', 'nationality'
    ];
    return piiFields.includes(field);
  }

  private isPHIField(field: string): boolean {
    const phiFields = [
      'medicalRecordNumber', 'diagnoses', 'treatments', 'medications',
      'allergies', 'vitalSigns', 'labResults', 'imagingResults'
    ];
    return phiFields.includes(field);
  }

  private async minimizeDataFields(
    entitySet: ODataEntitySet,
    fields: string[],
    userContext?: any
  ): Promise<string[]> {
    // Get user's data minimization preferences
    const preferences = await this.privata.getDataMinimizationPreferences(userContext?.userId);
    
    if (preferences && preferences.purpose) {
      // Filter fields based on purpose
      return fields.filter(field => {
        const fieldPurpose = this.getFieldPurpose(field);
        return fieldPurpose === preferences.purpose || fieldPurpose === 'essential';
      });
    }

    return fields;
  }

  private async applyPurposeLimitation(
    entitySet: ODataEntitySet,
    query: ParsedQuery,
    userContext?: any
  ): Promise<void> {
    // Get user's purpose preferences
    const preferences = await this.privata.getPurposePreferences(userContext?.userId);
    
    if (preferences && preferences.purpose) {
      // Add purpose filter
      if (query.filters) {
        query.filters.push({
          field: 'purpose',
          operator: 'eq',
          value: preferences.purpose,
          dataType: 'metadata'
        });
      }
    }
  }

  private async applyMinimumNecessary(
    entitySet: ODataEntitySet,
    query: ParsedQuery,
    userContext?: any
  ): Promise<void> {
    // Get user's minimum necessary preferences
    const preferences = await this.privata.getMinimumNecessaryPreferences(userContext?.userId);
    
    if (preferences && preferences.fields) {
      // Limit select fields to minimum necessary
      if (query.select) {
        query.select = query.select.filter(field => preferences.fields.includes(field));
      }
    }
  }

  private async encryptSensitiveFields(
    entitySet: ODataEntitySet,
    data: any,
    userContext?: any
  ): Promise<any> {
    const encryptedData = { ...data };

    for (const field of Object.keys(encryptedData)) {
      if (this.isSensitiveField(field)) {
        encryptedData[field] = await this.privata.encryptField(encryptedData[field], field);
      }
    }

    return encryptedData;
  }

  private async pseudonymizePIIFields(
    entitySet: ODataEntitySet,
    data: any,
    userContext?: any
  ): Promise<any> {
    const pseudonymizedData = { ...data };

    for (const field of Object.keys(pseudonymizedData)) {
      if (this.isPIIField(field)) {
        pseudonymizedData[field] = await this.privata.pseudonymizeField(pseudonymizedData[field], field);
      }
    }

    return pseudonymizedData;
  }

  private async applyDataRetention(
    entitySet: ODataEntitySet,
    query: ParsedQuery,
    userContext?: any
  ): Promise<void> {
    // Get data retention policy
    const retentionPolicy = await this.privata.getDataRetentionPolicy(entitySet.model);
    
    if (retentionPolicy && retentionPolicy.retentionPeriod) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionPolicy.retentionPeriod);

      // Add retention filter
      if (query.filters) {
        query.filters.push({
          field: 'createdAt',
          operator: 'gte',
          value: cutoffDate,
          dataType: 'metadata'
        });
      }
    }
  }

  private async applyMinimumNecessaryFields(
    entitySet: ODataEntitySet,
    data: any,
    userContext?: any
  ): Promise<any> {
    const minimizedData = { ...data };

    // Get minimum necessary fields for this entity set
    const necessaryFields = await this.privata.getMinimumNecessaryFields(entitySet.model);
    
    if (necessaryFields && necessaryFields.length > 0) {
      // Keep only necessary fields
      for (const field of Object.keys(minimizedData)) {
        if (!necessaryFields.includes(field)) {
          delete minimizedData[field];
        }
      }
    }

    return minimizedData;
  }

  private isSensitiveField(field: string): boolean {
    const sensitiveFields = [
      'ssn', 'creditCard', 'bankAccount', 'password', 'secret'
    ];
    return sensitiveFields.includes(field);
  }

  private getFieldPurpose(field: string): string {
    // This would be determined by the field's metadata
    // For now, we'll use a simple mapping
    const purposeMap: Record<string, string> = {
      'firstName': 'identification',
      'lastName': 'identification',
      'email': 'communication',
      'phone': 'communication',
      'address': 'location',
      'medicalRecordNumber': 'medical',
      'diagnoses': 'medical',
      'treatments': 'medical'
    };

    return purposeMap[field] || 'essential';
  }
}

