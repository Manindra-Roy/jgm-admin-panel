// src/pages/Users.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaTrash, FaUserShield, FaUser } from 'react-icons/fa';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load user directory.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (userId, isAdmin) => {
        if (isAdmin && !window.confirm('WARNING: You are about to delete an Admin account. Proceed?')) return;
        if (!isAdmin && !window.confirm('Are you sure you want to delete this customer account?')) return;

        try {
            await api.delete(`/users/${userId}`);
            fetchUsers(); 
        } catch (err) {
            alert('Failed to delete user.');
        }
    };

    if (loading) return <h2 style={{ padding: '40px', color: 'white' }}>Loading User Directory...</h2>;

    return (
        <div style={{ padding: '40px 40px 40px 20px' }}>
            <h1 style={{ marginBottom: '40px', color: '#fff', fontWeight: '300', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <FaUser style={{ color: '#3498db' }} /> User Management
            </h1>
            
            {error && <p style={{ color: 'white', backgroundColor: 'rgba(231, 76, 60, 0.8)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e74c3c' }}>{error}</p>}

            <div className="glass-panel" style={{ padding: '30px', overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: '#e2e8f0' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Name</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Email</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Phone</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Location</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Role</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No users found.</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '15px 10px', fontWeight: 'bold', color: '#fff' }}>{user.name}</td>
                                    <td style={{ padding: '15px 10px', color: '#3498db' }}>{user.email}</td>
                                    <td style={{ padding: '15px 10px', color: '#cbd5e1' }}>{user.phone}</td>
                                    <td style={{ padding: '15px 10px', color: '#94a3b8' }}>
                                        {user.city ? `${user.city}, ${user.country}` : 'Not provided'}
                                    </td>
                                    <td style={{ padding: '15px 10px' }}>
                                        {user.isAdmin ? (
                                            <span style={{ backgroundColor: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c', border: '1px solid rgba(231, 76, 60, 0.5)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                <FaUserShield /> Admin
                                            </span>
                                        ) : (
                                            <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#e2e8f0', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold' }}>
                                                Customer
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => handleDelete(user.id, user.isAdmin)} 
                                            style={{ backgroundColor: 'transparent', color: '#e74c3c', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.2s' }}
                                            title="Delete User"
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'} 
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}