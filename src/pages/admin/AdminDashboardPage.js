import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

// Komponen untuk kartu statistik
const StatCard = ({ title, value, color }) => (
  <div className={`p-6 bg-white rounded-lg shadow-md`}>
    <h3 className="text-lg font-medium text-gray-500">{title}</h3>
    <p className={`mt-2 text-4xl font-bold ${color}`}>{value}</p>
  </div>
);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [pendingShops, setPendingShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil data secara paralel
        const [statsRes, pendingRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/barbershops?status=pending'),
        ]);
        setStats(statsRes.data);
        setPendingShops(pendingRes.data);
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      {/* Bagian Statistik */}
      <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Pengguna" value={stats?.totalUsers} color="text-blue-600" />
        <StatCard title="Total Barbershop" value={stats?.totalBarbershops} color="text-green-600" />
        <StatCard title="Menunggu Persetujuan" value={stats?.pendingBarbershops} color="text-yellow-600" />
        <StatCard title="Barbershop Aktif" value={stats?.approvedBarbershops} color="text-indigo-600" />
      </div>

      {/* Bagian Daftar Barbershop Pending */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800">Verifikasi Barbershop</h2>
        <div className="p-4 mt-4 bg-white rounded-lg shadow-md">
          {pendingShops.length > 0 ? (
            <ul className="space-y-4">
              {pendingShops.map((shop) => (
                <li key={shop.barbershop_id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-semibold">{shop.name}</p>
                    <p className="text-sm text-gray-500">{shop.city}</p>
                  </div>
                  <Link to="/admin/verify-barbershops" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    Lihat Detail
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Tidak ada barbershop yang menunggu persetujuan saat ini.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;