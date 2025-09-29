const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3001;

app.use(express.json());

app.post('/consultar-pix', async (req, res) => {
    // ... (logs iniciais iguais)
    const { tokenLink, bearerToken } = req.body;
    if (!tokenLink || !bearerToken) { /* ... */ }
    const fixPayUrl = `https://pix.fixpay.com.br:3467/v1/consult_pix/${tokenLink}`;

    try {
        const config = {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'User-Agent': 'NodeJS-Proxy-Client/1.0',
                'Content-Type': 'application/json'
            },
            // ADICIONADO: Timeout de 15 segundos
            timeout: 15000 
        };
        
        console.log('> Enviando requisição para a FixPay...');
        const fixPayResponse = await axios.get(fixPayUrl, config);

        console.log(`> SUCESSO! FixPay respondeu com status: ${fixPayResponse.status}`);
        return res.status(fixPayResponse.status).json(fixPayResponse.data);

    } catch (error) {
        // ... (bloco de erro igual)
    }
});

app.listen(PORT, () => {
    console.log(`Serviço de proxy para FixPay iniciado na porta ${PORT}.`);
});

// Novo endpoint para expirar PIX
app.post('/expirar-pix', async (req, res) => {
    console.log('> Recebida requisição para expirar PIX');
    const { tokenLink, bearerToken } = req.body;
    
    if (!tokenLink || !bearerToken) {
        console.log('> ERRO: tokenLink ou bearerToken não fornecidos');
        return res.status(400).json({ error: 'tokenLink e bearerToken são obrigatórios' });
    }
    
    // ENDPOINT DE EXPIRACAO
    
    const fixPayUrl = `https://pix.fixpay.com.br:3467/v1/expire/${tokenLink}`;

    try {
        const config = {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'User-Agent': 'NodeJS-Proxy-Client/1.0',
                'Content-Type': 'application/json'
            },
            // Timeout de 15 segundos
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
});