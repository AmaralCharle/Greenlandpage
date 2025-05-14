import React, { useEffect } from 'react';
import logo from '../assets/logotemp.jpg';
import { setupMobileMenu } from '../utils/customScripts';
import styled from 'styled-components';

const Nav = styled.nav`
  background: var(--verde-escuro);
  color: var(--branco);
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;
const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;
const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  img {
    height: 80px;
    margin-right: 5px;
    width: 90px;
    border-radius: 50%;
    display: flex;
    justify-content: flex-start;
  }
`;
const MenuToggle = styled.div`
  display: none;
  cursor: pointer;
  font-size: 1.5rem;
  @media (max-width: 768px) {
    display: block;
    position: absolute;
    top: 15px;
    right: 20px;
  }
`;
const NavLinks = styled.ul`
  display: flex;
  list-style: none;
  li {
    margin-left: 25px;
  }
  a {
    color: var(--branco);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s;
    display: flex;
    align-items: center;
    i {
      margin-right: 5px;
    }
    &:hover {
      color: var(--verde-claro);
    }
  }
  @media (max-width: 768px) {
    display: none;
    flex-direction: column;
    width: 100%;
    margin-top: 15px;
    &.active {
      display: flex;
    }
    li {
      margin: 10px 0;
    }
  }
`;
const AuthButtons = styled.div`
  .btn {
    margin-left: 10px;
  }
  @media (max-width: 768px) {
    display: none;
    width: 100%;
    margin-top: 15px;
    &.active {
      display: block;
    }
  }
`;

const Navbar = ({ openModal }) => {
  useEffect(() => {
    setupMobileMenu();
  }, []);

  return (
    <Nav>
      <NavContainer>
        <Logo>
          <a href=""><img src={logo} alt="Logo" className="logo-img" /></a>
          <span>Green Trail</span>
        </Logo>
        <MenuToggle className="menu-toggle">
          <i className="fas fa-bars"></i>
        </MenuToggle>
        <NavLinks className="nav-links">
          <li><a href="#"><i className="fas fa-home"></i> Home</a></li>
          <li><a href="#"><i className="fas fa-map-marked-alt"></i> Trilhas</a></li>
          <li><a href="#"><i className="fas fa-envelope"></i> Contato</a></li>
          <li><a href="#"><i className="fas fa-info-circle"></i> Sobre</a></li>
        </NavLinks>
        <AuthButtons className="auth-buttons">
          <button className="btn btn-login" onClick={() => openModal('login')}>
            <i className="fas fa-sign-in-alt"></i> Login
          </button>
          <button className="btn" onClick={() => openModal('register')}>
            <i className="fas fa-user-plus"></i> Cadastre-se
          </button>
        </AuthButtons>
      </NavContainer>
    </Nav>
  );
}

export default Navbar;
