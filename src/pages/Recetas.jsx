import { useEffect, useState } from 'react';
import {
  Title, Table, Badge, Group, Loader, Center, Alert,
  TextInput, Button, Stack, Card, Text, Modal, ActionIcon,
  Tooltip, NumberFormatter,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconEye } from '@tabler/icons-react';
import { recetasApi } from '../api/recetas';
import { materiasPrimasApi } from '../api/materiasPrimas';
import RecetaForm from '../components/RecetaForm';

export default function Recetas() {
  const [items, setItems] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [modalForm, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [modalDetalle, { open: openDetalle, close: closeDetalle }] = useDisclosure(false);
  const [editing, setEditing] = useState(null);
  const [detalle, setDetalle] = useState(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recetasData, materiasData] = await Promise.all([
        recetasApi.listar(),
        materiasPrimasApi.listar(),
      ]);
      setItems(recetasData);
      setMaterias(materiasData);
    } catch (err) {
      setError('No se pudo cargar el listado. Verifica que la API esté corriendo.');
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

  const abrirEditar = async (item) => {
    try {
      const full = await recetasApi.obtener(item.id);
      setEditing(full);
      openForm();
    } catch (err) {
      // notificación automática
    }
  };

  const abrirDetalle = async (item) => {
    try {
      const full = await recetasApi.obtener(item.id);
      setDetalle(full);
      openDetalle();
    } catch (err) {
      // notificación automática
    }
  };

  const handleGuardar = async (payload) => {
    setGuardando(true);
    try {
      if (editing) {
        await recetasApi.actualizar(editing.id, payload);
        notifications.show({ title: 'Éxito', message: 'Receta actualizada', color: 'green' });
      } else {
        await recetasApi.crear(payload);
        notifications.show({ title: 'Éxito', message: 'Receta creada', color: 'green' });
      }
      closeForm();
      await cargar();
    } catch (err) {
      // notificación automática
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = (item) => {
    modals.openConfirmModal({
      title: 'Eliminar receta',
      children: (
        <Text size="sm">
          ¿Seguro que quieres eliminar <b>{item.nombre}</b>? La receta quedará inactiva
          pero los pedidos históricos se conservarán.
        </Text>
      ),
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await recetasApi.eliminar(item.id);
          notifications.show({ title: 'Éxito', message: 'Receta eliminada', color: 'green' });
          await cargar();
        } catch (err) {
          // notificación automática
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
        <Title order={2}>🍰 Recetas</Title>
        <Group>
          <Button onClick={cargar} variant="light">🔄 Recargar</Button>
          <Button onClick={abrirCrear} leftSection={<IconPlus size={16} />}>
            Nueva receta
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
          <Text size="sm" c="dimmed">{filtrados.length} de {items.length} recetas</Text>
        </Group>

        {loading && <Center py="xl"><Loader /></Center>}
        {error && <Alert color="red" title="Error">{error}</Alert>}

        {!loading && !error && (
          <Table.ScrollContainer minWidth={1000}>
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Nombre</Table.Th>
                  <Table.Th>Precio/libra</Table.Th>
                  <Table.Th>Costo/libra</Table.Th>
                  <Table.Th>Margen</Table.Th>
                  <Table.Th># Ingredientes</Table.Th>
                  <Table.Th>Estado</Table.Th>
                  <Table.Th>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtrados.map((it) => {
                  const precio = Number(it.precio_por_libra);
                  const costo = Number(it.costo_por_libra);
                  const margen = precio - costo;
                  return (
                    <Table.Tr key={it.id}>
                      <Table.Td>
                        <Text fw={500}>{it.nombre}</Text>
                        {it.descripcion && (
                          <Text size="xs" c="dimmed" lineClamp={1}>{it.descripcion}</Text>
                        )}
                      </Table.Td>
                      <Table.Td>C$ {precio.toFixed(2)}</Table.Td>
                      <Table.Td>C$ {costo.toFixed(2)}</Table.Td>
                      <Table.Td>
                        <Text c={margen >= 0 ? 'green' : 'red'} fw={500}>
                          C$ {margen.toFixed(2)}
                        </Text>
                      </Table.Td>
                      <Table.Td>{it.num_ingredientes}</Table.Td>
                      <Table.Td>
                        <Badge color={it.activa ? 'green' : 'gray'}>
                          {it.activa ? 'ACTIVA' : 'INACTIVA'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Tooltip label="Ver detalle">
                            <ActionIcon variant="light" color="gray" onClick={() => abrirDetalle(it)}>
                              <IconEye size={16} />
                            </ActionIcon>
                          </Tooltip>
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
                  );
                })}
                {filtrados.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={7}>
                      <Text ta="center" c="dimmed">No hay recetas</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      {/* Modal: crear/editar */}
      <Modal
        opened={modalForm}
        onClose={closeForm}
        title={editing ? `Editar: ${editing.nombre}` : 'Nueva receta'}
        size="xl"
      >
        <RecetaForm
          initialData={editing}
          materiasPrimas={materias}
          onSubmit={handleGuardar}
          onCancel={closeForm}
          loading={guardando}
        />
      </Modal>

      {/* Modal: detalle */}
      <Modal
        opened={modalDetalle}
        onClose={closeDetalle}
        title={detalle ? `Detalle: ${detalle.nombre}` : 'Detalle'}
        size="xl"
      >
        {detalle && (
          <Stack gap="md">
            {detalle.descripcion && (
              <Text size="sm" c="dimmed">{detalle.descripcion}</Text>
            )}
            <Group>
              <Text size="sm">Precio/libra: <b>C$ {Number(detalle.precio_por_libra).toFixed(2)}</b></Text>
              <Text size="sm">Costo/libra: <b>C$ {Number(detalle.costo_por_libra).toFixed(2)}</b></Text>
              <Text size="sm" c="green">Margen: <b>C$ {(Number(detalle.precio_por_libra) - Number(detalle.costo_por_libra)).toFixed(2)}</b></Text>
            </Group>
            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Materia prima</Table.Th>
                  <Table.Th>Cantidad/libra</Table.Th>
                  <Table.Th>Costo unitario</Table.Th>
                  <Table.Th>Costo/libra</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {detalle.ingredientes.map((ing) => (
                  <Table.Tr key={ing.id}>
                    <Table.Td>{ing.materia_prima_nombre}</Table.Td>
                    <Table.Td>{Number(ing.cantidad_por_libra).toFixed(4)} {ing.materia_prima_unidad}</Table.Td>
                    <Table.Td>C$ {Number(ing.costo_unitario).toFixed(4)}</Table.Td>
                    <Table.Td>C$ {Number(ing.costo_por_libra).toFixed(2)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}