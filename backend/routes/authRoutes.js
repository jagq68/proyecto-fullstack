const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario, modificarDatosBasicos, modificarContrasena,eliminarUsuario } = require('../controllers/authController');

//const { registrarUsuario, loginUsuario } = require('../controllers/authController');

// Ruta para registrar un nuevo usuario y su perfil
router.post('/register', registrarUsuario);

// Ruta para iniciar sesión y obtener el token JWT
router.post('/login', loginUsuario);

//CORRECCIÓN: Rutas CRUD que te hacían falta para modificar (PUT)
router.put('/usuario/:id', modificarDatosBasicos);
router.put('/usuario/password/:id', modificarContrasena);

// CORRECCIÓN: Endpoint faltante del CRUD para eliminar cuenta (DELETE)
router.delete('/usuario/:id', eliminarUsuario);


module.exports = router;