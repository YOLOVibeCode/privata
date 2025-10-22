import { Privata } from '@privata/core';
import { createQueryBuilder } from '@privata/query-builder';
import { ODataMetadata } from './ODataMetadata';
import { ODataQueryParser } from './ODataQueryParser';
import { ODataResponseBuilder } from './ODataResponseBuilder';
import { ODataComplianceFilter } from './ODataComplianceFilter';

export interface ODataServiceConfig {
  baseUrl: string;
  version: string;
  namespace: string;
  compliance: {
    gdpr: boolean;
    hipaa: boolean;
    dataProtection: boolean;
    auditLogging: boolean;
  };
  metadata: {
    title: string;
    description: string;
    contact: {
      name: string;
      email: string;
    };
  };
}

export interface ODataEntitySet {
  name: string;
  entityType: string;
  model: string;
  permissions: {
    read: boolean;
    insert: boolean;
    update: boolean;
    delete: boolean;
  };
  compliance: {
    pii: boolean;
    phi: boolean;
    audit: boolean;
  };
}

export interface ODataQueryOptions {
  $select?: string;
  $filter?: string;
  $orderby?: string;
  $top?: number;
  $skip?: number;
  $count?: boolean;
  $expand?: string;
  $search?: string;
  $format?: string;
}

export interface ODataResponse<T = any> {
  '@odata.context': string;
  '@odata.count'?: number;
  value: T[];
  '@odata.nextLink'?: string;
}

export class ODataService {
  private privata: Privata;
  private config: ODataServiceConfig;
  private metadata: ODataMetadata;
  private queryParser: ODataQueryParser;
  private responseBuilder: ODataResponseBuilder;
  private complianceFilter: ODataComplianceFilter;
  private entitySets: Map<string, ODataEntitySet> = new Map();

  constructor(privata: Privata, config: ODataServiceConfig) {
    this.privata = privata;
    this.config = config;
    this.metadata = new ODataMetadata(config);
    this.queryParser = new ODataQueryParser();
    this.responseBuilder = new ODataResponseBuilder(config);
    this.complianceFilter = new ODataComplianceFilter(privata, config);
  }

  // Entity Set Management
  registerEntitySet(entitySet: ODataEntitySet): void {
    this.entitySets.set(entitySet.name, entitySet);
    this.metadata.addEntitySet(entitySet);
  }

  getEntitySetConfig(name: string): ODataEntitySet | undefined {
    return this.entitySets.get(name);
  }

  listEntitySets(): ODataEntitySet[] {
    return Array.from(this.entitySets.values());
  }

  // OData Operations
  async getMetadata(): Promise<string> {
    return this.metadata.generateMetadata();
  }

  async getEntitySet(
    entitySetName: string,
    queryOptions: ODataQueryOptions = {},
    userContext?: any
  ): Promise<ODataResponse> {
    try {
      // Get entity set configuration
      const entitySet = this.getEntitySetConfig(entitySetName);
      if (!entitySet) {
        throw new Error(`Entity set '${entitySetName}' not found`);
      }

      // Check permissions
      await this.checkPermissions(entitySet, 'read', userContext);

      // Parse OData query
      const parsedQuery = this.queryParser.parse(queryOptions);

      // Apply compliance filtering
      const complianceQuery = await this.complianceFilter.applyFilters(
        entitySet,
        parsedQuery,
        userContext
      );

      // Build Privata query
      const query = createQueryBuilder(this.privata, entitySet.model)
        .complianceMode('strict')
        .purpose('odata-access')
        .legalBasis('legitimate-interest');

      // Apply filters
      if (complianceQuery.filters) {
        for (const filter of complianceQuery.filters) {
          query.where(filter.field, filter.operator as any, filter.value, filter.dataType);
        }
      }

      // Apply sorting
      if (complianceQuery.sorts) {
        for (const sort of complianceQuery.sorts) {
          query.orderBy(sort.field, sort.direction, sort.dataType);
        }
      }

      // Apply pagination
      if (complianceQuery.pagination) {
        query.page(complianceQuery.pagination.page, complianceQuery.pagination.limit);
      }

      // Apply field selection
      if (complianceQuery.select) {
        query.select(complianceQuery.select);
      }

      // Execute query
      const result = await query.execute();

      // Build OData response
      const response = this.responseBuilder.buildResponse(
        entitySetName,
        result,
        queryOptions
      );

      // Log audit trail
      await this.logAuditTrail('read', entitySetName, userContext, result);

      return response;

    } catch (error) {
        throw new Error(`OData query failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getEntity(
    entitySetName: string,
    key: string,
    queryOptions: ODataQueryOptions = {},
    userContext?: any
  ): Promise<any> {
    try {
      // Get entity set configuration
      const entitySet = this.getEntitySetConfig(entitySetName);
      if (!entitySet) {
        throw new Error(`Entity set '${entitySetName}' not found`);
      }

      // Check permissions
      await this.checkPermissions(entitySet, 'read', userContext);

      // Parse OData query
      const parsedQuery = this.queryParser.parse(queryOptions);

      // Apply compliance filtering
      const complianceQuery = await this.complianceFilter.applyFilters(
        entitySet,
        parsedQuery,
        userContext
      );

      // Build Privata query
      const query = createQueryBuilder(this.privata, entitySet.model)
        .where('id', 'eq', key)
        .complianceMode('strict')
        .purpose('odata-access')
        .legalBasis('legitimate-interest');

      // Apply field selection
      if (complianceQuery.select) {
        query.select(complianceQuery.select);
      }

      // Execute query
      const result = await query.findOne();

      if (!result) {
        throw new Error(`Entity not found: ${key}`);
      }

      // Log audit trail
      await this.logAuditTrail('read', entitySetName, userContext, result);

      return result;

    } catch (error) {
      throw new Error(`OData entity query failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createEntity(
    entitySetName: string,
    data: any,
    userContext?: any
  ): Promise<any> {
    try {
      // Get entity set configuration
      const entitySet = this.getEntitySetConfig(entitySetName);
      if (!entitySet) {
        throw new Error(`Entity set '${entitySetName}' not found`);
      }

      // Check permissions
      await this.checkPermissions(entitySet, 'insert', userContext);

      // Apply compliance validation
      const complianceData = await this.complianceFilter.validateData(
        entitySet,
        data,
        userContext
      );

      // Create entity with compliance
      const result = await this.privata.create(entitySet.model, complianceData);

      // Log audit trail
      await this.logAuditTrail('create', entitySetName, userContext, result);

      return result;

    } catch (error) {
        throw new Error(`OData entity creation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateEntity(
    entitySetName: string,
    key: string,
    data: any,
    userContext?: any
  ): Promise<any> {
    try {
      // Get entity set configuration
      const entitySet = this.getEntitySetConfig(entitySetName);
      if (!entitySet) {
        throw new Error(`Entity set '${entitySetName}' not found`);
      }

      // Check permissions
      await this.checkPermissions(entitySet, 'update', userContext);

      // Apply compliance validation
      const complianceData = await this.complianceFilter.validateData(
        entitySet,
        data,
        userContext
      );

      // Update entity with compliance
      const result = await this.privata.update(
        entitySet.model,
        key,
        complianceData
      );

      // Log audit trail
      await this.logAuditTrail('update', entitySetName, userContext, result);

      return result;

    } catch (error) {
        throw new Error(`OData entity update failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async deleteEntity(
    entitySetName: string,
    key: string,
    userContext?: any
  ): Promise<void> {
    try {
      // Get entity set configuration
      const entitySet = this.getEntitySetConfig(entitySetName);
      if (!entitySet) {
        throw new Error(`Entity set '${entitySetName}' not found`);
      }

      // Check permissions
      await this.checkPermissions(entitySet, 'delete', userContext);

      // Delete entity with compliance
      await this.privata.delete(entitySet.model, key);

      // Log audit trail
      await this.logAuditTrail('delete', entitySetName, userContext, { id: key });

    } catch (error) {
        throw new Error(`OData entity deletion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Batch Operations
  async batchOperation(
    operations: Array<{
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      url: string;
      data?: any;
    }>,
    userContext?: any
  ): Promise<any[]> {
    const results: any[] = [];

    for (const operation of operations) {
      try {
        let result: any;

        switch (operation.method) {
          case 'GET':
            result = await this.handleGetRequest(operation.url, userContext);
            break;
          case 'POST':
            result = await this.handlePostRequest(operation.url, operation.data, userContext);
            break;
          case 'PUT':
          case 'PATCH':
            result = await this.handlePutRequest(operation.url, operation.data, userContext);
            break;
          case 'DELETE':
            result = await this.handleDeleteRequest(operation.url, userContext);
            break;
        }

        results.push({ success: true, result });
      } catch (error) {
        results.push({ success: false, error: error instanceof Error ? error.message : String(error) });
      }
    }

    return results;
  }

  // Function Imports
  async callFunction(
    functionName: string,
    parameters: Record<string, any> = {},
    userContext?: any
  ): Promise<any> {
    try {
      // Check function permissions
      await this.checkFunctionPermissions(functionName, userContext);

      // Execute function with compliance
      const result = await this.privata.executeFunction(functionName, parameters);

      // Log audit trail
      await this.logAuditTrail('function', functionName, userContext, result);

      return result;

    } catch (error) {
      throw new Error(`OData function call failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Action Imports
  async callAction(
    actionName: string,
    parameters: Record<string, any> = {},
    userContext?: any
  ): Promise<any> {
    try {
      // Check action permissions
      await this.checkActionPermissions(actionName, userContext);

      // Execute action with compliance
      const result = await this.privata.executeAction(actionName, parameters);

      // Log audit trail
      await this.logAuditTrail('action', actionName, userContext, result);

      return result;

    } catch (error) {
      throw new Error(`OData action call failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Private methods
  private async checkPermissions(
    entitySet: ODataEntitySet,
    operation: 'read' | 'insert' | 'update' | 'delete',
    userContext?: any
  ): Promise<void> {
    if (!userContext) {
      throw new Error('User context required for permission check');
    }

    const hasPermission = await this.privata.checkAccessPermissions(
      userContext.userId,
      `${entitySet.name}:${operation}`
    );

    if (!hasPermission) {
      throw new Error(`Access denied for operation '${operation}' on entity set '${entitySet.name}'`);
    }
  }

  private async checkFunctionPermissions(
    functionName: string,
    userContext?: any
  ): Promise<void> {
    if (!userContext) {
      throw new Error('User context required for function permission check');
    }

    const hasPermission = await this.privata.checkAccessPermissions(
      userContext.userId,
      `function:${functionName}`
    );

    if (!hasPermission) {
      throw new Error(`Access denied for function '${functionName}'`);
    }
  }

  private async checkActionPermissions(
    actionName: string,
    userContext?: any
  ): Promise<void> {
    if (!userContext) {
      throw new Error('User context required for action permission check');
    }

    const hasPermission = await this.privata.checkAccessPermissions(
      userContext.userId,
      `action:${actionName}`
    );

    if (!hasPermission) {
      throw new Error(`Access denied for action '${actionName}'`);
    }
  }

  private async logAuditTrail(
    operation: string,
    resource: string,
    userContext?: any,
    data?: any
  ): Promise<void> {
    if (this.config.compliance.auditLogging) {
      await this.privata.logAuditEvent(operation, {
        resource,
        userId: userContext?.userId,
        timestamp: new Date(),
        data: data ? JSON.stringify(data) : undefined,
        compliance: {
          gdpr: this.config.compliance.gdpr,
          hipaa: this.config.compliance.hipaa,
          dataProtection: this.config.compliance.dataProtection
        }
      });
    }
  }

  private async handleGetRequest(url: string, userContext?: any): Promise<any> {
    // Parse URL to extract entity set and key
    const urlParts = url?.split('/') || [];
    const entitySetName = urlParts[0];
    
    if (urlParts.length > 1) {
      const key = urlParts[1];
      return await this.getEntity(entitySetName, key, {}, userContext);
    } else {
      return await this.getEntitySet(entitySetName, {}, userContext);
    }
  }

  private async handlePostRequest(
    url: string,
    data: any,
    userContext?: any
  ): Promise<any> {
    const entitySetName = url?.split('/')[0] || '';
    return await this.createEntity(entitySetName, data, userContext);
  }

  private async handlePutRequest(
    url: string,
    data: any,
    userContext?: any
  ): Promise<any> {
    const urlParts = url?.split('/') || [];
    const entitySetName = urlParts[0];
    const key = urlParts[1];
    return await this.updateEntity(entitySetName, key, data, userContext);
  }

  private async handleDeleteRequest(
    url: string,
    userContext?: any
  ): Promise<void> {
    const urlParts = url?.split('/') || [];
    const entitySetName = urlParts[0];
    const key = urlParts[1];
    return await this.deleteEntity(entitySetName, key, userContext);
  }
}

