// Função para obter todos os favoritos
export const getFavorites = () => {
  const favorites = localStorage.getItem('favorites');
  return favorites ? JSON.parse(favorites) : [];
};

// Função para adicionar um favorito
export const addFavorite = (trail) => {
  const favorites = getFavorites();
  if (!favorites.find(fav => fav.id === trail.id)) {
    favorites.push(trail);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
};

// Função para remover um favorito
export const removeFavorite = (trailId) => {
  const favorites = getFavorites();
  const updatedFavorites = favorites.filter(fav => fav.id !== trailId);
  localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
};

// Função para verificar se uma trilha é favorita
export const isFavorite = (trailId) => {
  const favorites = getFavorites();
  return favorites.some(fav => fav.id === trailId);
}; 