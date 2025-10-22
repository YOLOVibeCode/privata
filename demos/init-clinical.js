// Initialize MongoDB Clinical Database (PHI Data)
// This database stores protected health information

// Switch to clinical database
db = db.getSiblingDB('clinical_db');

// Create users collection for PHI data
db.createCollection('patients');

// Insert sample PHI data
db.patients.insertMany([
  {
    pseudonym: 'PSEUDO_001',
    medical_record_number: 'MRN001',
    diagnosis: 'Type 2 Diabetes',
    medications: ['Metformin 500mg', 'Glipizide 5mg'],
    symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue'],
    allergies: ['Penicillin'],
    blood_type: 'O+',
    emergency_contact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1-555-0101'
    },
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    pseudonym: 'PSEUDO_002',
    medical_record_number: 'MRN002',
    diagnosis: 'Hypertension',
    medications: ['Lisinopril 10mg', 'Amlodipine 5mg'],
    symptoms: ['High blood pressure', 'Headaches'],
    allergies: ['Sulfa drugs'],
    blood_type: 'A+',
    emergency_contact: {
      name: 'John Smith',
      relationship: 'Brother',
      phone: '+1-555-0102'
    },
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    pseudonym: 'PSEUDO_003',
    medical_record_number: 'MRN003',
    diagnosis: 'Asthma',
    medications: ['Albuterol inhaler', 'Fluticasone'],
    symptoms: ['Wheezing', 'Shortness of breath'],
    allergies: ['Dust mites', 'Pollen'],
    blood_type: 'B+',
    emergency_contact: {
      name: 'Mary Johnson',
      relationship: 'Mother',
      phone: '+1-555-0103'
    },
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// Create indexes for performance
db.patients.createIndex({ pseudonym: 1 });
db.patients.createIndex({ medical_record_number: 1 });
db.patients.createIndex({ created_at: 1 });

// Create audit collection for compliance tracking
db.createCollection('audit_logs');

// Insert sample audit logs
db.audit_logs.insertMany([
  {
    pseudonym: 'PSEUDO_001',
    action: 'PHI_ACCESS',
    details: {
      accessed_by: 'Dr. Smith',
      purpose: 'Treatment',
      data_accessed: ['diagnosis', 'medications']
    },
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    created_at: new Date()
  },
  {
    pseudonym: 'PSEUDO_002',
    action: 'DATA_UPDATE',
    details: {
      updated_by: 'Nurse Johnson',
      changes: ['medications'],
      reason: 'Dosage adjustment'
    },
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    created_at: new Date()
  }
]);

// Create indexes for audit logs
db.audit_logs.createIndex({ pseudonym: 1 });
db.audit_logs.createIndex({ action: 1 });
db.audit_logs.createIndex({ created_at: 1 });

print('Clinical database initialized with sample PHI data');
