import { Title, Text } from '@mantine/core';
export default function Dashboard() {
  return (
    <>
      <Title order={2}>📊 Dashboard</Title>
      <Text c="dimmed">Próximamente: ventas del mes, top recetas, bajo stock.</Text>
    </>
  );
}