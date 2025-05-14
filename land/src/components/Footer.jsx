import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: var(--verde-escuro);
  color: white;
  text-align: center;
  padding: 30px 0;
  margin-top: 50px;
`;

const Footer = () => (
  <FooterContainer>
    <p>&copy; 2023 Trilhas de Maricá. Todos os direitos reservados.</p>
  </FooterContainer>
);

export default Footer;
