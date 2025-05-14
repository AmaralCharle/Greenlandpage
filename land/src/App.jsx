import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Adicione mais rotas aqui, como /trilhas ou /contato futuramente */}
      </Routes>
    </Router>
  );
}

export default App;
