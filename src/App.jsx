// src/App.jsx

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Importação das Páginas e Componentes
import Layout from './components/Layout';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import RecognitionDashboard from './pages/Recognition/RecognitionDashboard'; 
import SendRecognition from './pages/Recognition/SendRecognition';
import UserProfile from './pages/UserProfile';
import UsersDashboard from './pages/UsersDashboard';
import UploadImages from './pages/UploadImages';
import RecognitionRanking from './pages/Recognition/RecognitionRanking';

// ====================================================================
// 🎯 1. Componente Wrapper para Rotas Protegidas (Corrigido para v6)
// Este componente agora recebe as rotas filhas (Pages) como 'children'.
// Ele também inclui o Layout e o tratamento de carregamento.
// ====================================================================

const ProtectedRoute = ({ children }) => {
    // Pega o estado de autenticação e o estado de carregamento inicial
    const { user, loading } = useAuth();
    const location = useLocation();

    // 1. Tratamento de Carregamento
    // Enquanto a sessão está sendo verificada (no useEffect), mostramos o carregamento.
    if (loading) {
        // Você pode substituir por um componente de Spinner mais elaborado
        return <div style={{ padding: '20px', textAlign: 'center' }}>Carregando dados de autenticação...</div>;
    }

    // 2. Redirecionamento (Não Autenticado)
    // Se não houver usuário logado, redireciona para a tela de login.
    if (!user) {
        // Usamos state: { from: location } para que, após o login, o usuário
        // possa ser redirecionado de volta para onde estava.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Usuário Autenticado (Renderiza o Layout e o conteúdo da página)
    return (
        <Layout> 
            {children}
        </Layout>
    );
};


// ====================================================================
// 🎯 2. Componente Principal App com Rotas Ajustadas
// ====================================================================

const App = () => {
    return (
        <Routes>
            
            {/* 🚪 Rotas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />}/>

            {/* ↪️ Rota Inicial (Redireciona para uma rota protegida) */}
            <Route path="/" element={<Navigate to="/send-recognition" />} /> 
            
            {/* 🔒 Rotas Protegidas (Usando ProtectedRoute como um Wrapper) */}
            
            <Route 
                path="/send-recognition" 
                element={
                    <ProtectedRoute>
                        <SendRecognition />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="/ranking" 
                element={
                    <ProtectedRoute>
                        <RecognitionRanking />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="admin/dashboard" 
                element={
                    <ProtectedRoute>
                        <RecognitionDashboard />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="/admin/upload-images" 
                element={
                    <ProtectedRoute>
                        <UploadImages />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="/admin/users-dashboard" 
                element={
                    <ProtectedRoute>
                        <UsersDashboard />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="/profile" 
                element={
                    <ProtectedRoute>
                        <UserProfile />
                    </ProtectedRoute>
                } 
            />

            {/* 🚫 Rota 404/Não Encontrada (Redireciona para o dashboard principal ou home) */}
            <Route path="*" element={<Navigate to="/send-recognition" />} />
        </Routes>
    );
};

export default App;