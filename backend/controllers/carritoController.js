const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

// 1. GET /api/carrinhos (Obtener el carrito del usuario autenticado)
const obtenerCarrito = async (req, res) => {
    // Extraemos el id del usuario directamente desde el token validado por el middleware
    const usuarioId = req.usuario.id;

    try {
        // Buscamos o aseguramos que el usuario tenga una cabecera de carrito creada
        let carritoRes = await pool.query('SELECT id FROM carritos WHERE usuario_id = \$1', [usuarioId]);
        
        if (carritoRes.rows.length === 0) {
            carritoRes = await pool.query('INSERT INTO carritos (usuario_id) VALUES (\$1) RETURNING id', [usuarioId]);
        }
        
        const carritoId = carritoRes.rows[0].id;

        // Traemos todos los elementos del carrito cruzando los datos con la tabla de productos e imágenes
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

        // Calculamos el costo total general acumulado en el carrito
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

// 2. POST /api/carrinhos (Agregar producto o actualizar su cantidad en el carrito)
const agregarAlCarrito = async (req, res) => {
    const usuarioId = req.usuario.id;
    const { productoId, cantidad } = req.body;

    if (!productoId || !cantidad || cantidad <= 0) {
        return res.status(400).json({ error: "Debe suministrar un productoId válido y una cantidad mayor a cero." });
    }

    try {
        // 1. Obtener o crear el carrito del usuario
        let carritoRes = await pool.query('SELECT id FROM carritos WHERE usuario_id = \$1', [usuarioId]);
        if (carritoRes.rows.length === 0) {
            carritoRes = await pool.query('INSERT INTO carritos (usuario_id) VALUES (\$1) RETURNING id', [usuarioId]);
        }
        const carritoId = carritoRes.rows[0].id;

        // 2. Insertar el elemento. Si ya existe la combinación carrito_id + producto_id, se actualiza sumando la cantidad.
        const queryInsertar = `
            INSERT INTO carrito_elementos (carrito_id, producto_id, cantidad)
            VALUES ($1, $2, $3)
            ON CONFLICT (carrito_id, producto_id)
            DO UPDATE SET cantidad = carrito_elementos.cantidad + EXCLUDED.cantidad
            RETURNING *;
        `;

        const resultado = await pool.query(queryInsertar, [carritoId, productoId, cantidad]);

        res.status(200).json({
            mensaje: "¡Producto gestionado en el carrito con éxito!",
            elemento: resultado.rows[0]
        });

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
        // Buscamos el ID del carrito del usuario
        const carritoRes = await pool.query('SELECT id FROM carritos WHERE usuario_id = \$1', [usuarioId]);
        if (carritoRes.rows.length === 0) {
            return res.status(404).json({ error: "Carrito no encontrado para este usuario." });
        }
        const carritoId = carritoRes.rows[0].id;

        // Eliminamos el registro de la tabla intermedia
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