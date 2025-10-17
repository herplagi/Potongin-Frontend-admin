import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout = () => {
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet /> {/* Ini adalah tempat konten halaman akan dirender */}
            </main>
        </div>
    );
};

export default AdminLayout;