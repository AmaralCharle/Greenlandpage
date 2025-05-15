import React, { useState } from 'react';
import './Weather.css';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [alert, setAlert] = useState('');
  const [loading, setLoading] = useState(false);

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
        setAlert('');
      } else {
        setWeather(null);
        setAlert('Não foi possível localizar...');
      }
    } catch {
      setWeather(null);
      setAlert('Erro ao buscar dados do clima.');
    }
    setLoading(false);
  };

  return (
    <div id="container">
      <form id="search" onSubmit={handleSearch} autoComplete="off">
        <i className="fa-solid fa-location-dot"></i>
        <input 
          type="search" 
          name="city_name" 
          id="city_name" 
          placeholder="Buscar cidade"
          value={city}
          onChange={e => setCity(e.target.value)}
        />
        <button type="submit">
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
      </form>
      <div id="weather" className={weather ? 'show' : ''}>
        {weather && (
          <>
            <h1 id="title">{weather.city}, {weather.country}</h1>
            <div id="infos">
              <div id="temp">
                <img id="temp_img" src={`https://openweathermap.org/img/wn/${weather.tempIcon}@2x.png`} alt={weather.description} />
                <div>
                  <p id="temp_value">{weather.temp.toFixed(1).toString().replace('.', ',')} <sup>C°</sup></p>
                  <p id="temp_description">{weather.description}</p>
                </div>
              </div>
              <div id="other_infos">
                <div className="info">
                  <i id="temp_max_icon" className="fa-solid fa-temperature-high"></i>
                  <div>
                    <h2>Temp. max</h2>
                    <p id="temp_max">{weather.tempMax.toFixed(1).toString().replace('.', ',')} <sup>C°</sup></p>
                  </div>
                </div>
                <div className="info">
                  <i id="temp_min_icon" className="fa-solid fa-temperature-low"></i>
                  <div>
                    <h2>Temp. min</h2>
                    <p id="temp_min">{weather.tempMin.toFixed(1).toString().replace('.', ',')} <sup>C°</sup></p>
                  </div>
                </div>
                <div className="info">
                  <i id="humidity_icon" className="fa-solid fa-droplet"></i>
                  <div>
                    <h2>Humidade</h2>
                    <p id="humidity">{weather.humidity}%</p>
                  </div>
                </div>
                <div className="info">
                  <i id="wind_icon" className="fa-solid fa-wind"></i>
                  <div>
                    <h2>Vento</h2>
                    <p id="wind">{weather.windSpeed.toFixed(1)} km/h</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div id="alert">{loading ? 'Carregando previsão...' : alert}</div>
    </div>
  );
};

export default Weather;
