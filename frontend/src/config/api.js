import axios from 'axios';

// 🚀 AJUSTE DE HOSTER: Incluye la IP numérica local para evitar descalces en la laptop
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// 🚀 DETECTOR DE ENTORNO AUTOMÁTICO:
//const isLocal = window.location.hostname === 'localhost';

const api = axios.create({
    baseURL: isLocal 
        ? 'http://localhost:3001/api' 
        : 'https://proyecto-fullstack-mj38.onrender.com/api'
});

// Interceptor de Peticiones: Rutas e inyección de seguridad
api.interceptors.request.use((config) => {
    // Si por error una llamada usa la palabra en español, la alinea a portugués en internet
    if (!isLocal && config.url && config.url.includes('/productos')) {
        config.url = config.url.replace('/productos', '/produtos');
    }

    const token = localStorage.getItem('voke_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// ⚡ INTERCEPTOR DE RESPUESTAS CORREGIDO Y BLINDADO CONTRA ENTORNO EN BLANCO
api.interceptors.response.use((response) => {
    if (response.data) {
        // Buscamos de forma flexible dónde vienen los productos en Render
        let productos = Array.isArray(response.data) 
            ? response.data 
            : (response.data.productos || response.data.produtos || null);

        if (Array.isArray(productos)) {
            productos.forEach(prod => {
                // Parsea de forma segura si PostgreSQL en Render guardó las imágenes como texto
                if (typeof prod.imagenes === 'string') {
                    try {
                        prod.imagenes = JSON.parse(prod.imagenes);
                    } catch (e) {
                        console.error("Error parseando imágenes en Render:", e);
                    }
                }
            });
        }
    }
    return response; // 🚀 SE GARANTIZA EL RETORNO DE LA RESPUESTA AL COMPONENTE SIEMPRE
}, (error) => {
    return Promise.reject(error);
});

// ⚡ INTERCEPTOR DE RESPUESTAS (ADAPTADOR DE SERIALIZACIÓN PARA RENDER)
// Asegura que el formato del array de imágenes de la nube sea 100% idéntico al local
// api.interceptors.response.use((response) => {
//     if (response.data && Array.isArray(response.data)) {
//         response.data = response.data.map(prod => {
//             // Si las imágenes vienen en formato de texto JSON string debido a PostgreSQL de Render, las parsea
//             if (typeof prod.imagenes === 'string') {
//                 try {
//                     prod.imagenes = JSON.parse(prod.imagenes);
//                 } catch (e) {
//                     console.error("Error parseando imágenes en Render:", e);
//                 }
//             }
//             return prod;
//         });
//     }
//     return response;
// }, (error) => {
//     return Promise.reject(error);
// });

export default api;


//
// import axios from 'axios';

// // 🚀 DETECTOR DE ENTORNO AUTOMÁTICO:
// // Si estás en tu PC usa tu puerto 3001 local; si estás en internet, apunta a la API viva de Render.
// const isLocal = window.location.hostname === 'localhost';

// const api = axios.create({
//     baseURL: isLocal 
//            ? 'http://localhost:3001/api' 
//         : 'https://onrender.com'

// });

// // Interceptor inteligente: Busca el token en el almacenamiento local y lo inyecta antes de enviar la petición
// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem('voke_token');
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// }, (error) => {
//     return Promise.reject(error);
// });

// export default api;

// import axios from 'axios';

// // Instancia global conectada al puerto de tu backend en la laptop
// const api = axios.create({
//     baseURL: 'http://localhost:3001/api'
// });

// // Interceptor inteligente: Busca el token en el almacenamiento local y lo inyecta antes de enviar la petición
// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem('voke_token');
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// }, (error) => {
//     return Promise.reject(error);
// });

// export default api;