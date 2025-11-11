import React, { useState, useEffect, useMemo, useRef } from 'react';
import { API_BASE_URL } from '../config';
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

// Remove stray lines containing only a single "s" and trim whitespace.
const sanitizeText = (txt) => {
  if (!txt || typeof txt !== 'string') return txt;
  const lines = txt.split('\n').filter(line => !/^\s*s\s*$/i.test(line));
  return lines.join('\n').trim();
};

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

  const title = sanitizeText(trilha.title || trilha.label || 'Trilha');
  const imageUrl = trilha.image || trilha.photo || trilha.imageUrl || '';
  return (
    <div className="trilha-card" aria-label={title}>
      <div className="trilha-imagem" style={{ backgroundImage: imageUrl ? `url('${imageUrl}')` : 'none', backgroundColor: imageUrl ? undefined : '#efefef' }}>
        <div className="trilha-titulo">{title}</div>
      </div>
      <div className="trilha-conteudo">
        <div className="trilha-info">
          <span>{trilha.difficulty || '—'}</span>
          <span><i className="far fa-clock" /> {trilha.time || '—'}</span>
        </div>
  <div className="trilha-descricao">{sanitizeText(trilha.description || trilha.descricao || 'Descrição em breve.')}</div>
        <button className="btn" onClick={toggle} aria-expanded={showDetails} aria-controls={`detalhes-${trilha.id}`}>
          <i className={`fas fa-chevron-${showDetails ? 'up' : 'down'}`} /> {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
        </button>

  <div id={`detalhes-${trilha.id}`} className={`detalhes ${showDetails ? 'detalhes-ativo' : ''}`}>
          <div className="detalhes-conteudo">
            {trilha.details && trilha.details.length > 0 ? (
              <ul>
                {trilha.details.map((d, idx) => (
                  <li key={idx}>{sanitizeText(d)}</li>
                ))}
              </ul>
            ) : (
              <p>Informações adicionais não disponíveis.</p>
            )}
            {trilha.highlights ? (
              <>
                <h4>Destaques</h4>
                <p>{sanitizeText(trilha.highlights)}</p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const TrilhasCarousel3D = ({ trilhas = [], autoplay = true, autoplayDelay = 4200 }) => {
  // rotationCounter é cumulativo e evita 'pulos' na animação quando chegamos ao final.
  // centerIndex é o índice atual do item central (usado para escolher o card ativo).
  const [rotationCounter, setRotationCounter] = useState(0);
  const [localTrilhas, setLocalTrilhas] = useState(trilhas || []);
  const count = localTrilhas.length === 0 ? 1 : localTrilhas.length;
  const centerIndex = ((rotationCounter % count) + count) % count;
  // Tornar autoplay mais lento — multiplicador para o delay automático
  const effectiveAutoplayDelay = autoplayDelay * 3;
  const rootRef = useRef(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const autoRef = useRef(null);
  const [openCardId, setOpenCardId] = useState(null);

  // ajusta automaticamente o índice se trilhas mudar
  useEffect(() => {
    // Se a quantidade de trilhas mudou e o centerIndex não é válido, normalizamos
    // o rotationCounter para manter o mesmo centro quando possível.
    if (count === 0) return;
    if (centerIndex >= count) {
      setRotationCounter((rc) => rc % count);
    }
  }, [count]);

  // Se o pai passou trilhas por props, usamos essas imediatamente.
  // Caso contrário, fazemos UMA única requisição ao endpoint `/tracks/`
  // no mount e preenchemos os 10 primeiros itens.
  useEffect(() => {
    if (trilhas && trilhas.length > 0) {
      setLocalTrilhas(trilhas.slice(0, 10));
      return;
    }
    let mounted = true;
    const fetchTracksOnce = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}tracks/`, { method: 'GET' });
        if (!res.ok) {
          if (mounted) setLocalTrilhas([]);
          return;
        }
        const data = await res.json();
        if (!mounted || !Array.isArray(data)) return;
        const apiOrigin = API_BASE_URL.replace(/\/api\/?$/i, '');
        const mapped = data.slice(0, 10).map(item => {
          const rawImage = String(item.image || item.photo || item.thumbnail || '').trim();
          const sanitizePath = (p) => String(p || '').replace(/\\/g, '/').trim();
          let image = '';
          if (rawImage) {
            const rp = sanitizePath(rawImage);
            if (/^https?:\/\//i.test(rp)) {
              image = encodeURI(rp);
            } else {
              const path = rp.startsWith('/') ? rp : '/' + rp;
              image = encodeURI(apiOrigin + path);
            }
          }
          return {
            id: item.id || item.pk || String(item.url || item.name || item.title || Math.random()),
            title: sanitizeText(item.title || item.label || item.name || ''),
            image,
            description: sanitizeText(item.description || item.descricao || ''),
            details: Array.isArray(item.details) ? item.details.map(d => sanitizeText(String(d))) : (item.details ? [sanitizeText(String(item.details))] : []),
            highlights: sanitizeText(item.highlights || item.destaques || ''),
            difficulty: item.difficulty || item.dificuldade || '',
            time: item.time || item.duration || item.tempo || '',
            distance: item.distance || item.distancia || '',
            url: item.url || item.gpx || item.file || ''
          };
        });
        if (mounted) setLocalTrilhas(mapped);
      } catch (e) {
        if (mounted) setLocalTrilhas([]);
      }
    };
    fetchTracksOnce();
    return () => { mounted = false; };
  }, []);

  const radius = useMemo(() => Math.max(260, Math.min(520, 110 * count)), [count]);

  const angle = 360 / count;
  // rotação contínua em graus (não modular) para evitar 'rebobinagem' visual
  const continuousRotation = rotationCounter * angle;

  const rotateLeft = () => setRotationCounter((rc) => rc - 1);
  const rotateRight = () => setRotationCounter((rc) => rc + 1);

  // autoplay
  useEffect(() => {
    // Se autoplay desligado, poucas trilhas ou um cartão de detalhes aberto, não inicia autoplay
    if (!autoplay || count <= 1 || openCardId) return;
    const play = () => setRotationCounter((rc) => rc + 1);
    autoRef.current = setInterval(play, effectiveAutoplayDelay);
    return () => clearInterval(autoRef.current);
  }, [autoplay, autoplayDelay, count, openCardId]);

  // Se um cartão for aberto, garanta que qualquer intervalo ativo seja limpo
  useEffect(() => {
    if (openCardId) {
      try { clearInterval(autoRef.current); } catch (e) { /* ignore */ }
    }
  }, [openCardId]);

  const pauseAutoplay = () => clearInterval(autoRef.current);
  const resumeAutoplay = () => {
    if (!autoplay || openCardId) return;
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => setRotationCounter((rc) => rc + 1), effectiveAutoplayDelay);
  };

  // touch / pointer swipe
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onPointerDown = (e) => {
      dragging.current = true;
      startX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      // não pausa o autoplay aqui — o autoplay deve continuar até que o usuário
      // abra 'Ver detalhes', que irá impedir novos intervals via `openCardId`.
    };
    const onPointerUp = (e) => {
      if (!dragging.current) return;
      dragging.current = false;
      const endX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || 0;
      const diff = endX - startX.current;
      if (Math.abs(diff) > 40) {
        if (diff > 0) rotateLeft(); else rotateRight();
      }
      // não reiniciamos o autoplay aqui; autoplay é gerenciado pelo hook acima
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
        style={{ minHeight: `${openCardId ? baseHeight + extraWhenOpen : baseHeight}px` }}
      >
        <button className="carousel3d-btn left" onClick={rotateLeft} aria-label="Anterior">&#10094;</button>
        <div
          className="trilhas-carousel-3d"
          style={{ transform: `translateZ(-${radius}px) rotateY(${-continuousRotation}deg)` }}
        >
          {localTrilhas.map((t, i) => {
            const a = i * angle;
            // calcula offset simétrico em relação ao centerIndex para aplicar escala e zIndex
            let rawOffset = i - centerIndex;
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
