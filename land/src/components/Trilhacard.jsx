import React, { useState, useEffect } from 'react';
import { API_BASE_URL, IMAGE_PROXY } from '../config';

const Trilhacard = ({ id, title, image, difficulty, time, distance, description, details, highlights }) => {
  const normalizeInvisible = (s) => String(s).replace(/[\u200B\uFEFF\u00A0]/g, '').replace(/\u00AD/g, '');

  const sanitizeText = (raw) => {
    if (raw === null || raw === undefined) return '';
    try {
      const text = String(raw);
      return text
        .split(/\r?\n/)
        .map((l) => normalizeInvisible(l).trim())
        .filter((l) => l.length > 0 && l.toLowerCase() !== 's')
        .join('\n')
        .trim();
    } catch (e) {
      return String(raw);
    }
  };

  const sanitizeDetails = (arr) => {
    if (!arr) return [];
    if (!Array.isArray(arr)) return [sanitizeText(arr)];
    return arr
      .map((it) => normalizeInvisible(it).trim())
      .filter((t) => t && t.length > 0 && t.toLowerCase() !== 's');
  };

  const sanitizedDescription = sanitizeText(description);
  const sanitizedHighlights = sanitizeText(highlights);
  const sanitizedDetails = sanitizeDetails(details);

  const sanitizePath = (p) => String(p || '').replace(/\\/g, '/').trim();
  const buildAbsolute = (raw) => {
    if (!raw) return '';
    const r = sanitizePath(raw);
    if (/^https?:\/\//i.test(r)) return encodeURI(r);
    const apiOrigin = String(API_BASE_URL).replace(/\/api\/?$/i, '');
    const path = r.startsWith('/') ? r : '/' + r;
    const absolute = encodeURI(apiOrigin + path);
    if (IMAGE_PROXY) {
      try {
        const encoded = encodeURIComponent(absolute);
        // If IMAGE_PROXY already contains ?url= assume it's the prefix; otherwise append
        return IMAGE_PROXY.includes('?') ? `${IMAGE_PROXY}${encoded}` : `${IMAGE_PROXY}?url=${encoded}`;
      } catch (e) {
        return absolute;
      }
    }
    return absolute;
  };

  const DEFAULT_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="100%" height="100%" fill="#efefef"/><text x="50%" y="50%" dy="0.35em" text-anchor="middle" fill="#999" font-family="Arial" font-size="22">Sem imagem</text></svg>`)}`;

  const [showDetails, setShowDetails] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [imgSrc, setImgSrc] = useState(() => buildAbsolute(image) || DEFAULT_SVG);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const getDifficultyColor = (level) => {
    switch(level) {
      case 'Fácil':
        return 'bg-green-100 text-green-800';
      case 'Moderada':
      case 'Moderado':
        return 'bg-yellow-100 text-yellow-800';
      case 'Difícil':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    const candidate = buildAbsolute(image) || DEFAULT_SVG;
    let cancelled = false;

    const preloadImage = (src, timeout = 8000) => new Promise((resolve) => {
      if (!src) return resolve(false);
      // If it's already the placeholder data URL, resolve true immediately
      if (src.startsWith('data:image')) return resolve(true);
      const img = new Image();
      let timer = null;
      img.onload = () => {
        if (timer) clearTimeout(timer);
        resolve(true);
      };
      img.onerror = () => {
        if (timer) clearTimeout(timer);
        resolve(false);
      };
      // timeout fallback
      timer = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        resolve(false);
      }, timeout);
      img.src = src;
    });

    (async () => {
      try {
        const ok = await preloadImage(candidate);
        if (!cancelled) setImgSrc(ok ? candidate : DEFAULT_SVG);
      } catch (e) {
        if (!cancelled) setImgSrc(DEFAULT_SVG);
      }
    })();

    const fetchFavoriteStatus = async () => {
      if (!user) {
        setFavorited(false);
        return;
      }
      const token = localStorage.getItem('access_token');
      try {
        const response = await fetch(`${API_BASE_URL}tracks/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setFavorited(data.is_favorited);
        } else {
          console.error('Erro ao buscar status de favorito:', response.statusText);
          setFavorited(false);
        }
      } catch (error) {
        console.error('Erro de rede ao buscar status de favorito:', error);
        setFavorited(false);
      }
    };

  // fetchFavoriteStatus(); // LINHA TEMPORARIAMENTE DESATIVADA
    setFavorited(false);

    // Sincroniza o usuário (já existia)
    const syncUser = () => {
      const saved = localStorage.getItem('user');
      setUser(saved ? JSON.parse(saved) : null);
    };
    window.addEventListener('storage', syncUser);
    window.addEventListener('userChanged', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('userChanged', syncUser);
      cancelled = true;
    };
  }, [id, user]);

  const handleToggle = () => setShowDetails((prev) => !prev);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Você precisa estar logado para favoritar trilhas!');
      return;
    }

    const token = localStorage.getItem('access_token');
    const method = favorited ? 'DELETE' : 'POST';

    try {
      const response = await fetch(`${API_BASE_URL}tracks/${id}/favorite/`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setFavorited(!favorited);
        alert(favorited ? 'Trilha removida dos favoritos!' : 'Trilha favoritada com sucesso!');
      } else if (response.status === 409) {
        alert('Trilha já favoritada!');
        setFavorited(true);
      } else if (response.status === 404 && method === 'DELETE') {
        alert('Trilha não encontrada nos seus favoritos para remover.');
        setFavorited(false);
      } else {
        console.error('Erro na API de favoritos:', response.statusText);
        alert('Ocorreu um erro ao processar o favorito.');
      }
    } catch (error) {
      console.error('Erro de rede ao favoritar/desfavoritar:', error);
      alert('Erro de conexão ao tentar favoritar/desfavoritar.');
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sombra hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative">
      {/* Imagem do Card */}
      <div 
        className="h-56 bg-cover bg-center relative"
        style={{ backgroundImage: `url('${imgSrc}')` }}
      >
        {/* Gradiente de sobreposição */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
        
        {/* Imagem oculta para captar erros */}
        <img 
          src={imgSrc} 
          alt="" 
          style={{ display: 'none' }} 
          onError={() => setImgSrc(DEFAULT_SVG)} 
        />
        
        {/* Título */}
        <h2 className="absolute bottom-5 left-5 text-white text-2xl font-bold z-10 drop-shadow-lg">
          {title}
        </h2>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-5">
        {/* Informações da Trilha */}
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          {/* Dificuldade */}
          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
          
          {/* Tempo */}
          <span className="text-gray-600 text-sm flex items-center gap-1">
            <i className="far fa-clock"></i> {time} min
          </span>
          
          {/* Distância */}
          <span className="text-gray-600 text-sm flex items-center gap-1">
            <i className="fas fa-route"></i> {distance} m
          </span>
        </div>

        {/* Descrição */}
        <p className="text-gray-700 mb-5 leading-relaxed">
          {sanitizedDescription}
        </p>

        {/* Botão Ver Detalhes */}
        <button 
          onClick={handleToggle}
          className="w-full px-4 py-2 bg-verde-medio text-white rounded-full font-bold hover:bg-verde-escuro transition-all duration-300 flex items-center justify-center gap-2 mb-3"
        >
          <i className={`fas fa-chevron-${showDetails ? 'up' : 'down'}`}></i> 
          {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
        </button>

        {/* Detalhes Expandíveis */}
        <div 
          className={`overflow-hidden transition-all duration-500 ${showDetails ? 'max-h-96' : 'max-h-0'}`}
          id={id}
        >
          <div className="bg-gray-50 rounded-lg p-5 mt-3">
            {/* Informações da Trilha */}
            <h3 className="text-lg font-bold text-verde-escuro mb-3">Informações da Trilha</h3>
            <ul className="list-none space-y-2 mb-4">
              {sanitizedDetails && sanitizedDetails.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <i className="fas fa-check text-verde-claro mt-1 flex-shrink-0"></i>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Destaques */}
            <h3 className="text-lg font-bold text-verde-escuro mb-3">Destaques</h3>
            <p className="text-gray-700 mb-5">
              {sanitizedHighlights}
            </p>

            {/* Botão Ver no Mapa */}
            <button className="w-full px-4 py-2 border-2 border-verde-medio text-verde-medio rounded-full font-bold hover:bg-verde-medio hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
              <i className="fas fa-map-marked-alt"></i> Ver no mapa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trilhacard;
