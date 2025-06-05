import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import Sobre from './pages/Sobre';

function App() {
  return (
    <Router basename="/Greenlandpage">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sobre" element={<Sobre />} />
        {/* Adicione mais rotas aqui, como /trilhas ou /contato futuramente */}
      </Routes>
    </Router>
  );
}

export default App;
