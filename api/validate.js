import jwt from 'jsonwebtoken';

const SERVER_SECRETS = {
    '3': process.env.SECRET_KEY_3_DAYS,
    '7': process.env.SECRET_KEY_7_DAYS,
};

export const handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',  // ← ESSA LINHA ERA O QUE FALTAVA!
    };

    // Responde ao preflight OPTIONS
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };  // 204 No Content é o padrão para preflight
    }

    // Só permite POST para a validação real
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ valid: false, message: 'Método não permitido' })
        };
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
                    body: JSON.stringify({ valid: true, periodDays: secretData.period })
                };
            } catch (err) {
                // Continua tentando a próxima chave
            }
        }

        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ valid: false, message: 'Token Inválido ou Expirado' })
        };

    } catch (error) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ valid: false, message: 'Erro na requisição' })
        };
    }
};
