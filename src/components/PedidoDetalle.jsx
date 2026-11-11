import {
  Stack, Group, Text, Table, Badge, Divider, Card,
} from '@mantine/core';

const ESTADOS = {
  pendiente: { color: 'yellow', label: 'Pendiente' },
  en_proceso: { color: 'blue', label: 'En proceso' },
  listo: { color: 'teal', label: 'Listo' },
  pagado: { color: 'green', label: 'Pagado' },
  entregado: { color: 'gray', label: 'Entregado' },
  cancelado: { color: 'red', label: 'Cancelado' },
};

export default function PedidoDetalle({ pedido }) {
  if (!pedido) return null;

  const estadoInfo = ESTADOS[pedido.estado] ?? { color: 'gray', label: pedido.estado };
  const fechaEntrega = new Date(pedido.fecha_entrega);
  const fechaCreacion = new Date(pedido.fecha_creacion);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Text size="xs" c="dimmed">Cliente</Text>
          <Text fw={500}>{pedido.cliente_nombre}</Text>
          {pedido.cliente_telefono && (
            <Text size="sm" c="dimmed">{pedido.cliente_telefono}</Text>
          )}
        </div>
        <Badge color={estadoInfo.color} size="lg">{estadoInfo.label}</Badge>
      </Group>

      <Divider />

      <Group>
        <div>
          <Text size="xs" c="dimmed">Fecha de entrega</Text>
          <Text fw={500}>{fechaEntrega.toLocaleString('es-NI')}</Text>
        </div>
        <div>
          <Text size="xs" c="dimmed">Fecha de creación</Text>
          <Text fw={500}>{fechaCreacion.toLocaleString('es-NI')}</Text>
        </div>
      </Group>

      {pedido.notas && (
        <Card withBorder bg="gray.0">
          <Text size="xs" c="dimmed" mb={4}>Notas</Text>
          <Text size="sm">{pedido.notas}</Text>
        </Card>
      )}

      <Divider label="Pasteles" labelPosition="left" />

      <Table striped withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Pastel</Table.Th>
            <Table.Th>Libras</Table.Th>
            <Table.Th>Precio/libra</Table.Th>
            <Table.Th>Subtotal</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {pedido.items?.map((item) => (
            <Table.Tr key={item.id}>
              <Table.Td>{item.nombre_pastel}</Table.Td>
              <Table.Td>{Number(item.libras).toFixed(2)}</Table.Td>
              <Table.Td>C$ {Number(item.precio_por_libra).toFixed(2)}</Table.Td>
              <Table.Td>C$ {Number(item.subtotal).toFixed(2)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Card withBorder bg="blue.0">
        <Group justify="space-between">
          <Text fw={700}>Total:</Text>
          <Text fw={700} size="lg">C$ {Number(pedido.total).toFixed(2)}</Text>
        </Group>
      </Card>
    </Stack>
  );
}