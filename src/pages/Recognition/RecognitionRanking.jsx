// src/pages/Recognition/RecognitionRanking.jsx

import React, { useState, useEffect, useMemo } from 'react'; // 🎯 Importe useState e useEffect
import { Award, Send, TrendingUp, Calendar, Loader2 } from 'lucide-react';

// 🎯 Importe o novo serviço
import recognitionService from '../../services/recognitionService'; 
// Importe a função que pega o Avatar (vamos assumir que você tem essa função ou faremos o cálculo aqui)


// Função auxiliar para gerar iniciais do avatar (já que o backend só retorna nome/email)
const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length > 1) {
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return parts[0].charAt(0).toUpperCase();
};


// Componente para renderizar um item da lista (Sem alterações, mas usando os dados reais)
const RankingItem = ({ person, index, isSender }) => {
    // ... (lógica de cores e ícones inalterada) ...
    let rankColor = 'text-gray-600 bg-gray-100';
    let icon = null;
    let sizeClass = 'text-base font-normal';

    if (index === 0) {
        rankColor = 'text-yellow-700 bg-yellow-100 border-yellow-400';
        icon = <Award className="w-5 h-5 fill-yellow-400 text-yellow-600" />;
        sizeClass = 'text-lg font-bold';
    } else if (index === 1) {
        rankColor = 'text-slate-700 bg-slate-100 border-slate-400';
        icon = <Award className="w-5 h-5 fill-slate-300 text-slate-500" />;
        sizeClass = 'text-base font-semibold';
    } else if (index === 2) {
        rankColor = 'text-amber-700 bg-amber-100 border-amber-400';
        icon = <Award className="w-5 h-5 fill-amber-300 text-amber-500" />;
        sizeClass = 'text-base font-semibold';
    }

    // 💡 O objeto 'person' agora é { count, email, name }
    const avatarInitials = getInitials(person.name); // Calcula as iniciais aqui

    return (
        <li className={`flex items-center p-3 rounded-lg border-l-4 mb-2 ${rankColor} ${index < 3 ? 'border-l-4' : 'border-l-0'}`}>
            
            {/* Posição / Ícone de Prêmio */}
            <div className={`w-8 text-center mr-3 ${sizeClass}`}>
                {icon || <span className="text-gray-500">{index + 1}°</span>}
            </div>

            {/* Avatar (Iniciais) */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 
                ${index === 0 ? 'bg-yellow-500 text-white' : 'bg-blue-100 text-blue-700 font-semibold'}`}>
                {avatarInitials} {/* Usa as iniciais calculadas */}
            </div>

            {/* Nome e Email */}
            <div className="grow">
                <p className={`truncate ${sizeClass} text-gray-800`}>{person.name || 'Usuário Não Registrado'}</p>
                <p className="text-xs text-gray-500 truncate">{person.email}</p>
            </div>

            {/* Contagem */}
            <div className={`ml-4 text-right ${sizeClass} text-gray-800`}>
                <span className="font-extrabold">{person.count}</span>
                <p className="text-xs text-gray-500">{isSender ? 'enviados' : 'recebidos'}</p>
            </div>
        </li>
    );
};


// Componente Principal
const RecognitionRanking = () => {

    // --- Lógica de Datas ---
    const today = new Date();
    // 🎯 NOVO ESTADO: Mês (0-11) e Ano
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // JS Month é 0-11, API usa 1-12
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    
    // Gera as opções de ano (Ex: Últimos 3 anos)
    const yearOptions = useMemo(() => {
        const currentYear = today.getFullYear();
        const years = [];
        for (let i = 0; i < 3; i++) { // Últimos 3 anos
            years.push(currentYear - i);
        }
        return years;
    }, [today]);
    
    const monthOptions = [
        { value: 1, name: "Janeiro" }, { value: 2, name: "Fevereiro" }, { value: 3, name: "Março" },
        { value: 4, name: "Abril" }, { value: 5, name: "Maio" }, { value: 6, name: "Junho" },
        { value: 7, name: "Julho" }, { value: 8, name: "Agosto" }, { value: 9, name: "Setembro" },
        { value: 10, name: "Outubro" }, { value: 11, name: "Novembro" }, { value: 12, name: "Dezembro" },
    ];
    
    const currentMonthName = monthOptions.find(m => m.value === selectedMonth)?.name;

    // 🎯 NOVOS ESTADOS
    const [senders, setSenders] = useState([]);
    const [receivers, setReceivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🎯 useEffect para carregar os dados
    useEffect(() => {
        const fetchRankings = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // 💡 Chama o serviço que busca os dados no backend
                const data = await recognitionService.getRankings(selectedMonth, selectedYear);
                
                setSenders(data.topSenders || []);
                setReceivers(data.topReceivers || []);
                
            } catch (err) {
                s// Se a API não estiver pronta, o erro pode ser um 400/500 do Axios
                const errMsg = err.response?.data?.error || err.message || 'Erro ao carregar os rankings.';
                setError(errMsg);
                setSenders([]); // Limpa a lista em caso de erro
                setReceivers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRankings();
    }, [selectedMonth, selectedYear]); // Array de dependências vazio: executa apenas na montagem

    
    // --- Lógica de Renderização ---
    
    const renderContent = () => {
        if (loading) {
            return <div className="text-center py-12 text-lg text-gray-500 flex justify-center items-center"><Loader2 className="w-6 h-6 mr-2 animate-spin"/> Carregando Rankings...</div>;
        }
        
        if (error) {
            return <div className="text-center py-12 text-red-600 font-semibold">Erro ao carregar dados: {error}</div>;
        }

        if (senders.length === 0 && receivers.length === 0) {
            return <div className="text-center py-12 text-gray-500">Nenhum reconhecimento encontrado para {currentMonthName} de {selectedYear}.</div>;
        }

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* --- COLUNA 1: MAIS ENVIARAM --- */}
                <div className="bg-white p-6 rounded-xl shadow-xl border border-blue-100">
                    <div className="flex items-center mb-5 pb-3 border-b">
                        <Send className="w-6 h-6 text-blue-500 mr-3" />
                        <h3 className="text-xl font-semibold text-gray-700">Top Enviadores</h3>
                    </div>
                    <ul className="space-y-3">
                        {senders.map((sender, index) => (
                            <RankingItem key={sender.email} person={sender} index={index} isSender={true} />
                        ))}
                    </ul>
                </div>

                {/* --- COLUNA 2: MAIS RECEBERAM --- */}
                <div className="bg-white p-6 rounded-xl shadow-xl border border-green-100">
                    <div className="flex items-center mb-5 pb-3 border-b">
                        <Award className="w-6 h-6 text-green-500 mr-3" />
                        <h3 className="text-xl font-semibold text-gray-700">Top Recebedores</h3>
                    </div>
                    <ul className="space-y-3">
                        {receivers.map((recipient, index) => (
                            <RankingItem key={recipient.email} person={recipient} index={index} isSender={false} />
                        ))}
                    </ul>
                </div>
            </div>
        );
    };


    return (
        <div className="w-full max-w-6xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8 border-b pb-4">
                <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-indigo-600 mr-3" />
                    <h2 className="text-3xl font-bold text-gray-800">Ranking de Reconhecimento</h2>
                </div>
            </div>
            
            {/* 🎯 ÁREA DE FILTRO (NOVO) */}
            <div className="flex flex-col sm:flex-row gap-4 items-center mb-8 p-4 bg-white rounded-xl shadow-md border">
                <Calendar className="w-6 h-6 text-gray-500" />
                <span className="text-lg font-semibold text-gray-700 whitespace-nowrap">Ranking de:</span>
                
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 grow sm:grow-0"
                >
                    {monthOptions.map(month => (
                        <option key={month.value} value={month.value}>{month.name}</option>
                    ))}
                </select>
                
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 grow sm:grow-0"
                >
                    {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
            {/* FIM DA ÁREA DE FILTRO */}

            {renderContent()}

        </div>
    );
};

export default RecognitionRanking;