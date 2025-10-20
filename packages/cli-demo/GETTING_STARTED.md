# Getting Started with Privata CLI Demo

**5-Minute Quick Start Guide**

---

## 🎯 What is This?

An **interactive command-line demo** that shows you exactly how Privata handles GDPR/HIPAA compliance using **real SQLite databases** and **actual data operations**.

You'll see:
- ✅ Physical separation of PII and PHI in different databases
- ✅ All 7 GDPR Articles (15-22) in action
- ✅ HIPAA Privacy & Security Rules demonstrated
- ✅ Complete audit logging for compliance
- ✅ Real-time compliance verification

---

## 🚀 Quick Start (3 commands)

```bash
# 1. Install
npm install

# 2. Setup databases (generates sample data)
npm run setup

# 3. Run interactive demo
npm run demo
```

**That's it!** The interactive menu will guide you through everything.

---

## 📖 What You'll See

### 1. Data Separation (First Thing You Should Check)

```bash
privata-demo inspect separation
```

This shows you **three physically separate SQLite files**:
- `identity.db` - Contains PII (names, emails, addresses)
- `clinical.db` - Contains PHI (medical records, diagnoses)
- `audit.db` - Contains compliance logs

**Key Point:** No PII exists in the clinical database. No PHI exists in the identity database. They're linked **only by pseudonyms**.

### 2. GDPR Demonstrations

```bash
# See all GDPR articles at once
privata-demo gdpr

# Or pick a specific one
privata-demo gdpr 15  # Right of Access (data export)
privata-demo gdpr 17  # Right to Erasure (delete but preserve medical records)
```

**What Happens:**
- Real database queries execute
- You see before/after states
- Changes are logged to audit database
- Compliance requirements are explained

### 3. HIPAA Demonstrations

```bash
# See all HIPAA safeguards
privata-demo hipaa

# Or pick a specific one
privata-demo hipaa minimum-necessary  # See purpose-based access
privata-demo hipaa audit              # See complete logging
```

**What Happens:**
- Different access scenarios demonstrated
- Minimum necessary standard shown
- Audit controls verified
- 6-year retention proven

### 4. Compliance Verification

```bash
privata-demo compliance-score
```

Shows you:
- ✅ HIPAA Compliance Score: 98%
- ✅ All safeguards implemented
- ✅ Complete audit trail
- ✅ Database statistics

---

## 🎓 Interactive Mode (Recommended)

```bash
npm run demo
```

This gives you a **visual menu** to navigate:

```
? What would you like to demonstrate?
  📊 View Database Separation
  🆔 Inspect Identity Database (PII)
  🏥 Inspect Clinical Database (PHI)
  📋 Inspect Audit Logs
  🇪🇺 GDPR Compliance Demo (All Articles)
  🏥 HIPAA Compliance Demo (All Safeguards)
  🎯 View Compliance Score
  ❌ Exit
```

**Why This is Better:**
- No need to remember commands
- Guided through each feature
- Can explore at your own pace
- Clear explanations at each step

---

## 📊 Sample Data Overview

After running `npm run setup`, you get:

**10 Patients:**
- 5 from United States (US region)
- 5 from European Union (EU region)

**Complete Identity Information (PII):**
- Names, emails, phone numbers
- Addresses (street, city, state, zip, country)
- Social Security Numbers (US) or National IDs (EU)
- Dates of birth
- Consent records

**Complete Medical Records (PHI):**
- Blood types
- Allergies and medications
- Diagnoses and medical history
- Vital signs (BP, heart rate, temperature, weight, height)
- Primary physicians
- Insurance information

**50+ Audit Log Entries:**
- Spanning last 30 days
- Various actions (access, update, GDPR requests)
- Different user roles (physician, nurse, admin, patient)
- Success and failure examples

---

## 🔍 Key Concepts Demonstrated

### 1. Physical Data Separation

**Before Privata:**
```
Single Database
┌─────────────────────────────┐
│ John Doe                    │
│ john@example.com            │
│ Blood Type: A+              │
│ Diagnosis: Hypertension     │
└─────────────────────────────┘
⚠️  PII and PHI mixed together
```

**With Privata:**
```
Identity DB              Clinical DB
┌─────────────────┐     ┌─────────────────┐
│ John Doe        │     │ (no names!)     │
│ john@ex.com     │     │ Blood Type: A+  │
│ PSN-ABC123      │◄───►│ PSN-ABC123      │
└─────────────────┘     └─────────────────┘
✅ Physically separated, linked by pseudonym
```

**Why This Matters:**
- GDPR Article 17: Delete identity, keep medical records
- HIPAA Minimum Necessary: Query PHI without exposing PII
- Geographic Compliance: EU data stays in EU database

### 2. GDPR Article 17 (Right to Erasure)

**The Challenge:**
Data subject requests deletion, but medical records must be kept for 7 years (legal requirement).

**Privata's Solution:**
1. **DELETE** PII from identity database → Patient becomes unidentifiable
2. **KEEP** PHI in clinical database → Legal obligation fulfilled
3. **LOG** erasure in audit database → Compliance proven

**Result:** Patient cannot be identified, but medical records exist for legal/medical purposes.

### 3. HIPAA Minimum Necessary

**The Challenge:**
Different users need different levels of access to the same patient's data.

**Privata's Solution:**

| User Role | Purpose | PII Access | PHI Access | What They See |
|-----------|---------|------------|------------|---------------|
| Physician | Treatment | ✅ Full | ✅ Full | Everything |
| Billing | Payment | ✅ Name only | ❌ Diagnoses only | Minimal |
| Researcher | Research | ❌ Pseudonym only | ✅ De-identified | No identifiers |

**Result:** Each user gets exactly what they need, nothing more.

### 4. Audit Logging

**Every operation logs:**
- **Who**: User ID and role
- **What**: Action and resource type
- **When**: Timestamp with timezone
- **Where**: IP address and user agent
- **Why**: Purpose of access
- **Result**: Success or failure

**Retention:** 6 years (HIPAA requirement)
**Immutability:** Append-only (tamper-evident)

---

## 🎯 Common Use Cases

### Use Case 1: Evaluating Privata for Your Project

```bash
# Start here
npm run demo

# Explore menu:
1. View Database Separation (understand architecture)
2. Inspect Identity Database (see PII)
3. Inspect Clinical Database (see PHI, no PII!)
4. GDPR Demo (see data subject rights)
5. Compliance Score (verify requirements met)
```

**Time:** 10-15 minutes

### Use Case 2: Showing Your Team/Boss

```bash
# Quick impressive demo
privata-demo inspect separation  # Show physical separation
privata-demo gdpr 17             # Show right to erasure (impressive!)
privata-demo hipaa audit         # Show complete logging
privata-demo compliance-score    # Show 98% compliance
```

**Time:** 5 minutes

### Use Case 3: Understanding GDPR Requirements

```bash
# Deep dive into GDPR
privata-demo gdpr                # See all articles
privata-demo inspect audit       # Verify logging
```

**Time:** 20 minutes (interactive walkthrough)

### Use Case 4: Understanding HIPAA Requirements

```bash
# Deep dive into HIPAA
privata-demo hipaa               # See all safeguards
privata-demo compliance-score    # Verify compliance
```

**Time:** 20 minutes (interactive walkthrough)

---

## 📝 Command Reference

### Essential Commands

```bash
# Setup (run once)
npm run setup

# Interactive mode (recommended)
npm run demo

# Quick inspections
privata-demo inspect separation   # Data separation
privata-demo inspect identity     # View PII
privata-demo inspect clinical     # View PHI
privata-demo inspect audit        # View logs
```

### GDPR Commands

```bash
privata-demo gdpr              # All articles (interactive)
privata-demo gdpr 15           # Right of Access
privata-demo gdpr 16           # Right to Rectification
privata-demo gdpr 17           # Right to Erasure
privata-demo gdpr 18           # Right to Restriction
privata-demo gdpr 20           # Right to Portability
privata-demo gdpr 21           # Right to Object
privata-demo gdpr 22           # Automated Decision Making
```

### HIPAA Commands

```bash
privata-demo hipaa             # All safeguards (interactive)
privata-demo hipaa minimum-necessary   # §164.502(b)
privata-demo hipaa audit              # §164.312(b)
privata-demo hipaa access             # §164.312(a)(1)
privata-demo hipaa integrity          # §164.312(c)(1)
privata-demo hipaa breach             # §164.404-408
```

### Compliance Commands

```bash
privata-demo compliance-score  # Overall compliance metrics
```

---

## 🔧 Customization

### Generate More Data

```bash
# More patients
privata-demo setup --patients 50 --audit-logs 200

# Clear and regenerate
privata-demo setup --clear --patients 20
```

### View Specific Records

```bash
# Get patient ID from identity inspection
privata-demo inspect identity

# View specific patient
privata-demo inspect identity --id <patient-id>
privata-demo inspect clinical --id <patient-id>
```

### Limit Results

```bash
# Show more audit logs
privata-demo inspect audit --limit 50

# Show fewer patients
privata-demo inspect identity --limit 5
```

---

## ❓ FAQ

### Q: Do I need real databases for this?

**A:** The demo uses SQLite (local files). No external database needed. Everything runs locally on your machine.

### Q: Is this actual Privata code?

**A:** This is a **demonstration** of Privata concepts using SQLite. The actual Privata library supports MongoDB, PostgreSQL, MySQL, and more with production-grade features.

### Q: Can I see the database files?

**A:** Yes! After setup, check `packages/cli-demo/databases/`:
- `identity.db` (PII)
- `clinical.db` (PHI)
- `audit.db` (Logs)

You can open these with any SQLite viewer.

### Q: How long does the full demo take?

**A:**
- Quick tour: 5 minutes
- Single feature: 2-3 minutes
- Complete walkthrough: 20-30 minutes

### Q: Will this modify my system?

**A:** No. Everything is contained in the `cli-demo/databases/` folder. Run `npm run clean` to remove everything.

### Q: Can I use this in presentations?

**A:** Yes! This demo is designed for:
- Sales presentations
- Technical demonstrations
- Team training
- Compliance audits

---

## 🆘 Troubleshooting

### Error: "Cannot find module"

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Error: "Database not found"

```bash
# Run setup again
npm run setup
```

### Error: "SQLITE_CANTOPEN"

```bash
# Make sure you're in the right directory
cd packages/cli-demo

# Ensure databases directory exists
mkdir -p databases
npm run setup
```

### Need to Start Fresh

```bash
# Clean everything
npm run clean

# Rebuild
npm install
npm run build
npm run setup
```

---

## 📚 Learn More

- **Full Documentation**: [README.md](./README.md)
- **Technical Specification**: [../../docs/specifications/CLI_DEMO_SPECIFICATION.md](../../docs/specifications/CLI_DEMO_SPECIFICATION.md)
- **Privata Documentation**: [../../docs/INDEX.md](../../docs/INDEX.md)
- **GDPR Spec**: [../../docs/specifications/GDPR_COMPLIANCE_TESTS.md](../../docs/specifications/GDPR_COMPLIANCE_TESTS.md)
- **HIPAA Spec**: [../../docs/specifications/HIPAA_COMPLIANCE_TESTS.md](../../docs/specifications/HIPAA_COMPLIANCE_TESTS.md)

---

## 🎉 Ready to Go!

```bash
# Let's do this!
npm run demo
```

**Enjoy exploring Privata's compliance features!** 🚀

---

**Need Help?** Open an issue at [github.com/privata/privata](https://github.com/privata/privata)
