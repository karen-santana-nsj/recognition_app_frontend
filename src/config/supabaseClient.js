// src/config/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// 🚨 Use a Chave ANÔNIMA (PÚBLICA) no Frontend
// É crucial que estas chaves venham de variáveis de ambiente públicas do seu ambiente React (Vite/CRA)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL; // Exemplo para Vite
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY; // Exemplo para Vite

// Se você estiver usando Create React App (CRA):
// const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
// const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("ERRO: As variáveis de ambiente do Supabase não estão configuradas no frontend.");
}

// Inicializa o cliente Supabase (para uso no frontend)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);