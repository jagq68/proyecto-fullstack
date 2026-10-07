const pool = require('../config/db');

// 1. OBTENER MÉTRICAS GENERALES DEL DASHBOARD (GET)
const obtenerMetricasGenerales = async (req, res) => {
    try {
        // A. Suma total de ventas (Finanzas)
        const ventasQuery = "SELECT COALESCE(SUM(total), 0.00) AS total_ventas FROM pedidos WHERE estado_pago = 'Pago Aprovado';";
        const ventasRes = await pool.query(ventasQuery);

        // B. CORRECCIÓN RADICAL: Cambiamos FILTER por una consulta de conteo clásica y directa
        const enviosQuery = `
            SELECT 
                SUM(CASE WHEN status_envio = 'Pendiente' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN status_envio = 'Despachado' THEN 1 ELSE 0 END) as despachados,
                SUM(CASE WHEN status_envio = 'En camino' THEN 1 ELSE 0 END) as en_camino,
                SUM(CASE WHEN status_envio = 'Entregado' THEN 1 ELSE 0 END) as entregados,
                SUM(CASE WHEN status_envio = 'Devuelto' THEN 1 ELSE 0 END) as devueltos,
                SUM(CASE WHEN status_envio = 'No entregado' THEN 1 ELSE 0 END) as no_entregados
            FROM pedidos;
        `;
        const enviosRes = await pool.query(enviosQuery);
        
        // Extraemos la fila de conteo y forzamos la conversión manual a números puros
        const rawLogistica = enviosRes.rows[0] || {};
        const logisticaLimpia = {
            pendientes: Number(rawLogistica.pendientes || 0),
            despachados: Number(rawLogistica.despachados || 0),
            en_camino: Number(rawLogistica.en_camino || 0),
            entregados: Number(rawLogistica.entregados || 0),
            devueltos: Number(rawLogistica.devueltos || 0),
            no_entregados: Number(rawLogistica.no_entregados || 0)
        };

        // C. Ventas agrupadas por Producto
        const ventasPorProductoQuery = `
            SELECT p.nombre, SUM(pe.cantidad) AS unidades_vendidas, SUM(pe.cantidad * pe.precio_historico) AS ingresos_totales
            FROM pedido_elementos pe
            JOIN productos p ON pe.producto_id = p.id
            JOIN pedidos ped ON pe.pedido_id = ped.id
            WHERE ped.estado_pago = 'Pago Aprovado'
            GROUP BY p.nombre;
        `;
        const productosRes = await pool.query(ventasPorProductoQuery);

        // D. Ventas agrupadas por Usuario
        const ventasPorUsuarioQuery = `
            SELECT cp.nome_completo, u.email, COUNT(p.id) AS total_pedidos, SUM(p.total) AS total_gastado
            FROM pedidos p
            JOIN usuarios u ON p.usuario_id = u.id
            JOIN clientes_perfil cp ON cp.usuario_id = u.id
            WHERE p.estado_pago = 'Pago Aprovado'
            GROUP BY cp.nome_completo, u.email;
        `;
        const usuariosRes = await pool.query(ventasPorUsuarioQuery);

        // E. Medición de Inventario
        const stockQuery = "SELECT nombre, stock, precio FROM productos ORDER BY stock ASC;";
        const stockRes = await pool.query(stockQuery);

        // ENVIAMOS EL JSON TOTALMENTE PROCESADO Y SANEADO
        res.json({
            totalVentas: parseFloat(ventasRes.rows[0]?.total_ventas || 0),
            logistica: logisticaLimpia, // <-- Enviamos el objeto con números puros garantizados
            ventasProductos: productosRes.rows,
            ventasUsuarios: usuariosRes.rows,
            inventarioStock: stockRes.rows
        });

    } catch (error) {
        console.error("Error al recopilar métricas del Dashboard:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

//
// const obtenerMetricasGenerales = async (req, res) => {
//     try {
//         // A. Suma total de ventas (Finanzas)
//         const ventasQuery = "SELECT COALESCE(SUM(total), 0.00) AS total_ventas FROM pedidos WHERE estado_pago = 'Pago Aprovado';";
//         const ventasRes = await pool.query(ventasQuery);

//         // B. Conteo exacto de estados logísticos de envío (Logística)
//         const enviosQuery = `
//             SELECT 
//                 COUNT(*) FILTER (WHERE status_envio = 'Pendiente') AS pendientes,
//                 COUNT(*) FILTER (WHERE status_envio = 'Despachado') AS despachados,
//                 COUNT(*) FILTER (WHERE status_envio = 'En camino') AS en_camino,
//                 COUNT(*) FILTER (WHERE status_envio = 'Entregado') AS entregados,
//                 COUNT(*) FILTER (WHERE status_envio = 'Devuelto') AS devueltos,
//                 COUNT(*) FILTER (WHERE status_envio = 'No entregado') AS no_entregados
//             FROM pedidos;
//         `;
//         const enviosRes = await pool.query(enviosQuery);

//         // C. Ventas agrupadas por Producto (Ranking de los más vendidos)
//         const ventasPorProductoQuery = `
//             SELECT p.nombre, SUM(pe.cantidad) AS unidades_vendidas, SUM(pe.cantidad * pe.precio_historico) AS ingresos_totales
//             FROM pedido_elementos pe
//             JOIN productos p ON pe.producto_id = p.id
//             JOIN pedidos ped ON pe.pedido_id = ped.id
//             WHERE ped.estado_pago = 'Pago Aprovado'
//             GROUP BY p.nombre
//             ORDER BY ingresos_totales DESC;
//         `;
//         const productosRes = await pool.query(ventasPorProductoQuery);

//         // D. Ventas agrupadas por Usuario/Cliente
//         const ventasPorUsuarioQuery = `
//             SELECT cp.nome_completo, u.email, COUNT(p.id) AS total_pedidos, SUM(p.total) AS total_gastado
//             FROM pedidos p
//             JOIN usuarios u ON p.usuario_id = u.id
//             JOIN clientes_perfil cp ON cp.usuario_id = u.id
//             WHERE p.estado_pago = 'Pago Aprovado'
//             GROUP BY cp.nome_completo, u.email
//             ORDER BY total_gastado DESC;
//         `;
//         const usuariosRes = await pool.query(ventasPorUsuarioQuery);

//         // E. Medición de Inventario y Alertas de Desabastecimiento (Stock)
//         const stockQuery = "SELECT nombre, stock, precio FROM productos ORDER BY stock ASC;";
//         const stockRes = await pool.query(stockQuery);

//         // 🔍 CAPTURA SEGURA DE LA FILA DE LOGÍSTICA
//         const filaLogistica = enviosRes.rows[0] || {};

//         // COUPLING BLINDADO: Forzamos la conversión a números enteros (parseInt) para React
//         const logisticaFormateada = {
//             pendientes: parseInt(filaLogistica.pendientes || 0),
//             despachados: parseInt(filaLogistica.despachados || 0),
//             en_camino: parseInt(filaLogistica.en_camino || 0),
//             entregados: parseInt(filaLogistica.entregados || 0),
//             devueltos: parseInt(filaLogistica.devueltos || 0),
//             no_entregados: parseInt(filaLogistica.no_entregados || 0)
//         };

//         // Responder unificando todo el Dashboard analítico solicitado
//         res.json({
//             totalVentas: parseFloat(ventasRes.rows[0]?.total_ventas || 0),
//             logistica: logisticaFormateada, // <-- Inyectamos el objeto parseado y blindado
//             ventasProductos: productosRes.rows,
//             ventasUsuarios: usuariosRes.rows,
//             inventarioStock: stockRes.rows

//             // totalVentas: parseFloat(ventasRes.rows[0].total_ventas),
//             // logistica: enviosRes.rows[0],
//             // ventasProductos: productosRes.rows,
//             // ventasUsuarios: usuariosRes.rows,
//             // inventarioStock: stockRes.rows
//         });

//     } catch (error) {
//         console.error("Error al recopilar métricas del Dashboard:", error);
//         res.status(500).json({ error: "Error interno del servidor al procesar analíticas de backoffice." });
//     }
// };

// 2. LISTAR CATEGORÍAS EN PANEL ADMINISTRATIVO (GET)
const listarCategoriasAdmin = async (req, res) => {
    try {
        const query = `
            SELECT c.id, c.nombre, COUNT(p.id) AS total_productos_vinculados, COALESCE(SUM(p.stock), 0) AS stock_total
            FROM categorias c
            LEFT JOIN productos p ON p.categoria_id = c.id
            GROUP BY c.id, c.nombre
            ORDER BY c.id ASC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al listar categorías:", error);
        res.status(500).json({ error: "Error interno al recuperar categorías administrativas." });
    }
};

// 3. AGREGAR NUEVA CATEGORÍA (POST)
const crearCategoriaAdmin = async (req, res) => {
    const { nombre } = req.body;
    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: "El nombre de la categoría es obligatorio." });
    }
    try {
        const query = "INSERT INTO categorias (nombre) VALUES (\$1) RETURNING *;";
        const result = await pool.query(query, [nombre.trim()]);
        res.status(201).json({ mensaje: "Categoría agregada con éxito.", categoria: result.rows[0] });
    } catch (error) {
        console.error("Error al crear categoría:", error);
        if (error.code === '23505') {
            return res.status(400).json({ error: "Esta categoría ya se encuentra registrada en la tienda." });
        }
        res.status(500).json({ error: "Error al insertar la nueva categoría en el catálogo." });
    }
};

// 4. ELIMINAR CATEGORÍA SIEMPRE Y CUANDO EL STOCK SEA CERO (DELETE)
const eliminarCategoriaAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        // REGLA DE NEGOCIO ESTRICTA: Validar si existen artículos con existencias activas en esta categoría
        const verificarStockQuery = "SELECT nombre, stock FROM productos WHERE categoria_id = \$1 AND stock > 0;";
        const stockCheck = await pool.query(verificarStockQuery, [id]);

        if (stockCheck.rows.length > 0) {
            return res.status(400).json({ 
                error: `No se puede eliminar la categoría. Existen productos activos con stock mayor a cero (Ej: "${stockCheck.rows[0].nombre}", Stock: ${stockCheck.rows[0].stock}).` 
            });
        }

        // Si la validación de inventario en cero pasa con éxito, procedemos a remover de la base de datos
        const eliminarQuery = "DELETE FROM categorias WHERE id = \$1 RETURNING *;";
        const result = await pool.query(eliminarQuery, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "La categoría especificada no existe." });
        }

        res.json({ mensaje: "Categoría eliminada del catálogo exitosamente." });

    } catch (error) {
        console.error("Error al eliminar categoría de forma administrativa:", error);
        res.status(500).json({ error: "Error interno del servidor al procesar la baja de la categoría." });
    }
};

module.exports = {
    obtenerMetricasGenerales,
    listarCategoriasAdmin,
    crearCategoriaAdmin,
    eliminarCategoriaAdmin
};

// const pool = require('../config/db');

// // GET /api/dashboard/metricas (Solo accesible por Administradores)
// const obtenerMetricasTienda = async (req, res) => {
//     try {
//         // 1. Calcular Ingresos Totales de ventas aprobadas
//         const ingresosQuery = "SELECT SUM(total) AS total_ingresos FROM pedidos WHERE estado_pago = 'Pago Aprovado'";
//         const ingresosRes = await pool.query(ingresosQuery);
//         const totalIngresos = parseFloat(ingresosRes.rows[0].total_ingresos) || 0.00;

//         // 2. Calcular número total de pedidos exitosos
//         const pedidosQuery = "SELECT COUNT(*) AS total_ventas FROM pedidos WHERE estado_pago = 'Pago Aprovado'";
//         const pedidosRes = await pool.query(pedidosQuery);
//         const totalVentas = parseInt(pedidosRes.rows[0].total_ventas) || 0;

//         // 3. Calcular el Ticket Medio (Promedio de gasto por cliente)
//         const ticketMedio = totalVentas > 0 ? (totalIngresos / totalVentas).toFixed(2) : 0.00;

//         // 4. Identificar Alertas de Stock Bajo (Menos de 5 unidades disponibles)
//         const stockBajoQuery = "SELECT id, nombre, precio, stock FROM productos WHERE stock < 5 ORDER BY stock ASC";
//         const stockBajoRes = await pool.query(stockBajoQuery);

//         // 5. Encontrar los Productos Más Vendidos
//         const topProductosQuery = `
//             SELECT p.id, p.nombre, SUM(pe.cantidad) AS unidades_vendidas
//             FROM pedido_elementos pe
//             JOIN productos p ON pe.producto_id = p.id
//             JOIN pedidos ped ON pe.pedido_id = ped.id
//             WHERE ped.estado_pago = 'Pago Aprovado'
//             GROUP BY p.id
//             ORDER BY unidades_vendidas DESC
//             LIMIT 5;
//         `;
//         const topProductosRes = await pool.query(topProductosQuery);

//         res.json({
//             resumenFinanciero: {
//                 faturamentoTotal: `R$ ${totalIngresos.toFixed(2)}`,
//                 cantidadVentas: totalVentas,
//                 ticketMedio: `R$ ${ticketMedio}`
//             },
//             alertasInventario: stockBajoRes.rows,
//             productosMasVendidos: topProductosRes.rows
//         });

//     } catch (error) {
//         console.error("Error al obtener métricas del dashboard:", error);
//         res.status(500).json({ error: "Error interno del servidor al procesar analíticas de la tienda." });
//     }
// };

// module.exports = { obtenerMetricasTienda };