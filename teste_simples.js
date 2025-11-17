const axios = require('axios');

async function testarProxy() {
    try {
        console.log('Testando proxy PIX...');
        
        const response = await axios.post('http://localhost:3002/gerar-pix', {
            value: 1.00,
            message: "Teste de PIX para Pedido #teste2",
            expiration_time: "",
            captura_id: 9,
            usuario: "LUAN COSTA",
            usuario_id: 99,
            user_email: "LUAN.COSTA@ACALHOMECENTER.COM.BR",
            partner_id: 1
        }, {
            headers: {
                'Authorization': 'Bearer 52a78d3f0f80695837b0e7b8c063baaf',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ SUCESSO!', response.data);
        
    } catch (error) {
        console.log('❌ ERRO:', error.response?.data || error.message);
    }
}

// Verificar se axios está instalado
try {
    require('axios');
    testarProxy();
} catch (error) {
    console.log('Instalando axios...');
    require('child_process').execSync('npm install axios');
    testarProxy();
}