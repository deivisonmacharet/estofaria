/* ============================================================
   pages/admin/Simulator.js
   — upload foto do sofá do cliente
   — seleciona (ou faz upload) do tecido
   — envia para o backend que usa OpenAI para gerar a simulação
   ============================================================ */
import React, { useState, useEffect, useRef } from 'react';
import { simulationAPI, fabricAPI } from '../../services/api';

export default function AdminSimulator() {
  const [fabrics, setFabrics]       = useState([]);
  const [sofaPreview, setSofaPreview]   = useState(null);
  const [fabricPreview, setFabricPreview] = useState(null);
  const [selectedFabricId, setSelectedFabricId] = useState(null);
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [msg, setMsg]               = useState('');
  const [history, setHistory]       = useState([]);

  const sofaFileRef   = useRef();
  const fabricFileRef = useRef();

  useEffect(() => {
    fabricAPI.getAll().then(r => setFabrics(r.data)).catch(console.error);
    simulationAPI.getAll().then(r => setHistory(r.data)).catch(console.error);
  }, []);

  function selectFabric(fab) {
    setSelectedFabricId(fab.id);
    setFabricPreview(fab.image_url);
    // limpa arquivo manual se houver
    if (fabricFileRef.current) fabricFileRef.current.value = '';
  }

  async function generate() {
    setMsg('');
    setResult(null);

    if (!sofaFileRef.current?.files[0]) {
      setMsg('Envie a foto do sofá primeiro.');
      return;
    }
    if (!fabricPreview && !fabricFileRef.current?.files[0]) {
      setMsg('Selecione ou envie uma foto do tecido.');
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append('sofa',   sofaFileRef.current.files[0]);

    // se o usuário escolheu um tecido da biblioteca usa a URL, mas o backend precisa do arquivo
    // então se não há arquivo manual, buscamos a imagem da biblioteca via fetch e adicionamos
    if (fabricFileRef.current?.files[0]) {
      fd.append('fabric', fabricFileRef.current.files[0]);
    } else if (selectedFabricId) {
      // busca a imagem do tecido da biblioteca
      const fab = fabrics.find(f => f.id === selectedFabricId);
      if (fab) {
        try {
          const resp = await fetch(fab.image_url);
          const blob = await resp.blob();
          fd.append('fabric', blob, 'fabric.jpg');
          fd.append('fabric_id', selectedFabricId);
        } catch {
          setMsg('Erro ao carregar imagem do tecido.');
          setLoading(false);
          return;
        }
      }
    }

    try {
      const res = await simulationAPI.generate(fd);
      setResult(res.data);
      // atualiza histórico
      simulationAPI.getAll().then(r => setHistory(r.data)).catch(() => {});
    } catch (err) {
      setMsg(err.response?.data?.error || 'Erro ao gerar simulação');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSofaPreview(null);
    setFabricPreview(null);
    setSelectedFabricId(null);
    setResult(null);
    setMsg('');
    if (sofaFileRef.current)   sofaFileRef.current.value   = '';
    if (fabricFileRef.current) fabricFileRef.current.value  = '';
  }

  return (
    <div>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:4 }}>Simulador de Tecido</h1>
      <p style={{ color:'var(--clr-text-soft)', fontSize:14, marginBottom:24 }}>
        Envie a foto do sofá e escolha o tecido — a IA gera como ficará após a reforma.
      </p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20 }}>
        {/* ── coluna 1: foto do sofá ── */}
        <div className="card" style={{ padding:20 }}>
          <h3 style={{ marginBottom:12 }}>📸 Foto do Sofá</h3>
          <input type="file" ref={sofaFileRef} accept="image/*" onChange={e => {
            const f = e.target.files[0];
            if (f) setSofaPreview(URL.createObjectURL(f));
          }} />
          {sofaPreview && (
            <div style={{ marginTop:12 }}>
              <img src={sofaPreview} alt="sofá" style={{ width:'100%', height:180, objectFit:'cover', borderRadius:8 }} />
            </div>
          )}
        </div>

        {/* ── coluna 2: tecido ── */}
        <div className="card" style={{ padding:20 }}>
          <h3 style={{ marginBottom:12 }}>🧵 Escolha o Tecido</h3>

          {/* biblioteca de tecidos */}
          {fabrics.length > 0 && (
            <>
              <p style={{ fontSize:13, color:'var(--clr-text-soft)', marginBottom:8 }}>Da biblioteca:</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
                {fabrics.map(fab => (
                  <div
                    key={fab.id}
                    onClick={() => selectFabric(fab)}
                    style={{
                      width:70, height:70, borderRadius:8, overflow:'hidden',
                      border: selectedFabricId === fab.id ? '3px solid var(--clr-accent)' : '2px solid var(--clr-border)',
                      cursor:'pointer', transition:'border .2s'
                    }}
                  >
                    <img src={fab.image_url} alt={fab.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </div>
                ))}
              </div>
            </>
          )}

          <p style={{ fontSize:13, color:'var(--clr-text-soft)', marginBottom:6 }}>Ou envie uma foto do tecido:</p>
          <input type="file" ref={fabricFileRef} accept="image/*" onChange={e => {
            const f = e.target.files[0];
            if (f) { setFabricPreview(URL.createObjectURL(f)); setSelectedFabricId(null); }
          }} />
          {fabricPreview && !selectedFabricId && (
            <img src={fabricPreview} alt="tecido" style={{ marginTop:10, width:100, height:80, objectFit:'cover', borderRadius:8 }} />
          )}
        </div>
      </div>

      {/* ── botão gerar ── */}
      <div style={{ marginTop:24, display:'flex', gap:12 }}>
        <button className="btn btn-primary" onClick={generate} disabled={loading} style={{ minWidth:180 }}>
          {loading ? '⏳ Gerando…' : '✨ Gerar Simulação'}
        </button>
        <button className="btn btn-outline btn-sm" onClick={reset}>Limpar</button>
      </div>

      {msg && <div className={`alert ${msg.includes('Erro') ? 'alert-error' : 'alert-success'}`} style={{ marginTop:12 }}>{msg}</div>}

      {/* ── resultado ── */}
      {result && (
        <div className="card" style={{ marginTop:28, padding:24 }}>
          <h3 style={{ marginBottom:8 }}>✅ Resultado da Simulação</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:16 }}>
            <div>
              <p style={{ fontSize:13, color:'var(--clr-text-soft)', marginBottom:6 }}>Sofá original</p>
              <img src={result.sofa_url} alt="original" style={{ width:'100%', height:180, objectFit:'cover', borderRadius:8 }} />
            </div>
            <div>
              <p style={{ fontSize:13, color:'var(--clr-text-soft)', marginBottom:6 }}>Tecido escolhido</p>
              <img src={result.fabric_url} alt="tecido" style={{ width:'100%', height:180, objectFit:'cover', borderRadius:8 }} />
            </div>
            <div>
              <p style={{ fontSize:13, color:'var(--clr-text-soft)', marginBottom:6 }}>🎨 Simulação gerada</p>
              <img src={result.result_url} alt="simulado" style={{ width:'100%', height:180, objectFit:'cover', borderRadius:8, border:'2px solid var(--clr-accent)' }} />
            </div>
          </div>
          {result.description && (
            <div style={{ marginTop:16, padding:14, background:'var(--clr-bg-alt)', borderRadius:8 }}>
              <p style={{ fontSize:13 }}><strong>Descrição gerada pela IA:</strong></p>
              <p style={{ fontSize:14, marginTop:4 }}>{result.description}</p>
            </div>
          )}
        </div>
      )}

      {/* ── histórico ── */}
      {history.length > 0 && (
        <div style={{ marginTop:40 }}>
          <h3 style={{ marginBottom:12 }}>📋 Histórico de Simulações</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {history.map(sim => (
              <div key={sim.id} className="card" style={{ padding:16, display:'flex', gap:14, alignItems:'center' }}>
                <img src={sim.sofa_image_url} alt="sofá" style={{ width:64, height:64, objectFit:'cover', borderRadius:6 }} />
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, color:'var(--clr-text-soft)' }}>
                    Simulação #{sim.id} · {new Date(sim.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {sim.result_url && (
                  <a href={sim.result_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">Ver imagem</a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
