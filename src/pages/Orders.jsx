// src/pages/Orders.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaTrash, FaClipboardList, FaEye, FaTimes, FaSearch, FaFilter } from 'react-icons/fa';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load orders.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}`, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders(); 
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus }));
            }
        } catch (err) {
            toast.error('Failed to update order status.');
        }
    };

    const handleDelete = async (orderId) => {
        toast((t) => (
            <div>
                <p style={{ marginBottom: '10px' }}>Permanently delete this order record?</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await api.delete(`/orders/${orderId}`);
                                toast.success('Order deleted');
                                fetchOrders();
                                if (selectedOrder && selectedOrder.id === orderId) closeModal();
                            } catch (err) {
                                toast.error('Failed to delete order.');
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

    const viewOrderDetails = async (orderId) => {
        setIsModalOpen(true);
        setLoadingDetails(true);
        try {
            const response = await api.get(`/orders/${orderId}`);
            setSelectedOrder(response.data);
        } catch (err) {
            toast.error('Failed to fetch order details.');
            setIsModalOpen(false);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Pending': return { bg: 'rgba(241, 196, 15, 0.2)', color: '#f1c40f', border: 'rgba(241, 196, 15, 0.5)' };
            case 'Shipped': return { bg: 'rgba(52, 152, 219, 0.2)', color: '#3498db', border: 'rgba(52, 152, 219, 0.5)' };
            case 'Delivered': return { bg: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71', border: 'rgba(46, 204, 113, 0.5)' };
            default: return { bg: 'rgba(149, 165, 166, 0.2)', color: '#95a5a6', border: 'rgba(149, 165, 166, 0.5)' };
        }
    };

    // --- FRONTEND FILTERING LOGIC ---
    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (order.user?.name || 'Guest').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    if (loading) return <h2 style={{ padding: '40px', color: 'white' }}>Loading Order History...</h2>;

    return (
        <div style={{ padding: '40px 40px 40px 20px', position: 'relative' }}>
            <h1 style={{ marginBottom: '40px', color: '#fff', fontWeight: '300', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <FaClipboardList style={{ color: '#e67e22' }} /> Order Fulfillment
            </h1>

            <div className="glass-panel" style={{ padding: '30px', overflowX: 'auto' }}>
                
                {/* SEARCH & FILTER CONTROLS */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '8px 15px', border: '1px solid rgba(255,255,255,0.1)', flex: 1, maxWidth: '400px' }}>
                        <FaSearch color="#94a3b8" />
                        <input 
                            type="text" 
                            placeholder="Search by Order ID or Customer Name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: 'white', paddingLeft: '10px', outline: 'none', width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaFilter color="#94a3b8" />
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="glass-input"
                            style={{ padding: '8px 15px', minWidth: '150px', appearance: 'none', cursor: 'pointer' }}
                        >
                            <option value="All" style={{ color: 'black' }}>All Statuses</option>
                            <option value="Pending" style={{ color: 'black' }}>Pending</option>
                            <option value="Shipped" style={{ color: 'black' }}>Shipped</option>
                            <option value="Delivered" style={{ color: 'black' }}>Delivered</option>
                        </select>
                    </div>
                </div>

                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: '#e2e8f0' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Order ID</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Customer</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Total Price</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Date Ordered</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Shipping Status</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No matching orders found.</td></tr>
                        ) : (
                            filteredOrders.map((order) => {
                                const statusStyle = getStatusStyle(order.status);
                                return (
                                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px 10px', fontSize: '0.85em', color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                                           {order.id}
                                        </td>
                                        <td style={{ padding: '15px 10px', fontWeight: 'bold', color: '#fff' }}>
                                            {order.user ? order.user.name : 'Guest User'}
                                        </td>
                                        <td style={{ padding: '15px 10px', color: '#2ecc71', fontWeight: 'bold', fontSize: '1.1em' }}>
                                            ₹{order.totalPrice?.toLocaleString('en-IN') || 0}
                                        </td>
                                        <td style={{ padding: '15px 10px', color: '#cbd5e1' }}>
                                            {new Date(order.dateOrdered).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '15px 10px' }}>
                                            <select 
                                                value={order.status} 
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                style={{ 
                                                    padding: '8px 12px', borderRadius: '8px', border: `1px solid ${statusStyle.border}`,
                                                    backgroundColor: statusStyle.bg, color: statusStyle.color, fontWeight: 'bold',
                                                    cursor: 'pointer', outline: 'none', appearance: 'none', textAlign: 'center'
                                                }}
                                            >
                                                <option value="Pending" style={{ color: 'black' }}>Pending</option>
                                                <option value="Shipped" style={{ color: 'black' }}>Shipped</option>
                                                <option value="Delivered" style={{ color: 'black' }}>Delivered</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                                            <button onClick={() => viewOrderDetails(order.id)} style={{ backgroundColor: 'transparent', color: '#3498db', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.2s', marginRight: '10px' }} title="View Details">
                                                <FaEye />
                                            </button>
                                            <button onClick={() => handleDelete(order.id)} style={{ backgroundColor: 'transparent', color: '#e74c3c', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.2s' }} title="Delete Order">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ORDER DETAILS MODAL (UNCHANGED) */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', position: 'relative', backgroundColor: '#16213e' }}>
                        <button onClick={closeModal} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}><FaTimes /></button>
                        <h2 style={{ marginTop: 0, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>Order Details</h2>
                        {loadingDetails ? (
                            <p style={{ color: '#94a3b8' }}>Fetching items...</p>
                        ) : selectedOrder ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#e2e8f0' }}>
                                <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#3498db' }}>Shipping Information</h4>
                                    <p style={{ margin: '5px 0' }}><strong>Name:</strong> {selectedOrder.user?.name || 'Guest'}</p>
                                    <p style={{ margin: '5px 0' }}><strong>Phone:</strong> {selectedOrder.phone}</p>
                                    <p style={{ margin: '5px 0' }}><strong>Address:</strong> {selectedOrder.shippingAddress1} {selectedOrder.shippingAddress2 && `, ${selectedOrder.shippingAddress2}`}</p>
                                    <p style={{ margin: '5px 0' }}><strong>Location:</strong> {selectedOrder.city}, {selectedOrder.zip}, {selectedOrder.country}</p>
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#3498db' }}>Purchased Items</h4>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                                                <th style={{ textAlign: 'left', padding: '10px' }}>Product</th>
                                                <th style={{ textAlign: 'center', padding: '10px' }}>Qty</th>
                                                <th style={{ textAlign: 'right', padding: '10px' }}>Price</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.orderItems?.map((item, index) => (
                                                <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        {item.product?.image && <img src={item.product.image} alt="product" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}/>}
                                                        {item.product?.name || 'Unknown Product'}
                                                    </td>
                                                    <td style={{ textAlign: 'center', padding: '10px' }}>x{item.quantity}</td>
                                                    <td style={{ textAlign: 'right', padding: '10px' }}>₹{(item.product?.price || 0).toLocaleString('en-IN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="2" style={{ textAlign: 'right', padding: '15px 10px', fontWeight: 'bold' }}>Total:</td>
                                                <td style={{ textAlign: 'right', padding: '15px 10px', fontWeight: 'bold', color: '#2ecc71', fontSize: '1.2rem' }}>₹{selectedOrder.totalPrice?.toLocaleString('en-IN')}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        ) : <p style={{ color: '#e74c3c' }}>Failed to load data.</p>}
                    </div>
                </div>
            )}
        </div>
    );
}