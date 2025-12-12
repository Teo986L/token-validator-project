import jwt from 'jsonwebtoken';

const SERVER_SECRETS = {
    '3': process.env.SECRET_KEY_3_DAYS,
    '7': process.env.SECRET_KEY_7_DAYS,
};

export const handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { token } = JSON.parse(event.body);
        const secretsToTry = [
            { period: 7, key: SERVER_SECRETS['7'] },
            { period: 3, key: SERVER_SECRETS['3'] },
        ];

        for (const secretData of secretsToTry) {
            if (!secretData.key) continue;
            try {
                const decoded = jwt.verify(token, secretData.key);
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ valid: true, periodDays: secretData.period, decoded })
                };
            } catch (err) { /* Tenta a próxima chave */ }
        }

        return { statusCode: 401, headers, body: JSON.stringify({ valid: false, message: 'Token Inválido' }) };
    } catch (error) {
        return { statusCode: 400, headers, body: JSON.stringify({ valid: false, message: 'Erro na requisição' }) };
    }
};
