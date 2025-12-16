// src/hooks/useAdminUsers.js
import { useState, useEffect, useCallback } from 'react';
import  api  from '../services/api'; // Sua instância Axios configurada

const useAdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Função para buscar a lista de usuários
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/users'); 
            setUsers(response.data.data.users);
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Não foi possível carregar os usuários.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Função para criar um novo usuário
    const createUser = async (userData) => {
        try {
            const response = await api.post('/users', userData);
            const newUser = response.data.user;
            
            // Adiciona o novo usuário à lista atual (melhoria de UX)
            setUsers(prevUsers => [...prevUsers, newUser].sort((a, b) => a.name.localeCompare(b.name)));
            return { success: true, message: response.data.message };
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Falha ao criar usuário.';
            return { success: false, error: errorMessage };
        }
    };

    // Função para excluir um usuário
    const deleteUser = async (userId) => {
        try {
            await api.delete(`/users/${userId}`);
            
            // Remove o usuário da lista local
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            return { success: true, message: 'Usuário excluído com sucesso.' };
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Falha ao excluir usuário.';
            return { success: false, error: errorMessage };
        }
    };

    // Função para mudar o status de administrador
    const toggleAdmin = async (userId, newStatus) => {
        try {
            const response = await api.patch(`/users/toggle-admin/${userId}`, { isAdmin: newStatus });
            const updatedUser = response.data.user;

            // Atualiza o usuário na lista local
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId ? { ...user, isAdmin: updatedUser.isAdmin } : user
                )
            );
            return { success: true, message: response.data.message };
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Falha ao mudar status.';
            return { success: false, error: errorMessage };
        }
    };

    // Carrega os usuários na montagem
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { 
        users, 
        isLoading, 
        error, 
        fetchUsers, // Para recarregar a lista manualmente, se necessário
        createUser, 
        deleteUser, 
        toggleAdmin 
    };
};

export default useAdminUsers;