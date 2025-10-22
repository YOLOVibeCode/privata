import { ODataService, ODataEntitySet } from '../ODataService';

export function registerEntitySet(
  odataService: ODataService,
  entitySet: ODataEntitySet
): void {
  odataService.registerEntitySet(entitySet);
}

