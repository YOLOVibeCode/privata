import { Privata, PrivataConfig } from '@privata/core';

export function createPrivataInstance(config: PrivataConfig): Privata {
  return new Privata(config);
}

