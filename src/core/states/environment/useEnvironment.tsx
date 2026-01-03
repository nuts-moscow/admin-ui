'use client';
import { Environment } from '@/core/states/environment/Environment';
import { createContext, FC, useEffect, useState } from 'react';
import { applicationConfig } from '@/applicationConfig';
import { WithChildren } from '@/core/utils/style/WithChildren';
import { store } from '@/core/stateManager/store';
import { globalContextState } from '@/core/stateManager/factories/globalContextState';

const EnvironmentContext = createContext<Environment>(
  applicationConfig.environments.production,
);

const name = 'ENVIRONMENT_CONTEXT';

export interface EnvironmentProviderProps extends WithChildren {
  readonly environment: Environment;
}

export const EnvironmentProvider: FC<EnvironmentProviderProps> = ({
  environment,
  children,
}) => {
  const [_environment] = useState(environment);

  useEffect(() => {
    store.set(name, _environment);
  }, [_environment]);

  return (
    <EnvironmentContext.Provider value={environment}>
      {children}
    </EnvironmentContext.Provider>
  );
};

export const useEnvironment = globalContextState(name, EnvironmentContext);

