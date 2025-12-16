// src/pages/Admin/UsersDashboard.jsx
import React, { useState, useMemo } from 'react';
import useAdminUsers from '../hooks/useAdminUsers';
//import PageContainer from '../components/PageContainer';
import { Trash2, UserCog, Check, X, Loader2, Plus, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Para obter o ID do admin logado
import ConfirmationModal from '../components/ConfirmationModal';

// Componente para o formulário de criação (Modal ou inline)
const CreateUserForm = ({ onCreate }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', isAdmin: false });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        const result = await onCreate(formData);
        
        if (result.success) {
            setMessage({ type: 'success', text: result.message });
            setFormData({ name: '', email: '', password: '', isAdmin: false }); // Limpa o form
        } else {
            setMessage({ type: 'error', text: result.error });
        }
        setIsSubmitting(false);
    };

    return (
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-green-600" /> Cadastrar Novo Usuário
            </h2>
            
            {message.text && (
                <div className={`p-3 mb-4 rounded text-sm ${
                    message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {message.text}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="name" placeholder="Nome Completo" value={formData.name} onChange={handleChange} required 
                    className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required 
                    className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                
                <input type="password" name="password" placeholder="Senha Provisória" value={formData.password} onChange={handleChange} required 
                    className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                
                <div className="flex items-center">
                    <input type="checkbox" id="isAdmin" name="isAdmin" checked={formData.isAdmin} onChange={handleChange} 
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <label htmlFor="isAdmin" className="ml-2 text-sm font-medium text-gray-700">Tornar Administrador</label>
                </div>

                <button type="submit" disabled={isSubmitting}
                    className="w-full py-2 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-150 disabled:bg-green-300 flex items-center justify-center">
                    {isSubmitting ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Cadastrando...</>
                    ) : (
                        'Cadastrar Usuário'
                    )}
                </button>
            </form>
        </div>
    );
};

// Componente principal da Dashboard
const UsersDashboard = () => {
    const { users, isLoading, error, createUser, deleteUser, toggleAdmin } = useAdminUsers();
    const { user: loggedInUser } = useAuth(); // Para impedir auto-remoção de admin

    const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
    const [pendingAction, setPendingAction] = useState(null); // { id: '...', type: 'delete' | 'toggle' }

    // 🎯 NOVO ESTADO PARA A BARRA DE PESQUISA
    const [searchTerm, setSearchTerm] = useState('');

    // 🎯 NOVO ESTADO PARA O MODAL DE EXCLUSÃO
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // 🎯 NOVO ESTADO PARA O MODAL
    const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
    const [userToToggle, setUserToToggle] = useState(null); // Armazena o usuário sendo editado

    // 🎯 LÓGICA DE FILTRAGEM (USANDO useMemo para otimizar)
    const filteredUsers = useMemo(() => {
        if (!searchTerm) {
            return users;
        }

        const lowercasedSearch = searchTerm.toLowerCase();

        return users.filter(user => 
            user.name.toLowerCase().includes(lowercasedSearch) ||
            user.email.toLowerCase().includes(lowercasedSearch)
        );
    }, [users, searchTerm]); // Recalcula apenas se users ou searchTerm mudar

    // Handlers para o Modal de Exclusão
    const handleOpenDeleteModal = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    // 🎯 Lógica Principal de Exclusão (Executada após a confirmação do modal)
    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        // 1. Fecha o modal imediatamente
        handleCancelDelete(); 
        
        const user = userToDelete;

        // 2. Inicia o estado de loading
        setPendingAction({ id: user.id, type: 'delete' });
        
        // 3. Chama a função real no hook
        const result = await deleteUser(user.id);
        
        // 4. Exibe a mensagem de sucesso/erro
        setActionMessage({ 
            type: result.success ? 'success' : 'error', 
            text: result.success ? `Usuário ${user.name} excluído com sucesso!` : result.error 
        });

        // 5. Finaliza o loading
        setPendingAction(null);
        setTimeout(() => setActionMessage({ type: '', text: '' }), 5000);
    };

    // Handler para abrir o modal de toggle
    const handleOpenToggleModal = (user) => {
        setUserToToggle(user);
        setIsToggleModalOpen(true);
    };

    // Handler para fechar o modal
    const handleCancelToggle = () => {
        setIsToggleModalOpen(false);
        setUserToToggle(null);
    };

    // 🎯 Lógica Principal do Toggle (Executada após a confirmação do modal)
    const handleConfirmToggle = async () => {
        if (!userToToggle) return;

        handleCancelToggle(); // Fecha o modal imediatamente
        
        const user = userToToggle;
        
        setPendingAction({ id: user.id, type: 'toggle' });
        
        // Chama a função real no hook
        const result = await toggleAdmin(user.id, !user.isAdmin);

        setActionMessage({ 
            type: result.success ? 'success' : 'error', 
            text: result.success ? result.message : result.error 
        });
        setPendingAction(null);
        setTimeout(() => setActionMessage({ type: '', text: '' }), 5000);
    };

    // Handlers para ações
    const handleDelete = async (user) => {
        // 🎯 AÇÃO: Apenas abre o modal, passando o objeto do usuário
        handleOpenDeleteModal(user);
    };

    const actionText = userToToggle?.isAdmin 
        ? 'REMOVER o status de Administrador' 
        : 'TORNAR Administrador';

    /* const handleToggleAdmin = async (user) => {
        if (!window.confirm(`Tem certeza que deseja ${user.isAdmin ? 'REMOVER' : 'TORNAR'} o usuário ${user.name} um Administrador?`)) return;

        setPendingAction({ id: user.id, type: 'toggle' });
        const result = await toggleAdmin(user.id, !user.isAdmin);

        setActionMessage({ 
            type: result.success ? 'success' : 'error', 
            text: result.success ? result.message : result.error 
        });
        setPendingAction(null);
        setTimeout(() => setActionMessage({ type: '', text: '' }), 5000);
    }; */

    if (isLoading) {
        return <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />;
    }

    if (error) {
        return <p className="text-red-600 font-semibold">{error}</p>;
    }

    return (
        <>
            {/* 🎯 NOVO MODAL DE CONFIRMAÇÃO */}
            <ConfirmationModal
                isOpen={isToggleModalOpen}
                title={`Confirmação de Alteração de Admin`}
                message={`Você tem certeza que deseja ${actionText} o usuário ${userToToggle?.name}?`}
                onConfirm={handleConfirmToggle}
                onCancel={handleCancelToggle}
                confirmText={actionText}
                cancelText="Manter"
            />

            {/* 🎯 NOVO MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title={`Confirmação de EXCLUSÃO`}
                message={`Você tem certeza que deseja EXCLUIR permanentemente o usuário ${userToDelete?.name}? Esta ação é irreversível.`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Sim, Excluir Permanentemente"
                confirmButtonStyle="bg-red-600 hover:bg-red-700" // Adiciona um estilo para ser mais visualmente destrutivo
                cancelText="Cancelar"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Coluna de Criação (Permanece à esquerda) */}
                <div className="lg:col-span-1">
                    <CreateUserForm onCreate={createUser} />
                </div>
                
                {/* Coluna da Tabela e Pesquisa */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        Lista de Colaboradores ({filteredUsers.length} de {users.length})
                    </h2>
                    
                    {/* 🎯 NOVA BARRA DE PESQUISA */}
                    <div className="mb-4 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Pesquisar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                    </div>
                    {/* FIM DA BARRA DE PESQUISA */}
                    
                    {actionMessage.text && (
                        <div className={`p-3 mb-4 rounded text-sm ${
                            actionMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {actionMessage.text}
                        </div>
                    )}
                    
                    <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {/* 🎯 Renderiza a lista FILTRADA */}
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className={user.id === loggedInUser.id ? 'bg-blue-50/50' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {user.name} {user.id === loggedInUser.id && <span className="text-blue-500 text-xs font-bold">(Você)</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {user.isAdmin ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        <Check className="w-4 h-4 mr-1" /> Sim
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        <X className="w-4 h-4 mr-1" /> Não
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex justify-center space-x-2">
                                                    {/* Botões de Ação */}
                                                    <button
                                                        onClick={() => handleOpenToggleModal(user)}
                                                        disabled={pendingAction || user.id === loggedInUser.id}
                                                        title={user.id === loggedInUser.id ? "Não pode remover seu próprio Admin Status" : "Mudar status de Administrador"}
                                                        className={`p-2 rounded-full transition duration-150 flex items-center ${
                                                            user.isAdmin 
                                                                ? 'bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300' 
                                                                : 'bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300'
                                                        }`}
                                                    >
                                                        {pendingAction?.id === user.id && pendingAction.type === 'toggle' ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <UserCog className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        disabled={pendingAction || user.id === loggedInUser.id}
                                                        title={user.id === loggedInUser.id ? "Não pode excluir sua própria conta" : "Excluir Usuário"}
                                                        className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition duration-150 disabled:bg-gray-300"
                                                    >
                                                        {pendingAction?.id === user.id && pendingAction.type === 'delete' ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-gray-500">
                                            Nenhum usuário encontrado com o termo de pesquisa "{searchTerm}".
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UsersDashboard;