// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { registerUser } from '../services/api'; // Sesuaikan path jika perlu
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await registerUser(formData);
            setSuccess('Registrasi berhasil! Silakan login.');
            setTimeout(() => navigate('/login'), 2000); // Arahkan ke login setelah 2 detik
        } catch (err) {
            setError(err.response?.data?.message || 'Registrasi gagal. Coba lagi.');
        }
    };

    // Layout ini sengaja dibuat mirip dengan halaman Login
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Buat Akun Baru
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sudah punya akun?{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Login di sini
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}
                    {success && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">{success}</div>}

                    {/* Fields: name, email, phoneNumber, password */}
                    <input name="name" type="text" required className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Nama Lengkap" onChange={handleChange} />
                    <input name="email" type="email" required className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Alamat Email" onChange={handleChange} />
                    <input name="phoneNumber" type="tel" required className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Nomor Telepon" onChange={handleChange} />
                    <input name="password" type="password" required className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Password" onChange={handleChange} />

                    <div>
                        <button type="submit" className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Daftar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;