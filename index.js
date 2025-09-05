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