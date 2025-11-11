import React, { useState } from 'react';
import WeatherForecast from './WeatherForecast';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [alert, setAlert] = useState('');
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city) {
      setWeather(null);
      setAlert('Você precisa digitar uma cidade...');
      return;
    }
    setLoading(true);
    setAlert('');
    setWeather(null);
    const apiKey = '8a60b2de14f7a17c7a11706b2cfcd87c';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(city)}&appid=${apiKey}&units=metric&lang=pt_br`;
    try {
      const results = await fetch(apiUrl);
      const json = await results.json();
      if (json.cod === 200) {
        setWeather({
          city: json.name,
          country: json.sys.country,
          temp: json.main.temp,
          tempMax: json.main.temp_max,
          tempMin: json.main.temp_min,
          description: json.weather[0].description,
          tempIcon: json.weather[0].icon,
          windSpeed: json.wind.speed,
          humidity: json.main.humidity,
        });
        // Buscar previsão de 5 dias
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURI(city)}&appid=${apiKey}&units=metric&lang=pt_br`;
        const forecastRes = await fetch(forecastUrl);
        const forecastJson = await forecastRes.json();
        if (forecastJson.cod === "200") {
          // Agrupar por dia (pegar o horário do meio-dia de cada dia)
          const days = {};
          forecastJson.list.forEach(item => {
            const date = item.dt_txt.split(' ')[0];
            if (!days[date] && item.dt_txt.includes('12:00:00')) {
              days[date] = {
                date: new Date(item.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }),
                temp: item.main.temp,
                tempMin: item.main.temp_min,
                tempMax: item.main.temp_max,
                description: item.weather[0].description,
                icon: item.weather[0].icon,
                humidity: item.main.humidity,
                wind: item.wind.speed,
              };
            }
          });
          setForecast(Object.values(days).slice(0, 5));
        } else {
          setForecast([]);
        }
        setAlert('');
      } else {
        setWeather(null);
        setForecast([]);
        setAlert('Não foi possível localizar...');
      }
    } catch {
      setWeather(null);
      setForecast([]);
      setAlert('Erro ao buscar dados do clima.');
    }
    setLoading(false);
  };

  return (
    <div id="container" style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '32px',
      justifyContent: 'center',
      alignItems: 'flex-start',
      background: 'none',
      flexWrap: 'wrap',
      width: '100%',
      maxWidth: '100vw',
    }}>
      {/* Painel principal Weather, 100% original, sem carrossel dentro */}
      <div style={{
        minWidth: 240,
        maxWidth: 400,
        width: '100%',
        flex: '1 1 320px',
        boxSizing: 'border-box',
        margin: '0 auto',
      }}>
        <form id="search" onSubmit={handleSearch} autoComplete="off" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#f4f8fb',
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          padding: '14px 22px',
          marginBottom: 36,
          marginTop: 36, // aumenta o espaçamento do topo
          border: '1.5px solid #e0e7ef',
          maxWidth: 340,
          width: '100%'
        }}>
          <i className="fa-solid fa-location-dot" style={{ color: '#0daf16', fontSize: 22, marginRight: 8 }}></i>
          <input 
            type="search" 
            name="city_name" 
            id="city_name" 
            placeholder="Buscar cidade"
            value={city}
            onChange={e => setCity(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: 18,
              flex: 1,
              outline: 'none',
              color: '#373f51',
              fontWeight: 500,
              padding: '6px 0'
            }}
          />
          <button type="submit" style={{
            background: '#0daf16',
            border: 'none',
            borderRadius: 10,
            padding: '7px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'background 0.2s',
          }}>
            <i className="fa-solid fa-magnifying-glass" style={{ color: '#fff', fontSize: 18 }}></i>
          </button>
        </form>
        <div id="weather" className={weather ? 'show' : ''}>
          {weather && (
            <div style={{
              background: '#dbeafe', // azul claro para o quadro geral
              borderRadius: 28,
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              padding: 32,
              margin: '32px 0 24px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: 340,
              minWidth: 320,
              maxWidth: 400,
              width: '100%'
            }}>
              <h1 id="title" style={{ color: '#22223b', fontWeight: 700, fontSize: 32, marginBottom: 18 }}>{weather.city}, {weather.country}</h1>
              {/* Destaque temperatura e ícone */}
              <div style={{
                background: '#5a6ee6', // roxo/azul escuro destacado
                borderRadius: 24,
                padding: '32px 24px 24px 24px',
                marginBottom: 24,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
              }}>
                <img id="temp_img" src={`https://openweathermap.org/img/wn/${weather.tempIcon}@2x.png`} alt={weather.description} style={{ width: 90, height: 90, marginBottom: 8 }} />
                <p id="temp_value" style={{ fontWeight: 700, fontSize: 56, color: '#fff', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>{weather.temp.toFixed(1).toString().replace('.', ',')} <sup style={{ fontSize: 28 }}>C°</sup></p>
                <p id="temp_description" style={{ fontWeight: 500, fontSize: 22, color: '#fff', margin: 0, textTransform: 'capitalize', textShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>{weather.description}</p>
              </div>
              {/* Cards de info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%' }}>
                <div style={{ background: '#fff', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                  <i id="temp_max_icon" className="fa-solid fa-temperature-high" style={{ color: '#7f1d1d', fontSize: 24, marginBottom: 4 }}></i>
                  <h2 style={{ fontSize: 16, color: '#155724', margin: 0, fontWeight: 600 }}>Temperatura máx.</h2>
                  <p id="temp_max" style={{ fontSize: 20, color: '#373f51', margin: 0 }}>{weather.tempMax.toFixed(1).toString().replace('.', ',')} <sup style={{ fontSize: 14 }}>C°</sup></p>
                </div>
                <div style={{ background: '#fff', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                  <i id="temp_min_icon" className="fa-solid fa-temperature-low" style={{ color: '#0284c7', fontSize: 24, marginBottom: 4 }}></i>
                  <h2 style={{ fontSize: 16, color: '#155724', margin: 0, fontWeight: 600 }}>Temperatura mínima</h2>
                  <p id="temp_min" style={{ fontSize: 20, color: '#373f51', margin: 0 }}>{weather.tempMin.toFixed(1).toString().replace('.', ',')} <sup style={{ fontSize: 14 }}>C°</sup></p>
                </div>
                <div style={{ background: '#fff', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                  <i id="humidity_icon" className="fa-solid fa-droplet" style={{ color: '#0ea5e9', fontSize: 24, marginBottom: 4 }}></i>
                  <h2 style={{ fontSize: 16, color: '#155724', margin: 0, fontWeight: 600 }}>Humidade</h2>
                  <p id="humidity" style={{ fontSize: 20, color: '#373f51', margin: 0 }}>{weather.humidity}%</p>
                </div>
                <div style={{ background: '#fff', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                  <i id="wind_icon" className="fa-solid fa-wind" style={{ color: '#7c3aed', fontSize: 24, marginBottom: 4 }}></i>
                  <h2 style={{ fontSize: 16, color: '#155724', margin: 0, fontWeight: 600 }}>Vento</h2>
                  <p id="wind" style={{ fontSize: 20, color: '#373f51', margin: 0 }}>{weather.windSpeed.toFixed(1)} km/h</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div id="alert">{loading ? 'Carregando previsão...' : alert}</div>
      </div>
      {/* Painel lateral: previsão 5 dias, carrossel vertical, compacto, mas separado do painel principal */}
      <div style={{
        minWidth: 180,
        maxWidth: 340,
        width: '100%',
        flex: '1 1 220px',
        boxSizing: 'border-box',
        margin: '0 auto',
      }}>
        <WeatherForecast forecast={forecast} />
      </div>
    </div>
  );
};

export default Weather;
