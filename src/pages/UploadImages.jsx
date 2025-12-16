// src/pages/Admin/UploadImages.jsx
import React, { useState, useEffect } from 'react';
import { Upload, Trash2, ImageIcon, PlusCircle, AlertTriangle, Loader } from 'lucide-react';
import adminService from '../services/adminService'; // 🎯 Serviço de API real
import { useAuth } from '../contexts/AuthContext'; 

const UploadImages = () => {
    const { user } = useAuth(); 
    const [availableImages, setAvailableImages] = useState([]);
    const [fileToUpload, setFileToUpload] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // Usado para upload/delete
    const [isFetching, setIsFetching] = useState(true); // Usado para carregar a lista
    const [status, setStatus] = useState({ type: null, message: '' });

    // --- LÓGICA 1: CARREGAR IMAGENS AO INICIAR (GET) ---
    useEffect(() => {
        const fetchImages = async () => {
            try {
                setIsFetching(true);
                const response = await adminService.getAvailableImages();
                // Assumindo que a lista está em response.data
                setAvailableImages(response.data); 
            } catch (error) {
                console.error("Erro ao buscar imagens:", error);
                const msg = error.response?.data?.message || 'Erro ao carregar a lista de imagens.';
                setStatus({ type: 'error', message: msg });
            } finally {
                setIsFetching(false);
            }
        };

        fetchImages();
    }, []);

    // --- HANDLERS ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 2 * 1024 * 1024) { 
            setStatus({ type: 'error', message: 'O arquivo é muito grande. Máximo 2MB.' });
            setFileToUpload(null);
            return;
        }
        setFileToUpload(file);
        setStatus({ type: null, message: '' });
    };

    // --- LÓGICA 2: UPLOAD REAL (POST) ---
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!fileToUpload) {
            setStatus({ type: 'error', message: 'Selecione um arquivo para upload.' });
            return;
        }

        setIsLoading(true);
        setStatus({ type: null, message: '' });

        try {
            const formData = new FormData();
            formData.append('image', fileToUpload);
            // formData.append('altText', fileToUpload.name); // Opcional: enviar um nome/alt-text

            const response = await adminService.uploadImage(formData);
            
            // Assume que a API retorna o objeto da nova imagem com a URL final
            const newImage = response.data;

            setAvailableImages(prev => [newImage, ...prev]);
            setStatus({ type: 'success', message: `Imagem "${fileToUpload.name}" enviada com sucesso!` });
            setFileToUpload(null);

        } catch (error) {
            console.error("Upload failed:", error);
            const msg = error.response?.data?.message || 'Erro ao enviar a imagem.';
            setStatus({ type: 'error', message: msg });
        } finally {
            setIsLoading(false);
        }
    };

    // --- LÓGICA 3: REMOÇÃO REAL (DELETE) ---
    const handleRemove = async (imageId, imageName) => {
        if (!window.confirm(`Tem certeza que deseja remover a imagem "${imageName}"? Esta ação é irreversível e pode afetar reconhecimentos antigos.`)) {
            return;
        }
        
        setIsLoading(true); 
        setStatus({ type: null, message: '' });

        try {
            await adminService.deleteImage(imageId);
            
            // Remove do estado local após sucesso na API
            setAvailableImages(prev => prev.filter(img => img.id !== imageId));
            setStatus({ type: 'success', message: `Imagem removida com sucesso.` });

        } catch (error) {
            console.error("Deletion failed:", error);
            const msg = error.response?.data?.message || 'Erro ao remover a imagem.';
            setStatus({ type: 'error', message: msg });
        } finally {
            setIsLoading(false);
        }
    };

    const statusClasses = status.type === 'success' 
        ? 'bg-green-100 text-green-700 border-green-300' 
        : status.type === 'error' 
            ? 'bg-red-100 text-red-700 border-red-300'
            : '';

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-xl">
                
                <div className="flex items-center mb-8 border-b pb-4">
                    <ImageIcon className="w-8 h-8 text-blue-600 mr-3" />
                    <h1 className="text-3xl font-bold text-gray-800">
                        Painel de Upload de Imagens
                    </h1>
                </div>

                {/* Mensagens de Status */}
                {status.type && (
                    <div className={`p-4 mb-6 rounded-lg border text-sm ${statusClasses}`}>
                        {status.message}
                    </div>
                )}

                {/* --- SEÇÃO 1: UPLOAD DE NOVA IMAGEM --- */}
                <div className="border p-6 rounded-lg mb-8 bg-gray-50">
                    <h2 className="flex items-center text-xl font-semibold text-gray-700 mb-4">
                        <PlusCircle className="w-6 h-6 mr-2 text-blue-500" />
                        Adicionar Nova Imagem de Reconhecimento
                    </h2>
                    
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="flex items-center space-x-4">
                            
                            {/* Input de Arquivo Customizado */}
                            <label className="flex-1 block cursor-pointer bg-white border-2 border-dashed border-gray-300 hover:border-blue-500 transition duration-150 rounded-lg p-3 text-center">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                    className="hidden"
                                />
                                {fileToUpload ? (
                                    <span className="flex items-center justify-center text-green-600 font-medium">
                                        <ImageIcon className="w-5 h-5 mr-2" /> 
                                        {fileToUpload.name} (Pronto para enviar)
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center text-gray-500">
                                        <Upload className="w-5 h-5 mr-2" />
                                        Clique para selecionar um arquivo (Max: 2MB)
                                    </span>
                                )}
                            </label>

                            {/* Botão de Upload */}
                            <button
                                type="submit"
                                disabled={isLoading || !fileToUpload}
                                className="flex items-center py-3 px-6 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 shadow-md"
                            >
                                {isLoading ? (
                                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                                ) : (
                                    <Upload className="w-5 h-5 mr-2" />
                                )}
                                {isLoading ? 'Enviando...' : 'Fazer Upload'}
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1 text-yellow-500" />
                            A imagem deve ser relevante para as categorias de reconhecimento da empresa.
                        </p>
                    </form>
                </div>
                
                {/* --- SEÇÃO 2: IMAGENS ATUAIS --- */}
                <div className="mt-10">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                        Imagens Ativas ({availableImages.length})
                    </h2>
                    
                    {isFetching ? (
                        <div className="flex items-center justify-center p-8 text-blue-600">
                            <Loader className="w-6 h-6 mr-3 animate-spin" />
                            Carregando imagens...
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-6 justify-start">
                            {availableImages.map(image => (
                                <div key={image.id} className="w-40 h-40 relative rounded-lg shadow-lg overflow-hidden group">
                                    {/* 🎯 A URL é fornecida pelo backend, garantindo que seja acessível */}
                                    <img 
                                        src={image.url} 
                                        alt={image.alt} 
                                        className="w-full h-full object-cover transition duration-300 group-hover:opacity-70"
                                    />
                                    {/* Overlay de Remoção */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition duration-300">
                                        <button
                                            onClick={() => handleRemove(image.id, image.alt)} 
                                            className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition duration-150 flex items-center space-x-2"
                                            title={`Remover: ${image.alt}`}
                                            disabled={isLoading}
                                        >
                                            <Trash2 className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {!isFetching && availableImages.length === 0 && (
                         <p className="text-gray-500 p-4 border border-dashed rounded-lg">Nenhuma imagem ativa no momento. Faça um upload acima.</p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default UploadImages;