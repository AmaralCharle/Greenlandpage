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
  color: var(--verde-escuro);
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
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
`;

const EquipeItem = styled.li`
  display: flex;
  gap: 20px;
  align-items: flex-start;
  background: linear-gradient(90deg, #ffffff, #fff9f4);
  border: 1px solid rgba(13,173,22,0.06);
  border-left: 6px solid var(--verde-medio);
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 6px 22px rgba(15,80,20,0.05);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  &:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(15,80,20,0.07); }
`;

const Avatar = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--verde-medio), var(--verde-claro));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 900;
  font-size: 1.1rem;
  flex-shrink: 0;
`;

const MemberInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const MemberName = styled.div`
  font-size: 1.12rem;
  font-weight: 800;
  color: var(--verde-escuro);
`;

const MemberRole = styled.div`
  font-size: 0.98rem;
  color: #555;
  margin-top: 6px;
  font-weight: 600;
`;

const MemberBio = styled.div`
  margin-top: 10px;
  color: #333;
  font-size: 0.98rem;
  line-height: 1.4;
`;

const Sobre = () => (
  <BgWrapper>
    <Wrapper>
      <Title>Quem somos nós</Title>

      <Section>
        <SectionTitle>Projeto Universitário e Propósito Social</SectionTitle>
        <Text>
          Este é um projeto universitário desenvolvido com propósito social: unir tecnologia, pesquisa e comunidade para promover a conservação ambiental, educação ecológica e o acesso responsável às trilhas e espaços naturais.
          Nossa equipe trabalha em parceria com moradores, guias locais e órgãos públicos para transformar informações em ações de impacto social e ambiental.
        </Text>
      </Section>

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
          <EquipeItem>
            <Avatar>R</Avatar>
            <MemberInfo>
              <MemberName>Rafael Dias</MemberName>
              <MemberRole>Gerente de Projeto</MemberRole>
              <MemberBio>Coordena as entregas, cronogramas e comunicação entre equipes, garantindo que o projeto avance dentro do escopo e prazos.</MemberBio>
            </MemberInfo>
          </EquipeItem>

          <EquipeItem>
            <Avatar>J</Avatar>
            <MemberInfo>
              <MemberName>Jeferson Rosa</MemberName>
              <MemberRole>Desenvolvedor Front End</MemberRole>
              <MemberBio>Foco em componentes reutilizáveis e integração com APIs; trabalha em otimização de performance e responsividade.</MemberBio>
            </MemberInfo>
          </EquipeItem>

          <EquipeItem>
            <Avatar>A</Avatar>
            <MemberInfo>
              <MemberName>Alexander Nunes Guido</MemberName>
              <MemberRole>Analista de Requisitos</MemberRole>
              <MemberBio>Responsável por mapear necessidades dos usuários, escrever requisitos funcionais e garantir alinhamento entre equipe e stakeholders.</MemberBio>
            </MemberInfo>
          </EquipeItem>

          <EquipeItem>
            <Avatar>D</Avatar>
            <MemberInfo>
              <MemberName>Deyvison Fonseca</MemberName>
              <MemberRole>Analista de Segurança</MemberRole>
              <MemberBio>Cuida da segurança das aplicações, avaliações de risco e melhores práticas para proteger dados e infraestruturas.</MemberBio>
            </MemberInfo>
          </EquipeItem>

          <EquipeItem>
            <Avatar>V</Avatar>
            <MemberInfo>
              <MemberName>Vitor Amparo</MemberName>
              <MemberRole>Desenvolvedor Back End</MemberRole>
              <MemberBio>Projeto e manutenção das APIs e integração com banco de dados; responsável pela lógica servidor e deploy do backend.</MemberBio>
            </MemberInfo>
          </EquipeItem>

          <EquipeItem>
            <Avatar>Ri</Avatar>
            <MemberInfo>
              <MemberName>Richarle</MemberName>
              <MemberRole>Desenvolvedor Front End</MemberRole>
              <MemberBio>Especialista em interfaces e experiência do usuário, responsável pelo desenvolvimento das telas e interações do frontend.</MemberBio>
            </MemberInfo>
          </EquipeItem>
        </EquipeList>
      </Section>
    </Wrapper>
  </BgWrapper>
);

export default Sobre;
