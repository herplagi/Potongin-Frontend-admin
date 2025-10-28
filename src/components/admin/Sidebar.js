import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { RxDashboard } from "react-icons/rx";
import { FiCheckSquare, FiLogOut, FiUserPlus, FiStar } from "react-icons/fi";

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClasses =
    "flex items-center px-4 py-2 mt-2 text-gray-100 transition-colors duration-200 transform rounded-md hover:bg-gray-700";
  const activeLinkClasses = "bg-gray-700";

  return (
    <div className="flex flex-col w-64 h-screen px-4 py-8 bg-gray-800">
      <h2 className="text-3xl font-semibold text-white">Admin Panel</h2>
      <div className="flex flex-col justify-between flex-1 mt-6">
        <nav>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses
            }
          >
            <RxDashboard className="w-5 h-5" />
            <span className="mx-4 font-medium">Dashboard</span>
          </NavLink>
          <NavLink
            to="/admin/verify-barbershops"
            className={({ isActive }) =>
              isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses
            }
          >
            <FiCheckSquare className="w-5 h-5" />
            <span className="mx-4 font-medium">Verifikasi</span>
          </NavLink>
          <NavLink
            to="/admin/manage-admins"
            className={({ isActive }) =>
              isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses
            }
          >
            <FiUserPlus className="w-5 h-5" />
            <span className="mx-4 font-medium">Kelola Admin</span>
          </NavLink>
          <NavLink
            to="/admin/manage-reviews"
            className={({ isActive }) =>
              isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses
            }
          >
            <FiStar className="w-5 h-5" />
            <span className="mx-4 font-medium">Kelola Review</span>
          </NavLink>

          {/* Tambahkan link lain di sini nanti */}
        </nav>
        <div>
          <button onClick={handleLogout} className={linkClasses}>
            <FiLogOut className="w-5 h-5" />
            <span className="mx-4 font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
