const pool = require('../config/db');

// POST /api/pagos/procesar
const procesarPagoSimulado = async (req, res) => {
    const { pedidoId, metodoPago, detallesTarjeta } = req.body;

    if (!pedidoId || !metodoPago) {
        return res.status(400).json({ error: "Debe suministrar el pedidoId y el metodoPago ('Pix' o 'Cartão de Crédito')." });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Verificar que el pedido exista y esté pendiente de pago
        const pedidoQuery = "SELECT * FROM pedidos WHERE id = \$1";
        const pedidoRes = await client.query(pedidoQuery, [pedidoId]);

        if (pedidoRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Pedido no encontrado en el sistema." });
        }

        const pedido = pedidoRes.rows[0];

        if (pedido.estado_pago === 'Pago Aprovado') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Este pedido já foi pago e aprovado anteriormente." });
        }

        // 2. Flujo si el usuario paga con PIX
        if (metodoPago === 'Pix') {
            // Simular actualización del pedido a Aprobado
            await client.query("UPDATE pedidos SET estado_pago = 'Pago Aprovado' WHERE id = \$1", [pedidoId]);

            // Inyectar el siguiente paso logístico en la línea de tiempo de Voke
            const queryEnvio = `
                INSERT INTO seguimiento_envios (pedido_id, estado_logistico, detalles)
                VALUES ($1, 'Separando estoque', 'Pagamento via PIX confirmado instantaneamente. O pedido foi encaminhado para separação de estoque no centro de distribuição.');
            `;
            await client.query(queryEnvio, [pedidoId]);

            // Inyectar el evento en la tabla de métricas para el Dashboard analítico
            await client.query("INSERT INTO metricas_tienda (tipo_evento, monto_venta) VALUES ('venda_concluida', \$1)", [pedido.total]);

            await client.query('COMMIT');

            return res.json({
                mensaje: "¡Pago por PIX procesado con éxito!",
                status: "Pago Aprovado",
                pix_copia_e_cola: "00020101021226870014br.gov.bcb.pix2565voke-ficticio-qr-code-key-alberto-guatume",
                qrcode_simulado_url: "https://qrserver.com"
            });
        }

        // 3. Flujo si el usuario paga con Tarjeta de Crédito (Cartão de Crédito)
        if (metodoPago === 'Cartão de Crédito') {
            if (!detallesTarjeta || !detallesTarjeta.numeroTarjeta) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: "Debe suministrar los datos de la tarjeta de crédito para procesar." });
            }

            // Simulación financiera: Rechaza si el número termina en '0000', aprueba el resto
            if (detallesTarjeta.numeroTarjeta.endsWith('0000')) {
                await client.query("UPDATE pedidos SET estado_pago = 'Recusado' WHERE id = \$1", [pedidoId]);
                
                await client.query(`
                    INSERT INTO seguimiento_envios (pedido_id, estado_logistico, detalles)
                    VALUES ($1, 'Aguardando Pagamento', 'A transação do cartão foi recusada pela operadora. Por favor, tente com outro método.');
                `);

                await client.query('COMMIT');
                return res.status(402).json({ error: "Transação recusada. Saldo insuficiente ou dados incorretos." });
            }

            // Si es aprobada con éxito
            await client.query("UPDATE pedidos SET estado_pago = 'Pago Aprovado' WHERE id = \$1", [pedidoId]);

            const queryEnvioCartao = `
                INSERT INTO seguimiento_envios (pedido_id, estado_logistico, detalles)
                VALUES ($1, 'Separando estoque', 'Pagamento via Cartão de Crédito aprovado. O pedido já está em preparação logística.');
            `;
            await client.query(queryEnvioCartao, [pedidoId]);

            await client.query("INSERT INTO metricas_tienda (tipo_evento, monto_venta) VALUES ('venda_concluida', \$1)", [pedido.total]);

            await client.query('COMMIT');
            return res.json({
                mensaje: "¡Transacción de tarjeta aprobada con éxito!",
                status: "Pago Aprovado",
                comprovante_id: `COMP-${Math.floor(100000 + Math.random() * 900000)}`
            });
        }

        // Si mandan un método no soportado
        await client.query('ROLLBACK');
        res.status(400).json({ error: "Método de pagamento não suportado no sistema Voke." });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error en pasarela de pago:", error);
        res.status(500).json({ error: "Error interno del servidor al procesar la pasarela financiera." });
    } finally {
        client.release();
    }
};

module.exports = { procesarPagoSimulado };