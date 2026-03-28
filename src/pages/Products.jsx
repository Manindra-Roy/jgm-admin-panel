// // src/pages/Products.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaTrash, FaImage, FaBoxOpen } from 'react-icons/fa';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState('');
    const [image, setImage] = useState(null);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load inventory data.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setError('');
        setUploading(true);

        if (!category) {
            setError('Please assign a category to this item.');
            setUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('countInStock', countInStock);
        if (image) formData.append('image', image);

        try {
            await api.post('/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            // Reset form
            setName(''); setDescription(''); setPrice(''); setCategory(''); setCountInStock(''); setImage(null);
            fetchData(); 
        } catch (err) {
            setError('Failed to upload item. Check network connections.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this item?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchData();
            } catch (err) {
                alert('Failed to delete item. Ensure backend routes are updated.');
            }
        }
    };

    if (loading) return <h2 style={{ padding: '40px', color: 'white' }}>Loading System Inventory...</h2>;

    return (
        <div style={{ padding: '40px 40px 40px 20px' }}>
            <h1 style={{ marginBottom: '40px', color: '#fff', fontWeight: '300', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <FaBoxOpen style={{ color: '#3498db' }} /> Item Management
            </h1>
            
            {error && <p style={{ color: 'white', backgroundColor: 'rgba(231, 76, 60, 0.8)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e74c3c' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* CREATE ITEM FORM */}
                <div className="glass-panel" style={{ padding: '30px', flex: '1', minWidth: '350px' }}>
                    <h3 style={{ marginBottom: '25px', color: '#e2e8f0', fontSize: '1.2rem', fontWeight: '500' }}>Add New Item</h3>
                    <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        <input className="glass-input" type="text" placeholder="Item Name" value={name} onChange={(e) => setName(e.target.value)} required />
                        
                        <textarea className="glass-input" placeholder="Item Description..." value={description} onChange={(e) => setDescription(e.target.value)} required rows="4" style={{ resize: 'vertical' }} />
                        
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <input className="glass-input" type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" style={{ flex: 1 }} />
                            <input className="glass-input" type="number" placeholder="Stock Qty" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} required min="0" style={{ flex: 1 }} />
                        </div>

                        <select className="glass-input" value={category} onChange={(e) => setCategory(e.target.value)} required style={{ appearance: 'none' }}>
                            <option value="" style={{ color: 'black' }}>-- Assign Category --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id} style={{ color: 'black' }}>{cat.name}</option>
                            ))}
                        </select>

                        <div style={{ padding: '20px', border: '1px dashed rgba(255,255,255,0.3)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                            <label style={{ display: 'block', marginBottom: '15px', color: '#e2e8f0', fontWeight: '500' }}><FaImage /> Featured Image</label>
                            <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={(e) => setImage(e.target.files[0])} required style={{ color: '#94a3b8' }} />
                        </div>

                        <button type="submit" disabled={uploading} style={{ padding: '15px', backgroundColor: uploading ? 'rgba(149, 165, 166, 0.5)' : 'rgba(52, 152, 219, 0.2)', color: uploading ? '#bdc3c7' : '#3498db', border: `1px solid ${uploading ? 'transparent' : 'rgba(52, 152, 219, 0.5)'}`, borderRadius: '8px', fontWeight: 'bold', cursor: uploading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', fontSize: '1.1rem' }}>
                            {uploading ? 'Processing Upload...' : '+ Add Item'}
                        </button>
                    </form>
                </div>

                {/* ITEM LIST TABLE */}
                <div className="glass-panel" style={{ padding: '30px', flex: '2', minWidth: '500px', overflowX: 'auto' }}>
                    <h3 style={{ marginBottom: '25px', color: '#e2e8f0', fontSize: '1.2rem', fontWeight: '500' }}>Active Database</h3>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: '#e2e8f0' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Preview</th>
                                <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Name</th>
                                <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Price</th>
                                <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Stock</th>
                                <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No records found.</td></tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px 10px' }}>
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }} />
                                            ) : 'None'}
                                        </td>
                                        <td style={{ padding: '15px 10px', fontWeight: 'bold', color: '#fff' }}>{product.name}</td>
                                        {/* <td style={{ padding: '15px 10px', color: '#3498db' }}>{product.price}</td> */}
                                        <td style={{ padding: '15px 10px', color: '#3498db', fontWeight: 'bold' }}>
                                            ₹{product.price.toLocaleString('en-IN')}
                                        </td>
                                        <td style={{ padding: '15px 10px' }}>
                                            <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: product.countInStock > 0 ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)', color: product.countInStock > 0 ? '#2ecc71' : '#e74c3c', fontSize: '0.85em', fontWeight: 'bold', border: `1px solid ${product.countInStock > 0 ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)'}` }}>
                                                {product.countInStock}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px 10px', textAlign: 'center' }}>
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
            </div>
        </div>
    );
}