/* ============================================================
   pages/Home.js  —  página principal (landing page)
   ============================================================ */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar         from '../components/Navbar';
import WhatsAppButton from '../components/WhatsAppButton';
import { portfolioAPI } from '../services/api';

const SERVICES = [
  { slug:'sofas',            icon:'🛋️',  title:'Sofás',            desc:'Reforma completa e fabricação sob medida de sofás de todos os estilos.' },
  { slug:'poltronas',        icon:'🪑',  title:'Poltronas',        desc:'Restauração e fabricação de poltronas com acabamento impecável.' },
  { slug:'cadeiras',         icon:'🪑',  title:'Cadeiras',         desc:'Cadeiras de escritório, sala e sala de jantar — nova vida com novo tecido.' },
  { slug:'automotivo',       icon:'🚗',  title:'Estofamento Auto', desc:'Reforma interna de carros, bancos e painéis com materiais premium.' },
  { slug:'impermeabilizacao',icon:'💧',  title:'Impermeabilização',desc:'Tratamento profissional que protege seus estofados por anos.' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);

  // useEffect(() => {
  //   portfolioAPI.getAll().then(r => setFeatured(r.data.slice(0, 6))).catch(() => {});
  // }, []);

  useEffect(() => {
    portfolioAPI.getAll()
      .then(r => {
        const data = r.data?.data ?? r.data ?? [];
        setFeatured(Array.isArray(data) ? data.slice(0, 6) : []);
      })
      .catch(() => setFeatured([]));
  }, []);


  return (
    <div>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        minHeight: '90vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
        display:'flex', alignItems:'center', justifyContent:'center',
        position:'relative', overflow:'hidden'
      }}>
        {/* decoração */}
        <div style={{
          position:'absolute', width:400, height:400,
          borderRadius:'50%', background:'radial-gradient(circle, rgba(181,112,92,.15) 0%, transparent 70%)',
          top:-80, right:-80, pointerEvents:'none'
        }} />
        <div style={{
          position:'absolute', width:300, height:300,
          borderRadius:'50%', background:'radial-gradient(circle, rgba(181,112,92,.1) 0%, transparent 70%)',
          bottom:-60, left:-60, pointerEvents:'none'
        }} />

        <div className="container text-center" style={{ position:'relative', zIndex:1 }}>
          <p style={{ color:'var(--clr-accent)', fontSize:14, fontWeight:600, letterSpacing:3, textTransform:'uppercase', marginBottom:16 }}>
            Estofaria — Reforma &amp; Fabricação
          </p>
          <h1 style={{ color:'#fff', fontFamily:'var(--font-display)', fontSize:'clamp(2.4rem,6vw,3.8rem)', lineHeight:1.15, marginBottom:20 }}>
            Conforto e estilo<br />
            <span style={{ color:'var(--clr-accent)' }}>no mesmo lugar</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,.65)', fontSize:17, maxWidth:560, margin:'0 auto 32px' }}>
            Sofás, poltronas, cadeiras, estofamento automotivo e impermeabilização — 
            feitos com cuidado e qualidade que dura.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/galeria" className="btn btn-primary" style={{ fontSize:16, padding:'14px 34px' }}>Ver Trabalhos</Link>
            <a href={`https://wa.me/5541988129831`} target="_blank" rel="noopener noreferrer"
               className="btn btn-outline" style={{ fontSize:16, padding:'14px 34px', borderColor:'rgba(255,255,255,.4)', color:'#fff' }}>
              Orçamento
            </a>
          </div>
        </div>
      </section>

      {/* ── SERVIÇOS ── */}
      <section style={{ padding:'80px 0' }}>
        <div className="container">
          <h2 className="text-center">Nossos Serviços</h2>
          <div className="divider" />
          <div className="grid-3 mt-3">
            {SERVICES.map(s => (
              <Link key={s.slug} to={`/galeria/${s.slug}`} className="card" style={{ textDecoration:'none', padding:28 }}>
                <span style={{ fontSize:36 }}>{s.icon}</span>
                <h3 style={{ marginTop:12, marginBottom:6 }}>{s.title}</h3>
                <p style={{ fontSize:14 }}>{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRABALHOS DESTAQUE ── */}
      {featured.length > 0 && (
        <section style={{ padding:'60px 0 80px', background:'var(--clr-bg-alt)' }}>
          <div className="container">
            <h2 className="text-center">Trabalhos Destaque</h2>
            <div className="divider" />
            <div className="grid-2 mt-3">
              {featured.map(item => (
                <div key={item.id} className="card">
                  <img src={item.image_url} alt={item.title} style={{ width:'100%', height:200, objectFit:'cover' }} />
                  <div className="card-body">
                    <span className="badge" style={{ background:'rgba(181,112,92,.12)', color:'var(--clr-accent)' }}>
                      {item.category_name}
                    </span>
                    <h3 style={{ marginTop:8 }}>{item.title}</h3>
                    {item.description && <p style={{ marginTop:4, fontSize:14 }}>{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-3">
              <Link to="/galeria" className="btn btn-outline">Ver todos os trabalhos</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ background:'var(--clr-dark)', color:'rgba(255,255,255,.6)', padding:'48px 0 28px' }}>
        <div className="container text-center">
          <p style={{ fontFamily:'var(--font-display)', fontSize:20, color:'#fff', fontWeight:700 }}>
            <span style={{ color:'var(--clr-accent)' }}>Est</span>ofaria
          </p>
          <p style={{ fontSize:14, marginTop:8 }}>Reforma e fabricação de estofados com qualidade e cuidado.</p>
          <p style={{ fontSize:13, marginTop:20, opacity:.5 }}>© 2026 <a href='https://deivtech.com.br' target='_blank' rel='noopener noreferrer'>DeivTech</a>. Todos os direitos reservados.</p>
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  );
}
