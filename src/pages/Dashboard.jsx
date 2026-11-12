import { useEffect, useState } from 'react';
import {
  Title, SimpleGrid, Card, Text, Group, Badge, Loader, Center, Alert,
  Table, Stack, ThemeIcon, Progress, Divider,
} from '@mantine/core';
import { BarChart } from '@mantine/charts';
import {
  IconShoppingCart, IconCash, IconUsers, IconCake, IconAlertTriangle,
  IconFileInvoice,
} from '@tabler/icons-react';
import { reportesApi } from '../api/reportes';

const ESTADOS = {
  pendiente: { color: 'yellow', label: 'Pendiente' },
  en_proceso: { color: 'blue', label: 'En proceso' },
  listo: { color: 'teal', label: 'Listo' },
  pagado: { color: 'green', label: 'Pagado' },
  entregado: { color: 'gray', label: 'Entregado' },
  cancelado: { color: 'red', label: 'Cancelado' },
};

const COLORES_ESTADO = {
  pendiente: 'yellow.6',
  en_proceso: 'blue.6',
  listo: 'teal.6',
  pagado: 'green.6',
  entregado: 'gray.6',
  cancelado: 'red.6',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await reportesApi.dashboard();
      setData(d);
    } catch (err) {
      setError('No se pudo cargar el dashboard. Verifica que la API este corriendo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  if (loading) {
    return <Center py="xl"><Loader size="lg" /></Center>;
  }
  if (error) {
    return <Alert color="red" title="Error">{error}</Alert>;
  }
  if (!data) return null;

  const { contadores, pedidosPorEstado, topRecetas, bajoStock, ultimosPedidos, ventasPorDia } = data;

  const estadosChart = pedidosPorEstado.map((e) => ({
    estado: ESTADOS[e.estado]?.label ?? e.estado,
    cantidad: Number(e.cantidad),
    color: COLORES_ESTADO[e.estado] ?? 'gray.6',
  }));

  const ventasChart = ventasPorDia.map((v) => ({
    fecha: new Date(v.fecha).toLocaleDateString('es-NI', { day: '2-digit', month: '2-digit' }),
    ingresos: Number(v.ingresos),
    pedidos: Number(v.pedidos),
  }));

  const estiloCard = {
  backgroundColor: '#ffffff',
  borderColor: '#e9ecef',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

  return (
    <Stack gap="lg" style={{ maxWidth: '100%' }}>
      <Group justify="space-between">
        <Title order={2}>Dashboard</Title>
        <Text size="sm" c="dimmed">
          Actualizado: {new Date().toLocaleString('es-NI')}
        </Text>
      </Group>

      {/* Tarjetas de contadores */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        <TarjetaEstadistica
          titulo="Pedidos (30 dias)"
          valor={contadores.pedidos_mes}
          icono={<IconShoppingCart size={28} />}
          color="blue"
        />
        <TarjetaEstadistica
          titulo="Ventas (30 dias)"
          valor={`C$ ${Number(contadores.ventas_mes).toFixed(2)}`}
          icono={<IconCash size={28} />}
          color="green"
        />
        <TarjetaEstadistica
          titulo="Clientes"
          valor={contadores.total_clientes}
          icono={<IconUsers size={28} />}
          color="violet"
        />
        <TarjetaEstadistica
          titulo="Recetas activas"
          valor={contadores.recetas_activas}
          icono={<IconCake size={28} />}
          color="pink"
        />
        <TarjetaEstadistica
          titulo="Facturas pendientes"
          valor={contadores.facturas_pendientes}
          icono={<IconFileInvoice size={28} />}
          color="orange"
        />
        <TarjetaEstadistica
          titulo="Bajo stock"
          valor={contadores.materias_bajo_stock}
          icono={<IconAlertTriangle size={28} />}
          color={contadores.materias_bajo_stock > 0 ? 'red' : 'gray'}
        />
      </SimpleGrid>

      {/* Gráficos */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Card withBorder>
          <Text fw={600} mb="md">Pedidos por estado</Text>
          {estadosChart.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">Sin pedidos registrados</Text>
          ) : (
            <BarChart
              h={280}
              data={estadosChart}
              dataKey="estado"
              series={[{ name: 'cantidad', color: 'pink.6' }]}
              tickLine="y"
            />
          )}
        </Card>

        <Card withBorder>
          <Text fw={600} mb="md">Ventas ultimos 14 dias</Text>
          {ventasChart.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">Sin ventas registradas</Text>
          ) : (
            <BarChart
              h={280}
              data={ventasChart}
              dataKey="fecha"
              series={[{ name: 'ingresos', color: 'green.6' }]}
              valueFormatter={(v) => `C$ ${v}`}
              tickLine="y"
            />
          )}
        </Card>
      </SimpleGrid>

      {/* Tablas inferiores */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Card withBorder>
          <Text fw={600} mb="md">Top recetas (por libras)</Text>
          {topRecetas.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">Sin datos aun</Text>
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Pastel</Table.Th>
                  <Table.Th>Libras</Table.Th>
                  <Table.Th>Ingresos</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {topRecetas.map((r, idx) => (
                  <Table.Tr key={idx}>
                    <Table.Td>{r.nombre}</Table.Td>
                    <Table.Td>{Number(r.libras_totales).toFixed(2)}</Table.Td>
                    <Table.Td>C$ {Number(r.ingresos).toFixed(2)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Card>

        <Card withBorder>
          <Text fw={600} mb="md">Materias primas bajo stock</Text>
          {bajoStock.length === 0 ? (
            <Alert color="green" variant="light" icon={<IconAlertTriangle size={16} />}>
              Todo el inventario esta en niveles saludables
            </Alert>
          ) : (
            <Stack gap="sm">
              {bajoStock.map((m) => {
                const porcentaje = m.stock_minimo > 0
                  ? Math.min(100, (Number(m.stock_actual) / Number(m.stock_minimo)) * 100)
                  : 0;
                return (
                  <div key={m.id}>
                    <Group justify="space-between" mb={4}>
                      <Text size="sm" fw={500}>{m.nombre}</Text>
                      <Text size="xs" c="red">
                        {Number(m.stock_actual).toFixed(2)} / {Number(m.stock_minimo).toFixed(2)} {m.unidad}
                      </Text>
                    </Group>
                    <Progress value={porcentaje} color="red" size="sm" />
                  </div>
                );
              })}
            </Stack>
          )}
        </Card>
      </SimpleGrid>

      {/* Ultimos pedidos */}
      <Card withBorder>
        <Text fw={600} mb="md">Ultimos pedidos</Text>
        {ultimosPedidos.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">Sin pedidos registrados</Text>
        ) : (
          <Table striped withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>
                <Table.Th>Cliente</Table.Th>
                <Table.Th>Entrega</Table.Th>
                <Table.Th>Total</Table.Th>
                <Table.Th>Estado</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {ultimosPedidos.map((p) => {
                const info = ESTADOS[p.estado] ?? { color: 'gray', label: p.estado };
                return (
                  <Table.Tr key={p.id}>
                    <Table.Td>#{p.id}</Table.Td>
                    <Table.Td>{p.cliente_nombre}</Table.Td>
                    <Table.Td>
                      {new Date(p.fecha_entrega).toLocaleString('es-NI')}
                    </Table.Td>
                    <Table.Td>C$ {Number(p.total).toFixed(2)}</Table.Td>
                    <Table.Td>
                      <Badge color={info.color}>{info.label}</Badge>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </Stack>
  );
}

function TarjetaEstadistica({ titulo, valor, icono, color }) {
  return (
    <Card
      withBorder
      padding="lg"
      radius="md"
      style={{
        backgroundColor: '#ffffff',
        borderColor: '#e9ecef',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: 0.5 }}>
            {titulo}
          </Text>
          <Text size="xl" fw={700} mt={6} style={{ color: '#2b2b2b' }}>
            {valor}
          </Text>
        </div>
        <ThemeIcon size="xl" radius="md" color={color} variant="light">
          {icono}
        </ThemeIcon>
      </Group>
    </Card>
  );
}