import { useState } from 'react';
import {
  Select, NumberInput, Textarea, Button, Group, Stack,
  Card, Text, ActionIcon, Table, Divider, Alert,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconTrash, IconPlus, IconAlertCircle } from '@tabler/icons-react';

export default function PedidoForm({
  clientes = [],
  recetas = [],
  onSubmit,
  onCancel,
  loading,
}) {
  const [form, setForm] = useState({
    cliente_id: null,
    fecha_entrega: null,
    notas: '',
    items: [{ receta_id: null, libras: 1 }],
  });

  const [error, setError] = useState(null);

  const clientesOptions = clientes.map((c) => ({
    value: String(c.id),
    label: `${c.nombre}${c.telefono ? ` - ${c.telefono}` : ''}`,
  }));

  const recetasOptions = recetas
    .filter((r) => r.activa)
    .map((r) => ({
      value: String(r.id),
      label: `${r.nombre} - C$ ${Number(r.precio_por_libra).toFixed(2)}/libra`,
    }));

  const calcularSubtotal = (item) => {
    if (!item.receta_id) return 0;
    const receta = recetas.find((r) => r.id === Number(item.receta_id));
    if (!receta) return 0;
    return Number(item.libras) * Number(receta.precio_por_libra);
  };

  const total = form.items.reduce((acc, item) => acc + calcularSubtotal(item), 0);

  const agregarItem = () => {
    setForm({
      ...form,
      items: [...form.items, { receta_id: null, libras: 1 }],
    });
  };

  const quitarItem = (index) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

  const actualizarItem = (index, field, value) => {
    const nuevos = [...form.items];
    nuevos[index] = { ...nuevos[index], [field]: value };
    setForm({ ...form, items: nuevos });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!form.cliente_id) {
      setError('Debes seleccionar un cliente');
      return;
    }
    if (!form.fecha_entrega) {
      setError('Debes seleccionar una fecha de entrega');
      return;
    }
    if (form.items.length === 0) {
      setError('Debes agregar al menos un pastel al pedido');
      return;
    }

    const idsValidos = form.items.map((i) => Number(i.receta_id)).filter(Boolean);
    if (idsValidos.length !== form.items.length) {
      setError('Debes seleccionar una receta en cada fila');
      return;
    }
let fechaISO;
try {
  fechaISO =
    form.fecha_entrega instanceof Date
      ? form.fecha_entrega.toISOString()
      : new Date(form.fecha_entrega).toISOString();
} catch (e) {
  setError('La fecha de entrega es inválida');
  return;
}

const payload = {
  cliente_id: Number(form.cliente_id),
  fecha_entrega: fechaISO,
  notas: form.notas || null,
  items: form.items.map((i) => ({
    receta_id: Number(i.receta_id),
    libras: Number(i.libras),
  })),
};

onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {error && (
          <Alert color="red" icon={<IconAlertCircle size={16} />}>
            {error}
          </Alert>
        )}

        <Select
          label="Cliente"
          placeholder="Selecciona un cliente..."
          data={clientesOptions}
          value={form.cliente_id ? String(form.cliente_id) : null}
          onChange={(v) => setForm({ ...form, cliente_id: v })}
          searchable
          required
        />

        <DateTimePicker
  label="Fecha de entrega"
  placeholder="Selecciona fecha y hora"
  value={form.fecha_entrega}
  onChange={(v) => {
    let fecha = v;
    if (typeof v === 'string') fecha = new Date(v);
    setForm({ ...form, fecha_entrega: fecha });
  }}
  valueFormat="DD/MM/YYYY HH:mm"
  required
/>

        <Textarea
          label="Notas"
          placeholder="Observaciones del pedido (opcional)"
          value={form.notas}
          onChange={(e) => setForm({ ...form, notas: e.currentTarget.value })}
          minRows={2}
        />

        <Divider label="Pasteles del pedido" labelPosition="left" />

        <Card withBorder>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Receta</Table.Th>
                <Table.Th style={{ width: 120 }}>Libras</Table.Th>
                <Table.Th style={{ width: 120 }}>Subtotal</Table.Th>
                <Table.Th style={{ width: 60 }}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {form.items.map((item, idx) => (
                <Table.Tr key={idx}>
                  <Table.Td>
                    <Select
                      placeholder="Selecciona..."
                      data={recetasOptions}
                      value={item.receta_id ? String(item.receta_id) : null}
                      onChange={(v) => actualizarItem(idx, 'receta_id', v)}
                      searchable
                      required
                    />
                  </Table.Td>
                  <Table.Td>
                    <NumberInput
                      value={item.libras}
                      onChange={(v) => actualizarItem(idx, 'libras', Number(v) || 0)}
                      min={0.1}
                      decimalScale={2}
                      step={0.5}
                      required
                    />
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">C$ {calcularSubtotal(item).toFixed(2)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => quitarItem(idx)}
                      disabled={form.items.length === 1}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          <Group justify="space-between" mt="md">
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={agregarItem}
            >
              Agregar pastel
            </Button>
          </Group>
        </Card>

        <Card withBorder bg="gray.0">
          <Group justify="space-between">
            <Text size="md" fw={700}>Total del pedido:</Text>
            <Text size="md" fw={700}>C$ {total.toFixed(2)}</Text>
          </Group>
        </Card>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Crear pedido
          </Button>
        </Group>
      </Stack>
    </form>
  );
}