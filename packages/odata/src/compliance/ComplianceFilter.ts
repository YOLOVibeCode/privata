import { ODataEntitySet } from '../ODataService';
import { ParsedQuery } from '../ODataComplianceFilter';

export abstract class ComplianceFilter {
  abstract apply(entitySet: ODataEntitySet, query: ParsedQuery, userContext?: any): Promise<ParsedQuery>;
  abstract validate(entitySet: ODataEntitySet, data: any, userContext?: any): Promise<any>;
}

