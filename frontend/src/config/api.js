import axios from 'axios';

// Instancia global conectada al puerto de tu backend en la laptop
const api = axios.create({
    baseURL: 'http://localhost:3001/api'
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