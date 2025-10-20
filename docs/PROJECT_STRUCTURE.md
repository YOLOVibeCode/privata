# Privata - Project Structure
## Repository Organization

**Date:** October 16, 2025  
**Version:** 1.0.0

---

## 📁 Directory Structure

```
privata/
├── README.md                          # Main project README
├── PROJECT_STRUCTURE.md               # This file - repository organization
├── LICENSE                            # MIT license for core
├── CONTRIBUTING.md                    # Contribution guidelines
├── CHANGELOG.md                       # Version history
├── package.json                       # Root package.json (monorepo)
├── tsconfig.json                      # Root TypeScript config
├── .gitignore                         # Git ignore rules
├── .npmrc                             # NPM configuration
├── lerna.json                         # Lerna monorepo config (or nx.json)
│
├── docs/                              # 📚 All documentation
│   ├── specifications/                # 📋 Technical specifications
│   │   ├── SPECIFICATIONS_INDEX.md    # Index of all specs
│   │   ├── MASTER_SPECIFICATION.md    # High-level overview
│   │   ├── PRODUCT_SPECIFICATION.md   # Product requirements
│   │   ├── ARCHITECTURE_SPECIFICATION.md
│   │   ├── MIGRATION_STRATEGY_SPECIFICATION.md
│   │   ├── EDGE_AND_MODERN_ORM_SUPPORT.md
│   │   ├── API_SPECIFICATION.md       # (To be created)
│   │   ├── ADAPTER_SPECIFICATION.md   # (To be created)
│   │   ├── GDPR_SPECIFICATION.md      # (To be created)
│   │   ├── HIPAA_SPECIFICATION.md     # (To be created)
│   │   ├── SECURITY_SPECIFICATION.md  # (To be created)
│   │   ├── PERFORMANCE_SPECIFICATION.md # (To be created)
│   │   ├── TESTING_SPECIFICATION.md   # (To be created)
│   │   └── DEPLOYMENT_SPECIFICATION.md # (To be created)
│   │
│   ├── guides/                        # 📖 User guides
│   │   ├── GETTING_STARTED.md         # Quick start guide
│   │   ├── INSTALLATION.md            # Installation instructions
│   │   ├── MIGRATION_GUIDE.md         # Migration from other ORMs
│   │   ├── GDPR_GUIDE.md              # GDPR compliance guide
│   │   ├── HIPAA_GUIDE.md             # HIPAA compliance guide
│   │   ├── DEPLOYMENT_GUIDE.md        # Deployment instructions
│   │   └── TROUBLESHOOTING.md         # Common issues & solutions
│   │
│   ├── api/                           # 🔧 API documentation
│   │   ├── core.md                    # Core API reference
│   │   ├── adapters.md                # Adapter API reference
│   │   ├── gdpr.md                    # GDPR methods reference
│   │   ├── hipaa.md                   # HIPAA methods reference
│   │   └── types.md                   # TypeScript type definitions
│   │
│   └── examples/                      # 💡 Code examples
│       ├── basic-usage.md             # Basic usage examples
│       ├── mongoose-migration.md      # Mongoose to Privata
│       ├── prisma-migration.md        # Prisma to Privata
│       ├── edge-computing.md          # Edge/Cloudflare examples
│       └── react-native.md            # Mobile app examples
│
├── packages/                          # 📦 All NPM packages (monorepo)
│   ├── core/                          # Core Privata library
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── Privata.ts             # Main class
│   │   │   ├── Model.ts               # Model class
│   │   │   ├── compliance/            # Compliance layer
│   │   │   │   ├── GDPRExtension.ts
│   │   │   │   ├── HIPAAExtension.ts
│   │   │   │   ├── Pseudonymizer.ts
│   │   │   │   └── AuditLogger.ts
│   │   │   ├── cache/                 # Caching layer
│   │   │   │   ├── CacheManager.ts
│   │   │   │   └── CacheStrategy.ts
│   │   │   ├── security/              # Security layer
│   │   │   │   ├── Encryption.ts
│   │   │   │   └── AccessControl.ts
│   │   │   └── utils/                 # Utilities
│   │   │       ├── QueryBuilder.ts
│   │   │       └── SchemaValidator.ts
│   │   ├── tests/                     # Unit tests
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── adapters/                      # 🔌 Database adapters
│   │   ├── mongoose/                  # @privata/mongoose
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   ├── MongooseAdapter.ts
│   │   │   │   └── PrivataMongoose.ts
│   │   │   ├── tests/
│   │   │   ├── package.json
│   │   │   └── README.md
│   │   │
│   │   ├── prisma/                    # @privata/prisma
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   ├── PrismaAdapter.ts
│   │   │   │   └── PrivataPrisma.ts
│   │   │   ├── tests/
│   │   │   ├── package.json
│   │   │   └── README.md
│   │   │
│   │   ├── typeorm/                   # @privata/typeorm
│   │   ├── sequelize/                 # @privata/sequelize
│   │   ├── sqlite/                    # @privata/sqlite
│   │   ├── drizzle/                   # @privata/drizzle
│   │   ├── d1/                        # @privata/d1
│   │   └── expo-sqlite/               # @privata/expo-sqlite
│   │
│   ├── extensions/                    # 🧩 Optional extensions
│   │   ├── odata/                     # @privata/odata
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   ├── ODataAdapter.ts
│   │   │   │   └── ODataQueryParser.ts
│   │   │   ├── tests/
│   │   │   ├── package.json
│   │   │   └── README.md
│   │   │
│   │   ├── graphql/                   # @privata/graphql
│   │   ├── rest/                      # @privata/rest
│   │   └── react/                     # @privata/react
│   │
│   └── infrastructure/                # ☁️ Infrastructure adapters
│       ├── cache-redis/               # @privata/cache-redis
│       ├── cache-memcached/           # @privata/cache-memcached
│       ├── audit-azure/               # @privata/audit-azure
│       ├── audit-cloudwatch/          # @privata/audit-cloudwatch
│       ├── storage-azure/             # @privata/storage-azure
│       └── storage-s3/                # @privata/storage-s3
│
├── examples/                          # 🚀 Full example applications
│   ├── basic-express/                 # Express.js + Mongoose
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── nextjs-prisma/                 # Next.js + Prisma
│   ├── nestjs-typeorm/                # NestJS + TypeORM
│   ├── cloudflare-d1/                 # Cloudflare Workers + D1
│   ├── react-native-expo/             # React Native + Expo SQLite
│   └── electron-desktop/              # Electron + SQLite
│
├── tests/                             # 🧪 Integration & E2E tests
│   ├── integration/                   # Integration tests
│   │   ├── mongoose.test.ts
│   │   ├── prisma.test.ts
│   │   └── gdpr-compliance.test.ts
│   │
│   ├── e2e/                           # End-to-end tests
│   │   ├── user-lifecycle.test.ts
│   │   └── data-residency.test.ts
│   │
│   └── fixtures/                      # Test data
│       ├── schemas/
│       └── data/
│
├── tools/                             # 🛠️ Development tools
│   ├── migration-generator/           # CLI for migration generation
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── MongooseGenerator.ts
│   │   │   ├── PrismaGenerator.ts
│   │   │   └── templates/
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── compliance-checker/            # CLI for compliance verification
│       ├── src/
│       ├── package.json
│       └── README.md
│
├── .github/                           # GitHub configuration
│   ├── workflows/                     # CI/CD workflows
│   │   ├── test.yml                   # Run tests on PR
│   │   ├── publish.yml                # Publish to NPM
│   │   ├── docs.yml                   # Deploy documentation
│   │   └── security.yml               # Security scanning
│   │
│   ├── ISSUE_TEMPLATE/                # Issue templates
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── security_vulnerability.md
│   │
│   └── PULL_REQUEST_TEMPLATE.md       # PR template
│
└── scripts/                           # 📜 Build & deployment scripts
    ├── build.sh                       # Build all packages
    ├── test.sh                        # Run all tests
    ├── publish.sh                     # Publish to NPM
    ├── setup-dev.sh                   # Setup dev environment
    └── generate-docs.sh               # Generate API docs
```

---

## 📦 Package Structure

### Monorepo Organization

Privata uses a **monorepo** structure managed by **Lerna** (or **Nx**) for:

✅ **Shared dependencies** - Single `node_modules` at root  
✅ **Atomic versioning** - All packages version together  
✅ **Simplified testing** - Test all packages at once  
✅ **Easier development** - Work on multiple packages simultaneously  

### Package Naming Convention

| Type | Naming | Example |
|------|--------|---------|
| Core | `privata` | `privata` |
| Adapters | `@privata/{orm}-compat` | `@privata/mongoose-compat` |
| Extensions | `@privata/{feature}` | `@privata/odata` |
| Infrastructure | `@privata/{service}-{provider}` | `@privata/cache-redis` |

### Package Dependencies

```
privata (core)
  ├── No external dependencies (lightweight!)
  
@privata/mongoose-compat
  ├── privata (peer dependency)
  ├── mongoose (peer dependency)
  
@privata/prisma-compat
  ├── privata (peer dependency)
  ├── @prisma/client (peer dependency)
  
@privata/cache-redis
  ├── privata (peer dependency)
  ├── redis (direct dependency)
```

---

## 📚 Documentation Organization

### 1. Specifications (`docs/specifications/`)

**Purpose:** Technical specifications for implementation  
**Audience:** Developers, architects, contributors  
**Format:** Detailed markdown with diagrams and code

**Key documents:**
- `MASTER_SPECIFICATION.md` - Overview of entire system
- `ARCHITECTURE_SPECIFICATION.md` - System design
- `API_SPECIFICATION.md` - Complete API reference
- `GDPR_SPECIFICATION.md` - GDPR compliance details
- `HIPAA_SPECIFICATION.md` - HIPAA compliance details

### 2. Guides (`docs/guides/`)

**Purpose:** User-facing documentation  
**Audience:** End users, developers using Privata  
**Format:** Step-by-step tutorials and explanations

**Key documents:**
- `GETTING_STARTED.md` - Quick start (15 min)
- `MIGRATION_GUIDE.md` - Migrate from other ORMs
- `GDPR_GUIDE.md` - How to use GDPR features
- `DEPLOYMENT_GUIDE.md` - Production deployment

### 3. API Reference (`docs/api/`)

**Purpose:** Generated API documentation  
**Audience:** Developers using Privata  
**Format:** Auto-generated from TSDoc comments

**Generation:**
```bash
npm run docs:generate
# Uses TypeDoc to generate from source code
```

### 4. Examples (`docs/examples/`)

**Purpose:** Code snippets and common patterns  
**Audience:** Developers learning Privata  
**Format:** Markdown with embedded code

---

## 🚀 Example Applications

### Purpose

Full working applications demonstrating Privata in real-world scenarios.

### Structure

Each example is a **complete, runnable application**:

```
examples/basic-express/
├── src/
│   ├── index.ts              # Entry point
│   ├── models/               # Privata models
│   ├── routes/               # API routes
│   └── config/               # Configuration
├── package.json              # Dependencies
├── .env.example              # Environment variables
└── README.md                 # How to run this example
```

### Examples List

| Example | Tech Stack | Purpose |
|---------|-----------|---------|
| `basic-express` | Express + Mongoose | Basic CRUD with GDPR |
| `nextjs-prisma` | Next.js + Prisma | Full-stack app |
| `nestjs-typeorm` | NestJS + TypeORM | Enterprise app |
| `cloudflare-d1` | Workers + D1 | Edge computing |
| `react-native-expo` | Expo + SQLite | Mobile app |
| `electron-desktop` | Electron + SQLite | Desktop app |

---

## 🧪 Testing Structure

### Test Organization

```
tests/
├── integration/              # Integration tests (package-to-package)
│   ├── mongoose.test.ts      # Test Mongoose adapter
│   ├── prisma.test.ts        # Test Prisma adapter
│   └── gdpr-compliance.test.ts # Test GDPR features
│
├── e2e/                      # End-to-end tests (full workflows)
│   ├── user-lifecycle.test.ts  # Complete user journey
│   └── data-residency.test.ts  # Multi-region compliance
│
└── fixtures/                 # Test data
    ├── schemas/              # Test schemas
    └── data/                 # Test datasets
```

### Unit Tests

Located within each package:
```
packages/core/tests/
packages/adapters/mongoose/tests/
```

### Test Coverage Requirements

| Type | Coverage Target |
|------|----------------|
| Core | > 90% |
| Adapters | > 85% |
| Extensions | > 80% |
| Overall | > 85% |

---

## 🛠️ Development Tools

### 1. Migration Generator (`tools/migration-generator/`)

**Purpose:** Generate migration code from existing ORM code

**Usage:**
```bash
npx @privata/migrate --from mongoose --input ./src/models
```

**Output:** Generated Privata code

### 2. Compliance Checker (`tools/compliance-checker/`)

**Purpose:** Verify GDPR/HIPAA compliance

**Usage:**
```bash
npx @privata/check-compliance --schemas ./src/models
```

**Output:** Compliance report

---

## 🔄 Development Workflow

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/privata/privata.git
cd privata

# Install dependencies
npm install

# Bootstrap monorepo
npm run bootstrap

# Build all packages
npm run build

# Run tests
npm run test
```

### Working on a Package

```bash
# Navigate to package
cd packages/adapters/mongoose

# Watch mode for development
npm run dev

# Run tests for this package
npm test

# Build this package
npm run build
```

### Creating a New Package

```bash
# Use generator
npm run create-package -- --name @privata/new-adapter

# Or manually:
mkdir packages/adapters/new-adapter
cd packages/adapters/new-adapter
npm init -y
# Copy package.json template
```

---

## 📋 File Naming Conventions

### Source Files

| Type | Convention | Example |
|------|-----------|---------|
| Classes | PascalCase | `Privata.ts`, `MongooseAdapter.ts` |
| Functions | camelCase | `utils.ts`, `helpers.ts` |
| Interfaces | PascalCase with `I` prefix | `IAdapter.ts`, `ICache.ts` |
| Types | PascalCase | `types.ts` |
| Constants | UPPER_SNAKE_CASE | `constants.ts` |

### Test Files

| Type | Convention | Example |
|------|-----------|---------|
| Unit tests | `*.test.ts` | `Privata.test.ts` |
| Integration tests | `*.integration.test.ts` | `mongoose.integration.test.ts` |
| E2E tests | `*.e2e.test.ts` | `user-lifecycle.e2e.test.ts` |

### Documentation Files

| Type | Convention | Example |
|------|-----------|---------|
| Specifications | `*_SPECIFICATION.md` | `API_SPECIFICATION.md` |
| Guides | `*_GUIDE.md` | `MIGRATION_GUIDE.md` |
| General docs | `*.md` | `GETTING_STARTED.md` |

---

## 🎯 Key Principles

### 1. **Clear Separation of Concerns**

- **Specifications** = What & Why (for planning)
- **Guides** = How (for users)
- **API Docs** = Reference (auto-generated)
- **Examples** = Patterns (for learning)

### 2. **Monorepo Benefits**

- ✅ Atomic commits across packages
- ✅ Shared tooling and configuration
- ✅ Simplified dependency management
- ✅ Easier to maintain consistency

### 3. **Documentation as Code**

- ✅ Documentation lives with code
- ✅ Examples are runnable
- ✅ API docs generated from source
- ✅ Always in sync

### 4. **Scalability**

- ✅ Easy to add new adapters
- ✅ Easy to add new extensions
- ✅ Easy to add new examples
- ✅ Clear structure for contributors

---

## 📊 Repository Metrics

### Current Status

| Metric | Current | Target |
|--------|---------|--------|
| **Packages** | 0 | 15+ |
| **Specifications** | 6 | 12 |
| **Guides** | 1 | 10 |
| **Examples** | 0 | 6 |
| **Tests** | 0 | 500+ |
| **Coverage** | 0% | 85%+ |

### Repository Size

| Category | Files | LOC |
|----------|-------|-----|
| **Core** | TBD | ~5,000 |
| **Adapters** | TBD | ~10,000 |
| **Tests** | TBD | ~15,000 |
| **Docs** | 6 | ~3,000 |
| **Total** | TBD | ~33,000 |

---

## 🚀 Next Steps

### Phase 1: Repository Setup (Week 1)
- [x] Create directory structure
- [x] Organize specifications
- [ ] Create package.json files
- [ ] Set up Lerna/Nx
- [ ] Configure TypeScript
- [ ] Set up ESLint/Prettier

### Phase 2: Core Implementation (Week 2-4)
- [ ] Implement core package
- [ ] Implement Mongoose adapter
- [ ] Implement Prisma adapter
- [ ] Write unit tests
- [ ] Set up CI/CD

### Phase 3: Documentation (Week 5-6)
- [ ] Complete remaining specifications
- [ ] Write user guides
- [ ] Generate API documentation
- [ ] Create example applications

### Phase 4: Testing (Week 7-8)
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance tests
- [ ] Compliance tests

---

## 🤝 Contributing

See `CONTRIBUTING.md` for:
- Code style guidelines
- Pull request process
- Development workflow
- Testing requirements

---

## 📞 Questions?

- **Specifications:** See `docs/specifications/SPECIFICATIONS_INDEX.md`
- **User Guides:** See `docs/guides/`
- **Issues:** https://github.com/privata/privata/issues
- **Discord:** https://discord.gg/privata

---

**Privata** - Privacy by Design, Data by Default

*Organized. Professional. Production-Ready.*

