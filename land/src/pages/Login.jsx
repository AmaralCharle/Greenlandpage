import React, { useState } from 'react';
import './Cadastro.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [sucesso, setSucesso] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSucesso(true);
  };

  return (
    <div className="cadastro-container">
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
      {sucesso && <p className="cadastro-sucesso">Login realizado com sucesso!</p>}
    </div>
  );
};

export default Login;
