import client from './client';

export const materiasPrimasApi = {
  listar: () => client.get('/materias-primas').then((r) => r.data),
  obtener: (id) => client.get(`/materias-primas/${id}`).then((r) => r.data),
  crear: (data) => client.post('/materias-primas', data).then((r) => r.data),
  actualizar: (id, data) => client.put(`/materias-primas/${id}`, data).then((r) => r.data),
  eliminar: (id) => client.delete(`/materias-primas/${id}`),
  entradaStock: (id, data) =>
    client.post(`/materias-primas/${id}/entrada-stock`, data).then((r) => r.data),
};