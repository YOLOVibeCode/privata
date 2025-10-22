# 🚀 Getting Started with Privata

**Complete guide to implementing GDPR/HIPAA compliance with Privata**

## 📋 Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Core Concepts](#core-concepts)
4. [Basic Usage](#basic-usage)
5. [Advanced Features](#advanced-features)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## 🛠️ Installation

### Prerequisites

- Node.js 18+ 
- TypeScript 5+
- Database (MongoDB, PostgreSQL, SQLite)

### Install Privata

```bash
# Install core package
npm install @privata/core

# Install React components (optional)
npm install @privata/react

# Install query builder (optional)
npm install @privata/query-builder

# Install enterprise features (optional)
npm install @privata/enterprise
```

### Database Setup

```bash
# MongoDB
npm install mongodb

# PostgreSQL
npm install pg

# SQLite
npm install sqlite3
```

## 🚀 Quick Start

### 1. Initialize Privata

```typescript
import { Privata } from '@privata/core';

const privata = new Privata({
  database: {
    identity: {
      us: 'mongodb://localhost/identity_us',
      eu: 'mongodb://localhost/identity_eu'
    },
    clinical: {
      us: 'mongodb://localhost/clinical_us',
      eu: 'mongodb://localhost/clinical_eu'
    }
  },
  cache: {
    type: 'redis',
    url: 'redis://localhost:6379'
  },
  audit: {
    type: 'elasticsearch',
    url: 'http://localhost:9200'
  }
});
```

### 2. Register Models

```typescript
// Register a user model
await privata.registerModel('User', {
  pii: ['name', 'email', 'phone', 'address'],
  phi: ['medicalRecordNumber', 'diagnoses', 'medications'],
  metadata: ['createdAt', 'updatedAt', 'lastLogin']
});

// Register a patient model
await privata.registerModel('Patient', {
  pii: ['name', 'email', 'phone'],
  phi: ['medicalRecordNumber', 'diagnoses', 'treatments', 'medications'],
  metadata: ['createdAt', 'updatedAt', 'lastVisit']
});
```

### 3. Use Compliance Features

```typescript
// Create a user with automatic compliance
const user = await privata.create('User', {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  address: '123 Main St',
  medicalRecordNumber: 'MR123456',
  diagnoses: ['Hypertension'],
  medications: ['Lisinopril']
});

// Access user data with compliance
const userData = await privata.find('User', { id: user.id });
```

## 🎯 Core Concepts

### Data Separation

Privata automatically separates data into three categories:

- **PII (Personally Identifiable Information)** - Name, email, phone, address
- **PHI (Protected Health Information)** - Medical records, diagnoses, treatments
- **Metadata** - Timestamps, system data, audit logs

### Compliance Features

- **GDPR Articles 15-22** - Complete GDPR compliance
- **HIPAA Safeguards** - Administrative, physical, technical safeguards
- **Data Protection** - Encryption, pseudonymization, data minimization
- **Privacy Controls** - Consent management, data export, data deletion

### Multi-Region Support

- **US Region** - HIPAA compliance
- **EU Region** - GDPR compliance
- **Automatic Detection** - Based on user location

## 📚 Basic Usage

### Creating Data

```typescript
// Create with automatic data separation
const user = await privata.create('User', {
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+1234567890',
  medicalRecordNumber: 'MR789012',
  diagnoses: ['Diabetes'],
  medications: ['Metformin']
});

// Data is automatically separated:
// - PII: name, email, phone → identity database
// - PHI: medicalRecordNumber, diagnoses, medications → clinical database
// - Metadata: createdAt, updatedAt → metadata database
```

### Reading Data

```typescript
// Read with compliance checks
const user = await privata.find('User', { id: userId });

// Read only PII
const piiData = await privata.find('User', { id: userId }, { includePII: true });

// Read only PHI
const phiData = await privata.find('User', { id: userId }, { includePHI: true });
```

### Updating Data

```typescript
// Update with compliance
const updatedUser = await privata.update('User', { id: userId }, {
  name: 'Jane Smith',
  email: 'jane.smith@example.com'
});

// Update PHI with audit logging
const updatedPatient = await privata.update('Patient', { id: patientId }, {
  diagnoses: ['Diabetes', 'Hypertension'],
  medications: ['Metformin', 'Lisinopril']
});
```

### Deleting Data

```typescript
// Delete with compliance
await privata.delete('User', { id: userId });

// Soft delete (recommended)
await privata.softDelete('User', { id: userId });
```

## 🔧 Advanced Features

### GDPR Compliance

```typescript
// Article 15 - Right to Access
const userData = await privata.requestDataAccess(userId, {
  includePII: true,
  includePHI: true,
  includeAuditLogs: true
});

// Article 16 - Right to Rectification
await privata.rectifyPersonalData({
  dataSubjectId: userId,
  corrections: {
    name: 'John Smith',
    email: 'john.smith@example.com'
  },
  reason: 'User requested correction',
  evidence: 'User request via API'
});

// Article 17 - Right to Erasure
await privata.erasePersonalData({
  dataSubjectId: userId,
  reason: 'User requested deletion',
  evidence: 'User request via API'
});

// Article 20 - Right to Data Portability
const exportData = await privata.requestDataPortability({
  dataSubjectId: userId,
  format: 'JSON',
  deliveryMethod: 'download'
});
```

### HIPAA Compliance

```typescript
// PHI Access Control
const phiData = await privata.requestPHIAccess({
  dataSubjectId: userId,
  requestType: 'access',
  authorization: 'patient'
});

// Breach Reporting
await privata.reportBreach({
  description: 'Potential data breach detected',
  affectedRecords: 1,
  severity: 'low',
  discoveredAt: new Date()
});

// Audit Logging
const auditLogs = await privata.getAuditLogs(userId, {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31')
});
```

### Query Builder

```typescript
import { createQueryBuilder } from '@privata/query-builder';

// Create a query builder
const query = createQueryBuilder(privata, 'User')
  .where('name', 'like', 'John%')
  .wherePII('email', 'eq', 'john@example.com')
  .wherePHI('medicalRecordNumber', 'exists', true)
  .orderBy('createdAt', 'desc')
  .page(1, 10)
  .complianceMode('strict')
  .withPII()
  .withPHI();

// Execute query
const result = await query.execute();
```

### React Components

```typescript
import { 
  ConsentBanner, 
  PrivacyDashboard, 
  DataExportButton 
} from '@privata/react';

function App() {
  return (
    <div>
      <ConsentBanner 
        privata={privata}
        onConsentChange={(consent) => console.log('Consent:', consent)}
      />
      
      <PrivacyDashboard 
        userId="user123"
        privata={privata}
      />
      
      <DataExportButton 
        userId="user123"
        privata={privata}
      />
    </div>
  );
}
```

## 🏆 Best Practices

### 1. Data Modeling

```typescript
// Define clear data categories
await privata.registerModel('User', {
  pii: ['name', 'email', 'phone', 'address'],
  phi: ['medicalRecordNumber', 'diagnoses', 'medications'],
  metadata: ['createdAt', 'updatedAt', 'lastLogin']
});
```

### 2. Compliance Configuration

```typescript
// Configure compliance settings
const privata = new Privata({
  compliance: {
    gdpr: {
      enabled: true,
      articles: [15, 16, 17, 18, 20, 21, 22],
      dataRetention: 365 // days
    },
    hipaa: {
      enabled: true,
      safeguards: ['administrative', 'physical', 'technical'],
      breachNotification: true
    }
  }
});
```

### 3. Error Handling

```typescript
try {
  const user = await privata.create('User', userData);
} catch (error) {
  if (error.code === 'COMPLIANCE_VIOLATION') {
    // Handle compliance violation
    console.error('Compliance violation:', error.message);
  } else if (error.code === 'DATA_SEPARATION_ERROR') {
    // Handle data separation error
    console.error('Data separation error:', error.message);
  }
}
```

### 4. Monitoring

```typescript
import { MonitoringService } from '@privata/enterprise';

const monitoring = new MonitoringService(privata, {
  enabled: true,
  metricsInterval: 60000, // 1 minute
  alertThresholds: {
    errorRate: 0.05,
    responseTime: 1000,
    complianceScore: 80
  }
});

await monitoring.start();
```

## 🚨 Troubleshooting

### Common Issues

**1. Database Connection Issues**
```typescript
// Check database connections
await privata.healthCheck();
```

**2. Compliance Violations**
```typescript
// Check compliance status
const status = await privata.getComplianceStatus();
console.log('Compliance status:', status);
```

**3. Data Separation Issues**
```typescript
// Check data separation
const separation = await privata.getDataSeparation('User', userId);
console.log('Data separation:', separation);
```

### Debug Mode

```typescript
// Enable debug mode
const privata = new Privata({
  debug: true,
  // ... other config
});
```

### Logging

```typescript
// Enable detailed logging
const privata = new Privata({
  logging: {
    level: 'debug',
    audit: true,
    compliance: true
  }
});
```

## 📚 Next Steps

- [API Reference](./API_REFERENCE.md)
- [React Components](./REACT_COMPONENTS.md)
- [Query Builder](./QUERY_BUILDER.md)
- [Enterprise Features](./ENTERPRISE_FEATURES.md)
- [Examples](./EXAMPLES.md)

## 🤝 Support

- [Documentation](https://privata.dev/docs)
- [Examples](https://privata.dev/examples)
- [Support](https://privata.dev/support)
- [GitHub Issues](https://github.com/privata/privata/issues)

---

**Privata** - Making GDPR/HIPAA compliance invisible to developers! 🚀

