/**
 * @fileoverview Admin Category Management Component.
 * Handles complete CRUD (Create, Read, Update, Delete) operations for product categories.
 * Includes support for multipart/form-data to handle Cloudinary image uploads securely.
 */

import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { FaTrash, FaTags, FaEdit, FaImage } from 'react-icons/fa';

/**
 * Categories Component
 * @returns {JSX.Element} The rendered category management interface.
 */
export default function Categories() {
    // --- STATE MANAGEMENT ---
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    // Form States
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('');
    const [color, setColor] = useState('#3498db');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editingId, setEditingId] = useState(null);

    /**
     * Fetches the latest list of product categories from the database.
     */
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (err) {
            toast.error('Failed to load categories.');
        } finally {
            setLoading(false);
        }
    };

    // Initial data load on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    /**
     * Populates the form inputs with the selected category's data and scrolls to the top.
     * @param {Object} category - The category object to edit.
     */
    const handleEditClick = (category) => {
        setEditingId(category.id);
        setImagePreview(category.image || null);
        setName(category.name);
        setIcon(category.icon || '');
        setColor(category.color || '#3498db');
        setImage(null); // Reset the file input 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /**
     * Clears the form state and exits edit mode.
     */
    const handleCancelEdit = () => {
        setEditingId(null);
        setImagePreview(null);
        setName('');
        setIcon('');
        setColor('#3498db');
        setImage(null);
    };

    /**
     * Captures the selected image file and generates a temporary local URL for previewing.
     * @param {Event} e - The file input change event.
     */
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    /**
     * Submits the form data to the backend.
     * Uses FormData to package the text fields alongside the binary image file.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        // Construct multipart/form-data payload
        const formData = new FormData();
        formData.append('name', name);
        formData.append('icon', icon);
        formData.append('color', color);
        if (image) formData.append('image', image);

        try {
            if (editingId) {
                // Update existing category
                await api.put(`/categories/${editingId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Category updated!');
            } else {
                // Create new category
                await api.post('/categories', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Category created!');
            }
            handleCancelEdit(); 
            fetchCategories(); 
        } catch (err) {
            toast.error(`Failed to ${editingId ? 'update' : 'create'} category.`);
        } finally {
            setUploading(false);
        }
    };

    /**
     * Triggers a custom confirmation toast before deleting a category.
     * @param {string} id - The database ID of the category to delete.
     */
    const handleDelete = async (id) => {
        toast((t) => (
            <div>
                <p style={{ marginBottom: '10px' }}>Delete this category?</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await api.delete(`/categories/${id}`);
                                toast.success('Category deleted');
                                fetchCategories(); 
                            } catch (err) {
                                toast.error('Failed to delete category. It might be linked to items.');
                            }
                        }}
                        style={{ backgroundColor: '#e74c3c', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >Delete</button>
                    <button onClick={() => toast.dismiss(t.id)} style={{ backgroundColor: '#475569', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    return (
        <div style={{ padding: '40px 40px 40px 20px' }}>
            <h1 style={{ marginBottom: '40px', color: '#fff', fontWeight: '300', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <FaTags style={{ color: '#9b59b6' }} /> Category Management
            </h1>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* --- FORM SECTION --- */}
                <div className="glass-panel" style={{ padding: '30px', flex: '1', minWidth: '300px' }}>
                    <h3 style={{ marginBottom: '25px', color: '#e2e8f0', fontSize: '1.2rem', fontWeight: '500' }}>
                        {editingId ? 'Edit Category' : 'Create Category'}
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>Category Name</label>
                            <input className="glass-input" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Perfume" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>Icon (Text/Emoji)</label>
                            <input className="glass-input" type="text" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g., 🌺" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>Identifier Color</label>
                            <input className="glass-input" type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ padding: '5px', cursor: 'pointer', height: '50px' }} />
                        </div>
                        
                        <div style={{ padding: '15px', border: '1px dashed rgba(255,255,255,0.3)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <label style={{ color: '#e2e8f0', fontWeight: '500', fontSize: '0.9rem' }}>
                                <FaImage /> {editingId ? 'New Cover Image (Optional)' : 'Cover Image'}
                            </label>
                            
                            {imagePreview && (
                                <div style={{ alignSelf: 'flex-start', position: 'relative' }}>
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #9b59b6' }} 
                                    />
                                </div>
                            )}

                            <input 
                                type="file" 
                                accept="image/jpeg, image/png, image/jpg" 
                                onChange={handleImageChange} 
                                style={{ color: '#94a3b8', width: '100%', fontSize: '0.85rem' }} 
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button type="submit" disabled={uploading} style={{ flex: 1, padding: '15px', backgroundColor: uploading ? 'rgba(149, 165, 166, 0.5)' : 'rgba(155, 89, 182, 0.2)', color: uploading ? '#bdc3c7' : '#d2b4de', border: `1px solid ${uploading ? 'transparent' : 'rgba(155, 89, 182, 0.5)'}`, borderRadius: '8px', fontWeight: 'bold', cursor: uploading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', fontSize: '1.1rem' }}>
                                {uploading ? 'Saving...' : (editingId ? 'Update Category' : '+ Save Category')}
                            </button>
                            {editingId && (
                                <button type="button" onClick={handleCancelEdit} style={{ flex: 1, padding: '15px', backgroundColor: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c', border: '1px solid rgba(231, 76, 60, 0.5)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s', fontSize: '1.1rem' }}>Cancel</button>
                            )}
                        </div>
                    </form>
                </div>

                {/* --- DATA TABLE SECTION --- */}
                <div className="glass-panel" style={{ padding: '30px', flex: '2', minWidth: '400px', minHeight: '400px' }}>
                    <h3 style={{ marginBottom: '25px', color: '#e2e8f0', fontSize: '1.2rem', fontWeight: '500' }}>Active Categories</h3>
                    
                    {loading ? (
                        <Loader message="Loading Categories..." />
                    ) : (
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: '#e2e8f0' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Image</th>
                                    <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Name</th>
                                    <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Icon / Color</th>
                                    <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr><td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No categories found.</td></tr>
                                ) : (
                                    categories.map((cat) => (
                                        <tr key={cat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '15px 10px' }}>
                                                {cat.image ? (
                                                    <img src={cat.image} alt={cat.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }} />
                                                ) : (
                                                    <div style={{ width: '50px', height: '50px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>None</div>
                                                )}
                                            </td>
                                            <td style={{ padding: '15px 10px', fontWeight: 'bold', color: '#fff' }}>{cat.name}</td>
                                            <td style={{ padding: '15px 10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                                                    <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: cat.color, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }}></span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                                                <button onClick={() => handleEditClick(cat)} style={{ backgroundColor: 'transparent', color: '#3498db', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1.2rem', marginRight: '10px', transition: 'transform 0.2s' }}><FaEdit /></button>
                                                <button onClick={() => handleDelete(cat.id)} style={{ backgroundColor: 'transparent', color: '#e74c3c', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.2s' }}><FaTrash /></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
