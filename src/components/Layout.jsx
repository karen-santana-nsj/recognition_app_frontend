// src/components/Layout.jsx
import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        // Container principal flexível com fundo cinza claro
        <div className="flex min-h-screen bg-gray-50">
            {/* O Sidebar é fixo e tem largura w-64 */}
            <Sidebar />
            
            {/* 🎯 Conteúdo Principal: A ml-64 (margin-left) garante o espaço da sidebar */}
            <main className="flex-1 p-8 ml-64"> 
                {children}
            </main>
        </div>
    );
};

export default Layout;