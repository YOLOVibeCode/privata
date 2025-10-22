import { ODataService } from '../ODataService';
import { FunctionImport } from '../ODataMetadata';

export function addFunctionImport(
  odataService: ODataService,
  functionImport: FunctionImport
): void {
  // This would be implemented in the ODataService
  // For now, we'll just log it
  console.log('Function import added:', functionImport.name);
}

