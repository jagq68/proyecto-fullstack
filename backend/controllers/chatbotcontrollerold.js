const pool = require('../config/db');

// POST /api/chatbot/consultar (Atención al cliente automatizada)
const procesarMensajeChatbot = async (req, res) => {
    const { mensaje } = req.body;

    if (!mensaje || mensaje.trim() === '') {
        return res.status(400).json({ respuesta: "Olá! Não entendi sua mensagem. Poderia digitar algo?" });
    }

    const texto = mensaje.toLowerCase().trim();

    try {
        // CASO A: Saludos del cliente
        if (texto.includes('ola') || texto.includes('oi') || texto.includes('bom dia') || texto.includes('boa tarde')) {
            return res.json({
                respuesta: "Olá! Sou o assistente virtual da Voke. Como posso ajudar você hoje?\n\n1. Para saber o status de uma compra, digite: 'rastrear VK-XXXXXXXX'\n2. Para saber nossos horários, digite 'horário'"
            });
        }

        // CASO B: Consulta de Horarios corporativos de la simulación
        if (texto.includes('horario') || texto.includes('funcionamento') || texto.includes('atendimento')) {
            return res.json({
                respuesta: "Nosso horário de atendimento digital é de Segunda a Sexta-feira, das 08:00 às 18:00. Sábados das 09:00 às 13:00."
            });
        }

        // CASO C: Intención de Rastreo Logístico (Ej: "Rastrear meu pedido VK-12345678")
        if (texto.includes('rastrear') || texto.includes('pedido') || texto.includes('vk-')) {
            // Expresión regular para extraer el patrón VK- seguido de números o texto (captura tu clave literal anterior también)
            const regex = /(vk-[\w\$\{\}]+)/i;
            const coincidencia = mensaje.match(regex);

            if (!coincidencia) {
                return res.json({
                    respuesta: "Entendi que quer rastrear um pedido! Por favor, digite o código completo no formato VK-XXXXXXXX."
                });
            }

            //const codigoRastreo = coincidencia[0].toUpperCase();
            // Extrae la coincidencia, la pasa a mayúsculas y elimina llaves de cierre duplicadas o extras al final
            const codigoRastreo = coincidencia[0].toUpperCase().replace('}}', '}');

            // Consultar a la base de datos PostgreSQL la situación del paquete
            const query = `
                SELECT p.estado_pago, se.estado_logistico, se.detalles
                FROM pedidos p
                LEFT JOIN seguimiento_envios se ON p.id = se.pedido_id
                WHERE p.clave_rastreo = $1
                ORDER BY se.fecha_actualizacion DESC
                LIMIT 1;
            `;
            const result = await pool.query(query, [codigoRastreo]);

            if (result.rows.length === 0) {
                return res.json({
                    respuesta: `Infelizmente não encontrei nenhum pedido com o código de rastreamento *${codigoRastreo}* no sistema da Voke. Verifique os dígitos e tente novamente.`
                });
            }

            const infoEnvio = result.rows[0];
            return res.json({
                respuesta: `🤖 *Status do seu Pedido (${codigoRastreo}):*\n\n• *Situação do Pagamento:* ${infoEnvio.estado_pago}\n• *Fase Logística:* ${infoEnvio.estado_logistico}\n• *Última Atualização:* ${infoEnvio.detalles}`
            });
        }

        // CASO POR DEFECTO: Si el chatbot no logra mapear palabras clave
        res.json({
            respuesta: "Desculpe, ainda estou aprendendo! Não entendi sua solicitação. Se quiser verificar sua entrega, lembre-se de escrever a palavra 'rastrear' acompanhada do seu código VK-."
        });

    } catch (error) {
        console.error("Error en el chatbot interno:", error);
        res.status(500).json({ error: "Ocorreu um erro no servidor ao processar a resposta do robô." });
    }
};

module.exports = { procesarMensajeChatbot };