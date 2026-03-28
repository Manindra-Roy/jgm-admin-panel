// src/pages/Orders.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaTrash, FaClipboardList } from 'react-icons/fa';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load orders.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}`, { status: newStatus });
            fetchOrders(); 
        } catch (err) {
            alert('Failed to update order status.');
        }
    };

    const handleDelete = async (orderId) => {
        if (window.confirm('Are you sure you want to completely delete this order record?')) {
            try {
                await api.delete(`/orders/${orderId}`);
                fetchOrders();
            } catch (err) {
                alert('Failed to delete order.');
            }
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Pending': return { bg: 'rgba(241, 196, 15, 0.2)', color: '#f1c40f', border: 'rgba(241, 196, 15, 0.5)' };
            case 'Shipped': return { bg: 'rgba(52, 152, 219, 0.2)', color: '#3498db', border: 'rgba(52, 152, 219, 0.5)' };
            case 'Delivered': return { bg: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71', border: 'rgba(46, 204, 113, 0.5)' };
            default: return { bg: 'rgba(149, 165, 166, 0.2)', color: '#95a5a6', border: 'rgba(149, 165, 166, 0.5)' };
        }
    };

    if (loading) return <h2 style={{ padding: '40px', color: 'white' }}>Loading Order History...</h2>;

    return (
        <div style={{ padding: '40px 40px 40px 20px' }}>
            <h1 style={{ marginBottom: '40px', color: '#fff', fontWeight: '300', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <FaClipboardList style={{ color: '#e67e22' }} /> Order Fulfillment
            </h1>
            
            {error && <p style={{ color: 'white', backgroundColor: 'rgba(231, 76, 60, 0.8)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e74c3c' }}>{error}</p>}

            <div className="glass-panel" style={{ padding: '30px', overflowX: 'auto' }}>
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
                        {orders.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No orders have been placed yet.</td></tr>
                        ) : (
                            orders.map((order) => {
                                const statusStyle = getStatusStyle(order.status);
                                return (
                                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        {/* <td style={{ padding: '15px 10px', fontSize: '0.9em', color: '#94a3b8', fontFamily: 'monospace' }}>
                                            ...{order.id.slice(-6)}
                                        </td> */}
                                        <td style={{ padding: '15px 10px', fontSize: '0.85em', color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                                           {order.id}
                                        </td>
                                        <td style={{ padding: '15px 10px', fontWeight: 'bold', color: '#fff' }}>
                                            {order.user ? order.user.name : 'Guest User'}
                                        </td>
                                        {/* <td style={{ padding: '15px 10px', color: '#2ecc71', fontWeight: 'bold' }}>
                                            ₹{order.totalPrice}
                                        </td> */}
                                        <td style={{ padding: '15px 10px', color: '#2ecc71', fontWeight: 'bold', fontSize: '1.1em' }}>
                                            ₹{order.totalPrice.toLocaleString('en-IN')}
                                        </td>
                                        <td style={{ padding: '15px 10px', color: '#cbd5e1' }}>
                                            {new Date(order.dateOrdered).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '15px 10px' }}>
                                            <select 
                                                value={order.status} 
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                style={{ 
                                                    padding: '8px 12px', 
                                                    borderRadius: '8px',
                                                    border: `1px solid ${statusStyle.border}`,
                                                    backgroundColor: statusStyle.bg,
                                                    color: statusStyle.color,
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    outline: 'none',
                                                    appearance: 'none',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <option value="Pending" style={{ color: 'black' }}>Pending</option>
                                                <option value="Shipped" style={{ color: 'black' }}>Shipped</option>
                                                <option value="Delivered" style={{ color: 'black' }}>Delivered</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                                            <button 
                                                onClick={() => handleDelete(order.id)} 
                                                style={{ backgroundColor: 'transparent', color: '#e74c3c', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.2s' }}
                                                title="Delete Order"
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'} 
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
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
        </div>
    );
}