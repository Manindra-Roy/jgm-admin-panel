// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import api from './services/api';
import Loader from './components/Loader';

// Pages & Components
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Users from "./pages/Users";

const AdminLayout = () => {
    const [isVerified, setIsVerified] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const verifySecureSession = async () => {
            try {
                // Ping the backend to ensure our HttpOnly cookie is still alive
                await api.get('/users/verify-session');
                setIsVerified(true);
            } catch (error) {
                localStorage.removeItem('is_authenticated');
                navigate("/login", { replace: true });
            } finally {
                setAuthLoading(false);
            }
        };

        verifySecureSession();
    }, [navigate, location.pathname]);

    // Use our new sleek loader while verifying the cookie
    if (authLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a' }}>
                <Loader message="Verifying Secure Session..." />
            </div>
        );
    }

    if (!isVerified) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <Outlet /> 
            </div>
        </div>
    );
};

// Protect the Login route (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('is_authenticated') === 'true';
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ style: { background: "#1e293b", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } }} />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        
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