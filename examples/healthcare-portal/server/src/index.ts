import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Privata } from '@privata/core';
import { createQueryBuilder } from '@privata/query-builder';
import { MonitoringService } from '@privata/enterprise';
import { authRoutes } from './routes/auth';
import { patientRoutes } from './routes/patients';
import { medicalRoutes } from './routes/medical';
import { complianceRoutes } from './routes/compliance';
import { privacyRoutes } from './routes/privacy';
import { errorHandler } from './middleware/errorHandler';
import { complianceMiddleware } from './middleware/compliance';
import { auditMiddleware } from './middleware/audit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Privata
const privata = new Privata({
  database: {
    identity: {
      us: process.env.IDENTITY_DB_US || 'mongodb://localhost/healthcare_identity_us',
      eu: process.env.IDENTITY_DB_EU || 'mongodb://localhost/healthcare_identity_eu'
    },
    clinical: {
      us: process.env.CLINICAL_DB_US || 'mongodb://localhost/healthcare_clinical_us',
      eu: process.env.CLINICAL_DB_EU || 'mongodb://localhost/healthcare_clinical_eu'
    }
  },
  cache: {
    type: 'redis',
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  audit: {
    type: 'elasticsearch',
    url: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
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

// Initialize monitoring
const monitoring = new MonitoringService(privata, {
  enabled: true,
  metricsInterval: 60000,
  alertThresholds: {
    errorRate: 0.05,
    responseTime: 1000,
    complianceScore: 80
  },
  retentionPeriod: 30
});

// Start monitoring
monitoring.start();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compliance middleware
app.use(complianceMiddleware(privata));
app.use(auditMiddleware(privata));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/privacy', privacyRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    const health = await privata.healthCheck();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      compliance: health.compliance,
      databases: health.databases,
      cache: health.cache,
      audit: health.audit
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Compliance status
app.get('/api/compliance/status', async (req, res) => {
  try {
    const status = await privata.getComplianceStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🏥 Healthcare Portal Server running on port ${PORT}`);
  console.log(`🔒 GDPR/HIPAA compliance enabled`);
  console.log(`📊 Monitoring enabled`);
});

export { app, privata, monitoring };

