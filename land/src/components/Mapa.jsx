import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-gpx';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { FaMountain, FaRoad, FaClock, FaArrowUp, FaExchangeAlt } from 'react-icons/fa';

// Corrige os ícones do leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Base para assets GPX e ícones.
// Tentamos resolver de forma robusta para produção (GitHub Pages) e desenvolvimento:
// - Se a página estiver hospedada em '/Greenlandpage/' (ou similar), usamos window.location.pathname
//   para montar '/Greenlandpage/markers/...'. Caso contrário, tentamos usar import.meta.env.BASE_URL.
// - Isso cobre situações em que o `dist` contém uma pasta 'Greenlandpage/' mas o index.html
//   fica no root (cenário que causou 404s com paths incorretos).
const computeSiteBase = () => {
  if (typeof window !== 'undefined') {
    const p = window.location.pathname;
    // Se a url já inclui /Greenlandpage/ use-a como base
    if (p.includes('/Greenlandpage/')) {
      // retorna a parte até e incluindo '/Greenlandpage/' para evitar duplicação
      const idx = p.indexOf('/Greenlandpage/');
      return p.slice(0, idx + '/Greenlandpage/'.length);
    }
    // fallback para import.meta.env.BASE_URL quando disponível
  }
  return import.meta.env.BASE_URL || '/';
};

const SITE_BASE = computeSiteBase();
// Tentativas possíveis (candidatas).
// Observação: em alguns deploys os assets estão em '/Greenlandpage/Greenlandpage/...'
// — preferimos testar primeiro esse caminho em produção para evitar 404s.
// Em dev o vite serve arquivos de `public/` no root '/', então incluímos
// explicitamente os caminhos sem o `SITE_BASE` antes dos candidatos com base.
// Prioritize the candidate that matches the common "public/Greenlandpage/..." layout
// which in combination with Vite's base can end up as '/Greenlandpage/Greenlandpage/...'.
const markersBaseCandidates = import.meta.env.PROD
  ? [`${SITE_BASE}Greenlandpage/markers/`, `${SITE_BASE}markers/`]
  : [`${SITE_BASE}Greenlandpage/markers/`, `/Greenlandpage/markers/`, `${SITE_BASE}markers/`, '/markers/'];
const markersIconsBaseCandidates = import.meta.env.PROD
  ? [`${SITE_BASE}Greenlandpage/markers_icons/`, `${SITE_BASE}markers_icons/`]
  : [`${SITE_BASE}Greenlandpage/markers_icons/`, `/Greenlandpage/markers_icons/`, `${SITE_BASE}markers_icons/`, '/markers_icons/'];

// Estados para a base efetiva encontrada (testados em runtime)
// Inicializamos com um default que já favorece o caminho duplicado em produção.
const defaultMarkersBase = markersBaseCandidates[0];
// Em desenvolvimento é comum que os assets estejam em /Greenlandpage/..., portanto
// forçamos um fallback explícito que evita 404s caseiros causados por candidate probes
// que por algum motivo escolham '/markers_icons/' sem o prefixo.
const defaultMarkersIconsBase = import.meta.env.DEV ? '/Greenlandpage/markers_icons/' : markersIconsBaseCandidates[0];

// Utility: normalize a base path to avoid duplicated segments like '/Greenlandpage/Greenlandpage/'
const normalizeBase = (c) => {
  if (!c) return c;
  let p = String(c).replace(/\/+/g, '/');
  // NÃO substituir automaticamente duplicações de SITE_BASE aqui.
  // Em alguns deploys válidos os assets podem residir em
  // '/Greenlandpage/Greenlandpage/...' e remover a duplicação
  // de forma automática pode apontar para o index.html (causando 200
  // com HTML) — preferimos preservar o caminho original e confiar na
  // probe para detectar qual candidato realmente serve o asset.
  if (!p.endsWith('/')) p = p + '/';
  return p;
};

// Build absolute URL for an asset (avoids relative path ambiguity)
const makeAbsoluteUrl = (base, file) => {
  if (!base) return file;
  const b = normalizeBase(base);
  if (/^https?:\/\//.test(b)) return b + file;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return origin + (b.startsWith('/') ? b : '/' + b) + file;
};

// Função para escolher o ícone do marcador conforme a dificuldade
function getCustomIcon(dificuldade) {
  // usa o defaultMarkersIconsBase (presente no build) — collapse duplicações simples
  const collapsed = String(defaultMarkersIconsBase).replace(/(\/Greenlandpage\/)+/g, '/Greenlandpage/').replace(/\/+/g, '/');
  const iconUrl = `${collapsed}location-pin.png`;
  let iconColor = '#43A047';
  if (dificuldade === 'Moderada') iconColor = '#FFD600';
  if (dificuldade === 'Difícil') iconColor = '#E53935';
  if (dificuldade === 'Fácil') iconColor = '#43A047';
  return L.icon({
    iconUrl,
    iconSize: [38, 48],
    iconAnchor: [19, 44],
    popupAnchor: [0, -40],
    shadowUrl: markerShadow,
    shadowSize: [40, 50],
    className: `marker-${dificuldade.toLowerCase()}`
  });
}

// Função utilitária para extrair início e fim do GPX
function getStartEndFromGPX(gpxFile, callback) {
  fetch(gpxFile)
    .then(res => {
      if (!res.ok) {
        // aviso discreto — evita poluir o console com erros controlados
        console.warn('GPX não encontrado (provável 404):', gpxFile, res.status);
        callback(null, null);
        return '';
      }
      return res.text();
    })
    .then(str => {
      if (!str) return;
      try {
        const parser = new window.DOMParser();
        const xml = parser.parseFromString(str, 'application/xml');
        // Tenta obter por namespace e sem namespace (compatibilidade)
        let trkpts = xml.getElementsByTagName('trkpt');
        if (!trkpts || trkpts.length === 0) {
          // tenta por namespace GPX 1.1
          trkpts = xml.getElementsByTagNameNS('http://www.topografix.com/GPX/1/1', 'trkpt') || [];
        }
        // Se ainda nada, pode ser que o fetch tenha retornado HTML (arquivo não encontrado) — detecte isso
        if (trkpts && trkpts.length > 1) {
          const start = [parseFloat(trkpts[0].getAttribute('lat')), parseFloat(trkpts[0].getAttribute('lon'))];
          const end = [parseFloat(trkpts[trkpts.length-1].getAttribute('lat')), parseFloat(trkpts[trkpts.length-1].getAttribute('lon'))];
          console.log('GPX OK:', gpxFile, 'start', start, 'end', end, 'trkpt count', trkpts.length);
          callback(start, end);
        } else {
          console.warn('GPX sem trkpt suficiente:', gpxFile, 'trkpt count', trkpts ? trkpts.length : 0);
          callback(null, null);
        }
      } catch (e) {
        console.warn('Erro ao parsear GPX (XML inválido?):', gpxFile, e);
        callback(null, null);
      }
    })
    .catch(err => {
      console.warn('Erro geral ao processar GPX:', gpxFile, err);
      callback(null, null);
    });

}

// Função utilitária para extrair todos os pontos do GPX
function getTrackPointsFromGPX(gpxFile, callback) {
  fetch(gpxFile)
    .then(res => {
      if (!res.ok) return '';
      return res.text();
    })
    .then(str => {
      if (!str) { callback([]); return; }
      try {
        const parser = new window.DOMParser();
        const xml = parser.parseFromString(str, 'application/xml');
        let trkpts = xml.getElementsByTagName('trkpt');
        if (!trkpts || trkpts.length === 0) {
          trkpts = xml.getElementsByTagNameNS('http://www.topografix.com/GPX/1/1', 'trkpt') || [];
        }
        const points = [];
        for (let i = 0; i < trkpts.length; i++) {
          const lat = parseFloat(trkpts[i].getAttribute('lat'));
          const lon = parseFloat(trkpts[i].getAttribute('lon'));
          if (!isNaN(lat) && !isNaN(lon)) points.push([lat, lon]);
        }
        callback(points);
      } catch (e) {
        console.warn('Erro ao parsear pontos GPX:', gpxFile, e);
        callback([]);
      }
    })
    .catch((err) => { console.warn('Erro fetching GPX:', gpxFile, err); callback([]); });
}

const trilhas = [
  { label: 'Trilha da Pedra do Elefante', pos: [-22.936, -42.987], url: 'track1', distance: '1977.43', difficulty: 'Moderado', duration:'100', routetype:'ida_volta', elevation:'233', descricao: 'Vista panorâmica e formação rochosa única.' },
  { label: 'Trilha da Pedra do Itaocaia', pos: [-22.950, -42.970], url: 'track2', distance: '1254.42', difficulty: 'Difícil', duration:'90', routetype:'ida_volta', elevation:'390', descricao: 'Trilha íngreme com visual incrível do topo.' },
  { label: 'Trilha da Pedra do Silvado', pos: [-22.920, -42.950], url: 'track3', distance: '1913.42', difficulty: 'Difícil', duration:'300', routetype:'ida_volta', elevation:'529', descricao: 'Desafio para os aventureiros, com mata fechada.' },
  { label: 'Trilha da Pedra de Inoã', pos: [-22.930, -42.930], url: 'track4', distance: '1906.28', difficulty: 'Moderado', duration:'90', routetype:'ida_volta', elevation:'513', descricao: 'Trilha curta, mas com subidas fortes.' },
  { label: 'Trilha da Pedra de Macaco', pos: [-22.910, -42.910], url: 'track5', distance: '710.24', difficulty: 'Fácil', duration:'40', routetype:'ida_volta', elevation:'246', descricao: 'Ideal para iniciantes e famílias.' },
  { label: 'Trilha dos Espraiado/Tomascar', pos: [-22.94, -42.96], url: 'track6', distance: '4347.83', difficulty: 'Difícil', duration: '120', routetype: 'ida_volta', elevation: '555', descricao: 'Travessia longa e desafiadora, paisagens rurais.' },
  { label: 'Trilha Caminhos de Darwin', pos: [-22.93, -42.94], url: 'track7', distance: '6375.64', difficulty: 'Fácil', duration: '120', routetype: 'ida', elevation: '386', descricao: 'Trilha histórica, vegetação variada.' },
  { label: 'Trilha de Acesso ao Pico da Lagoinha', pos: [-22.935, -42.92], url: 'track8', distance: '4300.00', difficulty: 'Difícil', duration: '300', routetype: 'ida_volta', elevation: '653', descricao: 'Acesso ao ponto mais alto da região.' },
  { label: 'Trilha de Travessia Silvado x Espraiado', pos: [-22.925, -42.955], url: 'track9', distance: '9966.04', difficulty: 'Difícil', duration: '150', routetype: 'ida', elevation: '521', descricao: 'Travessia entre vales e montanhas.' },
  { label: 'Trilha da Cachoeira do Segredo em Silvado', pos: [-22.927, -42.952], url: 'track10', distance: '3960.64', difficulty: 'Moderada', duration: '120', routetype: 'ida_volta', elevation: '220', descricao: 'Cachoeira escondida em meio à mata.' }
];

// sanitize stray single-character 's' lines in text fields
const sanitizeText = (txt) => {
  if (!txt || typeof txt !== 'string') return txt;
  const lines = txt.split('\n').filter(line => !/^\s*s\s*$/i.test(line));
  return lines.join('\n').trim();
};

const MapWrapper = styled.section`
  width: 100%;
  max-width: 1200px;
  margin: 40px auto 0 auto;
  background: var(--branco);
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  padding: 0 0 32px 0;
`;
const MapTitle = styled.h2`
  text-align: center;
  font-size: 2rem;
  color: var(--verde-escuro);
  margin: 0 auto 24px auto;
  font-weight: 700;
  background: none;
  z-index: 2;
`;
const MapFlex = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  z-index: 1;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;
const CarouselWrapper = styled.div`
  width: 320px;
  max-width: 98vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8f8f8;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  padding: 18px 10px 18px 10px;
  margin-right: 18px;
  @media (max-width: 900px) {
    width: 100%;
    margin: 0 0 18px 0;
    padding: 10px 2px;
  }
`;
const CarouselNav = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
`;
const CarouselBtn = styled.button`
  background: ${({$active, $cor}) => $active ? $cor : '#e0e0e0'};
  color: #222;
  border: none;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 0.98rem;
  font-weight: 600;
  margin: 0 2px;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    background: ${({$cor}) => $cor};
    color: #fff;
  }
`;
const CarouselCard = styled.div`
  background: ${({$cor}) => $cor+'22'};
  border: 2px solid ${({$cor}) => $cor};
  border-radius: 12px;
  padding: 18px 14px;
  width: 100%;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 6px;
  transition: background 0.5s ease-in-out, border 0.5s ease-in-out;
`;
const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  color: #333;
`;
const StyledMapContainer = styled(MapContainer)`
  flex: 1 1 0%;
  height: 420px !important;
  min-width: 320px;
  width: 100%;
  border-radius: 12px;
  z-index: 1;
  background: #e5e5e5 !important; // fallback para tiles não carregados
  @media (max-width: 900px) {
    min-width: unset;
    width: 100% !important;
    height: 320px !important;
  }
`;
const Tooltip = styled.div`
  visibility: hidden;
  opacity: 0;
  background: #222;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 4px 10px;
  position: absolute;
  z-index: 10;
  top: -36px;
  right: 0;
  font-size: 0.95rem;
  pointer-events: none;
  transition: opacity 0.2s;
  white-space: nowrap;
`;
const FavoriteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 2;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  &:hover {
    transform: scale(1.1);
  }
  i {
    color: ${props => props.$isFavorite ? '#FFD600' : '#bbb'};
    font-size: 1.1rem;
  }
  &:hover > .tooltip {
    visibility: visible;
    opacity: 1;
  }
`;

// Função para obter o caminho correto dos ícones (fallback)
// Em runtime o componente `Mapa` irá detectar a base correta (selectedIconsBase)
// e usar esse valor preferencialmente. Aqui mantemos um fallback estático.
const getIconUrl = (file) => `${defaultMarkersIconsBase}${file}`;

// Componente para carregar e exibir GPX
const GPXTrack = ({ gpxFile, color, onLoaded }) => {
  const map = useMap();
  useEffect(() => {
    if (!gpxFile) return;
    // Adiciona apenas a linha do percurso, sem NENHUM marcador ou popup automático
    let gpxLayer = new window.L.GPX(gpxFile, {
      async: true,
      polyline_options: { color, weight: 4, opacity: 0.8 },
      marker_options: {
        startIconUrl: null,
        endIconUrl: null,
        wptIconUrls: {},
        addStartEnd: false,
        addWaypoints: false
      },
      // Remove popups automáticos
      addWaypoints: false,
      addStartEnd: false
    })
      .on('loaded', function(e) {
        if (onLoaded) onLoaded(e);
      })
      .addTo(map);
    // Remove eventuais popups automáticos
    gpxLayer.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });
    return () => { map.removeLayer(gpxLayer); };
  }, [gpxFile, color, map]);
  return null;
};

// Componente para controlar eventos do mapa (zoom)
const MapEvents = ({ onZoom }) => {
  useMapEvents({
    zoomend: (e) => {
      onZoom(e.target.getZoom());
    }
  });
  return null;
};

// Component that invalidates map size once mounted and logs some diagnostics
const MapDiagnostics = ({ onReadyLog }) => {
  const map = useMap();
  useEffect(() => {
    try {
      // force Leaflet to recalc sizes (fixes tiles not filling container)
      // call twice with a small delay to handle CSS transitions/layout shifts
      map.invalidateSize();
      setTimeout(() => map.invalidateSize(), 120);
      const size = map.getSize ? map.getSize() : null;
      const bounds = map.getBounds ? map.getBounds().toBBoxString() : null;
      console.info('Mapa: invalidateSize called; size=', size, 'bounds=', bounds);
      // diagnostics: check tile imgs inside the container
      try {
        const container = map.getContainer();
        const tiles = container ? container.querySelectorAll('img.leaflet-tile') : [];
        // Fallback para ícones de marcador quebrados: se algum <img.leaflet-marker-icon>
        // estiver com naturalWidth === 0 (erro de carregamento), substituímos a src
        // pela imagem padrão do Leaflet (markerIcon) para garantir visibilidade.
        try {
          const markerImgs = container ? container.querySelectorAll('img.leaflet-marker-icon') : [];
          Array.from(markerImgs).forEach((img) => {
            if (!img) return;
            // attach a one-time handler to recover from broken images
            if (!img.dataset._fw) {
              img.dataset._fw = '1';
              img.addEventListener('error', () => {
                try {
                  img.src = markerIcon;
                  img.style.opacity = 1;
                } catch (e) { /* ignore */ }
              });
              // if already broken, trigger fallback
              if (img.complete && img.naturalWidth === 0) {
                const ev = new Event('error');
                img.dispatchEvent(ev);
              }
            }
          });
        } catch (e) {
          // non-critical
        }
        const tileInfos = Array.from(tiles).slice(0, 12).map(t => ({ src: t.src, rect: t.getBoundingClientRect(), display: getComputedStyle(t).display, opacity: getComputedStyle(t).opacity }));
        console.info('Mapa: tile count=', tiles.length, 'sample tiles=', tileInfos);
      } catch (e) {
        console.warn('Mapa: tile diagnostic failed', e);
      }
      if (onReadyLog) onReadyLog({ size, bounds });
    } catch (e) {
      console.warn('Mapa: diagnostic invalidateSize failed', e);
    }
  }, [map, onReadyLog]);
  return null;
};

// Quando os pontos da trilha mudam, força recalculo de layout e garante que
// as polylines/panels fiquem na frente para evitar que tiles (por algum estilo)
// acabem sobrepondo as linhas durante reflows/zooms.
const TrackRefresh = ({ trackPoints }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    try {
      // invalida e chama de novo com delay para garantir recalculo do layout
      map.invalidateSize();
      setTimeout(() => map.invalidateSize(), 120);
      // tenta trazer todas as polylines para frente
      map.eachLayer((layer) => {
        try {
          if (layer instanceof L.Polyline) {
            if (typeof layer.bringToFront === 'function') layer.bringToFront();
          }
        } catch (e) { /* ignore */ }
      });
    } catch (e) {
      // nada crítico - apenas log curto para debug
      console.debug('TrackRefresh: falha ao forçar repaint', e);
    }
  }, [map, trackPoints]);
  return null;
};

// Nota: remoção de EnsureTrilhasPane e useVerifiedIconBase — essas tentativas
// causaram regressões visuais (mapa branco) em alguns ambientes. Mantemos
// o TrackRefresh (repaint/bringToFront) que melhora estabilidade das linhas.

// Recentra o mapa quando a posição alvo muda
const CenterOn = ({ position, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (!position) return;
    // Use non-animated setView to avoid animation-related rendering conflicts
    // that can hide overlays during transitions.
    map.setView(position, zoom ?? 13, { animate: false });
  }, [position, zoom, map]);
  return null;
};

const Mapa = ({ apiTrilhas = [], disableProbes = false }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [startEnd, setStartEnd] = useState({start: null, end: null});
  const [trackPoints, setTrackPoints] = useState([]);
  const [gpxFallbackFile, setGpxFallbackFile] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [favorited, setFavorited] = useState([]);
  const [tileError, setTileError] = useState(false);
  // Default to ESRI imagery (similar visual to Google Earth). If ESRI
  // is unavailable tileError handlers will fallback to OSM.
  const [tileProvider, setTileProvider] = useState('esri');
  const [mapKey, setMapKey] = useState(0);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Base efetiva escolhida em runtime (pode diferir do default se o deploy criou uma pasta extra)
  // Inicializa como null para a probe automática detectar a base correta em runtime.
  const [selectedMarkersBase, setSelectedMarkersBase] = useState(null);
  const [selectedIconsBase, setSelectedIconsBase] = useState(null);
  const [ready, setReady] = useState(false);
  // Nota: não usamos mais verifiedIconsBase aqui — mantemos selectedIconsBase
  // e o fallback defaultMarkersIconsBase para construir URLs de ícone.

  // quando a API fornece trilhas, usamos esse array como fonte primária
  // caso contrário usamos o array local declarado neste arquivo (fallback)
  const sourceTrilhas = (apiTrilhas && apiTrilhas.length > 0) ? apiTrilhas : trilhas;
  // trilhas com posição (pos). Se a API não fornecer pos, tentamos extrair do GPX
  const [trilhasComPos, setTrilhasComPos] = useState(() => sourceTrilhas.map(t => ({ ...t })));
  // ref para lembrar o último GPX carregado e evitar refetchs redundantes
  const lastGpxFileRef = React.useRef(null);

  // Gera uma URL absoluta para icon (colapsando duplicações como /Greenlandpage/Greenlandpage/)
  const makeIconAbsoluteUrl = (file) => {
    const baseRaw = selectedIconsBase || defaultMarkersIconsBase || '/markers_icons/';
    // collapse repetidos '/Greenlandpage/' segmentos
    let base = String(baseRaw).replace(/(\/Greenlandpage\/)+/g, '/Greenlandpage/').replace(/\/+/g, '/');
    if (!base.endsWith('/')) base += '/';
    // Se já começar com protocolo, retorna pronto
    if (/^https?:\/\//i.test(base)) return base + file;
    // Gera absoluta com origin para evitar caminhos relativos quebrados
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    if (!base.startsWith('/')) base = '/' + base;
    return origin + base + file;
  };

  // Testa os candidatos (HEAD) e escolhe o primeiro que responde 200.
  // Agora rodamos a probe antes de renderizar o mapa (evita fetchs iniciais com base errada).
  useEffect(() => {
    if (disableProbes) {
      // Se probes estiverem desabilitados (ex: ambiente onde queremos evitar muitos fetchs),
      // inicializamos com os fallbacks conhecidos e marcamos pronto imediatamente.
      setSelectedMarkersBase(defaultMarkersBase);
      setSelectedIconsBase(defaultMarkersIconsBase);
      setReady(true);
      return;
    }
    let mounted = true;
    // probe utilizará os helpers `normalizeBase` e `makeAbsoluteUrl` definidos no escopo do módulo

    const probe = async () => {
      try {
        // Checa cada candidato tentando obter o arquivo e verificando se o conteúdo parece um GPX válido
        let foundMarkers = null;
        for (const cRaw of markersBaseCandidates) {
          const c = normalizeBase(cRaw);
          try {
            const url = makeAbsoluteUrl(c, 'file1.gpx');
            const res = await fetch(url);
            if (!res.ok) continue;
            const text = await res.text();
            if (!mounted) break;
            if (typeof text === 'string' && (text.includes('<trkpt') || text.includes('<gpx')) ) {
              foundMarkers = normalizeBase(c);
              console.debug('probe: selected markers base candidate ->', foundMarkers);
              break;
            }
          } catch (e) {
            // ignore per-candidate errors
          }
        }

        // Checa ícones por GET simples (alguns servidores não respondem a HEAD)
        let foundIcons = null;
        for (const cRaw of markersIconsBaseCandidates) {
          const c = normalizeBase(cRaw);
          try {
            const url = makeAbsoluteUrl(c, 'location-pin.png');
            const res = await fetch(url, { method: 'GET' });
            const ct = res && res.headers ? (res.headers.get('content-type') || '') : '';
            // Aceitamos apenas respostas que parecem realmente imagens
            if (res && res.ok && /image\//i.test(ct) && mounted) {
              foundIcons = normalizeBase(c);
              console.info('probe: selected icons base candidate ->', foundIcons);
              break;
            }
          } catch (e) { /* ignore */ }
        }

        // Se nenhum candidato foi encontrado, defina um fallback provável
        if (mounted) {
          const finalMarkers = foundMarkers || normalizeBase(markersBaseCandidates[0]);
          const finalIcons = foundIcons || normalizeBase(markersIconsBaseCandidates[0]);
          setSelectedMarkersBase(finalMarkers);
          setSelectedIconsBase(finalIcons);
          if (!foundMarkers) console.info('probe: nenhum candidato válido encontrado para markers; usando fallback ->', finalMarkers);
          if (!foundIcons) console.info('probe: nenhum candidato válido encontrado para icons; usando fallback ->', finalIcons);
        }
        // logs para depuração local
        console.debug('Selected markers base (final):', foundMarkers, 'selected icons base (final):', foundIcons);
      } finally {
        if (mounted) setReady(true);
      }
    };
    probe();
    return () => { mounted = false; };
  }, [disableProbes]);

  // Quando a fonte de trilhas (apiTrilhas) mudar, inicializa trilhasComPos e
  // tenta extrair posição inicial (start) do GPX para trilhas que não tenham pos.
  useEffect(() => {
    let mounted = true;
    setTrilhasComPos(sourceTrilhas.map(t => ({ ...t })));
    sourceTrilhas.forEach((t, idx) => {
      if (t.pos && Array.isArray(t.pos) && t.pos.length === 2) return;
      const gpxUrl = t.url || t.gpx || '';
      if (!gpxUrl) return;
      getStartEndFromGPX(gpxUrl, (start, end) => {
        if (!mounted) return;
        if (start && start.length === 2) {
          setTrilhasComPos(prev => {
            const copy = prev.slice();
            copy[idx] = { ...copy[idx], pos: start };
            return copy;
          });
        }
      });
    });
    return () => { mounted = false; };
  }, [apiTrilhas]);

  // Test availability of ESRI imagery tiles (use Image element to avoid CORS issues with fetch)
  useEffect(() => {
    // Only try to probe ESRI in production; keep OSM default in dev for reliability
    if (!import.meta.env.PROD) return;
    let mounted = true;
    try {
      const img = new Image();
      // sample tile coordinates (z/y/x)
      const sample = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/300/400';
      img.onload = () => { if (mounted) { setTileProvider('esri'); setTileError(false); console.log('Tile probe: ESRI imagery available'); } };
      img.onerror = () => { if (mounted) { setTileProvider('osm'); setTileError(true); console.warn('Tile probe: ESRI imagery not available, using OSM'); } };
      img.src = sample;
    } catch (e) {
      console.warn('Tile probe error', e);
      setTileProvider('osm');
      setTileError(true);
    }
    return () => { mounted = false; };
  }, []);

  // Funções para navegação do carrossel
  const handlePrev = () => {
    setCarouselIndex((prev) => (prev === 0 ? sourceTrilhas.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setCarouselIndex((prev) => (prev === sourceTrilhas.length - 1 ? 0 : prev + 1));
  };

  // Padroniza dificuldade para evitar bugs de cor
  const trilhasPadronizadas = sourceTrilhas.map(t => ({
    ...t,
    label: sanitizeText(t.label || t.title || ''),
    descricao: sanitizeText(t.description || t.descricao || ''),
    difficulty: (t.difficulty === 'Moderada' ? 'Moderado' : t.difficulty) || t.difficulty || ''
  }));
  const trilhaSelecionada = trilhasPadronizadas[carouselIndex] || trilhasPadronizadas[0] || {};
  const isFav = favorited.some(fav => fav.id === trilhaSelecionada.label);

  useEffect(() => {
    if (!ready) return; // espera a probe terminar
    // Se a trilha selecionada vier com URL absoluta (da API), usamos ela.
    // Caso contrário, mantemos o comportamento antigo (arquivo fileN.gpx no public folder)
    const candidateGpx = (trilhaSelecionada && (trilhaSelecionada.url || trilhaSelecionada.gpx)) || null;
    let gpxFile = null;
    if (candidateGpx && /^https?:\/\//i.test(candidateGpx)) {
      gpxFile = candidateGpx;
    } else {
      const baseForGpx = (selectedMarkersBase || defaultMarkersBase);
      gpxFile = `${baseForGpx}file${carouselIndex+1}.gpx`;
    }

    // Evita refetch se já carregamos esse mesmo arquivo e os pontos já estão presentes
    if (lastGpxFileRef.current === gpxFile && trackPoints && trackPoints.length > 0) {
      // nada a fazer — já temos os pontos
      console.debug && console.debug('Mapa: GPX já carregado, pulando refetch para', gpxFile);
      return;
    }

    lastGpxFileRef.current = gpxFile;

    getStartEndFromGPX(gpxFile, (start, end) => setStartEnd({start, end}));
    getTrackPointsFromGPX(gpxFile, (points) => {
      // reduzir verbosidade: apenas debug quando houver mudança real
      try {
        const n = points ? points.length : 0;
        console.debug && console.debug('GPX fetch result for', gpxFile, 'points:', n);
        if (points && points.length > 0) {
          // atualiza somente se diferente (evita rerenders em loop)
          setTrackPoints(prev => {
            if (!prev || prev.length !== points.length) return points;
            // compara superficialmente primeiros e últimos
            if (prev[0] && points[0] && (prev[0][0] !== points[0][0] || prev[0][1] !== points[0][1])) return points;
            return prev;
          });
          setGpxFallbackFile(null);
        } else {
          // GPX não retornou pontos úteis via parser.
          // NÃO ativamos o fallback `leaflet-gpx` para evitar conflitos conhecidos
          // que causavam o mapa ficar branco ou o GPX desaparecer.
          console.info('GPX parser returned 0 points, not using leaflet-gpx fallback for', gpxFile);
          setGpxFallbackFile(null);
          setTrackPoints([]);
        }
      } catch (e) {
        console.warn('Erro tratanto resultado GPX', e);
      }
    });
  }, [carouselIndex, selectedMarkersBase, ready, trilhaSelecionada]);

  useEffect(() => {
    // Atualiza favoritos ao trocar trilha
    const favs = localStorage.getItem('favorites');
    setFavorited(favs ? JSON.parse(favs) : []);
    const syncUser = () => {
      const saved = localStorage.getItem('user');
      setUser(saved ? JSON.parse(saved) : null);
    };
    window.addEventListener('storage', syncUser);
    window.addEventListener('userChanged', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('userChanged', syncUser);
    };
  }, []);

  // Função para cor baseada na dificuldade
  const getCor = (dif) => dif === 'Fácil' ? '#43A047' : dif === 'Moderado' ? '#FFD600' : '#E53935';

  const handleFavorite = (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Você precisa estar logado para favoritar trilhas!');
      return;
    }
    let favs = localStorage.getItem('favorites');
    favs = favs ? JSON.parse(favs) : [];
    if (isFav) {
      favs = favs.filter(fav => fav.id !== trilhaSelecionada.label);
    } else {
      favs.push({ id: trilhaSelecionada.label, ...trilhaSelecionada });
    }
    localStorage.setItem('favorites', JSON.stringify(favs));
    setFavorited(favs);
  };

  if (!ready) {
    return (
      <MapWrapper>
        <MapTitle>Carregando mapa…</MapTitle>
        <div style={{padding:40, textAlign:'center'}}>Verificando localização dos recursos. Aguarde um instante.</div>
      </MapWrapper>
    );
  }

  return (
    <MapWrapper>
      <MapTitle>Mapa Interativo das Trilhas de Maricá</MapTitle>
      <MapFlex>
        <CarouselWrapper>
          <CarouselNav>
            <CarouselBtn onClick={handlePrev} $cor={getCor(trilhasPadronizadas[carouselIndex].difficulty)}>&lt;</CarouselBtn>
            <CarouselBtn onClick={handleNext} $cor={getCor(trilhasPadronizadas[carouselIndex].difficulty)}>&gt;</CarouselBtn>
          </CarouselNav>
          <CarouselCard key={carouselIndex} $cor={getCor(trilhasPadronizadas[carouselIndex].difficulty)} style={{position:'relative'}}>
            {user && (
              <FavoriteButton onClick={handleFavorite} $isFavorite={isFav} title="" >
                <i className={`fa${isFav ? 's' : 'r'} fa-star`}></i>
                <Tooltip className="tooltip">{isFav ? 'Remover dos favoritos' : 'Favoritar'}</Tooltip>
              </FavoriteButton>
            )}
            <InfoRow style={{fontWeight:700, fontSize:'1.15rem', paddingRight:32}}><FaMountain/> {trilhasPadronizadas[carouselIndex]?.label}</InfoRow>
            <InfoRow><FaRoad/> Distância: <span style={{fontWeight:600}}>{trilhasPadronizadas[carouselIndex]?.distance ? parseFloat(trilhasPadronizadas[carouselIndex].distance).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : ''} m</span></InfoRow>
            <InfoRow><FaClock/> Duração: <span style={{fontWeight:600}}>{trilhasPadronizadas[carouselIndex]?.duration} min</span></InfoRow>
            <InfoRow><FaExchangeAlt/> Tipo: <span style={{fontWeight:600}}>{trilhasPadronizadas[carouselIndex]?.routetype === 'ida_volta' ? 'Ida e Volta' : 'Ida'}</span></InfoRow>
            <InfoRow><FaArrowUp/> Altitude: <span style={{fontWeight:600}}>{trilhasPadronizadas[carouselIndex]?.elevation} m</span></InfoRow>
            <InfoRow>Dificuldade: <span style={{fontWeight:600, color: getCor(trilhasPadronizadas[carouselIndex]?.difficulty)}}>{trilhasPadronizadas[carouselIndex]?.difficulty}</span></InfoRow>
            <InfoRow style={{fontSize:'0.98rem', opacity:0.85}}>{sanitizeText(trilhasPadronizadas[carouselIndex]?.descricao)}</InfoRow>
          </CarouselCard>
          <div style={{display:'flex', justifyContent:'center', gap:4, marginTop:6}}>
            {trilhasPadronizadas.map((t, idx) => (
              <CarouselBtn
                key={t.label}
                $active={carouselIndex===idx}
                $cor={getCor(t.difficulty)}
                style={{width:18, height:18, borderRadius:'50%', padding:0, fontSize:0, border: carouselIndex===idx?'2px solid #222':'none'}}
                onClick={()=>setCarouselIndex(idx)}
              >
                &nbsp;
              </CarouselBtn>
            ))}
          </div>
        </CarouselWrapper>
        <div style={{flex: 1, minWidth: 320, minHeight: 420, height: 420, position: 'relative'}}>
          <StyledMapContainer
            center={(trilhasComPos && trilhasComPos[carouselIndex] && trilhasComPos[carouselIndex].pos) ? trilhasComPos[carouselIndex].pos : trilhaSelecionada.pos}
            zoom={13}
            minZoom={11}
            maxZoom={17}
            zoomSnap={0.5}
            zoomDelta={0.5}
            scrollWheelZoom={true}
            doubleClickZoom={false}
            
            style={{height: '100%', width: '100%', minHeight: 420, minWidth: 320, zIndex: 2, background: '#e5e5e5'}}
            zoomAnimation={true}
          >
            {/* Diagnostics: invalidate size on mount and log tile events */}
            <MapDiagnostics onReadyLog={(d) => console.debug('map diagnostics', d)} />
            <TrackRefresh trackPoints={trackPoints} />
            <MapEvents onZoom={setZoomLevel} />
            <CenterOn position={startEnd.start || trilhaSelecionada.pos} zoom={13} />
            {/* Tile server: prefer Esri imagery in production, fallback to OpenStreetMap in dev or on error */}
            <TileLayer
              key={mapKey}
              url={
                tileProvider === 'esri' && !tileError
                  ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
              attribution={tileProvider === 'esri' && !tileError ? "Tiles © Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community" : "© OpenStreetMap contributors"}
              updateWhenIdle={true}
              updateWhenZooming={true}
              updateInterval={300}
              keepBuffer={3}
              maxZoom={17}
              eventHandlers={{
                tileerror: (ev) => {
                  console.warn('Tile load error detected for provider', tileProvider, ', switching to fallback tiles', ev);
                  setTileError(true);
                },
                tileload: (ev) => {
                  // log a few tile load events to ensure tiles are actually being fetched
                  console.debug('Tile loaded', ev && ev.tile && ev.tile.src);
                }
                ,
                // Quando todas as tiles do TileLayer estiverem carregadas para a vista
                // atual, traz as polylines para frente. Usamos ev.target._map para
                // recuperar o mapa associado ao TileLayer.
                load: (ev) => {
                  try {
                    const m = ev && ev.target && ev.target._map;
                    if (m) {
                      m.eachLayer((layer) => {
                        try {
                          if (layer instanceof L.Polyline && typeof layer.bringToFront === 'function') {
                            layer.bringToFront();
                          }
                        } catch (e) { /* ignore per-layer errors */ }
                      });
                    }
                  } catch (e) {
                    console.debug('TileLayer load handler failed to bring polylines to front', e);
                  }
                }
              }}
            />
            {tileError && (
              <div style={{position:'absolute',left:12,top:12,zIndex:999,padding:10,background:'rgba(255,255,255,0.95)',borderRadius:8,boxShadow:'0 2px 8px rgba(0,0,0,0.12)'}}>
                <div style={{fontWeight:700,color:'#333',marginBottom:6}}>Problema ao carregar camadas do mapa</div>
                <div style={{fontSize:13,opacity:0.9,marginBottom:8}}>Trocando para camadas de mapa alternativas. Se o problema continuar, verifique sua conexão ou bloqueios de CORS.</div>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn" onClick={() => { setTileError(false); setMapKey(k => k+1); }}>Tentar novamente</button>
                  <button className="btn btn-outline" onClick={() => { setTileProvider('osm'); setTileError(false); setMapKey(k => k+1); }}>Forçar fallback (OSM)</button>
                </div>
              </div>
            )}

            {/* Pequeno controle para alternar provedores de tiles (útil para desenvolvimento) */}
            <div style={{position:'absolute', right:12, top:12, zIndex:999}}>
              <div style={{display:'flex', gap:6}}>
                <button className="btn" onClick={() => { setTileProvider('esri'); setTileError(false); setMapKey(k => k+1); }} style={{padding:'6px 8px', fontSize:12}}>Imagery</button>
                <button className="btn btn-outline" onClick={() => { setTileProvider('osm'); setTileError(false); setMapKey(k => k+1); }} style={{padding:'6px 8px', fontSize:12}}>OSM</button>
              </div>
            </div>
            {/* Linha do percurso real da trilha (GPX) */}
            {trackPoints.length > 1 && (
              <Polyline positions={trackPoints} pathOptions={{ color: '#1976d2', weight: 4, opacity: 0.8 }} />
            )}
            {/* Fallback desabilitado: o uso do plugin `leaflet-gpx` causava conflitos
                de renderização (mapa branco / GPX sumindo). Mantemos o fallback
                no código apenas para referência, mas NUNCA o ativamos em runtime.
                A renderização agora depende exclusivamente do parser customizado
                (`getTrackPointsFromGPX`) que popula `trackPoints`.
            */}
            {/* Linha entre início e fim (opcional, pode remover se quiser só o GPX) */}
            {startEnd.start && startEnd.end && (
              <Polyline
                positions={[startEnd.start, startEnd.end]}
                pathOptions={{ color: '#43A047', weight: 5, dashArray: '8 8', opacity: 0.7 }}
              />
            )}
            {/* Marcador de início: preferir startEnd.start (do GPX), senão fallback para pos da trilha */}
            {(startEnd.start || (trilhaSelecionada && trilhaSelecionada.pos)) && (
                <Marker
                position={startEnd.start || trilhaSelecionada.pos}
                icon={L.icon({ iconUrl: makeIconAbsoluteUrl('location-pin.png'), iconSize: [44, 56], iconAnchor: [22, 52], popupAnchor: [0, -40], shadowUrl: markerShadow, shadowSize: [44, 56] })}
              >
                <Popup>
                  <div style={{textAlign:'center'}}>
                    <strong>Início:</strong> {sanitizeText(trilhasPadronizadas[carouselIndex]?.label)}<br/>
                    <span style={{fontSize:'0.95em', opacity:0.8}}>{sanitizeText(trilhasPadronizadas[carouselIndex]?.descricao)}</span>
                  </div>
                </Popup>
              </Marker>
            )}
            {/* Marcador de fim: preferir end do GPX, senão último ponto do trackPoints (se houver) */}
            {((startEnd.end) || (trackPoints && trackPoints.length > 0)) && (
              <Marker
                position={startEnd.end || (trackPoints && trackPoints.length > 0 ? trackPoints[trackPoints.length - 1] : null)}
                icon={L.icon({ iconUrl: makeIconAbsoluteUrl('flag.png'), iconSize: [44, 56], iconAnchor: [22, 52], popupAnchor: [0, -40], shadowUrl: markerShadow, shadowSize: [44, 56] })}
              >
                <Popup>
                  <div style={{textAlign:'center'}}>
                    <strong>Fim:</strong> {sanitizeText(trilhasPadronizadas[carouselIndex]?.label)}<br/>
                    <span style={{fontSize:'0.95em', opacity:0.8}}>{sanitizeText(trilhasPadronizadas[carouselIndex]?.descricao)}</span>
                  </div>
                </Popup>
              </Marker>
            )}
            {/* Marcadores das outras trilhas (cinza e menor para não poluir) */}
            {trilhasPadronizadas.map((trilha, idx) => (
              idx !== carouselIndex && (
                <Marker
                  key={trilha.label || trilha.id || idx}
                  position={(trilhasComPos && trilhasComPos[idx] && trilhasComPos[idx].pos) ? trilhasComPos[idx].pos : trilha.pos}
                  icon={L.icon({
                    iconUrl: makeIconAbsoluteUrl('location-pin.png'),
                    iconSize: [28, 36],
                    iconAnchor: [14, 34],
                    popupAnchor: [0, -30],
                    shadowUrl: markerShadow,
                    shadowSize: [28, 36],
                    className: 'marker-outro'
                  })}
                >
                  <Popup>
                    <strong>{trilha.label}</strong><br/>
                    Distância: {trilha.distance ? parseFloat(trilha.distance).toFixed(2) : ''} m<br/>
                    Dificuldade: <span style={{color: getCor(trilha.difficulty), fontWeight: 600}}>{trilha.difficulty}</span><br/>
                    Tempo estimado: {trilha.duration} min<br/>
                    Tipo: {trilha.routetype === 'ida_volta' ? 'Ida e Volta' : 'Ida'}<br/>
                    Elevação: {trilha.elevation} m<br/>
                    <span style={{fontSize: '0.95em'}}>{trilha.descricao}</span>
                  </Popup>
                </Marker>
              )
            ))}
            {startEnd.start && startEnd.end && (
              <Polyline
                positions={[startEnd.start, startEnd.end]}
                pathOptions={{ color: '#43A047', weight: 5, dashArray: '8 8', opacity: 0.7 }}
              />
            )}
          </StyledMapContainer>
        </div>
      </MapFlex>
    </MapWrapper>
  );
};

export default Mapa;
