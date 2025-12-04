import React from 'react'
import App from './App.jsx'
import './styles/custom.css'

// Import crítico do CSS do Leaflet para evitar tiles/ícones desalinhados
import 'leaflet/dist/leaflet.css'

import ReactDOM from 'react-dom/client'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
