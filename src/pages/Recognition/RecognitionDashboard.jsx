import React, { useState, useEffect, useMemo } from 'react';
// 🎯 CORREÇÃO: Adicionando Calendar à lista de imports do lucide-react
import { Users, Send, TrendingUp, Loader2, Award, Calendar } from 'lucide-react'; 
import recognitionService from '../../services/recognitionService';
import MonthlyBarChart from '../../components/MonthlyBarChart';

// Componente para exibir os cartões de estatísticas simples
const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className={`p-5 bg-white rounded-xl shadow-lg flex items-center space-x-4 border-l-4 ${color}`}>
        <div className={`p-3 rounded-full ${color.replace('border-l-4', '').replace('border-', 'bg-')}/10`}>
            <Icon className={`w-6 h-6 ${color.replace('border-l-4', '').replace('border-', 'text-')}`} />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

// Componente auxiliar para renderizar listas de ranking
const renderRankingList = (rankings) => {
    if (rankings.length === 0) {
        return <p className="text-gray-500">Nenhum ranking disponível.</p>;
    }
    
    return (
        <ul className="space-y-3">
            {rankings.map((item, index) => (
                // 🎯 CORREÇÃO NO KEY: Garantindo que o item.type exista
                <li key={`${item.email}-${item.type || index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <span className={`font-bold w-6 h-6 flex items-center justify-center rounded-full text-white ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                        }`}>
                            {index + 1}
                        </span>
                        <span className="font-medium text-gray-700">{item.name || item.email}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">{item.count}</span>
                </li>
            ))}
        </ul>
    );
};

// Componente principal
const RecognitionDashboard = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await recognitionService.getDashboardData();
                setData(response);
            } catch (err) {
                // Logar o erro completo para debug no console, se necessário
                console.error("Erro ao buscar dados do dashboard:", err); 
                setError('Falha ao carregar dados do Dashboard. Verifique o servidor.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // 🎯 VARIÁVEL monthlyChartData RECUPERADA E FORMATADA
    const monthlyChartData = useMemo(() => {
        // Se não houver dados ou monthlyData, retorna array vazio.
        if (!data?.monthlyData || data.monthlyData.length === 0) return []; 
        
        // Formata os dados para o formato que o Recharts espera: { name: 'Dez/25', count: 11 }
        return data.monthlyData
            .map(item => {
                // Usa Date.UTC para evitar o erro de fuso horário na exibição (Ex: 2025-12)
                const [year, month] = item.month.split('-').map(Number);
                const safeDate = new Date(Date.UTC(year, month - 1, 1)); 

                return {
                    // name: Formato Amigável (Dez/2025)
                    name: safeDate.toLocaleString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' }).replace('.', ''),
                    count: item.count
                };
            })
            .sort((a, b) => new Date(a.name) - new Date(b.name)); // Garante a ordem cronológica
    }, [data]);

    // 🎯 BLOCO CORRIGIDO: Forçando a criação da data em UTC
    const monthlyRankingGroups = useMemo(() => {
        if (!data?.monthlyRankings || data.monthlyRankings.length === 0) return {};

        return data.monthlyRankings.reduce((acc, current) => {
            const monthKey = current.month; // Ex: '2025-12'
            
            if (!acc[monthKey]) {
                // 1. Divide o YYYY-MM
                const [year, month] = monthKey.split('-').map(Number);
                
                // 2. Cria a data em UTC. Mês é 0-indexed (Dezembro = 11).
                const safeDate = new Date(Date.UTC(year, month - 1, 1)); 
                
                acc[monthKey] = { 
                    // 3. Formata usando o fuso horário UTC para garantir que o mês não mude.
                    display: safeDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
                    topSenders: [], 
                    topReceivers: [] 
                };
            }

            if (current.type === 'sender') {
                acc[monthKey].topSenders.push(current);
            } else if (current.type === 'receiver') {
                acc[monthKey].topReceivers.push(current);
            }

            return acc;
        }, {});
    }, [data]);


    if (isLoading) {
        return <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mt-10" />;
    }

    if (error) {
        return <p className="text-red-600 font-semibold text-center mt-10">{error}</p>;
    }

    // Lista de chaves (meses) em ordem decrescente (mais recente primeiro)
    const sortedMonthKeys = Object.keys(monthlyRankingGroups).sort().reverse();


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Visão Geral do Reconhecimento</h1>

            {/* A. CARDS DE ESTATÍSTICAS GLOBAIS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    icon={Users} 
                    title="Usuários Inscritos" 
                    value={data.usersCount} 
                    color="border-blue-500" 
                />
                <StatCard 
                    icon={Send} 
                    title="Reconhecimentos Enviados" 
                    value={data.recognitionsCount} 
                    color="border-purple-500" 
                />
                <StatCard 
                    icon={TrendingUp} 
                    title="Média Mensal (Últimos 12m)" 
                    value={Math.round(data.recognitionsCount / (data.monthlyData.length || 1)) + " / mês"} // 🎯 Média mais precisa
                    color="border-green-500" 
                />
            </div>
            
            {/* B. GRÁFICO MENSAL */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                    <TrendingUp className="w-5 h-5 inline mr-2 text-green-500"/>
                    Quantidade de Reconhecimentos Enviados por Mês
                </h2>
                {/* 🎯 SUBSTITUIÇÃO PELO GRÁFICO REAL */}
                {monthlyChartData.length > 0 ? (
                    <MonthlyBarChart data={monthlyChartData} />
                ) : (
                    <div className="h-64 bg-gray-50 flex items-center justify-center rounded border border-dashed text-gray-500">
                        Nenhum dado mensal para exibir.
                    </div>
                )}
            </div>

            {/* C. RANKINGS MENSAIS (Todos os Meses) */}
            <h2 className="text-2xl font-bold text-gray-900 pt-4">Histórico de Top Rankings</h2>

            {sortedMonthKeys.length === 0 && (
                <p className="text-gray-500 p-4 bg-white rounded-xl shadow-lg">Nenhum dado de ranking para exibir. Envie o primeiro reconhecimento!</p>
            )}

            {sortedMonthKeys.map(monthKey => {
                const monthData = monthlyRankingGroups[monthKey];
                return (
                    <div key={monthKey} className="space-y-4 pt-4 border-t border-gray-200 first:border-t-0">
                        <div className="text-lg font-bold text-gray-700 flex items-center space-x-2">
                            {/* 🎯 CORRIGIDO: Calendar agora é reconhecido */}
                             <Calendar className="w-5 h-5 text-blue-500"/> 
                             <span>{monthData.display.toUpperCase()}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Top Enviadores */}
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                                    <Send className="w-5 h-5 mr-2 text-purple-500"/>
                                    Top Enviadores
                                </h3>
                                {renderRankingList(monthData.topSenders)}
                            </div>
                            
                            {/* Top Recebedores */}
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                                    <Award className="w-5 h-5 mr-2 text-yellow-500"/>
                                    Top Recebedores
                                </h3>
                                {renderRankingList(monthData.topReceivers)}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default RecognitionDashboard;