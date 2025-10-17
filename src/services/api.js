import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            if (decodedToken.exp * 1000 < Date.now()) {
                // Token expired. Lakukan logout paksa.
                localStorage.removeItem('token');
                delete api.defaults.headers.common['Authorization'];

                // Redirect ke halaman login. 
                // Menggunakan window.location.href adalah cara paling pasti di luar komponen React.
                if (window.location.pathname !== '/login') {
                    alert('Sesi Anda telah berakhir. Silakan login kembali.');
                    window.location.href = '/login';
                }

                // Batalkan request yang sedang berjalan
                return Promise.reject(new Error('Sesi telah berakhir.'));
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const loginUser = (email, password) => {
    return api.post('/auth/login', { email, password });
}

export const registerUser = (userData) => {
    return api.post('/auth/register', userData);
}

export default api;