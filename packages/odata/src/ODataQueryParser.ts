export interface ParsedQuery {
  filters?: Array<{
    field: string;
    operator: string;
    value: any;
    dataType?: 'pii' | 'phi' | 'metadata';
  }>;
  sorts?: Array<{
    field: string;
    direction: 'asc' | 'desc';
    dataType?: 'pii' | 'phi' | 'metadata';
  }>;
  pagination?: {
    page: number;
    limit: number;
  };
  select?: string[];
  expand?: string[];
  search?: string;
}

export class ODataQueryParser {
  parse(queryOptions: Record<string, any>): ParsedQuery {
    const parsed: ParsedQuery = {};

    // Parse $filter
    if (queryOptions.$filter) {
      parsed.filters = this.parseFilter(queryOptions.$filter);
    }

    // Parse $orderby
    if (queryOptions.$orderby) {
      parsed.sorts = this.parseOrderBy(queryOptions.$orderby);
    }

    // Parse $top and $skip
    if (queryOptions.$top || queryOptions.$skip) {
      parsed.pagination = {
        page: Math.floor((queryOptions.$skip || 0) / (queryOptions.$top || 10)) + 1,
        limit: queryOptions.$top || 10
      };
    }

    // Parse $select
    if (queryOptions.$select) {
      parsed.select = this.parseSelect(queryOptions.$select);
    }

    // Parse $expand
    if (queryOptions.$expand) {
      parsed.expand = this.parseExpand(queryOptions.$expand);
    }

    // Parse $search
    if (queryOptions.$search) {
      parsed.search = queryOptions.$search;
    }

    return parsed;
  }

  private parseFilter(filterString: string): Array<{
    field: string;
    operator: string;
    value: any;
    dataType?: 'pii' | 'phi' | 'metadata';
  }> {
    const filters: Array<{
      field: string;
      operator: string;
      value: any;
      dataType?: 'pii' | 'phi' | 'metadata';
    }> = [];

    // Split by 'and' and 'or' operators
    const conditions = this.splitFilterConditions(filterString);

    for (const condition of conditions) {
      const filter = this.parseFilterCondition(condition);
      if (filter) {
        filters.push(filter);
      }
    }

    return filters;
  }

  private splitFilterConditions(filterString: string): string[] {
    const conditions: string[] = [];
    let current = '';
    let depth = 0;
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < filterString.length; i++) {
      const char = filterString[i];

      if (char === '"' || char === "'") {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = '';
        }
      } else if (char === '(') {
        depth++;
      } else if (char === ')') {
        depth--;
      } else if (!inQuotes && depth === 0) {
        if (filterString.substr(i, 4) === ' and ') {
          conditions.push(current.trim());
          current = '';
          i += 3; // Skip 'and'
          continue;
        } else if (filterString.substr(i, 3) === ' or ') {
          conditions.push(current.trim());
          current = '';
          i += 2; // Skip 'or'
          continue;
        }
      }

      current += char;
    }

    if (current.trim()) {
      conditions.push(current.trim());
    }

    return conditions;
  }

  private parseFilterCondition(condition: string): {
    field: string;
    operator: string;
    value: any;
    dataType?: 'pii' | 'phi' | 'metadata';
  } | null {
    // Remove parentheses
    condition = condition.replace(/^\(|\)$/g, '').trim();

    // Parse different operators
    const operators = [
      { op: ' eq ', operator: 'eq' },
      { op: ' ne ', operator: 'ne' },
      { op: ' lt ', operator: 'lt' },
      { op: ' le ', operator: 'le' },
      { op: ' gt ', operator: 'gt' },
      { op: ' ge ', operator: 'ge' },
      { op: ' contains ', operator: 'contains' },
      { op: ' startswith ', operator: 'startswith' },
      { op: ' endswith ', operator: 'endswith' },
      { op: ' in ', operator: 'in' }
    ];

    for (const { op, operator } of operators) {
      if (condition.includes(op)) {
        const parts = condition.split(op);
        if (parts.length === 2) {
          const field = parts[0].trim();
          const value = this.parseValue(parts[1].trim());

          return {
            field,
            operator,
            value,
            dataType: this.getFieldDataType(field)
          };
        }
      }
    }

    return null;
  }

  private parseValue(valueString: string): any {
    // Remove quotes
    if ((valueString.startsWith('"') && valueString.endsWith('"')) ||
        (valueString.startsWith("'") && valueString.endsWith("'"))) {
      return valueString.slice(1, -1);
    }

    // Parse numbers
    if (!isNaN(Number(valueString))) {
      return Number(valueString);
    }

    // Parse booleans
    if (valueString === 'true') return true;
    if (valueString === 'false') return false;

    // Parse null
    if (valueString === 'null') return null;

    // Parse dates
    if (valueString.startsWith('datetime\'')) {
      return new Date(valueString.slice(9, -1));
    }

    // Parse GUIDs
    if (valueString.startsWith('guid\'')) {
      return valueString.slice(5, -1);
    }

    return valueString;
  }

  private parseOrderBy(orderByString: string): Array<{
    field: string;
    direction: 'asc' | 'desc';
    dataType?: 'pii' | 'phi' | 'metadata';
  }> {
    const sorts: Array<{
      field: string;
      direction: 'asc' | 'desc';
      dataType?: 'pii' | 'phi' | 'metadata';
    }> = [];

    const clauses = orderByString.split(',');
    for (const clause of clauses) {
      const trimmed = clause.trim();
      const parts = trimmed.split(' ');
      
      if (parts.length > 0) {
        const field = parts[0];
        const direction = parts[1] === 'desc' ? 'desc' : 'asc';
        
        sorts.push({
          field,
          direction,
          dataType: this.getFieldDataType(field)
        });
      }
    }

    return sorts;
  }

  private parseSelect(selectString: string): string[] {
    return selectString.split(',').map(field => field.trim());
  }

  private parseExpand(expandString: string): string[] {
    return expandString.split(',').map(field => field.trim());
  }

  private getFieldDataType(field: string): 'pii' | 'phi' | 'metadata' {
    // PII fields
    const piiFields = [
      'firstName', 'lastName', 'email', 'phone', 'address',
      'ssn', 'dateOfBirth', 'gender', 'nationality'
    ];

    // PHI fields
    const phiFields = [
      'medicalRecordNumber', 'diagnoses', 'treatments', 'medications',
      'allergies', 'vitalSigns', 'labResults', 'imagingResults'
    ];

    if (piiFields.includes(field)) {
      return 'pii';
    }

    if (phiFields.includes(field)) {
      return 'phi';
    }

    return 'metadata';
  }
}

