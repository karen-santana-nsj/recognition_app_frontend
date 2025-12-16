// src/pages/Recognition/SendRecognition.jsx
import React, { useState, useRef, useEffect } from 'react';
import recognitionService from '../../services/recognitionService';
// 🎯 Importar o novo serviço
import imageService from '../../services/imageService';
import aiMessageService from '../../services/aiMessageService';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Smile, Image as ImageIcon, X, Mail, Loader, AlertTriangle } from 'lucide-react';

// --- DADOS MOCK (Remover ou Manter Apenas Emojis) ---
const availableEmojis = ['😀', '🥳', '🔥', '👏', '🌟', '🚀', '💡', '💖'];

// REMOVIDO: const availableImages = [...]

const initialFormState = {
    recipientEmail: '',
    ccRecipientEmails: '',
    subject: 'Você recebeu um reconhecimento incrível!',
    message: '',
    selectedImageId: null,
};

const SendRecognition = () => {
    const messageRef = useRef(null);
    const { user } = useAuth();
    const [formData, setFormData] = useState(initialFormState);
    const [status, setStatus] = useState({ type: null, message: '' });
    const [isLoading, setIsLoading] = useState(false);

    // 🎯 NOVO ESTADO: Armazenar as imagens reais
    const [availableImages, setAvailableImages] = useState([]);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(null);

    //Modal da IA
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [aiForm, setAiForm] = useState({
        recognitionType: 'reconhecimento', // 'reconhecimento', 'moeda', 'voucher'
        qualities: '', // Palavras-chave ou qualidades
    });
    const [aiGeneratedText, setAiGeneratedText] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    // NOVO ESTADO: Status de erro SÓ para o Modal de IA
    const [aiStatus, setAiStatus] = useState({ type: null, message: '' });


    // --- HOOK: Busca as Imagens Disponíveis no Backend ---
    useEffect(() => {
        const fetchImages = async () => {
            try {
                setImageLoading(true);
                const data = await imageService.getAvailableImages();
                setAvailableImages(data);
                setImageError(null);
            } catch (err) {
                console.error("Falha ao carregar imagens:", err);
                setImageError('Não foi possível carregar as imagens do servidor. Tente novamente.');
                // Em caso de erro, definimos a lista como vazia
                setAvailableImages([]);
            } finally {
                setImageLoading(false);
            }
        };

        fetchImages();
    }, []); // Roda apenas uma vez ao montar o componente
    // -----------------------------------------------------

    const handleAIGenerate = async () => {
        setIsAiGenerating(true);
        setAiGeneratedText('');
        setAiStatus({ type: null, message: '' }); // Limpa o status do modal

        const { recognitionType, qualities } = aiForm;
        
        // MANTÉM: Validação de Qualidades
        if (!qualities.trim()) {
            setAiStatus({ type: 'error', message: 'Por favor, insira qualidades ou elogios para a IA escrever o texto.' });
            setIsAiGenerating(false);
            return;
        }

        try {
            const generatedText = await aiMessageService.generateRecognitionMessage(recognitionType, qualities);
            setAiGeneratedText(generatedText);

        } catch (error) {
            // 🎯 CORREÇÃO DA LÓGICA DE ERRO (Assumindo que o service lança error.response)
            const status = error.status || 500; // error.status contém o código HTTP
            let errorMessage = 'Falha ao gerar texto pela IA.';

            if (status === 503) {
                errorMessage = 'O sistema de IA está sobrecarregado no momento (código 503). Por favor, aguarde alguns segundos e **tente gerar a mensagem novamente**!';
            } else if (status === 400 && error.data?.message) {
                // Captura erros de validação do controller
                errorMessage = error.data.message; 
            } else if (status === 401 || status === 403) {
                 errorMessage = 'Erro de autenticação ou permissão com a API de IA.';
            } else {
                 errorMessage += ' Verifique sua chave de API e o endpoint.'
            }

            // 🛑 AGORA O ERRO VAI PARA O NOVO ESTADO DO MODAL
            setAiStatus({ type: 'error', message: errorMessage }); 
        } finally {
            setIsAiGenerating(false);
        }
    };

    const handleInsertAIText = () => {
        // 1. Insere o texto gerado no campo principal de mensagem
        setFormData(prev => ({
            ...prev,
            message: prev.message ? `${prev.message}\n\n${aiGeneratedText}` : aiGeneratedText
        }));

        // 2. Fecha o modal e limpa o estado da IA
        setIsModalOpen(false);
        setAiGeneratedText('');
        setAiForm({ recognitionType: 'reconhecimento', qualities: '' });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageSelect = (imageId) => {
        setFormData(prev => ({
            ...prev,
            selectedImageId: prev.selectedImageId === imageId ? null : imageId
        }));
    };

    const handleEmojiSelect = (emoji) => {
        if (!messageRef.current) return;

        const { selectionStart, selectionEnd } = messageRef.current;
        const currentMessage = formData.message;

        const newMessage =
            currentMessage.substring(0, selectionStart) +
            emoji +
            currentMessage.substring(selectionEnd);

        setFormData({ ...formData, message: newMessage });

        messageRef.current.focus();
        const newCursorPosition = selectionStart + emoji.length;

        setTimeout(() => {
            messageRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        }, 0);
    };

    const handleCancel = () => {
        setFormData(initialFormState);
        setStatus({ type: null, message: 'Envio cancelado. Formulário limpo.' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ type: null, message: '' });

        const { recipientEmail, subject, message, selectedImageId, ccRecipientEmails } = formData;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
            setIsLoading(false);
            setStatus({ type: 'error', message: 'Por favor, insira um email de destinatário válido.' });
            return;
        }

        const ccEmailsArray = ccRecipientEmails.split(',').map(e => e.trim()).filter(e => e);

        const payload = {
            sender_id: user.id,
            recipient_email: recipientEmail,
            cc_emails: ccEmailsArray,
            subject: subject,
            message: message,
            image_id: selectedImageId,
        };

        console.log('PAYLOAD SENDO ENVIADA:', payload);

        try {
            await recognitionService.createRecognition(payload);

            setStatus({ type: 'success', message: `Reconhecimento enviado para ${recipientEmail}!` });
            setFormData(initialFormState);

        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Erro ao enviar o reconhecimento.' });
        } finally {
            setIsLoading(false);
        }
    };

    const statusClasses = status.type === 'success'
        ? 'bg-green-100 text-green-700 border-green-300'
        : 'bg-red-100 text-red-700 border-red-300';

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-white p-10 rounded-xl shadow-xl">

                <div className="flex items-center mb-6 border-b pb-4">
                    <Mail className="w-8 h-8 text-blue-500 mr-3" />
                    <h2 className="text-3xl font-bold text-gray-800">Enviar Reconhecimento</h2>
                </div>

                {/* Mensagens de Status */}
                {status.type && (
                    <div className={`p-4 mb-6 rounded-lg border text-sm ${statusClasses}`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Linha 1: Para, De, Cópia (Sem mudanças) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* ... Campos Para, De, Cópia ... */}

                        {/* CAMPO 1: PARA (EMAIL) */}
                        <div>
                            <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 mb-1">Para (Email do Destinatário):</label>
                            <input
                                type="email"
                                id="recipientEmail"
                                name="recipientEmail"
                                value={formData.recipientEmail}
                                onChange={handleFormChange}
                                placeholder="nome@empresa.com"
                                required
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            />
                        </div>

                        {/* CAMPO 2: REMETENTE (Quem Está Logado) */}
                        <div>
                            <label htmlFor="sender" className="block text-sm font-medium text-gray-700 mb-1">De (Remetente):</label>
                            <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 text-sm truncate">
                                {user?.name ? `${user.name} (${user.email})` : user?.email}
                            </div>
                        </div>

                        {/* CAMPO 3: CÓPIA (CC) */}
                        <div>
                            <label htmlFor="ccRecipientEmails" className="block text-sm font-medium text-gray-700 mb-1">Cópia (Emails separados por vírgula):</label>
                            <input
                                type="text"
                                id="ccRecipientEmails"
                                name="ccRecipientEmails"
                                value={formData.ccRecipientEmails}
                                onChange={handleFormChange}
                                placeholder="email1@empresa.com, email2@empresa.com"
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            />
                        </div>
                    </div>

                    {/* Linha 2: Assunto (Sem mudanças) */}
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Assunto do Email:</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleFormChange}
                            required
                            className="block w-full px-4 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        />
                    </div>

                    {/* Linha 3: Emojis e Imagens (ATUALIZADA) */}
                    <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                            Personalize seu Reconhecimento:
                        </p>

                        {/* CAMPO 4: EMOJIS (Sem mudanças) */}
                        <div className="mb-4">
                            <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <Smile className="w-4 h-4 mr-2" /> Clique para inserir um Emoji na mensagem:
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {availableEmojis.map(emoji => (
                                    <button
                                        type="button"
                                        key={emoji}
                                        onClick={() => handleEmojiSelect(emoji)}
                                        className="text-2xl p-2 rounded-full hover:bg-gray-200 transition duration-150"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* CAMPO 5: IMAGENS (AGORA DINÂMICO) */}
                        <div>
                            <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <ImageIcon className="w-4 h-4 mr-2" /> Escolha uma Imagem (Opcional):
                            </div>

                            {/* Status de Carregamento/Erro */}
                            {imageLoading && (
                                <div className="flex items-center text-blue-500">
                                    <Loader className="w-4 h-4 mr-2 animate-spin" /> Carregando imagens...
                                </div>
                            )}
                            {imageError && (
                                <div className="flex items-center text-red-500 bg-red-50 p-2 rounded">
                                    <AlertTriangle className="w-4 h-4 mr-2" /> {imageError}
                                </div>
                            )}

                            {/* Exibição das Imagens */}
                            {!imageLoading && availableImages.length > 0 && (
                                <div className="flex flex-wrap gap-3">
                                    {availableImages.map(image => (
                                        <div
                                            key={image.id}
                                            onClick={() => handleImageSelect(image.id)}
                                            className={`
                                                w-24 h-24 rounded-lg overflow-visible cursor-pointer relative 
                                                transition duration-150 group 
                                                ${formData.selectedImageId === image.id
                                                    ? 'ring-4 ring-green-500 shadow-lg'
                                                    : 'hover:opacity-100 opacity-70 border border-gray-300'
                                                }
                                            `}
                                        >
                                            {/* Miniatura da Imagem */}
                                            <img
                                                src={image.url}
                                                alt={image.alt_text} // Usando alt_text do DB
                                                className="w-full h-full object-cover rounded-lg"
                                            />

                                            {/* POP-UP DE ZOOM EXTRA GRANDE */}
                                            <div className="
                                                absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                                                opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                                                pointer-events-none z-50 
                                                ">
                                                <div className="bg-white p-2 rounded-lg shadow-2xl border border-gray-400 w-72">
                                                    <p className="text-xs text-gray-600 mb-1 font-semibold">Preview: {image.alt_text} (Passe o mouse ou clique para selecionar)</p>
                                                    <img
                                                        src={image.url}
                                                        alt={`Preview: ${image.alt_text}`}
                                                        className="w-full h-auto object-contain rounded"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!imageLoading && availableImages.length === 0 && !imageError && (
                                <p className="text-sm text-gray-500 italic">Nenhuma imagem de reconhecimento disponível. Peça a um administrador para fazer upload.</p>
                            )}
                        </div>
                    </div>
                    {/* Linha 2: Assunto (Continuação) */}
                    <div className="flex justify-start mt-2">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center py-2 px-4 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 shadow-md"
                        >
                            <Send className="w-4 h-4 mr-2" /> Usar Assistente de IA para a Mensagem
                        </button>
                    </div>

                    {/* CAMPO 6: MENSAGEM (Grande) (Sem mudanças) */}
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                            Mensagem do Reconhecimento (Diga o que a pessoa fez de incrível!):
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            ref={messageRef}
                            value={formData.message}
                            onChange={handleFormChange}
                            placeholder="Sua mensagem de reconhecimento..."
                            required
                            rows="8"
                            className="block w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 resize-none"
                        />
                    </div>

                    {/* Linha 7: Botões (Sem mudanças) */}
                    <div className="flex justify-end space-x-4 pt-4">
                        {/* BOTÃO CANCELAR */}
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex items-center py-3 px-6 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150 shadow-sm"
                        >
                            <X className="w-5 h-5 mr-2" />
                            Cancelar
                        </button>

                        {/* BOTÃO ENVIAR */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center py-3 px-6 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 shadow-md hover:shadow-lg"
                        >
                            {isLoading ? (
                                <Loader className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5 mr-2" />
                            )}
                            {isLoading ? 'Enviando...' : 'Enviar Reconhecimento'}
                        </button>
                    </div>
                </form>
                {/* Renderiza o Modal de Assistente de IA */}
                 <AIModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setAiStatus({ type: null, message: '' }); 
                    }}
                    aiForm={aiForm} // Deve estar aqui
                    setAiForm={setAiForm} // Deve estar aqui
                    onGenerate={handleAIGenerate}
                    generatedText={aiGeneratedText}
                    isGenerating={isAiGenerating}
                    onInsert={handleInsertAIText}
                    aiStatus={aiStatus} // Deve estar aqui
                />
            </div>
        </div>
    );
};

const AIModal = ({ isOpen, onClose, aiForm, setAiForm, onGenerate, generatedText, isGenerating, onInsert,aiStatus }) => {
    if (!isOpen) return null;

    // Define a classe CSS para o status dentro do modal
    const statusClasses = aiStatus.type === 'error' // <--- AGORA 'aiStatus' ESTÁ DEFINIDO AQUI!
        ? 'bg-red-100 text-red-700 border-red-300'
        : '';

    return (
        <div className="fixed inset-0 bg-gray-900/75 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <Smile className="w-6 h-6 mr-2 text-indigo-500" /> Assistente de Mensagem de Reconhecimento (IA)
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* 🎯 AQUI: EXIBIÇÃO DA MENSAGEM DE ERRO DENTRO DO MODAL */}
                    {aiStatus.type === 'error' && (
                        <div className={`p-3 rounded-lg border text-sm ${statusClasses} flex items-center`}>
                            <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
                            {/* Usa dangerouslySetInnerHTML para renderizar o negrito (se houver) */}
                            <span dangerouslySetInnerHTML={{ __html: aiStatus.message }} />
                        </div>
                    )}
                    
                    {/* ENTRADA 1: TIPO DE RECONHECIMENTO */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">1. Qual tipo de Recompensa está sendo enviada?</label>
                        <div className="flex space-x-4">
                            {['reconhecimento', 'moeda', 'voucher'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setAiForm(p => ({ ...p, recognitionType: type }))}
                                    className={`py-2 px-4 rounded-lg capitalize text-sm font-semibold transition-all duration-200 ${
                                        aiForm.recognitionType === type 
                                        ? 'bg-indigo-600 text-white shadow-md' 
                                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ENTRADA 2: QUALIDADES/PALAVRAS-CHAVE */}
                    <div>
                        <label htmlFor="qualities" className="block text-sm font-medium text-gray-700 mb-2">2. Quais qualidades ou elogios você quer mencionar? (Separe por vírgula)</label>
                        <textarea
                            id="qualities"
                            value={aiForm.qualities}
                            onChange={(e) => setAiForm(p => ({ ...p, qualities: e.target.value }))}
                            placeholder="Ex: 'Liderança', 'Proatividade', 'Cuidado com o Cliente', 'Conclusão de Projeto' 'Pela Empatia'"
                            rows="3"
                            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                        />
                    </div>
                    
                    {/* BOTÃO GERAR */}
                    <button
                        type="button"
                        onClick={onGenerate}
                        disabled={isGenerating || !aiForm.qualities.trim()}
                        className="w-full flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 transition duration-150"
                    >
                        {isGenerating ? (
                            <Loader className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5 mr-2" />
                        )}
                        {isGenerating ? 'Gerando Texto...' : 'Gerar Mensagem com IA'}
                    </button>

                    {/* TEXTO GERADO PELA IA */}
                    {generatedText && (
                        <div className="mt-4 p-4 bg-gray-50 border border-indigo-200 rounded-lg space-y-3">
                            <h4 className="font-semibold text-gray-700">Mensagem Sugerida:</h4>
                            <div className="whitespace-pre-wrap text-gray-800 p-3 bg-white border rounded max-h-60 overflow-y-auto">
                                {generatedText}
                            </div>
                            <button
                                type="button"
                                onClick={onInsert}
                                className="w-full flex items-center justify-center py-2 px-4 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition duration-150"
                            >
                                <Mail className="w-4 h-4 mr-2" /> Inserir no Campo de Mensagem
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SendRecognition;