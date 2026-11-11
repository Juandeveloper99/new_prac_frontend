import client from './client';

export const clientesApi = {
  listar: (q = '') =>
    client.get(`/clientes${q ? `?q=${encodeURIComponent(q)}` : ''}`).then((r) => r.data),
  obtener: (id) => client.get(`/clientes/${id}`).then((r) => r.data),
  crear: (data) => client.post('/clientes', data).then((r) => r.data),
  actualizar: (id, data) => client.put(`/clientes/${id}`, data).then((r) => r.data),
  eliminar: (id) => client.delete(`/clientes/${id}`),
};