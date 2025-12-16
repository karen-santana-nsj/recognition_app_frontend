// src/services/imageService.js

import api from './api'; // Seu cliente Axios configurado

const imageService = {
    /**
     * Busca todas as imagens disponíveis (ativas) no banco de dados.
     * Esta rota será protegida apenas por autenticação (authController.protect).
     */
    getAvailableImages: async () => {
        const response = await api.get('/images'); // Endpoint: /api/images
        return response.data;
    },
};

export default imageService;