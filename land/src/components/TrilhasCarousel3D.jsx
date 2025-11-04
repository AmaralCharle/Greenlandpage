import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';

// Componente convertido do CSS fornecido no txt.txt
// Mantive o padrão visual e fiz a lógica do carrossel 3D em React

const Wrapper = styled.section`
  --verde-escuro: #08420b;
  --verde-medio: #0daf16;
  --verde-claro: #2fdb1f;
  --bege: #f8f4e3;
  --branco: #ffffff;
  --sombra: 0 4px 6px rgba(0, 0, 0, 0.1);

  .trilhas-carousel-3d-wrapper {
    position: relative;
    perspective: 2000px;
    width: 100%;
    height: 520px;
    min-height: 56vh;
    margin: 48px 0 32px;
    overflow: visible;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .trilhas-carousel-3d {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 1s ease-in-out;
    will-change: transform;
  }

  .trilha-card {
    position: absolute;
    width: 320px;
    height: auto;
    min-height: 340px;
    top: 10%;
    left: 50%;
    margin-left: -160px;
    background: var(--branco);
    border-radius: 16px;
    overflow: visible;
    box-shadow: var(--sombra);
    transform-origin: center center;
    transition: transform 0.5s ease, opacity 0.5s ease;
  }

  .carousel3d-btn {
    position: absolute;
    top: 70%;
    transform: translateY(-50%);
    background-color: var(--verde-escuro);
    color: white;
    border: none;
    font-size: 2rem;
    padding: 10px 15px;
    cursor: pointer;
    z-index: 2;
    transition: background 0.3s ease;
  }

  .carousel3d-btn.left { left: 24px; }
  .carousel3d-btn.right { right: 24px; }
  .carousel3d-btn:hover { background-color: var(--verde-claro); }

  /* Card internals */
  .trilha-imagem {
    height: 220px;
    background-size: cover;
    background-position: center;
    position: relative;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }
  .trilha-imagem::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 50%;
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  }
  .trilha-titulo {
    position: absolute;
    bottom: 18px;
    left: 16px;
    color: #fff;
    font-size: 1.1rem;
    z-index: 1;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
    max-width: 72%;
    line-height: 1.1;
  }
  .trilha-conteudo { padding: 16px; }
  .trilha-info { display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.9rem; }
  .trilha-descricao { color:#555; margin-bottom:10px }
  .btn { display:inline-block; background:var(--verde-medio); color:#fff; padding:8px 14px; border-radius:24px; border:none; cursor:pointer }

  /* detalhes expansível */
  .detalhes {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.45s ease;
    background: #fbfbfb;
    border-radius: 0 0 12px 12px;
    margin-top: 12px;
    box-shadow: none;
  }
  .detalhes-conteudo { padding: 14px 16px; color: #444; }
  .detalhes-conteudo ul { list-style: disc; margin-left: 18px; }
  .detalhes-ativo { max-height: 420px; }

  @media (max-width: 900px) {
    .carousel3d-btn { display: none; }
    .trilhas-carousel-3d-wrapper { height: auto; padding: 30px 0; }
    /* Em telas pequenas usamos um carrossel horizontal simples */
    .trilhas-carousel-3d {
      position: relative;
      transform: none !important;
      display: flex;
      gap: 14px;
      overflow-x: auto;
      padding: 10px 6px;
      scroll-snap-type: x mandatory;
    }
    .trilhas-carousel-3d > div { position: relative; transform: none !important; opacity: 1 !important; }
    .trilha-card { position: relative; width: 86%; min-width: 260px; margin: 0 auto; left: unset; margin-left: 0; box-shadow: var(--sombra); scroll-snap-align: center; }
  }
`;

const TrilhaCard = ({ trilha, onToggleOpen }) => {
  const [showDetails, setShowDetails] = React.useState(false);

  const toggle = (e) => {
    e.stopPropagation();
    setShowDetails((s) => !s);
  };

  // Notifica o pai quando o estado de detalhes mudar, evitando chamadas de setState
  // durante a fase de renderização (evita o warning sobre setState em render).
  React.useEffect(() => {
    if (onToggleOpen) onToggleOpen(trilha.id, showDetails);
  }, [showDetails]);

  return (
    <div className="trilha-card" aria-label={trilha.title}>
      <div className="trilha-imagem" style={{ backgroundImage: `url('${trilha.image}')` }}>
        <div className="trilha-titulo">{trilha.title}</div>
      </div>
      <div className="trilha-conteudo">
        <div className="trilha-info">
          <span>{trilha.difficulty || '—'}</span>
          <span><i className="far fa-clock" /> {trilha.time || '—'}</span>
        </div>
        <div className="trilha-descricao">{trilha.description || 'Descrição em breve.'}</div>
        <button className="btn" onClick={toggle} aria-expanded={showDetails} aria-controls={`detalhes-${trilha.id}`}>
          <i className={`fas fa-chevron-${showDetails ? 'up' : 'down'}`} /> {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
        </button>

  <div id={`detalhes-${trilha.id}`} className={`detalhes ${showDetails ? 'detalhes-ativo' : ''}`}>
          <div className="detalhes-conteudo">
            {trilha.details && trilha.details.length > 0 ? (
              <ul>
                {trilha.details.map((d, idx) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
            ) : (
              <p>Informações adicionais não disponíveis.</p>
            )}
            {trilha.highlights ? (
              <>
                <h4>Destaques</h4>
                <p>{trilha.highlights}</p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const TrilhasCarousel3D = ({ trilhas = [], autoplay = true, autoplayDelay = 4200 }) => {
  const [index, setIndex] = useState(0);
  const count = trilhas.length || 3;
  const rootRef = useRef(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const autoRef = useRef(null);
  const [openCardId, setOpenCardId] = useState(null);

  // ajusta automaticamente o índice se trilhas mudar
  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count]);

  const radius = useMemo(() => Math.max(260, Math.min(520, 110 * count)), [count]);

  const angle = 360 / count;

  const rotateLeft = () => setIndex((i) => (i - 1 + count) % count);
  const rotateRight = () => setIndex((i) => (i + 1) % count);

  // autoplay
  useEffect(() => {
    if (!autoplay || count <= 1) return;
    const play = () => setIndex((i) => (i + 1) % count);
    autoRef.current = setInterval(play, autoplayDelay);
    return () => clearInterval(autoRef.current);
  }, [autoplay, autoplayDelay, count]);

  const pauseAutoplay = () => clearInterval(autoRef.current);
  const resumeAutoplay = () => {
    if (!autoplay) return;
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => setIndex((i) => (i + 1) % count), autoplayDelay);
  };

  // touch / pointer swipe
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onPointerDown = (e) => {
      dragging.current = true;
      startX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      pauseAutoplay();
    };
    const onPointerUp = (e) => {
      if (!dragging.current) return;
      dragging.current = false;
      const endX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || 0;
      const diff = endX - startX.current;
      if (Math.abs(diff) > 40) {
        if (diff > 0) rotateLeft(); else rotateRight();
      }
      resumeAutoplay();
    };

    root.addEventListener('pointerdown', onPointerDown);
    root.addEventListener('pointerup', onPointerUp);
    root.addEventListener('touchstart', onPointerDown, { passive: true });
    root.addEventListener('touchend', onPointerUp);

    return () => {
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('pointerup', onPointerUp);
      root.removeEventListener('touchstart', onPointerDown);
      root.removeEventListener('touchend', onPointerUp);
    };
  }, [rootRef.current, count]);

  // quanto a seção de detalhes estiver aberta, aumentamos a altura mínima
  const baseHeight = 520;
  const extraWhenOpen = 440; // deve corresponder ao max-height da área de detalhes

  return (
    <Wrapper>
      <div
        className="trilhas-carousel-3d-wrapper container"
        ref={rootRef}
        onMouseEnter={pauseAutoplay}
        onMouseLeave={resumeAutoplay}
        style={{ minHeight: `${openCardId ? baseHeight + extraWhenOpen : baseHeight}px` }}
      >
        <button className="carousel3d-btn left" onClick={rotateLeft} aria-label="Anterior">&#10094;</button>
        <div
          className="trilhas-carousel-3d"
          style={{ transform: `translateZ(-${radius}px) rotateY(${-index * angle}deg)` }}
        >
          {trilhas.map((t, i) => {
            const a = i * angle;
            // calcula offset simétrico para aplicar escala e zIndex
            let rawOffset = i - index;
            if (rawOffset > count / 2) rawOffset -= count;
            if (rawOffset < -count / 2) rawOffset += count;
            const absOffset = Math.abs(rawOffset);
            const scale = absOffset === 0 ? 1.06 : absOffset === 1 ? 0.94 : 0.82;
            const opacity = absOffset > 2 ? 0.35 : 1 - absOffset * 0.18;
            const zIndex = 100 - absOffset;

            const style = {
              transform: `rotateY(${a}deg) translateZ(${radius}px) scale(${scale})`,
              opacity,
              zIndex,
            };
            return (
              <div key={t.id || i} style={style}>
                <TrilhaCard trilha={t} onToggleOpen={(id, open) => setOpenCardId(open ? id : null)} />
              </div>
            );
          })}
        </div>
        <button className="carousel3d-btn right" onClick={rotateRight} aria-label="Próximo">&#10095;</button>
      </div>
    </Wrapper>
  );
};

export default TrilhasCarousel3D;
