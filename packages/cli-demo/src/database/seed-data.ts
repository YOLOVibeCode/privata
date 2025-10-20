/**
 * Sample Seed Data for Demonstration
 * Generates realistic test data for GDPR/HIPAA demonstration
 */

import { v4 as uuidv4 } from 'uuid';

export interface PatientIdentity {
  id: string;
  pseudonym: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  region: 'US' | 'EU';
  dateOfBirth: string;
  ssn?: string;
  nationalId?: string;
  consentGiven: boolean;
  consentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientClinical {
  id: string;
  pseudonym: string;
  bloodType: string;
  allergies: string[];
  medications: string[];
  diagnoses: string[];
  lastVisitDate: string;
  nextAppointmentDate: string | null;
  primaryPhysician: string;
  insuranceProvider: string;
  policyNumber: string;
  medicalHistory: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  resourceType: string;
  resourceId: string;
  pseudonym: string;
  userId: string;
  userRole: string;
  ipAddress: string;
  userAgent: string;
  purpose: string;
  containsPHI: boolean;
  containsPII: boolean;
  region: string;
  success: boolean;
  errorMessage?: string;
  duration: number;
}

/**
 * Generate sample patient identity data
 */
export function generatePatientIdentities(count: number = 10): PatientIdentity[] {
  const identities: PatientIdentity[] = [];

  const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa', 'William', 'Maria'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'London', 'Paris', 'Berlin', 'Madrid', 'Rome'];
  const regions: ('US' | 'EU')[] = ['US', 'US', 'US', 'US', 'US', 'EU', 'EU', 'EU', 'US', 'EU'];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const region = regions[i % regions.length];
    const pseudonym = `PSN-${uuidv4().substring(0, 8).toUpperCase()}`;

    identities.push({
      id: uuidv4(),
      pseudonym,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: region === 'US' ? `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}` : `+44-20-${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
      address: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Maple', 'Cedar', 'Pine'][i % 5]} Street`,
      city: cities[i % cities.length],
      state: region === 'US' ? ['NY', 'CA', 'TX', 'FL', 'IL'][i % 5] : ['England', 'Île-de-France', 'Bavaria', 'Madrid', 'Lazio'][i % 5],
      zipCode: region === 'US' ? String(Math.floor(Math.random() * 90000) + 10000) : String(Math.floor(Math.random() * 9000) + 1000),
      country: region === 'US' ? 'United States' : ['United Kingdom', 'France', 'Germany', 'Spain', 'Italy'][i % 5],
      region,
      dateOfBirth: `${Math.floor(Math.random() * 30) + 1960}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      ssn: region === 'US' ? `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}` : undefined,
      nationalId: region === 'EU' ? `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 90000000) + 10000000}` : undefined,
      consentGiven: Math.random() > 0.2,
      consentDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 730 * 24 * 60 * 60 * 1000)).toISOString(),
      updatedAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
    });
  }

  return identities;
}

/**
 * Generate sample patient clinical data
 */
export function generatePatientClinical(identities: PatientIdentity[]): PatientClinical[] {
  const clinical: PatientClinical[] = [];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const allergies = [
    ['Penicillin', 'Peanuts'],
    ['None'],
    ['Latex', 'Shellfish'],
    ['Aspirin'],
    ['Sulfa drugs'],
    ['None'],
    ['Bee stings', 'Dust mites'],
    ['Dairy', 'Gluten'],
    ['None'],
    ['Iodine']
  ];
  const medications = [
    ['Lisinopril 10mg', 'Metformin 500mg'],
    ['None'],
    ['Atorvastatin 20mg'],
    ['Levothyroxine 50mcg', 'Omeprazole 20mg'],
    ['Amlodipine 5mg'],
    ['None'],
    ['Albuterol inhaler'],
    ['Sertraline 50mg', 'Vitamin D'],
    ['None'],
    ['Warfarin 5mg', 'Metoprolol 25mg']
  ];
  const diagnoses = [
    ['Hypertension', 'Type 2 Diabetes'],
    ['Healthy'],
    ['Hyperlipidemia'],
    ['Hypothyroidism', 'GERD'],
    ['Essential Hypertension'],
    ['Healthy'],
    ['Asthma'],
    ['Generalized Anxiety Disorder'],
    ['Healthy'],
    ['Atrial Fibrillation', 'Hypertension']
  ];
  const physicians = ['Dr. Sarah Chen', 'Dr. Michael Roberts', 'Dr. Emily Martinez', 'Dr. James Wilson', 'Dr. Lisa Anderson'];
  const insuranceProviders = ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Humana'];

  identities.forEach((identity, i) => {
    clinical.push({
      id: uuidv4(),
      pseudonym: identity.pseudonym,
      bloodType: bloodTypes[i % bloodTypes.length],
      allergies: allergies[i % allergies.length],
      medications: medications[i % medications.length],
      diagnoses: diagnoses[i % diagnoses.length],
      lastVisitDate: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      nextAppointmentDate: Math.random() > 0.3
        ? new Date(Date.now() + Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
        : null,
      primaryPhysician: physicians[i % physicians.length],
      insuranceProvider: insuranceProviders[i % insuranceProviders.length],
      policyNumber: `POL-${Math.floor(Math.random() * 900000) + 100000}`,
      medicalHistory: `Patient has a history of ${diagnoses[i % diagnoses.length].join(', ').toLowerCase()}. Regular checkups scheduled.`,
      vitalSigns: {
        bloodPressure: `${Math.floor(Math.random() * 40) + 110}/${Math.floor(Math.random() * 30) + 70}`,
        heartRate: Math.floor(Math.random() * 40) + 60,
        temperature: Math.round((Math.random() * 2 + 97) * 10) / 10,
        weight: Math.floor(Math.random() * 80) + 120,
        height: Math.floor(Math.random() * 20) + 160
      },
      createdAt: identity.createdAt,
      updatedAt: identity.updatedAt
    });
  });

  return clinical;
}

/**
 * Generate sample audit logs
 */
export function generateAuditLogs(identities: PatientIdentity[], count: number = 50): AuditLog[] {
  const logs: AuditLog[] = [];

  const actions = [
    'ACCESS_IDENTITY',
    'ACCESS_CLINICAL',
    'UPDATE_IDENTITY',
    'UPDATE_CLINICAL',
    'GDPR_ACCESS_REQUEST',
    'GDPR_RECTIFICATION',
    'GDPR_ERASURE',
    'HIPAA_PHI_ACCESS',
    'CONSENT_GRANTED',
    'CONSENT_WITHDRAWN'
  ];
  const resourceTypes = ['Patient', 'MedicalRecord', 'Appointment', 'Prescription', 'LabResult'];
  const userRoles = ['physician', 'nurse', 'administrator', 'patient', 'system'];
  const purposes = ['treatment', 'payment', 'healthcare-operations', 'patient-request', 'system-maintenance'];
  const ipAddresses = ['192.168.1.100', '192.168.1.101', '10.0.0.50', '172.16.0.10', '203.0.113.25'];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'PrivataHealthApp/1.0.0',
    'PrivataAPIClient/2.3.1',
    'PrivataBackgroundJob/1.0'
  ];

  for (let i = 0; i < count; i++) {
    const identity = identities[Math.floor(Math.random() * identities.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const success = Math.random() > 0.05; // 95% success rate

    logs.push({
      id: uuidv4(),
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
      action,
      resourceType: resourceTypes[Math.floor(Math.random() * resourceTypes.length)],
      resourceId: identity.id,
      pseudonym: identity.pseudonym,
      userId: `user-${Math.floor(Math.random() * 20) + 1}`,
      userRole: userRoles[Math.floor(Math.random() * userRoles.length)],
      ipAddress: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      purpose: purposes[Math.floor(Math.random() * purposes.length)],
      containsPHI: action.includes('CLINICAL') || action.includes('PHI') || action.includes('HIPAA'),
      containsPII: action.includes('IDENTITY') || action.includes('GDPR'),
      region: identity.region,
      success,
      errorMessage: success ? undefined : 'Access denied: Insufficient permissions',
      duration: Math.floor(Math.random() * 500) + 50
    });
  }

  // Sort by timestamp descending
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return logs;
}
