# 🔑 Gerador e Validador de Tokens TOTP (Time-based One-Time Password) - Serverless
VERCEL

Este projeto utiliza o Vercel para hospedar Funções Serverless seguras (Node.js) para **gerar** e **validar** códigos de acesso temporários (Token Assinado: Base64.Hash).

O principal objetivo deste backend é garantir que a lógica de criptografia e as chaves secretas (Seeds) permaneçam **100% no lado do servidor**, oferecendo a máxima segurança, enquanto a interface do usuário (aplicativo nativo) apenas solicita e utiliza os códigos.

---

## 🛠️ Tecnologias e Dependências

* **Plataforma:** Vercel Serverless Functions
* **Linguagem:** Node.js
* **Criptografia:** `crypto-js` (SHA-256)
* **Formato do Token:** JWT Simplificado (`PAYLOAD_BASE64.ASSINATURA_HASH`)

---

## 🚨 Configuração de Segurança (CRÍTICO)

Para que as Funções Serverless funcionem, você DEVE configurar as variáveis de ambiente no painel do Vercel. **Não use as chaves de exemplo (`CHAVE_SECRETA...`)**. Use strings longas e complexas.

### Variáveis de Ambiente Necessárias:

| Variável | Descrição | Exemplo de Uso Interno |
| :--- | :--- | :--- |
| `SECRET_KEY_3_DAYS` | Chave secreta para tokens de 3 dias. | Usada em `api/generate.js` e `api/validate.js` |
| `SECRET_KEY_7_DAYS` | Chave secreta para tokens de 7 dias. | Usada em `api/generate.js` e `api/validate.js` |

**Local no Vercel:** `Settings` > `Environment Variables`.

---

## 🚀 Uso da API (Endpoints)

O URL base para ambos os endpoints é o seu domínio Vercel (Ex: `https://[seu-projeto-aqui].vercel.app`).

### 1. Endpoint de Geração de Código

Esta função deve ser chamada pelo seu aplicativo nativo Android/iOS quando o usuário solicitar um novo código.

* **Caminho:** `/api/generate`
* **Método:** `POST`
* **Descrição:** Gera um novo Token Assinado único, válido por 3 ou 7 dias.

#### Parâmetros de Entrada (Body JSON)

| Nome | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `periodDays` | Integer | Sim | O período de validade desejado: `3` (Usuário) ou `7` (Senha). |

#### Exemplo de Requisição (App Mobile)

```json
POST /api/generate
Content-Type: application/json

{
    "periodDays": 7
}




{
    "success": true,
    "token": "MTY2NDMyNjQ1MjM0NS41OTc5Mjc4Mg==.f72a9c3d4e5f6a1b",
    "message": "Token gerado com sucesso."
}
