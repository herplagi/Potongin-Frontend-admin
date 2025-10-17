// src/pages/admin/ManageAdminsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

const ManageAdminsPage = () => {
    const [admins, setAdmins] = useState([]);
    const [formData, setFormData] = useState({
        name: '', email: '', phoneNumber: '', password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // --- FUNGSI UNTUK MENGAMBIL DATA ADMIN ---
    const fetchAdmins = useCallback(async () => {
        try {
            const response = await api.get('/admin/admins');
            setAdmins(response.data);
        } catch (err) {
            console.error("Gagal mengambil data admin:", err);
            setError("Gagal memuat daftar admin.");
        }
    }, []);

    // --- useEffect UNTUK MENJALANKAN fetchAdmins SAAT HALAMAN DIBUKA ---
    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const response = await api.post('/admin/create-admin', formData);
            setSuccess(response.data.message);
            setFormData({ name: '', email: '', phoneNumber: '', password: '' });
            fetchAdmins(); // <-- PANGGIL KEMBALI UNTUK REFRESH TABEL
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal membuat admin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Kelola Admin</h1>

            {/* --- BAGIAN TABEL DAFTAR ADMIN --- */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-700">Daftar Admin Terdaftar</h2>
                <div className="mt-4 overflow-hidden bg-white rounded-lg shadow-md">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nama</th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nomor Telepon</th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Tanggal Dibuat</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {admins.map((admin) => (
                                <tr key={admin.user_id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{admin.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{admin.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{admin.phone_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(admin.created_at).toLocaleDateString('id-ID')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- BAGIAN FORM TAMBAH ADMIN --- */}
            <div className="mt-10">
                <h2 className="text-xl font-semibold text-gray-700">Tambah Admin Baru</h2>
                <div className="p-6 mt-4 bg-white rounded-lg shadow-md">
                    {/* Kode form Anda yang sudah ada bisa ditaruh di sini */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                       {/* ... (seluruh isi form dari kode sebelumnya, tidak perlu diubah) ... */}
                       {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}
                       {success && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">{success}</div>}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Alamat Email</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                            <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={loading} className="px-4 py-2 font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
                                {loading ? 'Menyimpan...' : 'Daftarkan Admin'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManageAdminsPage;