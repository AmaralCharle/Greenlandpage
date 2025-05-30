import React from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 2rem 2.5rem 1.5rem 2.5rem;
  box-shadow: 0 4px 32px rgba(0,0,0,0.18);
  min-width: 340px;
  max-width: 90vw;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const CloseButton = styled.span`
  position: absolute;
  top: 18px;
  right: 22px;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: #222;
  }
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #222;
  font-weight: 700;
  i {
    margin-right: 0.5rem;
    color: #007bff;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  label {
    font-size: 1rem;
    color: #444;
    margin-bottom: 0.2rem;
  }
  input {
    padding: 0.6rem 0.8rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    outline: none;
    transition: border 0.2s;
    &:focus {
      border: 1.5px solid #007bff;
    }
  }
`;

const FormActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
  .btn {
    background: #007bff;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    &:hover {
      background: #0056b3;
    }
  }
  a {
    color: #007bff;
    font-size: 0.98rem;
    text-decoration: none;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const FormSwitch = styled.div`
  text-align: center;
  margin-top: 1.2rem;
  font-size: 1rem;
  color: #444;
  a {
    color: #007bff;
    cursor: pointer;
    margin-left: 0.2rem;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const CadastroForm = ({ closeModal }) => {
  const [form, setForm] = React.useState({ nome: '', endereco: '', email: '' });
  const [sucesso, setSucesso] = React.useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSucesso(true);
  };

  return (
    <>
      <Title>Cadastro</Title>
      <form className="cadastro-form" onSubmit={handleSubmit} style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        <label htmlFor="nome">Nome Completo</label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          required
        />
        <label htmlFor="endereco">Endereço</label>
        <input
          type="text"
          id="endereco"
          name="endereco"
          value={form.endereco}
          onChange={handleChange}
          required
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
        <button type="submit" className="btn">Cadastrar</button>
      </form>
      {sucesso && <p className="cadastro-sucesso">Cadastro realizado com sucesso!</p>}
    </>
  );
};

const Modal = ({ type, closeModal }) => {
  const isLogin = type === 'login';
  const isCadastro = type === 'cadastro';

  return (
    <ModalOverlay id={type + 'Modal'}>
      <ModalContent>
        <CloseButton onClick={() => closeModal(type)}>&times;</CloseButton>
        {isLogin ? (
          <>
            <Title>
              <i className="fas fa-sign-in-alt"></i> Login
            </Title>
            <Form>
              <FormGroup>
                <label htmlFor="loginEmail">E-mail</label>
                <input type="email" id="loginEmail" required />
              </FormGroup>
              <FormGroup>
                <label htmlFor="loginPassword">Senha</label>
                <input type="password" id="loginPassword" required />
              </FormGroup>
              <FormActions>
                <button type="button" className="btn">Entrar</button>
                <a href="#">Esqueci minha senha</a>
              </FormActions>
            </Form>
            <FormSwitch>
              Não tem uma conta? <a onClick={() => closeModal('login') || setTimeout(() => closeModal('cadastro'), 0)}>Cadastre-se</a>
            </FormSwitch>
          </>
        ) : isCadastro ? (
          <CadastroForm closeModal={closeModal} />
        ) : (
          <>
            <Title>
              <i className="fas fa-user-plus"></i> Cadastre-se
            </Title>
            {/* fallback para cadastro antigo, se necessário */}
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;
