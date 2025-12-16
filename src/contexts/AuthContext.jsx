// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api'; // 🎯 Importa a instância do Axios
import { supabase } from '../config/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Tenta carregar o usuário do localStorage ao iniciar
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();

    // Função de Login REAL
    const login = async (email, password) => {
        try {
            // 1. Chamada POST para o endpoint de login do backend
            const response = await api.post('/auth/signin', {
                email,
                password,
            });
            

            // 2. Extrai os dados do usuário (esperando que o backend retorne { user: {}, token: '' })
            const { token, user: userData } = response.data;
            
            // 3. Salva o token no cabeçalho padrão do Axios para futuras chamadas
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // 4. Salva o usuário no estado e no armazenamento local
            setUser(userData);
            
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', token);

            return { success: true, user: userData };

        } catch (error) {
            // Trata erros de rede ou resposta 4xx/5xx
            const errorMessage = error.response?.data?.message || 'Falha ao conectar ou credenciais inválidas.';
            return { success: false, error: errorMessage };
        }
    };

    const logout = async (isServerInitiated = false) => {
    if (isLoggingOut) return; // Se já está em processo, pare.

    // Sinaliza que o logout está começando
    setIsLoggingOut(true); 

    try {
        // 1. CHAMA O MÉTODO DE SAIR DO SUPABASE
        // *Somente* se o logout não foi iniciado pelo próprio servidor/Supabase (isServerInitiated = false)
        if (!isServerInitiated) { 
             const { error } = await supabase.auth.signOut();
             if (error) {
                 console.error('Erro ao chamar signOut no Supabase:', error.message);
             }
        }
        
        // 2. LIMPEZA NO LADO DO CLIENTE
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        
        // 3. REDIRECIONA
        navigate('/login'); 

    } catch (error) {
        console.error('Erro no processamento do logout:', error.message);
    } finally {
        // 4. Sinaliza que o logout terminou (após a limpeza/redirecionamento)
        setIsLoggingOut(false);
    }
};

    // Função de Cadastro (Requer conexão)
    const signup = async (name,email, password) => {
        try {
            await api.post('/auth/signup', { name, email, password });
            return { success: true, message: 'Cadastro realizado com sucesso! Faça login.' };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Falha no cadastro ou usuário já existe.';
            return { success: false, error: errorMessage };
        }
    };

    // NOVA FUNÇÃO
    const updateProfile = async (newName) => {
        try {
            // Chamada PUT para o novo endpoint. O token é anexado automaticamente pelo Axios.
            const response = await api.put('/users/profile', { name: newName });
            
            // O backend retorna o objeto 'user' atualizado
            const updatedUser = response.data.user;

            // Atualiza o estado e o localStorage
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            return { success: true, message: response.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Falha ao atualizar o perfil.';
            return { success: false, error: errorMessage };
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        signup,
        updateProfile,
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        
        // Se encontramos um token no armazenamento local...
        if (storedToken) {
            // ...configuramos o cabeçalho de autorização no Axios.
            // Isso é o que garante que as chamadas à API sejam autorizadas APÓS um refresh.
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            console.log("Token do Axios recarregado para chamadas autorizadas.");
        }
        
    }, []); // 👈 O array vazio garante que ele rode APENAS uma vez

    useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (_event === 'SIGNED_OUT' || (_event === 'TOKEN_REFRESHED' && !session)) {
            // Se o evento foi disparado pelo Supabase, passamos 'true'
            logout(true); // <--- AQUI ESTÁ A CHAVE DA SOLUÇÃO!
        } else if (session) {
            setUser(session.user);
        }
    });

    setLoading(false); 
    
    return () => {
        if (listener && listener.subscription) {
            listener.subscription.unsubscribe();
        }
    };

    // Adicione 'isLoggingOut' para garantir que o efeito seja re-avaliado, se necessário,
    // embora [logout] deva ser suficiente por agora.
}, [logout, isLoggingOut]);
        
       

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};