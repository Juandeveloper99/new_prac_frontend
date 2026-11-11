import { useState, useEffect } from 'react';
import { TextInput, Textarea, Button, Group, Stack } from '@mantine/core';

export default function ClienteForm({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    notas: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre ?? '',
        telefono: initialData.telefono ?? '',
        email: initialData.email ?? '',
        notas: initialData.notas ?? '',
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nombre: form.nombre,
      telefono: form.telefono || null,
      email: form.email || null,
      notas: form.notas || null,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Nombre completo"
          placeholder="Ej. María López"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.currentTarget.value })}
          required
        />
        <TextInput
          label="Teléfono"
          placeholder="Ej. 8888-1111"
          value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.currentTarget.value })}
        />
        <TextInput
          label="Email"
          placeholder="Ej. maria@example.com"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.currentTarget.value })}
        />
        <Textarea
          label="Notas / observaciones"
          placeholder="Preferencias, alergias, direcciones..."
          value={form.notas}
          onChange={(e) => setForm({ ...form, notas: e.currentTarget.value })}
          minRows={3}
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