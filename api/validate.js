// api/validate.js - Validação Segura (Executado no Vercel)
const CryptoJS = require('crypto-js');

// ⚠️ Variáveis de Ambiente: Lidas das configurações do seu projeto Vercel
const SERVER_SECRETS = {
    '3': process.env.SECRET_KEY_3_DAYS, // Chave para 3 dias
    '7': process.env.SECRET_KEY_7_DAYS, // Chave para 7 dias
};

const HASH_LENGTH = 16; 

/**
 * Função utilitária para decodificar Base64 no ambiente Node.js.
 */
function base64Decode(encodedString) {
    try {
        // Usa o Buffer nativo do Node.js
        return Buffer.from(encodedString, 'base64').toString('utf-8');
    } catch (e) {
        return null;
    }
}

/**
 * Recria o Hash para validar a assinatura do token.
 * Deve usar a mesma lógica (CHAVE + PayloadBase64) da geração.
 */
function generateSignature(seed, payloadBase64) {
    const message = payloadBase64 + seed;
    const fullHash = CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
    return fullHash.substring(0, HASH_LENGTH); 
}

/**
 * Handler principal para a Função Serverless (API de Validação)
 */
module.exports = async (req, res) => {
    
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const { token, periodDays } = req.body; 

    if (!token || !periodDays) {
        return res.status(400).json({ valid: false, message: "Token e período (periodDays) são obrigatórios." });
    }
    
    const period = periodDays.toString();
    const SECRET_KEY = SERVER_SECRETS[period];

    if (!SECRET_KEY) {
        return res.status(500).json({ valid: false, message: "Erro de Configuração do Servidor: Chave secreta não encontrada." });
    }

    // 1. Separar o Token em Payload e Assinatura
    const parts = token.split('.');
    if (parts.length !== 2) {
        return res.status(200).json({ valid: false, message: "Token com formato inválido (deve ser PAYLOAD.ASSINATURA)." });
    }

    const payloadBase64 = parts[0];
    const receivedSignature = parts[1];

    // 2. Recalcular a Assinatura (Verificar Autenticidade)
    const calculatedSignature = generateSignature(SECRET_KEY, payloadBase64);
    

    if (calculatedSignature !== receivedSignature) {
        return res.status(200).json({ valid: false, message: "Falha na Assinatura. Token inválido ou adulterado." });
    }

    // --- O token é AUTÊNTICO (não foi alterado) ---
    
    // 3. Decodificar o Payload para checar a Validade
    const payloadData = base64Decode(payloadBase64);

    if (!payloadData) {
        return res.status(200).json({ valid: false, message: "Payload ilegível ou Base64 mal formado." });
    }
    
    const [expiryMsStr, randomValue] = payloadData.split('.');
    const expiryTimestamp = parseInt(expiryMsStr);
        
    if (isNaN(expiryTimestamp)) {
        return res.status(200).json({ valid: false, message: "Timestamp de expiração inválido no Payload." });
    }

    // 4. Checar a Expiração
    const currentTimestamp = Date.now();

    if (currentTimestamp > expiryTimestamp) {
        // Token é autêntico, mas expirado
        return res.status(200).json({ valid: false, message: "Código Expirado." });
    }

    // SUCESSO! Token é Autêntico e Válido no tempo.
    return res.status(200).json({ 
        valid: true, 
        message: `Acesso autorizado para ${period} dias.`,
        expiresAt: new Date(expiryTimestamp).toISOString()
    });
};
