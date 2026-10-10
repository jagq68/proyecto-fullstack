# 📊 Sistema E-commerce Voke Brasil - Fullstack

Este proyecto es una plataforma de comercio electrónico orientada a la simulación logística y comercial de la empresa Voke Brasil, desarrollada en arquitectura fullstack para evaluaciones académicas.

## 🚀 Características del Sistema
- **Frontend:** Construido en **React.js** puro estructurado con componentes modulares e implementando **HashRouter** para garantizar un enrutamiento estático estable libre de errores 404 en internet.
- **Estilos:** Separados estrictamente en archivos independientes `.css` respetando las variables corporativas globales (`--voke-blue: #295991` y `--main-font: Verdana`).
- **Backend:** Servidor RESTful en **Node.js** con Express, configurado con CORS adaptativo para producción en la nube.
- **Base de Datos:** Motor relacional **PostgreSQL** montado en servidores externos (Ohio), consumido mediante hilos SSL seguros (`rejectUnauthorized: false`).
- **Control de Acceso:** Sistema CRUD dinámico para perfiles de `cliente` (carrito de compras y pasarela Pix) y `admin` (módulos estadísticos y Dashboard comercial).

## 🛡️ Credenciales de Prueba para Evaluadores
Para realizar el flujo completo de simulación en vivo, utilice los siguientes accesos:
- **Perfil Administrador (Dashboard):** `admin@voke.com` 
- **Perfil Cliente:** Registrar una cuenta nueva desde el formulario extendido de la interfaz web para verificar la inserción relacional asíncrona.
