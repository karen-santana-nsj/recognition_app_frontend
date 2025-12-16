// src/pages/Auth/Signup.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Sparkles } from 'lucide-react';
import PasswordField from '../../components/PasswordField';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [signupMessage, setSignupMessage] = useState({ type: '', text: '' });
    
    const { signup } = useAuth(); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSignupMessage({ type: '', text: '' });

        if (password !== confirmPassword) {
            setSignupMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }

        const result = await signup(name, email, password);

        if (result.success) {
            setSignupMessage({ type: 'success', text: result.message || 'Cadastro realizado com sucesso! Redirecionando...' });
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setSignupMessage({ type: 'error', text: result.error || 'Erro desconhecido ao cadastrar.' });
        }
    };

    const messageClasses = signupMessage.type === 'success' 
        ? 'text-green-600 bg-green-100 border-green-300' 
        : 'text-red-600 bg-red-100 border-red-300';

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-2xl shadow-2xl border border-gray-100 transform hover:shadow-3xl transition duration-300">
                
                <div className="flex flex-col items-center">
                    <div className="p-3 bg-blue-500 rounded-full shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Criar Nova Conta
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Junte-se à nossa equipe e comece a reconhecer!
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <input 
                            type="text" // 🎯 Novo campo Name
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Nome Completo" 
                            required 
                            className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        />
                    </div>
                    <div>
                        <input 
                            type="email" 
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
                    
                    {/* Input Confirmar Senha (AGORA USANDO PasswordField) */}
                    <div>
                        <PasswordField
                            id="confirmPassword"
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            placeholder="Confirmar Senha" 
                            required 
                        />
                    </div>
                    <button 
                        type="submit"
                        className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 shadow-md hover:shadow-lg"
                    >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Cadastrar
                    </button>
                </form>

                {/* Mensagem de Cadastro */}
                {signupMessage.text && (
                    <p className={`text-sm text-center p-3 rounded-lg border ${messageClasses}`}>
                        {signupMessage.text}
                    </p>
                )}

                <p className="text-center text-sm text-gray-600">
                    Já tem uma conta? 
                    <Link to="/login" className="font-semibold text-green-600 hover:text-green-500 ml-1 transition duration-150">
                        Faça login aqui
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;