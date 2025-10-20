/**
 * PrivataModel - CRUD operations with automatic data separation
 * 
 * Handles create, read, update, delete operations while automatically
 * separating PII, PHI, and metadata into appropriate databases.
 * Implements caching for performance.
 */

import { Model } from './ModelRegistry';
import { IDatabaseReader } from '../interfaces/IDatabaseReader';
import { IDatabaseWriter } from '../interfaces/IDatabaseWriter';
import { ICacheReader } from '../interfaces/ICacheReader';
import { ICacheWriter } from '../interfaces/ICacheWriter';
import { DataSeparatorService } from '../services/DataSeparatorService';

export interface DeleteOptions {
  gdprCompliant?: boolean;
  softDelete?: boolean;
}

export class PrivataModel {
  constructor(
    private readonly schema: Model,
    private readonly identityDB: IDatabaseReader & IDatabaseWriter,
    private readonly clinicalDB: IDatabaseReader & IDatabaseWriter,
    private readonly cache: ICacheReader & ICacheWriter,
    private readonly dataSeparator: DataSeparatorService
  ) {}

  /**
   * Create a new document with automatic data separation
   */
  async create(data: Record<string, any>): Promise<any> {
    // Validate data against schema
    const validation = this.schema.validate(data);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Add timestamps
    const dataWithTimestamps = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Separate data into PII, PHI, and metadata
    const separated = await this.dataSeparator.separate(dataWithTimestamps);

    // Generate ID for identity database
    const id = `${this.schema.modelName.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store in identity database
    const identityData = await this.identityDB.create({
      id,
      pseudonym: separated.pseudonym,
      ...separated.pii,
      ...separated.metadata,
    });

    // Store in clinical database if there's PHI
    let clinicalData = null;
    if (Object.keys(separated.phi).length > 0) {
      clinicalData = await this.clinicalDB.create({
        pseudonym: separated.pseudonym,
        ...separated.phi,
      });
    }

    // Merge and return
    const result = {
      ...identityData,
      ...clinicalData,
    };

    // Cache the result (TTL: 300 seconds = 5 minutes)
    await this.cache.set(
      this.getCacheKey(id),
      JSON.stringify(result),
      300
    );

    return result;
  }

  /**
   * Find document by ID with cache-first strategy
   */
  async findById(id: string): Promise<any | null> {
    // Try cache first
    const cacheKey = this.getCacheKey(id);
    const cached = await this.cache.get<string>(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // Cache miss - read from databases
    const identityData = await this.identityDB.findById(id);
    
    if (!identityData) {
      return null;
    }

    // Get clinical data using pseudonym
    let clinicalData = null;
    if (identityData.pseudonym) {
      clinicalData = await this.clinicalDB.findById(identityData.pseudonym);
    }

    // Merge data
    const result = {
      ...identityData,
      ...(clinicalData || {}),
    };

    // Cache for future reads (TTL: 300 seconds)
    await this.cache.set(cacheKey, JSON.stringify(result), 300);

    return result;
  }

  /**
   * Find multiple documents matching query
   */
  async find(query: Record<string, any> = {}): Promise<any[]> {
    // Query identity database
    const identityResults = await this.identityDB.findMany(query);

    // Handle case where findMany returns undefined or null
    if (!identityResults || !Array.isArray(identityResults)) {
      return [];
    }

    // For each result, fetch clinical data
    const results = await Promise.all(
      identityResults.map(async (identityData: any) => {
        let clinicalData = null;
        
        if (identityData.pseudonym) {
          clinicalData = await this.clinicalDB.findById(identityData.pseudonym);
        }

        return {
          ...identityData,
          ...(clinicalData || {}),
        };
      })
    );

    return results;
  }

  /**
   * Update document with cache invalidation
   */
  async update(id: string, updates: Record<string, any>): Promise<any> {
    // Check if document exists
    const existing = await this.identityDB.findById(id);
    
    if (!existing) {
      throw new Error('Document not found');
    }

    // Add update timestamp
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date(),
    };

    // Separate updates into PII, PHI, and metadata
    const separated = await this.dataSeparator.separate(updatesWithTimestamp);

    // Update identity database
    let identityResult = null;
    const hasIdentityUpdates = Object.keys(separated.pii).length > 0 || 
                               Object.keys(separated.metadata).length > 0 ||
                               updatesWithTimestamp.updatedAt;
    
    if (hasIdentityUpdates) {
      identityResult = await this.identityDB.update(id, {
        ...separated.pii,
        ...separated.metadata,
        updatedAt: updatesWithTimestamp.updatedAt,
      });
    }

    // Update clinical database
    let clinicalResult = null;
    if (Object.keys(separated.phi).length > 0 && existing.pseudonym) {
      clinicalResult = await this.clinicalDB.update(existing.pseudonym, separated.phi);
    }

    // Invalidate cache
    await this.cache.invalidate(this.getCacheKey(id));

    return {
      ...existing,
      ...identityResult,
      ...clinicalResult,
    };
  }

  /**
   * Delete document from databases and cache
   */
  async delete(id: string, options: DeleteOptions = {}): Promise<void> {
    // Check if document exists
    const existing = await this.identityDB.findById(id);
    
    if (!existing) {
      throw new Error('Document not found');
    }

    // Delete from identity database (always for any delete type)
    await this.identityDB.delete(id);

    // For GDPR-compliant delete, keep PHI but remove PII
    // For regular delete, remove both
    if (!options.gdprCompliant) {
      if (existing.pseudonym) {
        await this.clinicalDB.delete(existing.pseudonym);
      }
    }

    // Invalidate cache
    await this.cache.invalidate(this.getCacheKey(id));
  }

  /**
   * Generate cache key for a document
   */
  private getCacheKey(id: string): string {
    return `${this.schema.modelName}:${id}`;
  }
}

