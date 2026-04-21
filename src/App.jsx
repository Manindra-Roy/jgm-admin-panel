// /**
//  * @fileoverview Main Admin Application Router & Entry Point.
//  * Handles secure session verification, protected routing, and the global layout wrapper.
//  */

// import { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
// import { Toaster } from "react-hot-toast";
// import api from './services/api';
// import Loader from './components/Loader';

// // --- PAGES & COMPONENTS ---
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Sidebar from "./components/Sidebar";
// import Categories from "./pages/Categories";
// import Products from "./pages/Products";
// import Orders from "./pages/Orders";
// import Users from "./pages/Users";

// /**
//  * Admin Layout Wrapper Component.
//  * Verifies the HTTP-only cookie session with the backend before rendering the dashboard.
//  * If the session is invalid, it redirects the user to the login screen.
//  * @returns {JSX.Element|null} The secure layout or a loading screen.
//  */
// const AdminLayout = () => {
//     const [isVerified, setIsVerified] = useState(false);
//     const [authLoading, setAuthLoading] = useState(true);
//     const navigate = useNavigate();
//     const location = useLocation();

//     /**
//      * Effect: Pings the backend to verify the integrity of the JWT session cookie.
//      */
//     useEffect(() => {
//         const verifySecureSession = async () => {
//             try {
//                 await api.get('/users/verify-session');
//                 setIsVerified(true);
//             } catch (error) {
//                 localStorage.removeItem('is_authenticated');
//                 navigate("/login", { replace: true });
//             } finally {
//                 setAuthLoading(false);
//             }
//         };

//         verifySecureSession();
//     }, [navigate, location.pathname]);

//     // Display global loader while verifying the session
//     if (authLoading) {
//         return (
//             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a' }}>
//                 <Loader message="Verifying Secure Session..." />
//             </div>
//         );
//     }

//     if (!isVerified) return null;

//     return (
//         <div style={{ display: 'flex', minHeight: '100vh' }}>
//             <Sidebar />
//             <div style={{ flex: 1, overflowY: 'auto' }}>
//                 <Outlet /> 
//             </div>
//         </div>
//     );
// };

// /**
//  * Public Route Wrapper Component.
//  * Prevents logged-in admins from accidentally accessing the login page.
//  * @param {Object} props - Contains the child components to render if unauthenticated.
//  */
// const PublicRoute = ({ children }) => {
//     const isAuthenticated = localStorage.getItem('is_authenticated') === 'true';
//     if (isAuthenticated) {
//         return <Navigate to="/" replace />;
//     }
//     return children;
// };

// /**
//  * Main Application Component
//  * @returns {JSX.Element} The configured application router.
//  */
// function App() {
//   return (
//     <Router>
//       {/* Global toast notification configuration optimized for dark mode */}
//       <Toaster position="top-right" toastOptions={{ style: { background: "#1e293b", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } }} />
//       <Routes>
//         <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        
//         {/* Protected Admin Routes Wrapper */}
//         <Route element={<AdminLayout />}>
//           <Route path="/" element={<Dashboard />} />
//           <Route path="/products" element={<Products />} />
//           <Route path="/categories" element={<Categories />} />
//           <Route path="/orders" element={<Orders />} />
//           <Route path="/users" element={<Users />} />
//         </Route>
        
//         {/* Fallback to Dashboard on unknown routes */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


/**
 * @fileoverview Main Admin Application Router & Entry Point.
 * Handles secure session verification, protected routing, and the global responsive layout.
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import api from './services/api';
import Loader from './components/Loader';
import { FaBars } from 'react-icons/fa'; // <-- Added for mobile menu

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
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    
    // --- MOBILE SIDEBAR STATE ---
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const verifySecureSession = async () => {
            try {
                const res = await api.get('/users/verify-session');
                setIsVerified(true);
                // Sync role from backend on every page navigation
                const superAdmin = res.data.isSuperAdmin || false;
                setIsSuperAdmin(superAdmin);
                localStorage.setItem('is_super_admin', superAdmin ? 'true' : 'false');
            } catch (error) {
                localStorage.removeItem('is_authenticated');
                localStorage.removeItem('is_super_admin');
                navigate("/login", { replace: true });
            } finally {
                setAuthLoading(false);
            }
        };
        verifySecureSession();
    }, [navigate, location.pathname]);

    // Automatically close sidebar when navigating to a new page on mobile
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    if (authLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a' }}>
                <Loader message="Verifying Secure Session..." />
            </div>
        );
    }

    if (!isVerified) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
            {/* Sidebar receives the mobile state controls and role */}
            <Sidebar isOpen={isMobileOpen} setIsOpen={setIsMobileOpen} isSuperAdmin={isSuperAdmin} />
            
            <div style={{ flex: 1, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', width: '100%' }}>
                
                {/* --- MOBILE HEADER (Hidden on Desktop) --- */}
                <div className="mobile-header" style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', backgroundColor: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 10 }}>
                    <button onClick={() => setIsMobileOpen(true)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', padding: 0, display: 'flex' }}>
                        <FaBars />
                    </button>
                    <h2 style={{ margin: '0 0 0 15px', color: '#fff', fontSize: '1.2rem', letterSpacing: '1px' }}>
                        <span style={{ color: '#3498db' }}>JGM</span> ADMIN
                    </h2>
                </div>

                {/* The target wrapper our CSS media query will target to shrink paddings */}
                <div className="page-content-wrapper" style={{ flex: 1 }}>
                    <Outlet context={{ isSuperAdmin }} />
                </div>
            </div>
        </div>
    );
};

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