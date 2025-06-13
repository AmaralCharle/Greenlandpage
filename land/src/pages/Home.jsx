import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import Trilhacard from '../components/Trilhacard';
import Modal from '../components/login';
import Footer from '../components/Footer';
import Mapa from '../components/Mapa';
import Weather from '../components/Weather';
import Login from './Login';

const trilhas = [
  {
    id: 1,
    title: 'Pedra do Elefante',
    image: 'https://www.trilhasecachoeiras.com.br/wp-content/uploads/2014/11/alto-mourao-4.jpg',
    difficulty: 'Moderada',
    time: '100 minutos, Ida e Volta',
    distance: '3,95 km',
    description: 'A famosa formação rochosa que se assemelha a um elefante, com vista panorâmica deslumbrante.',
    details: [
      'Altitude máxima: 412m',
      'Melhor época: Abril a Outubro',
      'Necessário: Calçado adequado, água e protetor solar',
      'Ponto de encontro: Estacionamento do Parque Municipal'
    ],
    highlights: 'Vista para a Lagoa de Maricá, formação rochosa única, diversidade de flora local.'
  },
  {
    id: 2,
    title: 'Pedra do Macaco',
    image: 'https://i.ytimg.com/vi/hwWxJEEG92w/maxresdefault.jpg',
    difficulty: 'Fácil',
    time: '40 minutos, Ida e Volta',
    distance: '1,42 km',
    description: 'A famosa formação rochosa que se assemelha a um elefante, com vista panorâmica deslumbrante.',
    details: [
      'Altitude máxima: 412m',
      'Melhor época: Abril a Outubro',
      'Necessário: Calçado adequado, água e protetor solar',
      'Ponto de encontro: Estacionamento do Parque Municipal'
    ],
    highlights: 'Vista para a Lagoa de Maricá, formação rochosa única, diversidade de flora local.'
  },
  {
    id: 3,
    title: 'Trilha Pedra do Silvado',
    image: 'https://maricainfo.com/wp-content/uploads/2020/01/trilha-silvado.jpg',
    difficulty: 'Difícil',
    time: '300 minutos, Ida e Volta',
    distance: '3,83 km',
    description: 'A famosa formação rochosa que se assemelha a um elefante, com vista panorâmica deslumbrante.',
    details: [
      'Altitude máxima: 412m',
      'Melhor época: Abril a Outubro',
      'Necessário: Calçado adequado, água e protetor solar',
      'Ponto de encontro: Estacionamento do Parque Municipal'
    ],
    highlights: 'Vista para a Lagoa de Maricá, formação rochosa única, diversidade de flora local.'
  }
];

const Home = () => {
  const [modalType, setModalType] = useState(null);

  const openModal = (type) => setModalType(type);
  const closeModal = () => setModalType(null);

  return (
    <div>
      <Navbar openModal={openModal} />
      <Header />
      {modalType === 'login' && (
        <div className="modal-overlay" style={{position: 'fixed', zIndex: 1000, left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{background: '#fff', borderRadius: 12, padding: '2rem 2.5rem 1.5rem 2.5rem', boxShadow: '0 4px 32px rgba(0,0,0,0.18)', minWidth: 340, maxWidth: '90vw', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'stretch'}}>
            <span style={{position: 'absolute', top: 18, right: 22, fontSize: '2rem', color: '#888', cursor: 'pointer'}} onClick={closeModal}>&times;</span>
            <Login onClose={closeModal} />
          </div>
        </div>
      )}
      <main className="container">
        <div className="trilhas-container">
          {trilhas.map((trilha) => (
            <Trilhacard key={trilha.id} {...trilha} />
          ))}
        </div>
        <Mapa />
        <Weather />
        {/* Bloco de feedback entre o clima e o rodapé */}
        <div style={{
          maxWidth: 420,
          margin: '32px auto 0 auto',
          background: '#f8f8f8',
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12
        }}>
          <label htmlFor="feedback-text" style={{fontWeight: 600, fontSize: '1.15rem', color: '#388e3c', marginBottom: 6, textAlign: 'center'}}>Como está sendo sua experiência?</label>
          <textarea
            id="feedback-text"
            rows={3}
            placeholder="Conte pra gente!"
            style={{width: '100%', borderRadius: 8, border: '1px solid #bdbdbd', padding: 10, fontSize: 15, resize: 'vertical', marginBottom: 8}}
          />
          <button
            style={{
              background: '#43A047',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 22px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(67,160,71,0.08)'
            }}
            onClick={() => alert('Feedback enviado! Obrigado por compartilhar sua experiência!')}
          >
            Enviar
          </button>
        </div>
        {/* Fim do bloco de feedback */}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
