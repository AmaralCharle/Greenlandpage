import React from 'react';
import styled from 'styled-components';

const HeaderSection = styled.header`
  background: linear-gradient(135deg, var(--verde-medio), var(--verde-escuro));
  color: var(--branco);
  padding: 100px 0 120px;
  text-align: center;
  clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
  margin-bottom: -40px;
  position: relative;
  overflow: hidden;
  @media (max-width: 768px) {
    padding: 60px 0 80px;
  }
`;
const HeaderContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
`;
const HeaderTitle = styled.h1`
  font-size: 2.8rem;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;
const HeaderDesc = styled.p`
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto;
  opacity: 0.9;
`;

const Header = () => {
  return (
    <HeaderSection>
      <HeaderContainer>
        <HeaderTitle>Green Trail</HeaderTitle>
        <HeaderDesc>Descubra rotas incríveis em meio à natureza preservada da Região dos Lagos</HeaderDesc>
      </HeaderContainer>
    </HeaderSection>
  );
}

export default Header;
