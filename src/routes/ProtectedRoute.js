import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { token } = useAuth();
    if (!token) {
        // Jika tidak ada token, tendang ke halaman login
        return <Navigate to="/login" />;
    }
    return children;
};

export default ProtectedRoute;