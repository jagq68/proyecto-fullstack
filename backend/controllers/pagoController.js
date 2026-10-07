const pool = require('../config/db');

// POST /api/pagos/finalizar
const procesarPagoSimulado = async (req, res) => {
    const usuarioId = req.usuario.id; 
    
    const { items, total, metodo_pago, cuotas, logistica, detallesTarjeta } = req.body;
    const { cep, direccion, ciudad } = logistica || {};

    if (!metodo_pago || !cep || !direccion || !ciudad || !items || items.length === 0) {
        return res.status(400).json({ error: "Faltan datos obligatorios de despacho, artículos o método de pago." });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. OBTENER EL EMAIL DEL USUARIO PARA EL RECIBO DIGITAL
        const userQuery = "SELECT email FROM usuarios WHERE id = \$1;";
        const userRes = await client.query(userQuery, [usuarioId]);
        const emailCliente = userRes.rows[0]?.email || 'correo_registrado@voke.com';

        // 2. CONTROL DE INVENTARIO Y REBAJA DE STOCK EN POSTGRESQL
        for (const item of items) {
            const idProd = item.producto_id || item.id;
            const cantidadComprada = item.cantidad || 1;

            const prodQuery = "SELECT stock, nombre FROM productos WHERE id = \$1 FOR UPDATE;";
            const prodRes = await client.query(prodQuery, [idProd]);

            if (prodRes.rows.length === 0) {
                throw new Error(`O produto com ID ${idProd} não existe no catálogo.`);
            }

            const producto = prodRes.rows[0];

            if (producto.stock < cantidadComprada) {
                throw new Error(`Estoque insuficiente para "${producto.nombre}". Disponível: ${producto.stock}`);
            }

            await client.query("UPDATE productos SET stock = stock - \$1 WHERE id = \$2", [cantidadComprada, idProd]);
        }

        // 3. ACTUALIZACIÓN PERMANENTE DEL PERFIL DEL CLIENTE
        const updatePerfilQuery = `
            UPDATE clientes_perfil 
            SET cep = $1, direccion = $2, ciudad = $3 
            WHERE usuario_id = $4;
        `;
        await client.query(updatePerfilQuery, [cep.trim(), direccion.trim(), ciudad.trim(), usuarioId]);

        // 4. REGISTRO DE LA ORDEN DE COMPRA (CORREGIDO: 'Pago Aprovado' con O mayúscula)
        const estadoPagoInicial = metodo_pago === 'Pix' ? 'Pago Aprovado' : 'Pago Aprovado'; // Simulamos aprobación directa para pruebas
        
        const insertarPedidoQuery = `
            INSERT INTO pedidos (usuario_id, total, metodo_pago, cuotas, status_envio, estado_pago, cep, direccion, ciudad)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id;
        `;
        const resPedido = await client.query(insertarPedidoQuery, [
            usuarioId, total, metodo_pago, parseInt(cuotas || 1), 'Pendiente', estadoPagoInicial, cep.trim(), direccion.trim(), ciudad || ciudad.trim()
        ]);
        const nuevoPedidoId = resPedido.rows[0].id;

        // ========================================================
        // NUEVO: INSERTAR DETALLES EN LA TABLA HIJA pedido_elementos
        // ========================================================
        for (const item of items) {
            const idProd = item.producto_id || item.id;
            const cantidadComprada = item.cantidad || 1;
            const precioHistorico = item.precio || 0;

            const insertarElementoQuery = `
                INSERT INTO pedido_elementos (pedido_id, producto_id, cantidad, precio_historico)
                VALUES ($1, $2, $3, $4);
            `;
            await client.query(insertarElementoQuery, [nuevoPedidoId, idProd, cantidadComprada, precioHistorico]);
        }

        // 5. LIMPIEZA FÍSICA DEL CARRITO EN LA BASE DE DATOS
        const buscarCarritoQuery = "SELECT id FROM carritos WHERE usuario_id = \$1;";
        const resCarrito = await client.query(buscarCarritoQuery, [usuarioId]);
        if (resCarrito.rows.length > 0) {
            const carritoId = resCarrito.rows[0].id;
            await client.query("DELETE FROM carrito_elementos WHERE carrito_id = \$1;", [carritoId]);
        }

        // 6. PROCESAMIENTO DE LAS PASARELAS FINANCIERAS SIMULADAS
        if (metodo_pago === 'Pix') {
            await client.query(`
                INSERT INTO seguimiento_envios (pedido_id, estado_logistico, detalles)
                VALUES ($1, 'Separando estoque', 'Pagamento via PIX confirmado instantaneamente. O pedido foi encaminhado para separação de estoque.');
            `, [nuevoPedidoId]);

            await client.query("INSERT INTO metricas_tienda (tipo_evento, monto_venta) VALUES ('venda_concluida', \$1)", [total]);
            await client.query('COMMIT');

            return res.status(201).json({
                mensaje: "¡Pago por PIX procesado con éxito!",
                pedidoId: nuevoPedidoId,
                status: "Pago Aprovado",
                email: emailCliente,
                pix_copia_e_cola: "00020101021226870014br.gov.bcb.pix2565voke-ficticio-qr-code-key"
            });
        }

        if (metodo_pago === 'Credito' || metodo_pago === 'Debito') {
            const nTarjeta = detallesTarjeta?.numeroTarjeta || '';
            
            if (nTarjeta.endsWith('0000')) {
                await client.query("UPDATE pedidos SET estado_pago = 'Recusado' WHERE id = \$1", [nuevoPedidoId]);
                await client.query(`
                    INSERT INTO seguimiento_envios (pedido_id, estado_logistico, detalles)
                    VALUES ($1, 'Aguardando Pagamento', 'A transação do cartão foi recusada pela operadora devido a saldo insuficiente.');
                `, [nuevoPedidoId]);

                await client.query('COMMIT');
                return res.status(402).json({ error: "Transação recusada. Saldo insuficiente ou dados incorretos." });
            }

            const detallesLogistica = metodo_pago === 'Credito' 
                ? `Pagamento via Cartão de Crédito aprovado em ${cuotas} parcelas.`
                : 'Pagamento via Cartão de Débito à vista aprovado com sucesso.';

            await client.query(`
                INSERT INTO seguimiento_envios (pedido_id, estado_logistico, detalles)
                VALUES ($1, 'Separando estoque', $2);
            `, [nuevoPedidoId, detallesLogistica]);

            await client.query("INSERT INTO metricas_tienda (tipo_evento, monto_venta) VALUES ('venda_concluida', \$1)", [total]);
            await client.query('COMMIT');

            return res.status(201).json({
                mensaje: `¡Transacción de ${metodo_pago} aprobada con éxito!`,
                pedidoId: nuevoPedidoId,
                status: "Pago Aprovado",
                email: emailCliente,
                comprovante_id: `COMP-${Math.floor(100000 + Math.random() * 900000)}`
            });
        }

        throw new Error("Método de pagamento não suportado no sistema Voke.");

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error en la arquitectura de pagos:", error.message);
        res.status(500).json({ error: error.message || "Error interno del servidor." });
    } finally {
        client.release();
    }
};

module.exports = { procesarPagoSimulado };

// const pool = require('../config/db');

// // POST /api/pagos/finalizar
// const procesarPagoSimulado = async (req, res) => {
//     const usuarioId = req.usuario.id; 
    
//     const { items, total, metodo_pago, cuotas, logistica, detallesTarjeta } = req.body;
//     const { cep, direccion, ciudad } = logistica || {};

//     if (!metodo_pago || !cep || !direccion || !ciudad || !items || items.length === 0) {
//         return res.status(400).json({ error: "Faltan datos obligatorios de despacho, artículos o método de pago." });
//     }

//     const client = await pool.connect();
//     try {
//         await client.query('BEGIN');

//         // 1. OBTENER EL EMAIL DEL USUARIO PARA EL RECIBO DIGITAL
//         const userQuery = "SELECT email FROM usuarios WHERE id = \$1;";
//         const userRes = await client.query(userQuery, [usuarioId]);
//         const emailCliente = userRes.rows[0]?.email || 'correo_registrado@voke.com';

//         // 2. CONTROL DE INVENTARIO Y REBAJA DE STOCK EN POSTGRESQL
//         for (const item of items) {
//             const idProd = item.producto_id || item.id;
//             const cantidadComprada = item.cantidad || 1;

//             const prodQuery = "SELECT stock, nombre FROM productos WHERE id = \$1 FOR UPDATE;";
//             const prodRes = await client.query(prodQuery, [idProd]);

//             if (prodRes.rows.length === 0) {
//                 throw new Error(`O produto com ID ${idProd} não existe no catálogo.`);
//             }

//             const producto = prodRes.rows[0];

//             if (producto.stock < cantidadComprada) {
//                 throw new Error(`Estoque insuficiente para "${producto.nombre}". Disponível: ${producto.stock}`);
//             }

//             await client.query("UPDATE productos SET stock = stock - \$1 WHERE id = \$2", [cantidadComprada, idProd]);
//         }

//         // 3. ACTUALIZACIÓN PERMANENTE DEL PERFIL DEL CLIENTE
//         const updatePerfilQuery = `
//             UPDATE clientes_perfil 
//             SET cep = $1, direccion = $2, ciudad = $3 
//             WHERE usuario_id = $4;
//         `;
//         await client.query(updatePerfilQuery, [cep.trim(), direccion.trim(), ciudad.trim(), usuarioId]);

//         // 4. REGISTRO DE LA ORDEN DE COMPRA (INSERT PEDIDO)
//         const estadoPagoInicial = metodo_pago === 'Pix' ? 'Pago Aprovado' : 'Aguardando Validação';
        
//         const insertarPedidoQuery = `
//             INSERT INTO pedidos (usuario_id, total, metodo_pago, cuotas, status_envio, estado_pago, cep, direccion, ciudad)
//             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
//             RETURNING id;
//         `;
//         const resPedido = await client.query(insertarPedidoQuery, [
//             usuarioId, total, metodo_pago, parseInt(cuotas || 1), 'Pendiente', estadoPagoInicial, cep.trim(), direccion.trim(), ciudad.trim()
//         ]);
//         const nuevoPedidoId = resPedido.rows[0].id;

//         // ========================================================
//         // 5. LIMPIEZA FÍSICA DEL CARRITO EN LA BASE DE DATOS (CRUCIAL)
//         // ========================================================
//         const buscarCarritoQuery = "SELECT id FROM carritos WHERE usuario_id = \$1;";
//         const resCarrito = await client.query(buscarCarritoQuery, [usuarioId]);
//         if (resCarrito.rows.length > 0) {
//             const carritoId = resCarrito.rows[0].id;
//             // Borramos los elementos del carrito en PostgreSQL para que quede vacío
//             await client.query("DELETE FROM carrito_elementos WHERE carrito_id = \$1;", [carritoId]);
//         }

//         // ========================================================
//         // 6. PROCESAMIENTO DE LAS PASARELAS FINANCIERAS SIMULADAS
//         // ========================================================
        
//         // --- FLUJO PIX ---
//         if (metodo_pago === 'Pix') {
//             await client.query(`
//                 INSERT INTO seguimiento_envios (pedido_id, estado_logistico, detalles)
//                 VALUES ($1, 'Separando estoque', 'Pagamento via PIX confirmado instantaneamente. O pedido foi encaminhado para separação de estoque.');
//             `, [nuevoPedidoId]);

//             await client.query("INSERT INTO metricas_tienda (tipo_evento, monto_venta) VALUES ('venda_concluida', \$1)", [total]);
//             await client.query('COMMIT');

//             return res.status(201).json({
//                 mensaje: "¡Pago por PIX procesado con éxito!",
//                 pedidoId: nuevoPedidoId,
//                 status: "Pago Aprovado",
//                 email: emailCliente, // Enviamos el correo al frontend
//                 pix_copia_e_cola: "00020101021226870014br.gov.bcb.pix2565voke-ficticio-qr-code-key"
//             });
//         }

//         // --- FLUJO TARJETAS (CRÉDITO Y DÉBITO) ---
//         if (metodo_pago === 'Credito' || metodo_pago === 'Debito') {
//             const nTarjeta = detallesTarjeta?.numeroTarjeta || '';
            
//             // Regla de simulación de rechazo: si termina en '0000'
//             if (nTarjeta.endsWith('0000')) {
//                 await client.query("UPDATE pedidos SET estado_pago = 'Recusado' WHERE id = \$1", [nuevoPedidoId]);
//                 await client.query(`
//                     INSERT INTO seguimiento_envios (pedido_id, estado_logistico, detalles)
//                     VALUES ($1, 'Aguardando Pagamento', 'A transação do cartão foi recusada pela operadora devido a saldo insuficiente.');
//                 `, [nuevoPedidoId]);

//                 await client.query('COMMIT');
//                 return res.status(402).json({ error: "Transação recusada. Saldo insuficiente ou dados incorretos." });
//             }

//             // Si la tarjeta es aprobada
//             await client.query("UPDATE pedidos SET estado_pago = 'Pago Aprovado' WHERE id = \$1", [nuevoPedidoId]);
            
//             const detallesLogistica = metodo_pago === 'Credito' 
//                 ? `Pagamento via Cartão de Crédito aprovado em ${cuotas} parcelas.`
//                 : 'Pagamento via Cartão de Débito à vista aprovado com sucesso.';

//             await client.query(`
//                 INSERT INTO seguimiento_envios (pedido_id, estado_logistico, detalles)
//                 VALUES ($1, 'Separando estoque', $2);
//             `, [nuevoPedidoId, detallesLogistica]);

//             await client.query("INSERT INTO metricas_tienda (tipo_evento, monto_venta) VALUES ('venda_concluida', \$1)", [total]);
//             await client.query('COMMIT');

//             return res.status(201).json({
//                 mensaje: `¡Transacción de ${metodo_pago} aprobada con éxito!`,
//                 pedidoId: nuevoPedidoId,
//                 status: "Pago Aprovado",
//                 email: emailCliente, // Enviamos el correo al frontend
//                 comprovante_id: `COMP-${Math.floor(100000 + Math.random() * 900000)}`
//             });
//         }

//         throw new Error("Método de pagamento não suportado no sistema Voke.");

//     } catch (error) {
//         await client.query('ROLLBACK');
//         console.error("Error en la arquitectura de pagos:", error.message);
//         res.status(500).json({ error: error.message || "Error interno del servidor." });
//     } finally {
//         client.release();
//     }
// };

// module.exports = { procesarPagoSimulado };
//
// const pool = require('../config/db');

// // POST /api/pagos/finalizar
// const procesarPagoSimulado = async (req, res) => {
//     // 🔍 IMPRESIÓN DE DIAGNÓSTICO EN TU TERMINAL NEGRA
//     console.log("==================================================");
//     console.log("== 📥 DATOS RECIBIDOS EN EL REQ.BODY DEL PAGO ==");
//     console.log(req.body);
//     console.log("==================================================");

    
    
//     // ... resto de tu código igual


//     // El id del usuario es inyectado de forma limpia y transparente por el middleware 'autenticarToken'
//     const usuarioId = req.usuario.id; 
    
//     const { items, total, metodo_pago, cuotas, logistica, detallesTarjeta } = req.body;
//     const { cep, direccion, ciudad } = logistica || {};

//     // Validación estricta de parámetros requeridos por la regla de negocio de Voke
//     if (!metodo_pago || !cep || !direccion || !ciudad || !items || items.length === 0) {
//         return res.status(400).json({ error: "Faltan datos obligatorios de despacho, artículos o método de pago." });
//     }

//     const client = await pool.connect();
//     try {
//         await client.query('BEGIN');

//         // ========================================================
//         // 1. CONTROL DE INVENTARIO Y REBAJA DE STOCK EN POSTGRESQL
//         // ========================================================
//         for (const item of items) {
//             const idProd = item.producto_id || item.id;
//             const cantidadComprada = item.cantidad || 1;

//             const prodQuery = "SELECT stock, nombre FROM productos WHERE id = \$1 FOR UPDATE;";
//             const prodRes = await client.query(prodQuery, [idProd]);

//             if (prodRes.rows.length === 0) {
//                 throw new Error(`O produto com ID ${idProd} não existe no catálogo.`);
//             }

//             const producto = prodRes.rows[0];

//             if (producto.stock < cantidadComprada) {
//                 throw new Error(`Estoque insuficiente para "${producto.nombre}". Disponível: ${producto.stock}`);
//             }

//             // Ejecutar la disminución física en la base de datos
//             await client.query("UPDATE productos SET stock = stock - \$1 WHERE id = \$2", [cantidadComprada, idProd]);
//         }

//         // ========================================================
//         // 2. ACTUALIZACIÓN PERMANENTE DEL PERFIL DEL CLIENTE (UPDATE)
//         // ========================================================
//         const updatePerfilQuery = `
//             UPDATE clientes_perfil 
//             SET cep = $1, direccion = $2, ciudad = $3 
//             WHERE usuario_id = $4;
//         `;
//         await client.query(updatePerfilQuery, [cep.trim(), direccion.trim(), ciudad.trim(), usuarioId]);

//         // ========================================================
//         // 3. REGISTRO DE LA ORDEN DE COMPRA (INSERT PEDIDO)
//         // ========================================================
//         const estadoPagoInicial = metodo_pago === 'Pix' ? 'Pago Aprovado' : 'Aguardando Validação';
        
//         const insertarPedidoQuery = `
//             INSERT INTO pedidos (usuario_id, total, metodo_pago, cuotas, status_envio, estado_pago, cep, direccion, ciudad)
//             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
//             RETURNING id;
//         `;
//         const resPedido = await client.query(insertarPedidoQuery, [
//             usuarioId, total, metodo_pago, parseInt(cuotas || 1), 'Pendiente', estadoPagoInicial, cep.trim(), direccion.trim(), ciudad.trim()
//         ]);
//         const nuevoPedidoId = resPedido.rows[0].id;

//         // ========================================================
//         // 4. FLUJOS INDIVIDUALES DE LA PASARELA FINANCIERA SIMULADA
//         // ========================================================
        
//         // --- FLUJO A: PAGO POR PIX ---
//         if (metodo_pago === 'Pix') {
//             await client.query(`
//                 INSERT INTO seguimiento_envios (pedido_id, estado_logistico, detalles)
//                 VALUES (\$1, 'Separando estoque', 'Pagamento via PIX confirmado instantaneamente. O pedido foi encaminhado para separação de estoque.');
//             `, [nuevoPedidoId]);

//             await client.query("INSERT INTO metricas_tienda (tipo_evento, monto_venta) VALUES ('venda_concluida', \$1)", [total]);
//             await client.query('COMMIT');

//             return res.status(201).json({
//                 mensaje: "¡Pago por PIX procesado con éxito!",
//                 pedidoId: nuevoPedidoId,
//                 status: "Pago Aprovado",
//                 pix_copia_e_cola: "00020101021226870014br.gov.bcb.pix2565voke-ficticio-qr-code-key-alberto-guatume"
//             });
//         }

//         // --- FLUJO B: TARJETAS (CRÉDITO Y DÉBITO) ---
//         if (metodo_pago === 'Credito' || metodo_pago === 'Debito') {
//             const nTarjeta = detallesTarjeta?.numeroTarjeta || '';
            
//             // Regla financiera: Rechaza transacciones si el número simulado termina en '0000'
//             if (nTarjeta.endsWith('0000')) {
//                 await client.query("UPDATE pedidos SET estado_pago = 'Recusado' WHERE id = \$1", [nuevoPedidoId]);
//                 await client.query(`
//                     INSERT INTO seguimiento_envios (pedido_id, estado_logistico, detalles)
//                     VALUES (\$1, 'Aguardando Pagamento', 'A transação do cartão foi recusada pela operadora devido a saldo insuficiente.');
//                 `, [nuevoPedidoId]);

//                 await client.query('COMMIT');
//                 return res.status(402).json({ error: "Transação recusada. Saldo insuficiente ou dados incorretos." });
//             }

//             // Transacción con tarjeta aprobada con éxito
//             await client.query("UPDATE pedidos SET estado_pago = 'Pago Aprovado' WHERE id = \$1", [nuevoPedidoId]);
            
//             const detallesLogistica = metodo_pago === 'Credito' 
//                 ? `Pagamento via Cartão de Crédito aprovado em ${cuotas} parcelas.`
//                 : 'Pagamento via Cartão de Débito à vista aprovado com sucesso.';

//             await client.query(`
//                 INSERT INTO seguimiento_envios (pedido_id, estado_logistico, detalles)
//                 VALUES (\$1, 'Separando estoque', \$2);
//             `, [nuevoPedidoId, detallesLogistica]);

//             await client.query("INSERT INTO metricas_tienda (tipo_evento, monto_venta) VALUES ('venda_concluida', \$1)", [total]);
//             await client.query('COMMIT');

//             return res.status(201).json({
//                 mensaje: "¡Transacción de tarjeta aprobada con éxito!",
//                 pedidoId: nuevoPedidoId,
//                 status: "Pago Aprovado",
//                 comprovante_id: `COMP-${Math.floor(100000 + Math.random() * 900000)}`
//             });
//         }

//         // Si se envía un método no mapeado
//         throw new Error("Método de pagamento não suportado no sistema Voke.");

//     } catch (error) {
//         await client.query('ROLLBACK');
//         console.error("Error en la arquitectura de pagos:", error.message);
//         res.status(500).json({ error: error.message || "Error interno del servidor al procesar la pasarela financiera." });
//     } finally {
//         client.release();
//     }
// };

// module.exports = { procesarPagoSimulado };
///###
// const pool = require('../config/db');

// // POST /api/pagos/procesar
// const procesarPagoSimulado = async (req, res) => {
//     const { pedidoId, metodoPago, detallesTarjeta } = req.body;

//     if (!pedidoId || !metodoPago) {
//         return res.status(400).json({ error: "Debe suministrar el pedidoId y el metodoPago ('Pix' o 'Cartão de Crédito')." });
//     }

//     const client = await pool.connect();
//     try {
//         await client.query('BEGIN');

//         // 1. Verificar que el pedido exista y esté pendiente de pago
//         const pedidoQuery = "SELECT * FROM pedidos WHERE id = \$1";
//         const pedidoRes = await client.query(pedidoQuery, [pedidoId]);

//         if (pedidoRes.rows.length === 0) {
//             await client.query('ROLLBACK');
//             return res.status(404).json({ error: "Pedido no encontrado en el sistema." });
//         }

//         const pedido = pedidoRes.rows[0];

//         if (pedido.estado_pago === 'Pago Aprovado') {
//             await client.query('ROLLBACK');
//             return res.status(400).json({ error: "Este pedido já foi pago e aprovado anteriormente." });
//         }

//         // 2. Flujo si el usuario paga con PIX
//         if (metodoPago === 'Pix') {
//             // Simular actualización del pedido a Aprobado
//             await client.query("UPDATE pedidos SET estado_pago = 'Pago Aprovado' WHERE id = \$1", [pedidoId]);

//             // Inyectar el siguiente paso logístico en la línea de tiempo de Voke
//             const queryEnvio = `
//                 INSERT INTO seguimiento_envios (pedido_id, estado_logistico, detalles)
//                 VALUES ($1, 'Separando estoque', 'Pagamento via PIX confirmado instantaneamente. O pedido foi encaminhado para separação de estoque no centro de distribuição.');
//             `;
//             await client.query(queryEnvio, [pedidoId]);

//             // Inyectar el evento en la tabla de métricas para el Dashboard analítico
//             await client.query("INSERT INTO metricas_tienda (tipo_evento, monto_venta) VALUES ('venda_concluida', \$1)", [pedido.total]);

//             await client.query('COMMIT');

//             return res.json({
//                 mensaje: "¡Pago por PIX procesado con éxito!",
//                 status: "Pago Aprovado",
//                 pix_copia_e_cola: "00020101021226870014br.gov.bcb.pix2565voke-ficticio-qr-code-key-alberto-guatume",
//                 qrcode_simulado_url: "https://qrserver.com"
//             });
//         }

//         // 3. Flujo si el usuario paga con Tarjeta de Crédito (Cartão de Crédito)
//         if (metodoPago === 'Cartão de Crédito') {
//             if (!detallesTarjeta || !detallesTarjeta.numeroTarjeta) {
//                 await client.query('ROLLBACK');
//                 return res.status(400).json({ error: "Debe suministrar los datos de la tarjeta de crédito para procesar." });
//             }

//             // Simulación financiera: Rechaza si el número termina en '0000', aprueba el resto
//             if (detallesTarjeta.numeroTarjeta.endsWith('0000')) {
//                 await client.query("UPDATE pedidos SET estado_pago = 'Recusado' WHERE id = \$1", [pedidoId]);
                
//                 await client.query(`
//                     INSERT INTO seguimiento_envios (pedido_id, estado_logistico, detalles)
//                     VALUES ($1, 'Aguardando Pagamento', 'A transação do cartão foi recusada pela operadora. Por favor, tente com outro método.');
//                 `);

//                 await client.query('COMMIT');
//                 return res.status(402).json({ error: "Transação recusada. Saldo insuficiente ou dados incorretos." });
//             }

//             // Si es aprobada con éxito
//             await client.query("UPDATE pedidos SET estado_pago = 'Pago Aprovado' WHERE id = \$1", [pedidoId]);

//             const queryEnvioCartao = `
//                 INSERT INTO seguimiento_envios (pedido_id, estado_logistico, detalles)
//                 VALUES ($1, 'Separando estoque', 'Pagamento via Cartão de Crédito aprovado. O pedido já está em preparação logística.');
//             `;
//             await client.query(queryEnvioCartao, [pedidoId]);

//             await client.query("INSERT INTO metricas_tienda (tipo_evento, monto_venta) VALUES ('venda_concluida', \$1)", [pedido.total]);

//             await client.query('COMMIT');
//             return res.json({
//                 mensaje: "¡Transacción de tarjeta aprobada con éxito!",
//                 status: "Pago Aprovado",
//                 comprovante_id: `COMP-${Math.floor(100000 + Math.random() * 900000)}`
//             });
//         }

//         // Si mandan un método no soportado
//         await client.query('ROLLBACK');
//         res.status(400).json({ error: "Método de pagamento não suportado no sistema Voke." });

//     } catch (error) {
//         await client.query('ROLLBACK');
//         console.error("Error en pasarela de pago:", error);
//         res.status(500).json({ error: "Error interno del servidor al procesar la pasarela financiera." });
//     } finally {
//         client.release();
//     }
// };

// module.exports = { procesarPagoSimulado };