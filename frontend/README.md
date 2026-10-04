# 🚀 Simulación Voke.com Brasil - Arquitectura E-Commerce Full-Stack

Este proyecto representa una réplica funcional de **Voke.com**, una de las plataformas líderes de e-commerce de tecnología corporativa en Brasil. Desarrollado de manera modular y escalable para el portafolio de **Turma58Toti-Diversidade**.

---

## 🛠️ Tecnologías y Herramientas del Núcleo
*   **Frontend:** React (Vite), Tailwind CSS (Estilos Corporativos), Axios (Manejo de Red) y React Router Dom (Navegación Dinámica).
*   **Backend:** Node.js, Express (Framework de Servidor), Bcryptjs (Cifrado Criptográfico) y JSON Web Tokens (Seguridad de Sesión JWT).
*   **Base de Datos Relacional:** PostgreSQL, pgAdmin 4 (Administración de Entorno local de 11 tablas).

---

## 📂 Arquitectura Especializada del Backend

La API posee 11 endpoints relacionales distribuidos en módulos estratégicos:
1.  **Seguridad y Registro:** Transacciones relacionales atómicas (`BEGIN/COMMIT`) que enlazan las credenciales en la tabla `usuarios` y los perfiles extendidos brasileños en `clientes_perfil`.
2.  **Catálogo Relacional:** Extracción masiva de productos cruzados mediante un `LEFT JOIN` relacional para empaquetar múltiples imágenes en arrays JSON nativos (`json_agg`).
3.  **Control de Inventario y Checkout:** Al procesar la orden, verifica las existencias en frío de la tabla `productos`. Si hay stock, genera un código de rastreo único (ej: `VK-12345678`), congela los precios históricos de facturación y resta las unidades del inventario en vivo en un solo bloque seguro.
4.  **Flujo Fintech y Logística:** Simulador financiero que procesa códigos "Copia e Cola" de Pix y tarjetas de crédito, actualizando de forma automática los estados logísticos en la base de datos.
5.  **Motor Automatizado en Segundo Plano:** Script con un temporizador continuo que escanea las transacciones aprobadas y avanza automáticamente los despachos de `"Separando estoque"` a `"Em rota de entrega"` y `"Entregue"`.
6.  **Analíticas Administrativas (Dashboard):** Consultas matemáticas avanzadas (`SUM`, `COUNT`) que calculan la facturación global, ticket medio de compra y generan alertas de reabastecimiento crítico si el stock baja de 5 unidades.
7.  **Chatbot de Atención al Cliente:** Asistente inteligente integrado con expresiones regulares (regex) que extrae los códigos de rastreo textuales ingresados por el usuario e interroga a PostgreSQL para responder la fase logística exacta del paquete.

---

## 🚀 Instrucciones para Levantar el Entorno de Desarrollo

### 1. Clonar el repositorio y configurar variables (.env)
```bash
git clone <URL_DE_TU_REPOSITORIO>
```
Cree un archivo `.env` dentro de la carpeta `/backend` con los parámetros correspondientes de su servidor local de PostgreSQL y su frase secreta de JWT (`JWT_SECRET`).

### 2. Inicializar y Automatizar la Base de Datos
Ingrese a la terminal del backend e instale los paquetes de Node:
```bash
cd backend
npm install
node init-db.js   # Crea las 11 tablas limpiando residuos previos
node seed.js      # Inyecta las categorías y los 16 productos iniciales
npm run dev       # Levanta el servidor Express continuo en el puerto 3001
```

### 3. Inicializar la Interfaz Gráfica
Abra otra terminal en paralelo, ingrese al frontend e inicie el servidor de Vite:
```bash
cd frontend
npm install
npm run dev       # Enciende la tienda en http://localhost:5173
``