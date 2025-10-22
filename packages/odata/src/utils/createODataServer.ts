import { ODataService } from '../ODataService';
import { ODataServer, ODataServerConfig } from '../ODataServer';

export function createODataServer(
  odataService: ODataService,
  config: ODataServerConfig
): ODataServer {
  return new ODataServer(odataService, config);
}

