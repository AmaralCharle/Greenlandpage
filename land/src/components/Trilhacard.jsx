import React, { useState } from 'react';

const Trilhacard = ({ id, title, image, difficulty, time, distance, description, details, highlights }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleToggle = () => setShowDetails((prev) => !prev);

  return (
    <div className="trilha-card">
      <div className="trilha-imagem" style={{ backgroundImage: `url('${image}')` }}>
        <h2 className="trilha-titulo">{title}</h2>
      </div>
      <div className="trilha-conteudo">
        <div className="trilha-info">
          <span className={`dificuldade ${difficulty === 'Fácil' ? 'facil' : difficulty === 'Moderada' ? 'moderada' : 'dificil'}`}>{difficulty}</span>
          <span><i className="far fa-clock"></i> {time}</span>
          <span><i className="fas fa-route"></i> {distance}</span>
        </div>
        <p className="trilha-descricao">{description}</p>
        <button className="btn btn-detalhes" onClick={handleToggle}>
          <i className={`fas fa-chevron-${showDetails ? 'up' : 'down'}`}></i> {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
        </button>
        <div className={`detalhes${showDetails ? ' detalhes-ativo' : ''}`} id={id}>
          <div className="detalhes-conteudo">
            <h3>Informações da Trilha</h3>
            <ul className="feature-list">
              {details && details.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
            <h3>Destaques</h3>
            <p>{highlights}</p>
            <button className="btn btn-outline">
              <i className="fas fa-map-marked-alt"></i> Ver no mapa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trilhacard;
