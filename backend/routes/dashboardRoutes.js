const express = require('express');
const router = express.Router();
const { 
    obtenerMetricasGenerales, 
    listarCategoriasAdmin,
    crearCategoriaAdmin,
    eliminarCategoriaAdmin 
} = require('../controllers/dashboardController');
const { autenticarToken } = require('../middlewares/authMiddleware');

// Todas las rutas del Dashboard se protegen con token para que no sean visibles al usuario común
router.get('/analitica', autenticarToken, obtenerMetricasGenerales);
router.get('/categorias', autenticarToken, listarCategoriasAdmin);
router.post('/categorias', autenticarToken, crearCategoriaAdmin);
router.delete('/categorias/:id', autenticarToken, eliminarCategoriaAdmin);

module.exports = router;

//
// const express = require('express');
// const router = express.Router();
// const { obtenerMetricasTienda } = require('../controllers/dashboardController');
// const { autenticarToken } = require('../middlewares/authMiddleware');

// // Endpoint privado de métricas
// router.get('/metricas', autenticarToken, obtenerMetricasTienda);

// module.exports = router;