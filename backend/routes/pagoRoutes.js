const express = require('express');
const router = express.Router();
const { procesarPagoSimulado } = require('../controllers/pagoController');
const { autenticarToken } = require('../middlewares/authMiddleware');

router.post('/procesar', autenticarToken, procesarPagoSimulado);

module.exports = router;