import { Privata, PrivataConfig, UserContext } from '../index';

describe('Privata Core', () => {
  let privata: Privata;
  let config: PrivataConfig;

  beforeEach(() => {
    config = {
      compliance: {
        gdpr: true,
        hipaa: true,
        dataProtection: true,
      },
    };
    privata = new Privata(config);
  });

  describe('Constructor', () => {
    it('should create Privata instance with valid config', () => {
      expect(privata).toBeInstanceOf(Privata);
    });

    it('should throw error for invalid config', () => {
      expect(() => new Privata(null as any)).toThrow('Privata configuration is required');
    });
  });

  describe('Model Creation', () => {
    it('should create model with schema', () => {
      const schema = {
        name: { type: String, pii: true },
        email: { type: String, pii: true },
      };
      
      const model = privata.model('User', schema);
      expect(model).toBeDefined();
      expect(model.findById).toBeInstanceOf(Function);
      expect(model.find).toBeInstanceOf(Function);
      expect(model.create).toBeInstanceOf(Function);
      expect(model.update).toBeInstanceOf(Function);
      expect(model.delete).toBeInstanceOf(Function);
      expect(model.gdpr).toBeDefined();
    });

    it('should return same model instance for same name', () => {
      const schema = { name: String };
      const model1 = privata.model('User', schema);
      const model2 = privata.model('User', schema);
      expect(model1).toBe(model2);
    });
  });

  describe('GDPR Rights', () => {
    let model: any;
    const context: UserContext = {
      userId: 'test-user-123',
      region: 'EU',
      permissions: ['read', 'write'],
      consent: { marketing: true, analytics: false },
    };

    beforeEach(() => {
      const schema = {
        name: { type: String, pii: true },
        email: { type: String, pii: true },
      };
      model = privata.model('User', schema);
    });

    it('should execute right to access', async () => {
      const result = await model.gdpr.rightToAccess('user-123', context);
      expect(result).toBeDefined();
      expect(result.userId).toBe('user-123');
    });

    it('should execute right to erasure', async () => {
      await expect(model.gdpr.rightToErasure('user-123', context)).resolves.not.toThrow();
    });

    it('should execute right to rectification', async () => {
      const data = { name: 'Updated Name' };
      const result = await model.gdpr.rightToRectification('user-123', data, context);
      expect(result).toBeDefined();
      expect(result.userId).toBe('user-123');
    });

    it('should execute right to portability', async () => {
      const result = await model.gdpr.rightToPortability('user-123', context);
      expect(result).toBeDefined();
      expect(result.userId).toBe('user-123');
    });
  });

  describe('Query Operations', () => {
    let model: any;

    beforeEach(() => {
      const schema = {
        name: { type: String, pii: true },
        age: { type: Number },
      };
      model = privata.model('User', schema);
    });

    it('should execute findById', async () => {
      const result = await model.findById('user-123');
      expect(result).toBeNull(); // Returns null for stub implementation
    });

    it('should execute find', async () => {
      const result = await model.find({ name: 'John' });
      expect(Array.isArray(result)).toBe(true);
    });

    it('should execute create', async () => {
      const data = { name: 'John', age: 30 };
      const result = await model.create(data);
      expect(result).toBeNull(); // Returns null for stub implementation
    });

    it('should execute update', async () => {
      const data = { name: 'John Updated' };
      const result = await model.update('user-123', data);
      expect(result).toBeNull(); // Returns null for stub implementation
    });

    it('should execute delete', async () => {
      const result = await model.delete('user-123');
      expect(result).toBeNull(); // Returns null for stub implementation
    });
  });

  describe('Compliance Validation', () => {
    it('should validate PII access', async () => {
      await expect(privata.validatePIIAccess({
        purpose: 'data-access',
        legalBasis: 'consent',
        consentRequired: true,
      })).resolves.not.toThrow();
    });

    it('should validate PHI access', async () => {
      await expect(privata.validatePHIAccess({
        purpose: 'medical-care',
        legalBasis: 'vital-interests',
        consentRequired: true,
      })).resolves.not.toThrow();
    });
  });

  describe('Query with Compliance', () => {
    it('should execute query with compliance', async () => {
      const result = await privata.queryWithCompliance('User', { name: 'John' }, {
        includePII: true,
        complianceMode: 'strict',
      });
      
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.total).toBeDefined();
      expect(result.hasNext).toBeDefined();
      expect(result.hasPrev).toBeDefined();
    });
  });

  describe('Aggregation', () => {
    it('should execute aggregation with compliance', async () => {
      const pipeline = [{ $group: { _id: null, count: { $sum: 1 } } }];
      const result = await privata.aggregateWithCompliance('User', pipeline, {}, {
        includePII: false,
        complianceMode: 'relaxed',
      });
      
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
