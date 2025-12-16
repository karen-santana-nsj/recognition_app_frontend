// src/pages/Auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Sparkles } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsLoading(true);

        // 🎯 LÓGICA DO BACKEND AQUI: Chamar a API para enviar o email de reset

        // Simulação de sucesso após 2 segundos
        setTimeout(() => {
            setIsLoading(false);
            setMessage({ 
                type: 'success', 
                text: 'Se o seu email estiver cadastrado, você receberá um link de redefinição.'
            });
            setEmail('');
        }, 2000);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-2xl shadow-2xl border border-gray-100">

                <div className="flex flex-col items-center">
                    <div className="p-3 bg-yellow-500 rounded-full shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Esqueci Minha Senha
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Informe seu email para receber o link de recuperação.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Email de Cadastro" 
                            required 
                            className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-150 shadow-md hover:shadow-lg"
                    >
                        {isLoading ? (
                            'Enviando...'
                        ) : (
                            <><Mail className="w-5 h-5 mr-2" /> Enviar Link</>
                        )}
                    </button>
                </form>
                
                {message.text && (
                    <p className={`text-sm text-center p-3 rounded-lg border ${message.type === 'success' ? 'text-green-600 bg-green-100 border-green-300' : 'text-red-600 bg-red-100 border-red-300'}`}>
                        {message.text}
                    </p>
                )}

                <p className="text-center text-sm text-gray-600">
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition duration-150">
                        Voltar para o Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;