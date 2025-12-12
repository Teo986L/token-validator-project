// api/generate.js (CORRIGIDO com CORS)
import jwt from 'jsonwebtoken';

const SERVER_SECRETS = {
    '3': process.env.SECRET_KEY_3_DAYS,
    '7': process.env.SECRET_KEY_7_DAYS,
};

export default function handler(req, res) {
    
    // 1. CONFIGURAÇÃO CORS (Permite a comunicação com o frontend local)
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responde a requisições OPTIONS (Preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    // -----------------------------------------------------------

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Método não permitido.' });
    }

    const { periodDays } = req.body;
    const period = parseInt(periodDays);

    if (!period || !SERVER_SECRETS[period.toString()]) {
        return res.status(400).json({ success: false, message: 'Período inválido fornecido ou Chave Secreta não configurada.' });
    }

    const secret = SERVER_SECRETS[period.toString()];
    const expiresInSeconds = period * 24 * 60 * 60; 

    const payload = {
        period: periodDays, 
        jti: Math.random().toString(36).substring(2, 15) 
    };

    try {
        const token = jwt.sign(payload, secret, { expiresIn: expiresInSeconds });

        res.status(200).json({ 
            success: true, 
            token: token,
            periodDays: period,
            expiresIn: expiresInSeconds 
        });

    } catch (error) {
        console.error("Erro ao gerar token:", error);
        res.status(500).json({ success: false, message: 'Erro interno ao gerar o código.' });
    }
}
