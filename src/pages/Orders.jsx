// src/pages/Orders.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaTrash, FaClipboardList, FaEye, FaTimes, FaSearch, FaFilter, FaPrint, FaTruck, FaMoneyCheckAlt } from 'react-icons/fa';

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
    const [updatingLogistics, setUpdatingLogistics] = useState(false);

    // Logistics Form State
    const [courierName, setCourierName] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');

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

    const handleLogisticsUpdate = async (e) => {
        e.preventDefault();
        setUpdatingLogistics(true);
        try {
            await api.put(`/orders/${selectedOrder.id}`, { 
                courierName, 
                trackingNumber 
            });
            toast.success('Tracking information saved!');
            
            // Update local state so modal reflects changes immediately
            setSelectedOrder(prev => ({ ...prev, courierName, trackingNumber }));
            fetchOrders();
        } catch (err) {
            toast.error('Failed to save tracking info.');
        } finally {
            setUpdatingLogistics(false);
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
            setCourierName(response.data.courierName || '');
            setTrackingNumber(response.data.trackingNumber || '');
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

    const handlePrint = () => {
        window.print();
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Pending': return { bg: 'rgba(241, 196, 15, 0.2)', color: '#f1c40f', border: 'rgba(241, 196, 15, 0.5)' };
            case 'Processing': return { bg: 'rgba(155, 89, 182, 0.2)', color: '#9b59b6', border: 'rgba(155, 89, 182, 0.5)' };
            case 'Shipped': return { bg: 'rgba(52, 152, 219, 0.2)', color: '#3498db', border: 'rgba(52, 152, 219, 0.5)' };
            case 'Out for Delivery': return { bg: 'rgba(26, 188, 156, 0.2)', color: '#1abc9c', border: 'rgba(26, 188, 156, 0.5)' };
            case 'Delivered': return { bg: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71', border: 'rgba(46, 204, 113, 0.5)' };
            case 'Cancelled': return { bg: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c', border: 'rgba(231, 76, 60, 0.5)' };
            default: return { bg: 'rgba(149, 165, 166, 0.2)', color: '#95a5a6', border: 'rgba(149, 165, 166, 0.5)' };
        }
    };

    const getPaymentStyle = (status) => {
        if (status === 'Paid') return { color: '#2ecc71', bg: 'rgba(46, 204, 113, 0.2)' };
        if (status === 'Failed') return { color: '#e74c3c', bg: 'rgba(231, 76, 60, 0.2)' };
        return { color: '#f1c40f', bg: 'rgba(241, 196, 15, 0.2)' }; // Default Pending
    };

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
                            placeholder="Search by Order ID or Customer..." 
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
                            <option value="Processing" style={{ color: 'black' }}>Processing</option>
                            <option value="Shipped" style={{ color: 'black' }}>Shipped</option>
                            <option value="Out for Delivery" style={{ color: 'black' }}>Out for Delivery</option>
                            <option value="Delivered" style={{ color: 'black' }}>Delivered</option>
                            <option value="Cancelled" style={{ color: 'black' }}>Cancelled</option>
                        </select>
                    </div>
                </div>

                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: '#e2e8f0' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Order ID</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Customer</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Date</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Payment</th>
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
                                const paymentStyle = getPaymentStyle(order.paymentStatus || 'Pending');
                                return (
                                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px 10px', fontSize: '0.85em', color: '#94a3b8', fontFamily: 'monospace' }}>
                                           {order.id.substring(order.id.length - 8).toUpperCase()} {/* Show short ID */}
                                        </td>
                                        <td style={{ padding: '15px 10px', fontWeight: 'bold', color: '#fff' }}>
                                            {order.user ? order.user.name : 'Guest'}
                                        </td>
                                        <td style={{ padding: '15px 10px', color: '#cbd5e1' }}>
                                            {new Date(order.dateOrdered).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '15px 10px' }}>
                                            <span style={{ backgroundColor: paymentStyle.bg, color: paymentStyle.color, padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em', fontWeight: 'bold' }}>
                                                {order.paymentStatus || 'Pending'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px 10px' }}>
                                            <select 
                                                value={order.status} 
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                style={{ 
                                                    padding: '6px 10px', borderRadius: '6px', border: `1px solid ${statusStyle.border}`,
                                                    backgroundColor: statusStyle.bg, color: statusStyle.color, fontWeight: 'bold',
                                                    cursor: 'pointer', outline: 'none', appearance: 'none', textAlign: 'center', fontSize: '0.9em'
                                                }}
                                            >
                                                <option value="Pending" style={{ color: 'black' }}>Pending</option>
                                                <option value="Processing" style={{ color: 'black' }}>Processing</option>
                                                <option value="Shipped" style={{ color: 'black' }}>Shipped</option>
                                                <option value="Out for Delivery" style={{ color: 'black' }}>Out for Delivery</option>
                                                <option value="Delivered" style={{ color: 'black' }}>Delivered</option>
                                                <option value="Cancelled" style={{ color: 'black' }}>Cancelled</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                                            <button onClick={() => viewOrderDetails(order.id)} style={{ backgroundColor: 'transparent', color: '#3498db', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.2s', marginRight: '5px' }} title="View Details">
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

            {/* ORDER INVOICE MODAL */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }}>
                    
                    <div id="printable-invoice" className="glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '40px', position: 'relative', backgroundColor: '#16213e', margin: 'auto' }}>
                        
                        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginBottom: '20px' }}>
                            <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3498db', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                                <FaPrint /> Print Invoice
                            </button>
                            <button onClick={closeModal} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '1.2rem', cursor: 'pointer' }}>
                                <FaTimes />
                            </button>
                        </div>

                        {loadingDetails ? (
                            <p style={{ color: '#94a3b8', textAlign: 'center' }}>Loading Invoice...</p>
                        ) : selectedOrder ? (
                            <div style={{ color: '#e2e8f0' }}>
                                
                                {/* HEADER */}
                                <div style={{ borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h2 style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '2rem', letterSpacing: '2px' }}>JGM INDUSTRIES</h2>
                                        <p style={{ margin: 0, color: '#94a3b8' }}>Order Receipt</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}><strong>Order ID:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedOrder.id}</span></p>
                                        <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}><strong>Date:</strong> {new Date(selectedOrder.dateOrdered).toLocaleDateString()}</p>
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Status:</strong> {selectedOrder.status}</p>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                                    {/* SHIPPING INFO */}
                                    <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', minWidth: '250px' }}>
                                        <h4 style={{ margin: '0 0 15px 0', color: '#3498db', textTransform: 'uppercase', letterSpacing: '1px' }}>Ship To</h4>
                                        <p style={{ margin: '5px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{selectedOrder.user?.name || 'Guest Customer'}</p>
                                        <p style={{ margin: '5px 0' }}>{selectedOrder.shippingAddress1}</p>
                                        {selectedOrder.shippingAddress2 && <p style={{ margin: '5px 0' }}>{selectedOrder.shippingAddress2}</p>}
                                        <p style={{ margin: '5px 0' }}>{selectedOrder.city}, {selectedOrder.zip}</p>
                                        <p style={{ margin: '5px 0' }}>{selectedOrder.country}</p>
                                        <p style={{ margin: '15px 0 0 0' }}><strong>Phone:</strong> {selectedOrder.phone}</p>
                                    </div>

                                    {/* PAYMENT & TRACKING WIDGET */}
                                    <div className="no-print" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', minWidth: '250px' }}>
                                        
                                        <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px' }}>
                                            <h4 style={{ margin: '0 0 15px 0', color: '#f1c40f', display: 'flex', alignItems: 'center', gap: '10px' }}><FaMoneyCheckAlt /> Payment Verification</h4>
                                            <p style={{ margin: '5px 0' }}>Status: <strong style={getPaymentStyle(selectedOrder.paymentStatus || 'Pending')}>{selectedOrder.paymentStatus || 'Pending'}</strong></p>
                                            <p style={{ margin: '5px 0', fontSize: '0.85rem', color: '#94a3b8' }}>Txn ID: {selectedOrder.transactionId || 'Awaiting Payment'}</p>
                                        </div>

                                        <form onSubmit={handleLogisticsUpdate} style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(52, 152, 219, 0.2)' }}>
                                            <h4 style={{ margin: '0 0 15px 0', color: '#3498db', display: 'flex', alignItems: 'center', gap: '10px' }}><FaTruck /> Courier Tracking</h4>
                                            <input 
                                                className="glass-input" 
                                                type="text" 
                                                placeholder="Courier Name (e.g. Delhivery)" 
                                                value={courierName} 
                                                onChange={(e) => setCourierName(e.target.value)} 
                                                style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                                            />
                                            <input 
                                                className="glass-input" 
                                                type="text" 
                                                placeholder="AWB Tracking Number" 
                                                value={trackingNumber} 
                                                onChange={(e) => setTrackingNumber(e.target.value)} 
                                                style={{ width: '100%', marginBottom: '15px', padding: '8px' }}
                                            />
                                            <button type="submit" disabled={updatingLogistics} style={{ width: '100%', padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: updatingLogistics ? 'not-allowed' : 'pointer' }}>
                                                {updatingLogistics ? 'Saving...' : 'Update Tracking'}
                                            </button>
                                        </form>

                                    </div>
                                </div>

                                {/* ITEMS TABLE */}
                                <div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
                                                <th style={{ textAlign: 'left', padding: '10px 0' }}>Item Description</th>
                                                <th style={{ textAlign: 'center', padding: '10px 0' }}>Qty</th>
                                                <th style={{ textAlign: 'right', padding: '10px 0' }}>Unit Price</th>
                                                <th style={{ textAlign: 'right', padding: '10px 0' }}>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.orderItems?.map((item, index) => (
                                                <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '15px 0', fontWeight: '500' }}>
                                                        {item.product?.name || 'Unknown Product'}
                                                    </td>
                                                    <td style={{ textAlign: 'center', padding: '15px 0' }}>{item.quantity}</td>
                                                    <td style={{ textAlign: 'right', padding: '15px 0' }}>₹{(item.product?.price || 0).toLocaleString('en-IN')}</td>
                                                    <td style={{ textAlign: 'right', padding: '15px 0' }}>₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: 'right', padding: '25px 10px 10px 0', fontSize: '1.2rem' }}>Total Amount:</td>
                                                <td style={{ textAlign: 'right', padding: '25px 0 10px 0', fontWeight: 'bold', color: '#2ecc71', fontSize: '1.5rem' }}>
                                                    ₹{selectedOrder.totalPrice?.toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: '#e74c3c', textAlign: 'center' }}>Failed to load order data.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}