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

// Função para escolher o ícone do marcador conforme a dificuldade
function getCustomIcon(dificuldade) {
  let iconUrl = '/Greenlandpage/markers_icons/location-pin.png';
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
        console.error('Erro ao buscar GPX:', gpxFile, res.status);
        callback(null, null);
        return { text: () => '' };
      }
      return res.text();
    })
    .then(str => {
      if (!str) return;
      try {
        const parser = new window.DOMParser();
        const xml = parser.parseFromString(str, 'application/xml');
        const trkpts = xml.getElementsByTagName('trkpt');
        if (trkpts.length > 1) {
          const start = [parseFloat(trkpts[0].getAttribute('lat')), parseFloat(trkpts[0].getAttribute('lon'))];
          const end = [parseFloat(trkpts[trkpts.length-1].getAttribute('lat')), parseFloat(trkpts[trkpts.length-1].getAttribute('lon'))];
          console.log('GPX OK:', gpxFile, 'start', start, 'end', end, 'trkpt count', trkpts.length);
          callback(start, end);
        } else {
          console.warn('GPX sem trkpt suficiente:', gpxFile, 'trkpt count', trkpts.length);
          callback(null, null);
        }
      } catch (e) {
        console.error('Erro ao parsear GPX:', gpxFile, e);
        callback(null, null);
      }
    })
    .catch(err => {
      console.error('Erro geral ao processar GPX:', gpxFile, err);
      callback(null, null);
    });
}

// Função utilitária para extrair todos os pontos do GPX
function getTrackPointsFromGPX(gpxFile, callback) {
  fetch(gpxFile)
    .then(res => res.text())
    .then(str => {
      const parser = new window.DOMParser();
      const xml = parser.parseFromString(str, 'application/xml');
      const trkpts = xml.getElementsByTagName('trkpt');
      const points = [];
      for (let i = 0; i < trkpts.length; i++) {
        points.push([
          parseFloat(trkpts[i].getAttribute('lat')),
          parseFloat(trkpts[i].getAttribute('lon'))
        ]);
      }
      callback(points);
    })
    .catch(() => callback([]));
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

// Função para obter o caminho correto dos ícones
const getIconUrl = (file) => `${import.meta.env.BASE_URL}Greenlandpage/markers_icons/${file}`;

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

const Mapa = () => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [startEnd, setStartEnd] = useState({start: null, end: null});
  const [trackPoints, setTrackPoints] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(13);

  // Funções para navegação do carrossel
  const handlePrev = () => {
    setCarouselIndex((prev) => (prev === 0 ? trilhas.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setCarouselIndex((prev) => (prev === trilhas.length - 1 ? 0 : prev + 1));
  };

  // Padroniza dificuldade para evitar bugs de cor
  const trilhasPadronizadas = trilhas.map(t => ({
    ...t,
    difficulty: t.difficulty === 'Moderada' ? 'Moderado' : t.difficulty
  }));
  const trilhaSelecionada = trilhasPadronizadas[carouselIndex];

  useEffect(() => {
    const gpxFile = `${import.meta.env.BASE_URL}Greenlandpage/markers/file${carouselIndex+1}.gpx`;
    getStartEndFromGPX(gpxFile, (start, end) => setStartEnd({start, end}));
    getTrackPointsFromGPX(gpxFile, setTrackPoints);
  }, [carouselIndex]);

  // Função para cor baseada na dificuldade
  const getCor = (dif) => dif === 'Fácil' ? '#43A047' : dif === 'Moderado' ? '#FFD600' : '#E53935';

  return (
    <MapWrapper>
      <MapTitle>Mapa Interativo das Trilhas de Maricá</MapTitle>
      <MapFlex>
        <CarouselWrapper>
          <CarouselNav>
            <CarouselBtn onClick={handlePrev} $cor={getCor(trilhasPadronizadas[carouselIndex].difficulty)}>&lt;</CarouselBtn>
            <CarouselBtn onClick={handleNext} $cor={getCor(trilhasPadronizadas[carouselIndex].difficulty)}>&gt;</CarouselBtn>
          </CarouselNav>
          <CarouselCard key={carouselIndex} $cor={getCor(trilhasPadronizadas[carouselIndex].difficulty)}>
            <InfoRow style={{fontWeight:700, fontSize:'1.15rem'}}><FaMountain/> {trilhasPadronizadas[carouselIndex]?.label}</InfoRow>
            <InfoRow><FaRoad/> Distância: <span style={{fontWeight:600}}>{trilhasPadronizadas[carouselIndex]?.distance ? parseFloat(trilhasPadronizadas[carouselIndex].distance).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : ''} m</span></InfoRow>
            <InfoRow><FaClock/> Duração: <span style={{fontWeight:600}}>{trilhasPadronizadas[carouselIndex]?.duration} min</span></InfoRow>
            <InfoRow><FaExchangeAlt/> Tipo: <span style={{fontWeight:600}}>{trilhasPadronizadas[carouselIndex]?.routetype === 'ida_volta' ? 'Ida e Volta' : 'Ida'}</span></InfoRow>
            <InfoRow><FaArrowUp/> Altitude: <span style={{fontWeight:600}}>{trilhasPadronizadas[carouselIndex]?.elevation} m</span></InfoRow>
            <InfoRow>Dificuldade: <span style={{fontWeight:600, color: getCor(trilhasPadronizadas[carouselIndex]?.difficulty)}}>{trilhasPadronizadas[carouselIndex]?.difficulty}</span></InfoRow>
            <InfoRow style={{fontSize:'0.98rem', opacity:0.85}}>{trilhasPadronizadas[carouselIndex]?.descricao}</InfoRow>
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
            center={trilhaSelecionada.pos}
            zoom={13}
            minZoom={11}
            maxZoom={17}
            zoomSnap={0.5}
            zoomDelta={0.5}
            scrollWheelZoom={true}
            doubleClickZoom={false}
            key={trilhaSelecionada.label}
            style={{height: '100%', width: '100%', minHeight: 420, minWidth: 320, zIndex: 2, background: '#e5e5e5'}}
            zoomAnimation={false}
          >
            <MapEvents onZoom={setZoomLevel} />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles © Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              updateWhenIdle={true}
              updateWhenZooming={false}
              updateInterval={1000}
              keepBuffer={2}
              maxZoom={17}
            />
            {/* Linha do percurso real da trilha (GPX) */}
            {trackPoints.length > 1 && (
              <Polyline positions={trackPoints} pathOptions={{ color: '#1976d2', weight: 4, opacity: 0.8 }} />
            )}
            {/* Linha entre início e fim (opcional, pode remover se quiser só o GPX) */}
            {startEnd.start && startEnd.end && (
              <Polyline
                positions={[startEnd.start, startEnd.end]}
                pathOptions={{ color: '#43A047', weight: 5, dashArray: '8 8', opacity: 0.7 }}
              />
            )}
            {/* Marcador início real do GPX */}
            {startEnd.start && (
              <Marker
                position={startEnd.start}
                icon={L.icon({ iconUrl: getIconUrl('location-pin.png'), iconSize: [44, 56], iconAnchor: [22, 52], popupAnchor: [0, -40], shadowUrl: markerShadow, shadowSize: [44, 56] })}
              >
                <Popup>
                  <div style={{textAlign:'center'}}>
                    <strong>Início:</strong> {trilhasPadronizadas[carouselIndex]?.label}<br/>
                    <span style={{fontSize:'0.95em', opacity:0.8}}>{trilhasPadronizadas[carouselIndex]?.descricao}</span>
                  </div>
                </Popup>
              </Marker>
            )}
            {/* Marcador fim real do GPX */}
            {startEnd.end && (
              <Marker
                position={startEnd.end}
                icon={L.icon({ iconUrl: getIconUrl('flag.png'), iconSize: [44, 56], iconAnchor: [22, 52], popupAnchor: [0, -40], shadowUrl: markerShadow, shadowSize: [44, 56] })}
              >
                <Popup>
                  <div style={{textAlign:'center'}}>
                    <strong>Fim:</strong> {trilhasPadronizadas[carouselIndex]?.label}<br/>
                    <span style={{fontSize:'0.95em', opacity:0.8}}>{trilhasPadronizadas[carouselIndex]?.descricao}</span>
                  </div>
                </Popup>
              </Marker>
            )}
            {/* Marcadores das outras trilhas (cinza e menor para não poluir) */}
            {trilhasPadronizadas.map((trilha, idx) => (
              idx !== carouselIndex && (
                <Marker
                  key={trilha.label}
                  position={trilha.pos}
                  icon={L.icon({
                    iconUrl: getIconUrl('location-pin.png'),
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
                    Distância: {parseFloat(trilha.distance).toFixed(2)} m<br/>
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
