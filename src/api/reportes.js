import client from './client';

export const reportesApi = {
  dashboard: () => client.get('/reportes/dashboard').then((r) => r.data),
};
