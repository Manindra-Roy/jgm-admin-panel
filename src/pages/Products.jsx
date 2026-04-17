/**
 * @fileoverview Admin Product Management Component.
 * Handles the complete CRUD lifecycle for inventory items, including secure
 * image uploads, debounced search filtering, pagination, and rich text handling.
 */

import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { FaTrash, FaImage, FaBoxOpen, FaEdit, FaStar, FaSearch } from 'react-icons/fa';

/**
 * Products Component
 * @returns {JSX.Element} The rendered product management interface.
 */
export default function Products() {
    // --- STATE MANAGEMENT ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Filter & Pagination States
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    // Form States
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [richDescription, setRichDescription] = useState(''); 
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState('');
    const [brand, setBrand] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editingId, setEditingId] = useState(null);

    /**
     * Fetches paginated/searched products and all available categories concurrently.
     */
    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                api.get(`/products?page=${page}&limit=${limit}&search=${searchTerm}`),
                api.get('/categories')
            ]);
            setProducts(productsRes.data.products || productsRes.data);
            setCategories(categoriesRes.data);
        } catch (err) {
            toast.error('Failed to load inventory data.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Effect: Refetches data whenever the active page changes.
     */
    useEffect(() => {
        fetchData();
    }, [page]);

    /**
     * Effect: Implements a debounced search to prevent API spam.
     * Waits 500ms after the user stops typing before triggering the fetch.
     */
    useEffect(() => {
        if (loading) return; 

        const delaySearch = setTimeout(() => {
            fetchData();
        }, 500);
        
        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    /**
     * Populates the form inputs with the selected product's data and scrolls to the top.
     * @param {Object} product - The product object to edit.
     */
    const handleEditClick = (product) => {
        setEditingId(product.id);
        setImagePreview(product.image || null);
        setName(product.name);
        setDescription(product.description);
        setRichDescription(product.richDescription || ''); 
        setPrice(product.price);
        setCategory(product.category?.id || product.category || '');
        setCountInStock(product.countInStock);
        setBrand(product.brand || '');
        setIsFeatured(product.isFeatured || false);
        setImage(null); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /**
     * Clears the form state and exits edit mode.
     */
    const handleCancelEdit = () => {
        setEditingId(null);
        setImagePreview(null);
        setName(''); setDescription(''); setRichDescription(''); setPrice(''); setCategory(''); 
        setCountInStock(''); setBrand(''); setIsFeatured(false); setImage(null);
    };

    /**
     * Captures the selected image file and generates a local URL for previewing.
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
     * Uses FormData to package text fields and the binary image file safely.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        if (!category) {
            toast.error('Please assign a category to this item.');
            setUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('richDescription', richDescription); 
        formData.append('price', price);
        formData.append('category', category);
        formData.append('countInStock', countInStock);
        formData.append('brand', brand);
        formData.append('isFeatured', isFeatured);
        if (image) formData.append('image', image);

        try {
            if (editingId) {
                // Update existing product
                await api.put(`/products/${editingId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Product updated successfully!');
            } else {
                // Create new product
                await api.post('/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Product added to inventory!');
            }
            
            handleCancelEdit();
            if (page !== 1 && !editingId) setPage(1); // Jump to first page if creating new item
            else fetchData(); 
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data || `Failed to process item.`);
        } finally {
            setUploading(false);
        }
    };

    /**
     * Triggers a custom confirmation toast before permanently deleting a product.
     * @param {string} id - The database ID of the product to delete.
     */
    const handleDelete = async (id) => {
        toast((t) => (
            <div>
                <p style={{ marginBottom: '10px' }}>Permanently delete this item?</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await api.delete(`/products/${id}`);
                                toast.success('Item deleted');
                                
                                // Handle edge case: deleting the last item on a paginated screen
                                if (products.length === 1 && page > 1) {
                                    setPage(prev => prev - 1);
                                } else {
                                    fetchData(); 
                                }
                            } catch (err) {
                                toast.error('Failed to delete item.');
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
                <FaBoxOpen style={{ color: '#3498db' }} /> Item Management
            </h1>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* --- FORM SECTION --- */}
                <div className="glass-panel" style={{ padding: '30px', flex: '1', minWidth: '350px' }}>
                    <h3 style={{ marginBottom: '25px', color: '#e2e8f0', fontSize: '1.2rem', fontWeight: '500' }}>
                        {editingId ? 'Edit Item' : 'Add New Item'}
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <input className="glass-input" type="text" placeholder="Item Name" value={name} onChange={(e) => setName(e.target.value)} required maxLength="100" />
                        
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <input className="glass-input" type="text" placeholder="Brand (Optional)" value={brand} onChange={(e) => setBrand(e.target.value)} style={{ flex: 1 }} maxLength="50" />
                            <select className="glass-input" value={category} onChange={(e) => setCategory(e.target.value)} required style={{ flex: 1, appearance: 'none' }}>
                                <option value="" style={{ color: 'black' }}>-- Category --</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id} style={{ color: 'black' }}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <textarea className="glass-input" placeholder="Item Description..." value={description} onChange={(e) => setDescription(e.target.value)} required rows="2" style={{ resize: 'vertical' }} maxLength="500" />
                        
                        <textarea className="glass-input" placeholder="Rich Description (HTML allowed)..." value={richDescription} onChange={(e) => setRichDescription(e.target.value)} rows="3" style={{ resize: 'vertical' }} />

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <input className="glass-input" type="number" placeholder="Price (₹)" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" style={{ flex: 1 }} />
                            {/* Max 255 enforced to match backend Joi schema limitations */}
                            <input className="glass-input" type="number" placeholder="Stock Qty" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} required min="0" max="255" style={{ flex: 1 }} />
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0', cursor: 'pointer', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                            <FaStar color={isFeatured ? '#f1c40f' : '#95a5a6'} /> Mark as Featured Product
                        </label>

                        <div style={{ padding: '20px', border: '1px dashed rgba(255,255,255,0.3)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <label style={{ color: '#e2e8f0', fontWeight: '500' }}>
                                <FaImage /> {editingId ? 'Upload New Image (Leaves current if empty)' : 'Featured Image'}
                            </label>
                            
                            {imagePreview && (
                                <div style={{ alignSelf: 'flex-start', position: 'relative' }}>
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #3498db' }} 
                                    />
                                </div>
                            )}

                            <input 
                                type="file" 
                                accept="image/jpeg, image/png, image/jpg" 
                                onChange={handleImageChange} 
                                required={!editingId} 
                                style={{ color: '#94a3b8', width: '100%' }} 
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" disabled={uploading} style={{ flex: 1, padding: '15px', backgroundColor: uploading ? 'rgba(149, 165, 166, 0.5)' : 'rgba(52, 152, 219, 0.2)', color: uploading ? '#bdc3c7' : '#3498db', border: `1px solid ${uploading ? 'transparent' : 'rgba(52, 152, 219, 0.5)'}`, borderRadius: '8px', fontWeight: 'bold', cursor: uploading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', fontSize: '1.1rem' }}>
                                {uploading ? 'Processing...' : (editingId ? 'Update Item' : '+ Add Item')}
                            </button>
                            {editingId && (
                                <button type="button" onClick={handleCancelEdit} style={{ flex: 1, padding: '15px', backgroundColor: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c', border: '1px solid rgba(231, 76, 60, 0.5)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s', fontSize: '1.1rem' }}>Cancel</button>
                            )}
                        </div>
                    </form>
                </div>

                {/* --- DATA TABLE SECTION --- */}
                <div className="glass-panel" style={{ padding: '30px', flex: '2', minWidth: '500px', overflowX: 'auto', display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                        <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.2rem', fontWeight: '500' }}>Active Database</h3>
                        
                        {/* Debounced Search Input */}
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px 15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <FaSearch color="#94a3b8" />
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                                style={{ background: 'transparent', border: 'none', color: 'white', paddingLeft: '10px', outline: 'none' }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                        {loading ? (
                            <Loader message="Fetching inventory..." />
                        ) : (
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
                                    {products.length === 0 ? (
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
                                                    <button onClick={() => handleEditClick(product)} style={{ backgroundColor: 'transparent', color: '#3498db', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.2s', marginRight: '5px' }}><FaEdit /></button>
                                                    <button onClick={() => handleDelete(product.id)} style={{ backgroundColor: 'transparent', color: '#e74c3c', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.2s' }}><FaTrash /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(prev => prev - 1)}
                            style={{ padding: '10px 20px', backgroundColor: page === 1 ? 'transparent' : 'rgba(52, 152, 219, 0.2)', color: page === 1 ? '#64748b' : '#3498db', border: `1px solid ${page === 1 ? '#475569' : 'rgba(52, 152, 219, 0.5)'}`, borderRadius: '8px', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }}
                        >Previous</button>
                        <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>Page {page}</span>
                        <button 
                            disabled={products.length < limit}
                            onClick={() => setPage(prev => prev + 1)}
                            style={{ padding: '10px 20px', backgroundColor: products.length < limit ? 'transparent' : 'rgba(52, 152, 219, 0.2)', color: products.length < limit ? '#64748b' : '#3498db', border: `1px solid ${products.length < limit ? '#475569' : 'rgba(52, 152, 219, 0.5)'}`, borderRadius: '8px', cursor: products.length < limit ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }}
                        >Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}