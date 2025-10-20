/**
 * ModelRegistry - Manages model schemas and validation
 * 
 * Provides centralized model registration and schema management
 * following TDD and ISP principles.
 */

export interface FieldDefinition {
  type: any;
  pii?: boolean;
  phi?: boolean;
  required?: boolean;
  default?: any;
}

export interface SchemaDefinition {
  identity?: Record<string, FieldDefinition>;
  clinical?: Record<string, FieldDefinition>;
  metadata?: Record<string, FieldDefinition>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class Model {
  constructor(
    public readonly modelName: string,
    public readonly schema: SchemaDefinition
  ) {}

  getPIIFields(): string[] {
    if (!this.schema.identity) return [];
    
    return Object.entries(this.schema.identity)
      .filter(([_, def]) => def.pii === true)
      .map(([fieldName, _]) => fieldName);
  }

  getPHIFields(): string[] {
    if (!this.schema.clinical) return [];
    
    return Object.entries(this.schema.clinical)
      .filter(([_, def]) => def.phi === true)
      .map(([fieldName, _]) => fieldName);
  }

  getMetadataFields(): string[] {
    if (!this.schema.metadata) return [];
    
    return Object.keys(this.schema.metadata);
  }

  validateFieldType(fieldName: string, value: any): boolean {
    // Find field in all sections
    let fieldDef: FieldDefinition | undefined;
    
    if (this.schema.identity && fieldName in this.schema.identity) {
      fieldDef = this.schema.identity[fieldName];
    } else if (this.schema.clinical && fieldName in this.schema.clinical) {
      fieldDef = this.schema.clinical[fieldName];
    } else if (this.schema.metadata && fieldName in this.schema.metadata) {
      fieldDef = this.schema.metadata[fieldName];
    }

    if (!fieldDef) return false;

    // Check type
    const expectedType = fieldDef.type;
    
    if (expectedType === String) {
      return typeof value === 'string';
    } else if (expectedType === Number) {
      return typeof value === 'number';
    } else if (expectedType === Boolean) {
      return typeof value === 'boolean';
    } else if (expectedType === Date) {
      return value instanceof Date;
    }

    return true;
  }

  validateRequired(data: Record<string, any>): boolean {
    const requiredFields: string[] = [];

    // Collect all required fields
    if (this.schema.identity) {
      Object.entries(this.schema.identity).forEach(([fieldName, def]) => {
        if (def.required) {
          requiredFields.push(fieldName);
        }
      });
    }

    if (this.schema.clinical) {
      Object.entries(this.schema.clinical).forEach(([fieldName, def]) => {
        if (def.required) {
          requiredFields.push(fieldName);
        }
      });
    }

    // Check if all required fields are present
    return requiredFields.every(field => field in data && data[field] !== undefined && data[field] !== null);
  }

  validate(data: Record<string, any>): ValidationResult {
    const errors: string[] = [];

    // Collect all fields with their definitions
    const allFields: Record<string, FieldDefinition> = {
      ...this.schema.identity,
      ...this.schema.clinical,
      ...this.schema.metadata,
    };

    // Check required fields
    Object.entries(allFields).forEach(([fieldName, def]) => {
      if (def.required) {
        if (!(fieldName in data) || data[fieldName] === undefined || data[fieldName] === null) {
          errors.push(`Field "${fieldName}" is required`);
        }
      }
    });

    // Check field types
    Object.entries(data).forEach(([fieldName, value]) => {
      if (fieldName in allFields) {
        if (!this.validateFieldType(fieldName, value)) {
          errors.push(`Field "${fieldName}" has invalid type`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export class ModelRegistry {
  private models: Map<string, Model> = new Map();

  register(modelName: string, schema: SchemaDefinition): Model {
    // Check if already registered
    if (this.models.has(modelName)) {
      throw new Error(`Model "${modelName}" is already registered`);
    }

    // Validate schema has at least identity or clinical
    if (!schema.identity && !schema.clinical) {
      throw new Error('Schema must define at least identity or clinical fields');
    }

    // Create and store model
    const model = new Model(modelName, schema);
    this.models.set(modelName, model);

    return model;
  }

  get(modelName: string): Model {
    const model = this.models.get(modelName);
    
    if (!model) {
      throw new Error(`Model "${modelName}" not found`);
    }

    return model;
  }

  has(modelName: string): boolean {
    return this.models.has(modelName);
  }

  getAllModels(): Model[] {
    return Array.from(this.models.values());
  }

  getModelNames(): string[] {
    return Array.from(this.models.keys());
  }
}

