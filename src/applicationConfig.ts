import { Dictionary } from '@/core/types/types';
import { Environment } from '@/core/states/environment/Environment';

export interface ApplicationConfig {
  readonly environments: Dictionary<Environment>;
}

export const applicationConfig: ApplicationConfig = {
  environments: {
    production: {
      key: 'production',
      apiUrl: 'http://94.250.250.13:8080',
    },
  },
};

