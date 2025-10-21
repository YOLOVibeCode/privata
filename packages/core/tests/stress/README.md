# 🚀 Privata Stress Testing Guide

## Quick Start

### Option 1: SQLite (FASTEST - Recommended for Development)
```bash
# Start server with SQLite (in-memory)
npm run stress:server:sqlite

# In another terminal, run stress test
npm run stress:level1
```

### Option 2: MongoDB (Docker - Production-like)
```bash
# Start Docker services
docker-compose -f tests/stress/docker-compose.yml up -d mongodb-identity mongodb-clinical redis

# Wait for healthy status (~5 seconds)
docker-compose -f tests/stress/docker-compose.yml ps

# Start server with MongoDB
npm run stress:server:mongodb

# Run stress test
npm run stress:level1
```

### Option 3: PostgreSQL (Docker - SQL Compliance)
```bash
# Start Docker services
docker-compose -f tests/stress/docker-compose.yml up -d postgres-identity postgres-clinical redis

# Start server with PostgreSQL
npm run stress:server:postgres

# Run stress test
npm run stress:level1
```

---

## 📊 Database Comparison

| Database   | Latency (P95) | Throughput | Setup Time | Best For |
|------------|---------------|------------|------------|----------|
| **SQLite** | <10ms | Very High | Instant | Fast iteration, CI/CD |
| **MongoDB** | 20-40ms | High | ~5s (Docker) | NoSQL production testing |
| **PostgreSQL** | 30-50ms | Medium | ~5s (Docker) | SQL compliance testing |

---

## 🎯 Performance Targets

### Stress Test Level 1 (Current)
- **Load:** 100 VUs, 2 minutes
- **Error Rate:** <0.1% ✅
- **Cache Hit Rate:** >85% ✅
- **P95 Latency:** <100ms (SQLite: <50ms goal)

### Stress Test Level 2 (Next)
- **Load:** 200 VUs, 5 minutes
- **Error Rate:** <0.1%
- **Cache Hit Rate:** >90%
- **P95 Latency:** <100ms

---

## 🔧 Docker Management

### Start all services:
```bash
docker-compose -f tests/stress/docker-compose.yml up -d
```

### Check health:
```bash
docker-compose -f tests/stress/docker-compose.yml ps
```

### View logs:
```bash
docker-compose -f tests/stress/docker-compose.yml logs -f mongodb-identity
```

### Stop all services:
```bash
docker-compose -f tests/stress/docker-compose.yml down
```

### Clean up (remove volumes):
```bash
docker-compose -f tests/stress/docker-compose.yml down -v
```

---

## 📈 Stress Test Scripts

### Available Scripts:
- `npm run stress:server:sqlite` - SQLite server (fastest)
- `npm run stress:server:mongodb` - MongoDB server
- `npm run stress:server:postgres` - PostgreSQL server
- `npm run stress:level1` - Run Level 1 stress test (2 min)
- `npm run stress:level1:quick` - Quick test (30s)
- `npm run stress:level2` - Run Level 2 stress test (5 min)

---

## 🧪 Testing Strategy

### 1. **Development/Iteration** → Use SQLite
- Fastest feedback loop
- No external dependencies
- Perfect for TDD

### 2. **Integration Testing** → Use MongoDB
- Realistic NoSQL behavior
- Test network latency
- Validate production patterns

### 3. **Compliance Testing** → Use PostgreSQL
- ACID guarantees
- SQL compliance
- Transaction testing

---

## 🎉 Success Criteria

✅ All database types pass Level 1 stress test  
✅ SQLite achieves <50ms P95 latency  
✅ MongoDB/PostgreSQL achieve <100ms P95 latency  
✅ 0% error rate across all databases  
✅ >85% cache hit rate  

---

## 📚 Next Steps

1. ✅ Implement multi-database support
2. ⏳ Performance tuning for <50ms P95
3. ⏳ Stress Test Level 2 (200 req/sec)
4. ⏳ Stress Test Level 3 (500 req/sec)
5. ⏳ CI/CD integration

