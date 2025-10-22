# Contributing to Privata

Thank you for your interest in contributing to Privata! This document provides guidelines and instructions for contributing.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Code Style](#code-style)
5. [Testing](#testing)
6. [Pull Request Process](#pull-request-process)
7. [Package Guidelines](#package-guidelines)
8. [Documentation](#documentation)

---

## 🤝 Code of Conduct

### Our Standards

- **Be respectful** and professional
- **Be inclusive** and welcoming
- **Be constructive** in feedback
- **Focus on the code**, not the person
- **Help others** learn and grow

### Unacceptable Behavior

- Harassment, discrimination, or hate speech
- Trolling or insulting comments
- Publishing private information
- Spam or excessive self-promotion

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**
- **TypeScript** knowledge

### Setup Development Environment

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/privata.git
cd privata

# 3. Add upstream remote
git remote add upstream https://github.com/privata/privata.git

# 4. Install dependencies
npm install

# 5. Bootstrap monorepo
npm run bootstrap

# 6. Build all packages
npm run build

# 7. Run tests
npm test
```

### Project Structure

```
privata/
├── packages/               # All NPM packages
│   ├── core/              # Core library
│   ├── adapters/          # Database adapters
│   ├── extensions/        # Optional extensions
│   └── infrastructure/    # Infrastructure adapters
├── docs/                  # Documentation
├── examples/              # Example applications
└── tests/                 # Integration & E2E tests
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed information.

---

## 🔄 Development Workflow

### 1. Create a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Convention

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/sqlite-adapter` |
| Bug Fix | `fix/description` | `fix/cache-invalidation` |
| Docs | `docs/description` | `docs/update-readme` |
| Refactor | `refactor/description` | `refactor/query-builder` |
| Test | `test/description` | `test/add-e2e-tests` |

### 2. Make Changes

```bash
# Navigate to relevant package
cd packages/core

# Make changes to source code
vim src/Privata.ts

# Run tests in watch mode
npm run test:watch

# Check linting
npm run lint

# Format code
npm run format
```

### 3. Commit Changes

We use **Conventional Commits** format:

```bash
git add .
git commit -m "feat(core): add pseudonymization support"
```

#### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(mongoose): add support for subdocuments
fix(cache): resolve race condition in Redis adapter
docs(api): update GDPR method documentation
test(prisma): add integration tests for compliance
refactor(core): simplify query builder logic
```

### 4. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

---

## 🎨 Code Style

### TypeScript Guidelines

#### 1. **Use TypeScript strictly**

```typescript
// ✅ Good
function getUserById(id: string): Promise<User> {
  return this.database.findOne({ id });
}

// ❌ Bad - no types
function getUserById(id) {
  return this.database.findOne({ id });
}
```

#### 2. **Avoid `any`**

```typescript
// ✅ Good
function processData<T>(data: T): T {
  return data;
}

// ❌ Bad
function processData(data: any): any {
  return data;
}
```

#### 3. **Use interfaces over types**

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

// ⚠️ Acceptable for unions/intersections
type UserOrAdmin = User | Admin;
```

#### 4. **Prefer explicit return types**

```typescript
// ✅ Good
async function getUsers(): Promise<User[]> {
  return await this.database.find();
}

// ⚠️ Acceptable for simple cases
const count = (arr: number[]) => arr.length;
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Classes | PascalCase | `Privata`, `MongooseAdapter` |
| Interfaces | PascalCase with `I` prefix | `IAdapter`, `ICache` |
| Functions | camelCase | `getUserById`, `validateSchema` |
| Variables | camelCase | `userId`, `isValid` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |
| Private members | prefix with `_` | `_cache`, `_connection` |

### Code Organization

```typescript
// 1. Imports (grouped and sorted)
import { Model } from 'mongoose';  // External
import { Privata } from '../core';  // Internal

// 2. Interfaces/Types
interface UserOptions {
  region: 'US' | 'EU';
}

// 3. Constants
const MAX_RETRIES = 3;

// 4. Class/Function implementation
export class UserService {
  // Public properties first
  public readonly region: string;
  
  // Private properties
  private _cache: Cache;
  
  // Constructor
  constructor(options: UserOptions) {
    this.region = options.region;
  }
  
  // Public methods
  public async getUser(id: string): Promise<User> {
    // Implementation
  }
  
  // Private methods
  private _validateId(id: string): boolean {
    // Implementation
  }
}
```

---

## 🧪 Testing

### Testing Requirements

| Test Type | Coverage | Required |
|-----------|----------|----------|
| Unit Tests | > 90% | ✅ Yes |
| Integration Tests | > 85% | ✅ Yes |
| E2E Tests | Key flows | ✅ Yes |

### Writing Tests

#### Unit Tests

```typescript
// UserService.test.ts
import { UserService } from './UserService';

describe('UserService', () => {
  let service: UserService;
  
  beforeEach(() => {
    service = new UserService({ region: 'US' });
  });
  
  describe('getUser', () => {
    it('should return user by id', async () => {
      const user = await service.getUser('123');
      expect(user.id).toBe('123');
    });
    
    it('should throw error for invalid id', async () => {
      await expect(service.getUser('')).rejects.toThrow();
    });
  });
});
```

#### Integration Tests

```typescript
// mongoose.integration.test.ts
import { Privata } from 'privata';
import { PrivataMongoose } from '@privata/mongoose-compat';

describe('Mongoose Integration', () => {
  it('should perform GDPR erasure correctly', async () => {
    const privata = new PrivataMongoose(/* config */);
    const User = privata.model('User', schema);
    
    // Create user
    const user = await User.create({ name: 'John' });
    
    // Erase user
    await User.gdpr.rightToErasure(user.id, context);
    
    // Verify erasure
    const deleted = await User.findById(user.id);
    expect(deleted).toBeNull();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific package
cd packages/core
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

---

## 📥 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests are passing (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Documentation is updated
- [ ] Changelog is updated (if applicable)
- [ ] No merge conflicts with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Tests pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## Screenshots (if applicable)
```

### Review Process

1. **Automated checks** run (CI/CD)
2. **Code review** by maintainers
3. **Changes requested** (if needed)
4. **Approval** by at least 1 maintainer
5. **Merge** to main branch

### After Merge

- Your branch will be deleted
- Changes will be included in next release
- You'll be added to contributors list 🎉

---

## 📦 Package Guidelines

### Creating a New Package

```bash
# Use generator
npm run create-package -- --name @privata/new-adapter

# Or manually:
mkdir -p packages/adapters/new-adapter
cd packages/adapters/new-adapter
```

### Package Structure

```
packages/adapters/new-adapter/
├── src/
│   ├── index.ts              # Public API
│   ├── NewAdapter.ts         # Main implementation
│   └── types.ts              # Type definitions
├── tests/
│   ├── NewAdapter.test.ts
│   └── integration.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

### package.json Template

```json
{
  "name": "@privata/new-adapter",
  "version": "0.1.0",
  "description": "Description of adapter",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src --ext .ts"
  },
  "peerDependencies": {
    "privata": "^0.1.0"
  },
  "keywords": ["privata", "gdpr", "hipaa"],
  "author": "Privata Team",
  "license": "MIT"
}
```

---

## 📖 Documentation

### Documentation Requirements

All public APIs must be documented with **TSDoc**:

```typescript
/**
 * Retrieves a user by their unique identifier.
 * 
 * @param id - The user's unique identifier
 * @param options - Optional query options
 * @returns Promise resolving to the user object
 * @throws {NotFoundError} If user doesn't exist
 * 
 * @example
 * ```typescript
 * const user = await User.findById('123');
 * console.log(user.name);
 * ```
 */
public async findById(
  id: string,
  options?: QueryOptions
): Promise<User> {
  // Implementation
}
```

### Documentation Checklist

- [ ] TSDoc comments for all public methods
- [ ] Code examples in documentation
- [ ] README.md in package root
- [ ] Update relevant guides in `docs/guides/`
- [ ] Update API reference in `docs/api/`

---

## 🏆 Recognition

### Contributors

All contributors are recognized:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Shown on project website

### Becoming a Maintainer

Active contributors may be invited to become maintainers. Criteria:
- Consistent quality contributions
- Code reviews and helping others
- Understanding of project architecture
- Alignment with project values

---

## 📞 Getting Help

### Questions?

- **Discord:** https://discord.gg/privata
- **GitHub Discussions:** https://github.com/privata/privata/discussions
- **Email:** contribute@privata.dev

### Reporting Issues

Use GitHub Issues with appropriate labels:
- `bug` - Something isn't working
- `feature` - New feature request
- `docs` - Documentation improvements
- `question` - Questions about usage

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Privata!** 🎉

Every contribution, no matter how small, makes a difference.

