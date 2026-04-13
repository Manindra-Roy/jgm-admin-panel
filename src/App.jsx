/**
 * @fileoverview Main Admin Application Router & Entry Point.
 * Handles secure session verification, protected routing, and the global layout wrapper.
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import api from './services/api';
import Loader from './components/Loader';

// --- PAGES & COMPONENTS ---
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Users from "./pages/Users";

/**
 * Admin Layout Wrapper Component.
 * Verifies the HTTP-only cookie session with the backend before rendering the dashboard.
 * If the session is invalid, it redirects the user to the login screen.
 * @returns {JSX.Element|null} The secure layout or a loading screen.
 */
const AdminLayout = () => {
    const [isVerified, setIsVerified] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Effect: Pings the backend to verify the integrity of the JWT session cookie.
     */
    useEffect(() => {
        const verifySecureSession = async () => {
            try {
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

    // Display global loader while verifying the session
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

/**
 * Public Route Wrapper Component.
 * Prevents logged-in admins from accidentally accessing the login page.
 * @param {Object} props - Contains the child components to render if unauthenticated.
 */
const PublicRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('is_authenticated') === 'true';
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    return children;
};

/**
 * Main Application Component
 * @returns {JSX.Element} The configured application router.
 */
function App() {
  return (
    <Router>
      {/* Global toast notification configuration optimized for dark mode */}
      <Toaster position="top-right" toastOptions={{ style: { background: "#1e293b", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } }} />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        
        {/* Protected Admin Routes Wrapper */}
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/users" element={<Users />} />
        </Route>
        
        {/* Fallback to Dashboard on unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;