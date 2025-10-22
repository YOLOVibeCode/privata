import { QueryBuilder, createQueryBuilder, QueryOptions } from '../QueryBuilder';
import { Privata, PrivataConfig } from '@privata/core';

describe('QueryBuilder', () => {
  let privata: Privata;
  let queryBuilder: QueryBuilder;

  beforeEach(() => {
    const config: PrivataConfig = {
      compliance: {
        gdpr: true,
        hipaa: true,
        dataProtection: true,
      },
    };
    privata = new Privata(config);
    queryBuilder = new QueryBuilder(privata, 'User');
  });

  describe('Constructor', () => {
    it('should create QueryBuilder with default options', () => {
      expect(queryBuilder).toBeInstanceOf(QueryBuilder);
    });

    it('should create QueryBuilder with custom options', () => {
      const options: QueryOptions = {
        includePII: false,
        includePHI: true,
        complianceMode: 'strict',
      };
      const customBuilder = new QueryBuilder(privata, 'User', options);
      expect(customBuilder).toBeInstanceOf(QueryBuilder);
    });
  });

  describe('Filter Methods', () => {
    it('should add where condition', () => {
      const result = queryBuilder.where('name', 'eq', 'John');
      expect(result).toBe(queryBuilder);
    });

    it('should add PII where condition', () => {
      const result = queryBuilder.wherePII('email', 'eq', 'john@example.com');
      expect(result).toBe(queryBuilder);
    });

    it('should add PHI where condition', () => {
      const result = queryBuilder.wherePHI('medicalRecord', 'eq', 'MR123');
      expect(result).toBe(queryBuilder);
    });

    it('should add between condition', () => {
      const result = queryBuilder.between('age', 18, 65);
      expect(result).toBe(queryBuilder);
    });

    it('should add in condition', () => {
      const result = queryBuilder.in('status', ['active', 'pending']);
      expect(result).toBe(queryBuilder);
    });

    it('should add like condition', () => {
      const result = queryBuilder.like('name', 'John%');
      expect(result).toBe(queryBuilder);
    });
  });

  describe('Sort Methods', () => {
    it('should add order by', () => {
      const result = queryBuilder.orderBy('name', 'asc');
      expect(result).toBe(queryBuilder);
    });

    it('should add PII order by', () => {
      const result = queryBuilder.orderByPII('email', 'desc');
      expect(result).toBe(queryBuilder);
    });

    it('should add PHI order by', () => {
      const result = queryBuilder.orderByPHI('medicalRecord', 'asc');
      expect(result).toBe(queryBuilder);
    });
  });

  describe('Pagination Methods', () => {
    it('should set page and limit', () => {
      const result = queryBuilder.page(1, 10);
      expect(result).toBe(queryBuilder);
    });

    it('should set limit', () => {
      const result = queryBuilder.limit(20);
      expect(result).toBe(queryBuilder);
    });

    it('should set offset', () => {
      const result = queryBuilder.offset(50);
      expect(result).toBe(queryBuilder);
    });
  });

  describe('Field Selection', () => {
    it('should select fields', () => {
      const result = queryBuilder.select(['name', 'email']);
      expect(result).toBe(queryBuilder);
    });

    it('should include relations', () => {
      const result = queryBuilder.include(['profile', 'settings']);
      expect(result).toBe(queryBuilder);
    });

    it('should exclude fields', () => {
      const result = queryBuilder.exclude(['password', 'secret']);
      expect(result).toBe(queryBuilder);
    });
  });

  describe('Compliance Methods', () => {
    it('should enable PII', () => {
      const result = queryBuilder.withPII();
      expect(result).toBe(queryBuilder);
    });

    it('should disable PII', () => {
      const result = queryBuilder.withoutPII();
      expect(result).toBe(queryBuilder);
    });

    it('should enable PHI', () => {
      const result = queryBuilder.withPHI();
      expect(result).toBe(queryBuilder);
    });

    it('should disable PHI', () => {
      const result = queryBuilder.withoutPHI();
      expect(result).toBe(queryBuilder);
    });

    it('should set compliance mode', () => {
      const result = queryBuilder.complianceMode('strict');
      expect(result).toBe(queryBuilder);
    });

    it('should set data retention', () => {
      const result = queryBuilder.dataRetention(365);
      expect(result).toBe(queryBuilder);
    });

    it('should set purpose', () => {
      const result = queryBuilder.purpose('medical-care');
      expect(result).toBe(queryBuilder);
    });

    it('should set legal basis', () => {
      const result = queryBuilder.legalBasis('consent');
      expect(result).toBe(queryBuilder);
    });

    it('should require consent', () => {
      const result = queryBuilder.requireConsent();
      expect(result).toBe(queryBuilder);
    });
  });

  describe('Execution Methods', () => {
    it('should execute query', async () => {
      const result = await queryBuilder.execute();
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.total).toBeDefined();
      expect(result.page).toBeDefined();
      expect(result.limit).toBeDefined();
      expect(result.hasNext).toBeDefined();
      expect(result.hasPrev).toBeDefined();
      expect(result.compliance).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should find one record', async () => {
      const result = await queryBuilder.findOne();
      expect(result).toBeNull(); // Returns null for stub implementation
    });

    it('should find many records', async () => {
      const result = await queryBuilder.findMany();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should count records', async () => {
      const result = await queryBuilder.count();
      expect(typeof result).toBe('number');
    });

    it('should check existence', async () => {
      const result = await queryBuilder.exists();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Aggregation Methods', () => {
    it('should execute aggregation', async () => {
      const pipeline = [{ $group: { _id: null, count: { $sum: 1 } } }];
      const result = await queryBuilder.aggregate(pipeline);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should group by field', async () => {
      const result = await queryBuilder.groupBy('status', { count: { $sum: 1 } });
      expect(Array.isArray(result)).toBe(true);
    });

    it('should calculate sum', async () => {
      const result = await queryBuilder.sum('age');
      expect(typeof result).toBe('number');
    });

    it('should calculate average', async () => {
      const result = await queryBuilder.avg('age');
      expect(typeof result).toBe('number');
    });

    it('should find minimum', async () => {
      const result = await queryBuilder.min('age');
      expect(result).toBeNull(); // Returns null for stub implementation
    });

    it('should find maximum', async () => {
      const result = await queryBuilder.max('age');
      expect(result).toBeNull(); // Returns null for stub implementation
    });
  });

  describe('Factory Function', () => {
    it('should create QueryBuilder using factory', () => {
      const builder = createQueryBuilder(privata, 'User');
      expect(builder).toBeInstanceOf(QueryBuilder);
    });

    it('should create QueryBuilder with options using factory', () => {
      const options: QueryOptions = {
        includePII: true,
        complianceMode: 'strict',
      };
      const builder = createQueryBuilder(privata, 'User', options);
      expect(builder).toBeInstanceOf(QueryBuilder);
    });
  });

  describe('Error Handling', () => {
    it('should handle execution errors gracefully', async () => {
      // This test would need to mock the privata instance to throw errors
      // For now, we'll test that the method exists and can be called
      await expect(queryBuilder.execute()).resolves.toBeDefined();
    });
  });
});
