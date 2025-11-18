// Arquivo de configuração de URL do backend para facilitar troca entre local e produção
// Em desenvolvimento (vite) preferimos usar o proxy definido em `vite.config.js`
// assim o navegador não sofre com CORS. Em produção usamos a URL completa.
const PROD_API = "https://painful.aksaraymalaklisi.net/api/";

// import.meta.env.DEV é true quando rodando via `vite` (npm run dev)
export const API_BASE_URL = import.meta.env.DEV ? '/api/' : PROD_API;
