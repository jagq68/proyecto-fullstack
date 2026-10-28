require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

const crearTablasSQL = `
    -- Limpieza previa en orden inverso para evitar conflictos de claves foráneas
    DROP TABLE IF EXISTS carrito_elementos CASCADE;
    DROP TABLE IF EXISTS carritos CASCADE;
    DROP TABLE IF EXISTS clientes_perfil CASCADE;
    DROP TABLE IF EXISTS usuarios CASCADE;
    DROP TABLE IF EXISTS producto_imagenes CASCADE;
    DROP TABLE IF EXISTS productos CASCADE;
    DROP TABLE IF EXISTS categorias CASCADE;

    -- Creación de tablas
    CREATE TABLE categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE
    );

    CREATE TABLE productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        precio DECIMAL(10, 2) NOT NULL,
        categoria_id INT REFERENCES categorias(id) ON DELETE SET NULL
    );

    CREATE TABLE producto_imagenes (
        id SERIAL PRIMARY KEY,
        producto_id INT REFERENCES productos(id) ON DELETE CASCADE,
        url TEXT NOT NULL
    );

    CREATE TABLE usuarios (
        id SERIAL PRIMARY KEY,
        email VARCHAR(150) NOT NULL UNIQUE,
        contrasena VARCHAR(255) NOT NULL,
        perfil VARCHAR(30) NOT NULL DEFAULT 'cliente',
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE clientes_perfil (
        id SERIAL PRIMARY KEY,
        usuario_id INT UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
        cpf_cnpj VARCHAR(20) UNIQUE NOT NULL,
        nome_completo VARCHAR(255) NOT NULL,
        fecha_nacimiento DATE,
        sexo CHAR(1) CHECK (sexo IN ('M', 'F', 'O')),
        telefono VARCHAR(20),
        cep VARCHAR(15),
        direccion TEXT,
        ciudad VARCHAR(100)
    );

    CREATE TABLE carritos (
        id SERIAL PRIMARY KEY,
        usuario_id INT UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE carrito_elementos (
        id SERIAL PRIMARY KEY,
        carrito_id INT REFERENCES carritos(id) ON DELETE CASCADE,
        producto_id INT REFERENCES productos(id) ON DELETE CASCADE,
        cantidad INT NOT NULL CHECK (cantidad > 0),
        UNIQUE(carrito_id, producto_id)
    );
`;

async function inicializarBaseDatos() {
    try {
        console.log('⏳ Conectando a PostgreSQL y creando el esquema de tablas...');
        await pool.query(crearTablasSQL);
        console.log('✅ ¡Esquema de base de datos e-commerce creado exitosamente!');
    } catch (error) {
        console.error('❌ Error al inicializar las tablas:', error);
    } finally {
        await pool.end();
    }
}

inicializarBaseDatos();