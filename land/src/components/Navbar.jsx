import React, { useEffect } from 'react';
import logo from '../assets/logotemp.jpg';
import { setupMobileMenu } from '../utils/customScripts';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

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
  @media (max-width: 768px) {
    margin-bottom: 18px;
    justify-content: center;
    width: 100%;
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
    left: 20px;
    right: auto;
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
    align-items: flex-start;
    padding-left: 32px;
    &.active {
      display: flex;
    }
    li {
      margin: 16px 0;
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
    margin-top: 30px;
    align-items: center;
    flex-direction: column;
    gap: 18px;
    &.active {
      display: flex;
    }
    .btn {
      margin: 0 0 12px 0;
      width: 90%;
      max-width: 260px;
      font-size: 1.1rem;
    }
  }
`;
const UserAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #e0e7ef;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 18px;
  border: 2.5px solid #0daf16;
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  &:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.13);
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
  .plus {
    font-size: 2.3rem;
    color: #0daf16;
    font-weight: bold;
  }
  @media (max-width: 768px) {
    position: static;
    margin-left: 24px;
    margin-top: 24px;
    margin-bottom: 12px;
    transform: none;
    z-index: auto;
  }
`;
const AvatarMenu = styled.div`
  position: absolute;
  top: 54px;
  right: 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.13);
  padding: 10px 0;
  min-width: 140px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  button {
    background: none;
    border: none;
    padding: 10px 18px;
    text-align: left;
    font-size: 1rem;
    color: #222;
    cursor: pointer;
    transition: background 0.2s;
    &:hover {
      background: #f4f8fb;
    }
  }
`;

// Sempre use o backend online para o Pages
const API_BASE_URL =
  window.location.hostname.includes('github.io')
    ? 'https://painful.aksaraymalaklisi.net/api/'
    : (import.meta.env.VITE_API_BASE_URL || window.API_BASE_URL || 'http://localhost:8000/api/');

const Navbar = ({ openModal }) => {
  useEffect(() => {
    setupMobileMenu();
  }, []);
  const navigate = useNavigate();
  const [user, setUser] = React.useState(() => {
    const saved = localStorage.getItem('user');
    const parsedUser = saved ? JSON.parse(saved) : null;
    console.log('User data initialized from localStorage:', parsedUser);
    return parsedUser;
  });
  const [showMenu, setShowMenu] = React.useState(false);
  const fileInputRef = React.useRef();

  const handleAvatarClick = () => {
    setShowMenu((v) => !v);
  };
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Salva a foto localmente (Data URL) primeiro para feedback imediato
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const base64Photo = readerEvent.target.result;
        const updatedUserLocal = {
          ...user,
          photo: base64Photo
        };
        setUser(updatedUserLocal);
        localStorage.setItem('user', JSON.stringify(updatedUserLocal));
        window.dispatchEvent(new Event('userChanged')); // Atualiza a UI imediatamente
      };
      reader.readAsDataURL(file);

      // Tenta enviar a foto para o backend para persistência online
      const formData = new FormData();
      formData.append('photo', file);
      const token = localStorage.getItem('access_token');
      try {
        const resp = await fetch(`${API_BASE_URL}users/me/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        if (resp.ok) {
          const userData = await resp.json();
          const updatedUserOnline = {
            ...user,
            photo: userData.profile?.picture
              ? (userData.profile.picture.startsWith('http')
                  ? userData.profile.picture
                  : `${API_BASE_URL.replace(/\/api\/?$/, '')}${userData.profile.picture.startsWith('/') ? '' : '/'}${userData.profile.picture}`)
              : null
          };
          // Se o upload online for bem-sucedido, substitui a URL local pela URL do servidor
          setUser(updatedUserOnline);
          localStorage.setItem('user', JSON.stringify(updatedUserOnline));
          window.dispatchEvent(new Event('userChanged'));
          alert('Foto enviada e salva online!');
        } else {
          alert('Erro ao enviar foto para o servidor online. Foto salva apenas localmente.');
        }
      } catch (err) {
        alert('Erro de conexão ao enviar foto online. Foto salva apenas localmente.');
        console.error('Erro de conexão/upload:', err);
      }
    }
  };
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setShowMenu(false);
    // Dispara evento customizado para atualizar toda a interface instantaneamente
    window.dispatchEvent(new Event('userChanged'));
  };
  const handleAddPhoto = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  useEffect(() => {
    // Atualiza o estado do usuário sempre que o localStorage mudar (login/logout)
    const syncUser = () => {
      const saved = localStorage.getItem('user');
      setUser(saved ? JSON.parse(saved) : null);
    };
    window.addEventListener('storage', syncUser);
    // Também escuta eventos customizados para login/logout instantâneo
    window.addEventListener('userChanged', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('userChanged', syncUser);
    };
  }, []);

  return (
    <Nav>
      <NavContainer>
        <Logo>
          <a href=""><img src={logo} alt="Logo" className="logo-img" /></a>
        </Logo>
        <MenuToggle className="menu-toggle">
          <i className="fas fa-bars"></i>
        </MenuToggle>
        <NavLinks className="nav-links">
          <li><a href="#"><i className="fas fa-home"></i> Home</a></li>
          <li><a href="#"><i className="fas fa-map-marked-alt"></i> Trilhas</a></li>
          <li><a href="/favoritos"><i className="fas fa-heart"></i> Favoritos</a></li>
          <li><a href="#footer-contato" onClick={e => {
            e.preventDefault();
            const el = document.getElementById('footer-contato');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}><i className="fas fa-envelope"></i> Contato</a></li>
          <li><a href="#" onClick={e => { e.preventDefault(); navigate('/sobre'); }}><i className="fas fa-info-circle"></i> Sobre</a></li>
        </NavLinks>
        <AuthButtons className="auth-buttons" style={{ display: user ? 'none' : undefined }}>
          <button className="btn btn-login" onClick={() => openModal('login')}>
            <i className="fas fa-sign-in-alt"></i> Login
          </button>
          <button className="btn" onClick={() => navigate('/cadastro')}>
            <i className="fas fa-user-plus"></i> Cadastre-se
          </button>
        </AuthButtons>
        {/* Avatar do usuário logado */}
        {user && (
          <div style={{ position: 'relative' }}>
            <UserAvatar onClick={handleAvatarClick} title={user.name || 'Usuário'}>
              {user.photo ? (
                <img src={user.photo} alt="avatar" />
              ) : (
                <span className="plus">+</span>
              )}
              <input
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg,.tiff,.ico,.jfif,.pjpeg,.pjp"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleUpload}
              />
            </UserAvatar>
            {showMenu && (
              <AvatarMenu>
                <button onClick={user.photo ? handleAddPhoto : handleAddPhoto}>
                  {user.photo ? 'Alterar foto' : 'Adicionar foto'}
                </button>
                <button onClick={handleLogout}>Logoff</button>
              </AvatarMenu>
            )}
          </div>
        )}
      </NavContainer>
    </Nav>
  );
}

export default Navbar;
