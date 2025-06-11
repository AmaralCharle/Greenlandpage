import React from 'react';
import styled from 'styled-components';

const ForecastContainer = styled.div`
  background: #ffe5d0;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  padding: 18px 10px 10px 10px;
  margin: 32px 0 0 0;
  min-width: 200px;
  max-width: 250px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 900px) {
    margin: 18px auto 0 auto;
    min-width: 180px;
    max-width: 100vw;
  }
`;

const ForecastTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: #372f3f;
  margin-bottom: 10px;
`;

const ForecastCarousel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const ForecastCard = styled.div`
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2px;
`;

const ForecastDate = styled.div`
  font-size: 0.95rem;
  font-weight: 500;
  color: #0daf16;
  margin-bottom: 2px;
`;

const ForecastIcon = styled.img`
  width: 48px;
  height: 48px;
  margin-bottom: 2px;
`;

const ForecastTemp = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #372f3f;
`;

const ForecastDesc = styled.div`
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 2px;
  text-align: center;
`;

const ForecastMinMax = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 2px;
  .min { color: #0284c7; }
  .max { color: #7f1d1d; }
`;

const ForecastHumidity = styled.div`
  font-size: 0.85rem;
  color: #0ea5e9;
  margin-bottom: 1px;
`;

const ForecastWind = styled.div`
  font-size: 0.85rem;
  color: #7c3aed;
  margin-bottom: 1px;
`;

const WeatherForecast = ({ forecast, mini }) => {
  if (!forecast || forecast.length === 0) return null;

  return (
    <div style={{ width: mini ? '100%' : undefined }}>
      <h2 className="forecast-title" style={{ fontSize: mini ? '1rem' : '1.1rem', textAlign: mini ? 'left' : 'center', marginBottom: mini ? 6 : 10 }}>Próximos 5 dias</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: mini ? 6 : 12, width: '100%' }}>
        {forecast.map((day, idx) => (
          <div key={idx} style={{
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            padding: mini ? '6px 4px' : '10px 8px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: mini ? 0 : 2,
            fontSize: mini ? '0.95rem' : '1rem',
            gap: mini ? 8 : 16
          }}>
            <img src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} alt={day.description} style={{ width: mini ? 32 : 48, height: mini ? 32 : 48, marginRight: mini ? 6 : 12 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, color: '#0daf16', fontSize: mini ? '0.9rem' : '0.95rem' }}>{day.date}</div>
              <div style={{ fontWeight: 'bold', color: '#372f3f', fontSize: mini ? '1rem' : '1.2rem' }}>{day.temp.toFixed(1).toString().replace('.', ',')}°C</div>
              <div style={{ color: '#555', fontSize: mini ? '0.85rem' : '0.95rem' }}>{day.description}</div>
              <div style={{ color: '#666', fontSize: mini ? '0.8rem' : '0.9rem' }}>
                <span style={{ color: '#0284c7' }}>{day.tempMin.toFixed(1).toString().replace('.', ',')}°</span> /
                <span style={{ color: '#7f1d1d' }}>{day.tempMax.toFixed(1).toString().replace('.', ',')}°</span>
              </div>
              <div style={{ color: '#0ea5e9', fontSize: mini ? '0.75rem' : '0.85rem' }}>💧 {day.humidity}%</div>
              <div style={{ color: '#7c3aed', fontSize: mini ? '0.75rem' : '0.85rem' }}>🌬 {day.wind.toFixed(1)} km/h</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherForecast;
