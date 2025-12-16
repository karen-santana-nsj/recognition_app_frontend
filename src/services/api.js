// src/services/api.js (ou o arquivo de configuração do seu Axios)
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

// 🎯 INTERCEPTOR DE RESPOSTA
api.interceptors.response.use(
    (response) => {
        // Retorna a resposta se for um sucesso (2xx)
        return response;
    },
    (error) => {
        // Verifica se é um erro 401 (Não Autorizado)
        if (error.response && error.response.status === 401) {
            
            console.log("Token rejeitado pelo servidor (401). Forçando logout.");

            // 1. Limpa o token do Axios para evitar novas chamadas com erro
            delete api.defaults.headers.common['Authorization'];

            // 2. Limpa o armazenamento local (pois o contexto não está acessível aqui)
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            
            // 3. Força o redirecionamento para o login
            // A melhor forma é usar a API de navegação
            window.location.href = '/login'; // O `window.location.href` é um "hard" redirect

            // Retorna uma Promise rejeitada para parar a execução da requisição original
            return Promise.reject(error);
        }
        // Retorna outros erros para serem tratados no código que chamou a API
        return Promise.reject(error);
    }
);

export default api;