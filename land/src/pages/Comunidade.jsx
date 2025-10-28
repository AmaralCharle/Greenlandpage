import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Comunidade = () => {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    title: '',
    type: 'relato',
    message: '',
  });
  const [submitting, setSubmitting] = React.useState(false);

  const actions = [
    { id: 1, title: 'Mutirão de limpeza', text: 'Recolha de lixo e conservação de trilhas com voluntários locais.' },
    { id: 2, title: 'Oficina de educação ambiental', text: 'Palestras e atividades para escolas e visitantes.' },
    { id: 3, title: 'Plante uma árvore', text: 'Campanhas de reflorestamento de áreas degradadas.' },
  ];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Se existir um endpoint especificado, tenta enviar online
    const endpoint = API_BASE_URL ? `${API_BASE_URL}community/` : null;
    try {
      if (endpoint && API_BASE_URL.includes('http')) {
        const token = localStorage.getItem('access_token');
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(form),
        });
        if (!resp.ok) throw new Error('Erro no envio');
        alert('Relato enviado com sucesso! Obrigado por contribuir.');
      } else {
        // salva localmente como fallback
        const prev = JSON.parse(localStorage.getItem('community_submissions') || '[]');
        prev.unshift({ ...form, created_at: new Date().toISOString() });
        localStorage.setItem('community_submissions', JSON.stringify(prev));
        alert('Relato salvo localmente. Quando o backend estiver configurado, poderemos enviar online.');
      }
      setForm({ name: '', email: '', title: '', type: 'relato', message: '' });
      // opcionalmente navegar para home ou manter na página
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar. Tente novamente mais tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container comunidade-page">
      <section style={{ padding: '30px 0' }}>
        <h2 style={{ color: 'var(--verde-escuro)', marginBottom: 8 }}>Comunidade</h2>
        <div className="community-intro" style={{ marginBottom: 18 }}>
          <p className="lead" style={{ maxWidth: 780 }}>
            Espaço para relatos de moradores e guias. Envie suas experiências, sugestões ou ações que ajudam a conservar nossas trilhas.
          </p>
          <div className="community-highlights">
            <div className="highlight-box">Espaço para relatos de moradores e guias.</div>
            <div className="highlight-box">Formulário para envio de sugestões ou relatos.</div>
            <div className="highlight-box">Destaque para ações de educação ambiental.</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 420px', minWidth: 320 }}>
            <form className="comunidade-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Seu nome" />
              </div>
              <div className="form-group">
                <label>Email (opcional)</label>
                <input name="email" value={form.email} onChange={handleChange} placeholder="seu@email.com" />
              </div>
              <div className="form-group">
                <label>Título</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Breve título" required />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select name="type" value={form.type} onChange={handleChange}>
                  <option value="relato">Relato</option>
                  <option value="sugestao">Sugestão</option>
                  <option value="acao">Ação / Evento</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mensagem</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={6} placeholder="Conte sua experiência ou sugestão" required />
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button className="btn" type="submit" disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar relato'}</button>
                <button className="btn btn-outline" type="button" onClick={() => navigate(-1)}>Voltar</button>
              </div>
            </form>
          </div>
          <aside style={{ width: 320, minWidth: 260 }}>
            <div className="action-cards">
              <h3 style={{ marginBottom: 12 }}>Ações de educação ambiental</h3>
              {actions.map(a => (
                <div key={a.id} className="action-card">
                  <h4>{a.title}</h4>
                  <p>{a.text}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Comunidade;
