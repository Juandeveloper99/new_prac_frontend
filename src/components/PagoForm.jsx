import { useState } from 'react';
import {
  NumberInput, Select, TextInput, Textarea, Button, Group, Stack, Alert, Text,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

const METODOS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'otro', label: 'Otro' },
];

export default function PagoForm({ factura, onSubmit, onCancel, loading }) {
  const [monto, setMonto] = useState(Number(factura?.saldo ?? 0));
  const [metodo, setMetodo] = useState('efectivo');
  const [referencia, setReferencia] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const m = Number(monto);
    if (!m || m <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }
    if (m > Number(factura.saldo) + 0.001) {
      setError(`El monto excede el saldo pendiente (C$ ${Number(factura.saldo).toFixed(2)})`);
      return;
    }

    onSubmit({
      factura_id: factura.id,
      monto: m,
      metodo,
      referencia: referencia || null,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Group>
          <Text size="sm">Total factura: <b>C$ {Number(factura?.total ?? 0).toFixed(2)}</b></Text>
          <Text size="sm">Ya pagado: <b>C$ {Number(factura?.pagado ?? 0).toFixed(2)}</b></Text>
          <Text size="sm" c="red">Saldo: <b>C$ {Number(factura?.saldo ?? 0).toFixed(2)}</b></Text>
        </Group>

        {error && (
          <Alert color="red" icon={<IconAlertCircle size={16} />}>{error}</Alert>
        )}

        <NumberInput
          label="Monto a pagar"
          description={`Saldo pendiente: C$ ${Number(factura?.saldo ?? 0).toFixed(2)}`}
          value={monto}
          onChange={(v) => setMonto(Number(v) || 0)}
          min={0.01}
          max={Number(factura?.saldo ?? 0)}
          decimalScale={2}
          step={10}
          required
        />

        <Select
          label="Metodo de pago"
          data={METODOS}
          value={metodo}
          onChange={(v) => setMetodo(v || 'efectivo')}
          required
        />

        <TextInput
          label="Referencia (opcional)"
          placeholder="Numero de transferencia, voucher, etc."
          value={referencia}
          onChange={(e) => setReferencia(e.currentTarget.value)}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Registrar pago
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
