import axios from 'axios';

// 🚀 DETECTOR DE ENTORNO AUTOMÁTICO:
// Si estás en tu PC usa tu puerto 3001 local; si estás en internet, apunta a la API viva de Render.
const isLocal = window.location.hostname === 'localhost';

const api = axios.create({
    baseURL: isLocal 
           ? 'http://localhost:3001/api' 
        : 'https://onrender.com'

});

// Interceptor inteligente: Busca el token en el almacenamiento local y lo inyecta antes de enviar la petición
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('voke_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;

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