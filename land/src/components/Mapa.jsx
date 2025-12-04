import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { FaMountain, FaRoad, FaClock, FaArrowUp, FaExchangeAlt } from 'react-icons/fa';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const computeSiteBase = () => {
  if (typeof window !== 'undefined') {
    const p = window.location.pathname;
    if (p.includes('/Greenlandpage/')) {
      const idx = p.indexOf('/Greenlandpage/');
      return p.slice(0, idx + '/Greenlandpage/'.length);
    }
  }
  return import.meta.env.BASE_URL || '/';
};

const SITE_BASE = computeSiteBase();

const markersBaseCandidates = import.meta.env.PROD
  ? [`${SITE_BASE}Greenlandpage/markers/`, `${SITE_BASE}markers/`]
  : [`${SITE_BASE}Greenlandpage/markers/`, `/Greenlandpage/markers/`, `${SITE_BASE}markers/`, '/markers/'];
const markersIconsBaseCandidates = import.meta.env.PROD
  ? [`${SITE_BASE}Greenlandpage/markers_icons/`, `${SITE_BASE}markers_icons/`]
  : [`${SITE_BASE}Greenlandpage/markers_icons/`, `/Greenlandpage/markers_icons/`, `${SITE_BASE}markers_icons/`, '/markers_icons/'];

const defaultMarkersBase = markersBaseCandidates[0];
const defaultMarkersIconsBase = import.meta.env.DEV ? '/Greenlandpage/Greenlandpage/markers_icons/' : markersIconsBaseCandidates[0];

const normalizeBase = (c) => {
  if (!c) return c;
  let p = String(c).replace(/\/+/g, '/');
  if (!p.endsWith('/')) p = p + '/';
  return p;
};

const makeAbsoluteUrl = (base, file) => {
  if (!base) return file;
  const b = normalizeBase(base);
  if (/^https?:\/\//.test(b)) return b + file;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return origin + (b.startsWith('/') ? b : '/' + b) + file;
};

// Função para escolher o ícone do marcador conforme a dificuldade
function getCustomIcon(dificuldade) {
  let iconUrl;
  if (import.meta.env.DEV) {
     iconUrl = `/Greenlandpage/Greenlandpage/markers_icons/location-pin.png`;
  } else {
    const collapsed = String(defaultMarkersIconsBase).replace(/(\/Greenlandpage\/)+/g, '/Greenlandpage/').replace(/\/+/g, '/');
    iconUrl = `${collapsed}location-pin.png`;
  }

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

function getStartEndFromGPX(gpxFile, callback) {
  fetch(gpxFile)
    .then(res => {
      if (!res.ok) {
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
        let trkpts = xml.getElementsByTagName('trkpt');
        if (!trkpts || trkpts.length === 0) {
          trkpts = xml.getElementsByTagNameNS('http://www.topografix.com/GPX/1/1', 'trkpt') || [];
        }
        if (trkpts && trkpts.length > 1) {
          const sLat = parseFloat(trkpts[0].getAttribute('lat'));
          const sLon = parseFloat(trkpts[0].getAttribute('lon'));
          const eLat = parseFloat(trkpts[trkpts.length-1].getAttribute('lat'));
          const eLon = parseFloat(trkpts[trkpts.length-1].getAttribute('lon'));

          const isValid = (l, o) => !isNaN(l) && !isNaN(o) && Math.abs(l) <= 90 && Math.abs(o) <= 180;

          if (isValid(sLat, sLon) && isValid(eLat, eLon)) {
             const start = [sLat, sLon];
             const end = [eLat, eLon];
             console.log('GPX OK:', gpxFile, 'start', start, 'end', end, 'trkpt count', trkpts.length);
             callback(start, end);
          } else {
             console.warn('GPX start/end coordinates invalid:', gpxFile);
             callback(null, null);
          }
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
          if (!isNaN(lat) && !isNaN(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
             points.push([lat, lon]);
          } else {
             console.warn('Skipping invalid GPX point:', lat, lon);
          }
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
  z-index: 1;
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

const MapEvents = ({ onZoom }) => {
  useMapEvents({
    zoomend: (e) => {
      onZoom(e.target.getZoom());
    }
  });
  return null;
};

const MapDiagnostics = ({ onReadyLog }) => {
  const map = useMap();
  useEffect(() => {
    try {
      map.invalidateSize();
      setTimeout(() => map.invalidateSize(), 120);
      const size = map.getSize ? map.getSize() : null;
      const bounds = map.getBounds ? map.getBounds().toBBoxString() : null;
      console.info('Mapa: invalidateSize called; size=', size, 'bounds=', bounds);
      try {
        const container = map.getContainer();
        const tiles = container ? container.querySelectorAll('img.leaflet-tile') : [];
        try {
          const markerImgs = container ? container.querySelectorAll('img.leaflet-marker-icon') : [];
          Array.from(markerImgs).forEach((img) => {
            if (!img) return;
            if (!img.dataset._fw) {
              img.dataset._fw = '1';
              img.addEventListener('error', () => {
                try {
                  img.src = markerIcon;
                  img.style.opacity = 1;
                } catch (e) { /* ignore */ }
              });
              if (img.complete && img.naturalWidth === 0) {
                const ev = new Event('error');
                img.dispatchEvent(ev);
              }
            }
          });
        } catch (e) {
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

const CenterOn = ({ position, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (!position) return;
    map.setView(position, zoom ?? 13, { animate: false });
  }, [position, zoom, map]);
  return null;
};

const Mapa = ({ apiTrilhas, disableProbes = false }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [startEnd, setStartEnd] = useState({start: null, end: null});
  const [trackPoints, setTrackPoints] = useState([]);
  const [gpxFallbackFile, setGpxFallbackFile] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [favorited, setFavorited] = useState([]);
  const [tileError, setTileError] = useState(false);
  const [tileProvider, setTileProvider] = useState('osm');
  const [mapKey, setMapKey] = useState(0);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedMarkersBase, setSelectedMarkersBase] = useState(null);
  const [selectedIconsBase, setSelectedIconsBase] = useState(null);
  const [ready, setReady] = useState(false);

  const sourceTrilhas = (apiTrilhas && apiTrilhas.length > 0) ? apiTrilhas : trilhas;
  const [trilhasComPos, setTrilhasComPos] = useState(() => sourceTrilhas.map(t => ({ ...t })));
  const lastGpxFileRef = React.useRef(null);

  const makeIconAbsoluteUrl = (file) => {
    if (import.meta.env.DEV) {
      return `/Greenlandpage/Greenlandpage/markers_icons/${file}`;
    }
    
    const baseRaw = selectedIconsBase || defaultMarkersIconsBase || '/markers_icons/';
    let base = String(baseRaw).replace(/(\/Greenlandpage\/)+/g, '/Greenlandpage/').replace(/\/+/g, '/');
    if (!base.endsWith('/')) base += '/';
    if (/^https?:\/\//i.test(base)) return base + file;
    
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    if (!base.startsWith('/')) base = '/' + base;
    return origin + base + file;
  };

  useEffect(() => {
    if (disableProbes) {
      setSelectedMarkersBase(defaultMarkersBase);
      setSelectedIconsBase(defaultMarkersIconsBase);
      setReady(true);
      return;
    }
    let mounted = true;

    const probe = async () => {
      try {
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
          }
        }

        let foundIcons = null;
        for (const cRaw of markersIconsBaseCandidates) {
          const c = normalizeBase(cRaw);
          try {
            const url = makeAbsoluteUrl(c, 'location-pin.png');
            const res = await fetch(url, { method: 'GET' });
            const ct = res && res.headers ? (res.headers.get('content-type') || '') : '';
            if (res && res.ok && /image\//i.test(ct) && mounted) {
              foundIcons = normalizeBase(c);
              console.info('probe: selected icons base candidate ->', foundIcons);
              break;
            }
          } catch (e) { /* ignore */ }
        }

        if (mounted) {
          const finalMarkers = foundMarkers || normalizeBase(markersBaseCandidates[0]);
          const finalIcons = foundIcons || normalizeBase(markersIconsBaseCandidates[0]);
          setSelectedMarkersBase(finalMarkers);
          setSelectedIconsBase(finalIcons);
          if (!foundMarkers) console.info('probe: nenhum candidato válido encontrado para markers; usando fallback ->', finalMarkers);
          if (!foundIcons) console.info('probe: nenhum candidato válido encontrado para icons; usando fallback ->', finalIcons);
        }
        console.debug('Selected markers base (final):', foundMarkers, 'selected icons base (final):', foundIcons);
      } finally {
        if (mounted) setReady(true);
      }
    };
    probe();
    return () => { mounted = false; };
  }, [disableProbes]);

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

  useEffect(() => {
    if (!import.meta.env.PROD) return;
    let mounted = true;
    try {
      const img = new Image();
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

  const handlePrev = () => {
    setCarouselIndex((prev) => (prev === 0 ? sourceTrilhas.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setCarouselIndex((prev) => (prev === sourceTrilhas.length - 1 ? 0 : prev + 1));
  };

  const trilhasPadronizadas = sourceTrilhas.map(t => ({
    ...t,
    label: sanitizeText(t.label || t.title || ''),
    descricao: sanitizeText(t.description || t.descricao || ''),
    difficulty: (t.difficulty === 'Moderada' ? 'Moderado' : t.difficulty) || t.difficulty || ''
  }));
  const trilhaSelecionada = trilhasPadronizadas[carouselIndex] || trilhasPadronizadas[0] || {};
  const isFav = favorited.some(fav => fav.id === trilhaSelecionada.label);

  useEffect(() => {
    if (!ready) return;
    const candidateGpx = (trilhaSelecionada && (trilhaSelecionada.url || trilhaSelecionada.gpx)) || null;
    let gpxFile = null;
    if (candidateGpx && /^https?:\/\//i.test(candidateGpx)) {
      gpxFile = candidateGpx;
    } else {
      if (import.meta.env.DEV) {
        gpxFile = `/Greenlandpage/Greenlandpage/markers/file${carouselIndex+1}.gpx`;
      } else {
        const baseForGpx = (selectedMarkersBase || defaultMarkersBase);
        gpxFile = `${baseForGpx}file${carouselIndex+1}.gpx`;
      }
    }

    if (lastGpxFileRef.current === gpxFile && trackPoints && trackPoints.length > 0) {
      console.debug && console.debug('Mapa: GPX já carregado, pulando refetch para', gpxFile);
      return;
    }

    lastGpxFileRef.current = gpxFile;

    console.debug && console.debug('Mapa effect: loading GPX', { gpxFile, carouselIndex, selectedMarkersBase });

    getStartEndFromGPX(gpxFile, (start, end) => setStartEnd({start, end}));
    getTrackPointsFromGPX(gpxFile, (points) => {
      try {
        const n = points ? points.length : 0;
        console.debug && console.debug('GPX fetch result for', gpxFile, 'points:', n);
        if (points && points.length > 0) {
          setTrackPoints(prev => {
            if (!prev || prev.length !== points.length) return points;
            if (prev[0] && points[0] && (prev[0][0] !== points[0][0] || prev[0][1] !== points[0][1])) return points;
            return prev;
          });
          setGpxFallbackFile(null);
        } else {
          console.info('GPX parser returned 0 points, not using leaflet-gpx fallback for', gpxFile);
          setGpxFallbackFile(null);
          setTrackPoints([]);
        }
      } catch (e) {
        console.warn('Erro tratanto resultado GPX', e);
      }
    });
  }, [carouselIndex, selectedMarkersBase, ready]);

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
            
            style={{height: '100%', width: '100%', minHeight: 420, minWidth: 320, zIndex: 0}}
            zoomAnimation={true}
          >
            {/* Diagnostics: invalidate size on mount and log tile events */}
            <MapDiagnostics onReadyLog={(d) => console.debug('map diagnostics', d)} />
            {/* TrackRefresh removed to prevent potential rendering conflicts */}
            <MapEvents onZoom={setZoomLevel} />
            <CenterOn position={startEnd.start || trilhaSelecionada.pos} zoom={13} />
            {/* Tile server: prefer Esri imagery in production, fallback to OpenStreetMap in dev or on error */}
            <TileLayer
              key={mapKey}
              url={
                tileProvider === 'esri'
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
            {trackPoints.length > 1 && (
              <Polyline 
                positions={trackPoints} 
                pathOptions={{ 
                  color: '#1976d2', 
                  weight: 4, 
                  opacity: 0.8, 
                  fill: false, 
                  fillOpacity: 0,
                  interactive: false,
                  className: 'gpx-track-line'
                }} 
              />
            )}
            {startEnd.start && startEnd.end && (
              <Polyline
                positions={[startEnd.start, startEnd.end]}
                pathOptions={{ 
                  color: '#43A047', 
                  weight: 5, 
                  dashArray: '8 8', 
                  opacity: 0.7, 
                  fill: false, 
                  fillOpacity: 0, 
                  className: 'gpx-track-line' 
                }}
              />
            )}
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
