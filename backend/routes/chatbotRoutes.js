const express = require('express');
const router = express.Router();
const { procesarMensajeChatbot } = require('../controllers/chatbotController');

// Ruta pública para interactuar con la IA del chatbot
router.post('/consultar', procesarMensajeChatbot);

module.exports = router;