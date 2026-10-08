const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'ecommerce'
    // 🚀 CONTROL EXPLICITO DE SSL PARA LA NUBE:
    // Si la base de datos es local ('localhost'), apaga el SSL para poder programar normal.
    // Si se ejecuta en internet (Render), inyecta la encriptación requerida por el servidor.
    ssl: (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') 
        ? { rejectUnauthorized: false } 
        : false
});

// Exportamos únicamente la instancia del pool
module.exports = pool;