import { Router } from 'express';
import { Privata } from '@privata/core';
import { createQueryBuilder } from '@privata/query-builder';
import { authenticateToken } from '../middleware/auth';
import { validatePatientData } from '../middleware/validation';

export const patientRoutes = (privata: Privata) => {
  const router = Router();

  // Register patient model
  privata.registerModel('Patient', {
    pii: ['firstName', 'lastName', 'email', 'phone', 'address', 'dateOfBirth', 'ssn'],
    phi: ['medicalRecordNumber', 'diagnoses', 'treatments', 'medications', 'allergies', 'vitalSigns'],
    metadata: ['createdAt', 'updatedAt', 'lastVisit', 'providerId', 'insuranceId']
  });

  // Get patient profile
  router.get('/profile/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if user can access this patient data
      const canAccess = await privata.checkAccessPermissions(userId, `patient:${id}`, 'read');
      if (!canAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get patient data with compliance
      const patient = await privata.find('Patient', { id }, {
        includePII: true,
        includePHI: true,
        complianceMode: 'strict'
      });

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      res.json(patient);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update patient profile
  router.put('/profile/:id', authenticateToken, validatePatientData, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      // Check if user can update this patient data
      const canUpdate = await privata.checkAccessPermissions(userId, `patient:${id}`, 'update');
      if (!canUpdate) {
        return res.status(403).json({ error: 'Update access denied' });
      }

      // Update patient with compliance
      const updatedPatient = await privata.update('Patient', { id }, updates, {
        complianceMode: 'strict',
        auditLog: true
      });

      res.json(updatedPatient);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Search patients
  router.get('/search', authenticateToken, async (req, res) => {
    try {
      const { q, page = 1, limit = 10 } = req.query;
      const userId = req.user.id;

      // Check if user can search patients
      const canSearch = await privata.checkAccessPermissions(userId, 'patients', 'search');
      if (!canSearch) {
        return res.status(403).json({ error: 'Search access denied' });
      }

      // Build query with compliance
      const query = createQueryBuilder(privata, 'Patient')
        .where('firstName', 'like', `%${q}%`)
        .or('lastName', 'like', `%${q}%`)
        .or('email', 'like', `%${q}%`)
        .page(Number(page), Number(limit))
        .complianceMode('strict')
        .withPII()
        .withoutPHI(); // Don't include PHI in search results

      const result = await query.execute();

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get patient medical history
  router.get('/:id/medical-history', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if user can access medical history
      const canAccess = await privata.checkAccessPermissions(userId, `patient:${id}:medical`, 'read');
      if (!canAccess) {
        return res.status(403).json({ error: 'Medical history access denied' });
      }

      // Get medical history with PHI access
      const medicalHistory = await privata.find('Patient', { id }, {
        includePHI: true,
        complianceMode: 'strict',
        purpose: 'medical-care',
        legalBasis: 'vital-interests'
      });

      if (!medicalHistory) {
        return res.status(404).json({ error: 'Medical history not found' });
      }

      res.json(medicalHistory);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new patient
  router.post('/', authenticateToken, validatePatientData, async (req, res) => {
    try {
      const userId = req.user.id;
      const patientData = req.body;

      // Check if user can create patients
      const canCreate = await privata.checkAccessPermissions(userId, 'patients', 'create');
      if (!canCreate) {
        return res.status(403).json({ error: 'Patient creation access denied' });
      }

      // Create patient with compliance
      const patient = await privata.create('Patient', patientData, {
        complianceMode: 'strict',
        auditLog: true,
        purpose: 'patient-registration',
        legalBasis: 'consent'
      });

      res.status(201).json(patient);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete patient (soft delete)
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if user can delete patients
      const canDelete = await privata.checkAccessPermissions(userId, `patient:${id}`, 'delete');
      if (!canDelete) {
        return res.status(403).json({ error: 'Patient deletion access denied' });
      }

      // Soft delete with compliance
      await privata.softDelete('Patient', { id }, {
        complianceMode: 'strict',
        auditLog: true,
        reason: 'Patient deletion requested',
        evidence: 'User request via API'
      });

      res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};

