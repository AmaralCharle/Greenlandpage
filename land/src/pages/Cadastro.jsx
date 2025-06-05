import React, { useState } from 'react';
import './Cadastro.css';

const Cadastro = () => {
  const [form, setForm] = useState({ nome: '', cpf: '', email: '', telefone: '', senha: '' });
  const [sucesso, setSucesso] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://painful.aksaraymalaklisi.net/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.email, // ou outro campo, se quiser username separado
          email: form.email,
          password: form.senha,
          name: form.nome,
          phone: form.telefone,
          cpf: form.cpf // agora pega do campo do formulário
        })
      });
      if (response.ok) {
        setSucesso(true);
      } else {
        setSucesso(false);
        alert('Erro ao cadastrar. Verifique os dados.');
      }
    } catch (err) {
      setSucesso(false);
      alert('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="cadastro-container">
      <h2>Cadastro</h2>
      <form className="cadastro-form" onSubmit={handleSubmit}>
        <label htmlFor="nome">Nome Completo</label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          required
        />
        <label htmlFor="cpf">CPF (opcional)</label>
        <input
          type="text"
          id="cpf"
          name="cpf"
          value={form.cpf}
          onChange={handleChange}
          placeholder="000.000.000-00"
        />
        <label htmlFor="email">E-mail</label>
        <input
          type="email"
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <label htmlFor="telefone">Telefone</label>
        <input
          type="tel"
          id="telefone"
          name="telefone"
          value={form.telefone}
          onChange={handleChange}
          required
          pattern="[0-9]{10,11}"
          placeholder="(99) 99999-9999"
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
          placeholder="Digite uma senha"
        />
        <button type="submit">Cadastrar</button>
      </form>
      {sucesso && <p className="cadastro-sucesso">Cadastro realizado com sucesso!</p>}
    </div>
  );
};

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

export default Cadastro;
export { Login };
