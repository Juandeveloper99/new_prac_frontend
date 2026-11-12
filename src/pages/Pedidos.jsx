import { useEffect, useState } from 'react';
import {
  Title, Table, Badge, Group, Loader, Center, Alert,
  Button, Stack, Card, Text, Modal, ActionIcon, Tooltip,
  Select,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconPlus, IconEye, IconArrowRight, IconX, IconReceipt,
} from '@tabler/icons-react';
import { recetasApi } from '../api/recetas';
import { pedidosApi } from '../api/pedidos';
import { clientesApi } from '../api/clientes';
import { facturasApi } from '../api/facturas';

import PedidoForm from '../components/PedidoForm';
import PedidoDetalle from '../components/PedidoDetalle';

const ESTADOS = {
  pendiente: { color: 'yellow', label: 'Pendiente' },
  en_proceso: { color: 'blue', label: 'En proceso' },
  listo: { color: 'teal', label: 'Listo' },
  pagado: { color: 'green', label: 'Pagado' },
  entregado: { color: 'gray', label: 'Entregado' },
  cancelado: { color: 'red', label: 'Cancelado' },
};

const SIGUIENTE_ESTADO = {
  pendiente: 'en_proceso',
  en_proceso: 'listo',
  listo: 'pagado',
  pagado: 'entregado',
};

export default function Pedidos() {
  const [items, setItems] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [modalForm, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [modalDetalle, { open: openDetalle, close: closeDetalle }] = useDisclosure(false);
  const [detalle, setDetalle] = useState(null);

  const cargar = async (estado = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await pedidosApi.listar(estado ? { estado } : {});
      setItems(data);
    } catch (err) {
      setError('No se pudo cargar el listado. Verifica que la API este corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogos = async () => {
  try {
    const [c, r] = await Promise.all([
      clientesApi.listar(),
      recetasApi.listar(),
    ]);
    setClientes(c);
    setRecetas(r);
  } catch (err) {
    console.error('Error al cargar catálogos:', err);
  }
};

  useEffect(() => {
    cargar();
    cargarCatalogos();
  }, []);

  useEffect(() => {
    cargar(filtroEstado);
  }, [filtroEstado]);

  const abrirCrear = async () => {
  await cargarCatalogos();
  openForm();
};

  const abrirDetalle = async (item) => {
    try {
      const full = await pedidosApi.obtener(item.id);
      setDetalle(full);
      openDetalle();
    } catch (err) {}
  };

  const handleCrear = async (payload) => {
    setGuardando(true);
    try {
      await pedidosApi.crear(payload);
      notifications.show({
        title: 'Pedido creado',
        message: 'Stock descontado correctamente',
        color: 'green',
      });
      closeForm();
      await cargar(filtroEstado);
    } catch (err) {
      // Interceptor muestra el error (incluye faltantes de stock)
    } finally {
      setGuardando(false);
    }
  };

  const avanzarEstado = async (item) => {
    const siguiente = SIGUIENTE_ESTADO[item.estado];
    if (!siguiente) return;

    try {
      await pedidosApi.cambiarEstado(item.id, siguiente);
      notifications.show({
        title: 'Estado actualizado',
        message: `Pedido #${item.id} ahora esta ${ESTADOS[siguiente].label}`,
        color: 'green',
      });
      await cargar(filtroEstado);
    } catch (err) {}
  };

  const facturarPedido = async (item) => {
  try {
    const factura = await facturasApi.crear({ pedido_id: item.id });
    notifications.show({
      title: 'Factura creada',
      message: `${factura.numero_factura} - Total C$ ${Number(factura.total).toFixed(2)}`,
      color: 'green',
    });
    await cargar(filtroEstado);
  } catch (err) {}
};

  const cancelarPedido = (item) => {
    modals.openConfirmModal({
      title: 'Cancelar pedido',
      children: (
        <Text size="sm">
          Seguro que quieres cancelar el pedido <b>#{item.id}</b>?
          Se devolvera el stock de los ingredientes al inventario.
        </Text>
      ),
      labels: { confirm: 'Cancelar pedido', cancel: 'Volver' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await pedidosApi.cambiarEstado(item.id, 'cancelado');
          notifications.show({
            title: 'Pedido cancelado',
            message: 'Stock devuelto al inventario',
            color: 'orange',
          });
          await cargar(filtroEstado);
        } catch (err) {}
      },
    });
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Pedidos</Title>
        <Group>
          <Button onClick={() => cargar(filtroEstado)} variant="light">Recargar</Button>
          <Button onClick={abrirCrear} leftSection={<IconPlus size={16} />}>
            Nuevo pedido
          </Button>
        </Group>
      </Group>

      <Card withBorder>
        <Group justify="space-between" mb="md">
          <Select
            placeholder="Filtrar por estado"
            data={[
              { value: '', label: 'Todos' },
              ...Object.entries(ESTADOS).map(([value, { label }]) => ({ value, label })),
            ]}
            value={filtroEstado}
            onChange={(v) => setFiltroEstado(v || '')}
            clearable
            style={{ width: 240 }}
          />
          <Text size="sm" c="dimmed">{items.length} pedido(s)</Text>
        </Group>

        {loading && <Center py="xl"><Loader /></Center>}
        {error && <Alert color="red" title="Error">{error}</Alert>}

        {!loading && !error && (
          <Table.ScrollContainer minWidth={900}>
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Cliente</Table.Th>
                  <Table.Th>Fecha entrega</Table.Th>
                  <Table.Th>Total</Table.Th>
                  <Table.Th>Estado</Table.Th>
                  <Table.Th>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items.map((it) => {
                  const info = ESTADOS[it.estado] ?? { color: 'gray', label: it.estado };
                  const siguiente = SIGUIENTE_ESTADO[it.estado];
                  const puedeCancelar = ['pendiente', 'en_proceso', 'listo'].includes(it.estado);

                  return (
                    <Table.Tr key={it.id}>
                      <Table.Td>#{it.id}</Table.Td>
                      <Table.Td>{it.cliente_nombre}</Table.Td>
                      <Table.Td>
                        {new Date(it.fecha_entrega).toLocaleString('es-NI')}
                      </Table.Td>
                      <Table.Td>C$ {Number(it.total).toFixed(2)}</Table.Td>
                      <Table.Td>
                        <Badge color={info.color}>{info.label}</Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Tooltip label="Ver detalle">
                            <ActionIcon variant="light" color="gray" onClick={() => abrirDetalle(it)}>
                              <IconEye size={16} />
                            </ActionIcon>
                          </Tooltip>
                          {it.estado === 'listo' && (
  <Tooltip label="Facturar pedido">
    <ActionIcon
      variant="light"
      color="teal"
      onClick={() => facturarPedido(it)}
    >
      <IconReceipt size={16} />
    </ActionIcon>
  </Tooltip>
)}
                          {siguiente && (
                            <Tooltip label={`Avanzar a: ${ESTADOS[siguiente].label}`}>
                              <ActionIcon
                                variant="light"
                                color="green"
                                onClick={() => avanzarEstado(it)}
                              >
                                <IconArrowRight size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                          {puedeCancelar && (
                            <Tooltip label="Cancelar pedido">
                              <ActionIcon
                                variant="light"
                                color="red"
                                onClick={() => cancelarPedido(it)}
                              >
                                <IconX size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
                {items.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Text ta="center" c="dimmed">No hay pedidos</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      <Modal
        opened={modalForm}
        onClose={closeForm}
        title="Nuevo pedido"
        size="xl"
      >
        <PedidoForm
          clientes={clientes}
          recetas={recetas}
          onSubmit={handleCrear}
          onCancel={closeForm}
          loading={guardando}
        />
      </Modal>

      <Modal
        opened={modalDetalle}
        onClose={closeDetalle}
        title={detalle ? `Pedido #${detalle.id}` : 'Detalle'}
        size="lg"
      >
        <PedidoDetalle pedido={detalle} />
      </Modal>
    </Stack>
  );
}