// src/pages/Categories.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaTrash, FaTags, FaEdit } from 'react-icons/fa';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('');
    const [color, setColor] = useState('#3498db');
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load categories.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Populate form when Edit is clicked
    const handleEditClick = (category) => {
        setEditingId(category.id);
        setName(category.name);
        setIcon(category.icon || '');
        setColor(category.color || '#3498db');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setName('');
        setIcon('');
        setColor('#3498db');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingId) {
                // Update existing category
                await api.put(`/categories/${editingId}`, { name, icon, color });
            } else {
                // Create new category
                await api.post('/categories', { name, icon, color });
            }
            handleCancelEdit(); // Reset form
            fetchCategories(); // Refresh the list
        } catch (err) {
            setError(`Failed to ${editingId ? 'update' : 'create'} category.`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await api.delete(`/categories/${id}`);
                fetchCategories(); 
            } catch (err) {
                alert('Failed to delete category. It might be linked to existing items.');
            }
        }
    };

    if (loading) return <h2 style={{ padding: '40px', color: 'white' }}>Loading Categories...</h2>;

    return (
        <div style={{ padding: '40px 40px 40px 20px' }}>
            <h1 style={{ marginBottom: '40px', color: '#fff', fontWeight: '300', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <FaTags style={{ color: '#9b59b6' }} /> Category Management
            </h1>
            
            {error && <p style={{ color: 'white', backgroundColor: 'rgba(231, 76, 60, 0.8)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e74c3c' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* CREATE/EDIT CATEGORY FORM */}
                <div className="glass-panel" style={{ padding: '30px', flex: '1', minWidth: '300px' }}>
                    <h3 style={{ marginBottom: '25px', color: '#e2e8f0', fontSize: '1.2rem', fontWeight: '500' }}>
                        {editingId ? 'Edit Category' : 'Create Category'}
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>Category Name</label>
                            <input 
                                className="glass-input"
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required 
                                placeholder="e.g., Electronics"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>Icon (Text/Emoji)</label>
                            <input 
                                className="glass-input"
                                type="text" 
                                value={icon} 
                                onChange={(e) => setIcon(e.target.value)} 
                                placeholder="e.g., ⚡"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>Identifier Color</label>
                            <input 
                                className="glass-input"
                                type="color" 
                                value={color} 
                                onChange={(e) => setColor(e.target.value)} 
                                style={{ padding: '5px', cursor: 'pointer', height: '50px' }} 
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button type="submit" style={{ flex: 1, padding: '15px', backgroundColor: 'rgba(155, 89, 182, 0.2)', color: '#d2b4de', border: '1px solid rgba(155, 89, 182, 0.5)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s', fontSize: '1.1rem' }}>
                                {editingId ? 'Update Category' : '+ Save Category'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={handleCancelEdit} style={{ flex: 1, padding: '15px', backgroundColor: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c', border: '1px solid rgba(231, 76, 60, 0.5)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s', fontSize: '1.1rem' }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* CATEGORY LIST TABLE */}
                <div className="glass-panel" style={{ padding: '30px', flex: '2', minWidth: '400px' }}>
                    <h3 style={{ marginBottom: '25px', color: '#e2e8f0', fontSize: '1.2rem', fontWeight: '500' }}>Active Categories</h3>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: '#e2e8f0' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Name</th>
                                <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Icon</th>
                                <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Color Tag</th>
                                <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 ? (
                                <tr><td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No categories found.</td></tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px 10px', fontWeight: 'bold', color: '#fff' }}>{cat.name}</td>
                                        <td style={{ padding: '15px 10px', fontSize: '1.2rem' }}>{cat.icon}</td>
                                        <td style={{ padding: '15px 10px' }}>
                                            <span style={{ display: 'inline-block', width: '24px', height: '24px', backgroundColor: cat.color, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', boxShadow: `0 0 10px ${cat.color}40` }}></span>
                                        </td>
                                        <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                                            <button 
                                                onClick={() => handleEditClick(cat)}
                                                style={{ backgroundColor: 'transparent', color: '#3498db', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1.2rem', marginRight: '10px', transition: 'transform 0.2s' }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'} 
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(cat.id)}
                                                style={{ backgroundColor: 'transparent', color: '#e74c3c', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.2s' }}
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
        </div>
    );
}