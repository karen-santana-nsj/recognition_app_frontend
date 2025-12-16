// src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, LogIn } from 'lucide-react';
import PasswordField from '../../components/PasswordField';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const { login } = useAuth(); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');

        const result = await login(email, password);

        if (result.success) {
            navigate('/send-recognition'); 
        } else {
            setLoginError(result.error || 'Erro desconhecido ao tentar login.');
        }
    };

    return (
        // Container principal: Centraliza e define o fundo (bg-red-500 para o nosso teste!)
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-2xl shadow-2xl border border-gray-100 transform hover:shadow-3xl transition duration-300">

                <div className="flex flex-col items-center">
                    <div className="p-3 bg-blue-500 rounded-full shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="mt-6 text-4xl font-extrabold text-gray-900">
                        App de Reconhecimento
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Faça login para enviar e receber reconhecimentos.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <input 
                            type="email" 
                            id="email"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Email" 
                            required 
                            className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        />
                    </div>
                    {/* Input Senha (AGORA USANDO PasswordField) */}
                    <div>
                        <PasswordField
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Senha"
                            required
                        />
                    </div>

                    {/* Novo: Seção de Esqueci Minha Senha */}
                    <div className="flex items-center justify-end">
                        <div className="text-sm">
                            <Link 
                                to="/forgot-password" 
                                className="font-medium text-blue-600 hover:text-blue-500 transition duration-150"
                            >
                                Esqueci minha senha
                            </Link>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 shadow-md hover:shadow-lg"
                    >
                        <LogIn className="w-5 h-5 mr-2" />
                        Entrar
                    </button>
                </form>

                {loginError && (
                    <p className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-lg border border-red-300">
                        {loginError}
                    </p>
                )}

                <p className="text-center text-sm text-gray-600">
                    Novo na equipe? 
                    <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-500 ml-1 transition duration-150">
                        Cadastre-se aqui
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;