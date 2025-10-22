# 🚀 **Privata Example Applications**

**Real-world demonstrations of GDPR/HIPAA compliance with Privata**

This directory contains comprehensive example applications that demonstrate how to implement Privata's GDPR/HIPAA compliance features in real-world scenarios.

## 📋 **Available Examples**

### **1. 🏥 Healthcare Patient Portal**
**React + Node.js + MongoDB**

A complete healthcare patient portal with HIPAA compliance, patient data management, and medical history tracking.

**Features:**
- Patient registration and authentication
- Medical history management
- HIPAA-compliant data handling
- Patient privacy controls
- Medical record access
- Audit logging
- Consent management

**Technologies:**
- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: MongoDB
- Compliance: Privata Core, React Components

**Quick Start:**
```bash
cd healthcare-portal
npm install
npm run dev
```

### **2. 🛒 E-commerce Platform**
**Next.js + Node.js + PostgreSQL**

A modern e-commerce platform with GDPR compliance, customer data protection, and privacy controls.

**Features:**
- Product catalog and shopping cart
- Customer account management
- GDPR-compliant data handling
- Privacy settings and consent
- Data export and deletion
- Marketing preferences
- Cookie consent

**Technologies:**
- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- Compliance: Privata Core, Query Builder

**Quick Start:**
```bash
cd ecommerce-platform
npm install
npm run dev
```

### **3. 💰 Financial Services App**
**Vue.js + Node.js + MySQL**

A financial services application with GDPR compliance, transaction tracking, and customer data protection.

**Features:**
- Account management
- Transaction history
- GDPR-compliant data handling
- Financial data protection
- Privacy controls
- Data portability
- Audit trails

**Technologies:**
- Frontend: Vue.js, TypeScript, Vite
- Backend: Node.js, Express, TypeScript
- Database: MySQL
- Compliance: Privata Core, Enterprise Features

**Quick Start:**
```bash
cd financial-services
npm install
npm run dev
```

### **4. 🎓 Educational Platform**
**Angular + Node.js + MongoDB**

An educational platform with GDPR compliance, student data protection, and learning analytics.

**Features:**
- Student enrollment and management
- Course content and progress tracking
- GDPR-compliant data handling
- Student privacy controls
- Learning analytics
- Parental consent
- Data retention policies

**Technologies:**
- Frontend: Angular, TypeScript, Angular Material
- Backend: Node.js, Express, TypeScript
- Database: MongoDB
- Compliance: Privata Core, Migration CLI

**Quick Start:**
```bash
cd educational-platform
npm install
npm run dev
```

## 🎯 **What Each Example Demonstrates**

### **Healthcare Portal**
- **HIPAA Compliance** - Complete HIPAA safeguards implementation
- **Medical Data Protection** - PHI handling and access controls
- **Patient Privacy** - Consent management and data rights
- **Audit Logging** - Comprehensive audit trails
- **Data Separation** - PII vs PHI separation

### **E-commerce Platform**
- **GDPR Compliance** - Complete GDPR implementation
- **Customer Data Protection** - PII handling and privacy controls
- **Consent Management** - Cookie consent and marketing preferences
- **Data Rights** - Export, deletion, and portability
- **Privacy Settings** - Customer privacy controls

### **Financial Services**
- **Financial Data Protection** - Sensitive financial data handling
- **Transaction Privacy** - Secure transaction processing
- **Regulatory Compliance** - Financial regulations and GDPR
- **Data Minimization** - Purpose limitation and data minimization
- **Audit Requirements** - Financial audit trails

### **Educational Platform**
- **Student Data Protection** - Educational data privacy
- **Parental Consent** - COPPA compliance for minors
- **Learning Analytics** - Privacy-preserving analytics
- **Data Retention** - Educational data retention policies
- **Access Controls** - Role-based access to student data

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+
- TypeScript 5+
- Database (MongoDB, PostgreSQL, MySQL)
- Redis (for caching)
- Elasticsearch (for audit logging)

### **Installation**
```bash
# Clone the repository
git clone https://github.com/privata/privata.git
cd privata

# Install dependencies
npm install

# Build the core packages
npm run build:core

# Choose an example to run
cd examples/healthcare-portal
npm install
npm run dev
```

### **Configuration**
Each example includes a `.env.example` file with the required environment variables:

```bash
# Copy environment file
cp .env.example .env

# Edit configuration
nano .env
```

### **Database Setup**
Each example includes database setup scripts:

```bash
# Run database migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

## 🧪 **Testing**

### **Run Tests**
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:compliance
npm run test:performance
npm run test:integration
```

### **Compliance Testing**
Each example includes comprehensive compliance tests:

```bash
# Run GDPR compliance tests
npm run test:gdpr

# Run HIPAA compliance tests
npm run test:hipaa

# Run data protection tests
npm run test:data-protection
```

## 📊 **Performance Testing**

### **Load Testing**
```bash
# Run load tests
npm run test:load

# Run stress tests
npm run test:stress

# Run performance benchmarks
npm run test:benchmark
```

### **Monitoring**
Each example includes monitoring and alerting:

```bash
# Start monitoring
npm run monitor

# View metrics
npm run metrics

# Check compliance status
npm run compliance:status
```

## 🔧 **Customization**

### **Adding New Features**
Each example is designed to be easily extensible:

```typescript
// Add new compliance features
import { Privata } from '@privata/core';

const privata = new Privata({
  // Your configuration
});

// Add custom compliance rules
privata.addComplianceRule('custom-rule', {
  // Your custom rule
});
```

### **Integrating with Existing Apps**
Use the Migration CLI to integrate Privata with existing applications:

```bash
# Analyze existing app
privata-migrate analyze -p ./my-app

# Migrate to Privata
privata-migrate migrate -p ./my-app -t react
```

## 📚 **Documentation**

### **API Documentation**
Each example includes comprehensive API documentation:

```bash
# Generate API docs
npm run docs:api

# View API docs
npm run docs:serve
```

### **Compliance Documentation**
Each example includes compliance documentation:

```bash
# Generate compliance docs
npm run docs:compliance

# View compliance status
npm run compliance:report
```

## 🤝 **Contributing**

### **Adding New Examples**
1. Create a new directory in `examples/`
2. Follow the existing structure
3. Include comprehensive documentation
4. Add tests and examples
5. Submit a pull request

### **Example Structure**
```
examples/
├── healthcare-portal/
│   ├── client/          # React frontend
│   ├── server/          # Node.js backend
│   ├── tests/           # Test suites
│   ├── docs/            # Documentation
│   └── README.md         # Example-specific docs
├── ecommerce-platform/
├── financial-services/
├── educational-platform/
└── README.md            # This file
```

## 🚨 **Troubleshooting**

### **Common Issues**

**1. Database Connection Issues**
```bash
# Check database connections
npm run db:check

# Reset database
npm run db:reset
```

**2. Compliance Violations**
```bash
# Check compliance status
npm run compliance:check

# Fix compliance issues
npm run compliance:fix
```

**3. Performance Issues**
```bash
# Check performance metrics
npm run metrics

# Optimize performance
npm run optimize
```

### **Debug Mode**
Enable debug mode for detailed logging:

```bash
# Enable debug mode
DEBUG=privata:* npm run dev

# View debug logs
npm run logs:debug
```

## 📞 **Support**

- [Documentation](https://privata.dev/docs)
- [Examples](https://privata.dev/examples)
- [Support](https://privata.dev/support)
- [GitHub Issues](https://github.com/privata/privata/issues)

---

**Privata Examples** - Real-world demonstrations of GDPR/HIPAA compliance! 🚀

