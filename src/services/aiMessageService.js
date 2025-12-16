// src/services/aiMessageService.js (Assumindo Axios e correção para tratamento de erro)

import api from './api';

const aiMessageService = {
    generateRecognitionMessage: async(recognitionType, qualities) => {
        const bodyPayload = { recognitionType, qualities };
        
        try {
            const response = await api.post('/recognitions/ai/generate', bodyPayload);
            return response.data.message;

        } catch (error) {
            // Se for um erro do Axios (status code diferente de 2xx)
            // O erro original do Axios (error.response.data) será lançado.
            
            // Lançamos o erro com a resposta para que o componente React possa ler o status
            throw error.response; // Lança o objeto de resposta, que contém status e data (corpo do erro)
        }
    }
}

export default aiMessageService;