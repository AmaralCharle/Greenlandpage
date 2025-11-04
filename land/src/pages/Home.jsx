import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import Trilhacard from '../components/Trilhacard';
import TrilhasCarousel3D from '../components/TrilhasCarousel3D';
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
    description: 'A famosa formação rochosa com vista panorâmica deslumbrante.',
    details: [
      'Altitude máxima: 412m',
      'Melhor época: Abril a Outubro',
      'Necessário: Calçado adequado, água e protetor solar',
      'Ponto de encontro: Estacionamento do Parque Municipal'
    ],
    highlights: 'Vista panorâmica, formação rochosa única.'
  },
  {
    id: 2,
    title: 'Pedra do Macaco',
    image: 'https://i.ytimg.com/vi/hwWxJEEG92w/maxresdefault.jpg',
    difficulty: 'Fácil',
    time: '40 minutos, Ida e Volta',
    distance: '1,42 km',
    description: 'Trilha curta e tranquila, boa para iniciantes.',
    details: [
      'Altitude máxima: 120m',
      'Melhor época: o ano todo'
    ],
    highlights: 'Paisagem com vegetação nativa.'
  },
  {
    id: 3,
    title: 'Trilha Pedra do Silvado',
    image: 'https://maricainfo.com/wp-content/uploads/2020/01/trilha-silvado.jpg',
    difficulty: 'Difícil',
    time: '300 minutos, Ida e Volta',
    distance: '3,83 km',
    description: 'Percurso longo com trechos íngremes e vistas incríveis.',
    details: [
      'Altitude máxima: 950m',
      'Nivel técnico elevado'
    ],
    highlights: 'Trilha desafiadora com mirantes.'
  },
  {
    id: 4,
    title: 'Caminho das Águas',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=6b2d6fb6b3b6c3b5b6d6e6f7a8b9c0d1',
    difficulty: 'Moderada',
    time: '120 minutos, Ida e Volta',
    distance: '5,2 km',
    description: 'Trilha que passa por riachos e pequenas cachoeiras.',
    details: [],
    highlights: ''
  },
  {
    id: 5,
    title: 'Serra Alta',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=6b2d6fb6b3b6c3b5b6d6e6f7a8b9c0d1',
    difficulty: 'Difícil',
    time: '',
    distance: '',
    description: '',
    details: [],
    highlights: ''
  },
  {
    id: 6,
    title: 'Trilha do Mirante',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    difficulty: 'Fácil',
    time: '60 minutos',
    distance: '2,0 km',
    description: 'Boa para curtir o nascer do sol no mirante.',
    details: ['Acesso fácil', 'Ideal para fotos'],
    highlights: 'Mirante panorâmico'
  },
  {
    id: 7,
    title: 'Rota das Pedras',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=9e8f7d6c5b4a3b2c1d0e9f8a7b6c5d4e',
    difficulty: '',
    time: '',
    distance: '',
    description: '',
    details: [],
    highlights: ''
  },
  {
    id: 8,
    title: 'Vale Escondido',
    image: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=4f3e2d1c0b9a8e7f6d5c4b3a2f1e0d9c',
    difficulty: 'Moderada',
    time: '90 minutos',
    distance: '3,3 km',
    description: 'Trilha com trechos sombreados e cachoeira no final.',
    details: ['Áreas úmidas', 'Sapatos impermeáveis recomendados'],
    highlights: 'Cachoeira ao final'
  },
  {
    id: 9,
    title: 'Trilha dos Pinheiros',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=6b2d6fb6b3b6c3b5b6d6e6f7a8b9c0d1',
    difficulty: 'Fácil',
    time: '45 minutos',
    distance: '1,8 km',
    description: 'Caminho entre pinheiros com sombra quase o tempo todo.',
    details: [],
    highlights: ''
  },
  {
    id: 10,
    title: 'Pico do Horizonte',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d',
    difficulty: 'Difícil',
    time: '240 minutos',
    distance: '6,0 km',
    description: 'Subida longa com visibilidade para o litoral.',
    details: ['Leve agasalho', 'Boa hidratação'],
    highlights: 'Vista para o litoral'
  },
  {
    id: 11,
    title: 'Trilha da Serra Velha',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f',
    difficulty: '',
    time: '',
    distance: '',
    description: '',
    details: [],
    highlights: ''
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
        {/* Substituímos o grid de cards pelo carrossel 3D fornecido pelo usuário */}
        <TrilhasCarousel3D trilhas={trilhas} />
        <Mapa />
        <Weather />
        {/* feedback block removed (moved to Comunidade) */}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
