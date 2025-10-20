/**
 * SQLite Database Adapter for CLI Demo
 * Handles all database operations for Identity, Clinical, and Audit databases
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import {
  PatientIdentity,
  PatientClinical,
  AuditLog,
  generatePatientIdentities,
  generatePatientClinical,
  generateAuditLogs
} from './seed-data';

export class SqliteAdapter {
  private identityDb: Database.Database;
  private clinicalDb: Database.Database;
  private auditDb: Database.Database;
  private dbPath: string;

  constructor(dbPath: string = path.join(__dirname, '../../databases')) {
    this.dbPath = dbPath;

    // Ensure database directory exists
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    // Initialize databases
    this.identityDb = new Database(path.join(dbPath, 'identity.db'));
    this.clinicalDb = new Database(path.join(dbPath, 'clinical.db'));
    this.auditDb = new Database(path.join(dbPath, 'audit.db'));

    // Enable foreign keys
    this.identityDb.pragma('foreign_keys = ON');
    this.clinicalDb.pragma('foreign_keys = ON');
    this.auditDb.pragma('foreign_keys = ON');
  }

  /**
   * Initialize database schemas
   */
  initializeSchemas(): void {
    // Identity Database Schema
    this.identityDb.exec(`
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        pseudonym TEXT UNIQUE NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zipCode TEXT NOT NULL,
        country TEXT NOT NULL,
        region TEXT NOT NULL CHECK(region IN ('US', 'EU')),
        dateOfBirth TEXT NOT NULL,
        ssn TEXT,
        nationalId TEXT,
        consentGiven INTEGER NOT NULL DEFAULT 0,
        consentDate TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_pseudonym ON patients(pseudonym);
      CREATE INDEX IF NOT EXISTS idx_email ON patients(email);
      CREATE INDEX IF NOT EXISTS idx_region ON patients(region);
    `);

    // Clinical Database Schema
    this.clinicalDb.exec(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id TEXT PRIMARY KEY,
        pseudonym TEXT NOT NULL,
        bloodType TEXT NOT NULL,
        allergies TEXT NOT NULL,
        medications TEXT NOT NULL,
        diagnoses TEXT NOT NULL,
        lastVisitDate TEXT NOT NULL,
        nextAppointmentDate TEXT,
        primaryPhysician TEXT NOT NULL,
        insuranceProvider TEXT NOT NULL,
        policyNumber TEXT NOT NULL,
        medicalHistory TEXT NOT NULL,
        vitalSignsBloodPressure TEXT NOT NULL,
        vitalSignsHeartRate INTEGER NOT NULL,
        vitalSignsTemperature REAL NOT NULL,
        vitalSignsWeight INTEGER NOT NULL,
        vitalSignsHeight INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_clinical_pseudonym ON medical_records(pseudonym);
      CREATE INDEX IF NOT EXISTS idx_last_visit ON medical_records(lastVisitDate);
    `);

    // Audit Database Schema
    this.auditDb.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        action TEXT NOT NULL,
        resourceType TEXT NOT NULL,
        resourceId TEXT NOT NULL,
        pseudonym TEXT NOT NULL,
        userId TEXT NOT NULL,
        userRole TEXT NOT NULL,
        ipAddress TEXT NOT NULL,
        userAgent TEXT NOT NULL,
        purpose TEXT NOT NULL,
        containsPHI INTEGER NOT NULL,
        containsPII INTEGER NOT NULL,
        region TEXT NOT NULL,
        success INTEGER NOT NULL,
        errorMessage TEXT,
        duration INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_timestamp ON audit_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_resource_id ON audit_logs(resourceId);
      CREATE INDEX IF NOT EXISTS idx_pseudonym_audit ON audit_logs(pseudonym);
      CREATE INDEX IF NOT EXISTS idx_user_id ON audit_logs(userId);
    `);
  }

  /**
   * Seed databases with sample data
   */
  seedData(patientCount: number = 10, auditLogCount: number = 50): void {
    // Generate sample data
    const identities = generatePatientIdentities(patientCount);
    const clinical = generatePatientClinical(identities);
    const auditLogs = generateAuditLogs(identities, auditLogCount);

    // Insert identity data
    const insertIdentity = this.identityDb.prepare(`
      INSERT INTO patients (
        id, pseudonym, firstName, lastName, email, phone, address, city, state, zipCode,
        country, region, dateOfBirth, ssn, nationalId, consentGiven, consentDate,
        createdAt, updatedAt
      ) VALUES (
        @id, @pseudonym, @firstName, @lastName, @email, @phone, @address, @city, @state, @zipCode,
        @country, @region, @dateOfBirth, @ssn, @nationalId, @consentGiven, @consentDate,
        @createdAt, @updatedAt
      )
    `);

    const insertIdentities = this.identityDb.transaction((patients: PatientIdentity[]) => {
      for (const patient of patients) {
        insertIdentity.run({
          ...patient,
          consentGiven: patient.consentGiven ? 1 : 0
        });
      }
    });

    insertIdentities(identities);

    // Insert clinical data
    const insertClinical = this.clinicalDb.prepare(`
      INSERT INTO medical_records (
        id, pseudonym, bloodType, allergies, medications, diagnoses,
        lastVisitDate, nextAppointmentDate, primaryPhysician, insuranceProvider,
        policyNumber, medicalHistory, vitalSignsBloodPressure, vitalSignsHeartRate,
        vitalSignsTemperature, vitalSignsWeight, vitalSignsHeight, createdAt, updatedAt
      ) VALUES (
        @id, @pseudonym, @bloodType, @allergies, @medications, @diagnoses,
        @lastVisitDate, @nextAppointmentDate, @primaryPhysician, @insuranceProvider,
        @policyNumber, @medicalHistory, @vitalSignsBloodPressure, @vitalSignsHeartRate,
        @vitalSignsTemperature, @vitalSignsWeight, @vitalSignsHeight, @createdAt, @updatedAt
      )
    `);

    const insertClinicals = this.clinicalDb.transaction((records: PatientClinical[]) => {
      for (const record of records) {
        insertClinical.run({
          id: record.id,
          pseudonym: record.pseudonym,
          bloodType: record.bloodType,
          allergies: JSON.stringify(record.allergies),
          medications: JSON.stringify(record.medications),
          diagnoses: JSON.stringify(record.diagnoses),
          lastVisitDate: record.lastVisitDate,
          nextAppointmentDate: record.nextAppointmentDate,
          primaryPhysician: record.primaryPhysician,
          insuranceProvider: record.insuranceProvider,
          policyNumber: record.policyNumber,
          medicalHistory: record.medicalHistory,
          vitalSignsBloodPressure: record.vitalSigns.bloodPressure,
          vitalSignsHeartRate: record.vitalSigns.heartRate,
          vitalSignsTemperature: record.vitalSigns.temperature,
          vitalSignsWeight: record.vitalSigns.weight,
          vitalSignsHeight: record.vitalSigns.height,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt
        });
      }
    });

    insertClinicals(clinical);

    // Insert audit logs
    const insertAuditLog = this.auditDb.prepare(`
      INSERT INTO audit_logs (
        id, timestamp, action, resourceType, resourceId, pseudonym, userId, userRole,
        ipAddress, userAgent, purpose, containsPHI, containsPII, region, success,
        errorMessage, duration
      ) VALUES (
        @id, @timestamp, @action, @resourceType, @resourceId, @pseudonym, @userId, @userRole,
        @ipAddress, @userAgent, @purpose, @containsPHI, @containsPII, @region, @success,
        @errorMessage, @duration
      )
    `);

    const insertAuditLogs = this.auditDb.transaction((logs: AuditLog[]) => {
      for (const log of logs) {
        insertAuditLog.run({
          ...log,
          containsPHI: log.containsPHI ? 1 : 0,
          containsPII: log.containsPII ? 1 : 0,
          success: log.success ? 1 : 0
        });
      }
    });

    insertAuditLogs(auditLogs);
  }

  /**
   * Get all patients from identity database
   */
  getAllPatients(region?: 'US' | 'EU'): PatientIdentity[] {
    let query = 'SELECT * FROM patients';
    if (region) {
      query += ' WHERE region = ?';
      return this.identityDb.prepare(query).all(region) as PatientIdentity[];
    }
    return this.identityDb.prepare(query).all() as PatientIdentity[];
  }

  /**
   * Get patient by ID
   */
  getPatientById(id: string): PatientIdentity | undefined {
    return this.identityDb.prepare('SELECT * FROM patients WHERE id = ?').get(id) as PatientIdentity | undefined;
  }

  /**
   * Get patient by pseudonym
   */
  getPatientByPseudonym(pseudonym: string): PatientIdentity | undefined {
    return this.identityDb.prepare('SELECT * FROM patients WHERE pseudonym = ?').get(pseudonym) as PatientIdentity | undefined;
  }

  /**
   * Get medical record by pseudonym
   */
  getMedicalRecordByPseudonym(pseudonym: string): PatientClinical | undefined {
    const record = this.clinicalDb.prepare('SELECT * FROM medical_records WHERE pseudonym = ?').get(pseudonym) as any;
    if (!record) return undefined;

    return {
      id: record.id,
      pseudonym: record.pseudonym,
      bloodType: record.bloodType,
      allergies: JSON.parse(record.allergies),
      medications: JSON.parse(record.medications),
      diagnoses: JSON.parse(record.diagnoses),
      lastVisitDate: record.lastVisitDate,
      nextAppointmentDate: record.nextAppointmentDate,
      primaryPhysician: record.primaryPhysician,
      insuranceProvider: record.insuranceProvider,
      policyNumber: record.policyNumber,
      medicalHistory: record.medicalHistory,
      vitalSigns: {
        bloodPressure: record.vitalSignsBloodPressure,
        heartRate: record.vitalSignsHeartRate,
        temperature: record.vitalSignsTemperature,
        weight: record.vitalSignsWeight,
        height: record.vitalSignsHeight
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }

  /**
   * Get complete patient data (joined)
   */
  getCompletePatientData(id: string): any | undefined {
    const identity = this.getPatientById(id);
    if (!identity) return undefined;

    const clinical = this.getMedicalRecordByPseudonym(identity.pseudonym);

    return {
      ...identity,
      clinical
    };
  }

  /**
   * Get all medical records
   */
  getAllMedicalRecords(): any[] {
    const records = this.clinicalDb.prepare('SELECT * FROM medical_records').all() as any[];
    return records.map(record => ({
      id: record.id,
      pseudonym: record.pseudonym,
      bloodType: record.bloodType,
      allergies: JSON.parse(record.allergies),
      medications: JSON.parse(record.medications),
      diagnoses: JSON.parse(record.diagnoses),
      lastVisitDate: record.lastVisitDate,
      nextAppointmentDate: record.nextAppointmentDate,
      primaryPhysician: record.primaryPhysician,
      insuranceProvider: record.insuranceProvider,
      policyNumber: record.policyNumber
    }));
  }

  /**
   * Get audit logs
   */
  getAuditLogs(filters?: {
    action?: string;
    resourceId?: string;
    pseudonym?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): AuditLog[] {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];

    if (filters?.action) {
      query += ' AND action = ?';
      params.push(filters.action);
    }
    if (filters?.resourceId) {
      query += ' AND resourceId = ?';
      params.push(filters.resourceId);
    }
    if (filters?.pseudonym) {
      query += ' AND pseudonym = ?';
      params.push(filters.pseudonym);
    }
    if (filters?.userId) {
      query += ' AND userId = ?';
      params.push(filters.userId);
    }
    if (filters?.startDate) {
      query += ' AND timestamp >= ?';
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      query += ' AND timestamp <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY timestamp DESC';

    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    return this.auditDb.prepare(query).all(...params) as AuditLog[];
  }

  /**
   * Add audit log entry
   */
  addAuditLog(log: Omit<AuditLog, 'id'>): void {
    const insertAuditLog = this.auditDb.prepare(`
      INSERT INTO audit_logs (
        id, timestamp, action, resourceType, resourceId, pseudonym, userId, userRole,
        ipAddress, userAgent, purpose, containsPHI, containsPII, region, success,
        errorMessage, duration
      ) VALUES (
        @id, @timestamp, @action, @resourceType, @resourceId, @pseudonym, @userId, @userRole,
        @ipAddress, @userAgent, @purpose, @containsPHI, @containsPII, @region, @success,
        @errorMessage, @duration
      )
    `);

    const { v4: uuidv4 } = require('uuid');
    insertAuditLog.run({
      id: uuidv4(),
      ...log,
      containsPHI: log.containsPHI ? 1 : 0,
      containsPII: log.containsPII ? 1 : 0,
      success: log.success ? 1 : 0
    });
  }

  /**
   * Update patient identity
   */
  updatePatient(id: string, updates: Partial<PatientIdentity>): void {
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'pseudonym');
    const setClause = fields.map(field => `${field} = @${field}`).join(', ');

    const updateStmt = this.identityDb.prepare(`
      UPDATE patients SET ${setClause}, updatedAt = @updatedAt WHERE id = @id
    `);

    updateStmt.run({
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Delete patient identity (GDPR erasure)
   */
  deletePatientIdentity(id: string): void {
    this.identityDb.prepare('DELETE FROM patients WHERE id = ?').run(id);
  }

  /**
   * Get database statistics
   */
  getStatistics(): any {
    const identityCount = this.identityDb.prepare('SELECT COUNT(*) as count FROM patients').get() as any;
    const clinicalCount = this.clinicalDb.prepare('SELECT COUNT(*) as count FROM medical_records').get() as any;
    const auditCount = this.auditDb.prepare('SELECT COUNT(*) as count FROM audit_logs').get() as any;

    const usCount = this.identityDb.prepare('SELECT COUNT(*) as count FROM patients WHERE region = "US"').get() as any;
    const euCount = this.identityDb.prepare('SELECT COUNT(*) as count FROM patients WHERE region = "EU"').get() as any;

    return {
      identity: {
        total: identityCount.count,
        byRegion: {
          US: usCount.count,
          EU: euCount.count
        }
      },
      clinical: {
        total: clinicalCount.count
      },
      audit: {
        total: auditCount.count
      }
    };
  }

  /**
   * Close all database connections
   */
  close(): void {
    this.identityDb.close();
    this.clinicalDb.close();
    this.auditDb.close();
  }

  /**
   * Clear all data (for testing)
   */
  clearAllData(): void {
    this.identityDb.exec('DELETE FROM patients');
    this.clinicalDb.exec('DELETE FROM medical_records');
    this.auditDb.exec('DELETE FROM audit_logs');
  }

  /**
   * Get database file paths
   */
  getDatabasePaths(): { identity: string; clinical: string; audit: string } {
    return {
      identity: path.join(this.dbPath, 'identity.db'),
      clinical: path.join(this.dbPath, 'clinical.db'),
      audit: path.join(this.dbPath, 'audit.db')
    };
  }
}
