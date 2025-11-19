const express = require('express');
const axios = require('axios');
const https = require('https');
const app = express();

const PORT = 3001;

// =========================
// CONFIG Z-API
// =========================
const ZAPI_BASE = "https://api.z-api.io";
const CLIENT_TOKEN = "F64cd81764d544c9fb148dbb662053ee6S";

app.use(express.json());

/* ======================================================
   PROXY Z-API /zap
====================================================== */
app.use('/zap', async (req, res) => {
    try {
        // Remove /zap e caracteres problemáticos (%0A, %0D, \n, \r)
        const cleanPath = req.url
            .replace(/^\/zap/, '')
            .replace(/%0A|%0D|\n|\r/gi, '')
            .trim();

        const targetUrl = new URL(cleanPath, ZAPI_BASE);

        console.log("======================================");
        console.log("➡️ NOVA REQUISIÇÃO PARA Z-API");
        console.log("➡️ URL Limpada:", cleanPath);
        console.log("➡️ URL Final:", targetUrl.toString());
        console.log("➡️ Body:", req.body);

        const headers = {
            "content-type": "application/json",
            "client-token": CLIENT_TOKEN,
            "value": req.headers["value"]
        };

        console.log("➡️ Headers enviados:", headers);

        const options = {
            method: req.method,
            headers
        };

        const proxyReq = https.request(targetUrl, options, proxyRes => {
            let chunks = [];

            proxyRes.on('data', chunk => chunks.push(chunk));
            proxyRes.on('end', () => {
                const body = Buffer.concat(chunks).toString();

                console.log("⬅️ Resposta da Z-API:");
                console.log("Status:", proxyRes.statusCode);
                console.log("Body:", body);

                res.status(proxyRes.statusCode).send(body);
            });
        });

        proxyReq.on('error', err => {
            console.log("❌ Erro no proxy:", err.message);
            return res.status(502).json({ error: 'proxy_error', message: err.message });
        });

        if (["POST", "PUT", "PATCH"].includes(req.method)) {
            proxyReq.write(JSON.stringify(req.body));
        }

        proxyReq.end();

    } catch (err) {
        console.log("❌ Erro geral no proxy:", err.message);
        return res.status(500).json({ error: 'proxy_setup_error', message: err.message });
    }
});

/* ============================================================== 
   ENDPOINTS FIXPAY 
============================================================== */

// 1) GERAR PIX
app.post('/gerar-pix', async (req, res) => {
    console.log('> Recebida requisição para gerar PIX');

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('> ERRO: Token de autorização não fornecido');
        return res.status(401).json({ error: 'Token de autorização é obrigatório' });
    }

    const bearerToken = authHeader.substring(7);

    const { value, message, partner_id, captura_id, usuario, usuario_id, user_email } = req.body;

    if (!value || !partner_id || !captura_id) {
        console.log('> ERRO: Parâmetros obrigatórios faltando');
        return res.status(400).json({ error: 'value, partner_id e captura_id são obrigatórios' });
    }

    const fixPayUrl = 'https://pix.fixpay.com.br:3467/v1/generate_pix';

    const body = {
        value,
        message: message || 'PIX Gerado via Proxy',
        partner_id,
        captura_id,
        usuario: usuario || '',
        usuario_id: usuario_id || '',
        user_email: user_email || ''
    };

    try {
        console.log('> Enviando para FixPay:', fixPayUrl);
        console.log('> Body:', body);

        const config = {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await axios.post(fixPayUrl, body, config);

        console.log('> SUCESSO! Resposta FixPay:', response.data);
        res.status(response.status).json(response.data);

    } catch (error) {
        console.log('> ERRO FixPay:', error.message);

        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }

        res.status(500).json({ error: 'Erro interno' });
    }
});

// 2) CONSULTAR PIX
app.post('/consultar-pix', async (req, res) => {
    console.log('> Recebida requisição para consultar PIX');

    const { tokenLink, bearerToken } = req.body;

    if (!tokenLink || !bearerToken) {
        return res.status(400).json({ error: 'tokenLink e bearerToken são obrigatórios' });
    }

    const fixPayUrl = `https://pix.fixpay.com.br:3467/v1/consult_pix/${tokenLink}`;

    try {
        const config = {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
            }
        };

        console.log('> Consultando FixPay:', fixPayUrl);

        const response = await axios.get(fixPayUrl, config);

        return res.status(response.status).json(response.data);

    } catch (error) {
        if (error.response)
            return res.status(error.response.status).json(error.response.data);

        return res.status(500).json({ error: 'Erro interno' });
    }
});

// 3) EXPIRAR PIX
app.post('/expirar-pix', async (req, res) => {
    console.log('> Recebida requisição para expirar PIX');

    const { tokenLink, bearerToken } = req.body;

    if (!tokenLink || !bearerToken) {
        return res.status(400).json({ error: 'tokenLink e bearerToken são obrigatórios' });
    }

    const fixPayUrl = `https://pix.fixpay.com.br:3467/v1/expire/${tokenLink}`;

    try {
        console.log('> Expirando PIX na FixPay:', fixPayUrl);

        const response = await axios.post(fixPayUrl, {}, {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
            }
        });

        res.status(response.status).json(response.data);

    } catch (error) {
        if (error.response)
            return res.status(error.response.status).json(error.response.data);

        return res.status(500).json({ error: 'Erro interno' });
    }
});

/* ============================================================== */

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log("Endpoints:");
    console.log("  🔹 /zap → Proxy Z-API");
    console.log("  🔹 POST /gerar-pix");
    console.log("  🔹 POST /consultar-pix");
    console.log("  🔹 POST /expirar-pix");
});
