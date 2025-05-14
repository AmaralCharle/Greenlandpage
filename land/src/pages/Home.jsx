import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import Trilhacard from '../components/Trilhacard';
import Carousel from '../components/Carrossel';
import Modal from '../components/login';
import Footer from '../components/Footer';

const trilhas = [
  {
    id: 'detalhes1',
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
    id: 'detalhes2',
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
    id: 'detalhes3',
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
      <main className="container">
        <div className="trilhas-container">
          {trilhas.map((trilha) => (
            <Trilhacard key={trilha.id} {...trilha} />
          ))}
        </div>
        <Carousel />
      </main>
      {modalType && <Modal type={modalType} closeModal={closeModal} />}
      <Footer />
    </div>
  );
};

export default Home;
