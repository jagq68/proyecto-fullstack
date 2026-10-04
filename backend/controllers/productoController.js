const { Pool } = require('pg');

// const pool = new Pool({
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     database: process.env.DB_NAME
// });
const pool = require('../config/db'); // Importación limpia y unificada


// GET /api/produtos (Listar todos con sus imágenes)
const obtenerProductos = async (req, res) => {
    try {
        // Hacemos una consulta estructurando las imágenes de la tabla secundaria en un array JSON
        const query = `
            SELECT p.*, COALESCE(json_agg(pi.url) FILTER (WHERE pi.url IS NOT NULL), '[]') AS imagenes
            FROM productos p
            LEFT JOIN producto_imagenes pi ON p.id = pi.producto_id
            GROUP BY p.id
            ORDER BY p.id ASC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error interno del servidor al obtener productos." });
    }
};

// GET /api/produtos/:id (Buscar un producto por ID con sus imágenes)
const obtenerProductoPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT p.*, COALESCE(json_agg(pi.url) FILTER (WHERE pi.url IS NOT NULL), '[]') AS imagenes
            FROM productos p
            LEFT JOIN producto_imagenes pi ON p.id = pi.producto_id
            WHERE p.id = $1
            GROUP BY p.id;
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado." });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al obtener el producto:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

// POST /api/produtos (Crear producto e insertar sus imágenes - Solo admin)
const crearProducto = async (req, res) => {
    const { nombre, precio, categoriaId, imagenes } = req.body;
    if (!nombre || !precio) {
        return res.status(400).json({ error: "Nombre y precio son campos obligatorios." });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insertar el producto base
        const queryProducto = `
            INSERT INTO productos (nombre, precio, categoria_id) 
            VALUES ($1, $2, $3) RETURNING *;
        `;
        const resProd = await client.query(queryProducto, [nombre, precio, categoriaId || null]);
        const nuevoProducto = resProd.rows[0];

        // 2. Insertar las imágenes en la tabla secundaria si vienen en la petición
        if (imagenes && Array.isArray(imagenes)) {
            for (const url of imagenes) {
                await client.query('INSERT INTO producto_imagenes (producto_id, url) VALUES (\$1, \$2)', [nuevoProducto.id, url]);
            }
        }

        await client.query('COMMIT');
        
        // Devolvemos el producto con sus imágenes para la respuesta
        nuevoProducto.imagenes = imagenes || [];
        res.status(201).json({ mensaje: "Producto creado con éxito", producto: nuevoProducto });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al crear producto:", error);
        res.status(500).json({ error: "Error interno del servidor al crear producto." });
    } finally {
        client.release();
    }
};

// PUT /api/produtos/:id (Actualizar producto e imágenes - Solo admin)
const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, categoriaId, imagenes } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Actualizar datos base del producto
        const queryProducto = `
            UPDATE productos 
            SET nombre = $1, precio = $2, categoria_id = $3 
            WHERE id = $4 RETURNING *;
        `;
        const resProd = await client.query(queryProducto, [nombre, precio, categoriaId, id]);
        
        if (resProd.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Producto no encontrado." });
        }

        // 2. Si se envían nuevas imágenes, borramos las anteriores e insertamos las nuevas
        if (imagenes && Array.isArray(imagenes)) {
            await client.query('DELETE FROM producto_imagenes WHERE producto_id = \$1', [id]);
            for (const url of imagenes) {
                await client.query('INSERT INTO producto_imagenes (producto_id, url) VALUES (\$1, \$2)', [id, url]);
            }
        }

        await client.query('COMMIT');
        const productoActualizado = resProd.rows[0];
        productoActualizado.imagenes = imagenes || [];
        
        res.json({ mensaje: "Producto actualizado con éxito", producto: productoActualizado });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    } finally {
        client.release();
    }
};

// DELETE /api/produtos/:id (Eliminar producto y sus imágenes en cascada - Solo admin)
const eliminarProducto = async (req, res) => {
    const { id } = req.params;
    try {
        // Nota: Gracias al "ON DELETE CASCADE" que definimos en SQL, 
        // borrar el producto eliminará sus registros en producto_imagenes automáticamente.
        const result = await pool.query('DELETE FROM productos WHERE id = \$1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado." });
        }
        res.json({ mensaje: "Producto eliminado con éxito de la base de datos." });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};