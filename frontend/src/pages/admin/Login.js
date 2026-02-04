/* ============================================================
   pages/admin/Login.js
   — se não há usuário no banco → mostra formulário de registro
   — se já existe → formulário de login
   ============================================================ */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';

export default function AdminLogin() {
  const navigate          = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm]   = useState({ email:'', password:'', name:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* se já logado → redireciona */
  useEffect(() => {
    if (localStorage.getItem('estofaria_token')) navigate('/admin');
  }, [navigate]);

  /* tenta registrar primeiro para saber se é primeiro uso */
  useEffect(() => {
    // tenta buscar /auth/me sem token — se 401 significa que não há token mas pode haver user
    // melhor: tentamos register com body vazio para ver se já existe user
    // na verdade vamos usar uma chamada GET /auth/me sem token e ver se retorna 403 (já existe)
    // Simplificação: sempre mostra login; se login falhar por "não existe", mostra registro
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await authAPI.register(form);
        setIsRegister(false);
        setError('');
        alert('Usuário criado! Agora faça login.');
      } else {
        const res = await authAPI.login({ email: form.email, password: form.password });
        localStorage.setItem('estofaria_token', res.data.token);
        localStorage.setItem('estofaria_user',  JSON.stringify(res.data.user));

        // registra Service Worker para notificações
        const { registerSW } = await import('../../services/swRegister');
        registerSW(res.data.token);

        navigate('/admin');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro';

      // se tentou login e não existe usuário → sugere registro
      if (msg.includes('incorretos') || msg.includes('não encontrado')) {
        setError(msg + ' — ou crie uma conta abaixo.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg, #1a1a2e, #16213e)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding: 24
    }}>
      <div style={{
        background:'#fff', borderRadius:16, boxShadow:'0 8px 40px rgba(0,0,0,.25)',
        padding:'48px 36px', width:'100%', maxWidth:400
      }}>
        {/* logo */}
        <h1 style={{ fontFamily:'var(--font-display)', textAlign:'center', fontSize:28, marginBottom:4 }}>
          <span style={{ color:'var(--clr-accent)' }}>Est</span>ofaria
        </h1>
        <p style={{ textAlign:'center', color:'var(--clr-text-soft)', fontSize:14, marginBottom:28 }}>
          {isRegister ? 'Crie sua conta' : 'Painel Administrativo'}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'var(--clr-text)', display:'block', marginBottom:4 }}>Nome</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Seu nome" required />
            </div>
          )}
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, fontWeight:600, color:'var(--clr-text)', display:'block', marginBottom:4 }}>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@exemplo.com" required />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:13, fontWeight:600, color:'var(--clr-text)', display:'block', marginBottom:4 }}>Senha</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop:8 }}>
            {loading ? 'Aguarde…' : isRegister ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--clr-text-soft)' }}>
          {isRegister
            ? <><span style={{ cursor:'pointer', color:'var(--clr-accent)', fontWeight:600 }} onClick={() => setIsRegister(false)}>← Voltar ao login</span></>
            : <><span style={{ cursor:'pointer', color:'var(--clr-accent)', fontWeight:600 }} onClick={() => setIsRegister(true)}>Criar conta (primeiro uso)</span></>
          }
        </p>
      </div>
    </div>
  );
}
