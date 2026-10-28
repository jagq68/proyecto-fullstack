const pool = require('../config/db'); 

// 1. GET /api/carrinhos (Obtener el carrito del usuario autenticado)
const obtenerCarrito = async (req, res) => {
    const usuarioId = req.usuario.id;

    try {
        let carritoRes = await pool.query('SELECT id FROM carritos WHERE usuario_id = \$1', [usuarioId]);
        
        if (carritoRes.rows.length === 0) {
            carritoRes = await pool.query('INSERT INTO carritos (usuario_id) VALUES (\$1) RETURNING id', [usuarioId]);
        }
        
        const carritoId = carritoRes.rows.at(0).id;

        const queryElementos = `
            SELECT ce.producto_id, p.nombre, p.precio, ce.cantidad,
                   (p.precio * ce.cantidad) AS subtotal,
                   COALESCE((SELECT url FROM producto_imagenes WHERE producto_id = p.id LIMIT 1), '') AS imagen_url
            FROM carrito_elementos ce
            JOIN productos p ON ce.producto_id = p.id
            WHERE ce.carrito_id = $1
            ORDER BY ce.id ASC;
        `;
        
        const elementos = await pool.query(queryElementos, [carritoId]);
        const totalGeneral = elementos.rows.reduce((acc, item) => acc + parseFloat(item.subtotal), 0);

        res.json({
            carritoId,
            usuarioId,
            items: elementos.rows,
            total: totalGeneral
        });

    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).json({ error: "Error interno del servidor al procesar el carrito." });
    }
};

// 2. POST /api/carrinhos (Agregar producto o actualizar su cantidad de forma segura en Postgres)
const agregarAlCarrito = async (req, res) => {
    const usuarioId = req.usuario.id;
    const { productoId, cantidad } = req.body; // Recibe 1 para sumar o -1 para restar

    if (!productoId || cantidad === undefined || cantidad === 0) {
        return res.status(400).json({ error: "Debe suministrar un productoId válido y una cantidad diferente de cero." });
    }

    try {
        // Asegurar la cabecera del carrito
        let carritoRes = await pool.query('SELECT id FROM carritos WHERE usuario_id = \$1', [usuarioId]);
        if (carritoRes.rows.length === 0) {
            carritoRes = await pool.query('INSERT INTO carritos (usuario_id) VALUES (\$1) RETURNING id', [usuarioId]);
        }
        const carritoId = carritoRes.rows.at(0).id;

        // SOLUÇÃO TRANSACCIONAL INDEPENDIENTE: Verificamos si el artículo ya existe en la base de datos
        const verificarExistencia = await pool.query(
            'SELECT cantidad FROM carrito_elementos WHERE carrito_id = \$1 AND producto_id = \$2',
            [carritoId, productoId]
        );

        if (verificarExistencia.rows.length > 0) {
            const cantidadActual = verificarExistencia.rows.at(0).cantidad;
            const nuevaCantidad = cantidadActual + cantidad;

            // REGLA SOLICITADA: Si el cálculo da 0 o menos, borramos la fila físicamente y liberamos stock
            if (nuevaCantidad <= 0) {
                await pool.query(
                    'DELETE FROM carrito_elementos WHERE carrito_id = \$1 AND producto_id = \$2',
                    [carritoId, productoId]
                );
                return res.status(200).json({
                    mensaje: "El producto llegó a cero y fue removido del carrito exitosamente.",
                    elemento: null
                });
            } else {
                // Si es mayor a cero, ejecutamos un UPDATE puro sobre la columna evitando el ON CONFLICT rígido
                const resultadoUpdate = await pool.query(
                    'UPDATE carrito_elementos SET cantidad = \$1 WHERE carrito_id = \$2 AND producto_id = \$3 RETURNING *',
                    [nuevaCantidad, carritoId, productoId]
                );
                return res.status(200).json({
                    mensaje: "Cantidad actualizada con éxito.",
                    elemento: resultadoUpdate.rows.at(0)
                });
            }
        } else {
            // Si el producto no existe en el carrito, solo lo insertamos si la cantidad inicial es positiva
            if (cantidad <= 0) {
                return res.status(400).json({ error: "No se puede registrar un producto nuevo con cantidad menor o igual a cero." });
            }
            
            const resultadoInsert = await pool.query(
                'INSERT INTO carrito_elementos (carrito_id, producto_id, cantidad) VALUES (\$1, \$2, \$3) RETURNING *',
                [carritoId, productoId, cantidad]
            );
            return res.status(200).json({
                mensaje: "Producto añadido al carrito con éxito.",
                elemento: resultadoInsert.rows.at(0)
            });
        }

    } catch (error) {
        console.error("Error al añadir al carrito:", error);
        res.status(500).json({ error: "Error interno del servidor al añadir el producto." });
    }
};

// 3. DELETE /api/carrinhos/:productoId (Remover un producto por completo del carrito)
const eliminarDelCarrito = async (req, res) => {
    const usuarioId = req.usuario.id;
    const { productoId } = req.params;

    try {
        const carritoRes = await pool.query('SELECT id FROM carritos WHERE usuario_id = \$1', [usuarioId]);
        if (carritoRes.rows.length === 0) {
            return res.status(404).json({ error: "Carrito no encontrado para este usuario." });
        }
        const carritoId = carritoRes.rows.at(0).id;

        const resultado = await pool.query(
            'DELETE FROM carrito_elementos WHERE carrito_id = \$1 AND producto_id = \$2 RETURNING *',
            [carritoId, productoId]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: "El producto no se encontraba en el carrito." });
        }

        res.json({ mensaje: "Producto removido del carrito exitosamente." });

    } catch (error) {
        console.error("Error al eliminar del carrito:", error);
        res.status(500).json({ error: "Error interno del servidor al remover el producto." });
    }
};

module.exports = { obtenerCarrito, agregarAlCarrito, eliminarDelCarrito };