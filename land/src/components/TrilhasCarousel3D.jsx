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
      <div className="trilha-imagem" style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#efefef' }}>
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={title} 
            referrerPolicy="no-referrer"
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
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
  // Fallback local usado quando a API estiver inacessível (CORS, offline, etc.)
  // Dados ricos manuais para garantir que os cards nunca fiquem vazios
  const RICH_TRAILS_DATA = [
    { id: 'f1', title: 'Trilha da Pedra do Elefante', image: 'https://painful.aksaraymalaklisi.net/media/tracks/images/Foto_2.webp', description: 'Vista panorâmica e formação rochosa única.', difficulty: 'Moderado', time: '1h40', details: ['Vista de 360 graus', 'Formação rochosa icônica', 'Vegetação de mata atlântica'], highlights: 'Pôr do sol incrível' },
    { id: 'f2', title: 'Trilha da Pedra do Itaocaia', image: 'https://painful.aksaraymalaklisi.net/media/tracks/images/pedra-de-itaocaia.jpg', description: 'Trilha íngreme com visual incrível do topo.', difficulty: 'Difícil', time: '1h30', details: ['Subida íngreme', 'Vista para o mar', 'História local (Darwin)'], highlights: 'Vista da Lagoa de Maricá' },
    { id: 'f3', title: 'Trilha da Pedra do Silvado', image: 'https://painful.aksaraymalaklisi.net/media/tracks/images/Foto_2.jpg', description: 'Desafio para os aventureiros, com mata fechada.', difficulty: 'Difícil', time: '5h', details: ['Mata densa', 'Fauna rica', 'Silêncio e isolamento'], highlights: 'Contato profundo com a natureza' },
    { id: 'f4', title: 'Trilha da Pedra de Inoã', image: 'https://painful.aksaraymalaklisi.net/media/tracks/images/Foto_01.jpg', description: 'Trilha curta, mas com subidas fortes.', difficulty: 'Moderado', time: '1h30', details: ['Subida constante', 'Vista da orla', 'Vegetação rasteira'], highlights: 'Vista panorâmica de Inoã' },
    { id: 'f5', title: 'Trilha da Pedra de Macaco', image: 'https://painful.aksaraymalaklisi.net/media/tracks/images/Pedra-do-Macaco-2-700x467.jpg', description: 'Ideal para iniciantes e famílias.', difficulty: 'Fácil', time: '40m', details: ['Acesso fácil', 'Sombreada', 'Vista do litoral'], highlights: 'Pedra suspensa para fotos' },
    { id: 'f6', title: 'Trilha Caminhos de Darwin', image: 'https://painful.aksaraymalaklisi.net/media/tracks/images/Imagem_III.jpg', description: 'Trilha histórica, vegetação variada.', difficulty: 'Fácil', time: '2h', details: ['Caminho histórico', 'Passagem de Charles Darwin', 'Biodiversidade'], highlights: 'Placas informativas históricas' },
    { id: 'f7', title: 'Pico da Lagoinha', image: 'https://painful.aksaraymalaklisi.net/media/tracks/images/Foto_4_Trilha_do_Pico_da_Lagoinha.jpg', description: 'Acesso ao ponto mais alto da região.', difficulty: 'Difícil', time: '5h', details: ['Ponto culminante', 'Vista de toda a região', 'Clima de montanha'], highlights: 'O ponto mais alto de Maricá' },
    { id: 'f8', title: 'Travessia Silvado - Espraiado', image: 'https://painful.aksaraymalaklisi.net/media/tracks/images/Foto_1_Trilha_de_Travessia_Silvado_-_Espraiado.jpg', description: 'Travessia entre vales e montanhas.', difficulty: 'Difícil', time: '2h30', details: ['Travessia de vale', 'Rios e cachoeiras', 'Paisagem rural'], highlights: 'Conexão entre dois bairros rurais' },
    { id: 'f9', title: 'Cachoeira do Segredo', image: 'https://painful.aksaraymalaklisi.net/media/tracks/images/Foto_3_Trilha_da_Cachoeira_do_Segredo_em_Silvado.jpg', description: 'Cachoeira escondida em meio à mata.', difficulty: 'Moderado', time: '2h', details: ['Banho de cachoeira', 'Água cristalina', 'Trilha úmida'], highlights: 'Queda d\'água refrescante' },
    { id: 'f10', title: 'Trilha dos Espraiado/Tomascar', image: 'https://painful.aksaraymalaklisi.net/media/tracks/images/IMG-20251204-WA0015.jpg', description: 'Travessia longa e desafiadora, paisagens rurais.', difficulty: 'Difícil', time: '2h', details: ['Fazenda histórica', 'Rio Tomascar', 'Comida típica no final'], highlights: 'Almoço no Tomascar' },
  ];

  // Fallback local usado quando a API estiver inacessível (CORS, offline, etc.)
  const LOCAL_FALLBACK = RICH_TRAILS_DATA;

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
        // debug logs para verificar se o frontend está fazendo a requisição
        // será visível no console do navegador quando rodar em dev
        try { console.debug('TrilhasCarousel3D: fetch starting', `${API_BASE_URL}tracks/`); } catch(e){}
        // Usa AbortController para timeout e melhor controle de erros
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const res = await fetch(`${API_BASE_URL}tracks/`, { 
          method: 'GET',
          signal: controller.signal
        }).catch(err => {
          // Silencia erros de rede/502 - a aplicação usa fallback local
          if (err.name !== 'AbortError') {
            // Apenas loga em modo debug, não polui o console em produção
            if (import.meta.env.DEV) {
              console.debug('API indisponível, usando trilhas locais como fallback');
            }
          }
          clearTimeout(timeoutId);
          if (mounted) setLocalTrilhas(LOCAL_FALLBACK.slice(0, 10));
          return null;
        });
        
        clearTimeout(timeoutId);
        if (!res) return; // Erro de rede, já definiu fallback
        
        try { console.debug('TrilhasCarousel3D: fetch response status', res.status); } catch(e){}
        if (!res.ok) {
          // Silencia 502 e outros erros - usa fallback local silenciosamente
          if (import.meta.env.DEV && res.status === 502) {
            console.debug('API retornou 502 - usando trilhas locais');
          }
          if (mounted) setLocalTrilhas(LOCAL_FALLBACK.slice(0, 10));
          return;
        }
        const data = await res.json();
        try { console.debug('TrilhasCarousel3D: fetched items', Array.isArray(data) ? data.length : typeof data); } catch(e){}
        // Support paginated responses (DRF): { count, next, previous, results: [...] }
        const itemsArray = Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : null);
        if (!mounted || !itemsArray) {
          if (mounted) setLocalTrilhas(LOCAL_FALLBACK.slice(0, 10));
          return;
        }
        const apiOrigin = String(API_BASE_URL).replace(/\/api\/?$/i, '');
  const mapped = itemsArray.slice(0, 10).map(item => {
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

        // Enriquecimento: Se a API não retornou descrição ou detalhes, tentamos preencher
        // com os dados manuais (RICH_TRAILS_DATA) baseando-se no título.
        const enriched = mapped.map(apiItem => {
          const localMatch = RICH_TRAILS_DATA.find(local => 
            local.title.toLowerCase().includes(apiItem.title.toLowerCase()) || 
            apiItem.title.toLowerCase().includes(local.title.toLowerCase())
          );
          if (localMatch) {
            return {
              ...apiItem,
              description: apiItem.description || localMatch.description,
              details: (apiItem.details && apiItem.details.length > 0) ? apiItem.details : localMatch.details,
              highlights: apiItem.highlights || localMatch.highlights,
              difficulty: apiItem.difficulty || localMatch.difficulty,
              time: apiItem.time || localMatch.time
            };
          }
          return apiItem;
        });
        if (!mounted) return;

        if (!mounted) return;

        // Removemos o preload estrito que bloqueava a renderização.
        // Deixamos o navegador carregar as imagens progressivamente.
        // console.log('TrilhasCarousel3D: setting tracks', enriched.map(t => ({ id: t.id, image: t.image })));
        if (mounted) setLocalTrilhas(enriched);

      } catch (e) {
        console.error('TrilhasCarousel3D: error processing tracks', e);
        // Pode falhar por CORS (browser) — usamos fallback local com imagens conhecidas
        if (mounted) setLocalTrilhas(LOCAL_FALLBACK.slice(0, 10));
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
