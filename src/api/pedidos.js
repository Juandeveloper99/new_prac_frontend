import client from './client';

export const pedidosApi = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.cliente_id) params.append('cliente_id', filtros.cliente_id);
    const qs = params.toString();
    return client.get(`/pedidos${qs ? `?${qs}` : ''}`).then((r) => r.data);
  },
  obtener: (id) => client.get(`/pedidos/${id}`).then((r) => r.data),
  crear: (data) => client.post('/pedidos', data).then((r) => r.data),
  cambiarEstado: (id, estado) =>
    client.patch(`/pedidos/${id}/estado`, { estado }).then((r) => r.data),
};
