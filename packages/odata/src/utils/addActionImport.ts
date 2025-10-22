import { ODataService } from '../ODataService';
import { ActionImport } from '../ODataMetadata';

export function addActionImport(
  odataService: ODataService,
  actionImport: ActionImport
): void {
  // This would be implemented in the ODataService
  // For now, we'll just log it
  console.log('Action import added:', actionImport.name);
}

