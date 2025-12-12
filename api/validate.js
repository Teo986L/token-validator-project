// api/validate.js
import jwt from 'jsonwebtoken';

// Mapeamento das chaves secretas
const SERVER_SECRETS = {
    '3': process.env.SECRET_KEY_3_DAYS,
    '7': process.env.SECRET_KEY_7_DAYS,
};

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ valid: false, message: 'Método não permitido.' });
    }

    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ valid: false, message: 'Token não fornecido.' });
    }

    // A ordem de tentativa (7 dias primeiro, depois 3) é arbitrária, mas garante a detecção
    const secretsToTry = [
        { period: 7, key: SERVER_SECRETS['7'] },
        { period: 3, key: SERVER_SECRETS['3'] },
    ];

    let validationResult = { valid: false, message: 'Token Inválido ou Expirado.' };

    for (const secretData of secretsToTry) {
        const { period, key } = secretData;

        // Se a chave não estiver configurada no Vercel, pula
        if (!key) continue;

        try {
            // Tenta verificar o token usando a chave do período atual
            const decoded = jwt.verify(token, key);

            // SE CHEGOU AQUI: O token é válido, a assinatura confere E não expirou.
            
            // Retorna imediatamente o sucesso
            return res.status(200).json({
                valid: true,
                message: `Token válido. Assinado pela chave de ${period} dias.`,
                periodDays: period,
                decodedPayload: decoded // Informa o payload para o cliente (opcional)
            }); 

        } catch (error) {
            // O token falhou (expirado, assinatura incorreta, etc.) com esta chave.
            // Continua tentando com a próxima chave.
        }
    }

    // Se saiu do loop sem sucesso, o token é totalmente inválido
    // Trata os erros comuns para dar um feedback melhor
    if (token.split('.').length !== 3) {
         validationResult.message = 'Formato do Token inválido. Verifique se copiou corretamente.';
    } else {
         validationResult.message = 'Token Expirado ou Assinatura Inválida. Gere um novo código.';
    }

    return res.status(401).json(validationResult);
}
