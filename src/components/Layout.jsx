
import { AppShell, NavLink, Title, Text, Stack, Box } from '@mantine/core';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/dashboard', label: '📊 Dashboard' },
  { path: '/inventario', label: '📦 Inventario' },
  { path: '/recetas', label: '🍰 Recetas' },
  { path: '/clientes', label: '👥 Clientes' },
  { path: '/pedidos', label: '📝 Pedidos' },
  { path: '/facturas', label: '🧾 Facturas' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppShell
      navbar={{ width: 240, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Navbar p="md">
        <Stack gap="md">
          <Box>
            <Title order={3}>🍰 Pastelería</Title>
            <Text size="xs" c="dimmed">Sistema de gestión</Text>
          </Box>
          <Stack gap={4}>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                label={item.label}
                active={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                style={{ borderRadius: 6 }}
              />
            ))}
          </Stack>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
