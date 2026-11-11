import { useState } from 'react';
import { NumberInput, TextInput, Textarea, Button, Group, Stack } from '@mantine/core';

export default function EntradaStockForm({ materiaPrima, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    cantidad: 0,
    motivo: '',
    costo_unitario: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      cantidad: Number(form.cantidad),
      motivo: form.motivo || undefined,
    };
    if (form.costo_unitario !== '' && form.costo_unitario !== null) {
      payload.costo_unitario = Number(form.costo_unitario);
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Materia prima"
          value={materiaPrima?.nombre ?? ''}
          readOnly
          variant="filled"
        />
        <NumberInput
          label="Cantidad a ingresar"
          description={`Unidad: ${materiaPrima?.unidad ?? ''}`}
          value={form.cantidad}
          onChange={(v) => setForm({ ...form, cantidad: Number(v) || 0 })}
          min={0.001}
          decimalScale={3}
          step={0.1}
          required
        />
        <NumberInput
          label="Nuevo costo unitario (opcional)"
          description="Déjalo vacío para mantener el costo actual"
          value={form.costo_unitario}
          onChange={(v) => setForm({ ...form, costo_unitario: v })}
          min={0}
          decimalScale={4}
          step={0.01}
        />
        <Textarea
          label="Motivo / observaciones"
          placeholder="Ej. Compra a proveedor, ajuste de inventario, etc."
          value={form.motivo}
          onChange={(e) => setForm({ ...form, motivo: e.currentTarget.value })}
          minRows={2}
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Registrar entrada
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
