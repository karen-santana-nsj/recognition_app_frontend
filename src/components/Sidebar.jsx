// src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import { Send, Trophy, Upload, Users, User, LogOut, Shield, LayoutDashboard } from 'lucide-react'; 

const Sidebar = () => {
    const { user, signout } = useAuth();
    const navigate = useNavigate();

    // 1. Chame o hook para obter a função de logout
    const { logout } = useAuth();

    // 2. Crie uma função de handler, opcionalmente, para facilitar a leitura
    const handleLogout = (e) => {
        e.preventDefault(); // Boa prática, especialmente se for um link <a>
        logout(); // 🎯 Chama a função de logout do contexto
    };
    
    // Simulação da lógica de Admin
    // Mantenha como true para testes
    const isAdmin = user?.isAdmin || false; 
    

    const navItems = [
        { name: 'Reconhecimento', icon: Send, path: '/send-recognition' },
        { name: 'Ranking', icon: Trophy, path: '/ranking' },
    ];

    const adminItems = [
        { name: 'Upload de Imagens', icon: Upload, path: '/admin/upload-images' },
        { name: 'Gestão de Usuários', icon: Users, path: '/admin/users-dashboard' },
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    ];
    
    const renderNavItem = (item, isUserAvatar = false) => {
        const Icon = item.icon;
        
        // Estilos base para todos os links
        const baseClass = "flex items-center p-3 rounded-lg transition duration-200 text-sm";
        
        // Estilos para o link principal (NavLink)
        const linkClasses = ({ isActive }) => 
            `${baseClass} 
             ${isUserAvatar ? 'hover:bg-gray-200 text-gray-800' : ''}
             ${isActive && !isUserAvatar 
                ? 'bg-blue-500 text-white font-semibold shadow-md' // Ativo: Azul
                : 'text-gray-700 hover:bg-gray-100' // Inativo: Cinza Escuro, Hover: Cinza Claro
            }`;

        return (
            <NavLink
                key={item.path}
                to={item.path}
                className={linkClasses}
            >
                {/* Ícone ou Avatar */}
                <div className={`${isUserAvatar ? 'w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold mr-3' : ''}`}>
                    {isUserAvatar ? (
                        user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />
                    ) : (
                        <Icon className="w-5 h-5 mr-3" />
                    )}
                </div>
                <span className="truncate">{item.name}</span>
            </NavLink>
        );
    }

    return (
        // 🎯 MUDANÇA AQUI: Fundo Branco (bg-white) e Sombra Leve
        <div className="w-64 bg-white text-gray-800 flex flex-col justify-between shadow-xl h-full fixed top-0 left-0 border-r border-gray-200 z-40">
            
            {/* Top Section: Logo e Navegação Principal */}
            <div>
                <div className="p-6 text-2xl font-bold text-blue-600 border-b border-gray-200">
                    Reconhecimento 
                </div>
                
                <nav className="p-4 space-y-2">
                    {/* Links Comuns */}
                    {navItems.map(item => renderNavItem(item))}

                    {/* Links de Admin */}
                    {isAdmin && (
                        <>
                            {/* Detalhes em Azul */}
                            <div className="flex items-center p-3 text-xs text-blue-600 font-semibold uppercase mt-4 border-t border-gray-200 pt-4">
                                <Shield className="w-4 h-4 mr-2" /> 
                                Admin Master
                            </div>
                            {adminItems.map(item => renderNavItem(item))}
                        </>
                    )}
                </nav>
            </div>
            
            {/* Bottom Section: Usuário e Sair */}
            <div className="p-4 border-t border-gray-200 space-y-2">
                
                {/* 1. Link para Editar Conta */}
                {renderNavItem({
                    name: user?.name || user?.email || 'Meu Perfil',
                    icon: User,
                    path: '/profile'
                }, true)}

                {/* 2. Botão para Sair */}
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-3 rounded-lg transition duration-200 text-sm text-gray-700 hover:bg-red-100 hover:text-red-600"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span>Sair</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;