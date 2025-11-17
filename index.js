const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3001;

app.use(express.json());

// Endpoint para gerar PIX
app.post('/gerar-pix', async (req, res) => {
    console.log('> Recebida requisição para gerar PIX');
    
    // Pegar o token do header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('> ERRO: Token de autorização não fornecido no header');
        return res.status(401).json({ error: 'Token de autorização é obrigatório no header Authorization' });
    }
    const bearerToken = authHeader.substring(7); // Remove 'Bearer ' do início
    
    // Pegar os dados do body
    const { value, message, partner_id, captura_id, usuario, usuario_id, user_email } = req.body;
    
    if (!value || !partner_id || !captura_id) {
        console.log('> ERRO: Parâmetros obrigatórios não fornecidos');
        console.log('> Body recebido:', JSON.stringify(req.body));
        return res.status(400).json({ error: 'value, partner_id e captura_id são obrigatórios' });
    }
    
    const fixPayUrl = 'https://pix.fixpay.com.br:3467/v1/generate_pix';
    const requestBody = {
        value,
        message: message || 'PIX Gerado via Proxy',
        partner_id,
        captura_id,
        usuario: usuario || '',
        usuario_id: usuario_id || '',
        user_email: user_email || ''
    };

    try {
        const config = {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'User-Agent': 'NodeJS-Proxy-Client/1.0',
                'Content-Type': 'application/json'
            },
            timeout: 15000 
        };
        
        console.log('> Enviando requisição para gerar PIX na FixPay...');
        console.log('> Dados:', JSON.stringify(requestBody));
        const fixPayResponse = await axios.post(fixPayUrl, requestBody, config);

        console.log(`> SUCESSO! PIX gerado com status: ${fixPayResponse.status}`);
        return res.status(fixPayResponse.status).json(fixPayResponse.data);

    } catch (error) {
        console.log('> ERRO ao gerar PIX:', error.message);
        if (error.code === 'ECONNABORTED') {
            return res.status(408).json({ error: 'Timeout na requisição para gerar PIX' });
        }
        if (error.response) {
            console.log(`> FixPay respondeu com erro: ${error.response.status}`);
            return res.status(error.response.status).json(error.response.data);
        }
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Endpoint para consultar PIX - FORMATO ORIGINAL QUE FUNCIONAVA
app.post('/consultar-pix', async (req, res) => {
    console.log('> Recebida requisição para consultar PIX');
    
    // Pegar os dados do body com formato ORIGINAL que funcionava
    const { tokenLink, bearerToken } = req.body;
    
    if (!tokenLink) {
        console.log('> ERRO: tokenLink não fornecido');
        return res.status(400).json({ error: 'tokenLink é obrigatório' });
    }
    
    if (!bearerToken) {
        console.log('> ERRO: bearerToken não fornecido');
        return res.status(400).json({ error: 'bearerToken é obrigatório' });
    }
    
    const fixPayUrl = `https://pix.fixpay.com.br:3467/v1/consult_pix/${tokenLink}`;

    try {
        const config = {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'User-Agent': 'NodeJS-Proxy-Client/1.0',
                'Content-Type': 'application/json'
            },
            timeout: 15000 
        };
        
        console.log('> Enviando requisição para consultar PIX na FixPay...');
        const fixPayResponse = await axios.get(fixPayUrl, config);

        console.log(`> SUCESSO! PIX consultado com status: ${fixPayResponse.status}`);
        return res.status(fixPayResponse.status).json(fixPayResponse.data);

    } catch (error) {
        console.log('> ERRO ao consultar PIX:', error.message);
        if (error.code === 'ECONNABORTED') {
            return res.status(408).json({ error: 'Timeout na requisição para consultar PIX' });
        }
        if (error.response) {
            console.log(`> FixPay respondeu com erro: ${error.response.status}`);
            return res.status(error.response.status).json(error.response.data);
        }
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Endpoint para expirar PIX - FORMATO ORIGINAL QUE FUNCIONAVA
app.post('/expirar-pix', async (req, res) => {
    console.log('> Recebida requisição para expirar PIX');
    
    // Pegar os dados do body com formato ORIGINAL que funcionava
    const { tokenLink, bearerToken } = req.body;
    
    if (!tokenLink) {
        console.log('> ERRO: tokenLink não fornecido');
        return res.status(400).json({ error: 'tokenLink é obrigatório' });
    }
    
    if (!bearerToken) {
        console.log('> ERRO: bearerToken não fornecido');
        return res.status(400).json({ error: 'bearerToken é obrigatório' });
    }
    
    const fixPayUrl = `https://pix.fixpay.com.br:3467/v1/expire/${tokenLink}`;

    try {
        const config = {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'User-Agent': 'NodeJS-Proxy-Client/1.0',
                'Content-Type': 'application/json'
            },
            timeout: 15000 
        };
        
        console.log(`> Enviando requisição para expirar PIX: ${fixPayUrl}`);
        const fixPayResponse = await axios.post(fixPayUrl, {}, config);

        console.log(`> SUCESSO! PIX expirado com status: ${fixPayResponse.status}`);
        return res.status(fixPayResponse.status).json(fixPayResponse.data);

    } catch (error) {
        console.log('> ERRO ao expirar PIX:', error.message);
        if (error.code === 'ECONNABORTED') {
            return res.status(408).json({ error: 'Timeout na requisição para expirar PIX' });
        }
        if (error.response) {
            console.log(`> FixPay respondeu com erro: ${error.response.status}`);
            return res.status(error.response.status).json(error.response.data);
        }
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.listen(PORT, () => {
    console.log(`Serviço de proxy para FixPay iniciado na porta ${PORT}.`);
    console.log('Endpoints disponíveis:');
    console.log('  POST /gerar-pix');
    console.log('  POST /consultar-pix');
    console.log('  POST /expirar-pix');
});