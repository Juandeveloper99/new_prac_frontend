import { useState } from 'react';
import {
  AppShell, Title, Text, Stack, Box, Group, Avatar, Divider,
} from '@mantine/core';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', emoji: '📊' },
  { path: '/inventario', label: 'Inventario', emoji: '📦' },
  { path: '/recetas', label: 'Recetas', emoji: '🍰' },
  { path: '/clientes', label: 'Clientes', emoji: '👥' },
  { path: '/pedidos', label: 'Pedidos', emoji: '📝' },
  { path: '/facturas', label: 'Facturas', emoji: '🧾' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [logoError, setLogoError] = useState(false);

  return (
    <AppShell
      navbar={{ width: 280, breakpoint: 'sm' }}
      padding="lg"
      styles={{
        main: { backgroundColor: '#f8f5f3' },
        navbar: {
          backgroundColor: '#fdf0ee',
          borderRight: '1px solid #f5d5d0',
        },
      }}
    >
      <AppShell.Navbar p="lg">
        <Stack gap="lg" h="100%">
          <Box>
            <Group gap="md" wrap="nowrap" align="center">
              {logoError ? (
                <Avatar
                  size={64}
                  radius="md"
                  style={{
                    backgroundColor: '#fde8e6',
                    color: '#d9544b',
                    fontSize: 32,
                  }}
                >
                  🍰
                </Avatar>
              ) : (
                <Avatar
                  src={logo}
                  size={64}
                  radius="md"
                  style={{ backgroundColor: '#fde8e6' }}
                  onError={() => setLogoError(true)}
                />
              )}
              <Box style={{ lineHeight: 1.1 }}>
                <Title
                  order={2}
                  style={{
                    color: '#d9544b',
                    letterSpacing: '-0.8px',
                    fontSize: '1.6rem',
                  }}
                >
                  Pastelería
                </Title>
                <Text size="sm" c="dimmed" mt={2}>
                  Sistema de gestión
                </Text>
              </Box>
            </Group>
          </Box>

          <Divider color="#f5d5d0" />

          <Stack gap={6}>
            {NAV_ITEMS.map((item) => {
              const activo = location.pathname === item.path;
              return (
                <Box
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    cursor: 'pointer',
                    padding: '12px 14px',
                    borderRadius: 10,
                    backgroundColor: activo ? '#f57c73' : 'transparent',
                    color: activo ? '#ffffff' : '#495057',
                    transition: 'all 0.15s ease',
                    userSelect: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!activo) e.currentTarget.style.backgroundColor = '#fde8e6';
                  }}
                  onMouseLeave={(e) => {
                    if (!activo) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Group gap="md" wrap="nowrap">
                    <span style={{ fontSize: 24 }}>{item.emoji}</span>
                    <Text
                      size="md"
                      fw={activo ? 600 : 500}
                      style={{ fontSize: '1.05rem' }}
                    >
                      {item.label}
                    </Text>
                  </Group>
                </Box>
              );
            })}
          </Stack>

          <Box style={{ marginTop: 'auto' }}>
            <Divider color="#f5d5d0" mb="sm" />
            <Text size="xs" c="dimmed" ta="center">
              v1.0 · {new Date().getFullYear()}
            </Text>
          </Box>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}