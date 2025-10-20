/**
 * DataSeparatorService - Service for separating PII, PHI, and metadata
 *
 * This service provides a high-level interface for data separation operations,
 * following the Single Responsibility Principle and using dependency injection.
 *
 * @example
 * ```typescript
 * const generator = new CryptoPseudonymGenerator();
 * const service = new DataSeparatorService(generator);
 *
 * const result = await service.separate({
 *   firstName: 'John',
 *   diagnosis: 'Tinnitus'
 * });
 * // result.pii = { firstName: 'John' }
 * // result.phi = { diagnosis: 'Tinnitus' }
 * // result.pseudonym = 'pseudo_abc123def456'
 * ```
 */

import { IPseudonymGenerator } from '../interfaces/IPseudonymGenerator';

export interface SeparationResult {
  /** Personally Identifiable Information */
  pii: any;
  /** Protected Health Information */
  phi: any;
  /** Metadata and system fields */
  metadata: any;
  /** Generated pseudonym for linking */
  pseudonym: string;
}

export interface SeparationSchema {
  /** Fields that contain PII */
  pii: string[];
  /** Fields that contain PHI */
  phi: string[];
  /** Fields that contain metadata */
  metadata: string[];
}

export class DataSeparatorService {
  /**
   * Creates a new DataSeparatorService instance
   *
   * @param generator - The pseudonym generator to use
   */
  constructor(private readonly generator: IPseudonymGenerator) {}

  /**
   * Separate data into PII, PHI, and metadata components
   *
   * @param data - The data to separate
   * @param schema - Optional custom schema for separation
   * @returns Promise resolving to separation result
   *
   * @example
   * ```typescript
   * const result = await service.separate({
   *   firstName: 'John',
   *   diagnosis: 'Tinnitus',
   *   createdAt: new Date()
   * });
   * ```
   */
  async separate(data: any, schema?: SeparationSchema): Promise<SeparationResult> {
    // Handle null/undefined data
    if (!data || typeof data !== 'object') {
      const pseudonym = this.generator.generate();
      return {
        pii: {},
        phi: {},
        metadata: {},
        pseudonym,
      };
    }

    // Use custom schema or default field classification
    const classification = schema || this.getDefaultClassification();

    const result: SeparationResult = {
      pii: {},
      phi: {},
      metadata: {},
      pseudonym: this.generator.generate(),
    };

    // Separate fields based on classification
    for (const [key, value] of Object.entries(data)) {
      if (classification.pii.includes(key)) {
        result.pii[key] = value;
      } else if (classification.phi.includes(key)) {
        result.phi[key] = value;
      } else if (classification.metadata.includes(key)) {
        result.metadata[key] = value;
      } else {
        // Default classification based on field name patterns
        if (this.isPIIField(key)) {
          result.pii[key] = value;
        } else if (this.isPHIField(key)) {
          result.phi[key] = value;
        } else {
          result.metadata[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Get default field classification schema
   */
  private getDefaultClassification(): SeparationSchema {
    return {
      pii: [
        'firstName', 'lastName', 'email', 'phone', 'address', 'ssn', 'passport',
        'driversLicense', 'dateOfBirth', 'gender', 'nationality', 'zipCode',
        'city', 'state', 'country', 'street', 'apartment', 'postalCode',
      ],
      phi: [
        'diagnosis', 'treatment', 'medications', 'allergies', 'medicalHistory',
        'symptoms', 'vitalSigns', 'labResults', 'imagingResults', 'prescriptions',
        'medicalRecord', 'healthInsurance', 'patientId', 'medicalDevice',
      ],
      metadata: [
        'id', 'createdAt', 'updatedAt', 'version', 'region', 'source', 'status',
        'type', 'category', 'tags', 'notes', 'comments', 'auditTrail',
      ],
    };
  }

  /**
   * Check if a field name indicates PII
   */
  private isPIIField(fieldName: string): boolean {
    const piiPatterns = [
      /name/i, /email/i, /phone/i, /address/i, /ssn/i, /passport/i,
      /license/i, /birth/i, /gender/i, /nationality/i, /zip/i, /postal/i,
    ];

    return piiPatterns.some(pattern => pattern.test(fieldName));
  }

  /**
   * Check if a field name indicates PHI
   */
  private isPHIField(fieldName: string): boolean {
    const phiPatterns = [
      /diagnosis/i, /treatment/i, /medication/i, /allerg/i, /medical/i,
      /health/i, /patient/i, /symptom/i, /vital/i, /lab/i, /imaging/i,
      /prescription/i, /record/i, /insurance/i, /device/i,
    ];

    return phiPatterns.some(pattern => pattern.test(fieldName));
  }
}
