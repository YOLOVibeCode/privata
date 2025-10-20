/**
 * TDD RED Phase: Tests for ElasticsearchAuditAdapter
 * 
 * These tests define the expected behavior of the ElasticsearchAuditAdapter
 * before we implement it. They should FAIL initially (RED).
 */

import { ElasticsearchAuditAdapter } from '../../../src/adapters/ElasticsearchAuditAdapter';
import { IAuditLogger } from '../../../src/interfaces/IAuditLogger';
import { IAuditQuery } from '../../../src/interfaces/IAuditQuery';
import { AuditEvent } from '../../../src/types/AuditEvent';
import { AuditOptions } from '../../../src/types/AuditOptions';
import { AuditFilter } from '../../../src/types/AuditFilter';
import { ExportFormat } from '../../../src/types/ExportFormat';

// Mock Elasticsearch client
const mockElasticsearchClient = {
  index: jest.fn(),
  search: jest.fn(),
  bulk: jest.fn(),
  scroll: jest.fn(),
  clearScroll: jest.fn(),
  ping: jest.fn(),
  close: jest.fn()
};

// Mock the Elasticsearch module
jest.mock('@elastic/elasticsearch', () => ({
  Client: jest.fn(() => mockElasticsearchClient)
}));

describe('ElasticsearchAuditAdapter', () => {
  let elasticsearchAdapter: ElasticsearchAuditAdapter;
  let mockClient: any;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup mock client
    mockClient = mockElasticsearchClient;
    mockClient.ping.mockResolvedValue({ body: { acknowledged: true } });
    mockClient.close.mockResolvedValue(undefined);
    
    // Setup default mock responses
    mockClient.index.mockResolvedValue({
      body: { _id: 'audit-123', result: 'created' }
    });
    mockClient.search.mockResolvedValue({
      body: {
        hits: {
          total: { value: 0 },
          hits: []
        }
      }
    });
    mockClient.bulk.mockResolvedValue({
      body: { items: [], errors: false }
    });
    mockClient.scroll.mockResolvedValue({
      body: {
        hits: {
          total: { value: 0 },
          hits: []
        }
      }
    });
    mockClient.clearScroll.mockResolvedValue({
      body: { succeeded: true }
    });
    
    // This will fail until we create the adapter
    elasticsearchAdapter = new ElasticsearchAuditAdapter({
      node: 'http://localhost:9200',
      index: 'audit-logs'
    });
    await elasticsearchAdapter.connect();
  });

  describe('IAuditLogger implementation', () => {
    it('should implement IAuditLogger interface', () => {
      // TDD RED: Test implements IAuditLogger
      expect(elasticsearchAdapter).toHaveProperty('log');
      expect(elasticsearchAdapter).toHaveProperty('logBatch');
      expect(typeof elasticsearchAdapter.log).toBe('function');
      expect(typeof elasticsearchAdapter.logBatch).toBe('function');
    });

    describe('log method', () => {
      it('should have correct signature: log(event: AuditEvent, options?: AuditOptions): Promise<void>', async () => {
        // TDD RED: Test the method signature
        const event: AuditEvent = {
          id: 'audit-123',
          timestamp: new Date(),
          action: 'CREATE',
          entityType: 'User',
          entityId: 'user-123',
          userId: 'admin-456',
          details: { name: 'John Doe' }
        };
        await elasticsearchAdapter.log(event);
        expect(typeof elasticsearchAdapter.log).toBe('function');
      });

      it('should log a single audit event', async () => {
        // TDD RED: Test logs single event
        const event: AuditEvent = {
          id: 'audit-123',
          timestamp: new Date(),
          action: 'CREATE',
          entityType: 'User',
          entityId: 'user-123',
          userId: 'admin-456',
          details: { name: 'John Doe', email: 'john@example.com' }
        };
        
        mockClient.index.mockResolvedValue({
          body: { _id: 'audit-123', result: 'created' }
        });
        
        await elasticsearchAdapter.log(event);
        
        expect(mockClient.index).toHaveBeenCalledWith({
          index: 'audit-logs',
          id: event.id,
          body: {
            ...event,
            timestamp: event.timestamp.toISOString()
          }
        });
      });

      it('should handle audit event without ID', async () => {
        // TDD RED: Test handles event without ID
        const event: AuditEvent = {
          id: '',
          timestamp: new Date(),
          action: 'UPDATE',
          entityType: 'User',
          entityId: 'user-123',
          userId: 'admin-456',
          details: { name: 'Jane Doe' }
        };
        
        mockClient.index.mockResolvedValue({
          body: { _id: 'auto-generated-id', result: 'created' }
        });
        
        await elasticsearchAdapter.log(event);
        
        expect(mockClient.index).toHaveBeenCalledWith({
          index: 'audit-logs',
          body: {
            ...event,
            timestamp: event.timestamp.toISOString()
          }
        });
      });

      it('should handle audit event with custom index', async () => {
        // TDD RED: Test handles custom index
        const event: AuditEvent = {
          id: 'audit-123',
          timestamp: new Date(),
          action: 'DELETE',
          entityType: 'User',
          entityId: 'user-123',
          userId: 'admin-456',
          details: { reason: 'Account closure' }
        };
        const options: AuditOptions = {
          index: 'custom-audit-logs'
        };
        
        mockClient.index.mockResolvedValue({
          body: { _id: 'audit-123', result: 'created' }
        });
        
        await elasticsearchAdapter.log(event, options);
        
        expect(mockClient.index).toHaveBeenCalledWith({
          index: 'custom-audit-logs',
          id: event.id,
          body: {
            ...event,
            timestamp: event.timestamp.toISOString()
          }
        });
      });

      it('should handle audit event with retention period', async () => {
        // TDD RED: Test handles retention period
        const event: AuditEvent = {
          id: 'audit-123',
          timestamp: new Date(),
          action: 'READ',
          entityType: 'User',
          entityId: 'user-123',
          userId: 'admin-456',
          details: { fields: ['name', 'email'] }
        };
        const options: AuditOptions = {
          retentionDays: 2555 // 7 years for GDPR
        };
        
        mockClient.index.mockResolvedValue({
          body: { _id: 'audit-123', result: 'created' }
        });
        
        await elasticsearchAdapter.log(event, options);
        
        expect(mockClient.index).toHaveBeenCalledWith({
          index: 'audit-logs',
          id: event.id,
          body: {
            ...event,
            timestamp: event.timestamp.toISOString(),
            retentionDate: expect.any(String)
          }
        });
      });
    });

    describe('logBatch method', () => {
      it('should have correct signature: logBatch(events: AuditEvent[], options?: AuditOptions): Promise<void>', async () => {
        // TDD RED: Test the method signature
        const events: AuditEvent[] = [
          {
            id: 'audit-123',
            timestamp: new Date(),
            action: 'CREATE',
            entityType: 'User',
            entityId: 'user-123',
            userId: 'admin-456',
            details: { name: 'John Doe' }
          }
        ];
        await elasticsearchAdapter.logBatch(events);
        expect(typeof elasticsearchAdapter.logBatch).toBe('function');
      });

      it('should log multiple audit events', async () => {
        // TDD RED: Test logs multiple events
        const events: AuditEvent[] = [
          {
            id: 'audit-123',
            timestamp: new Date(),
            action: 'CREATE',
            entityType: 'User',
            entityId: 'user-123',
            userId: 'admin-456',
            details: { name: 'John Doe' }
          },
          {
            id: 'audit-124',
            timestamp: new Date(),
            action: 'UPDATE',
            entityType: 'User',
            entityId: 'user-123',
            userId: 'admin-456',
            details: { name: 'John Smith' }
          }
        ];
        
        mockClient.bulk.mockResolvedValue({
          body: { items: [{ index: { _id: 'audit-123' } }, { index: { _id: 'audit-124' } }], errors: false }
        });
        
        await elasticsearchAdapter.logBatch(events);
        
        expect(mockClient.bulk).toHaveBeenCalledWith({
          body: [
            { index: { _index: 'audit-logs', _id: 'audit-123' } },
            {
              ...events[0],
              timestamp: events[0]!.timestamp.toISOString()
            },
            { index: { _index: 'audit-logs', _id: 'audit-124' } },
            {
              ...events[1],
              timestamp: events[1]!.timestamp.toISOString()
            }
          ]
        });
      });

      it('should handle empty events array', async () => {
        // TDD RED: Test handles empty array
        const events: AuditEvent[] = [];
        
        await elasticsearchAdapter.logBatch(events);
        
        expect(mockClient.bulk).not.toHaveBeenCalled();
      });

      it('should handle batch with mixed event types', async () => {
        // TDD RED: Test handles mixed event types
        const events: AuditEvent[] = [
          {
            id: 'audit-123',
            timestamp: new Date(),
            action: 'CREATE',
            entityType: 'User',
            entityId: 'user-123',
            userId: 'admin-456',
            details: { name: 'John Doe' }
          },
          {
            id: 'audit-124',
            timestamp: new Date(),
            action: 'CONSENT_GRANTED',
            entityType: 'Consent',
            entityId: 'consent-456',
            userId: 'user-123',
            details: { consentType: 'data_processing' }
          }
        ];
        
        mockClient.bulk.mockResolvedValue({
          body: { items: [{ index: { _id: 'audit-123' } }, { index: { _id: 'audit-124' } }], errors: false }
        });
        
        await elasticsearchAdapter.logBatch(events);
        
        expect(mockClient.bulk).toHaveBeenCalledWith({
          body: expect.arrayContaining([
            { index: { _index: 'audit-logs', _id: 'audit-123' } },
            { index: { _index: 'audit-logs', _id: 'audit-124' } }
          ])
        });
      });
    });
  });

  describe('IAuditQuery implementation', () => {
    it('should implement IAuditQuery interface', () => {
      // TDD RED: Test implements IAuditQuery
      expect(elasticsearchAdapter).toHaveProperty('query');
      expect(elasticsearchAdapter).toHaveProperty('export');
      expect(typeof elasticsearchAdapter.query).toBe('function');
      expect(typeof elasticsearchAdapter.export).toBe('function');
    });

    describe('query method', () => {
      it('should have correct signature: query(filter: AuditFilter, options?: AuditOptions): Promise<AuditEvent[]>', async () => {
        // TDD RED: Test the method signature
        const filter: AuditFilter = {
          userId: 'user-123',
          action: 'CREATE'
        };
        const result = await elasticsearchAdapter.query(filter);
        expect(typeof elasticsearchAdapter.query).toBe('function');
      });

      it('should query audit events by user ID', async () => {
        // TDD RED: Test queries by user ID
        const filter: AuditFilter = {
          userId: 'user-123'
        };
        const mockEvents: AuditEvent[] = [
          {
            id: 'audit-123',
            timestamp: new Date(),
            action: 'CREATE',
            entityType: 'User',
            entityId: 'user-123',
            userId: 'user-123',
            details: { name: 'John Doe' }
          }
        ];
        
        mockClient.search.mockResolvedValue({
          body: {
            hits: {
              total: { value: 1 },
              hits: [
                {
                  _id: 'audit-123',
                  _source: {
                    ...mockEvents[0],
                    timestamp: mockEvents[0]!.timestamp.toISOString()
                  }
                }
              ]
            }
          }
        });
        
        const result = await elasticsearchAdapter.query(filter);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject(mockEvents[0]!);
        expect(mockClient.search).toHaveBeenCalledWith({
          index: 'audit-logs',
          body: {
            query: {
              bool: {
                must: [
                  { term: { userId: 'user-123' } }
                ]
              }
            },
            sort: [{ timestamp: { order: 'desc' } }]
          }
        });
      });

      it('should query audit events by action', async () => {
        // TDD RED: Test queries by action
        const filter: AuditFilter = {
          action: 'DELETE'
        };
        const mockEvents: AuditEvent[] = [
          {
            id: 'audit-124',
            timestamp: new Date(),
            action: 'DELETE',
            entityType: 'User',
            entityId: 'user-456',
            userId: 'admin-789',
            details: { reason: 'Account closure' }
          }
        ];
        
        mockClient.search.mockResolvedValue({
          body: {
            hits: {
              total: { value: 1 },
              hits: [
                {
                  _id: 'audit-124',
                  _source: {
                    ...mockEvents[0],
                    timestamp: mockEvents[0]!.timestamp.toISOString()
                  }
                }
              ]
            }
          }
        });
        
        const result = await elasticsearchAdapter.query(filter);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject(mockEvents[0]!);
        expect(mockClient.search).toHaveBeenCalledWith({
          index: 'audit-logs',
          body: {
            query: {
              bool: {
                must: [
                  { term: { action: 'DELETE' } }
                ]
              }
            },
            sort: [{ timestamp: { order: 'desc' } }]
          }
        });
      });

      it('should query audit events by date range', async () => {
        // TDD RED: Test queries by date range
        const startDate = new Date('2023-01-01');
        const endDate = new Date('2023-12-31');
        const filter: AuditFilter = {
          startDate,
          endDate
        };
        
        mockClient.search.mockResolvedValue({
          body: {
            hits: {
              total: { value: 0 },
              hits: []
            }
          }
        });
        
        const result = await elasticsearchAdapter.query(filter);
        
        expect(result).toHaveLength(0);
        expect(mockClient.search).toHaveBeenCalledWith({
          index: 'audit-logs',
          body: {
            query: {
              bool: {
                must: [
                  {
                    range: {
                      timestamp: {
                        gte: startDate.toISOString(),
                        lte: endDate.toISOString()
                      }
                    }
                  }
                ]
              }
            },
            sort: [{ timestamp: { order: 'desc' } }]
          }
        });
      });

      it('should query audit events with pagination', async () => {
        // TDD RED: Test queries with pagination
        const filter: AuditFilter = {
          userId: 'user-123'
        };
        const options: AuditOptions = {
          limit: 10,
          offset: 20
        };
        
        mockClient.search.mockResolvedValue({
          body: {
            hits: {
              total: { value: 0 },
              hits: []
            }
          }
        });
        
        const result = await elasticsearchAdapter.query(filter, options);
        
        expect(result).toHaveLength(0);
        expect(mockClient.search).toHaveBeenCalledWith({
          index: 'audit-logs',
          body: {
            query: {
              bool: {
                must: [
                  { term: { userId: 'user-123' } }
                ]
              }
            },
            sort: [{ timestamp: { order: 'desc' } }],
            from: 20,
            size: 10
          }
        });
      });

      it('should handle complex filter combinations', async () => {
        // TDD RED: Test handles complex filters
        const filter: AuditFilter = {
          userId: 'user-123',
          action: 'UPDATE',
          entityType: 'User',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31')
        };
        
        mockClient.search.mockResolvedValue({
          body: {
            hits: {
              total: { value: 0 },
              hits: []
            }
          }
        });
        
        const result = await elasticsearchAdapter.query(filter);
        
        expect(result).toHaveLength(0);
        expect(mockClient.search).toHaveBeenCalledWith({
          index: 'audit-logs',
          body: {
            query: {
              bool: {
                must: [
                  { term: { userId: 'user-123' } },
                  { term: { action: 'UPDATE' } },
                  { term: { entityType: 'User' } },
                  {
                    range: {
                      timestamp: {
                        gte: filter.startDate!.toISOString(),
                        lte: filter.endDate!.toISOString()
                      }
                    }
                  }
                ]
              }
            },
            sort: [{ timestamp: { order: 'desc' } }]
          }
        });
      });
    });

    describe('export method', () => {
      it('should have correct signature: export(filter: AuditFilter, format: ExportFormat, options?: AuditOptions): Promise<string>', async () => {
        // TDD RED: Test the method signature
        const filter: AuditFilter = { userId: 'user-123' };
        const result = await elasticsearchAdapter.export(filter, 'JSON');
        expect(typeof elasticsearchAdapter.export).toBe('function');
      });

      it('should export audit events as JSON', async () => {
        // TDD RED: Test exports as JSON
        const filter: AuditFilter = {
          userId: 'user-123'
        };
        const mockEvents: AuditEvent[] = [
          {
            id: 'audit-123',
            timestamp: new Date(),
            action: 'CREATE',
            entityType: 'User',
            entityId: 'user-123',
            userId: 'user-123',
            details: { name: 'John Doe' }
          }
        ];
        
        mockClient.search.mockResolvedValue({
          body: {
            hits: {
              total: { value: 1 },
              hits: [
                {
                  _id: 'audit-123',
                  _source: {
                    ...mockEvents[0],
                    timestamp: mockEvents[0]!.timestamp.toISOString()
                  }
                }
              ]
            }
          }
        });
        
        const result = await elasticsearchAdapter.export(filter, 'JSON');
        
        expect(typeof result).toBe('string');
        const parsed = JSON.parse(result);
        expect(parsed).toHaveLength(1);
        expect(parsed[0]).toMatchObject({
          ...mockEvents[0]!,
          timestamp: mockEvents[0]!.timestamp.toISOString()
        });
      });

      it('should export audit events as CSV', async () => {
        // TDD RED: Test exports as CSV
        const filter: AuditFilter = {
          userId: 'user-123'
        };
        const mockEvents: AuditEvent[] = [
          {
            id: 'audit-123',
            timestamp: new Date('2023-01-01T00:00:00Z'),
            action: 'CREATE',
            entityType: 'User',
            entityId: 'user-123',
            userId: 'user-123',
            details: { name: 'John Doe' }
          }
        ];
        
        mockClient.search.mockResolvedValue({
          body: {
            hits: {
              total: { value: 1 },
              hits: [
                {
                  _id: 'audit-123',
                  _source: {
                    ...mockEvents[0],
                    timestamp: mockEvents[0]!.timestamp.toISOString()
                  }
                }
              ]
            }
          }
        });
        
        const result = await elasticsearchAdapter.export(filter, 'CSV');
        
        expect(typeof result).toBe('string');
        expect(result).toContain('id,timestamp,action,entityType,entityId,userId,details');
        expect(result).toContain('audit-123');
        expect(result).toContain('CREATE');
        expect(result).toContain('User');
      });

      it('should handle large result sets with scrolling', async () => {
        // TDD RED: Test handles large result sets
        const filter: AuditFilter = {
          userId: 'user-123'
        };
        const options: AuditOptions = {
          limit: 10000
        };
        
        // Mock scroll responses
        mockClient.search.mockResolvedValueOnce({
          body: {
            hits: {
              total: { value: 10000 },
              hits: Array.from({ length: 1000 }, (_, i) => ({
                _id: `audit-${i}`,
                _source: {
                  id: `audit-${i}`,
                  timestamp: new Date().toISOString(),
                  action: 'CREATE',
                  entityType: 'User',
                  entityId: 'user-123',
                  userId: 'user-123',
                  details: { name: 'John Doe' }
                }
              })),
              scroll_id: 'scroll-123'
            }
          }
        });
        
        mockClient.scroll.mockResolvedValue({
          body: {
            hits: {
              total: { value: 10000 },
              hits: [],
              scroll_id: 'scroll-123'
            }
          }
        });
        
        mockClient.clearScroll.mockResolvedValue({
          body: { succeeded: true }
        });
        
        const result = await elasticsearchAdapter.export(filter, 'JSON', options);
        
        expect(typeof result).toBe('string');
        expect(mockClient.search).toHaveBeenCalledWith({
          index: 'audit-logs',
          body: {
            query: {
              bool: {
                must: [
                  { term: { userId: 'user-123' } }
                ]
              }
            },
            sort: [{ timestamp: { order: 'desc' } }],
            size: 1000
          },
          scroll: '1m'
        });
        expect(mockClient.clearScroll).toHaveBeenCalledWith({
          scroll_id: 'scroll-123'
        });
      });
    });
  });

  describe('Connection Management', () => {
    it('should connect to Elasticsearch on initialization', async () => {
      // TDD RED: Test connects on init
      const adapter = new ElasticsearchAuditAdapter({
        node: 'http://localhost:9200',
        index: 'audit-logs'
      });
      
      expect(mockClient.ping).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      // TDD RED: Test connection errors
      mockClient.ping.mockRejectedValue(new Error('Connection failed'));
      
      const adapter = new ElasticsearchAuditAdapter({
        node: 'http://invalid:9200',
        index: 'audit-logs'
      });
      
      await expect(adapter.connect()).rejects.toThrow('Connection failed');
    });

    it('should close connection', async () => {
      // TDD RED: Test closes connection
      await elasticsearchAdapter.close();
      
      expect(mockClient.close).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle Elasticsearch errors gracefully', async () => {
      // TDD RED: Test error handling
      const event: AuditEvent = {
        id: 'audit-123',
        timestamp: new Date(),
        action: 'CREATE',
        entityType: 'User',
        entityId: 'user-123',
        userId: 'admin-456',
        details: { name: 'John Doe' }
      };
      
      mockClient.index.mockRejectedValue(new Error('Elasticsearch error'));
      
      await expect(elasticsearchAdapter.log(event)).rejects.toThrow('Elasticsearch error');
    });

    it('should handle bulk operation errors', async () => {
      // TDD RED: Test bulk operation errors
      const events: AuditEvent[] = [
        {
          id: 'audit-123',
          timestamp: new Date(),
          action: 'CREATE',
          entityType: 'User',
          entityId: 'user-123',
          userId: 'admin-456',
          details: { name: 'John Doe' }
        }
      ];
      
      mockClient.bulk.mockRejectedValue(new Error('Bulk operation failed'));
      
      await expect(elasticsearchAdapter.logBatch(events)).rejects.toThrow('Bulk operation failed');
    });

    it('should handle search errors', async () => {
      // TDD RED: Test search errors
      const filter: AuditFilter = {
        userId: 'user-123'
      };
      
      mockClient.search.mockRejectedValue(new Error('Search failed'));
      
      await expect(elasticsearchAdapter.query(filter)).rejects.toThrow('Search failed');
    });
  });

  describe('Performance', () => {
    it('should handle large batch operations efficiently', async () => {
      // TDD RED: Test large batch operations
      const events: AuditEvent[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `audit-${i}`,
        timestamp: new Date(),
        action: 'CREATE',
        entityType: 'User',
        entityId: `user-${i}`,
        userId: 'admin-456',
        details: { name: `User ${i}` }
      }));
      
      mockClient.bulk.mockResolvedValue({
        body: { items: events.map(e => ({ index: { _id: e.id } })), errors: false }
      });
      
      await elasticsearchAdapter.logBatch(events);
      
      expect(mockClient.bulk).toHaveBeenCalledWith({
        body: expect.arrayContaining([
          ...events.flatMap(event => [
            { index: { _index: 'audit-logs', _id: event.id } },
            {
              ...event,
              timestamp: event.timestamp.toISOString()
            }
          ])
        ])
      });
    });

    it('should handle concurrent operations', async () => {
      // TDD RED: Test concurrent operations
      const event1: AuditEvent = {
        id: 'audit-123',
        timestamp: new Date(),
        action: 'CREATE',
        entityType: 'User',
        entityId: 'user-123',
        userId: 'admin-456',
        details: { name: 'John Doe' }
      };
      
      const event2: AuditEvent = {
        id: 'audit-124',
        timestamp: new Date(),
        action: 'UPDATE',
        entityType: 'User',
        entityId: 'user-123',
        userId: 'admin-456',
        details: { name: 'John Smith' }
      };
      
      mockClient.index.mockResolvedValue({
        body: { _id: 'audit-123', result: 'created' }
      });
      
      // Run concurrent operations
      await Promise.all([
        elasticsearchAdapter.log(event1),
        elasticsearchAdapter.log(event2)
      ]);
      
      expect(mockClient.index).toHaveBeenCalledTimes(2);
    });
  });
});
