import { Privata } from '@privata/core';

export interface QueryOptions {
  includePII?: boolean;
  includePHI?: boolean;
  includeAuditLogs?: boolean;
  complianceMode?: 'strict' | 'relaxed' | 'disabled';
  dataRetention?: number; // in days
  purpose?: string;
  legalBasis?: string;
  consentRequired?: boolean;
}

export interface FilterCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'regex' | 'exists' | 'null';
  value: any;
  dataType?: 'pii' | 'phi' | 'metadata';
  complianceRequired?: boolean;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  dataType?: 'pii' | 'phi' | 'metadata';
}

export interface PaginationOptions {
  page: number;
  limit: number;
  offset?: number;
}

export interface QueryResult<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
  compliance: {
    piiIncluded: boolean;
    phiIncluded: boolean;
    auditLogsIncluded: boolean;
    dataRetention: number;
    purpose: string;
    legalBasis: string;
  };
  metadata: {
    executionTime: number;
    queryHash: string;
    complianceScore: number;
  };
}

export class QueryBuilder<T = any> {
  private privata: Privata;
  private model: string;
  private filters: FilterCondition[] = [];
  private sorts: SortOption[] = [];
  private pagination?: PaginationOptions;
  private options: QueryOptions;
  private selectFields: string[] = [];
  private includeRelations: string[] = [];
  private excludeFields: string[] = [];

  constructor(privata: Privata, model: string, options: QueryOptions = {}) {
    this.privata = privata;
    this.model = model;
    this.options = {
      includePII: true,
      includePHI: true,
      includeAuditLogs: false,
      complianceMode: 'strict',
      dataRetention: 365,
      purpose: 'data-access',
      legalBasis: 'legitimate-interest',
      consentRequired: false,
      ...options,
    };
  }

  // Filter methods
  where(field: string, operator: FilterCondition['operator'], value: any, dataType?: FilterCondition['dataType']): QueryBuilder<T> {
    this.filters.push({
      field,
      operator,
      value,
      dataType,
      complianceRequired: this.isComplianceRequired(dataType),
    });
    return this;
  }

  wherePII(field: string, operator: FilterCondition['operator'], value: any): QueryBuilder<T> {
    return this.where(field, operator, value, 'pii');
  }

  wherePHI(field: string, operator: FilterCondition['operator'], value: any): QueryBuilder<T> {
    return this.where(field, operator, value, 'phi');
  }

  whereMetadata(field: string, operator: FilterCondition['operator'], value: any): QueryBuilder<T> {
    return this.where(field, operator, value, 'metadata');
  }

  and(field: string, operator: FilterCondition['operator'], value: any, dataType?: FilterCondition['dataType']): QueryBuilder<T> {
    return this.where(field, operator, value, dataType);
  }

  or(field: string, operator: FilterCondition['operator'], value: any, dataType?: FilterCondition['dataType']): QueryBuilder<T> {
    // For OR conditions, we'll need to implement a more complex filter system
    // For now, we'll treat it as an AND condition
    return this.where(field, operator, value, dataType);
  }

  // Range filters
  between(field: string, start: any, end: any, dataType?: FilterCondition['dataType']): QueryBuilder<T> {
    this.filters.push({
      field,
      operator: 'gte',
      value: start,
      dataType,
      complianceRequired: this.isComplianceRequired(dataType),
    });
    this.filters.push({
      field,
      operator: 'lte',
      value: end,
      dataType,
      complianceRequired: this.isComplianceRequired(dataType),
    });
    return this;
  }

  in(field: string, values: any[], dataType?: FilterCondition['dataType']): QueryBuilder<T> {
    return this.where(field, 'in', values, dataType);
  }

  notIn(field: string, values: any[], dataType?: FilterCondition['dataType']): QueryBuilder<T> {
    return this.where(field, 'nin', values, dataType);
  }

  like(field: string, pattern: string, dataType?: FilterCondition['dataType']): QueryBuilder<T> {
    return this.where(field, 'like', pattern, dataType);
  }

  regex(field: string, pattern: string, dataType?: FilterCondition['dataType']): QueryBuilder<T> {
    return this.where(field, 'regex', pattern, dataType);
  }

  exists(field: string, dataType?: FilterCondition['dataType']): QueryBuilder<T> {
    return this.where(field, 'exists', true, dataType);
  }

  null(field: string, dataType?: FilterCondition['dataType']): QueryBuilder<T> {
    return this.where(field, 'null', true, dataType);
  }

  // Sort methods
  orderBy(field: string, direction: SortOption['direction'] = 'asc', dataType?: SortOption['dataType']): QueryBuilder<T> {
    this.sorts.push({ field, direction, dataType });
    return this;
  }

  orderByPII(field: string, direction: SortOption['direction'] = 'asc'): QueryBuilder<T> {
    return this.orderBy(field, direction, 'pii');
  }

  orderByPHI(field: string, direction: SortOption['direction'] = 'asc'): QueryBuilder<T> {
    return this.orderBy(field, direction, 'phi');
  }

  orderByMetadata(field: string, direction: SortOption['direction'] = 'asc'): QueryBuilder<T> {
    return this.orderBy(field, direction, 'metadata');
  }

  // Pagination methods
  page(page: number, limit: number): QueryBuilder<T> {
    this.pagination = { page, limit };
    return this;
  }

  limit(limit: number): QueryBuilder<T> {
    if (!this.pagination) {
      this.pagination = { page: 1, limit };
    } else {
      this.pagination.limit = limit;
    }
    return this;
  }

  offset(offset: number): QueryBuilder<T> {
    if (!this.pagination) {
      this.pagination = { page: 1, limit: 10, offset };
    } else {
      this.pagination.offset = offset;
    }
    return this;
  }

  // Field selection
  select(fields: string[]): QueryBuilder<T> {
    this.selectFields = fields;
    return this;
  }

  include(relations: string[]): QueryBuilder<T> {
    this.includeRelations = relations;
    return this;
  }

  exclude(fields: string[]): QueryBuilder<T> {
    this.excludeFields = fields;
    return this;
  }

  // Compliance methods
  withPII(): QueryBuilder<T> {
    this.options.includePII = true;
    return this;
  }

  withoutPII(): QueryBuilder<T> {
    this.options.includePII = false;
    return this;
  }

  withPHI(): QueryBuilder<T> {
    this.options.includePHI = true;
    return this;
  }

  withoutPHI(): QueryBuilder<T> {
    this.options.includePHI = false;
    return this;
  }

  withAuditLogs(): QueryBuilder<T> {
    this.options.includeAuditLogs = true;
    return this;
  }

  withoutAuditLogs(): QueryBuilder<T> {
    this.options.includeAuditLogs = false;
    return this;
  }

  complianceMode(mode: QueryOptions['complianceMode']): QueryBuilder<T> {
    this.options.complianceMode = mode;
    return this;
  }

  dataRetention(days: number): QueryBuilder<T> {
    this.options.dataRetention = days;
    return this;
  }

  purpose(purpose: string): QueryBuilder<T> {
    this.options.purpose = purpose;
    return this;
  }

  legalBasis(basis: string): QueryBuilder<T> {
    this.options.legalBasis = basis;
    return this;
  }

  requireConsent(): QueryBuilder<T> {
    this.options.consentRequired = true;
    return this;
  }

  // Execution methods
  async execute(): Promise<QueryResult<T>> {
    const startTime = Date.now();
    
    try {
      // Validate compliance requirements
      await this.validateCompliance();
      
      // Build query
      const query = this.buildQuery();
      
      // Execute query through Privata
      const result = await this.privata.queryWithCompliance(this.model, query, this.options);
      
      // Calculate execution time
      const executionTime = Date.now() - startTime;
      
      // Build result
      const queryResult: QueryResult<T> = {
        data: result.data,
        total: result.total,
        page: this.pagination?.page || 1,
        limit: this.pagination?.limit || 10,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
        compliance: {
          piiIncluded: this.options.includePII || false,
          phiIncluded: this.options.includePHI || false,
          auditLogsIncluded: this.options.includeAuditLogs || false,
          dataRetention: this.options.dataRetention || 365,
          purpose: this.options.purpose || 'data-access',
          legalBasis: this.options.legalBasis || 'legitimate-interest',
        },
        metadata: {
          executionTime,
          queryHash: this.generateQueryHash(),
          complianceScore: this.calculateComplianceScore(),
        },
      };
      
      return queryResult;
      
    } catch (error) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  async findOne(): Promise<T | null> {
    const result = await this.limit(1).execute();
    return result.data[0] || null;
  }

  async findMany(): Promise<T[]> {
    const result = await this.execute();
    return result.data;
  }

  async count(): Promise<number> {
    const result = await this.execute();
    return result.total;
  }

  async exists(): Promise<boolean> {
    const result = await this.limit(1).execute();
    return result.data.length > 0;
  }

  // Aggregation methods
  async aggregate(pipeline: any[]): Promise<any> {
    const query = this.buildQuery();
    return await this.privata.aggregateWithCompliance(this.model, pipeline, query, this.options);
  }

  async groupBy(field: string, aggregation: Record<string, any>): Promise<any> {
    const pipeline = [
      { $group: { _id: `$${field}`, ...aggregation } },
    ];
    return await this.aggregate(pipeline);
  }

  async sum(field: string): Promise<number> {
    const pipeline = [
      { $group: { _id: null, total: { $sum: `$${field}` } } },
    ];
    const result = await this.aggregate(pipeline);
    return result[0]?.total || 0;
  }

  async avg(field: string): Promise<number> {
    const pipeline = [
      { $group: { _id: null, average: { $avg: `$${field}` } } },
    ];
    const result = await this.aggregate(pipeline);
    return result[0]?.average || 0;
  }

  async min(field: string): Promise<any> {
    const pipeline = [
      { $group: { _id: null, minimum: { $min: `$${field}` } } },
    ];
    const result = await this.aggregate(pipeline);
    return result[0]?.minimum;
  }

  async max(field: string): Promise<any> {
    const pipeline = [
      { $group: { _id: null, maximum: { $max: `$${field}` } } },
    ];
    const result = await this.aggregate(pipeline);
    return result[0]?.maximum;
  }

  // Private methods
  private async validateCompliance(): Promise<void> {
    if (this.options.complianceMode === 'disabled') {
      return;
    }

    // Check if PII access is allowed
    if (this.options.includePII && this.options.complianceMode === 'strict') {
      await this.privata.validatePIIAccess({
        purpose: this.options.purpose,
        legalBasis: this.options.legalBasis,
        consentRequired: this.options.consentRequired,
      });
    }

    // Check if PHI access is allowed
    if (this.options.includePHI && this.options.complianceMode === 'strict') {
      await this.privata.validatePHIAccess({
        purpose: this.options.purpose,
        legalBasis: this.options.legalBasis,
        consentRequired: this.options.consentRequired,
      });
    }
  }

  private buildQuery(): any {
    const query: any = {
      filters: this.filters,
      sorts: this.sorts,
      pagination: this.pagination,
      select: this.selectFields,
      include: this.includeRelations,
      exclude: this.excludeFields,
    };

    return query;
  }

  private isComplianceRequired(dataType?: string): boolean {
    if (this.options.complianceMode === 'disabled') {
      return false;
    }

    return dataType === 'pii' || dataType === 'phi';
  }

  private generateQueryHash(): string {
    const queryString = JSON.stringify({
      model: this.model,
      filters: this.filters,
      sorts: this.sorts,
      pagination: this.pagination,
      options: this.options,
    });
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < queryString.length; i++) {
      const char = queryString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  private calculateComplianceScore(): number {
    let score = 100;
    
    // Deduct points for compliance issues
    if (this.options.includePII && !this.options.consentRequired) {
      score -= 10;
    }
    
    if (this.options.includePHI && !this.options.consentRequired) {
      score -= 15;
    }
    
    if (this.options.complianceMode === 'disabled') {
      score -= 50;
    }
    
    if (!this.options.purpose || this.options.purpose === 'data-access') {
      score -= 5;
    }
    
    if (!this.options.legalBasis || this.options.legalBasis === 'legitimate-interest') {
      score -= 5;
    }
    
    return Math.max(0, score);
  }
}

// Factory function
export function createQueryBuilder<T = any>(
  privata: Privata,
  model: string,
  options?: QueryOptions
): QueryBuilder<T> {
  return new QueryBuilder<T>(privata, model, options);
}

// Export types
export type { QueryOptions, FilterCondition, SortOption, PaginationOptions, QueryResult };

