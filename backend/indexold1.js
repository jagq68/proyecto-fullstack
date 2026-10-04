require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// 1. IMPORTAR LAS RUTAS DE AUTENTICACIÓN
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// 2. VINCULAR LAS RUTAS DE AUTENTICACIÓN A LA APLICACIÓN
app.use('/api/auth', authRoutes);

// Configuración de PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'ecommerce'
});

// RUTA DE PRUEBA SEGURA
app.get('/api/prueba', async (req, res) => {
    try {
        // Intentamos consultar la base de datos
        const result = await pool.query('SELECT NOW()');
        res.json({ 
            mensaje: "¡API de tu e-commerce funcionando!", 
            db_conexion: true,
            hora_servidor: result.rows[0].now 
        });
    } catch (error) {
        // ¡TRUCO! Si la base de datos no existe, atrapamos el error aquí 
        // para que tu servidor Express NO SE CAIGA y te responda esto:
        res.json({ 
            mensaje: "¡Express funciona bien!, pero PostgreSQL aún no está configurado.", 
            db_conexion: false,
            error_detalle: error.message 
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend escuchando en: http://localhost:${PORT}`);
});