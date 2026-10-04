const jwt = require('jsonwebtoken');

const autenticarToken = (req, res, next) => {
    // Extraer la cabecera 'Authorization' de la petición HTTP
    const authHeader = req.headers['authorization'];
    
    // El token suele venir en formato: "Bearer TOKEN_AQUÍ". Con split lo separamos.
    const token = authHeader && authHeader.split(' ')[1];

    // Si el cliente no envió ningún token, bloqueamos el acceso de inmediato
    if (!token) {
        return res.status(401).json({ error: "Acceso denegada. Token no suministrado." });
    }

    try {
        // Validar el token usando la frase secreta de tu archivo .env
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        
        // Adjuntar los datos extraídos del token (id y perfil) a la petición 'req' 
        // para que los controladores siguientes sepan qué usuario está navegando
        req.usuario = verificado;
        
        // Dar paso a la siguiente función o ruta
        next();
    } catch (error) {
        console.error("Error al validar el token JWT:", error.message);
        res.status(403).json({ error: "Token inválido o expirado." });
    }
};

module.exports = { autenticarToken };