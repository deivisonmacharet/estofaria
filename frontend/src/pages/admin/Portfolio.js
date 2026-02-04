/* ============================================================
   pages/admin/Portfolio.js  —  gerenciar trabalhos do portfolio
   ============================================================ */
import React, { useState, useEffect, useRef } from 'react';
import { portfolioAPI } from '../../services/api';

const CATS = [
  { id:1, slug:'sofas',             label:'Sofás' },
  { id:2, slug:'poltronas',         label:'Poltronas' },
  { id:3, slug:'cadeiras',          label:'Cadeiras' },
  { id:4, slug:'automotivo',        label:'Estofamento Automotivo' },
  { id:5, slug:'impermeabilizacao', label:'Impermeabilização' },
];

export default function AdminPortfolio() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm]     = useState({ title:'', description:'', category_id:1 });
  const [imgPreview, setImgPreview] = useState(null);
  const [msg, setMsg]       = useState('');
  const fileRef             = useRef();

  const load = () => {
    portfolioAPI.getAll().then(r => setItems(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  function resetForm() {
    setForm({ title:'', description:'', category_id:1 });
    setImgPreview(null);
    setEditId(null);
    setShowForm(false);
  }

  async function handleSave() {
    setMsg('');
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('category_id', form.category_id);
    if (fileRef.current.files[0]) fd.append('image', fileRef.current.files[0]);

    try {
      if (editId) {
        await portfolioAPI.update(editId, fd);
        setMsg('Atualizado com sucesso!');
      } else {
        await portfolioAPI.create(fd);
        setMsg('Criado com sucesso!');
      }
      resetForm();
      load();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Erro');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remover este item?')) return;
    await portfolioAPI.remove(id);
    load();
  }

  function startEdit(item) {
    setForm({ title: item.title, description: item.description || '', category_id: item.category_id });
    setImgPreview(item.image_url);
    setEditId(item.id);
    setShowForm(true);
  }

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:26 }}>Portfolio</h1>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>+ Adicionar</button>
      </div>

      {/* formulário */}
      {showForm && (
        <div className="card" style={{ padding:24, marginBottom:24 }}>
          <h3 style={{ marginBottom:16 }}>{editId ? 'Editar Item' : 'Novo Item'}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:14 }}>
            <div>
              <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:4 }}>Título</label>
              <input value={form.title} onChange={e => setForm(f=>({...f, title:e.target.value}))} placeholder="Título do trabalho" required />
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:4 }}>Categoria</label>
              <select value={form.category_id} onChange={e => setForm(f=>({...f, category_id:Number(e.target.value)}))}>
                {CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop:14 }}>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:4 }}>Descrição</label>
            <textarea value={form.description} onChange={e => setForm(f=>({...f, description:e.target.value}))} placeholder="Descreva o trabalho…" />
          </div>
          <div style={{ marginTop:14 }}>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:4 }}>Imagem</label>
            <input type="file" ref={fileRef} accept="image/*" onChange={e => {
              const f = e.target.files[0];
              if (f) setImgPreview(URL.createObjectURL(f));
            }} />
            {imgPreview && <img src={imgPreview} alt="preview" style={{ marginTop:10, width:120, height:90, objectFit:'cover', borderRadius:8 }} />}
          </div>
          {msg && <div className={`alert ${msg.includes('sucesso') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <div style={{ marginTop:18, display:'flex', gap:10 }}>
            <button className="btn btn-primary btn-sm" onClick={handleSave}>Salvar</button>
            <button className="btn btn-outline btn-sm" onClick={resetForm}>Cancelar</button>
          </div>
        </div>
      )}

      {/* lista */}
      <div className="grid-2">
        {items.map(item => (
          <div key={item.id} className="card">
            <img src={item.image_url} alt={item.title} style={{ width:'100%', height:180, objectFit:'cover' }} />
            <div className="card-body">
              <span className="badge" style={{ background:'rgba(181,112,92,.12)', color:'var(--clr-accent)' }}>{item.category_name}</span>
              <h3 style={{ marginTop:6 }}>{item.title}</h3>
              {item.description && <p style={{ fontSize:13, marginTop:4 }}>{item.description}</p>}
              <div style={{ marginTop:14, display:'flex', gap:8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => startEdit(item)}>Editar</button>
                <button className="btn btn-sm" style={{ color:'var(--clr-danger)', border:'1px solid var(--clr-danger)', borderRadius:6 }} onClick={() => handleDelete(item.id)}>Remover</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && <p style={{ color:'var(--clr-text-soft)', marginTop:20 }}>Nenhum item no portfolio ainda.</p>}
    </div>
  );
}
