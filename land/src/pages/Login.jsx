import React, { useState } from 'react';
import './Cadastro.css';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Login = ({ onClose }) => {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');
  const [logado, setLogado] = useState(!!localStorage.getItem('access_token'));
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setLogado(false);
    setSucesso(false);
    setErro('');
    if (onClose) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      const response = await fetch(`${API_BASE_URL}login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.email, // Corrigido para o SimpleJWT
          password: form.senha,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        setSucesso(true);
        setErro('');
        setLogado(true);
        // Exibe mensagem de sucesso por 1 segundo antes de fechar o modal
        setTimeout(() => {
          if (onClose) onClose();
          navigate('/');
        }, 1000);
      } else {
        setSucesso(false);
        // Tenta mostrar mensagem de erro do backend
        let msg = 'Login inválido';
        try {
          const errData = await response.json();
          if (errData && errData.detail) msg = errData.detail;
        } catch (e) {
          // ignora se não for JSON
        }
        setErro(msg);
        console.error('Erro no login:', response.status, response.statusText);
      }
    } catch (err) {
      setSucesso(false);
      setErro('Erro de conexão com o servidor.');
      console.error('Erro de conexão:', err);
    }
  };

  // Se já está logado, mostra mensagem e botão de logout
  if (logado) {
    return (
      <div className="cadastro-container" style={{ position: 'relative' }}>
        <h2>Você já está conectado</h2>
        <button className="btn" style={{ marginTop: 16 }} onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="cadastro-container" style={{ position: 'relative' }}>
      <span
        style={{
          position: 'absolute',
          top: 10,
          right: 16,
          fontSize: '1.3rem',
          cursor: 'pointer',
        }}
        role="img"
        aria-label="Acessibilidade"
        title="Acessibilidade"
        tabIndex={0}
      >
        ♿
      </span>
      <h2>Login</h2>
      <form className="cadastro-form" onSubmit={handleSubmit}>
        <label htmlFor="email">E-mail</label>
        <input
          type="email"
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <label htmlFor="senha">Senha</label>
        <input
          type="password"
          id="senha"
          name="senha"
          value={form.senha}
          onChange={handleChange}
          required
          minLength={6}
          placeholder="Digite sua senha"
        />
        <button type="submit">Entrar</button>
      </form>
      {erro && (
        <p style={{ color: 'red', marginTop: '10px', fontWeight: 'bold' }}>
          {erro}
        </p>
      )}
      {sucesso && (
        <p className="cadastro-sucesso">Login realizado com sucesso!</p>
      )}
    </div>
  );
};

export default Login;