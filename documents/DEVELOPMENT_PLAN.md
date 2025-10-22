# 🚀 CRUD Integration Development Plan

## 🎯 Objective
Implement complete CRUD operations with automatic data separation, following TDD and ISP principles.

## 📋 Current State Analysis

### ✅ What We Have
1. **ISP Interfaces** - Complete and well-defined
   - IDatabaseReader (3 methods)
   - IDatabaseWriter (3 methods)
   - ICacheReader, ICacheWriter
   - IAuditLogger
   
2. **Services** - Core functionality exists
   - DataSeparatorService (96.29% coverage)
   - PseudonymService (100% coverage)
   - RegionDetectorService (100% coverage)
   - EncryptionService (100% coverage)
   
3. **Adapters** - Infrastructure ready
   - MongoDBAdapter (75% coverage)
   - PostgreSQLAdapter (78% coverage)
   - RedisCacheAdapter

4. **GDPR Methods** - All 7 articles implemented
   - requestDataAccess()
   - rectifyPersonalData()
   - erasePersonalData()
   - etc.

### ❌ What's Missing

1. **Model Layer** - No model registry or schema system
2. **CRUD Methods** - Privata class has no create/read/update/delete
3. **Data Separation Integration** - Services not integrated with CRUD
4. **Cache Integration** - Not connected to CRUD operations
5. **Audit Integration** - Not automatic for CRUD

## 🏗️ Implementation Strategy (TDD)

### Phase 1: Model Registry (Week 3 - Days 1-2)
**Goal:** Dynamic model management with schema validation

#### TDD Cycle 1: Basic Model Registration
```typescript
// RED: Write failing test
it('should register a model with schema', () => {
  const User = privata.model('User', {
    identity: { firstName: String, email: String },
    clinical: { diagnosis: String }
  });
  expect(User.modelName).toBe('User');
});

// GREEN: Implement minimal code
class ModelRegistry {
  private models = new Map();
  register(name, schema) {
    this.models.set(name, { name, schema });
  }
}

// REFACTOR: Add type safety, validation
```

#### TDD Cycle 2: Schema Classification
```typescript
// RED: Test PII/PHI classification
it('should classify fields as PII or PHI', () => {
  const schema = registry.getSchema('User');
  expect(schema.identity).toContain('firstName');
  expect(schema.clinical).toContain('diagnosis');
});
```

### Phase 2: CRUD Methods with Data Separation (Week 3-4)

#### TDD Cycle 3: Create Operation
```typescript
// RED: Test create with data separation
it('should create user and separate PII/PHI', async () => {
  const User = privata.model('User', userSchema);
  const user = await User.create({
    firstName: 'John',
    email: 'john@example.com',
    diagnosis: 'Hypertension'
  });
  
  // Verify data is separated
  expect(user.id).toBeDefined();
  expect(user.pseudonym).toBeDefined();
  // PII and PHI stored separately in different databases
});

// GREEN: Implement
async create(data) {
  const separated = await this.dataSeparator.separate(data);
  // Store in separate databases
  // Return joined view
}
```

#### TDD Cycle 4: Read Operation with Cache
```typescript
// RED: Test read with caching
it('should read from cache first, then database', async () => {
  const User = privata.model('User', userSchema);
  
  // First read - from database
  const user1 = await User.findById('123');
  expect(cacheSpy).toHaveBeenCalledWith('user:123');
  expect(dbSpy).toHaveBeenCalled();
  
  // Second read - from cache
  const user2 = await User.findById('123');
  expect(cacheSpy).toHaveBeenCalledTimes(2);
  expect(dbSpy).toHaveBeenCalledTimes(1); // Not called again
});

// GREEN: Implement cache-first strategy
async findById(id) {
  const cached = await cache.get(key);
  if (cached) return cached;
  
  const data = await database.findById(id);
  await cache.set(key, data);
  return data;
}
```

#### TDD Cycle 5: Update with Cache Invalidation
```typescript
// RED: Test update invalidates cache
it('should invalidate cache on update', async () => {
  const User = privata.model('User', userSchema);
  
  await User.update('123', { email: 'new@example.com' });
  
  expect(cacheInvalidateSpy).toHaveBeenCalledWith('user:123');
  expect(auditLogSpy).toHaveBeenCalledWith({
    action: 'UPDATE',
    entityId: '123'
  });
});
```

#### TDD Cycle 6: Delete (Soft Delete for PII)
```typescript
// RED: Test GDPR-compliant delete
it('should soft delete PII but keep PHI', async () => {
  const User = privata.model('User', userSchema);
  
  await User.delete('123', { gdprCompliant: true });
  
  // PII deleted from identity DB
  const identityData = await identityDB.findById('123');
  expect(identityData).toBeNull();
  
  // PHI retained in clinical DB
  const clinicalData = await clinicalDB.findByPseudonym('pseu_123');
  expect(clinicalData).toBeDefined();
  expect(clinicalData.diagnosis).toBe('Hypertension');
});
```

### Phase 3: Integration & Testing (Week 4)

#### Integration Test 1: Full CRUD Flow
```typescript
it('should handle complete CRUD lifecycle with data separation', async () => {
  // CREATE
  const user = await User.create({
    firstName: 'John',
    email: 'john@example.com',
    diagnosis: 'Hypertension'
  });
  
  // READ
  const retrieved = await User.findById(user.id);
  expect(retrieved.firstName).toBe('John');
  
  // UPDATE
  await User.update(user.id, { email: 'newemail@example.com' });
  
  // DELETE
  await User.delete(user.id);
  
  // Verify audit trail
  const auditLogs = await auditLogger.query({ entityId: user.id });
  expect(auditLogs).toHaveLength(4); // CREATE, READ, UPDATE, DELETE
});
```

#### Integration Test 2: Multi-Region Support
```typescript
it('should route data to correct region databases', async () => {
  const euUser = await User.create({
    firstName: 'Hans',
    email: 'hans@example.de',
    region: 'EU'
  });
  
  // Verify stored in EU databases
  expect(identityDBSpy).toHaveBeenCalledWith(
    expect.objectContaining({ region: 'EU' })
  );
});
```

## 📊 Success Criteria

### Coverage Targets
- Model Registry: 100%
- CRUD Methods: 95%+
- Integration Tests: 90%+
- Overall Project: 85%+

### Performance Targets
- Create: <100ms (uncached)
- Read: <10ms (cached), <50ms (uncached)
- Update: <100ms
- Delete: <100ms
- Cache hit rate: >85%

### Quality Gates
- ✅ All tests passing (100%)
- ✅ TDD followed (Red → Green → Refactor)
- ✅ ISP respected (small interfaces)
- ✅ Zero linter errors
- ✅ Comprehensive edge case coverage

## 🔄 Development Workflow

### For Each Feature:
1. **RED** - Write failing test
2. **GREEN** - Minimal implementation
3. **REFACTOR** - Improve code quality
4. **COMMIT** - Save progress
5. **REPEAT**

### Test Categories:
- Unit tests (60%)
- Integration tests (30%)
- E2E tests (10%)

## 📅 Timeline

**Estimated: 4-6 hours of focused development**

- Hour 1-2: Model Registry (TDD)
- Hour 3-4: CRUD Methods (TDD)
- Hour 5-6: Integration & Testing

## 🎯 Next Actions

1. Start with ModelRegistry class
2. Follow TDD strictly
3. Use ISP interfaces
4. Test edge cases
5. Integrate incrementally

Let's build this! 🚀

