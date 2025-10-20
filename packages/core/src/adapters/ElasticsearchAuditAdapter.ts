/**
 * ElasticsearchAuditAdapter - Elasticsearch implementation of audit interfaces
 *
 * This adapter provides Elasticsearch-specific implementations of the audit interfaces,
 * following the Adapter pattern and ISP principles.
 *
 * @example
 * ```typescript
 * const adapter = new ElasticsearchAuditAdapter({
 *   node: 'http://localhost:9200',
 *   index: 'audit-logs'
 * });
 * await adapter.connect();
 *
 * await adapter.log({
 *   id: 'audit-123',
 *   timestamp: new Date(),
 *   action: 'CREATE',
 *   entityType: 'User',
 *   entityId: 'user-123',
 *   userId: 'admin-456',
 *   details: { name: 'John Doe' }
 * });
 * ```
 */

import { Client } from '@elastic/elasticsearch';
import { IAuditLogger } from '../interfaces/IAuditLogger';
import { IAuditQuery } from '../interfaces/IAuditQuery';
import { AuditEvent } from '../types/AuditEvent';
import { AuditOptions } from '../types/AuditOptions';
import { AuditFilter } from '../types/AuditFilter';
import { ExportFormat } from '../types/ExportFormat';

export interface ElasticsearchConfig {
  node: string;
  index: string;
  username?: string;
  password?: string;
  apiKey?: string;
  tls?: {
    rejectUnauthorized?: boolean;
  };
}

export class ElasticsearchAuditAdapter implements IAuditLogger, IAuditQuery {
  private readonly client: Client;
  private readonly defaultIndex: string;
  private isConnected: boolean = false;

  /**
   * Creates a new ElasticsearchAuditAdapter instance
   *
   * @param config - Elasticsearch connection configuration
   */
  constructor(private readonly config: ElasticsearchConfig) {
    const clientOptions: any = {
      node: config.node,
    };

    if (config.username && config.password) {
      clientOptions.auth = {
        username: config.username,
        password: config.password,
      };
    } else if (config.apiKey) {
      clientOptions.auth = {
        apiKey: config.apiKey,
      };
    }

    if (config.tls) {
      clientOptions.tls = config.tls;
    }

    this.client = new Client(clientOptions);
    this.defaultIndex = config.index;
  }

  /**
   * Connects to Elasticsearch
   */
  async connect(): Promise<void> {
    try {
      await this.client.ping();
      this.isConnected = true;
    } catch (error) {
      throw new Error(`Elasticsearch connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Closes the Elasticsearch connection
   */
  async close(): Promise<void> {
    await this.client.close();
    this.isConnected = false;
  }

  // IAuditLogger implementation

  /**
   * Logs a single audit event
   */
  async log(event: AuditEvent, options?: AuditOptions): Promise<void> {
    try {
      const index = options?.index || this.defaultIndex;
      const auditDoc = this.prepareAuditDocument(event, options);

      const indexParams: any = {
        index,
        body: auditDoc,
      };

      // Only set ID if provided
      if (event.id) {
        indexParams.id = event.id;
      }

      await this.client.index(indexParams);
    } catch (error) {
      throw new Error(`Elasticsearch log error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Logs multiple audit events in a batch
   */
  async logBatch(events: AuditEvent[], options?: AuditOptions): Promise<void> {
    try {
      if (events.length === 0) {
        return;
      }

      const index = options?.index || this.defaultIndex;
      const body: any[] = [];

      for (const event of events) {
        const auditDoc = this.prepareAuditDocument(event, options);

        body.push({
          index: {
            _index: index,
            ...(event.id && { _id: event.id }),
          },
        });
        body.push(auditDoc);
      }

      await this.client.bulk({ body });
    } catch (error) {
      throw new Error(`Elasticsearch logBatch error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // IAuditQuery implementation

  /**
   * Queries audit events based on filter criteria
   */
  async query(filter: AuditFilter, options?: AuditOptions): Promise<AuditEvent[]> {
    try {
      const index = options?.index || this.defaultIndex;
      const query = this.buildElasticsearchQuery(filter);

      const searchParams: any = {
        index,
        body: {
          query,
          sort: [{ timestamp: { order: 'desc' } }],
        },
      };

      // Add pagination
      if (options?.limit) {
        searchParams.body.size = options.limit;
      }
      if (options?.offset) {
        searchParams.body.from = options.offset;
      }

      const response = await this.client.search(searchParams);
      return this.parseElasticsearchResponse(response);
    } catch (error) {
      throw new Error(`Elasticsearch query error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Counts audit events based on filter criteria
   */
  async count(filter: AuditFilter, options?: AuditOptions): Promise<number> {
    try {
      const index = options?.index || this.defaultIndex;
      const query = this.buildElasticsearchQuery(filter);

      const response = await this.client.count({
        index,
        query,
      });

      return response.count;
    } catch (error) {
      throw new Error(`Elasticsearch count error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Exports audit events in the specified format
   */
  async export(filter: AuditFilter, format: ExportFormat, options?: AuditOptions): Promise<string> {
    try {
      const index = options?.index || this.defaultIndex;
      const query = this.buildElasticsearchQuery(filter);

      // For large result sets, use scroll API
      const useScroll = options?.limit && options.limit > 1000;

      if (useScroll) {
        return await this.exportWithScroll(index, query, format, options);
      } else {
        return await this.exportWithSearch(index, query, format, options);
      }
    } catch (error) {
      throw new Error(`Elasticsearch export error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper methods

  /**
   * Prepares an audit document for indexing
   */
  private prepareAuditDocument(event: AuditEvent, options?: AuditOptions): any {
    const doc: any = {
      ...event,
      timestamp: event.timestamp.toISOString(),
    };

    // Add retention date if specified
    if (options?.retentionDays || options?.retention) {
      const retentionDays = options.retentionDays || options.retention || 2555; // Default 7 years for GDPR
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() + retentionDays);
      doc.retentionDate = retentionDate.toISOString();
    }

    // Add compliance metadata
    if (options?.compliance) {
      doc.compliance = options.compliance;
    }

    // Add region information
    if (options?.region) {
      doc.region = options.region;
    }

    // Add priority
    if (options?.priority) {
      doc.priority = options.priority;
    }

    // Add custom metadata
    if (options?.metadata) {
      doc.metadata = options.metadata;
    }

    return doc;
  }

  /**
   * Builds Elasticsearch query from filter
   */
  private buildElasticsearchQuery(filter: AuditFilter): any {
    const must: any[] = [];

    // Add user ID filter
    if (filter.userId) {
      must.push({ term: { userId: filter.userId } });
    }

    // Add action filter
    if (filter.action) {
      must.push({ term: { action: filter.action } });
    }

    // Add entity type filter
    if (filter.entityType) {
      must.push({ term: { entityType: filter.entityType } });
    }

    // Add entity ID filter
    if (filter.entityId) {
      must.push({ term: { entityId: filter.entityId } });
    }

    // Add date range filter
    if (filter.startDate || filter.endDate) {
      const range: any = {};
      if (filter.startDate) {
        range.gte = filter.startDate.toISOString();
      }
      if (filter.endDate) {
        range.lte = filter.endDate.toISOString();
      }
      must.push({
        range: {
          timestamp: range,
        },
      });
    }

    return {
      bool: {
        must,
      },
    };
  }

  /**
   * Parses Elasticsearch response into AuditEvent array
   */
  private parseElasticsearchResponse(response: any): AuditEvent[] {
    const events: AuditEvent[] = [];

    // Handle both direct response and response.body structure
    const responseData = response.body || response;

    if (responseData.hits?.hits) {
      for (const hit of responseData.hits.hits) {
        const source = hit._source;
        if (source) {
          events.push({
            id: hit._id,
            timestamp: new Date(source.timestamp),
            action: source.action,
            entityType: source.entityType,
            entityId: source.entityId,
            userId: source.userId,
            details: source.details,
          });
        }
      }
    }

    return events;
  }

  /**
   * Exports data using regular search
   */
  private async exportWithSearch(index: string, query: any, format: ExportFormat, options?: AuditOptions): Promise<string> {
    const searchParams: any = {
      index,
      body: {
        query,
        sort: [{ timestamp: { order: 'desc' } }],
      },
    };

    if (options?.limit) {
      searchParams.body.size = options.limit;
    }

    const response = await this.client.search(searchParams);
    const events = this.parseElasticsearchResponse(response);

    return this.formatExportData(events, format);
  }

  /**
   * Exports data using scroll API for large result sets
   */
  private async exportWithScroll(index: string, query: any, format: ExportFormat, options?: AuditOptions): Promise<string> {
    const scrollParams: any = {
      index,
      body: {
        query,
        sort: [{ timestamp: { order: 'desc' } }],
        size: 1000,
      },
      scroll: '1m',
    };

    const response = await this.client.search(scrollParams);
    const events = this.parseElasticsearchResponse(response);
    let scrollId = (response as any)._scroll_id || (response as any).body?._scroll_id || (response as any).body?.scroll_id || (response as any).body?.hits?.scroll_id;


    // Continue scrolling until no more results
    while (scrollId && events.length < (options?.limit || 10000)) {
      const scrollResponse = await this.client.scroll({
        scroll_id: scrollId,
        scroll: '1m',
      });

      const newEvents = this.parseElasticsearchResponse(scrollResponse);

      if (newEvents.length === 0) {
        break;
      }

      events.push(...newEvents);
      scrollId = (scrollResponse as any)._scroll_id || (scrollResponse as any).body?._scroll_id || (scrollResponse as any).body?.scroll_id || (scrollResponse as any).body?.hits?.scroll_id;
    }

    // Clear scroll
    if (scrollId) {
      await this.client.clearScroll({ scroll_id: scrollId });
    }

    return this.formatExportData(events, format);
  }

  /**
   * Formats export data based on format type
   */
  private formatExportData(events: AuditEvent[], format: ExportFormat): string {
    switch (format) {
      case 'JSON':
        // Preserve Date objects in JSON export
        return JSON.stringify(events, (key, value) => {
          if (value instanceof Date) {
            return value;
          }
          return value;
        }, 2);

      case 'CSV':
        if (events.length === 0) {
          return 'id,timestamp,action,entityType,entityId,userId,details\n';
        }

        const headers = 'id,timestamp,action,entityType,entityId,userId,details\n';
        const rows = events.map(event => {
          const details = JSON.stringify(event.details).replace(/"/g, '""');
          return `"${event.id}","${event.timestamp.toISOString()}","${event.action}","${event.entityType}","${event.entityId}","${event.userId}","${details}"`;
        }).join('\n');

        return headers + rows;

      case 'XML':
        // Basic XML export implementation
        const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<auditEvents>\n';
        const xmlFooter = '</auditEvents>';
        const xmlEvents = events.map(event => `  <event>
    <id>${event.id}</id>
    <timestamp>${event.timestamp.toISOString()}</timestamp>
    <action>${event.action}</action>
    <entityType>${event.entityType}</entityType>
    <entityId>${event.entityId}</entityId>
    <userId>${event.userId}</userId>
    <details>${JSON.stringify(event.details)}</details>
  </event>`).join('\n');
        return `${xmlHeader + xmlEvents  }\n${  xmlFooter}`;

      case 'PDF':
        // For PDF, return a simple text representation
        // In a real implementation, you would use a PDF library
        return `Audit Events Report\nGenerated: ${new Date().toISOString()}\n\n${events.map(event =>
          `ID: ${event.id}\nTimestamp: ${event.timestamp.toISOString()}\nAction: ${event.action}\nEntity: ${event.entityType} (${event.entityId})\nUser: ${event.userId}\nDetails: ${JSON.stringify(event.details)}\n---`,
        ).join('\n')}`;

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Gets the Elasticsearch client instance
   */
  getClient(): Client {
    return this.client;
  }

  /**
   * Checks if the adapter is connected to Elasticsearch
   */
  isConnectedToElasticsearch(): boolean {
    return this.isConnected;
  }

  /**
   * Gets cluster health information
   */
  async getClusterHealth(): Promise<any> {
    try {
      const response = await this.client.cluster.health();
      return response;
    } catch (error) {
      throw new Error(`Elasticsearch cluster health error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets index statistics
   */
  async getIndexStats(): Promise<any> {
    try {
      const response = await this.client.indices.stats({
        index: this.defaultIndex,
      });
      return response;
    } catch (error) {
      throw new Error(`Elasticsearch index stats error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
