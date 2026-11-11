import { useState, useEffect } from 'react';
import { TextInput, NumberInput, Select, Button, Group, Stack } from '@mantine/core';

const UNIDADES = [
  { value: 'kg', label: 'Kilogramo (kg)' },
  { value: 'g', label: 'Gramo (g)' },
  { value: 'lt', label: 'Litro (lt)' },
  { value: 'ml', label: 'Mililitro (ml)' },
  { value: 'pza', label: 'Pieza (pza)' },
];

export default function MateriaPrimaForm({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    nombre: '',
    unidad: 'kg',
    stock_actual: 0,
    stock_minimo: 0,
    costo_unitario: 0,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre ?? '',
        unidad: initialData.unidad ?? 'kg',
        stock_actual: Number(initialData.stock_actual ?? 0),
        stock_minimo: Number(initialData.stock_minimo ?? 0),
        costo_unitario: Number(initialData.costo_unitario ?? 0),
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Nombre"
          placeholder="Ej. Harina"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.currentTarget.value })}
          required
        />
        <Select
          label="Unidad"
          data={UNIDADES}
          value={form.unidad}
          onChange={(v) => setForm({ ...form, unidad: v || 'kg' })}
          required
        />
        <NumberInput
          label="Stock actual"
          value={form.stock_actual}
          onChange={(v) => setForm({ ...form, stock_actual: Number(v) || 0 })}
          min={0}
          decimalScale={3}
          step={0.1}
          required
        />
        <NumberInput
          label="Stock mínimo"
          value={form.stock_minimo}
          onChange={(v) => setForm({ ...form, stock_minimo: Number(v) || 0 })}
          min={0}
          decimalScale={3}
          step={0.1}
          required
        />
        <NumberInput
          label="Costo unitario (C$)"
          value={form.costo_unitario}
          onChange={(v) => setForm({ ...form, costo_unitario: Number(v) || 0 })}
          min={0}
          decimalScale={4}
          step={0.01}
          required
        />
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