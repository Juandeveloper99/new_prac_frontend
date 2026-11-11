import { useState, useEffect } from 'react';
import {
  TextInput, Textarea, NumberInput, Select, Button, Group, Stack,
  Card, Text, ActionIcon, Table, Divider
} from '@mantine/core';
import { IconTrash, IconPlus } from '@tabler/icons-react';

export default function RecetaForm({
  initialData,
  materiasPrimas = [],
  onSubmit,
  onCancel,
  loading,
}) {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio_por_libra: 0,
    activa: true,
    ingredientes: [{ materia_prima_id: null, cantidad_por_libra: 0 }],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre ?? '',
        descripcion: initialData.descripcion ?? '',
        precio_por_libra: Number(initialData.precio_por_libra ?? 0),
        activa: initialData.activa !== 0,
        ingredientes:
          initialData.ingredientes?.map((i) => ({
            materia_prima_id: i.materia_prima_id,
            cantidad_por_libra: Number(i.cantidad_por_libra),
          })) ?? [{ materia_prima_id: null, cantidad_por_libra: 0 }],
      });
    }
  }, [initialData]);

  const materiasOptions = materiasPrimas.map((mp) => ({
    value: String(mp.id),
    label: `${mp.nombre} (${mp.unidad}) — C$ ${Number(mp.costo_unitario).toFixed(2)}`,
  }));

  // Costo total de la receta por libra, calculado en vivo
  const costoTotal = form.ingredientes.reduce((acc, ing) => {
    if (!ing.materia_prima_id) return acc;
    const mp = materiasPrimas.find((m) => m.id === Number(ing.materia_prima_id));
    if (!mp) return acc;
    return acc + Number(ing.cantidad_por_libra) * Number(mp.costo_unitario);
  }, 0);

  const margen = Number(form.precio_por_libra) - costoTotal;

  const agregarIngrediente = () => {
    setForm({
      ...form,
      ingredientes: [
        ...form.ingredientes,
        { materia_prima_id: null, cantidad_por_libra: 0 },
      ],
    });
  };

  const quitarIngrediente = (index) => {
    setForm({
      ...form,
      ingredientes: form.ingredientes.filter((_, i) => i !== index),
    });
  };

  const actualizarIngrediente = (index, field, value) => {
    const nuevos = [...form.ingredientes];
    nuevos[index] = { ...nuevos[index], [field]: value };
    setForm({ ...form, ingredientes: nuevos });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (form.ingredientes.length === 0) {
      alert('Debe agregar al menos un ingrediente');
      return;
    }

    const ids = form.ingredientes
      .map((i) => Number(i.materia_prima_id))
      .filter(Boolean);

    if (ids.length !== form.ingredientes.length) {
      alert('Debes seleccionar una materia prima en cada fila');
      return;
    }

    if (new Set(ids).size !== ids.length) {
      alert('No puedes repetir la misma materia prima dos veces');
      return;
    }

    // Preparar payload
    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      precio_por_libra: Number(form.precio_por_libra),
      activa: form.activa,
      ingredientes: form.ingredientes.map((i) => ({
        materia_prima_id: Number(i.materia_prima_id),
        cantidad_por_libra: Number(i.cantidad_por_libra),
      })),
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Nombre de la receta"
          placeholder="Ej. Pastel de Chocolate"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.currentTarget.value })}
          required
        />
        <Textarea
          label="Descripción"
          placeholder="Opcional"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.currentTarget.value })}
          minRows={2}
        />
        <NumberInput
          label="Precio por libra (C$)"
          value={form.precio_por_libra}
          onChange={(v) => setForm({ ...form, precio_por_libra: Number(v) || 0 })}
          min={0}
          decimalScale={2}
          step={10}
          required
        />

        <Divider label="Ingredientes (por libra)" labelPosition="left" />

        <Card withBorder>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Materia prima</Table.Th>
                <Table.Th style={{ width: 140 }}>Cantidad/libra</Table.Th>
                <Table.Th style={{ width: 100 }}>Subtotal</Table.Th>
                <Table.Th style={{ width: 60 }}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {form.ingredientes.map((ing, idx) => {
                const mp = materiasPrimas.find((m) => m.id === Number(ing.materia_prima_id));
                const subtotal = mp
                  ? Number(ing.cantidad_por_libra) * Number(mp.costo_unitario)
                  : 0;
                return (
                  <Table.Tr key={idx}>
                    <Table.Td>
                      <Select
                        placeholder="Selecciona..."
                        data={materiasOptions}
                        value={ing.materia_prima_id ? String(ing.materia_prima_id) : null}
                        onChange={(v) =>
                          actualizarIngrediente(idx, 'materia_prima_id', v)
                        }
                        searchable
                        required
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={ing.cantidad_por_libra}
                        onChange={(v) =>
                          actualizarIngrediente(idx, 'cantidad_por_libra', Number(v) || 0)
                        }
                        min={0.0001}
                        decimalScale={4}
                        step={0.01}
                        required
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">C$ {subtotal.toFixed(2)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => quitarIngrediente(idx)}
                        disabled={form.ingredientes.length === 1}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>

          <Group justify="space-between" mt="md">
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={agregarIngrediente}
            >
              Agregar ingrediente
            </Button>
          </Group>
        </Card>

        <Card withBorder bg="gray.0">
          <Group justify="space-between">
            <Text size="sm">Costo por libra:</Text>
            <Text size="sm" fw={500}>C$ {costoTotal.toFixed(2)}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm">Precio de venta:</Text>
            <Text size="sm" fw={500}>C$ {Number(form.precio_por_libra).toFixed(2)}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" fw={700}>Margen de ganancia:</Text>
            <Text size="sm" fw={700} c={margen >= 0 ? 'green' : 'red'}>
              C$ {margen.toFixed(2)}
            </Text>
          </Group>
        </Card>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Guardar
          </Button>
        </Group>
      </Stack>
    </form>
  );
}