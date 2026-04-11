'use server';
import { cookies } from 'next/headers';
import { applicationConfig } from '@/applicationConfig';
import { Environment } from '@/core/states/environment/Environment';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { ENVIRONMENT_KEY } from './environmentKey';

export const getEnvironmentWithReqCookies = async (
  cookies: ReadonlyRequestCookies,
): Promise<Environment> => {
  return Promise.resolve(
    cookies.get(ENVIRONMENT_KEY)?.value || 'production',
  ).then((envName) => {
    return (
      applicationConfig.environments[envName] ||
      applicationConfig.environments.production
    );
  });
};

export const getEnvironment = async (): Promise<Environment> => {
  return cookies()
    .then((cs) => {
      return cs.get(ENVIRONMENT_KEY)?.value || 'production';
    })
    .then((envName) => {
      return (
        applicationConfig.environments[envName] ||
        applicationConfig.environments.production
      );
    });
};

