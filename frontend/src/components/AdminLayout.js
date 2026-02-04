/* ============================================================
   components/AdminLayout.js  —  layout do painel admin
   sidebar + outlet para as páginas
   ============================================================ */
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const NAV = [
  { to: '/admin',           label: 'Dashboard',   icon: '▣' },
  { to: '/admin/portfolio', label: 'Portfolio',   icon: '◼' },
  { to: '/admin/agenda',    label: 'Agenda',      icon: '📅' },
  { to: '/admin/simulador', label: 'Simulador',   icon: '🎨' },
  { to: '/admin/tecidos',   label: 'Tecidos',     icon: '◻' },
];

export default function AdminLayout() {
  const navigate  = useNavigate();
  const [user, setUser]       = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('estofaria_user');
    if (u) setUser(JSON.parse(u));
  }, []);

  function logout() {
    localStorage.removeItem('estofaria_token');
    localStorage.removeItem('estofaria_user');
    navigate('/admin/login');
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f0ebe5' }}>
      {/* ── sidebar ── */}
      <aside style={{
        width: 230,
        background: 'var(--clr-dark)',
        color: '#fff',
        display:'flex', flexDirection:'column',
        position:'fixed', top:0, left: sidebarOpen ? 0 : -230,
        height:'100%', zIndex: 50,
        transition:'left .3s ease',
        boxShadow:'4px 0 20px rgba(0,0,0,.25)'
      }}>
        {/* logo */}
        <div style={{ padding:'24px 20px', borderBottom:'1px solid rgba(255,255,255,.1)' }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700 }}>
            <span style={{ color:'var(--clr-accent)' }}>Est</span>ofaria
          </span>
          <button onClick={() => setSidebarOpen(false)} style={{
            float:'right', background:'none', border:'none', color:'#fff', fontSize:18, cursor:'pointer'
          }}>✕</button>
        </div>

        {/* nav links */}
        <nav style={{ flex:1, padding:'12px 0' }}>
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to==='/admin'} style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:12,
              padding:'11px 20px',
              color: isActive ? '#fff' : 'rgba(255,255,255,.6)',
              background: isActive ? 'rgba(181,112,92,.25)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--clr-accent)' : '3px solid transparent',
              fontSize: 14, fontWeight: isActive ? 600 : 400,
              transition:'all .2s', textDecoration:'none'
            })}>
              <span style={{ fontSize:16 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* usuário + logout */}
        <div style={{ padding:'16px 20px', borderTop:'1px solid rgba(255,255,255,.1)' }}>
          <p style={{ fontSize:13, color:'rgba(255,255,255,.5)', marginBottom:8 }}>
            {user?.name || 'Admin'}
          </p>
          <button onClick={logout} style={{
            color:'var(--clr-accent)', fontSize:13, fontWeight:600,
            background:'none', border:'none', cursor:'pointer', padding:0
          }}>Sair</button>
        </div>
      </aside>

      {/* ── conteúdo principal ── */}
      <div style={{ flex:1, marginLeft: 0 }}>
        {/* topbar mobile */}
        <header style={{
          background:'var(--clr-dark)', padding:'12px 20px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          position:'sticky', top:0, zIndex:40
        }}>
          <button onClick={() => setSidebarOpen(true)} style={{
            background:'none', border:'none', cursor:'pointer',
            display:'flex', flexDirection:'column', gap:4
          }}>
            <span style={{ width:22, height:2, background:'#fff', borderRadius:2 }} />
            <span style={{ width:22, height:2, background:'#fff', borderRadius:2 }} />
            <span style={{ width:22, height:2, background:'#fff', borderRadius:2 }} />
          </button>
          <span style={{ color:'#fff', fontFamily:'var(--font-display)', fontWeight:600, fontSize:16 }}>
            <span style={{ color:'var(--clr-accent)' }}>Est</span>ofaria – Admin
          </span>
          <button onClick={logout} style={{
            color:'var(--clr-accent)', fontSize:13, fontWeight:600,
            background:'none', border:'none', cursor:'pointer'
          }}>Sair</button>
        </header>

        {/* outlet */}
        <main style={{ padding: 24, maxWidth: 1000, margin:'0 auto' }}>
          <Outlet />
        </main>
      </div>

      {/* overlay quando sidebar aberto (mobile) */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.4)', zIndex:40
        }} />
      )}
    </div>
  );
}
