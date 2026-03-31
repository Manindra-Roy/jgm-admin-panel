// src/pages/Users.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaTrash, FaUserShield, FaUser, FaEdit, FaTimes, FaSearch, FaUserPlus } from 'react-icons/fa';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [updating, setUpdating] = useState(false);

    // Form Fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState(''); // Added for new user creation
    const [isAdmin, setIsAdmin] = useState(false);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load user directory.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (userId, userIsAdmin) => {
        toast((t) => (
            <div>
                <p style={{ marginBottom: '10px' }}>
                    {userIsAdmin ? 'WARNING: Delete this Admin account?' : 'Delete this customer account?'}
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await api.delete(`/users/${userId}`);
                                toast.success('User deleted');
                                fetchUsers(); 
                            } catch (err) {
                                toast.error('Failed to delete user.');
                            }
                        }}
                        style={{ backgroundColor: '#e74c3c', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Delete
                    </button>
                    <button onClick={() => toast.dismiss(t.id)} style={{ backgroundColor: '#475569', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    // Open Modal for EDITING
    const openEditModal = (user) => {
        setEditingUser(user);
        setName(user.name);
        setEmail(user.email);
        setPhone(user.phone);
        setPassword(''); // Keep empty, backend will ignore if not provided
        setIsAdmin(user.isAdmin);
        setIsModalOpen(true);
    };

    // Open Modal for ADDING new user
    const openAddModal = () => {
        setEditingUser(null);
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setIsAdmin(false);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);

        try {
            if (editingUser) {
                // Update Existing User
                const payload = { 
                    name, email, phone, isAdmin,
                    street: editingUser.street, apartment: editingUser.apartment,
                    zip: editingUser.zip, city: editingUser.city, country: editingUser.country
                };
                
                // Only send password if the admin typed a new one
                if (password) payload.password = password;

                await api.put(`/users/${editingUser.id}`, payload);
                toast.success('User profile updated!');
            } else {
                // Create New User
                await api.post('/users', {
                    name, email, phone, password, isAdmin
                });
                toast.success('New account created!');
            }
            
            closeModal();
            fetchUsers();
        } catch (err) {
            toast.error(`Failed to ${editingUser ? 'update' : 'create'} user profile.`);
        } finally {
            setUpdating(false);
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <h2 style={{ padding: '40px', color: 'white' }}>Loading User Directory...</h2>;

    return (
        <div style={{ padding: '40px 40px 40px 20px', position: 'relative' }}>
            <h1 style={{ marginBottom: '40px', color: '#fff', fontWeight: '300', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <FaUser style={{ color: '#3498db' }} /> User Management
            </h1>

            <div className="glass-panel" style={{ padding: '30px', overflowX: 'auto' }}>
                
                {/* SEARCH BAR & ADD BUTTON */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px 15px', border: '1px solid rgba(255,255,255,0.1)', flex: 1, maxWidth: '400px' }}>
                        <FaSearch color="#94a3b8" />
                        <input 
                            type="text" 
                            placeholder="Search by Name or Email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: 'white', paddingLeft: '10px', outline: 'none', width: '100%' }}
                        />
                    </div>
                    
                    <button 
                        onClick={openAddModal}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', backgroundColor: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71', border: '1px solid rgba(46, 204, 113, 0.5)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }}
                    >
                        <FaUserPlus /> Add New User
                    </button>
                </div>

                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: '#e2e8f0' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Name</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Email</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Phone</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Role</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No matching users found.</td></tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '15px 10px', fontWeight: 'bold', color: '#fff' }}>{user.name}</td>
                                    <td style={{ padding: '15px 10px', color: '#3498db' }}>{user.email}</td>
                                    <td style={{ padding: '15px 10px', color: '#cbd5e1' }}>{user.phone}</td>
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
                                        <button onClick={() => openEditModal(user)} style={{ backgroundColor: 'transparent', color: '#3498db', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.2s', marginRight: '10px' }} title="Edit User">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(user.id, user.isAdmin)} style={{ backgroundColor: 'transparent', color: '#e74c3c', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.2s' }} title="Delete User">
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* DYNAMIC ADD/EDIT USER MODAL */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '30px', position: 'relative', backgroundColor: '#16213e' }}>
                        <button onClick={closeModal} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}><FaTimes /></button>
                        
                        <h2 style={{ marginTop: 0, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '25px' }}>
                            {editingUser ? 'Edit User Profile' : 'Create New Account'}
                        </h2>

                        <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>Full Name</label>
                                <input className="glass-input" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>Email Address</label>
                                    <input className="glass-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>Phone Number</label>
                                    <input className="glass-input" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>
                                    Password {editingUser && <span style={{ color: '#e74c3c', fontSize: '0.8rem' }}>(Leave blank to keep current)</span>}
                                </label>
                                <input 
                                    className="glass-input" 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required={!editingUser} // Only strictly required when creating a new user
                                />
                            </div>

                            <div style={{ padding: '15px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0', cursor: 'pointer', fontWeight: 'bold' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={isAdmin} 
                                        onChange={(e) => setIsAdmin(e.target.checked)} 
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }} 
                                    />
                                    <FaUserShield color={isAdmin ? '#e74c3c' : '#95a5a6'} /> Grant Administrator Access
                                </label>
                                <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#94a3b8', paddingLeft: '30px' }}>Warning: Admins have full access to view, edit, and delete store data.</p>
                            </div>

                            <button type="submit" disabled={updating} style={{ padding: '15px', backgroundColor: updating ? 'rgba(149, 165, 166, 0.5)' : 'rgba(52, 152, 219, 0.2)', color: updating ? '#bdc3c7' : '#3498db', border: `1px solid ${updating ? 'transparent' : 'rgba(52, 152, 219, 0.5)'}`, borderRadius: '8px', fontWeight: 'bold', cursor: updating ? 'not-allowed' : 'pointer', transition: 'all 0.3s', fontSize: '1.1rem', marginTop: '10px' }}>
                                {updating ? 'Processing...' : (editingUser ? 'Update User' : '+ Create Account')}
                            </button>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
}
