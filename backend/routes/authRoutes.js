const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario } = require('../controllers/authController');

// Ruta para registrar un nuevo usuario y su perfil
router.post('/register', registrarUsuario);

// Ruta para iniciar sesión y obtener el token JWT
router.post('/login', loginUsuario);

module.exports = router;