/* ============================================================
   pages/admin/Agenda.js  —  gerenciar agendamentos / orçamentos
   ============================================================ */
import React, { useState, useEffect } from 'react';
import { appointmentAPI } from '../../services/api';

const CATS = [
  { id:'',  label:'Todos os serviços' },
  { id:1,   label:'Sofás' },
  { id:2,   label:'Poltronas' },
  { id:3,   label:'Cadeiras' },
  { id:4,   label:'Estofamento Automotivo' },
  { id:5,   label:'Impermeabilização' },
];

const STATUS_OPTIONS = ['pendente','confirmado','concluido','cancelado'];

function formatDT(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleDateString('pt-BR', { weekday:'short', day:'numeric', month:'short' })
       + ' às ' + d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
}

export default function AdminAgenda() {
  const [apts, setApts]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState({
    client_name:'', client_phone:'', category_id:'', scheduled_at:'', notes:'', status:'pendente'
  });
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [msg, setMsg] = useState('');

  const load = (params = {}) => {
    setLoading(true);
    appointmentAPI.getAll(params)
      .then(r => setApts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const p = {};
    if (filterDate)   p.date   = filterDate;
    if (filterStatus) p.status = filterStatus;
    load(p);
  }, [filterDate, filterStatus]);

  function resetForm() {
    setForm({ client_name:'', client_phone:'', category_id:'', scheduled_at:'', notes:'', status:'pendente' });
    setEditId(null);
    setShowForm(false);
    setMsg('');
  }

  async function handleSave() {
    setMsg('');
    if (!form.client_name || !form.scheduled_at) {
      setMsg('Nome e data/hora são obrigatórios.');
      return;
    }
    try {
      if (editId) {
        await appointmentAPI.update(editId, form);
        setMsg('Atualizado!');
      } else {
        await appointmentAPI.create(form);
        setMsg('Agendamento criado!');
      }
      resetForm();
      load();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Erro');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remover este agendamento?')) return;
    await appointmentAPI.remove(id);
    load();
  }

  async function changeStatus(id, status) {
    try {
      await appointmentAPI.update(id, { status });
      load();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Erro ao alterar status');
    }
  }

  function startEdit(apt) {
    // formata scheduled_at para input datetime-local
    const d = new Date(apt.scheduled_at);
    const local = d.toISOString().slice(0,16);  // yyyy-MM-ddTHH:mm
    setForm({
      client_name:  apt.client_name,
      client_phone: apt.client_phone || '',
      category_id:  apt.category_id || '',
      scheduled_at: local,
      notes:        apt.notes || '',
      status:       apt.status
    });
    setEditId(apt.id);
    setShowForm(true);
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:26 }}>Agenda &amp; Orçamentos</h1>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>+ Novo</button>
      </div>

      {/* filtros */}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:20 }}>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width:170 }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width:160 }}>
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
        <button className="btn btn-outline btn-sm" onClick={() => { setFilterDate(''); setFilterStatus(''); }}>Limpar</button>
      </div>

      {/* formulário */}
      {showForm && (
        <div className="card" style={{ padding:24, marginBottom:24 }}>
          <h3 style={{ marginBottom:14 }}>{editId ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:12 }}>
            <div>
              <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:3 }}>Nome Cliente *</label>
              <input value={form.client_name} onChange={e => setForm(f=>({...f, client_name:e.target.value}))} placeholder="Nome" />
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:3 }}>Telefone</label>
              <input value={form.client_phone} onChange={e => setForm(f=>({...f, client_phone:e.target.value}))} placeholder="(41) 9xxxx-xxxx" />
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:3 }}>Serviço</label>
              <select value={form.category_id} onChange={e => setForm(f=>({...f, category_id:e.target.value}))}>
                {CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:3 }}>Data &amp; Hora *</label>
              <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f=>({...f, scheduled_at:e.target.value}))} />
            </div>
            {editId && (
              <div>
                <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:3 }}>Status</label>
                <select value={form.status} onChange={e => setForm(f=>({...f, status:e.target.value}))}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
            )}
          </div>
          <div style={{ marginTop:12 }}>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:3 }}>Observações</label>
            <textarea value={form.notes} onChange={e => setForm(f=>({...f, notes:e.target.value}))} placeholder="Anotações livres…" />
          </div>
          {msg && <div className={`alert ${msg.includes('criado') || msg.includes('tualiz') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <div style={{ marginTop:16, display:'flex', gap:10 }}>
            <button className="btn btn-primary btn-sm" onClick={handleSave}>Salvar</button>
            <button className="btn btn-outline btn-sm" onClick={resetForm}>Cancelar</button>
          </div>
        </div>
      )}

      {/* lista de agendamentos */}
      {loading ? <div className="spinner" /> : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {apts.length === 0 && <p style={{ color:'var(--clr-text-soft)' }}>Nenhum agendamento encontrado.</p>}
          {apts.map(apt => (
            <div key={apt.id} className="card" style={{ padding:'16px 20px' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                    <p style={{ fontWeight:700, fontSize:16, color:'var(--clr-text)' }}>{apt.client_name}</p>
                    <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                  </div>
                  <p style={{ fontSize:13, color:'var(--clr-text-soft)', marginTop:3 }}>
                    📅 {formatDT(apt.scheduled_at)}
                    {apt.category_name ? ` · ${apt.category_name}` : ''}
                    {apt.client_phone  ? ` · ${apt.client_phone}`  : ''}
                  </p>
                  {apt.notes && <p style={{ fontSize:13, color:'var(--clr-text-soft)', marginTop:4 }}>📝 {apt.notes}</p>}
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  {/* mudar status rapidamente */}
                  <select
                    value={apt.status}
                    onChange={e => changeStatus(apt.id, e.target.value)}
                    style={{ width:130, fontSize:13, padding:'6px 8px' }}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                  <button className="btn btn-outline btn-sm" onClick={() => startEdit(apt)}>✏️</button>
                  <button className="btn btn-sm" style={{ color:'var(--clr-danger)', border:'1px solid var(--clr-danger)', borderRadius:6 }} onClick={() => handleDelete(apt.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
