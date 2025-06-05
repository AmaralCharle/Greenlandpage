import React from 'react';
import styled from 'styled-components';
import praiaBg from '../assets/praia.jpg';

const BgWrapper = styled.section`
  min-height: 100vh;
  width: 100vw;
  position: relative;
  background: url(${praiaBg}) center/cover no-repeat fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  &:before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(2px);
    z-index: 1;
  }
`;
const Wrapper = styled.div`
  position: relative;
  z-index: 2;
  max-width: 900px;
  margin: 64px auto 48px auto;
  background: rgba(255,255,255,0.98);
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(56,142,60,0.13);
  padding: 56px 38px 44px 38px;
  @media (max-width: 700px) {
    padding: 18px 4vw 18px 4vw;
  }
`;
const Title = styled.h1`
  font-size: 2.8rem;
  color: #388e3c;
  font-weight: 900;
  margin-bottom: 38px;
  text-align: center;
  letter-spacing: 1px;
`;
const Section = styled.section`
  margin-bottom: 44px;
`;
const SectionTitle = styled.h2`
  font-size: 1.7rem;
  color: #1976d2;
  font-weight: 800;
  margin-bottom: 18px;
  letter-spacing: 0.5px;
`;
const Text = styled.p`
  font-size: 1.25rem;
  color: #222;
  line-height: 2.1;
  margin-bottom: 0;
  text-align: justify;
`;
const EquipeList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 18px 32px;
  justify-content: center;
`;
const EquipeItem = styled.li`
  font-size: 1.18rem;
  color: #333;
  font-weight: 600;
  background: #e8f5e9;
  border-radius: 10px;
  padding: 10px 22px;
  box-shadow: 0 2px 8px rgba(67,160,71,0.08);
  display: flex;
  align-items: center;
  gap: 10px;
  &:before {
    content: '👤';
    color: #43A047;
    font-size: 1.25em;
  }
`;

const Sobre = () => (
  <BgWrapper>
    <Wrapper>
      <Title>Sobre o Projeto</Title>
      <Section>
        <SectionTitle>Informações Gerais</SectionTitle>
        <Text>
          Site direcionado para a área de Turismo, que permite aos usuários uma seleção personalizada, de acessos a trilhas ecológicas na Cidade de Maricá (RJ).<br/><br/>
          Servir a ferramenta Web Site, a divulgação e informação à SECTUR (Secretaria de Turismo de Maricá-RJ), com a finalidade de fomentar ainda mais a conscientização de preservação ambiental e sustentabilidade, trazendo assim maior valorização ao Município, podendo gerar também melhoria econômica aos negócios locais, promoção de projetos culturais e locais, permitindo dessa forma, que toda a população seja beneficiada.
        </Text>
      </Section>
      <Section>
        <SectionTitle>Detalhes do Projeto</SectionTitle>
        <Text>
          O ecoturismo é uma forma de turismo que se baseia na exploração sustentável e responsável de áreas naturais, envolvendo a conservação do ambiente e o bem-estar das comunidades locais. Essa modalidade de turismo busca proporcionar experiências em ambientes naturais preservados, onde os visitantes têm a oportunidade de conhecer e apreciar a biodiversidade, os ecossistemas e as culturas locais, ao mesmo tempo em que são importantes para a conservação desses recursos. O ecoturismo valoriza a educação ambiental, a preservação dos recursos naturais e contribui também para a geração de benefícios econômicos para as comunidades envolvidas.
        </Text>
      </Section>
      <Section>
        <SectionTitle>Equipe</SectionTitle>
        <EquipeList>
          <EquipeItem>Deyvison Fonseca</EquipeItem>
          <EquipeItem>Rafael Dias</EquipeItem>
          <EquipeItem>Richarle Fagundes do A. Oliveira</EquipeItem>
          <EquipeItem>Jeferson Rosa</EquipeItem>
          <EquipeItem>Vitor Amparo</EquipeItem>
        </EquipeList>
      </Section>
    </Wrapper>
  </BgWrapper>
);

export default Sobre;
