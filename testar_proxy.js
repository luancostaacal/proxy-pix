const axios = require('axios');

// Configuração do teste
const PROXY_URL = 'http://localhost:3001';
const BEARER_TOKEN = '52a78d3f0f80695837b0e7b8c063baaf';

// Teste 1: Gerar PIX com os parâmetros que funcionaram no Postman
async function testarGerarPix() {
    console.log('=== TESTE 1: Gerar PIX ===');
    
    const dadosPix = {
        value: 1.00,
        message: "Teste de PIX para Pedido #teste2",
        expiration_time: "",
        captura_id: 9,
        usuario: "LUAN COSTA",
        usuario_id: 99,
        user_email: "LUAN.COSTA@ACALHOMECENTER.COM.BR",
        partner_id: 1
    };
    
    try {
        const response = await axios.post(`${PROXY_URL}/gerar-pix`, dadosPix, {
            headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ SUCESSO ao gerar PIX!');
        console.log('Resposta:', JSON.stringify(response.data, null, 2));
        
        // Retornar o tokenLink para os próximos testes
        if (response.data && response.data.data && response.data.data.tokenLink) {
            return response.data.data.tokenLink;
        }
        return null;
        
    } catch (error) {
        console.log('❌ ERRO ao gerar PIX:');
        console.log('Status:', error.response?.status);
        console.log('Erro:', error.response?.data);
        return null;
    }
}

// Teste 2: Consultar PIX
async function testarConsultarPix(tokenLink) {
    console.log('\n=== TESTE 2: Consultar PIX ===');
    
    if (!tokenLink) {
        console.log('⚠️  TokenLink não disponível, pulando teste de consulta');
        return;
    }
    
    try {
        const response = await axios.post(`${PROXY_URL}/consultar-pix`, 
            { tokenLink },
            {
                headers: {
                    'Authorization': `Bearer ${BEARER_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ SUCESSO ao consultar PIX!');
        console.log('Resposta:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ ERRO ao consultar PIX:');
        console.log('Status:', error.response?.status);
        console.log('Erro:', error.response?.data);
    }
}

// Teste 3: Expirar PIX
async function testarExpirarPix(tokenLink) {
    console.log('\n=== TESTE 3: Expirar PIX ===');
    
    if (!tokenLink) {
        console.log('⚠️  TokenLink não disponível, pulando teste de expiração');
        return;
    }
    
    try {
        const response = await axios.post(`${PROXY_URL}/expirar-pix`, 
            { tokenLink },
            {
                headers: {
                    'Authorization': `Bearer ${BEARER_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ SUCESSO ao expirar PIX!');
        console.log('Resposta:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ ERRO ao expirar PIX:');
        console.log('Status:', error.response?.status);
        console.log('Erro:', error.response?.data);
    }
}

// Executar todos os testes
async function executarTestes() {
    console.log('Iniciando testes do proxy PIX...\n');
    
    const tokenLink = await testarGerarPix();
    
    // Aguardar um pouco antes de consultar
    if (tokenLink) {
        console.log('\nAguardando 2 segundos antes de consultar...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await testarConsultarPix(tokenLink);
        
        console.log('\nAguardando 2 segundos antes de expirar...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await testarExpirarPix(tokenLink);
    }
    
    console.log('\n✅ Testes concluídos!');
    process.exit(0);
}

// Verificar se o axios está disponível
try {
    require('axios');
    executarTestes();
} catch (error) {
    console.log('❌ axios não está instalado. Instalando...');
    const { execSync } = require('child_process');
    execSync('npm install axios', { stdio: 'inherit' });
    console.log('✅ axios instalado. Executando testes...');
    executarTestes();
}