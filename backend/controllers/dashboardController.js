const pool = require('../config/db');

// GET /api/dashboard/metricas (Solo accesible por Administradores)
const obtenerMetricasTienda = async (req, res) => {
    try {
        // 1. Calcular Ingresos Totales de ventas aprobadas
        const ingresosQuery = "SELECT SUM(total) AS total_ingresos FROM pedidos WHERE estado_pago = 'Pago Aprovado'";
        const ingresosRes = await pool.query(ingresosQuery);
        const totalIngresos = parseFloat(ingresosRes.rows[0].total_ingresos) || 0.00;

        // 2. Calcular número total de pedidos exitosos
        const pedidosQuery = "SELECT COUNT(*) AS total_ventas FROM pedidos WHERE estado_pago = 'Pago Aprovado'";
        const pedidosRes = await pool.query(pedidosQuery);
        const totalVentas = parseInt(pedidosRes.rows[0].total_ventas) || 0;

        // 3. Calcular el Ticket Medio (Promedio de gasto por cliente)
        const ticketMedio = totalVentas > 0 ? (totalIngresos / totalVentas).toFixed(2) : 0.00;

        // 4. Identificar Alertas de Stock Bajo (Menos de 5 unidades disponibles)
        const stockBajoQuery = "SELECT id, nombre, precio, stock FROM productos WHERE stock < 5 ORDER BY stock ASC";
        const stockBajoRes = await pool.query(stockBajoQuery);

        // 5. Encontrar los Productos Más Vendidos
        const topProductosQuery = `
            SELECT p.id, p.nombre, SUM(pe.cantidad) AS unidades_vendidas
            FROM pedido_elementos pe
            JOIN productos p ON pe.producto_id = p.id
            JOIN pedidos ped ON pe.pedido_id = ped.id
            WHERE ped.estado_pago = 'Pago Aprovado'
            GROUP BY p.id
            ORDER BY unidades_vendidas DESC
            LIMIT 5;
        `;
        const topProductosRes = await pool.query(topProductosQuery);

        res.json({
            resumenFinanciero: {
                faturamentoTotal: `R$ ${totalIngresos.toFixed(2)}`,
                cantidadVentas: totalVentas,
                ticketMedio: `R$ ${ticketMedio}`
            },
            alertasInventario: stockBajoRes.rows,
            productosMasVendidos: topProductosRes.rows
        });

    } catch (error) {
        console.error("Error al obtener métricas del dashboard:", error);
        res.status(500).json({ error: "Error interno del servidor al procesar analíticas de la tienda." });
    }
};

module.exports = { obtenerMetricasTienda };