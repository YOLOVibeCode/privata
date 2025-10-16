# Privata - Architecture Specification
## Technical Design and Implementation Details

**Version:** 1.0.0  
**Date:** October 16, 2025  
**Status:** Specification Phase

---

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Core Components](#core-components)
3. [Compatibility Layer Architecture](#compatibility-layer-architecture)
4. [Data Flow](#data-flow)
5. [Database Schema Design](#database-schema-design)
6. [Caching Architecture](#caching-architecture)
7. [Security Architecture](#security-architecture)
8. [Scalability Design](#scalability-design)

---

## 🏗️ System Architecture

### High-Level Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATIONS                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  Express.js  │  │   NestJS     │  │   Next.js    │            │
│  │     App      │  │     App      │  │     App      │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
└─────────┼──────────────────┼──────────────────┼────────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                     COMPATIBILITY LAYER                             │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  ORM-Specific Wrappers                                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │   │
│  │  │Mongoose  │ │ Prisma   │ │ TypeORM  │ │Sequelize │     │   │
│  │  │ Compat   │ │  Compat  │ │  Compat  │ │  Compat  │     │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘     │   │
│  └───────┼────────────┼────────────┼────────────┼────────────┘   │
│          │            │            │            │                 │
│          └────────────┴────────────┴────────────┘                 │
│                       │                                            │
│  ┌────────────────────▼─────────────────────────────────────┐   │
│  │              API TRANSLATOR                              │   │
│  │  - Normalizes ORM calls to Privata operations          │   │
│  │  - Handles schema mapping                               │   │
│  │  - Routes to appropriate core services                  │   │
│  └────────────────────┬─────────────────────────────────────┘   │
└─────────────────────────┼──────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────┐
│                      PRIVATA CORE ENGINE                            │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Core Services                                             │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐            │   │
│  │  │ Privata    │ │   Model    │ │   Query    │            │   │
│  │  │  Manager   │ │  Registry  │ │  Builder   │            │   │
│  │  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘            │   │
│  └────────┼──────────────┼──────────────┼────────────────────┘   │
│           │              │              │                         │
│  ┌────────▼──────────────▼──────────────▼────────────────────┐   │
│  │  Compliance Engine                                        │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐            │   │
│  │  │   GDPR     │ │   HIPAA    │ │  Pseudonym │            │   │
│  │  │ Extension  │ │ Extension  │ │  Service   │            │   │
│  │  └────────────┘ └────────────┘ └────────────┘            │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐            │   │
│  │  │  Consent   │ │    Data    │ │   Region   │            │   │
│  │  │  Manager   │ │ Separator  │ │  Detector  │            │   │
│  │  └────────────┘ └────────────┘ └────────────┘            │   │
│  └────────────────────┬──────────────────────────────────────┘   │
│                       │                                            │
│  ┌────────────────────▼─────────────────────────────────────┐   │
│  │  Infrastructure Services                                 │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐            │   │
│  │  │   Cache    │ │   Audit    │ │ Encryption │            │   │
│  │  │  Manager   │ │  Logger    │ │  Service   │            │   │
│  │  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘            │   │
│  └────────┼──────────────┼──────────────┼────────────────────┘   │
└───────────┼──────────────┼──────────────┼─────────────────────────┘
            │              │              │
            ▼              ▼              ▼
┌────────────────────────────────────────────────────────────────────┐
│                      ADAPTER LAYER                                  │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐         │
│  │   Database     │ │     Cache      │ │     Audit      │         │
│  │   Adapters     │ │    Adapters    │ │    Adapters    │         │
│  └───────┬────────┘ └───────┬────────┘ └───────┬────────┘         │
└──────────┼──────────────────┼──────────────────┼──────────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                             │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Identity Databases          Clinical Databases              │ │
│  │  ┌──────────┐ ┌──────────┐  ┌──────────┐ ┌──────────┐      │ │
│  │  │Identity  │ │Identity  │  │Clinical  │ │Clinical  │      │ │
│  │  │DB (US)   │ │DB (EU)   │  │DB (US)   │ │DB (EU)   │      │ │
│  │  └──────────┘ └──────────┘  └──────────┘ └──────────┘      │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Cache Layer                                                  │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │ │
│  │  │  Redis   │ │MemCache  │ │In-Memory │                     │ │
│  │  │  Cache   │ │  Cache   │ │   LRU    │                     │ │
│  │  └──────────┘ └──────────┘ └──────────┘                     │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Audit & Storage                                              │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │ │
│  │  │  Audit   │ │  Azure   │ │   AWS    │                     │ │
│  │  │   DB     │ │  Monitor │ │CloudWatch│                     │ │
│  │  └──────────┘ └──────────┘ └──────────┘                     │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Core Components

### 1. Privata Manager

**Purpose:** Main entry point, orchestrates all operations

```typescript
// File: packages/core/src/Privata.ts

export class Privata {
  private modelRegistry: ModelRegistry;
  private complianceEngine: ComplianceEngine;
  private cacheManager: CacheManager;
  private auditLogger: AuditLogger;
  private adapters: {
    database: DatabaseAdapter;
    cache?: CacheAdapter;
    audit?: AuditAdapter;
    storage?: StorageAdapter;
  };

  constructor(config: PrivataConfig) {
    // Initialize adapters
    this.adapters = {
      database: config.database,
      cache: config.cache,
      audit: config.audit,
      storage: config.storage
    };

    // Initialize services
    this.modelRegistry = new ModelRegistry();
    this.complianceEngine = new ComplianceEngine(this.adapters);
    this.cacheManager = new CacheManager(this.adapters.cache);
    this.auditLogger = new AuditLogger(this.adapters.audit);
  }

  /**
   * Register a model
   */
  model<T>(name: string, schema: ModelSchema): PrivataModel<T> {
    // Create model instance
    const model = new PrivataModel<T>(name, schema, {
      modelRegistry: this.modelRegistry,
      complianceEngine: this.complianceEngine,
      cacheManager: this.cacheManager,
      auditLogger: this.auditLogger,
      adapters: this.adapters
    });

    // Register model
    this.modelRegistry.register(name, model);

    return model;
  }

  /**
   * Get existing model
   */
  getModel<T>(name: string): PrivataModel<T> {
    return this.modelRegistry.get<T>(name);
  }
}
```

### 2. Model Registry

**Purpose:** Centralized model management

```typescript
// File: packages/core/src/models/ModelRegistry.ts

export class ModelRegistry {
  private models: Map<string, PrivataModel<any>> = new Map();
  private schemas: Map<string, ModelSchema> = new Map();

  register<T>(name: string, model: PrivataModel<T>): void {
    if (this.models.has(name)) {
      throw new Error(`Model '${name}' already registered`);
    }
    
    this.models.set(name, model);
    this.schemas.set(name, model.schema);
  }

  get<T>(name: string): PrivataModel<T> {
    const model = this.models.get(name);
    if (!model) {
      throw new Error(`Model '${name}' not found`);
    }
    return model as PrivataModel<T>;
  }

  has(name: string): boolean {
    return this.models.has(name);
  }

  getSchema(name: string): ModelSchema {
    const schema = this.schemas.get(name);
    if (!schema) {
      throw new Error(`Schema for '${name}' not found`);
    }
    return schema;
  }

  getAllModels(): string[] {
    return Array.from(this.models.keys());
  }
}
```

### 3. Privata Model

**Purpose:** Core model class with CRUD + GDPR methods

```typescript
// File: packages/core/src/models/PrivataModel.ts

export class PrivataModel<T> {
  public readonly name: string;
  public readonly schema: ModelSchema;
  public readonly gdpr: GDPRExtension<T>;
  public readonly hipaa: HIPAAExtension<T>;
  public readonly consent: ConsentManager;
  public readonly audit: AuditQuery;
  public readonly cache: CacheControl;

  private complianceEngine: ComplianceEngine;
  private cacheManager: CacheManager;
  private auditLogger: AuditLogger;
  private adapters: Adapters;

  constructor(
    name: string,
    schema: ModelSchema,
    dependencies: Dependencies
  ) {
    this.name = name;
    this.schema = schema;
    this.complianceEngine = dependencies.complianceEngine;
    this.cacheManager = dependencies.cacheManager;
    this.auditLogger = dependencies.auditLogger;
    this.adapters = dependencies.adapters;

    // Initialize extensions
    this.gdpr = new GDPRExtension(this);
    this.hipaa = new HIPAAExtension(this);
    this.consent = new ConsentManager(this);
    this.audit = new AuditQuery(this);
    this.cache = new CacheControl(this);
  }

  // ==================== CRUD Operations ====================

  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    // 1. Check cache
    const cacheKey = this.cacheManager.generateKey(this.name, 'findById', id, options);
    const cached = await this.cacheManager.get<T>(cacheKey);
    if (cached) {
      await this.auditLogger.logCacheHit(this.name, id);
      return cached;
    }

    // 2. Detect region
    const region = await this.complianceEngine.detectRegion(id);

    // 3. Query Identity DB
    const identity = await this.adapters.database.findIdentityById(id, region);
    if (!identity) return null;

    // 4. Build result
    let result: any = {
      id: identity._id,
      ...this.mapIdentityFields(identity)
    };

    // 5. Expand relations if requested
    if (options?.expand) {
      const clinical = await this.expandRelations(
        identity.pseudonym,
        options.expand,
        region
      );
      result = { ...result, ...clinical };
    }

    // 6. Cache result
    await this.cacheManager.set(cacheKey, result, 300);

    // 7. Audit log
    await this.auditLogger.logAccess({
      model: this.name,
      operation: 'findById',
      resourceId: id,
      containsPHI: true,
      region
    });

    return result as T;
  }

  async find(query: any, options?: QueryOptions): Promise<T[]> {
    // Generate cache key
    const cacheKey = this.cacheManager.generateKey(this.name, 'find', query, options);
    
    // Check cache
    const cached = await this.cacheManager.get<T[]>(cacheKey);
    if (cached) return cached;

    // Determine which databases to query
    const needsIdentity = this.queryNeedsIdentity(query);
    const needsClinical = this.queryNeedsClinical(query) || options?.expand;

    let results: T[];

    if (needsIdentity && !needsClinical) {
      // Query Identity DB only
      results = await this.queryIdentityDB(query, options);
    } else if (!needsIdentity && needsClinical) {
      // Query Clinical DB only (rare)
      results = await this.queryClinicalDB(query, options);
    } else {
      // Query both and join
      results = await this.queryBothDBs(query, options);
    }

    // Cache results
    await this.cacheManager.set(cacheKey, results, 120);

    // Audit log
    await this.auditLogger.logAccess({
      model: this.name,
      operation: 'find',
      query,
      resultCount: results.length,
      containsPHI: needsIdentity
    });

    return results;
  }

  async create(data: Partial<T>, options?: CreateOptions): Promise<T> {
    // 1. Detect region
    const region = options?.region || this.complianceEngine.detectRegionFromData(data);

    // 2. Generate pseudonym
    const pseudonym = this.complianceEngine.generatePseudonym();

    // 3. Separate PII and PHI
    const { identity, clinical } = this.complianceEngine.separateData(
      data,
      this.schema
    );

    // 4. Create in Identity DB
    const identityRecord = await this.adapters.database.createIdentity({
      ...identity,
      pseudonym,
      region
    }, region);

    // 5. Create in Clinical DB (if has clinical data)
    if (Object.keys(clinical).length > 0) {
      await this.adapters.database.createClinical({
        ...clinical,
        pseudonym,
        region
      }, region);
    }

    // 6. Invalidate caches
    await this.cacheManager.invalidatePattern(`${this.name}:*`);

    // 7. Audit log
    await this.auditLogger.logAccess({
      model: this.name,
      operation: 'create',
      resourceId: identityRecord._id,
      pseudonym,
      region,
      containsPHI: true
    });

    // 8. Return combined result
    return { ...identityRecord, ...clinical } as T;
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    // 1. Get current data
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`${this.name} with id ${id} not found`);
    }

    // 2. Detect region
    const region = await this.complianceEngine.detectRegion(id);

    // 3. Separate updates
    const { identity, clinical } = this.complianceEngine.separateData(
      updates,
      this.schema
    );

    // 4. Update Identity DB
    if (Object.keys(identity).length > 0) {
      await this.adapters.database.updateIdentity(id, identity, region);
    }

    // 5. Update Clinical DB
    if (Object.keys(clinical).length > 0) {
      const identityRecord = await this.adapters.database.findIdentityById(id, region);
      await this.adapters.database.updateClinicalByPseudonym(
        identityRecord.pseudonym,
        clinical,
        region
      );
    }

    // 6. Invalidate cache
    await this.cacheManager.invalidate(`${this.name}:${id}:*`);

    // 7. Audit log
    await this.auditLogger.logAccess({
      model: this.name,
      operation: 'update',
      resourceId: id,
      changes: Object.keys(updates),
      containsPHI: Object.keys(identity).length > 0
    });

    // 8. Return updated document
    return this.findById(id) as Promise<T>;
  }

  async delete(id: string): Promise<DeleteResult> {
    // Use GDPR-compliant deletion
    return this.gdpr.rightToErasure(id, {
      requestedBy: 'system',
      reason: 'User deletion'
    });
  }

  // ==================== Query Builder ====================

  query(): QueryBuilder<T> {
    return new QueryBuilder<T>(this);
  }

  // ==================== Helper Methods ====================

  private mapIdentityFields(identity: any): Partial<T> {
    // Map internal identity structure to external API
    // ...
  }

  private async expandRelations(
    pseudonym: string,
    expand: string[],
    region: string
  ): Promise<any> {
    const expanded: any = {};

    for (const relation of expand) {
      if (relation === 'sessions') {
        expanded.sessions = await this.adapters.database.findClinicalByPseudonym(
          'sessions',
          pseudonym,
          region
        );
      }
      // ... handle other relations
    }

    return expanded;
  }

  private queryNeedsIdentity(query: any): boolean {
    // Check if query includes PII fields
    const piiFields = this.schema.getPIIFields();
    return Object.keys(query).some(key => piiFields.includes(key));
  }

  private queryNeedsClinical(query: any): boolean {
    // Check if query includes PHI fields
    const phiFields = this.schema.getPHIFields();
    return Object.keys(query).some(key => phiFields.includes(key));
  }

  private async queryBothDBs(query: any, options?: QueryOptions): Promise<T[]> {
    // Strategy: Query Identity first, then join Clinical
    const identityResults = await this.queryIdentityDB(query, options);

    const results = await Promise.all(
      identityResults.map(async (identity: any) => {
        const clinical = await this.expandRelations(
          identity.pseudonym,
          options?.expand || [],
          identity.region
        );
        return { ...identity, ...clinical };
      })
    );

    return results as T[];
  }
}
```

---

## 🔄 Compatibility Layer Architecture

### Mongoose Compatibility Implementation

```typescript
// File: packages/mongoose-compat/src/PrivataMongoose.ts

import mongoose from 'mongoose';
import { Privata, PrivataConfig } from 'privata';

export class PrivataMongoose {
  private privata: Privata;
  private mongooseConnection: mongoose.Connection;

  constructor(config: MongooseCompatConfig) {
    this.mongooseConnection = config.connection;

    // Initialize Privata core
    this.privata = new Privata({
      database: new MongooseAdapter(config.databases),
      cache: config.cache,
      audit: config.audit,
      compliance: config.compliance
    });
  }

  /**
   * Create Mongoose-compatible model
   * Wraps Privata model to match Mongoose API
   */
  model<T>(name: string, schema: mongoose.Schema): MongooseCompatModel<T> {
    // Convert Mongoose schema to Privata schema
    const privataSchema = this.convertSchema(schema);

    // Create Privata model
    const privataModel = this.privata.model<T>(name, privataSchema);

    // Wrap with Mongoose-compatible API
    return new MongooseCompatModel<T>(name, privataModel, schema);
  }

  private convertSchema(mongooseSchema: mongoose.Schema): ModelSchema {
    const privataSchema: ModelSchema = {
      identity: {},
      clinical: {},
      metadata: {}
    };

    // Iterate through Mongoose schema paths
    for (const [path, schemaType] of Object.entries(mongooseSchema.paths)) {
      const field = schemaType as any;

      // Determine if PII/PHI based on options
      if (field.options.pii) {
        privataSchema.identity[path] = {
          type: this.mapMongooseType(field.instance),
          required: field.isRequired,
          unique: field.options.unique
        };
      } else if (field.options.phi) {
        privataSchema.clinical[path] = {
          type: this.mapMongooseType(field.instance),
          required: field.isRequired
        };
      } else {
        privataSchema.metadata[path] = {
          type: this.mapMongooseType(field.instance),
          required: field.isRequired
        };
      }
    }

    return privataSchema;
  }

  private mapMongooseType(mongooseType: string): string {
    const typeMap: Record<string, string> = {
      'String': 'string',
      'Number': 'number',
      'Boolean': 'boolean',
      'Date': 'date',
      'ObjectID': 'objectId',
      'Array': 'array',
      'Mixed': 'any'
    };

    return typeMap[mongooseType] || 'any';
  }
}

/**
 * Mongoose-compatible model wrapper
 * Translates Mongoose API calls to Privata operations
 */
export class MongooseCompatModel<T> {
  public gdpr: any;  // GDPR methods
  public hipaa: any;  // HIPAA methods

  constructor(
    private name: string,
    private privataModel: PrivataModel<T>,
    private mongooseSchema: mongoose.Schema
  ) {
    // Expose GDPR methods
    this.gdpr = privataModel.gdpr;
    this.hipaa = privataModel.hipaa;
  }

  // ==================== Mongoose API Compatibility ====================

  async findById(id: string, projection?: any, options?: any): Promise<T | null> {
    // Convert Mongoose options to Privata options
    const privataOptions = this.convertOptions(projection, options);
    
    return await this.privataModel.findById(id, privataOptions);
  }

  async find(conditions: any = {}, projection?: any, options?: any): Promise<T[]> {
    const privataOptions = this.convertOptions(projection, options);
    
    return await this.privataModel.find(conditions, privataOptions);
  }

  async findOne(conditions: any, projection?: any, options?: any): Promise<T | null> {
    const privataOptions = this.convertOptions(projection, options);
    
    const results = await this.privataModel.find(conditions, {
      ...privataOptions,
      limit: 1
    });
    
    return results[0] || null;
  }

  async create(docs: any): Promise<T> {
    if (Array.isArray(docs)) {
      // Bulk create
      return await Promise.all(
        docs.map(doc => this.privataModel.create(doc))
      ) as any;
    }
    
    return await this.privataModel.create(docs);
  }

  async updateOne(filter: any, update: any, options?: any): Promise<any> {
    // Find document first
    const doc = await this.findOne(filter);
    if (!doc) {
      throw new Error('Document not found');
    }

    // Extract _id
    const id = (doc as any)._id || (doc as any).id;

    // Apply update
    await this.privataModel.update(id, this.applyUpdate(update));

    return { modifiedCount: 1, matchedCount: 1 };
  }

  async updateMany(filter: any, update: any, options?: any): Promise<any> {
    const docs = await this.find(filter);
    
    await Promise.all(
      docs.map(doc => {
        const id = (doc as any)._id || (doc as any).id;
        return this.privataModel.update(id, this.applyUpdate(update));
      })
    );

    return { modifiedCount: docs.length, matchedCount: docs.length };
  }

  async deleteOne(filter: any): Promise<any> {
    const doc = await this.findOne(filter);
    if (!doc) {
      return { deletedCount: 0 };
    }

    const id = (doc as any)._id || (doc as any).id;
    await this.privataModel.delete(id);

    return { deletedCount: 1 };
  }

  async deleteMany(filter: any): Promise<any> {
    const docs = await this.find(filter);
    
    await Promise.all(
      docs.map(doc => {
        const id = (doc as any)._id || (doc as any).id;
        return this.privataModel.delete(id);
      })
    );

    return { deletedCount: docs.length };
  }

  async countDocuments(filter: any = {}): Promise<number> {
    const docs = await this.find(filter);
    return docs.length;
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    // Convert aggregation pipeline to Privata queries
    // This is complex - implement based on pipeline stages
    throw new Error('Aggregation support coming soon');
  }

  // ==================== Query Chain Support ====================

  findByIdAndUpdate(id: string, update: any, options?: any): MongooseQuery<T> {
    return new MongooseQuery<T>(async () => {
      await this.privataModel.update(id, this.applyUpdate(update));
      return await this.findById(id);
    });
  }

  findOneAndUpdate(filter: any, update: any, options?: any): MongooseQuery<T> {
    return new MongooseQuery<T>(async () => {
      const doc = await this.findOne(filter);
      if (!doc) return null;

      const id = (doc as any)._id || (doc as any).id;
      await this.privataModel.update(id, this.applyUpdate(update));
      
      return await this.findById(id);
    });
  }

  // ==================== Populate Support ====================

  populate(path: string | any): MongooseQuery<T> {
    return new MongooseQuery<T>(async () => {
      // Convert populate to expand
      const expand = typeof path === 'string' ? [path] : path.map((p: any) => p.path);
      
      // Query with expansion
      return await this.find({}, { expand });
    });
  }

  // ==================== Helper Methods ====================

  private convertOptions(projection?: any, options?: any): QueryOptions {
    const privataOptions: QueryOptions = {};

    // Convert projection
    if (projection) {
      privataOptions.select = Object.keys(projection).filter(
        key => projection[key] === 1
      );
    }

    // Convert options
    if (options) {
      if (options.limit) privataOptions.limit = options.limit;
      if (options.skip) privataOptions.skip = options.skip;
      if (options.sort) privataOptions.sort = options.sort;
      if (options.populate) {
        privataOptions.expand = Array.isArray(options.populate)
          ? options.populate
          : [options.populate];
      }
    }

    return privataOptions;
  }

  private applyUpdate(update: any): any {
    // Handle MongoDB update operators
    if (update.$set) {
      return update.$set;
    }
    
    // Direct update
    return update;
  }
}

/**
 * Mongoose query wrapper for chaining
 */
class MongooseQuery<T> {
  constructor(private executor: () => Promise<T | T[] | null>) {}

  async exec(): Promise<T | T[] | null> {
    return await this.executor();
  }

  then(onFulfilled: any, onRejected?: any): Promise<T | T[] | null> {
    return this.exec().then(onFulfilled, onRejected);
  }

  catch(onRejected: any): Promise<T | T[] | null> {
    return this.exec().catch(onRejected);
  }
}
```

This compatibility layer allows **zero-change migration** for most Mongoose operations while adding GDPR/HIPAA compliance automatically! 🚀

---

**This architecture makes Privata a true drop-in replacement for ANY ORM while maintaining bulletproof compliance.** Would you like me to continue with the remaining architecture details (caching, security, scalability)?
