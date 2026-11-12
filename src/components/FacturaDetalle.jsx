import {
  Stack, Group, Text, Table, Badge, Divider, Card, Button,
} from '@mantine/core';
import { IconPrinter } from '@tabler/icons-react';

const ESTADOS = {
  pendiente: { color: 'yellow', label: 'PENDIENTE' },
  pagada: { color: 'green', label: 'PAGADA' },
  anulada: { color: 'red', label: 'ANULADA' },
};

export default function FacturaDetalle({ factura }) {
  if (!factura) return null;

  const estadoInfo = ESTADOS[factura.estado] ?? { color: 'gray', label: factura.estado };
  const fechaEmision = new Date(factura.fecha_emision).toLocaleString('es-NI');
  const fechaEntrega = factura.fecha_entrega
    ? new Date(factura.fecha_entrega).toLocaleString('es-NI')
    : '-';

  const handlePrint = () => {
    // Clona la factura en una ventana nueva y la imprime
    const ventana = window.open('', '_blank', 'width=800,height=900');
    ventana.document.write(`
      <html>
        <head>
          <title>Factura ${factura.numero_factura}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; }
            h1 { color: #d6336c; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
            th { background: #f8f8f8; }
            .right { text-align: right; }
            .totales { margin-top: 20px; float: right; width: 300px; }
          </style>
        </head>
        <body>
          <h1>Factura ${factura.numero_factura}</h1>
          <p><b>Emision:</b> ${fechaEmision}</p>
          <p><b>Cliente:</b> ${factura.cliente_nombre}</p>
          <p><b>Telefono:</b> ${factura.cliente_telefono ?? '-'}</p>
          <p><b>Fecha entrega:</b> ${fechaEntrega}</p>
          <hr/>
          <table>
            <thead>
              <tr><th>Pastel</th><th>Libras</th><th>Precio/libra</th><th class="right">Subtotal</th></tr>
            </thead>
            <tbody>
              ${factura.items.map((i) => `
                <tr>
                  <td>${i.nombre_pastel}</td>
                  <td>${Number(i.libras).toFixed(2)}</td>
                  <td>C$ ${Number(i.precio_por_libra).toFixed(2)}</td>
                  <td class="right">C$ ${Number(i.subtotal).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totales">
            <p><b>Total:</b> C$ ${Number(factura.total).toFixed(2)}</p>
            <p><b>Pagado:</b> C$ ${Number(factura.pagado).toFixed(2)}</p>
            <p><b>Saldo:</b> C$ ${Number(factura.saldo).toFixed(2)}</p>
            <p><b>Estado:</b> ${estadoInfo.label}</p>
          </div>
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.focus();
    setTimeout(() => ventana.print(), 500);
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Text size="xs" c="dimmed">Factura</Text>
          <Text fw={700} size="lg">{factura.numero_factura}</Text>
        </div>
        <Badge color={estadoInfo.color} size="lg">{estadoInfo.label}</Badge>
      </Group>

      <Divider />

      <Group>
        <div>
          <Text size="xs" c="dimmed">Cliente</Text>
          <Text fw={500}>{factura.cliente_nombre}</Text>
          {factura.cliente_telefono && <Text size="sm" c="dimmed">{factura.cliente_telefono}</Text>}
        </div>
        <div>
          <Text size="xs" c="dimmed">Emision</Text>
          <Text>{fechaEmision}</Text>
        </div>
        <div>
          <Text size="xs" c="dimmed">Entrega</Text>
          <Text>{fechaEntrega}</Text>
        </div>
      </Group>

      <Divider label="Items" labelPosition="left" />

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
          {factura.items.map((i, idx) => (
            <Table.Tr key={idx}>
              <Table.Td>{i.nombre_pastel}</Table.Td>
              <Table.Td>{Number(i.libras).toFixed(2)}</Table.Td>
              <Table.Td>C$ {Number(i.precio_por_libra).toFixed(2)}</Table.Td>
              <Table.Td>C$ {Number(i.subtotal).toFixed(2)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Divider label="Pagos" labelPosition="left" />

      {factura.pagos.length === 0 ? (
        <Text size="sm" c="dimmed">Aun no hay pagos registrados</Text>
      ) : (
        <Table withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Fecha</Table.Th>
              <Table.Th>Metodo</Table.Th>
              <Table.Th>Referencia</Table.Th>
              <Table.Th>Monto</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {factura.pagos.map((p) => (
              <Table.Tr key={p.id}>
                <Table.Td>{new Date(p.fecha).toLocaleString('es-NI')}</Table.Td>
                <Table.Td>{p.metodo}</Table.Td>
                <Table.Td>{p.referencia || '-'}</Table.Td>
                <Table.Td>C$ {Number(p.monto).toFixed(2)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Card withBorder bg="blue.0">
        <Group justify="space-between">
          <Text fw={500}>Total:</Text>
          <Text fw={500}>C$ {Number(factura.total).toFixed(2)}</Text>
        </Group>
        <Group justify="space-between">
          <Text fw={500}>Pagado:</Text>
          <Text fw={500} c="green">C$ {Number(factura.pagado).toFixed(2)}</Text>
        </Group>
        <Group justify="space-between">
          <Text fw={700}>Saldo:</Text>
          <Text fw={700} c={Number(factura.saldo) > 0 ? 'red' : 'green'}>
            C$ {Number(factura.saldo).toFixed(2)}
          </Text>
        </Group>
      </Card>

      <Group justify="flex-end">
        <Button leftSection={<IconPrinter size={16} />} onClick={handlePrint} variant="light">
          Imprimir factura
        </Button>
      </Group>
    </Stack>
  );
}