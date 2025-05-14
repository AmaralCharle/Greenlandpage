import React from 'react';

const Modal = ({ type, closeModal }) => {
  const isLogin = type === 'login';

  return (
    <div id={type + 'Modal'} className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <span className="close-modal" onClick={() => closeModal(type)}>&times;</span>
        <h2><i className={`fas ${isLogin ? 'fa-sign-in-alt' : 'fa-user-plus'}`}></i> {isLogin ? 'Login' : 'Cadastre-se'}</h2>
        <form>
          {isLogin ? (
            <>
              <div className="form-group">
                <label htmlFor="loginEmail">E-mail</label>
                <input type="email" id="loginEmail" required />
              </div>
              <div className="form-group">
                <label htmlFor="loginPassword">Senha</label>
                <input type="password" id="loginPassword" required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn">Entrar</button>
                <a href="#">Esqueci minha senha</a>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="regName">Nome Completo</label>
                <input type="text" id="regName" required />
              </div>
              <div className="form-group">
                <label htmlFor="regEmail">E-mail</label>
                <input type="email" id="regEmail" required />
              </div>
              <div className="form-group">
                <label htmlFor="regPassword">Senha</label>
                <input type="password" id="regPassword" required />
              </div>
              <div className="form-group">
                <label htmlFor="regConfirmPassword">Confirme sua Senha</label>
                <input type="password" id="regConfirmPassword" required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn">Cadastrar</button>
              </div>
            </>
          )}
        </form>
        <div className="form-switch">
          {isLogin ? (
            <>Não tem uma conta? <a onClick={() => closeModal('login') || setTimeout(() => closeModal('register'), 0)}>Cadastre-se</a></>
          ) : (
            <>Já tem uma conta? <a onClick={() => closeModal('register') || setTimeout(() => closeModal('login'), 0)}>Faça login</a></>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
