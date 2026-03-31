// src/pages/Products.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaTrash, FaImage, FaBoxOpen, FaEdit, FaStar, FaSearch } from 'react-icons/fa';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState('');
    const [brand, setBrand] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [image, setImage] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Append the search term to the API request
            const [productsRes, categoriesRes] = await Promise.all([
                api.get(`/products?page=${page}&limit=${limit}&search=${searchTerm}`),
                api.get('/categories')
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load inventory data.');
            setLoading(false);
        }
    };

    // Re-fetch when page OR searchTerm changes
    useEffect(() => {
        // Simple debounce: wait 500ms after user stops typing to search
        const delaySearch = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [page, searchTerm]);

    const handleEditClick = (product) => {
        setEditingId(product.id);
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setCategory(product.category?.id || product.category || '');
        setCountInStock(product.countInStock);
        setBrand(product.brand || '');
        setIsFeatured(product.isFeatured || false);
        setImage(null); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setName(''); setDescription(''); setPrice(''); setCategory(''); 
        setCountInStock(''); setBrand(''); setIsFeatured(false); setImage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        if (!category) {
            toast.error('Please assign a category to this item.');
            setUploading(false);
            return;
        }

        // --- REVERTED TO BACKEND UPLOAD LOGIC ---
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('countInStock', countInStock);
        formData.append('brand', brand);
        formData.append('isFeatured', isFeatured);
        if (image) formData.append('image', image);

        try {
            if (editingId) {
                await api.put(`/products/${editingId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Product updated successfully!');
            } else {
                await api.post('/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Product added to inventory!');
            }
            
            handleCancelEdit();
            
            // Jump to page 1 if adding new, else just refresh current page
            if (page !== 1 && !editingId) {
                setPage(1); 
            } else {
                fetchData(); 
            }
        } catch (err) {
            console.error(err);
            toast.error(`Failed to ${editingId ? 'update' : 'upload'} item. Check network connections.`);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        toast(
            (t) => (
                <div>
                    <p style={{ marginBottom: '10px' }}>Permanently delete this item?</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={async () => {
                                toast.dismiss(t.id);
                                try {
                                    await api.delete(`/products/${id}`);
                                    toast.success('Item deleted');
                                    fetchData();
                                } catch (err) {
                                    toast.error('Failed to delete item.');
                                }
                            }}
                            style={{ backgroundColor: '#e74c3c', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Delete
                        </button>
                        <button 
                            onClick={() => toast.dismiss(t.id)}
                            style={{ backgroundColor: '#475569', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            { duration: 5000 }
        );
    };

    return (
        <div style={{ padding: '40px 40px 40px 20px' }}>
            <h1 style={{ marginBottom: '40px', color: '#fff', fontWeight: '300', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <FaBoxOpen style={{ color: '#3498db' }} /> Item Management
            </h1>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* CREATE/EDIT ITEM FORM */}
                <div className="glass-panel" style={{ padding: '30px', flex: '1', minWidth: '350px' }}>
                    <h3 style={{ marginBottom: '25px', color: '#e2e8f0', fontSize: '1.2rem', fontWeight: '500' }}>
                        {editingId ? 'Edit Item' : 'Add New Item'}
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        <input className="glass-input" type="text" placeholder="Item Name" value={name} onChange={(e) => setName(e.target.value)} required />
                        
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <input className="glass-input" type="text" placeholder="Brand (Optional)" value={brand} onChange={(e) => setBrand(e.target.value)} style={{ flex: 1 }} />
                            <select className="glass-input" value={category} onChange={(e) => setCategory(e.target.value)} required style={{ flex: 1, appearance: 'none' }}>
                                <option value="" style={{ color: 'black' }}>-- Category --</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id} style={{ color: 'black' }}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <textarea className="glass-input" placeholder="Item Description..." value={description} onChange={(e) => setDescription(e.target.value)} required rows="4" style={{ resize: 'vertical' }} />
                        
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <input className="glass-input" type="number" placeholder="Price (₹)" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" style={{ flex: 1 }} />
                            <input className="glass-input" type="number" placeholder="Stock Qty" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} required min="0" style={{ flex: 1 }} />
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0', cursor: 'pointer', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                            <FaStar color={isFeatured ? '#f1c40f' : '#95a5a6'} /> Mark as Featured Product
                        </label>

                        <div style={{ padding: '20px', border: '1px dashed rgba(255,255,255,0.3)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                            <label style={{ display: 'block', marginBottom: '15px', color: '#e2e8f0', fontWeight: '500' }}>
                                <FaImage /> {editingId ? 'Upload New Image (Leaves current if empty)' : 'Featured Image'}
                            </label>
                            <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={(e) => setImage(e.target.files[0])} required={!editingId} style={{ color: '#94a3b8', width: '100%' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" disabled={uploading} style={{ flex: 1, padding: '15px', backgroundColor: uploading ? 'rgba(149, 165, 166, 0.5)' : 'rgba(52, 152, 219, 0.2)', color: uploading ? '#bdc3c7' : '#3498db', border: `1px solid ${uploading ? 'transparent' : 'rgba(52, 152, 219, 0.5)'}`, borderRadius: '8px', fontWeight: 'bold', cursor: uploading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', fontSize: '1.1rem' }}>
                                {uploading ? 'Processing...' : (editingId ? 'Update Item' : '+ Add Item')}
                            </button>
                            {editingId && (
                                <button type="button" onClick={handleCancelEdit} style={{ flex: 1, padding: '15px', backgroundColor: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c', border: '1px solid rgba(231, 76, 60, 0.5)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s', fontSize: '1.1rem' }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* ITEM LIST TABLE */}
                <div className="glass-panel" style={{ padding: '30px', flex: '2', minWidth: '500px', overflowX: 'auto', display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Header & Search Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                        <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.2rem', fontWeight: '500' }}>Active Database</h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px 15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <FaSearch color="#94a3b8" />
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1); // Reset to page 1 when searching
                                }}
                                style={{ background: 'transparent', border: 'none', color: 'white', paddingLeft: '10px', outline: 'none' }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: '#e2e8f0' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Preview</th>
                                    <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Name</th>
                                    <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Category</th>
                                    <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Price</th>
                                    <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Stock</th>
                                    <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Searching...</td></tr>
                                ) : products.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No records found.</td></tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '15px 10px' }}>
                                                {product.image ? (
                                                    <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }} />
                                                ) : 'None'}
                                            </td>
                                            <td style={{ padding: '15px 10px', fontWeight: 'bold', color: '#fff' }}>
                                                {product.name}
                                                {product.isFeatured && <FaStar color="#f1c40f" style={{ marginLeft: '8px', fontSize: '0.8em' }} title="Featured" />}
                                            </td>
                                            <td style={{ padding: '15px 10px', color: '#cbd5e1' }}>
                                                {product.category?.name || 'Uncategorized'}
                                            </td>
                                            <td style={{ padding: '15px 10px', color: '#3498db', fontWeight: 'bold' }}>
                                                ₹{product.price.toLocaleString('en-IN')}
                                            </td>
                                            <td style={{ padding: '15px 10px' }}>
                                                <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: product.countInStock > 0 ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)', color: product.countInStock > 0 ? '#2ecc71' : '#e74c3c', fontSize: '0.85em', fontWeight: 'bold', border: `1px solid ${product.countInStock > 0 ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)'}` }}>
                                                    {product.countInStock}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                                                <button onClick={() => handleEditClick(product)} style={{ backgroundColor: 'transparent', color: '#3498db', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.2s', marginRight: '5px' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                                    <FaEdit />
                                                </button>
                                                <button onClick={() => handleDelete(product.id)} style={{ backgroundColor: 'transparent', color: '#e74c3c', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION CONTROLS */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(prev => prev - 1)}
                            style={{ padding: '10px 20px', backgroundColor: page === 1 ? 'transparent' : 'rgba(52, 152, 219, 0.2)', color: page === 1 ? '#64748b' : '#3498db', border: `1px solid ${page === 1 ? '#475569' : 'rgba(52, 152, 219, 0.5)'}`, borderRadius: '8px', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }}
                        >
                            Previous
                        </button>
                        <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>Page {page}</span>
                        <button 
                            disabled={products.length < limit}
                            onClick={() => setPage(prev => prev + 1)}
                            style={{ padding: '10px 20px', backgroundColor: products.length < limit ? 'transparent' : 'rgba(52, 152, 219, 0.2)', color: products.length < limit ? '#64748b' : '#3498db', border: `1px solid ${products.length < limit ? '#475569' : 'rgba(52, 152, 219, 0.5)'}`, borderRadius: '8px', cursor: products.length < limit ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }}
                        >
                            Next
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}