// src/services/recognitionService.js
import api from './api';

const recognitionService = {
    // 🎯 Função para enviar um novo reconhecimento - RECEBE APENAS O EMAIL
    createRecognition: async (payload) => {
        // O payload agora terá 'recipient_email' em vez de 'recipient_id'
        const response = await api.post('/recognitions', payload);
        return response.data;
    },

    getRankings: async (month, year) => {
        try {
            // Cria um objeto de parâmetros (query params)
            const params = {};
            if (month) params.month = month;
            if (year) params.year = year;
            
            // Faz a requisição, passando os parâmetros. 
            // Ex: GET /api/recognitions/ranking?month=12&year=2025
            const response = await api.get('/rankings', { params });
            
            // O backend deve retornar: { topSenders: [...], topReceivers: [...] }
            return response.data; 

        } catch (error) {
            // Re-lança o erro para ser capturado no componente
            throw error; 
        }
    },

    getDashboardData : async () => {
        try {
            const response = await api.get('/recognitions/dashboard');
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar dados do dashboard:", error);
            return {
                usersCount: 0,
                recognitionsCount: 0,
                monthlyData: [],
                monthlyRankings: []
            };
        }
    },


    // ❌ REMOVEMOS: getAllEmployees. Não precisamos mais da lista de colaboradores.
};

export default recognitionService;