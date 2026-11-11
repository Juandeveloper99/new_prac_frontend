
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Inventario from './pages/Inventario';
import Recetas from './pages/Recetas';
import Clientes from './pages/Clientes';
import Pedidos from './pages/Pedidos';
import Facturas from './pages/Facturas';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/recetas" element={<Recetas />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/facturas" element={<Facturas />} />
      </Route>
    </Routes>
  );
}