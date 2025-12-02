import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import TrilhasCarousel3D from '../components/TrilhasCarousel3D';
import Mapa from '../components/Mapa';
import Weather from '../components/Weather';
import Modal from '../components/login';
import Footer from '../components/Footer';
import Login from './Login';

// Não buscamos a API aqui — o carrossel fará apenas UMA requisição a /api/tracks/
// e exibirá os 10 itens retornados. Mantemos `trilhas` vazio para evitar
// fetchs duplicados que geravam muitas requisições simultâneas.
const trilhas = [
  { label: 'Trilha da Pedra do Elefante', pos: [-22.936, -42.987], url: 'track1', distance: '1977.43', difficulty: 'Moderado', duration:'100', routetype:'ida_volta', elevation:'233', descricao: 'Vista panorâmica e formação rochosa única.' },
  { label: 'Trilha da Pedra do Itaocaia', pos: [-22.950, -42.970], url: 'track2', distance: '1254.42', difficulty: 'Difícil', duration:'90', routetype:'ida_volta', elevation:'390', descricao: 'Trilha íngreme com visual incrível do topo.' },
  { label: 'Trilha da Pedra do Silvado', pos: [-22.920, -42.950], url: 'track3', distance: '1913.42', difficulty: 'Difícil', duration:'300', routetype:'ida_volta', elevation:'529', descricao: 'Desafio para os aventureiros, com mata fechada.' },
  { label: 'Trilha da Pedra de Inoã', pos: [-22.930, -42.930], url: 'track4', distance: '1906.28', difficulty: 'Moderado', duration:'90', routetype:'ida_volta', elevation:'513', descricao: 'Trilha curta, mas com subidas fortes.' },
  { label: 'Trilha da Pedra de Macaco', pos: [-22.910, -42.910], url: 'track5', distance: '710.24', difficulty: 'Fácil', duration:'40', routetype:'ida_volta', elevation:'246', descricao: 'Ideal para iniciantes e famílias.' },
  { label: 'Trilha dos Espraiado/Tomascar', pos: [-22.94, -42.96], url: 'track6', distance: '4347.83', difficulty: 'Difícil', duration: '120', routetype: 'ida_volta', elevation: '555', descricao: 'Travessia longa e desafiadora, paisagens rurais.' },
  { label: 'Trilha Caminhos de Darwin', pos: [-22.93, -42.94], url: 'track7', distance: '6375.64', difficulty: 'Fácil', duration: '120', routetype: 'ida', elevation: '386', descricao: 'Trilha histórica, vegetação variada.' },
  { label: 'Trilha de Acesso ao Pico da Lagoinha', pos: [-22.935, -42.92], url: 'track8', distance: '4300.00', difficulty: 'Difícil', duration: '300', routetype: 'ida_volta', elevation: '653', descricao: 'Acesso ao ponto mais alto da região.' },
  { label: 'Trilha de Travessia Silvado x Espraiado', pos: [-22.925, -42.955], url: 'track9', distance: '9966.04', difficulty: 'Difícil', duration: '150', routetype: 'ida', elevation: '521', descricao: 'Travessia entre vales e montanhas.' },
  { label: 'Trilha da Cachoeira do Segredo em Silvado', pos: [-22.927, -42.952], url: 'track10', distance: '3960.64', difficulty: 'Moderada', duration: '120', routetype: 'ida_volta', elevation: '220', descricao: 'Cachoeira escondida em meio à mata.' }
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
    {/* Mostrar o carrossel puxando diretamente da API (não passamos `trilhas` para forçar a requisição)
      Mantemos `trilhas` apenas para o mapa se necessário. */}
  <TrilhasCarousel3D />
  <Mapa />
        <Weather />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
