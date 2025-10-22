# @privata/odata

**OData v4 support for enterprise integration with GDPR/HIPAA compliance**

A comprehensive OData v4 implementation that provides enterprise-grade API integration with built-in GDPR/HIPAA compliance features.

## 🚀 **Features**

### **OData v4 Compliance**
- ✅ **Complete OData v4 Support** - Full OData v4 specification implementation
- ✅ **Entity Sets & Entity Types** - Complete entity model support
- ✅ **Query Options** - $filter, $orderby, $select, $expand, $top, $skip
- ✅ **Function & Action Imports** - Custom functions and actions
- ✅ **Batch Operations** - Multiple operations in single request
- ✅ **Metadata Generation** - Automatic metadata document generation

### **GDPR/HIPAA Compliance**
- ✅ **GDPR Compliance** - Complete GDPR implementation
- ✅ **HIPAA Compliance** - Complete HIPAA safeguards
- ✅ **Data Protection** - Encryption and pseudonymization
- ✅ **Access Controls** - Role-based access management
- ✅ **Audit Logging** - Comprehensive audit trails
- ✅ **Consent Management** - User consent tracking

### **Enterprise Features**
- ✅ **Multi-Database Support** - Multiple database backends
- ✅ **Caching Strategy** - Multi-level caching implementation
- ✅ **Performance Optimization** - Sub-50ms latency
- ✅ **Monitoring & Alerting** - Real-time performance monitoring
- ✅ **Security Features** - Rate limiting, CORS, security headers

## 📦 **Installation**

```bash
npm install @privata/odata
```

## 🚀 **Quick Start**

### **Basic Setup**

```typescript
import { Privata } from '@privata/core';
import { createODataService, createODataServer } from '@privata/odata';

// Initialize Privata
const privata = new Privata({
  database: {
    identity: { us: 'mongodb://localhost/identity_us' },
    clinical: { us: 'mongodb://localhost/clinical_us' }
  },
  cache: { type: 'redis', url: 'redis://localhost:6379' },
  audit: { type: 'elasticsearch', url: 'http://localhost:9200' }
});

// Create OData service
const odataService = createODataService(privata, {
  baseUrl: 'http://localhost:3000',
  version: '4.0',
  namespace: 'Privata',
  compliance: {
    gdpr: true,
    hipaa: true,
    dataProtection: true,
    auditLogging: true
  },
  metadata: {
    title: 'Privata OData Service',
    description: 'GDPR/HIPAA compliant OData service',
    contact: {
      name: 'Privata Team',
      email: 'support@privata.dev'
    }
  }
});

// Register entity sets
odataService.registerEntitySet({
  name: 'Users',
  entityType: 'User',
  model: 'User',
  permissions: { read: true, insert: true, update: true, delete: true },
  compliance: { pii: true, phi: false, audit: true }
});

odataService.registerEntitySet({
  name: 'Patients',
  entityType: 'Patient',
  model: 'Patient',
  permissions: { read: true, insert: true, update: true, delete: true },
  compliance: { pii: true, phi: true, audit: true }
});

// Create OData server
const odataServer = createODataServer(odataService, {
  port: 3000,
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true
  },
  security: {
    enabled: true,
    rateLimit: { windowMs: 60000, max: 100 }
  },
  logging: {
    enabled: true,
    level: 'info'
  }
});

// Start server
odataServer.start();
```

### **OData Queries**

```typescript
// Get all users with PII fields
const users = await odataService.getEntitySet('Users', {
  $select: 'firstName,lastName,email',
  $filter: 'active eq true',
  $orderby: 'lastName asc',
  $top: 10
}, userContext);

// Get specific patient with PHI access
const patient = await odataService.getEntity('Patients', 'patient-123', {
  $select: 'firstName,lastName,medicalRecordNumber,diagnoses',
  $expand: 'medicalRecords'
}, userContext);

// Create new user with compliance
const newUser = await odataService.createEntity('Users', {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com'
}, userContext);

// Update patient with compliance
const updatedPatient = await odataService.updateEntity('Patients', 'patient-123', {
  diagnoses: 'Updated diagnosis'
}, userContext);

// Delete user with compliance
await odataService.deleteEntity('Users', 'user-123', userContext);
```

### **Function & Action Imports**

```typescript
// Register function import
odataService.addFunctionImport({
  name: 'GetPatientSummary',
  returnType: 'PatientSummary',
  parameters: [
    { name: 'patientId', type: 'Edm.Guid' },
    { name: 'includePHI', type: 'Edm.Boolean' }
  ],
  binding: 'Patient',
  entitySet: 'Patients'
});

// Register action import
odataService.addActionImport({
  name: 'ExportPatientData',
  returnType: 'ExportResult',
  parameters: [
    { name: 'patientId', type: 'Edm.Guid' },
    { name: 'format', type: 'Edm.String' }
  ],
  binding: 'Patient',
  entitySet: 'Patients'
});

// Call function
const summary = await odataService.callFunction('GetPatientSummary', {
  patientId: 'patient-123',
  includePHI: true
}, userContext);

// Call action
const exportResult = await odataService.callAction('ExportPatientData', {
  patientId: 'patient-123',
  format: 'json'
}, userContext);
```

### **Batch Operations**

```typescript
// Batch multiple operations
const results = await odataService.batchOperation([
  { method: 'GET', url: 'Users' },
  { method: 'POST', url: 'Users', data: { firstName: 'Jane', lastName: 'Doe' } },
  { method: 'PUT', url: 'Users/user-123', data: { email: 'jane.doe@example.com' } },
  { method: 'DELETE', url: 'Users/user-456' }
], userContext);
```

## 🔒 **Compliance Features**

### **GDPR Compliance**

```typescript
// Automatic GDPR compliance
const users = await odataService.getEntitySet('Users', {
  $select: 'firstName,lastName,email'
}, userContext);

// The service automatically:
// - Checks user consent for PII access
// - Applies data minimization
// - Enforces purpose limitation
// - Logs audit trails
// - Applies retention policies
```

### **HIPAA Compliance**

```typescript
// Automatic HIPAA compliance
const patients = await odataService.getEntitySet('Patients', {
  $select: 'firstName,lastName,medicalRecordNumber,diagnoses'
}, userContext);

// The service automatically:
// - Checks authorization for PHI access
// - Applies minimum necessary standard
// - Enforces access controls
// - Logs audit trails
// - Applies breach notification
```

### **Data Protection**

```typescript
// Automatic data protection
const sensitiveData = await odataService.getEntitySet('Users', {
  $select: 'ssn,creditCard,bankAccount'
}, userContext);

// The service automatically:
// - Encrypts sensitive fields
// - Pseudonymizes PII fields
// - Applies access controls
// - Logs data access
// - Enforces retention policies
```

## 📊 **Performance & Monitoring**

### **Performance Metrics**

```typescript
// Get performance metrics
const metrics = await odataService.getPerformanceMetrics();

console.log('Performance Metrics:', {
  averageResponseTime: metrics.averageResponseTime,
  requestsPerSecond: metrics.requestsPerSecond,
  errorRate: metrics.errorRate,
  cacheHitRate: metrics.cacheHitRate,
  complianceScore: metrics.complianceScore
});
```

### **Monitoring & Alerting**

```typescript
// Set up monitoring
odataService.on('performance', (metrics) => {
  if (metrics.averageResponseTime > 1000) {
    console.log('Performance Alert: Response time too high');
  }
});

odataService.on('compliance', (violation) => {
  console.log('Compliance Alert:', violation);
});

odataService.on('error', (error) => {
  console.log('Error Alert:', error);
});
```

## 🧪 **Testing**

### **Unit Tests**

```bash
npm test
```

### **Integration Tests**

```bash
npm run test:integration
```

### **Performance Tests**

```bash
npm run test:performance
```

### **Compliance Tests**

```bash
npm run test:compliance
```

## 📚 **API Reference**

### **ODataService**

```typescript
class ODataService {
  // Entity set management
  registerEntitySet(entitySet: ODataEntitySet): void;
  getEntitySet(name: string): ODataEntitySet | undefined;
  listEntitySets(): ODataEntitySet[];

  // OData operations
  getMetadata(): Promise<string>;
  getEntitySet(entitySetName: string, queryOptions?: ODataQueryOptions, userContext?: any): Promise<ODataResponse>;
  getEntity(entitySetName: string, key: string, queryOptions?: ODataQueryOptions, userContext?: any): Promise<any>;
  createEntity(entitySetName: string, data: any, userContext?: any): Promise<any>;
  updateEntity(entitySetName: string, key: string, data: any, userContext?: any): Promise<any>;
  deleteEntity(entitySetName: string, key: string, userContext?: any): Promise<void>;

  // Batch operations
  batchOperation(operations: Array<{method: string, url: string, data?: any}>, userContext?: any): Promise<any[]>;

  // Function & action imports
  callFunction(functionName: string, parameters: Record<string, any>, userContext?: any): Promise<any>;
  callAction(actionName: string, parameters: Record<string, any>, userContext?: any): Promise<any>;
}
```

### **ODataServer**

```typescript
class ODataServer {
  constructor(odataService: ODataService, config: ODataServerConfig);
  start(): void;
  getApp(): express.Application;
}
```

## 🔧 **Configuration**

### **ODataServiceConfig**

```typescript
interface ODataServiceConfig {
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
```

### **ODataServerConfig**

```typescript
interface ODataServerConfig extends ODataServiceConfig {
  port?: number;
  cors?: {
    origin: string | string[];
    credentials: boolean;
  };
  security?: {
    enabled: boolean;
    rateLimit?: {
      windowMs: number;
      max: number;
    };
  };
  logging?: {
    enabled: boolean;
    level: 'error' | 'warn' | 'info' | 'debug';
  };
}
```

## 🚀 **Examples**

### **Healthcare Portal**

```typescript
// Healthcare portal with HIPAA compliance
const healthcareOData = createODataService(privata, {
  baseUrl: 'https://api.healthcare-portal.com',
  namespace: 'Healthcare',
  compliance: {
    gdpr: true,
    hipaa: true,
    dataProtection: true,
    auditLogging: true
  }
});

// Register healthcare entity sets
healthcareOData.registerEntitySet({
  name: 'Patients',
  entityType: 'Patient',
  model: 'Patient',
  permissions: { read: true, insert: true, update: true, delete: true },
  compliance: { pii: true, phi: true, audit: true }
});

healthcareOData.registerEntitySet({
  name: 'MedicalRecords',
  entityType: 'MedicalRecord',
  model: 'MedicalRecord',
  permissions: { read: true, insert: true, update: true, delete: false },
  compliance: { pii: false, phi: true, audit: true }
});
```

### **E-commerce Platform**

```typescript
// E-commerce platform with GDPR compliance
const ecommerceOData = createODataService(privata, {
  baseUrl: 'https://api.ecommerce-platform.com',
  namespace: 'Ecommerce',
  compliance: {
    gdpr: true,
    hipaa: false,
    dataProtection: true,
    auditLogging: true
  }
});

// Register e-commerce entity sets
ecommerceOData.registerEntitySet({
  name: 'Customers',
  entityType: 'Customer',
  model: 'Customer',
  permissions: { read: true, insert: true, update: true, delete: true },
  compliance: { pii: true, phi: false, audit: true }
});

ecommerceOData.registerEntitySet({
  name: 'Orders',
  entityType: 'Order',
  model: 'Order',
  permissions: { read: true, insert: true, update: true, delete: false },
  compliance: { pii: true, phi: false, audit: true }
});
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

---

**@privata/odata** - Enterprise OData v4 with GDPR/HIPAA compliance! 🚀

