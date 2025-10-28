import "./index.css";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layouts
import AdminLayout from "./components/admin/AdminLayout";

import LoginPage from "./pages/LoginPage";
// import DashboardPage from './pages/DashboardPage';
import RegisterPage from "./pages/RegisterPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import VerifyBarbershopsPage from "./pages/admin/VerifyBarbershopsPage";
// import AddAdminPage from './pages/admin/AddAdminPage';
import ManageAdminsPage from "./pages/admin/ManageAdminsPage";
import BarbershopDetailPage from './pages/admin/BarbershopDetailPage';
import ManageReviewsPage from './pages/admin/ManageReviewsPage';

import ProtectedRoute from "./routes/ProtectedRoute";

const HomeRedirect = () => {
  const { user } = useAuth();
  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" />;
  }
  if (user?.role === "owner") {
    return <Navigate to="/owner/dashboard" />;
  }
  return <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { loading } = useAuth();

  // Jika context masih dalam proses loading, tampilkan pesan loading
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <p className="text-xl">Loading Aplikasi...</p>
      </div>
    );
  }

  // Jika sudah tidak loading, baru render routernya
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/verify-barbershops" element={<VerifyBarbershopsPage />} />
          <Route path="/admin/verify-barbershops/:barbershopId" element={<BarbershopDetailPage />} />
          <Route path="/admin/manage-admins" element={<ManageAdminsPage />} />
          <Route path="/admin/manage-reviews" element={<ManageReviewsPage />} />

          
        </Route>

        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
