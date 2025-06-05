import React from 'react';
import styled from 'styled-components';
import logoTemp from '../assets/logotemp.jpg';

const FooterContainer = styled.footer`
  background: #0b4d1c; /* Verde escuro consistente em todos ambientes */
  color: #fff;
  border-top: 2px solid #e0e0e0;
  padding: 32px 0 18px 0;
  margin-top: 50px;
  width: 100%;
`;
const FooterFlex = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  max-width: 1200px;
  margin: 0 auto;
  gap: 24px;
  flex-wrap: wrap;
  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
    gap: 18px;
  }
`;
const FooterCol = styled.div`
  flex: 1 1 0;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  @media (max-width: 900px) {
    align-items: center;
    text-align: center;
  }
`;
const FooterTitle = styled.div`
  font-weight: 700;
  font-size: 1.08rem;
  margin-bottom: 2px;
`;
const SocialIcons = styled.div`
  display: flex;
  gap: 40px; /* Espaçamento ainda maior entre os ícones */
  align-items: center;
  justify-content: flex-end;
  font-size: 2.1rem;
  @media (max-width: 900px) {
    justify-content: center;
  }
`;
const IconLink = styled.a`
  color: #fff !important; /* Branco absoluto para os ícones */
  transition: 0.2s;
  &:hover { color: #43A047 !important; } /* Verde no hover para destacar */
`;

const Footer = () => (
  <FooterContainer id="footer-contato">
    <FooterFlex>
      <FooterCol style={{minWidth: 180}}>
        <img src={logoTemp} alt="Logo" style={{width: 38, marginBottom: 2}} />
        <div style={{fontWeight: 700}}>Trilha Verde</div>
        <div style={{fontSize: 15, fontWeight: 500}}>Projeto em andamento.</div>
      </FooterCol>
      <FooterCol style={{minWidth: 260}}>
        <FooterTitle>Contato</FooterTitle>
        <div style={{fontSize: 15}}>
          <b>E-mail:</b> example@example.com<br/>
          <b>Telefone:</b> (21) 91234-5678<br/>
          <b>Endereço:</b> Av. Roberto Silveira, N: 179 Mumbuca - Maricá, RJ
        </div>
      </FooterCol>
      <FooterCol style={{alignItems: 'flex-end', minWidth: 180}}>
        <SocialIcons>
          <IconLink href="#" title="Instagram" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></IconLink>
          <IconLink href="#" title="Twitter" aria-label="Twitter"><i className="fa-brands fa-twitter"></i></IconLink>
          <IconLink href="#" title="Facebook" aria-label="Facebook"><i className="fa-brands fa-facebook"></i></IconLink>
          <IconLink href="#" title="WhatsApp" aria-label="WhatsApp"><i className="fa-brands fa-whatsapp"></i></IconLink>
        </SocialIcons>
      </FooterCol>
    </FooterFlex>
  </FooterContainer>
);

export default Footer;
