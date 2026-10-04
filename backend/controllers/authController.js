const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// const pool = new Pool({
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     database: process.env.DB_NAME
// });

const pool = require('../config/db'); // Importación limpia y unificada

// 1. REGISTRO DE USUARIO (Encripta la clave e impacta ambas tablas)
const registrarUsuario = async (req, res) => {
    const { 
        email, contrasena, cpf_cnpj, nome_completo, 
        fecha_nacimiento, sexo, telefono, cep, direccion, ciudad, perfil 
    } = req.body;

    // Validación básica de campos obligatorios
    if (!email || !contrasena || !cpf_cnpj || !nome_completo) {
        return res.status(400).json({ error: "Faltan campos obligatorios (email, contraseña, CPF/CNPJ o nombre)" });
    }

    // Iniciamos una transacción en Postgres para asegurar que se guarden ambas tablas o ninguna
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Encriptar la contraseña (salto de 10 rondas por seguridad)
        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

        // Insertar en la tabla 'usuarios'
        const queryUsuario = `
            INSERT INTO usuarios (email, contrasena, perfil) 
            VALUES ($1, $2, $3) 
            RETURNING id, email, perfil;
        `;
        const tipoPerfil = perfil || 'cliente'; // Por defecto es cliente
        const resUsuario = await client.query(queryUsuario, [email, contrasenaEncriptada, tipoPerfil]);
        const usuarioId = resUsuario.rows[0].id;

        // Insertar en la tabla 'clientes_perfil' usando el usuarioId recién generado
        const queryPerfil = `
            INSERT INTO clientes_perfil (usuario_id, cpf_cnpj, nome_completo, fecha_nacimiento, sexo, telefono, cep, direccion, ciudad)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `;
        await client.query(queryPerfil, [
            usuarioId, cpf_cnpj, nome_completo, fecha_nacimiento || null, 
            sexo || 'O', telefono || null, cep || null, direccion || null, ciudad || null
        ]);

        // Confirmamos la transacción
        await client.query('COMMIT');

        res.status(201).json({
            mensaje: "¡Usuario registrado con éxito!",
            usuario: resUsuario.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK'); // Si algo falla, cancelamos todo el proceso
        console.error("Error en registro:", error);
        if (error.code === '23505') { // Código de error de Postgres para llaves duplicadas (email o CPF único)
            return res.status(400).json({ error: "El correo electrónico o CPF/CNPJ ya se encuentra registrado." });
        }
        res.status(500).json({ error: "Error interno del servidor al registrar." });
    } finally {
        client.release();
    }
};

// 2. LOGIN DE USUARIO (Verifica credenciales y genera JWT)
const loginUsuario = async (req, res) => {
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
        return res.status(400).json({ error: "Por favor suministre email y contraseña" });
    }

    try {
        // Buscar si el usuario existe
        const query = 'SELECT * FROM usuarios WHERE email = \$1';
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Credenciales inválidas (Correo no encontrado)" });
        }

        const usuario = result.rows[0];

        // Comparar la contraseña ingresada con la contraseña encriptada en la BD
        const contraseñaCorrecta = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!contraseñaCorrecta) {
            return res.status(401).json({ error: "Credenciales inválidas (Contraseña incorrecta)" });
        }

        // Generar el token JWT incluyendo el id y el perfil del usuario
        const token = jwt.sign(
            { id: usuario.id, perfil: usuario.perfil },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // El token expira en 24 horas
        );

        res.json({
            mensaje: "¡Autenticación exitosa!",
            token,
            usuario: { id: usuario.id, email: usuario.email, perfil: usuario.perfil }
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "Error interno del servidor al iniciar sesión." });
    }
};

module.exports = { registrarUsuario, loginUsuario };