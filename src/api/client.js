import axios from 'axios';
import { notifications } from '@mantine/notifications';

const client = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de respuestas: muestra notificación automática en errores
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensaje =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Error desconocido';

    const detalles = error.response?.data?.details;
    let descripcion = '';
    if (Array.isArray(detalles)) {
      descripcion = detalles
        .map((d) => (typeof d === 'string' ? d : d.message || d.nombre || JSON.stringify(d)))
        .join(', ');
    } else if (detalles) {
      descripcion = typeof detalles === 'string' ? detalles : JSON.stringify(detalles);
    }

    notifications.show({
      title: `Error ${error.response?.status ?? ''}`.trim(),
      message: descripcion ? `${mensaje} — ${descripcion}` : mensaje,
      color: 'red',
      autoClose: 5000,
    });

    return Promise.reject(error);
  }
);

export default client;