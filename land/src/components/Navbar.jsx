import React, { useEffect } from 'react';
import logo from '../assets/logotemp.jpg';
import { setupMobileMenu } from '../utils/customScripts';

const Navbar = ({ openModal }) => {
  useEffect(() => {
    setupMobileMenu();
  }, []);

  return (
    <nav className="navbar">  
      <div className="container nav-container">
        <div className="logo">
          <a href=""><img src={logo} alt="Logo" className="logo-img" /></a>
          <span>Green Trail</span>
        </div>
        <div className="menu-toggle">
          <i className="fas fa-bars"></i>
        </div>
        <ul className="nav-links">
          <li><a href="#"><i className="fas fa-home"></i> Home</a></li>
          <li><a href="#"><i className="fas fa-map-marked-alt"></i> Trilhas</a></li>
          <li><a href="#"><i className="fas fa-envelope"></i> Contato</a></li>
          <li><a href="#"><i className="fas fa-info-circle"></i> Sobre</a></li>
        </ul>
        <div className="auth-buttons">
          <button className="btn btn-login" onClick={() => openModal('login')}>
            <i className="fas fa-sign-in-alt"></i> Login
          </button>
          <button className="btn" onClick={() => openModal('register')}>
            <i className="fas fa-user-plus"></i> Cadastre-se
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
