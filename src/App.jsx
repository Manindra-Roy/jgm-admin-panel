// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Users from './pages/Users';

// Layout component that includes the Sidebar and the main content area
const AdminLayout = () => {
    // Basic protection: if no token is found, kick them to login
    const token = localStorage.getItem('jgm_admin_token');
    if (!token) return <Navigate to="/login" replace />;

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <Outlet /> {/* This is where the nested routes will render */}
            </div>
        </div>
    );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes wrapped in AdminLayout */}
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