const express = require('express');
const router = express.Router();
const { procesarCheckout, consultarRastreo } = require('../controllers/pedidoController');
const { autenticarToken } = require('../middlewares/authMiddleware');

// Ruta privada: Transforma el carrito en orden de compra
router.post('/checkout', autenticarToken, procesarCheckout);

// Ruta pública: Rastrea el paquete usando el código VK-XXXXXXXX
router.get('/rastreio/:codigo', consultarRastreo);

module.exports = router;