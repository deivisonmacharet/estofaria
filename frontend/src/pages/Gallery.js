/* ============================================================
   pages/Gallery.js  —  galeria pública com filtro por categoria
   ============================================================ */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar         from '../components/Navbar';
import WhatsAppButton from '../components/WhatsAppButton';
import { portfolioAPI } from '../services/api';

const CATS = [
  { slug: 'todos',             label: 'Todos' },
  { slug: 'sofas',             label: 'Sofás' },
  { slug: 'poltronas',         label: 'Poltronas' },
  { slug: 'cadeiras',          label: 'Cadeiras' },
  { slug: 'automotivo',        label: 'Automotivo' },
  { slug: 'impermeabilizacao', label: 'Impermeabilização' },
];

export default function Gallery() {
  const { cat }            = useParams();
  const [items, setItems]  = useState([]);
  const [loading, setLoading] = useState(true);
  const active             = cat || 'todos';

  useEffect(() => {
    setLoading(true);
    const call = active === 'todos'
      ? portfolioAPI.getAll()
      : portfolioAPI.getByCategory(active);

    call.then(r => setItems(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [active]);

  return (
    <div>
      <Navbar />

      {/* cabeçalho */}
      <section style={{
        background:'linear-gradient(135deg, #1a1a2e, #16213e)',
        padding:'56px 0 48px', textAlign:'center'
      }}>
        <h1 style={{ color:'#fff', fontFamily:'var(--font-display)' }}>Galeria de Trabalhos</h1>
        <div className="divider" style={{ background:'var(--clr-accent)' }} />
      </section>

      {/* filtros */}
      <div style={{ background:'#fff', boxShadow:'0 2px 8px rgba(0,0,0,.07)', position:'sticky', top:0, zIndex:10 }}>
        <div className="container" style={{ display:'flex', gap:8, overflowX:'auto', padding:'14px 24px' }}>
          {CATS.map(c => (
            <Link
              key={c.slug}
              to={c.slug === 'todos' ? '/galeria' : `/galeria/${c.slug}`}
              style={{
                padding:'8px 18px',
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 500,
                whiteSpace:'nowrap',
                background: active === c.slug ? 'var(--clr-accent)' : 'var(--clr-bg-alt)',
                color:      active === c.slug ? '#fff'              : 'var(--clr-text)',
                transition:'background .2s, color .2s',
                textDecoration:'none'
              }}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      {/* grid */}
      <section style={{ padding:'40px 0 80px' }}>
        <div className="container">
          {loading ? (
            <div className="spinner" />
          ) : items.length === 0 ? (
            <p className="text-center" style={{ marginTop:60, fontSize:16, color:'var(--clr-text-soft)' }}>
              Nenhum trabalho encontrado nesta categoria.
            </p>
          ) : (
            <div className="grid-2">
              {items.map(item => (
                <div key={item.id} className="card">
                  <img src={item.image_url} alt={item.title} style={{ width:'100%', height:220, objectFit:'cover' }} />
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
          )}
        </div>
      </section>

      {/* footer */}
      <footer style={{ background:'var(--clr-dark)', color:'rgba(255,255,255,.6)', padding:'40px 0 24px', textAlign:'center' }}>
        <p style={{ fontSize:13, opacity:.5 }}>© 2025 Estofaria</p>
      </footer>

      <WhatsAppButton />
    </div>
  );
}
