/* ============================================================
   components/Navbar.js  —  barra de navegação pública
   ============================================================ */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const styles = {
  nav: {
    position:   'sticky',
    top:        0,
    zIndex:     100,
    background: 'rgba(26,26,46,.95)',
    backdropFilter: 'blur(8px)',
    padding:    '0 24px',
    height:     64,
    display:    'flex',
    alignItems: 'center',
    justifyContent:'space-between'
  },
  logo: {
    fontFamily: "var(--font-display)",
    fontSize:   22,
    fontWeight: 700,
    color:      '#fff',
    letterSpacing: '-.5px'
  },
  logoAccent: { color: 'var(--clr-accent)' },
  links: {
    display:    'flex',
    gap:        28,
    listStyle:  'none',
    alignItems: 'center'
  },
  link: {
    color:      'rgba(255,255,255,.8)',
    fontSize:   14,
    fontWeight: 500,
    letterSpacing: '.5px',
    textTransform: 'uppercase',
    transition: 'color .2s'
  },
  linkActive: { color: 'var(--clr-accent)' },
  btnAdmin: {
    background: 'var(--clr-accent)',
    color:      '#fff',
    padding:    '8px 18px',
    borderRadius: 6,
    fontSize:   13,
    fontWeight: 600,
    transition: 'background .2s'
  },

  /* hamburger (mobile) */
  hamburger: {
    display: 'none',
    flexDirection:'column',
    gap:     5,
    padding: 6
  },
  bar: {
    width:  24,
    height: 2,
    background:'#fff',
    borderRadius: 2,
    transition: 'transform .3s'
  },

  /* mobile drawer */
  drawer: {
    position:'fixed', top:0, left:0, width:'100%', height:'100%',
    background:'var(--clr-dark)',
    zIndex: 200,
    display:'flex', flexDirection:'column',
    alignItems:'center', justifyContent:'center',
    gap: 28,
    transform: 'translateX(100%)',
    transition: 'transform .35s ease'
  },
  drawerOpen: { transform: 'translateX(0)' },
  drawerLink: {
    color:'#fff', fontSize:22, fontFamily:'var(--font-display)', fontWeight:600
  },
  closeBtn: {
    position:'absolute', top:20, right:24,
    color:'#fff', fontSize:28, background:'none', border:'none',
    cursor:'pointer', fontFamily:'sans-serif'
  }
};

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoAccent}>Est</span>ofaria
        </Link>

        {/* links desktop */}
        <ul style={styles.links} className="desktop-links">
          <li><Link to="/" style={styles.link}>Início</Link></li>
          <li><Link to="/galeria" style={styles.link}>Galeria</Link></li>
          <li><Link to="/admin/login" style={styles.btnAdmin}>Painel</Link></li>
        </ul>

        {/* hamburger mobile */}
        <button style={styles.hamburger} className="hamburger-btn" onClick={() => setOpen(true)} aria-label="Menu">
          <span style={styles.bar} />
          <span style={styles.bar} />
          <span style={styles.bar} />
        </button>
      </nav>

      {/* drawer mobile */}
      <div style={{ ...styles.drawer, ...(open ? styles.drawerOpen : {}) }}>
        <button style={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
        <Link to="/"        style={styles.drawerLink} onClick={() => setOpen(false)}>Início</Link>
        <Link to="/galeria" style={styles.drawerLink} onClick={() => setOpen(false)}>Galeria</Link>
        <Link to="/admin/login" style={{ ...styles.drawerLink, color:'var(--clr-accent)' }} onClick={() => setOpen(false)}>Painel Admin</Link>
      </div>

      {/* CSS mobile via style tag */}
      <style>{`
        @media (max-width: 640px) {
          .desktop-links { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
