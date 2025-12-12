// api/generate.js - Geração Segura (Executado no Vercel)
const CryptoJS = require('crypto-js');

// ⚠️ Variáveis de Ambiente: Lidas das configurações do seu projeto Vercel
const SERVER_SECRETS = {
    '3': process.env.SECRET_KEY_3_DAYS, // Chave para 3 dias
    '7': process.env.SECRET_KEY_7_DAYS, // Chave para 7 dias
};

const HASH_LENGTH = 16; 

/**
 * Geração da Assinatura (Hash)
 * @param {string} seed Chave secreta
 * @param {string} payloadBase64 Payload já codificado
 * @returns {string} O hash truncado.
 */
function generateSignature(seed, payloadBase64) {
    // Mensagem para o Hash: CHAVE SECRETA + PAYLOAD BASE64
    const message = payloadBase64 + seed; 
    const fullHash = CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
    return fullHash.substring(0, HASH_LENGTH); 
}

/**
 * Handler principal para a Função Serverless (API)
 */
module.exports = async (req, res) => {
    
    // Configuração para aceitar JSON no corpo da requisição
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const periodDays = parseInt(req.body.periodDays); 

    if (isNaN(periodDays) || (periodDays !== 3 && periodDays !== 7)) {
        return res.status(400).json({ success: false, message: "Período inválido. Use 3 ou 7." });
    }

    const SECRET_KEY = SERVER_SECRETS[periodDays.toString()];

    if (!SECRET_KEY) {
        return res.status(500).json({ success: false, message: "Erro de Configuração do Servidor: Chave secreta não encontrada. Verifique as variáveis de ambiente." });
    }
    
    // --- LÓGICA DE GERAÇÃO DO TOKEN ASSINADO (SERVER-SIDE) ---
    
    // 1. Calcula o timestamp de expiração (usando a hora do servidor)
    const currentDate = new Date();
    const msPerPeriod = periodDays * 24 * 60 * 60 * 1000;
    const expiryMs = currentDate.getTime() + msPerPeriod;
    
    // 2. Cria o Payload (Validade + Random para unicidade em cada requisição)
    const payloadData = `${expiryMs}.${Math.random().toFixed(8)}`; 
    
    // 3. Codifica o Payload em Base64 (usando a função nativa do Node)
    // O Buffer.from() é usado no Node.js (Servidor) para Base64
    const payloadBase64 = Buffer.from(payloadData).toString('base64');
    
    // 4. Gera a Assinatura
    const signature = generateSignature(SECRET_KEY, payloadBase64);
    
    // 5. Retorna o Token Assinado final: PAYLOAD.ASSINATURA
    const signedToken = payloadBase64 + '.' + signature;
    
    return res.status(200).json({ 
        success: true, 
        token: signedToken,
        message: "Token gerado com sucesso." 
    });
};
