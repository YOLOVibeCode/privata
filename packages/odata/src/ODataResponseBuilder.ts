import { ODataServiceConfig, ODataResponse } from './ODataService';

export class ODataResponseBuilder {
  private config: ODataServiceConfig;

  constructor(config: ODataServiceConfig) {
    this.config = config;
  }

  buildResponse(
    entitySetName: string,
    data: any,
    queryOptions: Record<string, any> = {}
  ): ODataResponse {
    const response: ODataResponse = {
      '@odata.context': `${this.config.baseUrl}/$metadata#${entitySetName}`,
      value: this.formatEntities(data, queryOptions)
    };

    // Add count if requested
    if (queryOptions.$count === 'true' || queryOptions.$count === true) {
      response['@odata.count'] = data.length;
    }

    // Add next link if pagination is used
    if (queryOptions.$top && data.length === queryOptions.$top) {
      const skip = parseInt(queryOptions.$skip || '0');
      const nextSkip = skip + queryOptions.$top;
      response['@odata.nextLink'] = `${this.config.baseUrl}/${entitySetName}?$skip=${nextSkip}&$top=${queryOptions.$top}`;
    }

    return response;
  }

  private formatEntities(data: any, queryOptions: Record<string, any> = {}): any[] {
    if (!Array.isArray(data)) {
      return [this.formatEntity(data, queryOptions)];
    }

    return data.map(entity => this.formatEntity(entity, queryOptions));
  }

  private formatEntity(entity: any, queryOptions: Record<string, any> = {}): any {
    const formatted: any = {};

    // Apply field selection
    if (queryOptions.$select) {
      const selectFields = queryOptions.$select.split(',');
      for (const field of selectFields) {
        if (entity.hasOwnProperty(field)) {
          formatted[field] = this.formatFieldValue(entity[field], field);
        }
      }
    } else {
      // Include all fields
      for (const [key, value] of Object.entries(entity)) {
        formatted[key] = this.formatFieldValue(value, key);
      }
    }

    // Add OData annotations
    this.addODataAnnotations(formatted, entity, queryOptions);

    return formatted;
  }

  private formatFieldValue(value: any, field: string): any {
    if (value === null || value === undefined) {
      return null;
    }

    // Format dates
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Format GUIDs
    if (this.isGuid(value)) {
      return value;
    }

    // Format numbers
    if (typeof value === 'number') {
      return value;
    }

    // Format booleans
    if (typeof value === 'boolean') {
      return value;
    }

    // Format strings
    if (typeof value === 'string') {
      return value;
    }

    // Format objects
    if (typeof value === 'object') {
      return this.formatObject(value, field);
    }

    return value;
  }

  private formatObject(obj: any, field: string): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.formatFieldValue(item, field));
    }

    if (obj && typeof obj === 'object') {
      const formatted: any = {};
      for (const [key, value] of Object.entries(obj)) {
        formatted[key] = this.formatFieldValue(value, key);
      }
      return formatted;
    }

    return obj;
  }

  private addODataAnnotations(
    formatted: any,
    entity: any,
    queryOptions: Record<string, any>
  ): void {
    // Add type annotation
    if (entity._type) {
      formatted['@odata.type'] = entity._type;
    }

    // Add etag annotation
    if (entity._etag) {
      formatted['@odata.etag'] = entity._etag;
    }

    // Add read link
    if (entity.id) {
      formatted['@odata.id'] = `${this.config.baseUrl}/${this.getEntitySetName(entity)}(${entity.id})`;
    }

    // Add edit link
    if (entity.id) {
      formatted['@odata.editLink'] = `${this.config.baseUrl}/${this.getEntitySetName(entity)}(${entity.id})`;
    }

    // Add compliance annotations
    this.addComplianceAnnotations(formatted, entity);
  }

  private addComplianceAnnotations(formatted: any, entity: any): void {
    // Add GDPR annotations
    if (this.config.compliance.gdpr) {
      formatted['@compliance.gdpr'] = {
        pii: this.hasPIIFields(entity),
        phi: this.hasPHIFields(entity),
        consent: entity.consent || false,
        purpose: entity.purpose || 'odata-access',
        legalBasis: entity.legalBasis || 'legitimate-interest'
      };
    }

    // Add HIPAA annotations
    if (this.config.compliance.hipaa) {
      formatted['@compliance.hipaa'] = {
        phi: this.hasPHIFields(entity),
        authorization: entity.authorization || false,
        minimumNecessary: entity.minimumNecessary || false,
        audit: entity.audit || false
      };
    }

    // Add data protection annotations
    if (this.config.compliance.dataProtection) {
      formatted['@compliance.dataProtection'] = {
        encrypted: this.hasEncryptedFields(entity),
        pseudonymized: this.hasPseudonymizedFields(entity),
        retention: entity.retention || null,
        access: entity.access || 'restricted'
      };
    }
  }

  private hasPIIFields(entity: any): boolean {
    const piiFields = [
      'firstName', 'lastName', 'email', 'phone', 'address',
      'ssn', 'dateOfBirth', 'gender', 'nationality'
    ];

    return piiFields.some(field => entity.hasOwnProperty(field));
  }

  private hasPHIFields(entity: any): boolean {
    const phiFields = [
      'medicalRecordNumber', 'diagnoses', 'treatments', 'medications',
      'allergies', 'vitalSigns', 'labResults', 'imagingResults'
    ];

    return phiFields.some(field => entity.hasOwnProperty(field));
  }

  private hasEncryptedFields(entity: any): boolean {
    const encryptedFields = [
      'ssn', 'creditCard', 'bankAccount', 'password', 'secret'
    ];

    return encryptedFields.some(field => entity.hasOwnProperty(field));
  }

  private hasPseudonymizedFields(entity: any): boolean {
    const pseudonymizedFields = [
      'firstName', 'lastName', 'email', 'phone'
    ];

    return pseudonymizedFields.some(field => entity.hasOwnProperty(field));
  }

  private getEntitySetName(entity: any): string {
    // This would be determined by the entity's metadata
    // For now, we'll use a simple mapping
    if (entity._type) {
      return entity._type.replace('Collection(', '').replace(')', '');
    }

    return 'EntitySet';
  }

  private isGuid(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return guidRegex.test(value);
  }
}

