# Privata - Migration Strategy Specification
## Drop-In Replacement for Existing ORMs

**Version:** 1.0.0  
**Date:** October 16, 2025  
**Status:** Specification Phase

---

## 🎯 Core Concept: Zero-Friction Migration

**Goal:** Make migrating from any ORM to Privata require **< 10% code changes**.

### The Challenge

Developers have existing codebases using:
- **Mongoose** (MongoDB)
- **Prisma** (PostgreSQL/MySQL)
- **TypeORM** (Multiple databases)
- **Sequelize** (Multiple databases)

They can't afford to:
- Rewrite their entire application
- Change every database query
- Risk breaking production
- Spend weeks on migration

### The Solution: API Compatibility Layer

Privata provides **compatibility wrappers** that match the API of existing ORMs while adding compliance features behind the scenes.

```typescript
// Before (Mongoose)
const User = mongoose.model('User', userSchema);
const user = await User.findById(userId);

// After (Privata with Mongoose compatibility)
const User = privata.mongoose.model('User', userSchema);
const user = await User.findById(userId);  // ✨ Now GDPR/HIPAA compliant!

// Only change: mongoose → privata.mongoose
```

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Mongoose Compatibility](#mongoose-compatibility)
3. [Prisma Compatibility](#prisma-compatibility)
4. [TypeORM Compatibility](#typeorm-compatibility)
5. [Sequelize Compatibility](#sequelize-compatibility)
6. [Migration Tools](#migration-tools)
7. [Code Generation](#code-generation)
8. [Testing Strategy](#testing-strategy)

---

## 🏗️ Architecture Overview

### Three-Layer Compatibility System

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION CODE                              │
│  (Uses existing ORM API - Mongoose, Prisma, etc.)              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              COMPATIBILITY LAYER (New)                           │
│  ┌──────────────┬──────────────┬──────────────┬─────────────┐  │
│  │  Mongoose    │   Prisma     │   TypeORM    │  Sequelize  │  │
│  │  Wrapper     │   Wrapper    │   Wrapper    │   Wrapper   │  │
│  └──────┬───────┴──────┬───────┴──────┬───────┴──────┬──────┘  │
│         │              │              │              │          │
│         └──────────────┴──────────────┴──────────────┘          │
│                         │                                        │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            PRIVATA CORE ENGINE                           │  │
│  │  - Data separation (PII/PHI)                            │  │
│  │  - Pseudonymization                                      │  │
│  │  - GDPR/HIPAA methods                                   │  │
│  │  - Audit logging                                         │  │
│  │  - Caching                                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                                │
│  (Identity DB + Clinical DB, separated automatically)           │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principle

**The compatibility layer translates ORM-specific calls to Privata's compliant operations.**

---

## 🍃 Mongoose Compatibility

### Package: `@privata/mongoose-compat`

#### Installation

```bash
npm install @privata/mongoose-compat
```

#### Drop-In Replacement

```typescript
// OLD CODE (Before Privata)
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }]
});

const User = mongoose.model('User', userSchema);

// Usage
const user = await User.findById(userId);
const users = await User.find({ role: 'patient' }).limit(10);
const newUser = await User.create({ firstName: 'John', email: 'john@example.com' });
```

```typescript
// NEW CODE (With Privata - Minimal Changes)
import mongoose from 'mongoose';
import { PrivataMongoose } from '@privata/mongoose-compat';

// Initialize Privata with Mongoose compatibility
const privata = new PrivataMongoose({
  connection: mongoose.connection,
  compliance: {
    region: 'auto',  // Auto-detect US/EU
    separateData: true,
    enableGDPR: true,
    enableHIPAA: true
  }
});

// SAME SCHEMA (just add PII/PHI markers)
const userSchema = new mongoose.Schema({
  firstName: { type: String, pii: true },     // ← Only change: add marker
  lastName: { type: String, pii: true },      // ← Only change: add marker
  email: { type: String, required: true, unique: true, pii: true },
  sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }]
});

// SAME MODEL REGISTRATION
const User = privata.model('User', userSchema);  // ← Only change: privata instead of mongoose

// SAME USAGE - NO CHANGES NEEDED! ✨
const user = await User.findById(userId);
const users = await User.find({ role: 'patient' }).limit(10);
const newUser = await User.create({ firstName: 'John', email: 'john@example.com' });

// NEW: GDPR methods automatically available
await User.gdpr.rightToErasure(userId, context);
```

#### What Changed?

1. **Import:** `PrivataMongoose` instead of plain `mongoose`
2. **Schema:** Add `pii: true` or `phi: true` to sensitive fields
3. **Model:** `privata.model()` instead of `mongoose.model()`
4. **Usage:** Everything else stays the same!

#### Migration Effort

```
Total Code Changes:
├── Import statement: 1 line
├── Initialize Privata: 5 lines
├── Schema markers: 1 line per sensitive field
└── Model registration: Change 'mongoose' to 'privata'

Estimated Time: 30 minutes for typical app
Code Changed: < 5%
```

---

## 💎 Prisma Compatibility

### Package: `@privata/prisma-compat`

#### Installation

```bash
npm install @privata/prisma-compat
```

#### Drop-In Replacement

```typescript
// OLD CODE (Before Privata)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Usage
const user = await prisma.user.findUnique({ where: { id: userId } });
const users = await prisma.user.findMany({ where: { role: 'patient' }, take: 10 });
const newUser = await prisma.user.create({
  data: { firstName: 'John', email: 'john@example.com' }
});
```

```typescript
// NEW CODE (With Privata - Minimal Changes)
import { PrismaClient } from '@prisma/client';
import { PrivataPrisma } from '@privata/prisma-compat';

// Wrap Prisma with Privata
const prisma = new PrismaClient();
const privata = new PrivataPrisma(prisma, {
  compliance: {
    region: 'auto',
    separateData: true,
    enableGDPR: true,
    enableHIPAA: true
  },
  // Define which fields are PII/PHI
  schema: {
    User: {
      pii: ['firstName', 'lastName', 'email', 'phone'],
      phi: ['medicalHistory', 'diagnoses']
    },
    Session: {
      phi: ['notes', 'recordings']
    }
  }
});

// SAME USAGE - NO CHANGES! ✨
const user = await privata.user.findUnique({ where: { id: userId } });
const users = await privata.user.findMany({ where: { role: 'patient' }, take: 10 });
const newUser = await privata.user.create({
  data: { firstName: 'John', email: 'john@example.com' }
});

// NEW: GDPR methods automatically available
await privata.user.gdpr.rightToErasure(userId, context);
```

#### Prisma Schema Annotation

```prisma
// schema.prisma (add comments for Privata)

model User {
  id        String   @id @default(cuid())
  firstName String   /// @privata(pii: true)
  lastName  String   /// @privata(pii: true)
  email     String   @unique /// @privata(pii: true)
  phone     String?  /// @privata(pii: true)
  role      String
  sessions  Session[]
}

model Session {
  id        String   @id @default(cuid())
  notes     String   /// @privata(phi: true)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
}
```

#### Code Generation

```bash
# Generate Privata-aware Prisma client
npx prisma generate
npx privata generate --prisma

# Output: Generates types with GDPR methods
```

---

## 🔷 TypeORM Compatibility

### Package: `@privata/typeorm-compat`

#### Drop-In Replacement

```typescript
// OLD CODE (Before Privata)
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  email: string;
}

// Usage
const user = await getRepository(User).findOne(userId);
```

```typescript
// NEW CODE (With Privata)
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { PII, PHI } from '@privata/typeorm-compat';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @PII()  // ← Only change: Add decorator
  firstName: string;

  @Column()
  @PII()  // ← Only change: Add decorator
  email: string;
}

// Initialize Privata wrapper
import { PrivataTypeORM } from '@privata/typeorm-compat';
const privata = new PrivataTypeORM(connection, { /* config */ });

// SAME USAGE - NO CHANGES!
const user = await privata.getRepository(User).findOne(userId);

// NEW: GDPR methods
await privata.getRepository(User).gdpr.rightToErasure(userId, context);
```

---

## 🔄 Sequelize Compatibility

### Package: `@privata/sequelize-compat`

#### Drop-In Replacement

```typescript
// OLD CODE (Before Privata)
import { Sequelize, Model, DataTypes } from 'sequelize';

class User extends Model {}
User.init({
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true }
}, { sequelize });

// Usage
const user = await User.findByPk(userId);
```

```typescript
// NEW CODE (With Privata)
import { Sequelize, Model, DataTypes } from 'sequelize';
import { PrivataSequelize } from '@privata/sequelize-compat';

const sequelize = new Sequelize(/* config */);
const privata = new PrivataSequelize(sequelize, { /* config */ });

class User extends Model {}
User.init({
  firstName: { type: DataTypes.STRING, pii: true },  // ← Add marker
  lastName: { type: DataTypes.STRING, pii: true },   // ← Add marker
  email: { type: DataTypes.STRING, unique: true, pii: true }
}, { sequelize: privata.sequelize });

// SAME USAGE!
const user = await User.findByPk(userId);

// NEW: GDPR methods
await privata.User.gdpr.rightToErasure(userId, context);
```

---

## 🗄️ SQLite Compatibility

### Package: `@privata/sqlite-compat`

**Perfect for:** Edge computing, mobile apps, embedded systems, local-first applications

#### Why SQLite + Privata?

SQLite is increasingly used for:
- **Edge Computing** - Cloudflare Workers, Vercel Edge
- **Mobile Apps** - React Native, Expo, Capacitor
- **Desktop Apps** - Electron, Tauri
- **Local-First Apps** - Offline-first applications
- **Embedded Systems** - IoT devices, medical devices

**Challenge:** These environments still need GDPR compliance!

#### Installation

```bash
npm install @privata/sqlite-compat better-sqlite3
# or
npm install @privata/sqlite-compat sqlite3
```

#### Drop-In Replacement

```typescript
// OLD CODE (Before Privata)
import Database from 'better-sqlite3';

const db = new Database('myapp.db');

// Create table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    firstName TEXT,
    lastName TEXT,
    email TEXT UNIQUE
  )
`);

// Insert
const insert = db.prepare('INSERT INTO users (firstName, lastName, email) VALUES (?, ?, ?)');
insert.run('John', 'Doe', 'john@example.com');

// Query
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
```

```typescript
// NEW CODE (With Privata)
import Database from 'better-sqlite3';
import { PrivataSQLite } from '@privata/sqlite-compat';

const db = new Database('myapp.db');

// Initialize Privata wrapper
const privata = new PrivataSQLite({
  database: db,
  // Separate databases for compliance
  databases: {
    identity: new Database('identity.db'),
    clinical: new Database('clinical.db')
  },
  compliance: {
    region: 'auto',
    enableGDPR: true,
    enableHIPAA: true
  }
});

// Define schema with PII/PHI markers
const User = privata.table('users', {
  id: { type: 'INTEGER', primaryKey: true },
  firstName: { type: 'TEXT', pii: true },      // ← Mark as PII
  lastName: { type: 'TEXT', pii: true },       // ← Mark as PII
  email: { type: 'TEXT', unique: true, pii: true }
});

// SAME USAGE - but now compliant!
const user = await User.findById(userId);
const users = await User.findAll({ where: { role: 'patient' } });
const newUser = await User.create({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com'
});

// NEW: GDPR methods automatically available
await User.gdpr.rightToErasure(userId, context);
```

#### SQLite-Specific Features

**1. Multi-Database Support**

```typescript
// Privata creates separate SQLite files for compliance
const privata = new PrivataSQLite({
  databases: {
    identity: new Database('identity.db'),    // PII storage
    clinical: new Database('clinical.db'),    // PHI storage (pseudonymized)
    audit: new Database('audit.db')           // Audit logs
  }
});
```

**2. Encrypted SQLite Support**

```typescript
import SQLCipher from '@journeyapps/sqlcipher';

const privata = new PrivataSQLite({
  databases: {
    identity: new SQLCipher('identity.db', { 
      key: process.env.IDENTITY_DB_KEY 
    }),
    clinical: new SQLCipher('clinical.db', { 
      key: process.env.CLINICAL_DB_KEY 
    })
  }
});
```

**3. Edge Runtime Support**

```typescript
// Cloudflare Workers with D1
import { PrivataD1 } from '@privata/d1-compat';

export default {
  async fetch(request, env) {
    const privata = new PrivataD1({
      identity: env.DB_IDENTITY,
      clinical: env.DB_CLINICAL
    });

    const User = privata.table('users', schema);
    const user = await User.findById(userId);
    
    return new Response(JSON.stringify(user));
  }
}
```

**4. React Native / Expo Support**

```typescript
// React Native with expo-sqlite
import * as SQLite from 'expo-sqlite';
import { PrivataExpoSQLite } from '@privata/expo-sqlite-compat';

const privata = new PrivataExpoSQLite({
  databases: {
    identity: SQLite.openDatabase('identity.db'),
    clinical: SQLite.openDatabase('clinical.db')
  }
});

const User = privata.table('users', schema);

// Works offline, syncs when online
const user = await User.findById(userId);
```

---

## 🐉 Drizzle ORM Compatibility

### Package: `@privata/drizzle-compat`

**Perfect for:** Modern TypeScript projects, edge computing, serverless, type-safety enthusiasts

#### Why Drizzle + Privata?

Drizzle is the **fastest-growing modern ORM** with:
- ✅ **Type-safety** - Full TypeScript inference
- ✅ **SQL-like** - Familiar syntax
- ✅ **Zero dependencies** - Lightweight
- ✅ **Edge-ready** - Cloudflare D1, Vercel, etc.
- ✅ **Performance** - Faster than Prisma/TypeORM

**Perfect match for Privata!**

#### Installation

```bash
npm install @privata/drizzle-compat drizzle-orm
```

#### Drop-In Replacement

```typescript
// OLD CODE (Before Privata)
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import Database from 'better-sqlite3';

const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);

// Define schema
const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  email: text('email').unique()
});

// Query
const user = await db.select().from(users).where(eq(users.id, userId));
const newUser = await db.insert(users).values({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com'
});
```

```typescript
// NEW CODE (With Privata - Minimal Changes)
import { PrivataDrizzle } from '@privata/drizzle-compat';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import Database from 'better-sqlite3';

// Create separate databases
const identityDb = drizzle(new Database('identity.db'));
const clinicalDb = drizzle(new Database('clinical.db'));

// Initialize Privata wrapper
const privata = new PrivataDrizzle({
  identity: identityDb,
  clinical: clinicalDb,
  compliance: {
    region: 'auto',
    enableGDPR: true,
    enableHIPAA: true
  }
});

// Define schema WITH PII/PHI markers
const users = privata.table(sqliteTable('users', {
  id: integer('id').primaryKey(),
  firstName: text('first_name').$pii(),        // ← Mark as PII
  lastName: text('last_name').$pii(),          // ← Mark as PII
  email: text('email').unique().$pii(),        // ← Mark as PII
  medicalHistory: text('medical_history').$phi() // ← Mark as PHI
}));

// SAME USAGE - but now compliant!
const user = await users.findById(userId);
const allUsers = await users.findMany({ where: { role: 'patient' } });
const newUser = await users.create({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com'
});

// NEW: GDPR methods automatically available
await users.gdpr.rightToErasure(userId, context);
```

#### Drizzle-Specific Features

**1. Type-Safe PII/PHI Markers**

```typescript
import { text, integer } from 'drizzle-orm/sqlite-core';
import { pii, phi } from '@privata/drizzle-compat';

const users = privata.table(sqliteTable('users', {
  id: integer('id').primaryKey(),
  firstName: text('first_name').$pii(),    // Type-safe PII marker
  lastName: text('last_name').$pii(),
  email: text('email').$pii(),
  
  // PHI fields stored separately
  diagnosis: text('diagnosis').$phi(),
  medications: text('medications').$phi(),
  
  // Non-sensitive fields (metadata)
  role: text('role'),
  status: text('status')
}));

// TypeScript knows which fields are PII/PHI!
type UserPII = typeof users.$inferPII;
// { firstName: string, lastName: string, email: string }

type UserPHI = typeof users.$inferPHI;
// { diagnosis: string, medications: string }
```

**2. Edge Runtime Support**

```typescript
// Cloudflare Workers with Drizzle + D1
import { drizzle } from 'drizzle-orm/d1';
import { PrivataDrizzle } from '@privata/drizzle-compat';

export default {
  async fetch(request, env) {
    const privata = new PrivataDrizzle({
      identity: drizzle(env.DB_IDENTITY),
      clinical: drizzle(env.DB_CLINICAL)
    });

    const users = privata.table(userSchema);
    const user = await users.findById(userId);
    
    return Response.json(user);
  }
}
```

**3. Relational Queries**

```typescript
// Define relations
const users = privata.table(sqliteTable('users', {
  id: integer('id').primaryKey(),
  firstName: text('first_name').$pii(),
  email: text('email').$pii()
}));

const sessions = privata.table(sqliteTable('sessions', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  notes: text('notes').$phi()
}));

// Query with relations (automatic join across databases!)
const userWithSessions = await users.query.findMany({
  with: {
    sessions: true  // Privata handles cross-database join
  }
});
```

**4. Migration Support**

```typescript
// Drizzle Kit integration
import { PrivataMigrator } from '@privata/drizzle-compat';

const migrator = new PrivataMigrator(privata);

// Run migrations on both databases
await migrator.migrate({
  identity: './drizzle/identity',
  clinical: './drizzle/clinical'
});
```

**5. Prepared Statements**

```typescript
// Prepared statements work across databases
const getUserWithSessions = users.query.findMany({
  where: (users, { eq }) => eq(users.id, placeholder('userId')),
  with: { sessions: true }
}).prepare();

// Execute (Privata handles compliance automatically)
const user = await getUserWithSessions.execute({ userId: '123' });
```

---

## 🛠️ Migration Tools

### 1. **Automated Migration CLI**

```bash
npm install -g @privata/migrate
```

#### Analyze Existing Code

```bash
# Scan codebase for ORM usage
privata analyze ./src

# Output:
# ✅ Detected ORM: Mongoose
# ✅ Found 15 models
# ✅ Found 142 queries
# ⚠️  Identified 8 PII fields without markers
# ⚠️  Identified 3 PHI fields without markers
# 
# Estimated migration effort: 2-4 hours
# Estimated code changes: 47 lines (3.2%)
```

#### Generate Migration Plan

```bash
privata migrate plan --orm mongoose --output migration-plan.json

# Generates:
# - List of all models to migrate
# - PII/PHI field detection
# - Code changes required
# - Step-by-step migration guide
```

#### Execute Migration

```bash
# Dry run (preview changes)
privata migrate execute --plan migration-plan.json --dry-run

# Apply changes
privata migrate execute --plan migration-plan.json --apply

# Output:
# ✅ Updated User model (added PII markers)
# ✅ Updated Session model (added PHI markers)
# ✅ Updated 15 files
# ✅ Created backup in .privata-backup/
# ✅ Migration complete!
```

### 2. **Smart Field Detection**

```typescript
// File: @privata/migrate/src/analyzers/FieldAnalyzer.ts

export class FieldAnalyzer {
  /**
   * Automatically detect PII/PHI fields by name patterns
   */
  detectSensitiveFields(schema: any): {
    pii: string[];
    phi: string[];
    uncertain: string[];
  } {
    const piiPatterns = [
      /first.*name/i,
      /last.*name/i,
      /email/i,
      /phone/i,
      /address/i,
      /ssn/i,
      /social.*security/i,
      /date.*birth/i,
      /dob/i
    ];

    const phiPatterns = [
      /medical/i,
      /diagnosis/i,
      /prescription/i,
      /treatment/i,
      /symptom/i,
      /allerg/i,
      /condition/i,
      /therapy/i,
      /note/i
    ];

    const pii: string[] = [];
    const phi: string[] = [];
    const uncertain: string[] = [];

    for (const [fieldName, fieldDef] of Object.entries(schema)) {
      if (piiPatterns.some(p => p.test(fieldName))) {
        pii.push(fieldName);
      } else if (phiPatterns.some(p => p.test(fieldName))) {
        phi.push(fieldName);
      } else if (this.isPotentiallySensitive(fieldName)) {
        uncertain.push(fieldName);
      }
    }

    return { pii, phi, uncertain };
  }

  /**
   * Interactive review for uncertain fields
   */
  async reviewUncertainFields(fields: string[]): Promise<{
    pii: string[];
    phi: string[];
    neither: string[];
  }> {
    // CLI interactive prompts
    // User reviews each field and marks as PII/PHI/Neither
  }
}
```

### 3. **Code Transformer**

```typescript
// File: @privata/migrate/src/transformers/CodeTransformer.ts

import * as ts from 'typescript';
import { Project } from 'ts-morph';

export class CodeTransformer {
  /**
   * Transform Mongoose code to Privata
   */
  transformMongooseToPrivata(sourceFile: string): string {
    const project = new Project();
    const file = project.addSourceFileAtPath(sourceFile);

    // 1. Update imports
    this.updateImports(file);

    // 2. Add Privata initialization
    this.addPrivataInit(file);

    // 3. Update model definitions
    this.updateModelDefinitions(file);

    // 4. Update schema markers
    this.addSchemaMarkers(file);

    return file.getFullText();
  }

  private updateImports(file: SourceFile): void {
    // Find: import mongoose from 'mongoose';
    // Replace: import mongoose from 'mongoose';
    //          import { PrivataMongoose } from '@privata/mongoose-compat';
    
    const imports = file.getImportDeclarations();
    const mongooseImport = imports.find(i => 
      i.getModuleSpecifierValue() === 'mongoose'
    );

    if (mongooseImport) {
      // Add Privata import after Mongoose import
      file.addImportDeclaration({
        moduleSpecifier: '@privata/mongoose-compat',
        namedImports: ['PrivataMongoose']
      });
    }
  }

  private addPrivataInit(file: SourceFile): void {
    // Add after imports:
    // const privata = new PrivataMongoose({
    //   connection: mongoose.connection,
    //   compliance: { /* config */ }
    // });

    const lastImport = file.getImportDeclarations().slice(-1)[0];
    
    lastImport.insertText(`

const privata = new PrivataMongoose({
  connection: mongoose.connection,
  compliance: {
    region: 'auto',
    separateData: true,
    enableGDPR: true,
    enableHIPAA: true
  }
});
`);
  }

  private updateModelDefinitions(file: SourceFile): void {
    // Find: mongoose.model('User', userSchema)
    // Replace: privata.model('User', userSchema)

    const calls = file.getDescendantsOfKind(ts.SyntaxKind.CallExpression);
    
    for (const call of calls) {
      const expr = call.getExpression();
      if (expr.getText().includes('mongoose.model')) {
        call.replaceWithText(
          call.getText().replace('mongoose.model', 'privata.model')
        );
      }
    }
  }

  private addSchemaMarkers(file: SourceFile): void {
    // Find schema definitions and add pii/phi markers
    // Based on field name analysis
  }
}
```

---

## 🎨 Code Generation

### 1. **Generate Privata-Compatible Models**

```bash
# From existing Mongoose models
privata generate models --from mongoose --input ./models --output ./models-privata

# From existing Prisma schema
privata generate models --from prisma --schema schema.prisma --output ./generated

# From database schema (introspection)
privata generate models --from database --connection $DATABASE_URL --output ./generated
```

#### Example Output

```typescript
// Input: models/User.js (Mongoose)
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String
});

// Output: models-privata/User.js (Privata-compatible)
import { PrivataMongoose } from '@privata/mongoose-compat';

const userSchema = new mongoose.Schema({
  firstName: { type: String, pii: true },     // Auto-detected
  lastName: { type: String, pii: true },      // Auto-detected
  email: { type: String, pii: true }          // Auto-detected
});

// TypeScript types automatically generated
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// GDPR methods automatically available
export interface UserModel extends Model<User> {
  gdpr: {
    rightToAccess(userId: string, context: GDPRContext): Promise<GDPRAccessResponse>;
    rightToErasure(userId: string, context: GDPRContext): Promise<GDPRErasureResponse>;
    // ... all GDPR methods
  };
}
```

### 2. **Generate Migration Scripts**

```bash
privata generate migration --from mongoose --to privata

# Generates:
# - Database migration scripts (create Identity/Clinical DBs)
# - Data migration scripts (separate PII from PHI)
# - Rollback scripts (in case of issues)
```

#### Example Migration Script

```typescript
// Generated: migrations/001-separate-data.ts

import { MigrationRunner } from '@privata/migrate';

export async function up(runner: MigrationRunner) {
  // 1. Create Identity and Clinical databases
  await runner.createDatabase('identity_db');
  await runner.createDatabase('clinical_db');

  // 2. Migrate User data (PII → Identity DB)
  await runner.migrateCollection({
    from: { db: 'main_db', collection: 'users' },
    to: { db: 'identity_db', collection: 'users' },
    fields: ['firstName', 'lastName', 'email', 'phone'],
    transform: (doc) => ({
      ...doc,
      pseudonym: runner.generatePseudonym()
    })
  });

  // 3. Migrate Session data (PHI → Clinical DB)
  await runner.migrateCollection({
    from: { db: 'main_db', collection: 'sessions' },
    to: { db: 'clinical_db', collection: 'sessions' },
    fields: ['notes', 'recordings', 'therapy_data'],
    linkBy: 'pseudonym'  // Link to identity via pseudonym
  });

  // 4. Verify data integrity
  await runner.verifyIntegrity();
}

export async function down(runner: MigrationRunner) {
  // Rollback: Merge databases back
  await runner.mergeCollections({
    identity: { db: 'identity_db', collection: 'users' },
    clinical: { db: 'clinical_db', collection: 'sessions' },
    into: { db: 'main_db', collection: 'users' },
    joinBy: 'pseudonym'
  });

  await runner.dropDatabase('identity_db');
  await runner.dropDatabase('clinical_db');
}
```

### 3. **Generate Type Definitions**

```bash
privata generate types --from mongoose --output ./types

# Generates TypeScript types with GDPR methods
```

---

## 🧪 Testing Strategy

### 1. **Compatibility Test Suite**

```typescript
// File: @privata/mongoose-compat/tests/compatibility.test.ts

describe('Mongoose Compatibility', () => {
  let privata: PrivataMongoose;
  let User: Model<any>;

  beforeEach(() => {
    privata = new PrivataMongoose(mongoose.connection, { /* config */ });
    User = privata.model('User', userSchema);
  });

  describe('API Compatibility', () => {
    it('should support findById', async () => {
      const user = await User.findById('123');
      expect(user).toBeDefined();
    });

    it('should support find with filters', async () => {
      const users = await User.find({ role: 'patient' });
      expect(Array.isArray(users)).toBe(true);
    });

    it('should support create', async () => {
      const user = await User.create({
        firstName: 'John',
        email: 'john@example.com'
      });
      expect(user._id).toBeDefined();
    });

    it('should support updateOne', async () => {
      await User.updateOne(
        { _id: '123' },
        { firstName: 'Jane' }
      );
    });

    it('should support deleteOne', async () => {
      await User.deleteOne({ _id: '123' });
    });

    it('should support populate', async () => {
      const user = await User.findById('123').populate('sessions');
      expect(user.sessions).toBeDefined();
    });

    it('should support aggregation', async () => {
      const result = await User.aggregate([
        { $match: { role: 'patient' } },
        { $group: { _id: '$region', count: { $sum: 1 } } }
      ]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('GDPR Extensions', () => {
    it('should add GDPR methods', () => {
      expect(User.gdpr).toBeDefined();
      expect(User.gdpr.rightToAccess).toBeInstanceOf(Function);
      expect(User.gdpr.rightToErasure).toBeInstanceOf(Function);
    });

    it('should execute GDPR operations', async () => {
      const result = await User.gdpr.rightToErasure('123', context);
      expect(result.identityDeleted).toBe(true);
    });
  });

  describe('Compliance Features', () => {
    it('should separate PII automatically', async () => {
      const user = await User.create({
        firstName: 'John',  // PII
        email: 'john@example.com'  // PII
      });

      // Verify data is in Identity DB
      const identityRecord = await identityDb.find({ _id: user._id });
      expect(identityRecord.firstName).toBe('John');

      // Verify pseudonym generated
      expect(user.pseudonym).toMatch(/^pseu_/);
    });

    it('should log PHI access', async () => {
      await User.findById('123');

      // Verify audit log created
      const logs = await auditDb.find({ userId: '123' });
      expect(logs.length).toBeGreaterThan(0);
    });
  });
});
```

### 2. **Migration Test Suite**

```typescript
describe('Migration Tools', () => {
  it('should detect PII fields', () => {
    const schema = {
      firstName: String,
      lastName: String,
      email: String,
      age: Number
    };

    const detected = analyzer.detectSensitiveFields(schema);
    
    expect(detected.pii).toContain('firstName');
    expect(detected.pii).toContain('lastName');
    expect(detected.pii).toContain('email');
    expect(detected.pii).not.toContain('age');
  });

  it('should transform Mongoose code', () => {
    const input = `
      import mongoose from 'mongoose';
      const User = mongoose.model('User', userSchema);
    `;

    const output = transformer.transformMongooseToPrivata(input);

    expect(output).toContain('PrivataMongoose');
    expect(output).toContain('privata.model');
  });

  it('should migrate data correctly', async () => {
    await migration.up();

    // Verify Identity DB has PII
    const identityRecords = await identityDb.count();
    expect(identityRecords).toBe(100);

    // Verify Clinical DB has PHI (no PII)
    const clinicalRecords = await clinicalDb.find({});
    clinicalRecords.forEach(record => {
      expect(record.firstName).toBeUndefined();
      expect(record.email).toBeUndefined();
      expect(record.pseudonym).toBeDefined();
    });
  });
});
```

---

## 📊 Migration Comparison Matrix

| ORM | Compatibility Layer | Code Changes | Migration Time | Effort | Use Cases |
|-----|-------------------|--------------|----------------|--------|-----------|
| **Mongoose** | `@privata/mongoose-compat` | < 5% | 30-60 min | Low | MongoDB, Node.js backends |
| **Prisma** | `@privata/prisma-compat` | < 3% | 20-40 min | Very Low | PostgreSQL, MySQL, modern TS |
| **TypeORM** | `@privata/typeorm-compat` | < 8% | 60-90 min | Low-Medium | Enterprise, multi-DB support |
| **Sequelize** | `@privata/sequelize-compat` | < 10% | 90-120 min | Medium | Legacy apps, MySQL/Postgres |
| **SQLite** | `@privata/sqlite-compat` | < 7% | 40-70 min | Low | Edge, mobile, embedded |
| **Drizzle** | `@privata/drizzle-compat` | < 4% | 25-45 min | Very Low | Modern TS, edge, serverless |

---

## 🎯 Migration Success Criteria

### For Developers
- ✅ < 10% code changes required
- ✅ Migration completed in < 2 hours
- ✅ All existing tests still pass
- ✅ Zero breaking changes to API

### For Applications
- ✅ Zero downtime migration possible
- ✅ Rollback available if needed
- ✅ Data integrity guaranteed
- ✅ Performance unchanged or improved

### For Compliance
- ✅ All data properly separated (PII/PHI)
- ✅ All GDPR methods available
- ✅ Audit trail complete
- ✅ Ready for compliance audit

---

## 🚀 Recommended Migration Path

### Phase 1: Preparation (Day 1)
1. Install `@privata/migrate` CLI
2. Run `privata analyze` on codebase
3. Review migration plan
4. Backup database

### Phase 2: Code Migration (Day 1-2)
1. Install compatibility package
2. Run code transformer
3. Add PII/PHI markers
4. Update imports
5. Test locally

### Phase 3: Data Migration (Day 2-3)
1. Generate migration scripts
2. Test on development database
3. Verify data separation
4. Test rollback
5. Execute on staging

### Phase 4: Production (Day 3-4)
1. Schedule maintenance window
2. Execute migration
3. Verify functionality
4. Monitor audit logs
5. Celebrate! 🎉

---

**Total Time:** 3-4 days from start to production  
**Risk Level:** Low (rollback available)  
**Business Impact:** Minimal (< 1 hour downtime)

---

**Privata** - Drop-In Compliance for Any ORM

