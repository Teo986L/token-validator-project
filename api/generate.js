import jwt from 'jsonwebtoken';

const SERVER_SECRETS = {
    '3': process.env.SECRET_KEY_3_DAYS,
    '7': process.env.SECRET_KEY_7_DAYS,
};

export const handler = async (event, context) => {
    // Configuração CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ message: 'Método não permitido' }) };
    }

    try {
        const { periodDays } = JSON.parse(event.body);
        const period = parseInt(periodDays);
        const secret = SERVER_SECRETS[period.toString()];

        if (!secret) throw new Error('Período inválido ou chave não configurada.');

        const expiresInSeconds = period * 24 * 60 * 60;
        const payload = { period: periodDays, jti: Math.random().toString(36).substring(2) };
        const token = jwt.sign(payload, secret, { expiresIn: expiresInSeconds });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, token, periodDays: period })
        };
    } catch (error) {
        return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: error.message }) };
    }
};
