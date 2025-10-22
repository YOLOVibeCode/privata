import { Privata } from '@privata/core';
import { createODataService, createODataServer } from '@privata/odata';

// Initialize Privata with healthcare configuration
const privata = new Privata({
  database: {
    identity: {
      us: 'mongodb://localhost/healthcare_identity_us',
      eu: 'mongodb://localhost/healthcare_identity_eu'
    },
    clinical: {
      us: 'mongodb://localhost/healthcare_clinical_us',
      eu: 'mongodb://localhost/healthcare_clinical_eu'
    }
  },
  cache: {
    type: 'redis',
    url: 'redis://localhost:6379'
  },
  audit: {
    type: 'elasticsearch',
    url: 'http://localhost:9200'
  },
  compliance: {
    gdpr: {
      enabled: true,
      articles: [15, 16, 17, 18, 20, 21, 22],
      dataRetention: 365
    },
    hipaa: {
      enabled: true,
      safeguards: ['administrative', 'physical', 'technical'],
      breachNotification: true
    }
  }
});

// Create OData service
const odataService = createODataService(privata, {
  baseUrl: 'http://localhost:3000',
  version: '4.0',
  namespace: 'Healthcare',
  compliance: {
    gdpr: true,
    hipaa: true,
    dataProtection: true,
    auditLogging: true
  },
  metadata: {
    title: 'Healthcare OData Service',
    description: 'HIPAA-compliant healthcare data service',
    contact: {
      name: 'Healthcare Team',
      email: 'healthcare@example.com'
    }
  }
});

// Register healthcare entity sets
odataService.registerEntitySet({
  name: 'Patients',
  entityType: 'Patient',
  model: 'Patient',
  permissions: {
    read: true,
    insert: true,
    update: true,
    delete: true
  },
  compliance: {
    pii: true,
    phi: true,
    audit: true
  }
});

odataService.registerEntitySet({
  name: 'MedicalRecords',
  entityType: 'MedicalRecord',
  model: 'MedicalRecord',
  permissions: {
    read: true,
    insert: true,
    update: true,
    delete: false
  },
  compliance: {
    pii: false,
    phi: true,
    audit: true
  }
});

odataService.registerEntitySet({
  name: 'Providers',
  entityType: 'Provider',
  model: 'Provider',
  permissions: {
    read: true,
    insert: true,
    update: true,
    delete: true
  },
  compliance: {
    pii: true,
    phi: false,
    audit: true
  }
});

odataService.registerEntitySet({
  name: 'Appointments',
  entityType: 'Appointment',
  model: 'Appointment',
  permissions: {
    read: true,
    insert: true,
    update: true,
    delete: true
  },
  compliance: {
    pii: true,
    phi: true,
    audit: true
  }
});

// Add function imports
odataService.addFunctionImport({
  name: 'GetPatientSummary',
  returnType: 'PatientSummary',
  parameters: [
    { name: 'patientId', type: 'Edm.Guid' },
    { name: 'includePHI', type: 'Edm.Boolean' }
  ],
  binding: 'Patient',
  entitySet: 'Patients'
});

odataService.addFunctionImport({
  name: 'GetProviderPatients',
  returnType: 'Collection(Patient)',
  parameters: [
    { name: 'providerId', type: 'Edm.Guid' },
    { name: 'activeOnly', type: 'Edm.Boolean' }
  ],
  binding: 'Provider',
  entitySet: 'Patients'
});

// Add action imports
odataService.addActionImport({
  name: 'ExportPatientData',
  returnType: 'ExportResult',
  parameters: [
    { name: 'patientId', type: 'Edm.Guid' },
    { name: 'format', type: 'Edm.String' }
  ],
  binding: 'Patient',
  entitySet: 'Patients'
});

odataService.addActionImport({
  name: 'ScheduleAppointment',
  returnType: 'Appointment',
  parameters: [
    { name: 'patientId', type: 'Edm.Guid' },
    { name: 'providerId', type: 'Edm.Guid' },
    { name: 'dateTime', type: 'Edm.DateTime' }
  ],
  binding: 'Patient',
  entitySet: 'Appointments'
});

// Create OData server
const odataServer = createODataServer(odataService, {
  port: 3000,
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  },
  security: {
    enabled: true,
    rateLimit: {
      windowMs: 60000,
      max: 1000
    }
  },
  logging: {
    enabled: true,
    level: 'info'
  }
});

// Start server
odataServer.start();

console.log('🏥 Healthcare OData Service started!');
console.log('📊 Metadata: http://localhost:3000/$metadata');
console.log('🔒 HIPAA Compliance: Enabled');
console.log('📋 GDPR Compliance: Enabled');
console.log('🛡️ Data Protection: Enabled');

// Example usage
async function demonstrateODataUsage() {
  const userContext = {
    userId: 'user-123',
    role: 'doctor',
    permissions: ['read:patients', 'read:medical-records', 'write:appointments']
  };

  try {
    // Get all patients with PII and PHI access
    console.log('\n📋 Getting all patients...');
    const patients = await odataService.getEntitySet('Patients', {
      $select: 'firstName,lastName,email,medicalRecordNumber,diagnoses',
      $filter: 'active eq true',
      $orderby: 'lastName asc',
      $top: 10
    }, userContext);

    console.log('Patients:', patients.value.length);

    // Get specific patient with medical history
    console.log('\n🏥 Getting patient medical history...');
    const patient = await odataService.getEntity('Patients', 'patient-123', {
      $select: 'firstName,lastName,medicalRecordNumber,diagnoses,medications',
      $expand: 'medicalRecords'
    }, userContext);

    console.log('Patient:', patient.firstName, patient.lastName);

    // Get patient summary using function
    console.log('\n📊 Getting patient summary...');
    const summary = await odataService.callFunction('GetPatientSummary', {
      patientId: 'patient-123',
      includePHI: true
    }, userContext);

    console.log('Patient Summary:', summary);

    // Schedule appointment using action
    console.log('\n📅 Scheduling appointment...');
    const appointment = await odataService.callAction('ScheduleAppointment', {
      patientId: 'patient-123',
      providerId: 'provider-456',
      dateTime: new Date('2024-01-15T10:00:00Z')
    }, userContext);

    console.log('Appointment scheduled:', appointment.id);

    // Export patient data
    console.log('\n📤 Exporting patient data...');
    const exportResult = await odataService.callAction('ExportPatientData', {
      patientId: 'patient-123',
      format: 'json'
    }, userContext);

    console.log('Export result:', exportResult.status);

  } catch (error) {
    console.error('OData operation failed:', error.message);
  }
}

// Run demonstration
demonstrateODataUsage();

export { odataService, odataServer };

