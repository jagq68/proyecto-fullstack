# Reporte de Avance del Proyecto - Simulación E-commerce Voke Brasil

Este documento detalla las implementaciones lógicas, correcciones estructurales y optimizaciones arquitectónicas realizadas durante la jornada de desarrollo de hoy. Se completó con éxito el ciclo de persistencia de datos (CRUD), la separación rigurosa de responsabilidades (Frontend vs Estilos CSS) y la navegación dinámica integrada de forma relacional con la base de datos PostgreSQL.

## 🛠️ Tecnologías y Arquitectura Utilizadas
- **Frontend:** React.js, React Router DOM (Manejo de estados asíncronos y hooks de ciclo de vida).
- **Backend:** Node.js, Express.js (Arquitectura RESTful, middlewares de parsing y enrutamiento jerárquico).
- **Base de Datos:** PostgreSQL (Transacciones atómicas, restricciones UNIQUE y relacionales).
- **Estilos:** CSS3 Puro mediante variables globales (`:root`), cumpliendo con la restricción estricta de **cero estilos en línea (`style={{...}}`)**.

---

## 🚀 Implementaciones y Logros Técnicos

### 1. Cierre Exitoso del Ciclo CRUD (Autenticación y Perfil de Usuario)
- **CREATE (POST /register):** Se ajustó el mapa de variables en el frontend para enviar campos planos que correspondan exactamente con el `req.body` esperado por el backend (`email`, `contrasena`, `cpf_cnpj`, `nome_completo`).
- **READ (POST /login):** Implementación de la persistencia segura mediante `localStorage`. Al iniciar sesión, el sistema valida las credenciales a través de `bcryptjs` en el backend, genera un token JWT y actualiza el estado global de la aplicación.
- **UPDATE (PUT /usuario y /usuario/password):** Se resolvió un error de flujo crítico desacoplando la interfaz en dos secciones independientes. Ahora, el usuario puede actualizar sus datos básicos inmediatamente tras el registro sin que el sistema le exija de forma errónea una "contraseña anterior". El cambio de clave se aisló en un formulario de seguridad independiente.
- **DELETE (DELETE /usuario/:id):** Se integró el borrado físico de la cuenta. La base de datos ejecuta una transacción segura con `BEGIN`, `COMMIT` y `ROLLBACK` removiendo en cascada (`CASCADE`) primero el perfil del cliente para cumplir con la integridad referencial y luego las credenciales de la tabla principal de usuarios.

### 2. Saneamiento y Desbloqueo del Motor PostgreSQL
- Se diagnosticó y solucionó un error persistente `400 Bad Request` causado por registros "huérfanos" (duplicados de cadenas vacías `""` en restricciones `UNIQUE`) generados en pruebas manuales previas con comandos `DELETE` incompletos.
- Se aplicó un saneamiento profundo a las tablas mediante la instrucción:
  ```sql
  TRUNCATE TABLE clientes_perfil, usuarios RESTART IDENTITY CASCADE;
  ```
  Esto dejó la base de datos en un estado óptimo y virgen, reiniciando los contadores de llaves primarias (`SERIAL`).

### 3. Modularización de la Interfaz: `DrawerMenu.jsx`
- Diseñado y desarrollado un menú lateral interactivo que despliega los Departamentos oficiales exigidos por el estándar corporativo de Voke: *Cuadernos, Computadoras, Smartphones, Tabletas, Monitores, Accesorios, Menú Manzana y Chromebook*.
- Cuenta con lógica dinámica para cambiar su estado visual si hay un usuario logueado, mostrando el nombre real del cliente en el apartado "Mi cuenta" o la leyenda genérica en su defecto.

### 4. Filtrado Inteligente Relacional en la Vitrina (`Catalogo.jsx`)
- Se expandió la **Regla de Búsqueda Universal** del catálogo. Debido a que la base de datos de productos opera de forma numérica y relacional (`categoria_id`), el `useEffect` del frontend fue programado para interceptar los parámetros de la URL (`?categoria=...` y `?marca=...`).
- Implementación de un mapeo por IDs lógicos y una inspección de cadenas sobre la columna `nombre` del producto para identificar la marca, permitiendo que el catálogo se actualice instantáneamente sin necesidad de alterar la estructura física de las tablas en PostgreSQL.

### 5. Rediseño del Componente `Footer.jsx`
- Se actualizó el pie de página institucional completo agregando el módulo de suscripción al boletín de noticias mediante formularios reactivos controlados, la información legal de la compañía (CNPJ y marcas registradas de Agasus/Voke) y las secciones de navegación de ayuda.

---

## 🎨 Adherencia Estricta a los Estándares de Código
A petición del cuerpo docente, el proyecto ha sido depurado en su totalidad:
1. **Cero Estilos Inline:** Se removieron todos los atributos `style={{...}}` del código JSX.
2. **Centralización en `index.css`:** Se crearon clases personalizadas semánticas y legibles (ej. `.voke-tarjeta-cuota-destacada`, `.voke-perfil-container`) vinculadas de forma exclusiva a las variables nativas del diseño corporativo.
3. **Optimización de Eventos:** Se corrigieron los atributos `type="submit"` involuntarios en botones secundarios, cambiándolos por `type="button"` para evitar congelamientos de hilos en el navegador y recargas forzadas de la página.