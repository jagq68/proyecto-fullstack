const pool = require('./db'); // Reutilizamos tu pool de conexión centralizado

// Función encargada de buscar y avanzar los paquetes en la base de datos
const simularAvanceLogistico = async () => {
    try {
        // 1. Buscamos el último estado de cada pedido en seguimiento_envios que sea 'Separando estoque'
        const queryPedidosActivos = `
            SELECT DISTINCT ON (pedido_id) pedido_id, estado_logistico
            FROM seguimiento_envios
            ORDER BY pedido_id, fecha_actualizacion DESC;
        `;
        const result = await pool.query(queryPedidosActivos);
        
        // Filtramos solo los pedidos que están atrapados en la fase de preparación de almacén
        const pedidosParaActualizar = result.rows.filter(row => row.estado_logistico === 'Separando estoque');

        if (pedidosParaActualizar.length === 0) {
            // Si no hay pedidos en esa fase, el script se queda esperando en silencio
            return;
        }

        console.log(`🤖 [Simulador Voke]: Procesando el avance logístico de ${pedidosParaActualizar.length} pedido(s)...`);

        for (const ped of pedidosParaActualizar) {
            // 2. Inyectamos la nueva fase 'Em rota de entrega' en la línea de tiempo histórica
            const queryNuevoEstado = `
                INSERT INTO seguimiento_envios (pedido_id, estado_logistico, detalles)
                VALUES ($1, 'Em rota de entrega', 'O produto saiu do centro de distribuição da Voke e está em rota de entrega para o endereço cadastrado.');
            `;
            await pool.query(queryNuevoEstado, [ped.pedido_id]);

            console.log(`🚚 [Logística Voke]: ¡Pedido ID ${ped.pedido_id} actualizado con éxito a "Em rota de entrega"!`);
        }

    } catch (error) {
        console.error("🔴 Error en el motor de simulación logística:", error.message);
    }
};

// Función que arranca el reloj del temporizador
const iniciarSimuladorLogistico = () => {
    console.log("🚀 [Sistema Voke]: Motor de simulación logística en segundo plano encendido.");
    
    // Configurado para ejecutarse automáticamente cada 30 segundos (30000 milisegundos)
    // Puedes cambiar el 30000 por el tiempo que desees para tus pruebas (ej. 10000 para 10 segundos)
    setInterval(simularAvanceLogistico, 30000);
};

module.exports = { iniciarSimuladorLogistico };