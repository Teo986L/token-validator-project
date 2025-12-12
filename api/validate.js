// api/validate.js (CORRIGIDO com CORS e Validação Automática)
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
        return res.status(405).json({ valid: false, message: 'Método não permitido.' });
    }

    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ valid: false, message: 'Token não fornecido.' });
    }

    // Tenta primeiro com 7 dias, depois com 3 dias.
    const secretsToTry = [
        { period: 7, key: SERVER_SECRETS['7'] },
        { period: 3, key: SERVER_SECRETS['3'] },
    ];

    let validationResult = { valid: false, message: 'Token Inválido ou Expirado.' };

    for (const secretData of secretsToTry) {
        const { period, key } = secretData;

        if (!key) continue;

        try {
            // Tenta verificar o token
            const decoded = jwt.verify(token, key);

            // SUCESSO na validação
            return res.status(200).json({
                valid: true,
                message: `Token válido. Assinado pela chave de ${period} dias.`,
                periodDays: period,
                decodedPayload: decoded 
            }); 

        } catch (error) {
            // Falhou. Tenta a próxima chave.
        }
    }

    // Se o loop terminou sem sucesso
    if (token && token.split('.').length !== 3) {
         validationResult.message = 'Formato do Token inválido. Verifique se copiou corretamente.';
    } else {
         validationResult.message = 'Token Expirado ou Assinatura Inválida. Gere um novo código.';
    }

    return res.status(401).json(validationResult);
}
