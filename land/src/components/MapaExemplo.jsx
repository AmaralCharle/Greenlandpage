import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Ensure default Leaflet icon options
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const Wrapper = styled.section`
  width: 100%;
  max-width: 1200px;
  margin: 40px auto 0 auto;
  background: var(--branco);
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  padding: 0 0 32px 0;
`;

const Title = styled.h2`
  text-align: center;
  font-size: 2rem;
  color: var(--verde-escuro);
  margin: 0 auto 24px auto;
  font-weight: 700;
`;

const StyledMap = styled(MapContainer)`
  flex: 1 1 0%;
  height: 520px !important;
  min-width: 320px;
  width: 100%;
  border-radius: 12px;
  z-index: 1;
  background: #e5e5e5 !important;
`;

const colorForDifficulty = (dif) => dif === 'Fácil' ? '#43A047' : dif === 'Moderado' ? '#FFD600' : '#1976d2';

// Try candidate paths for the example JSON
const candidateJsonPaths = () => {
  const p = (typeof window !== 'undefined') ? window.location.pathname : '/';
  const siteBase = p.includes('/Greenlandpage/') ? p.slice(0, p.indexOf('/Greenlandpage/') + '/Greenlandpage/'.length) : '/';
  return [
    `${siteBase}Greenlandpage/markers/map.exemplo/trilhas.json`,
    `${siteBase}markers/map.exemplo/trilhas.json`,
    `/Greenlandpage/markers/map.exemplo/trilhas.json`,
    `/markers/map.exemplo/trilhas.json`,
  ];
};

const MapaExemplo = () => {
  const [tracks, setTracks] = useState([]);
  const [center, setCenter] = useState([-22.96, -43.02]);
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    let mounted = true;
    const paths = candidateJsonPaths();
    (async () => {
      for (const p of paths) {
        try {
          const res = await fetch(p);
          if (!res.ok) continue;
          const data = await res.json();
          if (!mounted) return;
          if (Array.isArray(data) && data.length > 0) {
            setTracks(data);
            // center on first track start if available
            const first = data[0];
            if (first && first.start && first.start.length === 2) setCenter(first.start);
            return;
          }
        } catch (e) {
          // try next
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <Wrapper>
      <Title>Mapa (exemplo)</Title>
      <StyledMap center={center} zoom={zoom} scrollWheelZoom={true} minZoom={11} maxZoom={17}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        {tracks.map((t) => (
          <React.Fragment key={t.id}>
            {Array.isArray(t.points) && t.points.length > 1 && (
              <Polyline positions={t.points} pathOptions={{ color: colorForDifficulty(t.difficulty), weight: 4, opacity: 0.9 }} />
            )}
            {t.start && (
              <Marker position={t.start}>
                <Popup>
                  <strong>{t.label}</strong><br/>
                  {t.descricao}
                </Popup>
              </Marker>
            )}
            {t.end && (
              <Marker position={t.end}>
                <Popup>
                  <strong>Fim: {t.label}</strong>
                </Popup>
              </Marker>
            )}
          </React.Fragment>
        ))}
      </StyledMap>
    </Wrapper>
  );
};

export default MapaExemplo;
