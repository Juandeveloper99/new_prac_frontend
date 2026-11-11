import { useEffect, useState } from 'react';
import {
  Title, Table, Group, Loader, Center, Alert,
  TextInput, Button, Stack, Card, Text, Modal, ActionIcon, Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { clientesApi } from '../api/clientes';
import ClienteForm from '../components/ClienteForm';

export default function Clientes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [modalForm, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [editing, setEditing] = useState(null);

  const cargar = async (q = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientesApi.listar(q);
      setItems(data);
    } catch (err) {
      setError('No se pudo cargar el listado. Verifica que la API esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // Búsqueda con debounce simple: espera 300ms después de la última tecla
  useEffect(() => {
    const t = setTimeout(() => {
      cargar(busqueda);
    }, 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  const abrirCrear = () => {
    setEditing(null);
    openForm();
  };

  const abrirEditar = (item) => {
    setEditing(item);
    openForm();
  };

  const handleGuardar = async (payload) => {
    setGuardando(true);
    try {
      if (editing) {
        await clientesApi.actualizar(editing.id, payload);
        notifications.show({ title: 'Éxito', message: 'Cliente actualizado', color: 'green' });
      } else {
        await clientesApi.crear(payload);
        notifications.show({ title: 'Éxito', message: 'Cliente creado', color: 'green' });
      }
      closeForm();
      await cargar(busqueda);
    } catch (err) {
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = (item) => {
    modals.openConfirmModal({
      title: 'Eliminar cliente',
      children: (
        <Text size="sm">
          ¿Seguro que quieres eliminar a <b>{item.nombre}</b>? Si tiene pedidos
          registrados, no se podrá eliminar.
        </Text>
      ),
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await clientesApi.eliminar(item.id);
          notifications.show({ title: 'Éxito', message: 'Cliente eliminado', color: 'green' });
          await cargar(busqueda);
        } catch (err) {}
      },
    });
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>👥 Clientes</Title>
        <Group>
          <Button onClick={() => cargar(busqueda)} variant="light">🔄 Recargar</Button>
          <Button onClick={abrirCrear} leftSection={<IconPlus size={16} />}>
            Nuevo cliente
          </Button>
        </Group>
      </Group>

      <Card withBorder>
        <Group justify="space-between" mb="md">
          <TextInput
            placeholder="Buscar por nombre, teléfono o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.currentTarget.value)}
            style={{ flex: 1, maxWidth: 500 }}
          />
          <Text size="sm" c="dimmed">{items.length} cliente(s)</Text>
        </Group>

        {loading && <Center py="xl"><Loader /></Center>}
        {error && <Alert color="red" title="Error">{error}</Alert>}

        {!loading && !error && (
          <Table.ScrollContainer minWidth={800}>
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Nombre</Table.Th>
                  <Table.Th>Teléfono</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Notas</Table.Th>
                  <Table.Th>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items.map((it) => (
                  <Table.Tr key={it.id}>
                    <Table.Td>{it.id}</Table.Td>
                    <Table.Td><Text fw={500}>{it.nombre}</Text></Table.Td>
                    <Table.Td>{it.telefono || <Text c="dimmed" size="sm">—</Text>}</Table.Td>
                    <Table.Td>{it.email || <Text c="dimmed" size="sm">—</Text>}</Table.Td>
                    <Table.Td>
                      {it.notas ? (
                        <Text size="sm" lineClamp={1}>{it.notas}</Text>
                      ) : (
                        <Text c="dimmed" size="sm">—</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="Editar">
                          <ActionIcon variant="light" color="blue" onClick={() => abrirEditar(it)}>
                            <IconEdit size={16} />
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
                ))}
                {items.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Text ta="center" c="dimmed">No hay clientes</Text>
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
        title={editing ? `Editar: ${editing.nombre}` : 'Nuevo cliente'}
        size="md"
      >
        <ClienteForm
          initialData={editing}
          onSubmit={handleGuardar}
          onCancel={closeForm}
          loading={guardando}
        />
      </Modal>
    </Stack>
  );
}