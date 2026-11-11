import client from './client';

export const recetasApi = {
  listar: (soloActivas = false) =>
    client.get(`/recetas${soloActivas ? '?activas=1' : ''}`).then((r) => r.data),
  obtener: (id) => client.get(`/recetas/${id}`).then((r) => r.data),
  crear: (data) => client.post('/recetas', data).then((r) => r.data),
  actualizar: (id, data) => client.put(`/recetas/${id}`, data).then((r) => r.data),
  eliminar: (id) => client.delete(`/recetas/${id}`),
};