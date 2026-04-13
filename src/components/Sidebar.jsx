/**
 * @fileoverview Admin Navigation Sidebar Component.
 * Provides routing links to all major admin modules and handles the secure
 * logout process by terminating the backend session.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
    FaChartPie, FaBoxOpen, FaTags, FaClipboardList, 
    FaUsers, FaSignOutAlt 
} from 'react-icons/fa';

/**
 * Sidebar Component
 * @returns {JSX.Element} The rendered navigation sidebar.
 */
export default function Sidebar() {
    const navigate = useNavigate();

    /**
     * Safely terminates the admin session.
     * Hits the backend to clear the HTTP-Only cookie, clears local flags, and redirects to login.
     */
    const handleLogout = async () => {
        try {
            // 1. Tell backend to clear the HttpOnly cookie
            await api.post('/users/logout');
            
            // 2. Clear local UI flags
            localStorage.removeItem('is_authenticated');
            toast.success('Logged out successfully');
            
            // 3. Redirect to login
            navigate('/login', { replace: true });
        } catch (error) {
            toast.error('Error during logout');
            // Force logout anyway on the frontend if backend fails
            localStorage.removeItem('is_authenticated');
            navigate('/login', { replace: true });
        }
    };

    /**
     * Determines the active state styling for React Router NavLinks.
     * @param {Object} state - Destructured from React Router.
     * @param {boolean} state.isActive - True if the current URL matches the link.
     * @returns {Object} A dynamic CSS style object.
     */
    const navLinkStyle = ({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '15px 20px',
        color: isActive ? '#fff' : '#94a3b8',
        textDecoration: 'none',
        backgroundColor: isActive ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
        borderLeft: isActive ? '4px solid #3498db' : '4px solid transparent',
        transition: 'all 0.3s ease',
        fontWeight: isActive ? 'bold' : 'normal',
        fontSize: '1.1rem'
    });

    return (
        <div style={{ 
            width: '280px', 
            backgroundColor: '#0f172a', 
            borderRight: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh'
        }}>
            {/* Header / Brand */}
            <div style={{ 
                padding: '30px 20px', 
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                marginBottom: '20px'
            }}>
                <h2 style={{ 
                    margin: 0, 
                    color: '#fff', 
                    fontSize: '1.8rem',
                    letterSpacing: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span style={{ color: '#3498db' }}>JGM</span> ADMIN
                </h2>
                <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Management Portal v1.0</p>
            </div>

            {/* Navigation Links */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <NavLink to="/" style={navLinkStyle} end>
                    <FaChartPie /> Dashboard
                </NavLink>
                <NavLink to="/orders" style={navLinkStyle}>
                    <FaClipboardList /> Orders
                </NavLink>
                <NavLink to="/products" style={navLinkStyle}>
                    <FaBoxOpen /> Products
                </NavLink>
                <NavLink to="/categories" style={navLinkStyle}>
                    <FaTags /> Categories
                </NavLink>
                <NavLink to="/users" style={navLinkStyle}>
                    <FaUsers /> Users
                </NavLink>
            </nav>

            {/* Logout Action */}
            <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button 
                    onClick={handleLogout}
                    style={{ 
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '12px',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        color: '#e74c3c',
                        border: '1px solid rgba(231, 76, 60, 0.3)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(231, 76, 60, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(231, 76, 60, 0.1)'}
                >
                    <FaSignOutAlt /> Secure Logout
                </button>
            </div>
        </div>
    );
}