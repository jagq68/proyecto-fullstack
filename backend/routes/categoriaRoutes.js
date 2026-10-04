const express = require('express');
const router = express.Router();
const { obtenerCategorias, obtenerCategoriaPorId, crearCategoria, actualizarCategoria, eliminarCategoria } = require('../controllers/categoriaController');
const { autenticarToken } = require('../middlewares/authMiddleware');

router.get('/', obtenerCategorias);
router.get('/:id', obtenerCategoriaPorId);

// Rutas protegidas (Requieren token)
router.post('/', autenticarToken, crearCategoria);
router.put('/:id', autenticarToken, actualizarCategoria);
router.delete('/:id', autenticarToken, eliminarCategoria);

module.exports = router;