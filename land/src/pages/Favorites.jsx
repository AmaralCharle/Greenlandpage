import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getFavorites } from '../utils/favorites';
import Trilhacard from '../components/Trilhacard';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: var(--verde-escuro);
  margin-bottom: 2rem;
  text-align: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.2rem;
`;

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = () => {
      const favs = getFavorites();
      setFavorites(favs);
    };

    loadFavorites();
    // Atualiza a lista quando houver mudanças no localStorage
    window.addEventListener('storage', loadFavorites);
    return () => window.removeEventListener('storage', loadFavorites);
  }, []);

  return (
    <Container>
      <Title>Minhas Trilhas Favoritas</Title>
      {favorites.length > 0 ? (
        <Grid>
          {favorites.map((trail) => (
            <Trilhacard
              key={trail.id}
              {...trail}
            />
          ))}
        </Grid>
      ) : (
        <EmptyMessage>
          <i className="far fa-heart" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
          <p>Você ainda não tem trilhas favoritas.</p>
          <p>Explore as trilhas e adicione suas favoritas!</p>
        </EmptyMessage>
      )}
    </Container>
  );
};

export default Favorites; 