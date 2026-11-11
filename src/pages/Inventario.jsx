import { useEffect, useState } from 'react';
import {
  Title, Table, Badge, Group, Loader, Center, Alert,
  TextInput, Button, Stack, Card, Text
} from '@mantine/core';
import { materiasPrimasApi } from '../api/materiasPrimas';

export default function Inventario() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await materiasPrimasApi.listar();
      setItems(data);
    } catch (err) {
      setError('No se pudo cargar el inventario. ¿Está corriendo la API en :3000?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = items.filter((it) =>
    it.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>📦 Inventario de materias primas</Title>
        <Button onClick={cargar} variant="light">🔄 Recargar</Button>
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

        {loading && (
          <Center py="xl"><Loader /></Center>
        )}

        {error && (
          <Alert color="red" title="Error">{error}</Alert>
        )}

        {!loading && !error && (
          <Table.ScrollContainer minWidth={800}>
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
                    </Table.Tr>
                  );
                })}
                {filtrados.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={7}>
                      <Text ta="center" c="dimmed">No hay registros</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>
    </Stack>
  );
}