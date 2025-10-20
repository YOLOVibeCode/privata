# Privata CLI Demo

**Interactive demonstration of GDPR/HIPAA compliance features using SQLite databases**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 Overview

This CLI application provides a **complete, interactive walkthrough** of Privata's GDPR and HIPAA compliance capabilities. It demonstrates:

- **Physical data separation** using separate SQLite databases (Identity, Clinical, Audit)
- **All 7 GDPR Articles** (15-22) with real database operations
- **HIPAA Privacy & Security Rules** with practical implementations
- **Comprehensive audit logging** for compliance verification
- **Real-time compliance scoring** and verification

## 🚀 Quick Start

### Installation

```bash
# From the cli-demo directory
npm install

# Or from the root of the monorepo
npm install
cd packages/cli-demo
```

### Setup Databases

```bash
# Initialize databases with sample data
npm run setup

# Or with custom parameters
npm run demo setup -- --patients 20 --audit-logs 100
```

### Run Interactive Demo

```bash
# Start the interactive demonstration
npm run demo

# Or directly
npm run demo run
```

## 📋 Available Commands

### Database Setup & Inspection

```bash
# Initialize databases
privata-demo setup [options]
  -p, --patients <number>     Number of patients (default: 10)
  -a, --audit-logs <number>   Number of audit logs (default: 50)
  -c, --clear                 Clear existing data

# Inspect databases
privata-demo inspect identity     # View PII data
privata-demo inspect clinical     # View PHI data
privata-demo inspect audit        # View audit logs
privata-demo inspect separation   # Show data separation
```

### GDPR Demonstrations

```bash
# Demonstrate all GDPR articles
privata-demo gdpr

# Demonstrate specific article
privata-demo gdpr 15    # Right of Access
privata-demo gdpr 16    # Right to Rectification
privata-demo gdpr 17    # Right to Erasure
privata-demo gdpr 18    # Right to Restriction
privata-demo gdpr 20    # Right to Portability
privata-demo gdpr 21    # Right to Object
privata-demo gdpr 22    # Automated Decision Making
```

### HIPAA Demonstrations

```bash
# Demonstrate all HIPAA safeguards
privata-demo hipaa

# Demonstrate specific safeguard
privata-demo hipaa minimum-necessary   # §164.502(b)
privata-demo hipaa audit              # §164.312(b)
privata-demo hipaa access             # §164.312(a)(1)
privata-demo hipaa integrity          # §164.312(c)(1)
privata-demo hipaa breach             # §164.404-408
```

### Compliance Verification

```bash
# View overall compliance score
privata-demo compliance-score
```

## 🗄️ Database Architecture

The demo uses **three physically separated SQLite databases**:

### 1. Identity Database (`identity.db`)
**Contains PII (Personally Identifiable Information)**

- Patient names, emails, phone numbers
- Addresses and geographic information
- Social Security Numbers / National IDs
- Consent records
- **Linked to clinical data via pseudonyms only**

### 2. Clinical Database (`clinical.db`)
**Contains PHI (Protected Health Information)**

- Medical diagnoses and conditions
- Medications and allergies
- Vital signs and medical history
- Insurance information
- **No direct patient identifiers - only pseudonyms**

### 3. Audit Database (`audit.db`)
**Contains compliance audit trail**

- All PHI/PII access logs
- User activity tracking
- Purpose of access documentation
- 6-year retention (HIPAA requirement)

## 🔒 Data Separation Demonstration

```
┌─────────────────────────┐       ┌─────────────────────────┐
│   Identity Database     │       │   Clinical Database     │
│        (PII)            │       │        (PHI)            │
├─────────────────────────┤       ├─────────────────────────┤
│ ID: uuid-123            │       │ Pseudonym: PSN-ABC123   │
│ Name: John Doe          │◄─────►│ Blood Type: A+          │
│ Email: john@example.com │       │ Diagnosis: Hypertension │
│ Pseudonym: PSN-ABC123   │       │ No identifiers!         │
└─────────────────────────┘       └─────────────────────────┘
           │                                   │
           └─────────┬─────────────────────────┘
                     ▼
          ┌─────────────────────────┐
          │    Audit Database       │
          │   (Compliance Logs)     │
          ├─────────────────────────┤
          │ Timestamp: 2025-10-17   │
          │ Action: ACCESS_PHI      │
          │ Pseudonym: PSN-ABC123   │
          │ Purpose: treatment      │
          └─────────────────────────┘
```

## 🇪🇺 GDPR Compliance Features

### Article 15: Right of Access
- Complete data export in JSON format
- Includes processing purposes and legal basis
- Audit trail of all data processing activities
- Response time: < 100ms

### Article 16: Right to Rectification
- Update inaccurate personal data
- Automatic cache invalidation
- Change tracking in audit log
- Evidence documentation

### Article 17: Right to Erasure ("Right to be Forgotten")
- Delete PII from identity database
- Preserve PHI in clinical database (legal requirement)
- Maintain audit trail (compliance requirement)
- Patient becomes unidentifiable

### Article 18: Right to Restriction
- Limit data processing activities
- Block non-essential uses (marketing, analytics)
- Maintain treatment access
- Processing flags enforced

### Article 20: Right to Portability
- Export in machine-readable format (JSON)
- Includes metadata and complete data
- Secure download links
- Data integrity verification

### Article 21: Right to Object
- Object to specific processing types
- Immediate processing cessation
- Essential services maintained
- Objection documented

### Article 22: Automated Decision Making
- Disclosure of automated decisions
- Algorithm transparency
- Right to human intervention
- Contest procedures documented

## 🏥 HIPAA Compliance Features

### Minimum Necessary Standard (§164.502(b))
- Purpose-based access control
- Data minimization for each use case
- Role-specific access levels
- Treatment exemption honored

### Audit Controls (§164.312(b))
- Who, what, when, where, why logging
- 6-year retention period
- Immutable audit trail
- Regular compliance reviews

### Access Control (§164.312(a)(1))
- Role-based access control (RBAC)
- Multi-factor authentication support
- Session management
- Emergency access procedures

### Data Integrity (§164.312(c)(1))
- Checksum verification
- Version control
- Backup and recovery
- Tamper detection

### Breach Notification (§164.404-408)
- Risk assessment procedures
- 60-day notification timeline
- Individual and HHS notification
- Remediation documentation

## 📊 Sample Data

The demo includes realistic sample data:

- **10 patients** (5 US, 5 EU regions)
- **Complete PII**: Names, emails, addresses, SSN/National IDs
- **Complete PHI**: Medical records, diagnoses, medications, vital signs
- **50+ audit log entries** spanning 30 days
- **Multiple consent states** for GDPR demonstrations

## 🎨 Interactive Features

### Visual Output
- ✅ Color-coded messages (success, error, info, warning)
- 📊 Formatted tables for database contents
- 🎯 Progress indicators and metrics
- 🔒 Compliance score displays
- 📋 Step-by-step walkthroughs

### User Experience
- Interactive menu navigation
- Guided demonstrations with explanations
- Press ENTER to proceed at your pace
- Clear section headers and dividers
- Real-time operation feedback

## 🔍 What Gets Demonstrated

### 1. Physical Data Separation
- Three separate SQLite database files
- PII and PHI in different databases
- Pseudonym-based linking
- No cross-contamination of data types

### 2. Data Operations
- Create, Read, Update, Delete (CRUD)
- Transparent data joining
- Cache management
- Transaction handling

### 3. Compliance Automation
- Automatic audit logging
- Region-based data routing
- Consent verification
- Access control enforcement

### 4. Regulatory Requirements
- GDPR Articles 15-22 implementation
- HIPAA Administrative Safeguards
- HIPAA Physical Safeguards
- HIPAA Technical Safeguards

## 📝 Example Usage Scenarios

### Scenario 1: GDPR Data Subject Request
```bash
# Setup demo
privata-demo setup

# View EU patient data
privata-demo inspect identity

# Demonstrate right of access
privata-demo gdpr 15

# Demonstrate right to erasure
privata-demo gdpr 17

# Verify erasure in audit logs
privata-demo inspect audit
```

### Scenario 2: HIPAA Compliance Audit
```bash
# Demonstrate audit controls
privata-demo hipaa audit

# Show minimum necessary standard
privata-demo hipaa minimum-necessary

# View complete compliance score
privata-demo compliance-score

# Export audit logs for review
privata-demo inspect audit --limit 100
```

### Scenario 3: Data Separation Verification
```bash
# Show physical separation
privata-demo inspect separation

# View identity database (PII)
privata-demo inspect identity

# View clinical database (PHI - no PII!)
privata-demo inspect clinical

# Verify pseudonym linking
privata-demo inspect identity --id <patient-id>
```

## 🛠️ Development

### Build

```bash
npm run build
```

### Clean

```bash
npm run clean  # Removes dist/ and databases/
```

### Local Testing

```bash
# Run in development mode
npm run dev

# Or specific commands
npm run dev run
npm run dev setup
npm run dev inspect identity
```

## 📖 Learn More

- **Privata Documentation**: [docs/INDEX.md](../../docs/INDEX.md)
- **GDPR Specification**: [docs/specifications/GDPR_COMPLIANCE_TESTS.md](../../docs/specifications/GDPR_COMPLIANCE_TESTS.md)
- **HIPAA Specification**: [docs/specifications/HIPAA_COMPLIANCE_TESTS.md](../../docs/specifications/HIPAA_COMPLIANCE_TESTS.md)
- **Architecture**: [docs/specifications/ARCHITECTURE_SPECIFICATION.md](../../docs/specifications/ARCHITECTURE_SPECIFICATION.md)

## 🤝 Contributing

This demo is part of the Privata project. See [CONTRIBUTING.md](../../docs/CONTRIBUTING.md) for contribution guidelines.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Privata** - Privacy by Design, Data by Default
*Making GDPR/HIPAA compliance invisible to developers since 2026*

🔒 **[GitHub](https://github.com/privata/privata)** | 📧 **[Email](mailto:hello@privata.dev)** | 💬 **[Discord](https://discord.gg/privata)**
