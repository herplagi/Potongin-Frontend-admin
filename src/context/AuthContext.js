import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true); // <-- TAMBAHKAN STATE LOADING

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("token");

    if (tokenFromStorage) {
      const decodedToken = jwtDecode(tokenFromStorage);

      // Cek apakah token sudah expired.
      // decodedToken.exp adalah dalam detik, Date.now() dalam milidetik.
      if (decodedToken.exp * 1000 < Date.now()) {
        // Jika token expired, hapus dari localStorage dan jangan set state.
        localStorage.removeItem("token");
      } else {
        // Jika token masih valid, set state dan siapkan header axios.
        setToken(tokenFromStorage);
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${tokenFromStorage}`;
        setUser(decodedToken);
      }
    }
    // Apapun hasilnya, proses loading selesai.
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token } = response.data;
    const decodedUser = jwtDecode(token);
    if (decodedUser.role !== "admin") {
      throw new Error("Akun ini tidak memiliki hak akses admin.");
    }
    localStorage.setItem("token", token);
    setToken(token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(decodedUser);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  };

  // Sertakan 'loading' di dalam value yang disediakan oleh context
  const value = { user, token, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
