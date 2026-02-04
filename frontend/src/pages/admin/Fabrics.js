/* ============================================================
   pages/admin/Fabrics.js  —  gerenciar biblioteca de tecidos
   ============================================================ */
import React, { useState, useEffect, useRef } from 'react';
import { fabricAPI } from '../../services/api';

export default function AdminFabrics() {
  const [fabrics, setFabrics] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ name:'', color:'' });
  const [preview, setPreview] = useState(null);
  const [msg, setMsg]         = useState('');
  const fileRef               = useRef();

  const load = () => fabricAPI.getAll().then(r => setFabrics(r.data)).catch(console.error);
  useEffect(load, []);

  function resetForm() {
    setForm({ name:'', color:'' });
    setPreview(null);
    setShowForm(false);
    setMsg('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSave() {
    setMsg('');
    if (!form.name || !fileRef.current?.files[0]) {
      setMsg('Nome e imagem são obrigatórios.');
      return;
    }
    const fd = new FormData();
    fd.append('name',  form.name);
    fd.append('color', form.color);
    fd.append('image', fileRef.current.files[0]);

    try {
      await fabricAPI.create(fd);
      setMsg('Tecido adicionado!');
      resetForm();
      load();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Erro');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remover este tecido?')) return;
    await fabricAPI.remove(id);
    load();
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:26 }}>Biblioteca de Tecidos</h1>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>+ Adicionar Tecido</button>
      </div>
      <p style={{ color:'var(--clr-text-soft)', fontSize:14, marginBottom:20 }}>
        Tecidos cadastrados aqui aparecerão como opções no simulador.
      </p>

      {/* formulário */}
      {showForm && (
        <div className="card" style={{ padding:20, marginBottom:24 }}>
          <h3 style={{ marginBottom:12 }}>Novo Tecido</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:12 }}>
            <div>
              <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:3 }}>Nome</label>
              <input value={form.name} onChange={e => setForm(f=>({...f, name:e.target.value}))} placeholder="ex: Veludo Cinza" />
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:3 }}>Cor</label>
              <input value={form.color} onChange={e => setForm(f=>({...f, color:e.target.value}))} placeholder="ex: Cinza Escuro" />
            </div>
          </div>
          <div style={{ marginTop:12 }}>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:3 }}>Foto do Tecido</label>
            <input type="file" ref={fileRef} accept="image/*" onChange={e => {
              const f = e.target.files[0];
              if (f) setPreview(URL.createObjectURL(f));
            }} />
            {preview && <img src={preview} alt="preview" style={{ marginTop:8, width:100, height:80, objectFit:'cover', borderRadius:8 }} />}
          </div>
          {msg && <div className={`alert ${msg.includes('adicionado') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <div style={{ marginTop:14, display:'flex', gap:10 }}>
            <button className="btn btn-primary btn-sm" onClick={handleSave}>Salvar</button>
            <button className="btn btn-outline btn-sm" onClick={resetForm}>Cancelar</button>
          </div>
        </div>
      )}

      {/* grid de tecidos */}
      <div className="grid-3">
        {fabrics.map(fab => (
          <div key={fab.id} className="card">
            <img src={fab.image_url} alt={fab.name} style={{ width:'100%', height:150, objectFit:'cover' }} />
            <div className="card-body">
              <h3 style={{ fontSize:16 }}>{fab.name}</h3>
              {fab.color && <p style={{ fontSize:13, color:'var(--clr-text-soft)', marginTop:2 }}>Cor: {fab.color}</p>}
              <button
                className="btn btn-sm"
                style={{ marginTop:10, color:'var(--clr-danger)', border:'1px solid var(--clr-danger)', borderRadius:6 }}
                onClick={() => handleDelete(fab.id)}
              >Remover</button>
            </div>
          </div>
        ))}
      </div>

      {fabrics.length === 0 && <p style={{ color:'var(--clr-text-soft)', marginTop:16 }}>Nenhum tecido cadastrado ainda.</p>}
    </div>
  );
}
