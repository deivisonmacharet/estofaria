/* ============================================================
   pages/admin/Dashboard.js  —  painel principal do admin
   ============================================================ */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { portfolioAPI, appointmentAPI } from '../../services/api';

export default function AdminDashboard() {
  const [totalPortfolio, setTotalPortfolio]       = useState(0);
  const [todayApts, setTodayApts]                 = useState([]);
  const [loading, setLoading]                     = useState(true);

  useEffect(() => {
    Promise.all([
      portfolioAPI.getAll(),
      appointmentAPI.getToday()
    ]).then(([p, a]) => {
      setTotalPortfolio(p.data.length);
      setTodayApts(a.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const cards = [
    { label:'Trabalhos no Portfolio', value: totalPortfolio, color:'var(--clr-accent)',  link:'/admin/portfolio' },
    { label:'Agendamentos Hoje',      value: todayApts.length, color:'var(--clr-dark)',   link:'/admin/agenda' },
    { label:'Simulações Geradas',     value: '—',            color:'#5a7a9a',            link:'/admin/simulador' },
  ];

  return (
    <div>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:4 }}>Dashboard</h1>
      <p style={{ color:'var(--clr-text-soft)', fontSize:14, marginBottom:24 }}>Bem-vindo ao painel da estofaria.</p>

      {/* ── cards resumo ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:16, marginBottom:32 }}>
        {cards.map((c, i) => (
          <Link key={i} to={c.link} style={{ textDecoration:'none' }}>
            <div className="card" style={{ padding:22 }}>
              <p style={{ fontSize:13, color:'var(--clr-text-soft)', marginBottom:6 }}>{c.label}</p>
              <p style={{ fontSize:32, fontWeight:700, fontFamily:'var(--font-display)', color: c.color }}>{c.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── agendamentos de hoje ── */}
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, marginBottom:12 }}>Hoje na Agenda</h2>
      {todayApts.length === 0 ? (
        <div className="card" style={{ padding:24 }}>
          <p style={{ color:'var(--clr-text-soft)' }}>Nenhum agendamento para hoje.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {todayApts.map(apt => {
            const hora = new Date(apt.scheduled_at).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
            return (
              <div key={apt.id} className="card" style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px' }}>
                <div style={{
                  width:48, height:48, borderRadius:'50%',
                  background:'var(--clr-accent)', color:'#fff',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontWeight:700, fontSize:15, flexShrink:0
                }}>{hora}</div>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:600, color:'var(--clr-text)', fontSize:15 }}>{apt.client_name}</p>
                  <p style={{ fontSize:13, color:'var(--clr-text-soft)' }}>
                    {apt.category_name || 'Sem categoria'}{apt.client_phone ? ` · ${apt.client_phone}` : ''}
                  </p>
                  {apt.notes && <p style={{ fontSize:12, color:'var(--clr-text-soft)', marginTop:2 }}>📝 {apt.notes}</p>}
                </div>
                <span className={`badge badge-${apt.status}`}>{apt.status}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── atalhos rápidos ── */}
      <div style={{ marginTop:36, display:'flex', gap:12, flexWrap:'wrap' }}>
        <Link to="/admin/portfolio" className="btn btn-outline btn-sm">+ Novo Trabalho</Link>
        <Link to="/admin/agenda"    className="btn btn-outline btn-sm">+ Novo Agendamento</Link>
        <Link to="/admin/simulador" className="btn btn-outline btn-sm">🎨 Simular Tecido</Link>
      </div>
    </div>
  );
}
