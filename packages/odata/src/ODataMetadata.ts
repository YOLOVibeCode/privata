import { ODataServiceConfig, ODataEntitySet } from './ODataService';

export interface EntityType {
  name: string;
  properties: Property[];
  key: string[];
  navigationProperties?: NavigationProperty[];
}

export interface Property {
  name: string;
  type: string;
  nullable?: boolean;
  maxLength?: number;
  precision?: number;
  scale?: number;
  compliance?: {
    pii: boolean;
    phi: boolean;
    sensitive: boolean;
  };
}

export interface NavigationProperty {
  name: string;
  type: string;
  partner?: string;
  multiplicity: '0..1' | '1' | '*';
}

export interface FunctionImport {
  name: string;
  returnType?: string;
  parameters: Parameter[];
  binding?: string;
  entitySet?: string;
}

export interface ActionImport {
  name: string;
  returnType?: string;
  parameters: Parameter[];
  binding?: string;
  entitySet?: string;
}

export interface Parameter {
  name: string;
  type: string;
  nullable?: boolean;
}

export class ODataMetadata {
  private config: ODataServiceConfig;
  private entityTypes: Map<string, EntityType> = new Map();
  private functionImports: Map<string, FunctionImport> = new Map();
  private actionImports: Map<string, ActionImport> = new Map();

  constructor(config: ODataServiceConfig) {
    this.config = config;
    this.initializeDefaultTypes();
  }

  addEntitySet(entitySet: ODataEntitySet): void {
    // Create entity type if it doesn't exist
    if (!this.entityTypes.has(entitySet.entityType)) {
      this.createEntityType(entitySet);
    }
  }

  addEntityType(entityType: EntityType): void {
    this.entityTypes.set(entityType.name, entityType);
  }

  addFunctionImport(functionImport: FunctionImport): void {
    this.functionImports.set(functionImport.name, functionImport);
  }

  addActionImport(actionImport: ActionImport): void {
    this.actionImports.set(actionImport.name, actionImport);
  }

  generateMetadata(): string {
    const metadata = {
      '@odata.context': `${this.config.baseUrl}/$metadata`,
      '@odata.metadataEtag': `W/"${Date.now()}"`,
      value: this.generateEntitySets(),
      entityTypes: this.generateEntityTypes(),
      functionImports: this.generateFunctionImports(),
      actionImports: this.generateActionImports(),
      namespace: this.config.namespace,
      title: this.config.metadata.title,
      description: this.config.metadata.description,
      contact: this.config.metadata.contact
    };

    return this.formatMetadata(metadata);
  }

  private initializeDefaultTypes(): void {
    // Add common OData types
    this.addEntityType({
      name: 'Edm.String',
      properties: [],
      key: []
    });

    this.addEntityType({
      name: 'Edm.Int32',
      properties: [],
      key: []
    });

    this.addEntityType({
      name: 'Edm.Int64',
      properties: [],
      key: []
    });

    this.addEntityType({
      name: 'Edm.Double',
      properties: [],
      key: []
    });

    this.addEntityType({
      name: 'Edm.Boolean',
      properties: [],
      key: []
    });

    this.addEntityType({
      name: 'Edm.DateTime',
      properties: [],
      key: []
    });

    this.addEntityType({
      name: 'Edm.Guid',
      properties: [],
      key: []
    });
  }

  private createEntityType(entitySet: ODataEntitySet): void {
    const entityType: EntityType = {
      name: entitySet.entityType,
      properties: this.generatePropertiesForModel(entitySet.model),
      key: ['id'],
      navigationProperties: this.generateNavigationProperties(entitySet.model)
    };

    this.entityTypes.set(entitySet.entityType, entityType);
  }

  private generatePropertiesForModel(model: string): Property[] {
    // This would be generated based on the actual model schema
    // For now, we'll provide a generic set of properties
    const commonProperties: Property[] = [
      {
        name: 'id',
        type: 'Edm.Guid',
        nullable: false,
        compliance: { pii: false, phi: false, sensitive: false }
      },
      {
        name: 'createdAt',
        type: 'Edm.DateTime',
        nullable: false,
        compliance: { pii: false, phi: false, sensitive: false }
      },
      {
        name: 'updatedAt',
        type: 'Edm.DateTime',
        nullable: false,
        compliance: { pii: false, phi: false, sensitive: false }
      }
    ];

    // Add model-specific properties based on compliance requirements
    if (model === 'User' || model === 'Patient') {
      commonProperties.push(
        {
          name: 'firstName',
          type: 'Edm.String',
          maxLength: 100,
          compliance: { pii: true, phi: false, sensitive: true }
        },
        {
          name: 'lastName',
          type: 'Edm.String',
          maxLength: 100,
          compliance: { pii: true, phi: false, sensitive: true }
        },
        {
          name: 'email',
          type: 'Edm.String',
          maxLength: 255,
          compliance: { pii: true, phi: false, sensitive: true }
        },
        {
          name: 'phone',
          type: 'Edm.String',
          maxLength: 20,
          compliance: { pii: true, phi: false, sensitive: true }
        }
      );
    }

    if (model === 'Patient' || model === 'MedicalRecord') {
      commonProperties.push(
        {
          name: 'medicalRecordNumber',
          type: 'Edm.String',
          maxLength: 50,
          compliance: { pii: false, phi: true, sensitive: true }
        },
        {
          name: 'diagnoses',
          type: 'Edm.String',
          compliance: { pii: false, phi: true, sensitive: true }
        },
        {
          name: 'medications',
          type: 'Edm.String',
          compliance: { pii: false, phi: true, sensitive: true }
        }
      );
    }

    return commonProperties;
  }

  private generateNavigationProperties(model: string): NavigationProperty[] {
    const navigationProperties: NavigationProperty[] = [];

    // Add model-specific navigation properties
    if (model === 'User') {
      navigationProperties.push({
        name: 'patients',
        type: 'Collection(Patient)',
        multiplicity: '*'
      });
    }

    if (model === 'Patient') {
      navigationProperties.push({
        name: 'user',
        type: 'User',
        multiplicity: '0..1',
        partner: 'patients'
      });
      navigationProperties.push({
        name: 'medicalRecords',
        type: 'Collection(MedicalRecord)',
        multiplicity: '*'
      });
    }

    return navigationProperties;
  }

  private generateEntitySets(): any[] {
    const entitySets: any[] = [];

    // This would be populated from registered entity sets
    // For now, we'll provide some examples
    entitySets.push({
      name: 'Users',
      entityType: `${this.config.namespace}.User`,
      compliance: {
        pii: true,
        phi: false,
        audit: true
      }
    });

    entitySets.push({
      name: 'Patients',
      entityType: `${this.config.namespace}.Patient`,
      compliance: {
        pii: true,
        phi: true,
        audit: true
      }
    });

    entitySets.push({
      name: 'MedicalRecords',
      entityType: `${this.config.namespace}.MedicalRecord`,
      compliance: {
        pii: false,
        phi: true,
        audit: true
      }
    });

    return entitySets;
  }

  private generateEntityTypes(): any[] {
    const entityTypes: any[] = [];

    for (const [name, entityType] of this.entityTypes) {
      entityTypes.push({
        name: `${this.config.namespace}.${name}`,
        properties: entityType.properties.map(prop => ({
          name: prop.name,
          type: prop.type,
          nullable: prop.nullable,
          maxLength: prop.maxLength,
          precision: prop.precision,
          scale: prop.scale,
          compliance: prop.compliance
        })),
        key: entityType.key,
        navigationProperties: entityType.navigationProperties
      });
    }

    return entityTypes;
  }

  private generateFunctionImports(): any[] {
    const functionImports: any[] = [];

    for (const [name, func] of this.functionImports) {
      functionImports.push({
        name,
        returnType: func.returnType,
        parameters: func.parameters,
        binding: func.binding,
        entitySet: func.entitySet
      });
    }

    return functionImports;
  }

  private generateActionImports(): any[] {
    const actionImports: any[] = [];

    for (const [name, action] of this.actionImports) {
      actionImports.push({
        name,
        returnType: action.returnType,
        parameters: action.parameters,
        binding: action.binding,
        entitySet: action.entitySet
      });
    }

    return actionImports;
  }

  private formatMetadata(metadata: any): string {
    // Generate XML metadata document
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">\n';
    xml += '  <edmx:DataServices>\n';
    xml += `    <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="${this.config.namespace}">\n`;

    // Add entity types
    for (const entityType of metadata.entityTypes) {
      xml += `      <EntityType Name="${entityType.name}">\n`;
      
      // Add key
      if (entityType.key.length > 0) {
        xml += '        <Key>\n';
        for (const key of entityType.key) {
          xml += `          <PropertyRef Name="${key}" />\n`;
        }
        xml += '        </Key>\n';
      }

      // Add properties
      for (const property of entityType.properties) {
        xml += `        <Property Name="${property.name}" Type="${property.type}"`;
        if (property.nullable !== undefined) {
          xml += ` Nullable="${property.nullable}"`;
        }
        if (property.maxLength) {
          xml += ` MaxLength="${property.maxLength}"`;
        }
        if (property.precision) {
          xml += ` Precision="${property.precision}"`;
        }
        if (property.scale) {
          xml += ` Scale="${property.scale}"`;
        }
        xml += ' />\n';
      }

      // Add navigation properties
      if (entityType.navigationProperties) {
        for (const navProp of entityType.navigationProperties) {
          xml += `        <NavigationProperty Name="${navProp.name}" Type="${navProp.type}"`;
          if (navProp.partner) {
            xml += ` Partner="${navProp.partner}"`;
          }
          xml += ` />\n`;
        }
      }

      xml += '      </EntityType>\n';
    }

    // Add entity sets
    for (const entitySet of metadata.value) {
      xml += `      <EntitySet Name="${entitySet.name}" EntityType="${entitySet.entityType}"`;
      if (entitySet.compliance) {
        xml += `>\n`;
        xml += `        <Annotation Term="compliance.pii" Bool="${entitySet.compliance.pii}" />\n`;
        xml += `        <Annotation Term="compliance.phi" Bool="${entitySet.compliance.phi}" />\n`;
        xml += `        <Annotation Term="compliance.audit" Bool="${entitySet.compliance.audit}" />\n`;
        xml += `      </EntitySet>\n`;
      } else {
        xml += ` />\n`;
      }
    }

    // Add function imports
    for (const func of metadata.functionImports) {
      xml += `      <FunctionImport Name="${func.name}"`;
      if (func.returnType) {
        xml += ` ReturnType="${func.returnType}"`;
      }
      if (func.binding) {
        xml += ` IsBindable="true"`;
      }
      if (func.entitySet) {
        xml += ` EntitySet="${func.entitySet}"`;
      }
      xml += ' />\n';
    }

    // Add action imports
    for (const action of metadata.actionImports) {
      xml += `      <ActionImport Name="${action.name}"`;
      if (action.returnType) {
        xml += ` ReturnType="${action.returnType}"`;
      }
      if (action.binding) {
        xml += ` IsBindable="true"`;
      }
      if (action.entitySet) {
        xml += ` EntitySet="${action.entitySet}"`;
      }
      xml += ' />\n';
    }

    xml += '    </Schema>\n';
    xml += '  </edmx:DataServices>\n';
    xml += '</edmx:Edmx>';

    return xml;
  }
}

