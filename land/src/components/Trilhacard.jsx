import React, { useState } from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: var(--branco);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--sombra);
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
  }
`;
const CardImage = styled.div`
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 50%;
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  }
`;
const CardTitle = styled.h2`
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  font-size: 1.5rem;
  z-index: 1;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
`;
const CardContent = styled.div`
  padding: 20px;
`;
const CardInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 0.9rem;
`;
const Difficulty = styled.span`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-right: 10px;
  border: none;
  width: auto;
  height: auto;
  background-color: ${({ $level }) =>
    $level === 'Fácil' ? '#d4edda' : $level === 'Moderada' ? '#fff3cd' : '#f8d7da'};
  color: ${({ $level }) =>
    $level === 'Fácil' ? '#155724' : $level === 'Moderada' ? '#856404' : '#721c24'};
`;
const CardDesc = styled.p`
  margin-bottom: 20px;
  color: #555;
`;
const Btn = styled.button`
  display: inline-block;
  background: var(--verde-medio);
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: bold;
  transition: background 0.3s;
  border: none;
  cursor: pointer;
  &.btn-outline {
    background: transparent;
    border: 2px solid var(--verde-medio);
    color: var(--verde-medio);
  }
  &.btn-outline:hover {
    background: var(--verde-medio);
    color: white;
  }
  &:hover {
    background: var(--verde-escuro);
  }
`;
const Details = styled.div`
  max-height: ${({ $active }) => ($active ? '500px' : '0')};
  overflow: hidden;
  transition: max-height 0.5s;
  background: #f9f9f9;
  border-radius: 8px;
  margin-top: 15px;
`;
const DetailsContent = styled.div`
  padding: 20px;
`;
const FeatureList = styled.ul`
  list-style: none;
  margin-top: 15px;
  li {
    margin-bottom: 8px;
    position: relative;
    padding-left: 25px;
    &::before {
      content: '\f00c';
      font-family: 'Font Awesome 6 Free';
      font-weight: 900;
      position: absolute;
      left: 0;
      color: var(--verde-claro);
    }
  }
`;

const Trilhacard = ({ id, title, image, difficulty, time, distance, description, details, highlights }) => {
  const [showDetails, setShowDetails] = useState(false);
  const handleToggle = () => setShowDetails((prev) => !prev);
  return (
    <Card>
      <CardImage style={{ backgroundImage: `url('${image}')` }}>
        <CardTitle>{title}</CardTitle>
      </CardImage>
      <CardContent>
        <CardInfo>
          <Difficulty $level={difficulty}>{difficulty}</Difficulty>
          <span><i className="far fa-clock"></i> {time}</span>
          <span><i className="fas fa-route"></i> {distance}</span>
        </CardInfo>
        <CardDesc>{description}</CardDesc>
        <Btn className="btn btn-detalhes" onClick={handleToggle}>
          <i className={`fas fa-chevron-${showDetails ? 'up' : 'down'}`}></i> {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
        </Btn>
        <Details $active={showDetails} id={id}>
          <DetailsContent>
            <h3>Informações da Trilha</h3>
            <FeatureList>
              {details && details.map((item, idx) => <li key={idx}>{item}</li>)}
            </FeatureList>
            <h3>Destaques</h3>
            <p>{highlights}</p>
            <Btn className="btn btn-outline">
              <i className="fas fa-map-marked-alt"></i> Ver no mapa
            </Btn>
          </DetailsContent>
        </Details>
      </CardContent>
    </Card>
  );
};

export default Trilhacard;
