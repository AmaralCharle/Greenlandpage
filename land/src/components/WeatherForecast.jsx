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
    min-width: 160px;
    max-width: 100vw;
    padding: 12px 4px 6px 4px;
  }
  @media (max-width: 600px) {
    min-width: 0;
    max-width: 100vw;
    width: 100vw;
    border-radius: 12px;
    margin: 12px 0 0 0;
    padding: 8px 2px 4px 2px;
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
  flex-direction: row;
  align-items: center;
  margin-bottom: 2px;
  font-size: 1rem;
  gap: 16px;
  @media (max-width: 600px) {
    font-size: 0.95rem;
    gap: 8px;
    padding: 6px 4px;
  }
`;

const ForecastIcon = styled.img`
  width: 48px;
  height: 48px;
  margin-right: 12px;
  @media (max-width: 600px) {
    width: 32px;
    height: 32px;
    margin-right: 6px;
  }
`;

const ForecastInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ForecastDate = styled.div`
  font-size: 0.95rem;
  font-weight: 500;
  color: #0daf16;
  margin-bottom: 2px;
  @media (max-width: 600px) {
    font-size: 0.9rem;
  }
`;

const ForecastTemp = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #372f3f;
  @media (max-width: 600px) {
    font-size: 1rem;
  }
`;

const ForecastDesc = styled.div`
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 2px;
  text-align: center;
  @media (max-width: 600px) {
    font-size: 0.85rem;
  }
`;

const ForecastMinMax = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 2px;
  .min { color: #0284c7; }
  .max { color: #7f1d1d; }
  @media (max-width: 600px) {
    font-size: 0.8rem;
  }
`;

const ForecastHumidity = styled.div`
  font-size: 0.85rem;
  color: #0ea5e9;
  margin-bottom: 1px;
  @media (max-width: 600px) {
    font-size: 0.75rem;
  }
`;

const ForecastWind = styled.div`
  font-size: 0.85rem;
  color: #7c3aed;
  margin-bottom: 1px;
  @media (max-width: 600px) {
    font-size: 0.75rem;
  }
`;

const WeatherForecast = ({ forecast, mini }) => {
  if (!forecast || forecast.length === 0) return null;

  // Sempre usa ForecastCard com fundo branco
  const Card = ForecastCard;
  const Icon = mini ? styled(ForecastIcon)`
    width: 32px;
    height: 32px;
    margin-right: 6px;
  ` : ForecastIcon;
  const Date = mini ? styled(ForecastDate)`font-size: 0.9rem;` : ForecastDate;
  const Temp = mini ? styled(ForecastTemp)`font-size: 1rem;` : ForecastTemp;
  const Desc = mini ? styled(ForecastDesc)`font-size: 0.85rem;` : ForecastDesc;
  const MinMax = mini ? styled(ForecastMinMax)`font-size: 0.8rem;` : ForecastMinMax;
  const Humidity = mini ? styled(ForecastHumidity)`font-size: 0.75rem;` : ForecastHumidity;
  const Wind = mini ? styled(ForecastWind)`font-size: 0.75rem;` : ForecastWind;

  return (
    <ForecastContainer style={{ width: mini ? '100%' : undefined }}>
      <ForecastTitle style={{ fontSize: mini ? '1rem' : '1.1rem', textAlign: mini ? 'left' : 'center', marginBottom: mini ? 6 : 10 }}>Próximos 5 dias</ForecastTitle>
      <ForecastCarousel style={{ gap: mini ? 6 : 12 }}>
        {forecast.map((day, idx) => (
          <Card key={idx} style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '10px 8px', marginBottom: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', width: 60, justifyContent: 'center' }}>
              <Icon src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} alt={day.description} />
            </div>
            <ForecastInfo>
              <Date>{day.date}</Date>
              <Temp>{day.temp.toFixed(1).toString().replace('.', ',')}°C</Temp>
              <Desc>{day.description}</Desc>
              <MinMax>
                <span className="min">{day.tempMin.toFixed(1).toString().replace('.', ',')}°</span> /
                <span className="max">{day.tempMax.toFixed(1).toString().replace('.', ',')}°</span>
              </MinMax>
              <Humidity>💧 {day.humidity}%</Humidity>
              <Wind>🌬 {day.wind.toFixed(1)} km/h</Wind>
            </ForecastInfo>
          </Card>
        ))}
      </ForecastCarousel>
    </ForecastContainer>
  );
};

export default WeatherForecast;
