import { useEffect, useState } from 'react';
import {
  Title, Table, Badge, Group, Loader, Center, Alert,
  TextInput, Button, Stack, Card, Text, Modal, ActionIcon, Tooltip
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconPackageImport } from '@tabler/icons-react';
import { materiasPrimasApi } from '../api/materiasPrimas';
import MateriaPrimaForm from '../components/MateriaPrimaForm';
import EntradaStockForm from '../components/EntradaStockForm';

export default function Inventario() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [modalForm, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [modalStock, { open: openStock, close: closeStock }] = useDisclosure(false);
  const [editing, setEditing] = useState(null);
  const [stockTarget, setStockTarget] = useState(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await materiasPrimasApi.listar();
      setItems(data);
    } catch (err) {
      setError('No se pudo cargar el inventario. Verifica que la API esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirCrear = () => {
    setEditing(null);
    openForm();
  };

  const abrirEditar = (item) => {
    setEditing(item);
    openForm();
  };

  const abrirStock = (item) => {
    setStockTarget(item);
    openStock();
  };

  const handleGuardar = async (data) => {
    setGuardando(true);
    try {
      if (editing) {
        await materiasPrimasApi.actualizar(editing.id, data);
        notifications.show({ title: 'Éxito', message: 'Materia prima actualizada', color: 'green' });
      } else {
        await materiasPrimasApi.crear(data);
        notifications.show({ title: 'Éxito', message: 'Materia prima creada', color: 'green' });
      }
      closeForm();
      await cargar();
    } catch (err) {
      // El interceptor de axios ya mostró la notificación
    } finally {
      setGuardando(false);
    }
  };

  const handleEntrada = async (data) => {
    setGuardando(true);
    try {
      await materiasPrimasApi.entradaStock(stockTarget.id, data);
      notifications.show({
        title: 'Éxito',
        message: `Entrada registrada: +${data.cantidad} ${stockTarget.unidad}`,
        color: 'green'
      });
      closeStock();
      await cargar();
    } catch (err) {
      // El interceptor de axios ya mostró la notificación
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = (item) => {
    modals.openConfirmModal({
      title: 'Eliminar materia prima',
      children: (
        <Text size="sm">
          ¿Seguro que quieres eliminar <b>{item.nombre}</b>? Esta acción marca el registro como inactivo.
        </Text>
      ),
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await materiasPrimasApi.eliminar(item.id);
          notifications.show({ title: 'Éxito', message: 'Materia prima eliminada', color: 'green' });
          await cargar();
        } catch (err) {
          // El interceptor ya notificó el error
        }
      },
    });
  };

  const filtrados = items.filter((it) =>
    it.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>📦 Inventario de materias primas</Title>
        <Group>
          <Button onClick={cargar} variant="light">🔄 Recargar</Button>
          <Button onClick={abrirCrear} leftSection={<IconPlus size={16} />}>
            Nueva materia prima
          </Button>
        </Group>
      </Group>

      <Card withBorder>
        <Group justify="space-between" mb="md">
          <TextInput
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.currentTarget.value)}
            style={{ flex: 1, maxWidth: 400 }}
          />
          <Text size="sm" c="dimmed">{filtrados.length} de {items.length} registros</Text>
        </Group>

        {loading && <Center py="xl"><Loader /></Center>}

        {error && <Alert color="red" title="Error">{error}</Alert>}

        {!loading && !error && (
          <Table.ScrollContainer minWidth={900}>
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Nombre</Table.Th>
                  <Table.Th>Unidad</Table.Th>
                  <Table.Th>Stock actual</Table.Th>
                  <Table.Th>Stock mínimo</Table.Th>
                  <Table.Th>Costo unitario</Table.Th>
                  <Table.Th>Estado</Table.Th>
                  <Table.Th>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtrados.map((it) => {
                  const bajo = Number(it.stock_actual) <= Number(it.stock_minimo);
                  return (
                    <Table.Tr key={it.id}>
                      <Table.Td>{it.id}</Table.Td>
                      <Table.Td>{it.nombre}</Table.Td>
                      <Table.Td>{it.unidad}</Table.Td>
                      <Table.Td>{Number(it.stock_actual).toFixed(2)}</Table.Td>
                      <Table.Td>{Number(it.stock_minimo).toFixed(2)}</Table.Td>
                      <Table.Td>C$ {Number(it.costo_unitario).toFixed(2)}</Table.Td>
                      <Table.Td>
                        <Badge color={bajo ? 'red' : 'green'}>
                          {bajo ? 'REABASTECER' : 'SUFICIENTE'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Tooltip label="Editar">
                            <ActionIcon variant="light" color="blue" onClick={() => abrirEditar(it)}>
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Entrada de stock">
                            <ActionIcon variant="light" color="green" onClick={() => abrirStock(it)}>
                              <IconPackageImport size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Eliminar">
                            <ActionIcon variant="light" color="red" onClick={() => confirmarEliminar(it)}>
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
                {filtrados.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={8}>
                      <Text ta="center" c="dimmed">No hay registros</Text>
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
        title={editing ? `Editar: ${editing.nombre}` : 'Nueva materia prima'}
        size="md"
      >
        <MateriaPrimaForm
          initialData={editing}
          onSubmit={handleGuardar}
          onCancel={closeForm}
          loading={guardando}
        />
      </Modal>

      <Modal
        opened={modalStock}
        onClose={closeStock}
        title="Entrada de stock"
        size="md"
      >
        <EntradaStockForm
          materiaPrima={stockTarget}
          onSubmit={handleEntrada}
          onCancel={closeStock}
          loading={guardando}
        />
      </Modal>
    </Stack>
  );
}
