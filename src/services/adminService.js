// src/services/adminService.js (Com chamadas reais para o backend)

import api from './api'; // 🎯 Sua instância real do Axios/Fetch configurada

const ADMIN_ENDPOINT = '/admin/images';

const adminService = {
    /**
     * Busca todas as imagens disponíveis para uso no reconhecimento.
     * Requer permissão de Admin (o token é enviado pelo interceptor).
     * @returns Promise<AxiosResponse> Lista de objetos de imagem.
     */
    getAvailableImages: async () => {
        try {
            return await api.get(ADMIN_ENDPOINT);
        } catch (error) {
            console.error("Erro ao buscar imagens de admin:", error);
            throw error;
        }
    },

    /**
     * Faz upload de uma nova imagem.
     * @param {FormData} formData O formulário que contém o arquivo de imagem.
     * @returns Promise<AxiosResponse> O objeto da imagem recém-criada.
     */
    uploadImage: async (formData) => {
        try {
            // O cabeçalho 'Content-Type': 'multipart/form-data' é crucial para o envio de arquivos.
            // O Axios geralmente infere isso do objeto FormData, mas é bom garantir.
            return await api.post(ADMIN_ENDPOINT, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (error) {
            console.error("Erro ao fazer upload da imagem:", error);
            throw error;
        }
    },

    /**
     * Remove uma imagem pelo ID.
     * @param {number} imageId O ID da imagem a ser removida.
     * @returns Promise<AxiosResponse>
     */
    deleteImage: async (imageId) => {
        try {
            return await api.delete(`${ADMIN_ENDPOINT}/${imageId}`);
        } catch (error) {
            console.error(`Erro ao remover a imagem ${imageId}:`, error);
            throw error;
        }
    },
};

export default adminService;