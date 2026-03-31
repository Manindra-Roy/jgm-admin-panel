// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import api from './services/api';
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Users from "./pages/Users";

const AdminLayout = () => {
    const [isVerified, setIsVerified] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const verifySecureSession = async () => {
            try {
                // Ping the backend to ensure our HttpOnly cookie is still alive
                await api.get('/users/verify-session');
                setIsVerified(true);
            } catch (error) {
                // If it fails (401), the interceptor in api.js will auto-redirect, 
                // but we also manually handle it here just in case.
                localStorage.removeItem('is_authenticated');
                navigate("/login");
            }
        };

        verifySecureSession();
    }, [navigate]);

    // Show a loading screen while verifying the cookie
    if (!isVerified) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', color: '#3498db', fontSize: '1.5rem' }}>Verifying Secure Session...</div>;
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <Outlet /> 
            </div>
        </div>
    );
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ style: { background: "#1e293b", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/users" element={<Users />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;