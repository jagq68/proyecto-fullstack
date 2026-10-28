const pool = require('../config/db');

// POST /api/chatbot/consultar (Atención al cliente automatizada - Simulación Voke Brasil)
const procesarMensajeChatbot = async (req, res) => {
    const { mensaje } = req.body;

    // Validación si el mensaje viene vacío
    if (!mensaje || mensaje.trim() === '') {
        return res.status(400).json({ respuesta: "Olá! Não entendi sua mensagem. Poderia digitar algo?" });
    }

    // Convertimos a minúsculas solo para evaluar las palabras clave del menú
    const texto = mensaje.toLowerCase().trim();

    try {
        // CASO A: Saludos e inicio de conversación
        if (texto.includes('ola') || texto.includes('oi') || texto.includes('bom dia') || texto.includes('boa tarde') || texto.includes('boa noite')) {
            return res.json({
                respuesta: "Olá! Sou o assistente virtual da Voke. Como posso ajudar você hoje?\n\n• Para saber o status de uma compra, digite: 'rastrear VK-XXXXXXXX'\n• Para saber nossos horários, digite: 'horário'"
            });
        }

        // CASO B: Consulta de horarios de atención de la tienda
        if (texto.includes('horario') || texto.includes('funcionamento') || texto.includes('atendimento')) {
            return res.json({
                respuesta: "Nosso horário de atendimento digital é de Segunda a Sexta-feira, das 08:00 às 18:00. Sábados das 09:00 às 13:00."
            });
        }

        // CASO C: Intención de Rastreo Logístico Inteligente (Soporta mayúsculas, minúsculas y tu clave de prueba anterior)
        if (texto.includes('rastrear') || texto.includes('pedido') || texto.includes('vk-')) {
            // Expresión regular flexible para aislar el patrón VK- y lo que le siga
            const regex = /(vk-[\w\$\{\}]+)/i;
            const coincidencia = mensaje.match(regex);

            if (!coincidencia) {
                return res.json({
                    respuesta: "Entendi que quer rastrear um pedido! Por favor, digite o código completo no formato VK-XXXXXXXX."
                });
            }

            // CORREÇÃO DEFINITIVA: Extraemos la coincidencia exacta (coincidencia[0])
            // Quitamos espacios y limpiamos posibles llaves de cierre duplicadas de Postman sin romper las minúsculas
            let codigoRastreo = coincidencia[0].trim().replace('}}', '}');

            // Estandarizamos únicamente el prefijo inicial a mayúsculas para la búsqueda en la BD
            if (codigoRastreo.startsWith('vk-')) {
                codigoRastreo = 'VK-' + codigoRastreo.substring(3);
            }

            // Consulta a PostgreSQL para traer la última actualización de seguimiento
            const query = `
                SELECT p.estado_pago, se.estado_logistico, se.detalles
                FROM pedidos p
                LEFT JOIN seguimiento_envios se ON p.id = se.pedido_id
                WHERE p.clave_rastreo = $1
                ORDER BY se.fecha_actualizacion DESC
                LIMIT 1;
            `;
            const result = await pool.query(query, [codigoRastreo]);

            // Si el código no coincide exactamente letra por letra en la BD
            if (result.rows.length === 0) {
                return res.json({
                    respuesta: `Infelizmente não encontrei nenhum pedido com o código de rastreamento *${codigoRastreo}* no sistema da Voke. Verifique os dígitos e tente novamente.`
                });
            }

            // CORRECCIÓN: Extraemos de forma segura la primera fila encontrada
            const infoEnvio = result.rows[0];
            return res.json({
                respuesta: `🤖 *Status do seu Pedido (${codigoRastreo}):*\n\n• *Situação do Pagamento:* ${infoEnvio.estado_pago}\n• *Fase Logística:* ${infoEnvio.estado_logistico}\n• *Última Atualização:* ${infoEnvio.detalles}`
            });
        }

        // CASO POR DEFECTO: Si el mensaje no coincide con ninguna palabra clave
        res.json({
            respuesta: "Desculpe, ainda estou aprendendo! Não entendi sua solicitação. Se quiser verificar sua entrega, lembre-se de escrever a palavra 'rastrear' acompanhada do seu código VK-."
        });

    } catch (error) {
        console.error("Error en el controlador del chatbot:", error);
        res.status(500).json({ error: "Ocorreu um erro no servidor ao processar a resposta do robô." });
    }
};

module.exports = { procesarMensajeChatbot };