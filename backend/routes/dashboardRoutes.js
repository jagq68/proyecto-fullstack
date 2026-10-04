const express = require('express');
const router = express.Router();
const { obtenerMetricasTienda } = require('../controllers/dashboardController');
const { autenticarToken } = require('../middlewares/authMiddleware');

// Endpoint privado de métricas
router.get('/metricas', autenticarToken, obtenerMetricasTienda);

module.exports = router;