import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@mui/material';

const DashboardPage = () => {
    const { user, logout } = useAuth();

    return (
        <div>
            <h1>Selamat Datang, {user?.full_name || user?.email}!</h1>
            <p>Peran Anda: {user?.role}</p>
            <Button variant="contained" onClick={logout}>Logout</Button>
        </div>
    );
};

export default DashboardPage;