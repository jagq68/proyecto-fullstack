require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// IMPORTAR TODAS LAS RUTAS
const authRoutes = require('./routes/authRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const productoRoutes = require('./routes/productoRoutes');
const carritoRoutes = require('./routes/carritoRoutes'); // <-- Importación agregada
const pedidoRoutes = require('./routes/pedidoRoutes');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// ENGANCHAR LAS RUTAS A LA API
app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/produtos', productoRoutes);
app.use('/api/carrinhos', carritoRoutes); // <-- Ruta registrada con éxito
app.use('/api/pedidos', pedidoRoutes);

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
        const result = await pool.query('SELECT NOW()');
        res.json({ 
            mensaje: "¡API de tu e-commerce funcionando!", 
            db_conexion: true,
            hora_servidor: result.rows.now 
        });
    } catch (error) {
        res.json({ 
            mensaje: "¡Express funciona bien!, pero PostgreSQL aún no está configurado.", 
            db_conexion: false,
            error_detalle: error.message 
        });
    }
});

const PORT = process.env.PORT || 3001;

// MIDDLEWARE GLOBAL DE MANEJO DE ERRORES (Mantiene limpio tu código de caídas inesperadas)
app.use((err, req, res, next) => {
    console.error("🔴 Error Detectado en la Arquitectura:", err.stack);
    
    // Si es un error de violación de llave única de PostgreSQL (ej. email duplicado)
    if (err.code === '23505') {
        return res.status(400).json({ error: "Restricción de base de datos: El registro ya existe." });
    }

    res.status(500).json({ 
        error: "Ocurrió un error interno en el servidor",
        detalles: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend escuchando en: http://localhost:${PORT}`);
});