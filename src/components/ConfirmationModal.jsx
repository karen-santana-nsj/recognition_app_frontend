import React from 'react';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText }) => {
    if (!isOpen) return null;

    return (
        // Overlay (fundo escuro que cobre toda a tela)
        <div className="fixed inset-0 bg-black/10  flex items-center justify-center z-50 p-4">
            
            {/* Modal Box */}
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden transform transition-all duration-300 scale-100">
                
                {/* Cabeçalho */}
                <div className="px-6 py-4 bg-gray-50 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                </div>
                
                {/* Corpo da Mensagem */}
                <div className="p-6">
                    <p className="text-gray-600">{message}</p>
                </div>
                
                {/* Rodapé e Ações */}
                <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-150"
                    >
                        {cancelText || 'Cancelar'}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-150"
                    >
                        {confirmText || 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;