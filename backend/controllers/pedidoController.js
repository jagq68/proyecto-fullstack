const pool = require('../config/db');

// 1. POST /api/pedidos/checkout (Transformar el carrito en un pedido histórico)
const procesarCheckout = async (req, res) => {
    const usuarioId = req.usuario.id;
    const { metodoPago } = req.body; // 'Pix' o 'Cartão de Crédito'

    if (!metodoPago) {
        return res.status(400).json({ error: "Debe seleccionar un método de pago válido ('Pix' o 'Cartão de Crédito')." });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // A. Obtener el carrito activo del usuario
        const carritoQuery = 'SELECT id FROM carritos WHERE usuario_id = \$1';
        const carritoRes = await client.query(carritoQuery, [usuarioId]);
        
        if (carritoRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "No se encontró un carrito activo para este usuario." });
        }
        const carritoId = carritoRes.rows[0].id;

        // B. Obtener los productos dentro de ese carrito junto con su precio actual
        const elementosQuery = `
            SELECT ce.producto_id, ce.cantidad, p.precio 
            FROM carrito_elementos ce
            JOIN productos p ON ce.producto_id = p.id
            WHERE ce.carrito_id = \$1
        `;
        const elementosRes = await client.query(elementosQuery, [carritoId]);

        if (elementosRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Tu carrito de compras está vacío." });
        }

        // C. Calcular el monto total de la compra en caliente
        const totalPedido = elementosRes.rows.reduce((acc, item) => acc + (parseFloat(item.precio) * item.cantidad), 0);

        // D. Generar una clave de rastreo simulada única con el prefijo de Voke
        const numeroAleatorio = Math.floor(10000000 + Math.random() * 90000000);
        const claveRastreo = `VK-\${numeroAleatorio}`;

        // E. Insertar la cabecera del pedido (Por defecto queda 'Aguardando Pagamento')
        const queryPedido = `
            INSERT INTO pedidos (usuario_id, total, metodo_pago, estado_pago, clave_rastreo)
            VALUES (\$1, \$2, \$3, 'Aguardando Pagamento', \$4)
            RETURNING *;
        `;
        const pedidoRes = await client.query(queryPedido, [usuarioId, totalPedido, metodoPago, claveRastreo]);
        const nuevoPedidoId = pedidoRes.rows[0].id;

        // F. Mover los elementos congelando su precio en 'pedido_elementos'
        for (const item of elementosRes.rows) {
            const queryElementoPedido = `
                INSERT INTO pedido_elementos (pedido_id, producto_id, cantidad, precio_historico)
                VALUES (\$1, \$2, \$3, \$4);
            `;
            await client.query(queryElementoPedido, [nuevoPedidoId, item.producto_id, item.cantidad, item.precio]);
        }

        // G. Insertar el primer estado logístico en la línea de tiempo de envíos
        const queryEnvio = `
            INSERT INTO seguimiento_envios (pedido_id, estado_logistico, detalles)
            VALUES (\$1, 'Aguardando Pagamento', 'O pedido foi recebido pelo sistema de Voke e aguarda a confirmação do pagamento.');
        `;
        await client.query(queryEnvio, [nuevoPedidoId]);

        // H. ¡Limpieza! Vaciar el carrito de compras del usuario
        await client.query('DELETE FROM carrito_elementos WHERE carrito_id = \$1', [carritoId]);

        await client.query('COMMIT');

        res.status(201).json({
            mensaje: "¡Pedido procesado con éxito en el sistema!",
            pedido: {
                id: nuevoPedidoId,
                total: totalPedido,
                metodo_pago: metodoPago,
                estado_pago: "Aguardando Pagamento",
                clave_rastreo: claveRastreo
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al procesar el checkout:", error);
        res.status(500).json({ error: "Error interno en el servidor al generar la orden de compra." });
    } finally {
        client.release();
    }
};

// 2. GET /api/pedidos/rastreio/:codigo (Consultar estado logístico de forma pública)
const consultarRastreo = async (req, res) => {
    const { codigo } = req.params;

    try {
        const query = `
            SELECT p.clave_rastreo, p.estado_pago, p.fecha_pedido, p.total,
                   COALESCE(json_agg(json_build_object(
                       'estado', se.estado_logistico,
                       'data', se.fecha_actualizacion
                   ) ORDER BY se.fecha_actualizacion DESC), '[]') AS historial_logistico
            FROM pedidos p
            LEFT JOIN seguimiento_envios se ON p.id = se.pedido_id
            WHERE p.clave_rastreo = \$1
            GROUP BY p.id;
        `;
        const result = await pool.query(query, [codigo]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Código de rastreamento inválido ou não encontrado." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al consultar el rastreo:", error);
        res.status(500).json({ error: "Error interno en el servidor al consultar logística." });
    }
};

module.exports = { procesarCheckout, consultarRastreo };