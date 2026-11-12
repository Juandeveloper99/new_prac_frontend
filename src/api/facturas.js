import client from './client';

export const facturasApi = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.cliente_id) params.append('cliente_id', filtros.cliente_id);
    if (filtros.q) params.append('q', filtros.q);
    if (filtros.desde) params.append('desde', filtros.desde);
    if (filtros.hasta) params.append('hasta', filtros.hasta);
    const qs = params.toString();
    return client.get(`/facturas${qs ? `?${qs}` : ''}`).then((r) => r.data);
  },
  obtener: (id) => client.get(`/facturas/${id}`).then((r) => r.data),
  crear: (data) => client.post('/facturas', data).then((r) => r.data),
  anular: (id, motivo) =>
    client.post(`/facturas/${id}/anular`, { motivo }).then((r) => r.data),
};