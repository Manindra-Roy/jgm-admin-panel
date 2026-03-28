// src/components/Sidebar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaBox,
  FaList,
  FaShoppingCart,
  FaUsers,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("jgm_admin_token");
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: <FaHome /> },
    { name: "Products", path: "/products", icon: <FaBox /> },
    { name: "Categories", path: "/categories", icon: <FaList /> },
    { name: "Orders", path: "/orders", icon: <FaShoppingCart /> },
    { name: "Users", path: "/users", icon: <FaUsers /> },
  ];

  return (
    <div className="glass-panel" style={{ width: '260px', margin: '20px', padding: '30px 20px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '40px', color: '#fff', letterSpacing: '2px', textShadow: '0 2px 10px rgba(255,255,255,0.2)' }}>
                JGM ADMIN
            </h2>
            
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {navItems.map((item) => (
                    <Link 
                        key={item.name} 
                        to={item.path} 
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', 
                            borderRadius: '12px', color: '#e2e8f0',
                            backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                            boxShadow: location.pathname === item.path ? 'inset 0 0 10px rgba(255,255,255,0.05)' : 'none',
                            textDecoration: 'none', fontWeight: '500', transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => { if(location.pathname !== item.path) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
                        onMouseOut={(e) => { if(location.pathname !== item.path) e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                        <span style={{ fontSize: '1.2rem', color: location.pathname === item.path ? '#3498db' : '#94a3b8' }}>
                            {item.icon}
                        </span>
                        {item.name}
                    </Link>
                ))}
            </nav>

            <button 
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: 'rgba(231, 76, 60, 0.2)', color: '#ff7675', border: '1px solid rgba(231, 76, 60, 0.3)', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', justifyContent: 'center', transition: 'all 0.3s' }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(231, 76, 60, 0.4)' }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(231, 76, 60, 0.2)' }}
            >
                <FaSignOutAlt /> Logout
            </button>
        </div>
  );
}
