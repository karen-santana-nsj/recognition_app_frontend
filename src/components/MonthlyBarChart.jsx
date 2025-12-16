import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MonthlyBarChart = ({ data }) => {
    // Garantir que os dados estejam no formato [{ name: 'Jan 2025', count: 50 }, ...]
    
    // Formatar o valor do Tooltip para ser mais legível
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="p-3 bg-white border border-gray-300 rounded shadow-md">
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-sm text-purple-600">{`Reconhecimentos: ${payload[0].value}`}</p>
          </div>
        );
      }
      return null;
    };

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    {/* Eixo X: Rótulo do Mês/Ano */}
                    <XAxis dataKey="name" stroke="#6b7280" /> 
                    {/* Eixo Y: Contagem de Reconhecimentos */}
                    <YAxis allowDecimals={false} stroke="#6b7280" /> 
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Barra que exibe a contagem */}
                    <Bar dataKey="count" fill="#8b5cf6" name="Reconhecimentos" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MonthlyBarChart;