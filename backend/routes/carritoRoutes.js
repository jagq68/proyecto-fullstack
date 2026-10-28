const express = require('express');
const router = express.Router();
const { obtenerCarrito, agregarAlCarrito, eliminarDelCarrito } = require('../controllers/carritoController');
const { autenticarToken } = require('../middlewares/authMiddleware');

// Todas las rutas del carrito quedan blindadas bajo el token del usuario
router.get('/', autenticarToken, obtenerCarrito);
router.post('/', autenticarToken, agregarAlCarrito);
router.delete('/:productoId', autenticarToken, eliminarDelCarrito);

module.exports = router;