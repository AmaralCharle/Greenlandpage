import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import Sobre from './pages/Sobre';
import Favorites from './pages/Favorites';
import Comunidade from './pages/Comunidade';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/favoritos" element={<Favorites />} />
  <Route path="/comunidade" element={<Comunidade />} />
        {/* Adicione mais rotas aqui, como /trilhas ou /contato futuramente */}
      </Routes>
    </Router>
  );
}

export default App;
