const { Pool } = require('pg');

// const pool = new Pool({
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     database: process.env.DB_NAME
// });
const pool = require('../config/db'); // Importación limpia y unificada


// GET /api/categorias (Listar todas)
const obtenerCategorias = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        res.status(500).json({ error: "Error interno del servidor al obtener categorías." });
    }
};

// GET /api/categorias/:id (Buscar por ID)
const obtenerCategoriaPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM categorias WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Categoría no encontrada." });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al obtener categoría:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

// POST /api/categorias (Crear una nueva - Solo admin)
const crearCategoria = async (req, res) => {
    const { nombre } = req.body;
    if (!nombre) {
        return res.status(400).json({ error: "El nombre de la categoría es obligatorio." });
    }
    try {
        const query = 'INSERT INTO categorias (nombre) VALUES ($1) RETURNING *';
        const result = await pool.query(query, [nombre]);
        res.status(201).json({ mensaje: "Categoría creada con éxito", categoria: result.rows[0] });
    } catch (error) {
        console.error("Error al crear categoría:", error);
        if (error.code === '23505') {
            return res.status(400).json({ error: "Ya existe una categoría con ese nombre." });
        }
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

// PUT /api/categorias/:id (Actualizar por ID - Solo admin)
const actualizarCategoria = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre) {
        return res.status(400).json({ error: "El nuevo nombre es obligatorio." });
    }
    try {
        const query = 'UPDATE categorias SET nombre = $1 WHERE id = $2 RETURNING *';
        const result = await pool.query(query, [nombre, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Categoría no encontrada." });
        }
        res.json({ mensaje: "Categoría actualizada con éxito", categoria: result.rows[0] });
    } catch (error) {
        console.error("Error al actualizar categoría:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

// DELETE /api/categorias/:id (Eliminar por ID - Solo admin)
const eliminarCategoria = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM categorias WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Categoría no encontrada." });
        }
        res.json({ mensaje: "Categoría eliminada con éxito." });
    } catch (error) {
        console.error("Error al eliminar categoría:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

module.exports = {
    obtenerCategorias,
    obtenerCategoriaPorId,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
};