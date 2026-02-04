/* ============================================================
   App.js  —  roteador principal
   ============================================================ */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';

/* ── páginas públicas ── */
import Home      from './pages/Home';
import Gallery   from './pages/Gallery';

/* ── páginas admin ── */
import AdminLogin      from './pages/admin/Login';
import AdminDashboard  from './pages/admin/Dashboard';
import AdminPortfolio  from './pages/admin/Portfolio';
import AdminAgenda     from './pages/admin/Agenda';
import AdminSimulator  from './pages/admin/Simulator';
import AdminFabrics    from './pages/admin/Fabrics';

/* ── layout ── */
import AdminLayout from './components/AdminLayout';

/* ── guarda de rota ── */
function PrivateRoute({ children }) {
  const token = localStorage.getItem('estofaria_token');
  return token ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── públicas ── */}
        <Route path="/"            element={<Home />} />
        <Route path="/galeria"     element={<Gallery />} />
        <Route path="/galeria/:cat" element={<Gallery />} />

        {/* ── admin ── */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }>
          <Route index          element={<AdminDashboard />} />
          <Route path="portfolio"  element={<AdminPortfolio />} />
          <Route path="agenda"     element={<AdminAgenda />} />
          <Route path="simulador"  element={<AdminSimulator />} />
          <Route path="tecidos"    element={<AdminFabrics />} />
        </Route>

        {/* ── catch-all ── */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
