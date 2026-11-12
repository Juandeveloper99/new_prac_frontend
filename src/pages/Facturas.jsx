import { useEffect, useState } from 'react';
import {
  Title, Table, Badge, Group, Loader, Center, Alert,
  TextInput, Button, Stack, Card, Text, Modal, ActionIcon, Tooltip, Select,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconEye, IconCash, IconBan } from '@tabler/icons-react';
import { facturasApi } from '../api/facturas';
import { pagosApi } from '../api/pagos';
import FacturaDetalle from '../components/FacturaDetalle';
import PagoForm from '../components/PagoForm';

const ESTADOS = {
  pendiente: { color: 'yellow', label: 'Pendiente' },
  pagada: { color: 'green', label: 'Pagada' },
  anulada: { color: 'red', label: 'Anulada' },
};

export default function Facturas() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [modalDetalle, { open: openDetalle, close: closeDetalle }] = useDisclosure(false);
  const [modalPago, { open: openPago, close: closePago }] = useDisclosure(false);
  const [detalle, setDetalle] = useState(null);
  const [pagoTarget, setPagoTarget] = useState(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await facturasApi.listar({
        estado: filtroEstado || undefined,
        q: busqueda || undefined,
      });
      setItems(data);
    } catch (err) {
      setError('No se pudo cargar el listado. Verifica que la API este corriendo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [filtroEstado]);

  const abrirDetalle = async (item) => {
    try {
      const full = await facturasApi.obtener(item.id);
      setDetalle(full);
      openDetalle();
    } catch (err) {}
  };

  const abrirPago = async (item) => {
    try {
      const full = await facturasApi.obtener(item.id);
      if (Number(full.saldo) <= 0) {
        notifications.show({
          title: 'Sin saldo',
          message: 'Esta factura ya esta completamente pagada',
          color: 'blue',
        });
        return;
      }
      setPagoTarget(full);
      openPago();
    } catch (err) {}
  };

  const handlePago = async (payload) => {
    setGuardando(true);
    try {
      const r = await pagosApi.crear(payload);
      notifications.show({
        title: 'Pago registrado',
        message: r.factura.estado === 'pagada'
          ? 'Factura pagada completamente'
          : 'Pago parcial aplicado',
        color: 'green',
      });
      closePago();
      await cargar();
    } catch (err) {
    } finally {
      setGuardando(false);
    }
  };

  const anularFactura = (item) => {
    modals.openConfirmModal({
      title: 'Anular factura',
      children: (
        <Text size="sm">
          Seguro que quieres anular <b>{item.numero_factura}</b>?
        </Text>
      ),
      labels: { confirm: 'Anular', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const motivo = window.prompt('Motivo de la anulacion:');
        if (!motivo) return;
        try {
          await facturasApi.anular(item.id, motivo);
          notifications.show({
            title: 'Factura anulada',
            message: item.numero_factura,
            color: 'orange',
          });
          await cargar();
        } catch (err) {}
      },
    });
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Facturas</Title>
        <Button onClick={cargar} variant="light">Recargar</Button>
      </Group>

      <Card withBorder>
        <Group justify="space-between" mb="md">
          <Group>
            <TextInput
              placeholder="Buscar por numero o cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.currentTarget.value)}
              style={{ width: 320 }}
            />
            <Select
              placeholder="Estado"
              data={[
                { value: '', label: 'Todos' },
                { value: 'pendiente', label: 'Pendientes' },
                { value: 'pagada', label: 'Pagadas' },
                { value: 'anulada', label: 'Anuladas' },
              ]}
              value={filtroEstado}
              onChange={(v) => setFiltroEstado(v || '')}
              clearable
              style={{ width: 160 }}
            />
          </Group>
          <Text size="sm" c="dimmed">{items.length} factura(s)</Text>
        </Group>

        {loading && <Center py="xl"><Loader /></Center>}
        {error && <Alert color="red" title="Error">{error}</Alert>}

        {!loading && !error && (
          <Table.ScrollContainer minWidth={1000}>
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Numero</Table.Th>
                  <Table.Th>Cliente</Table.Th>
                  <Table.Th>Emision</Table.Th>
                  <Table.Th>Total</Table.Th>
                  <Table.Th>Pagado</Table.Th>
                  <Table.Th>Saldo</Table.Th>
                  <Table.Th>Estado</Table.Th>
                  <Table.Th>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items.map((it) => {
                  const info = ESTADOS[it.estado] ?? { color: 'gray', label: it.estado };
                  const saldo = Number(it.total) - Number(it.pagado);
                  return (
                    <Table.Tr key={it.id}>
                      <Table.Td><Text fw={500}>{it.numero_factura}</Text></Table.Td>
                      <Table.Td>{it.cliente_nombre}</Table.Td>
                      <Table.Td>{new Date(it.fecha_emision).toLocaleDateString('es-NI')}</Table.Td>
                      <Table.Td>C$ {Number(it.total).toFixed(2)}</Table.Td>
                      <Table.Td>C$ {Number(it.pagado).toFixed(2)}</Table.Td>
                      <Table.Td>
                        <Text c={saldo > 0 ? 'red' : 'green'} fw={500}>
                          C$ {saldo.toFixed(2)}
                        </Text>
                      </Table.Td>
                      <Table.Td><Badge color={info.color}>{info.label}</Badge></Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Tooltip label="Ver detalle">
                            <ActionIcon variant="light" color="gray" onClick={() => abrirDetalle(it)}>
                              <IconEye size={16} />
                            </ActionIcon>
                          </Tooltip>
                          {it.estado === 'pendiente' && (
                            <Tooltip label="Registrar pago">
                              <ActionIcon variant="light" color="green" onClick={() => abrirPago(it)}>
                                <IconCash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                          {it.estado === 'pendiente' && (
                            <Tooltip label="Anular factura">
                              <ActionIcon variant="light" color="red" onClick={() => anularFactura(it)}>
                                <IconBan size={16} />
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
                    <Table.Td colSpan={8}>
                      <Text ta="center" c="dimmed">No hay facturas</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      <Modal
        opened={modalDetalle}
        onClose={closeDetalle}
        title={detalle ? `Factura ${detalle.numero_factura}` : 'Detalle'}
        size="xl"
      >
        <FacturaDetalle factura={detalle} />
      </Modal>

      <Modal
        opened={modalPago}
        onClose={closePago}
        title={pagoTarget ? `Registrar pago - ${pagoTarget.numero_factura}` : 'Pago'}
        size="md"
      >
        <PagoForm
          factura={pagoTarget}
          onSubmit={handlePago}
          onCancel={closePago}
          loading={guardando}
        />
      </Modal>
    </Stack>
  );
}
