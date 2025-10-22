import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ODataService, ODataServiceConfig } from './ODataService';

export interface ODataServerConfig extends ODataServiceConfig {
  port?: number;
  cors?: {
    origin: string | string[];
    credentials: boolean;
  };
  security?: {
    enabled: boolean;
    rateLimit?: {
      windowMs: number;
      max: number;
    };
  };
  logging?: {
    enabled: boolean;
    level: 'error' | 'warn' | 'info' | 'debug';
  };
}

export class ODataServer {
  private app: express.Application;
  private odataService: ODataService;
  private config: ODataServerConfig;

  constructor(odataService: ODataService, config: ODataServerConfig) {
    this.app = express();
    this.odataService = odataService;
    this.config = config;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    if (this.config.cors) {
      this.app.use(cors({
        origin: this.config.cors.origin,
        credentials: this.config.cors.credentials
      }));
    } else {
      this.app.use(cors());
    }

    // Logging middleware
    if (this.config.logging?.enabled) {
      this.app.use(morgan('combined'));
    }

    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Rate limiting
    if (this.config.security?.rateLimit) {
      this.app.use(this.rateLimitMiddleware());
    }

    // Compliance middleware
    this.app.use(this.complianceMiddleware());
  }

  private setupRoutes(): void {
    // Metadata endpoint
    this.app.get('/$metadata', async (req, res) => {
      try {
        const metadata = await this.odataService.getMetadata();
        res.set('Content-Type', 'application/xml');
        res.send(metadata);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Service document
    this.app.get('/', async (req, res) => {
      try {
        const serviceDocument = await this.generateServiceDocument();
        res.json(serviceDocument);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Entity set routes
    this.app.get('/:entitySet', async (req, res) => {
      try {
        const { entitySet } = req.params;
        const queryOptions = req.query;
        const userContext = req.user;

        const result = await this.odataService.getEntitySet(
          entitySet,
          queryOptions,
          userContext
        );

        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Entity routes
    this.app.get('/:entitySet\\(:key\\)', async (req, res) => {
      try {
        const { entitySet, key } = req.params;
        const queryOptions = req.query;
        const userContext = req.user;

        const result = await this.odataService.getEntity(
          entitySet,
          key,
          queryOptions,
          userContext
        );

        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Create entity
    this.app.post('/:entitySet', async (req, res) => {
      try {
        const { entitySet } = req.params;
        const data = req.body;
        const userContext = req.user;

        const result = await this.odataService.createEntity(
          entitySet,
          data,
          userContext
        );

        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Update entity
    this.app.put('/:entitySet\\(:key\\)', async (req, res) => {
      try {
        const { entitySet, key } = req.params;
        const data = req.body;
        const userContext = req.user;

        const result = await this.odataService.updateEntity(
          entitySet,
          key,
          data,
          userContext
        );

        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Delete entity
    this.app.delete('/:entitySet\\(:key\\)', async (req, res) => {
      try {
        const { entitySet, key } = req.params;
        const userContext = req.user;

        await this.odataService.deleteEntity(
          entitySet,
          key,
          userContext
        );

        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Function imports
    this.app.get('/:functionName', async (req, res) => {
      try {
        const { functionName } = req.params;
        const parameters = req.query;
        const userContext = req.user;

        const result = await this.odataService.callFunction(
          functionName,
          parameters,
          userContext
        );

        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Action imports
    this.app.post('/:actionName', async (req, res) => {
      try {
        const { actionName } = req.params;
        const parameters = req.body;
        const userContext = req.user;

        const result = await this.odataService.callAction(
          actionName,
          parameters,
          userContext
        );

        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Batch operations
    this.app.post('/$batch', async (req, res) => {
      try {
        const operations = req.body;
        const userContext = req.user;

        const results = await this.odataService.batchOperation(
          operations,
          userContext
        );

        res.json(results);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        compliance: {
          gdpr: this.config.compliance.gdpr,
          hipaa: this.config.compliance.hipaa,
          dataProtection: this.config.compliance.dataProtection
        }
      });
    });

    // Error handling middleware
    this.app.use(this.errorHandler());
  }

  private rateLimitMiddleware(): express.RequestHandler {
    return (req, res, next) => {
      // Simple rate limiting implementation
      // In production, use a proper rate limiting library
      const rateLimit = this.config.security?.rateLimit;
      if (rateLimit) {
        // This would be implemented with a proper rate limiting library
        // For now, we'll just pass through
        next();
      } else {
        next();
      }
    };
  }

  private complianceMiddleware(): express.RequestHandler {
    return (req, res, next) => {
      // Add compliance headers
      res.set('X-Compliance-GDPR', this.config.compliance.gdpr.toString());
      res.set('X-Compliance-HIPAA', this.config.compliance.hipaa.toString());
      res.set('X-Compliance-DataProtection', this.config.compliance.dataProtection.toString());
      res.set('X-Compliance-Audit', this.config.compliance.auditLogging.toString());

      next();
    };
  }

  private errorHandler(): express.ErrorRequestHandler {
    return (error, req, res, next) => {
      console.error('OData Server Error:', error);

      // Compliance error handling
      if (error.message.includes('compliance')) {
        res.status(403).json({
          error: 'Compliance violation',
          message: error.message,
          compliance: {
            gdpr: this.config.compliance.gdpr,
            hipaa: this.config.compliance.hipaa,
            dataProtection: this.config.compliance.dataProtection
          }
        });
        return;
      }

      // Permission error handling
      if (error.message.includes('Access denied')) {
        res.status(403).json({
          error: 'Access denied',
          message: error.message
        });
        return;
      }

      // Generic error handling
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    };
  }

  private async generateServiceDocument(): Promise<any> {
    const entitySets = this.odataService.listEntitySets();
    
    return {
      '@odata.context': `${this.config.baseUrl}/$metadata`,
      '@odata.metadataEtag': `W/"${Date.now()}"`,
      value: entitySets.map(entitySet => ({
        name: entitySet.name,
        kind: 'EntitySet',
        url: entitySet.name,
        compliance: {
          pii: entitySet.compliance.pii,
          phi: entitySet.compliance.phi,
          audit: entitySet.compliance.audit
        }
      })),
      namespace: this.config.namespace,
      title: this.config.metadata.title,
      description: this.config.metadata.description,
      contact: this.config.metadata.contact
    };
  }

  public start(): void {
    const port = this.config.port || 3000;
    
    this.app.listen(port, () => {
      console.log(`🚀 OData Server running on port ${port}`);
      console.log(`📊 Metadata: ${this.config.baseUrl}/$metadata`);
      console.log(`🔒 GDPR Compliance: ${this.config.compliance.gdpr}`);
      console.log(`🏥 HIPAA Compliance: ${this.config.compliance.hipaa}`);
      console.log(`🛡️ Data Protection: ${this.config.compliance.dataProtection}`);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}

