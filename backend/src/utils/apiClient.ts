import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

interface ApiClientOptions {
  baseURL: string;
  timeout?: number;
  retries?: number;
  authToken?: string;
  apiKey?: string;
}

export function createApiClient(options: ApiClientOptions): AxiosInstance {
  const client = axios.create({
    baseURL: options.baseURL,
    timeout: options.timeout ?? 60000,
  });

  if (options.authToken) {
    client.defaults.headers.common['Authorization'] = `Bearer ${options.authToken}`;
  }

  if (options.apiKey) {
    client.defaults.headers.common['X-API-Key'] = options.apiKey;
  }

  axiosRetry(client, {
    retries: options.retries ?? 3,
    retryDelay: (retryCount) => retryCount * 1000,
    shouldResetTimeout: true,
    retryCondition: (error: any) => {
      return axiosRetry.isNetworkOrIdempotentRequestError(error)
        || error.response?.status === 429
        || error.response?.status === 503
        || error.response?.status === 502
        || error.code === 'ECONNABORTED';
    },
  });

  return client;
}
