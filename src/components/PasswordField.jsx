// src/components/PasswordField.jsx
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordField = ({ id, value, onChange, placeholder, required, className }) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    return (
        <div className="relative">
            <input
                type={isVisible ? 'text' : 'password'}
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                // Adicionamos 'pr-10' para dar espaço ao ícone
                className={`appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ${className}`}
            />
            
            {/* Botão de Toggle de Visibilidade */}
            <button
                type="button"
                onClick={toggleVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition duration-150"
                aria-label={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
            >
                {/* Ícone de olho aberto ou fechado */}
                {isVisible ? (
                    <EyeOff className="h-5 w-5" />
                ) : (
                    <Eye className="h-5 w-5" />
                )}
            </button>
        </div>
    );
};

export default PasswordField;