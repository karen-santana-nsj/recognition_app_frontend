// src/pages/Profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Check, Edit2, XCircle } from 'lucide-react';
//import PageContainer from '../../components/PageContainer'; // Se você usa um wrapper

const UserProfile = () => {
    const { user, updateProfile } = useAuth();
    
    // Estado para o formulário de edição
    const [name, setName] = useState(user?.name || '');
    const [isEditing, setIsEditing] = useState(false);
    
    // Estado para feedback da API
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);

    // Garante que o estado 'name' seja atualizado se o 'user' mudar (ex: login/refresh)
    useEffect(() => {
        if (user?.name) {
            setName(user.name);
        }
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsLoading(true);

        if (name.trim() === '') {
            setMessage({ type: 'error', text: 'O nome não pode ser vazio.' });
            setIsLoading(false);
            return;
        }

        const result = await updateProfile(name);

        if (result.success) {
            setMessage({ type: 'success', text: result.message });
            setIsEditing(false); // Fecha o modo de edição ao salvar
        } else {
            setMessage({ type: 'error', text: result.error });
        }
        
        setIsLoading(false);
    };

    const handleCancel = () => {
        setName(user.name); // Volta para o nome original
        setIsEditing(false);
        setMessage({ type: '', text: '' });
    };

    return (
        
            <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                
                {/* Cabeçalho do Cartão */}
                <div className="flex items-center space-x-4 border-b pb-4 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 text-white text-xl font-bold">
                        {user?.name?.charAt(0).toUpperCase() || <User className="w-6 h-6" />}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {user?.name || 'Carregando...'}
                    </h1>
                </div>

                {/* Mensagem de Feedback */}
                {message.text && (
                    <div className={`p-3 mb-4 rounded-lg text-sm border ${
                        message.type === 'success' 
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : 'bg-red-100 text-red-700 border-red-300'
                    }`}>
                        {message.text}
                    </div>
                )}
                
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Campo Nome (Editável) */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700 block">
                            Nome Completo
                        </label>
                        <div className="flex items-center">
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={!isEditing || isLoading}
                                className={`flex-1 p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ${
                                    isEditing ? 'border-gray-300' : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                                }`}
                            />
                            {!isEditing ? (
                                <button
                                    type="button"
                                    onClick={() => {setIsEditing(true); setMessage({type: '', text: ''})}}
                                    className="ml-3 p-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition duration-150 flex items-center"
                                >
                                    <Edit2 className="w-4 h-4 mr-1" /> Editar
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="ml-3 p-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-150 flex items-center disabled:bg-blue-300"
                                    >
                                        <Check className="w-4 h-4 mr-1" /> {isLoading ? 'Salvando...' : 'Salvar'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                        className="ml-2 p-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150 flex items-center disabled:bg-red-300"
                                    >
                                        <XCircle className="w-4 h-4 mr-1" /> Cancelar
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Campo Email (Somente Leitura) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-500" /> Email
                        </label>
                        <input
                            type="text"
                            value={user?.email || ''}
                            disabled
                            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm"
                        />
                    </div>

                    {/* Campo Permissão (Somente Leitura) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                            <Shield className="w-4 h-4 mr-2 text-gray-500" /> Permissão
                        </label>
                        <input
                            type="text"
                            value={user?.isAdmin ? 'Administrador' : 'Colaborador'}
                            disabled
                            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm"
                        />
                    </div>
                </form>
            </div>
        
    );
};

export default UserProfile;