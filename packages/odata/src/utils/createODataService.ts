import { Privata } from '@privata/core';
import { ODataService, ODataServiceConfig } from '../ODataService';

export function createODataService(
  privata: Privata,
  config: ODataServiceConfig
): ODataService {
  return new ODataService(privata, config);
}

