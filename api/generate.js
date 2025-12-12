// api/generate.js
import jwt from 'jsonwebtoken';

// Mapeamento das chaves secretas (devem ser definidas nas variáveis de ambiente do Vercel)
const SERVER_SECRETS = {
    '3': process.env.SECRET_KEY_3_DAYS,
    '7': process.env.SECRET_KEY_7_DAYS,
};

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Método não permitido.' });
    }

    const { periodDays } = req.body;
    const period = parseInt(periodDays);

    // 1. Validação da Entrada
    if (!period || !SERVER_SECRETS[period.toString()]) {
        return res.status(400).json({ success: false, message: 'Período inválido fornecido ou Chave Secreta não configurada.' });
    }

    const secret = SERVER_SECRETS[period.toString()];

    // 2. Cálculo da Expiração (JWT usa segundos)
    const expiresInSeconds = period * 24 * 60 * 60; 

    // 3. Criação do Payload (inclui o campo 'period')
    const payload = {
        // Campo crucial para a Auto-Discovery, mesmo que a validação não o use diretamente, é boa prática
        period: periodDays, 
        // ID do Token (ajuda a evitar repetição)
        jti: Math.random().toString(36).substring(2, 15) 
    };

    try {
        // 4. Assinatura do Token
        const token = jwt.sign(payload, secret, { expiresIn: expiresInSeconds });

        // 5. Resposta
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
