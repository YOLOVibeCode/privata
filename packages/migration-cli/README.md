# @privata/migration-cli

**Automated Migration CLI Tool for GDPR/HIPAA Compliance**

Complete CLI tool for automatically migrating existing applications to use Privata's GDPR/HIPAA compliance features. Make compliance adoption seamless and automated.

## 🚀 Quick Start

```bash
# Install globally
npm install -g @privata/migration-cli

# Or use with npx
npx @privata/migration-cli migrate
```

## 📋 Commands

### **Migrate Command**
```bash
privata-migrate migrate [options]
```

**Options:**
- `-p, --path <path>` - Path to the project to migrate (default: current directory)
- `-t, --type <type>` - Project type (react, node, express, nextjs, vue, angular) (default: auto)
- `-o, --output <path>` - Output path for migration results (default: ./privata-migration)
- `-c, --config <file>` - Configuration file path
- `--dry-run` - Preview changes without applying them
- `--force` - Force migration even if conflicts are detected
- `--backup` - Create backup before migration (default: true)
- `--verbose` - Verbose output

**Example:**
```bash
# Migrate a React application
privata-migrate migrate -p ./my-react-app -t react --dry-run

# Migrate with custom output path
privata-migrate migrate -p ./my-app -o ./migration-results

# Force migration with verbose output
privata-migrate migrate --force --verbose
```

### **Analyze Command**
```bash
privata-migrate analyze [options]
```

**Options:**
- `-p, --path <path>` - Path to the project to analyze (default: current directory)
- `-t, --type <type>` - Project type (react, node, express, nextjs, vue, angular) (default: auto)
- `-o, --output <file>` - Output file for analysis report (default: ./privata-analysis.json)
- `--verbose` - Verbose output

**Example:**
```bash
# Analyze a project
privata-migrate analyze -p ./my-app

# Analyze with custom output
privata-migrate analyze -p ./my-app -o ./analysis-report.json
```

### **Config Command**
```bash
privata-migrate config [options]
```

**Options:**
- `--init` - Initialize configuration file
- `--show` - Show current configuration
- `--validate` - Validate configuration file

**Example:**
```bash
# Initialize configuration
privata-migrate config --init

# Show current configuration
privata-migrate config --show

# Validate configuration
privata-migrate config --validate
```

### **Template Command**
```bash
privata-migrate template [options]
```

**Options:**
- `-t, --type <type>` - Template type (react, node, express, nextjs, vue, angular)
- `-o, --output <path>` - Output path for template (default: ./privata-template)

**Example:**
```bash
# Generate React template
privata-migrate template -t react -o ./my-template

# Generate Node.js template
privata-migrate template -t node -o ./my-template
```

## 🎯 What It Does

### **Automatic Code Analysis**
- **Project Structure Detection** - Automatically detects project type and framework
- **ORM Usage Analysis** - Identifies Mongoose, Prisma, TypeORM, Sequelize, Drizzle usage
- **API Endpoint Detection** - Finds REST API endpoints that need compliance
- **Data Handling Analysis** - Identifies personal data and health data handling
- **Dependency Analysis** - Analyzes existing dependencies for conflicts

### **Intelligent Transformations**
- **ORM Migration** - Transforms ORM usage to use Privata compliance features
- **API Compliance** - Adds GDPR/HIPAA compliance to API endpoints
- **Data Protection** - Adds encryption, pseudonymization, and data minimization
- **Privacy Controls** - Adds consent management and privacy settings

### **Compliance Features**
- **GDPR Articles 15-22** - Complete GDPR compliance implementation
- **HIPAA Safeguards** - Administrative, physical, and technical safeguards
- **Data Protection** - Encryption, pseudonymization, data minimization
- **Privacy Controls** - Consent management, data export, data deletion

## 🏗️ Supported Project Types

### **Frontend Frameworks**
- **React** - Complete React component library integration
- **Vue.js** - Vue.js component integration
- **Angular** - Angular service and component integration
- **Next.js** - Next.js page and API route integration

### **Backend Frameworks**
- **Node.js** - Express.js and vanilla Node.js integration
- **Express.js** - Express middleware and route integration
- **NestJS** - NestJS decorator and service integration

### **ORM Support**
- **Mongoose** - MongoDB with Mongoose integration
- **Prisma** - Prisma ORM integration
- **TypeORM** - TypeORM integration
- **Sequelize** - Sequelize integration
- **Drizzle** - Drizzle ORM integration

## 📊 Migration Process

### **1. Analysis Phase**
```bash
privata-migrate analyze -p ./my-app
```

**What it analyzes:**
- Project structure and dependencies
- Existing compliance implementations
- Data handling patterns
- API endpoint structure
- ORM usage patterns

### **2. Planning Phase**
```bash
privata-migrate migrate --dry-run
```

**What it plans:**
- Files to transform
- Dependencies to add/remove
- Compliance features to implement
- Potential issues and conflicts
- Risk assessment

### **3. Migration Phase**
```bash
privata-migrate migrate
```

**What it does:**
- Transforms existing code
- Adds compliance features
- Updates dependencies
- Generates new files
- Creates configuration

### **4. Reporting Phase**
```bash
# Reports are automatically generated
```

**What it generates:**
- JSON report with detailed results
- HTML report with visual analysis
- Markdown report for documentation
- Migration summary and next steps

## 🎨 Configuration

### **Configuration File**
Create a `privata-migration.config.json` file:

```json
{
  "projectPath": "./my-app",
  "projectType": "react",
  "outputPath": "./privata-migration",
  "dryRun": false,
  "force": false,
  "backup": true,
  "verbose": false,
  "transformations": [
    {
      "type": "orm-migration",
      "enabled": true,
      "options": {
        "preserveOriginalCode": true,
        "addComments": true
      }
    },
    {
      "type": "data-handling",
      "enabled": true,
      "options": {
        "addDataProtection": true,
        "addAuditLogging": true
      }
    }
  ],
  "complianceFeatures": [
    {
      "type": "gdpr",
      "enabled": true,
      "options": {
        "articles": [15, 16, 17, 18, 20, 21, 22],
        "addUIComponents": true
      }
    },
    {
      "type": "hipaa",
      "enabled": true,
      "options": {
        "safeguards": ["administrative", "physical", "technical"],
        "addAuditLogging": true
      }
    }
  ]
}
```

### **Project-Specific Configuration**
```bash
# React projects
privata-migrate migrate -t react --config ./react-config.json

# Node.js projects
privata-migrate migrate -t node --config ./node-config.json

# Express projects
privata-migrate migrate -t express --config ./express-config.json
```

## 📁 Generated Files

### **Configuration Files**
- `gdpr-config.json` - GDPR compliance configuration
- `hipaa-config.json` - HIPAA compliance configuration
- `data-protection-config.json` - Data protection configuration
- `privacy-controls-config.json` - Privacy controls configuration

### **Implementation Files**
- `gdpr-controller.ts` - GDPR API endpoints
- `hipaa-controller.ts` - HIPAA API endpoints
- `data-protection-service.ts` - Data protection service
- `privacy-controls-controller.ts` - Privacy controls API

### **React Components** (for React projects)
- `ConsentBanner.tsx` - Cookie consent banner
- `PrivacyDashboard.tsx` - Privacy management dashboard
- `DataExportButton.tsx` - Data export functionality
- `GDPRSettings.tsx` - GDPR settings interface

### **Reports**
- `migration-report.json` - Detailed JSON report
- `migration-report.html` - Visual HTML report
- `migration-report.md` - Markdown documentation

## 🔧 Advanced Usage

### **Custom Transformations**
```typescript
// Custom transformation configuration
{
  "transformations": [
    {
      "type": "custom-orm-migration",
      "enabled": true,
      "options": {
        "ormType": "mongoose",
        "addCompliance": true,
        "preserveOriginal": true
      }
    }
  ]
}
```

### **Selective Migration**
```bash
# Migrate only specific features
privata-migrate migrate --config ./selective-config.json
```

### **Batch Migration**
```bash
# Migrate multiple projects
for project in ./project1 ./project2 ./project3; do
  privata-migrate migrate -p $project -o ./migrations/$project
done
```

## 🚨 Troubleshooting

### **Common Issues**

**1. Permission Errors**
```bash
# Fix permission issues
sudo chown -R $(whoami) ./my-project
```

**2. Dependency Conflicts**
```bash
# Use force flag for conflicts
privata-migrate migrate --force
```

**3. Backup Issues**
```bash
# Disable backup if needed
privata-migrate migrate --no-backup
```

### **Debug Mode**
```bash
# Enable verbose output
privata-migrate migrate --verbose

# Check configuration
privata-migrate config --validate
```

## 📚 Examples

### **React Application Migration**
```bash
# Analyze React app
privata-migrate analyze -p ./my-react-app -t react

# Migrate with React components
privata-migrate migrate -p ./my-react-app -t react -o ./migration
```

### **Node.js API Migration**
```bash
# Analyze Node.js API
privata-migrate analyze -p ./my-api -t node

# Migrate with compliance middleware
privata-migrate migrate -p ./my-api -t node -o ./migration
```

### **Express.js Application Migration**
```bash
# Analyze Express app
privata-migrate analyze -p ./my-express-app -t express

# Migrate with Express middleware
privata-migrate migrate -p ./my-express-app -t express -o ./migration
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**@privata/migration-cli** - Making GDPR/HIPAA compliance adoption seamless and automated! 🚀

