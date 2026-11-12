import client from './client';

export const pagosApi = {
  listar: (factura_id) => {
    const qs = factura_id ? `?factura_id=${factura_id}` : '';
    return client.get(`/pagos${qs}`).then((r) => r.data);
  },
  crear: (data) => client.post('/pagos', data).then((r) => r.data),
};
