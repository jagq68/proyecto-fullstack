const express = require('express');
const router = express.Router();
const { obtenerProductos, obtenerProductoPorId, crearProducto, actualizarProducto, eliminarProducto } = require('../controllers/productoController');
const { autenticarToken } = require('../middlewares/authMiddleware');

router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);

// Rutas protegidas (Requieren token)
router.post('/', autenticarToken, crearProducto);
router.put('/:id', autenticarToken, actualizarProducto);
router.delete('/:id', autenticarToken, eliminarProducto);

module.exports = router;