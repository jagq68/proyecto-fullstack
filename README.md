# 🚀 Voke Brasil - Plataforma de Simulación Logística y E-Commerce

Este es el proyecto integrador fullstack desarrollado para la plataforma comercial de **Voke Brasil**. Cuenta con una arquitectura desacoplada orientada a servicios, base de datos relacional y un motor de simulación de despacho en tiempo real con línea de tiempo interactiva.

## 🛠️ Arquitectura del Sistema

- **Frontend:** React, React Router, Axios (Instancia dinámica con detección de entornos de red).
- **Backend:** Node.js, Express, Middleware de CORS estructurado con credenciales de sesión activa.
- **Base de Datos:** PostgreSQL (Tablas relacionales estructuradas: `usuarios` y `clientes_perfil`).

## ⚙️ Características Implementadas

- **Navegación Fluida (UX):** Barra de controles inteligente que mantiene el icono `👤` siempre visible con menú flotante contextual para las operaciones del CRUD (Modificar Conta, Envio, Sair).
- **Registro Eficiente:** Flujo secuencial automatizado que loguea de forma inmediata al cliente nuevo tras el registro, eliminando redundancias de credenciales.
- **Operaciones CRUD Completas:** 
  - `POST` /auth/register y /auth/login
  - `GET` /auth/usuario/:id (Mapeo relacional de la tabla `clientes_perfil`)
  - `PUT` /auth/usuario/:id (Modificación de datos básicos)
  - `PUT` /auth/usuario/password/:id (Actualización de clave con cifrado)
  - `DELETE` /auth/usuario/:id (Remoción permanente de la cuenta)

## 🚀 Instrucciones de Despliegue Local

1. Clonar el repositorio y levantar el servidor backend (`cd backend && node index.js`).
2. Configurar las variables del entorno `.env` apuntando al puerto `3001` de PostgreSQL local.
3. Levantar la interfaz frontend de Vite (`cd frontend && npm run dev`) en el puerto `5173`.