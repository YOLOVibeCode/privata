/**
 * @fileoverview TDD Tests for ModelRegistry
 * @description RED Phase - These tests should FAIL initially
 */

import { ModelRegistry } from '../../../src/models/ModelRegistry';

describe('ModelRegistry - TDD RED Phase', () => {
  let registry: ModelRegistry;

  beforeEach(() => {
    registry = new ModelRegistry();
  });

  describe('Model Registration', () => {
    it('should register a model with schema', () => {
      const userSchema = {
        identity: {
          firstName: { type: String, pii: true },
          lastName: { type: String, pii: true },
          email: { type: String, pii: true },
        },
        clinical: {
          diagnosis: { type: String, phi: true },
          medications: { type: [String], phi: true },
        },
        metadata: {
          createdAt: { type: Date },
          updatedAt: { type: Date },
        },
      };

      const model = registry.register('User', userSchema);

      expect(model).toBeDefined();
      expect(model.modelName).toBe('User');
      expect(model.schema).toEqual(userSchema);
    });

    it('should throw error when registering duplicate model', () => {
      const schema = {
        identity: { name: { type: String, pii: true } },
      };

      registry.register('User', schema);

      expect(() => registry.register('User', schema)).toThrow(
        'Model "User" is already registered'
      );
    });

    it('should validate schema has at least identity or clinical fields', () => {
      const invalidSchema = {
        metadata: { createdAt: { type: Date } },
      };

      expect(() => registry.register('Invalid', invalidSchema)).toThrow(
        'Schema must define at least identity or clinical fields'
      );
    });
  });

  describe('Model Retrieval', () => {
    it('should retrieve registered model', () => {
      const schema = {
        identity: { name: { type: String, pii: true } },
      };

      registry.register('User', schema);
      const model = registry.get('User');

      expect(model).toBeDefined();
      expect(model.modelName).toBe('User');
    });

    it('should throw error when retrieving non-existent model', () => {
      expect(() => registry.get('NonExistent')).toThrow(
        'Model "NonExistent" not found'
      );
    });

    it('should check if model exists', () => {
      const schema = {
        identity: { name: { type: String, pii: true } },
      };

      expect(registry.has('User')).toBe(false);
      registry.register('User', schema);
      expect(registry.has('User')).toBe(true);
    });
  });

  describe('Schema Classification', () => {
    it('should classify PII fields from schema', () => {
      const schema = {
        identity: {
          firstName: { type: String, pii: true },
          lastName: { type: String, pii: true },
          age: { type: Number, pii: false },
        },
      };

      const model = registry.register('User', schema);

      expect(model.getPIIFields()).toEqual(['firstName', 'lastName']);
    });

    it('should classify PHI fields from schema', () => {
      const schema = {
        clinical: {
          diagnosis: { type: String, phi: true },
          bloodType: { type: String, phi: true },
          height: { type: Number, phi: false },
        },
      };

      const model = registry.register('Patient', schema);

      expect(model.getPHIFields()).toEqual(['diagnosis', 'bloodType']);
    });

    it('should classify metadata fields', () => {
      const schema = {
        identity: { name: { type: String, pii: true } },
        metadata: {
          createdAt: { type: Date },
          version: { type: Number },
        },
      };

      const model = registry.register('User', schema);

      expect(model.getMetadataFields()).toEqual(['createdAt', 'version']);
    });
  });

  describe('Schema Validation', () => {
    it('should validate field types', () => {
      const schema = {
        identity: {
          name: { type: String, pii: true },
          age: { type: Number, pii: false },
          active: { type: Boolean },
        },
      };

      const model = registry.register('User', schema);

      expect(model.validateFieldType('name', 'John')).toBe(true);
      expect(model.validateFieldType('age', 25)).toBe(true);
      expect(model.validateFieldType('active', true)).toBe(true);

      expect(model.validateFieldType('name', 123)).toBe(false);
      expect(model.validateFieldType('age', 'not a number')).toBe(false);
    });

    it('should validate required fields', () => {
      const schema = {
        identity: {
          name: { type: String, pii: true, required: true },
          email: { type: String, pii: true, required: false },
        },
      };

      const model = registry.register('User', schema);

      expect(model.validateRequired({ name: 'John' })).toBe(true);
      expect(model.validateRequired({ email: 'john@example.com' })).toBe(false);
      expect(model.validateRequired({ name: 'John', email: 'john@example.com' })).toBe(true);
    });

    it('should validate data against full schema', () => {
      const schema = {
        identity: {
          name: { type: String, pii: true, required: true },
          age: { type: Number, pii: false, required: true },
        },
      };

      const model = registry.register('User', schema);

      const { valid, errors } = model.validate({
        name: 'John',
        age: 25,
      });

      expect(valid).toBe(true);
      expect(errors).toEqual([]);
    });

    it('should return validation errors for invalid data', () => {
      const schema = {
        identity: {
          name: { type: String, pii: true, required: true },
          age: { type: Number, pii: false, required: true },
        },
      };

      const model = registry.register('User', schema);

      const { valid, errors } = model.validate({
        name: 'John',
        // age missing
      });

      expect(valid).toBe(false);
      expect(errors).toContain('Field "age" is required');
    });
  });

  describe('Multiple Models', () => {
    it('should handle multiple registered models', () => {
      const userSchema = {
        identity: { name: { type: String, pii: true } },
      };

      const patientSchema = {
        clinical: { diagnosis: { type: String, phi: true } },
      };

      registry.register('User', userSchema);
      registry.register('Patient', patientSchema);

      expect(registry.has('User')).toBe(true);
      expect(registry.has('Patient')).toBe(true);
      expect(registry.getAllModels()).toHaveLength(2);
    });

    it('should return all registered model names', () => {
      registry.register('User', { identity: { name: { type: String, pii: true } } });
      registry.register('Patient', { clinical: { diagnosis: { type: String, phi: true } } });

      const modelNames = registry.getModelNames();

      expect(modelNames).toEqual(['User', 'Patient']);
    });
  });
});

