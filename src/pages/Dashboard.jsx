// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaRupeeSign, FaClipboardList, FaBoxOpen, FaUsers, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalSales: 0,
        orderCount: 0,
        productCount: 0,
        userCount: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch all stats concurrently to reduce loading time
                const [
                    salesRes, 
                    ordersCountRes, 
                    productsCountRes, 
                    usersCountRes,
                    recentOrdersRes
                ] = await Promise.all([
                    api.get('/orders/get/totalsales'),
                    api.get('/orders/get/count'),
                    api.get('/products/get/count'),
                    api.get('/users/get/count'),
                    api.get('/orders') // Fetch orders to slice the most recent
                ]);

                setStats({
                    totalSales: salesRes.data.totalsales || 0,
                    orderCount: ordersCountRes.data.orderCount || 0,
                    productCount: productsCountRes.data.productCount || 0,
                    userCount: usersCountRes.data.userCount || 0
                });

                // Grab only the top 5 most recent orders
                setRecentOrders(recentOrdersRes.data.slice(0, 5));
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load dashboard metrics. Ensure backend is running.');
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <h2 style={{ padding: '40px', color: 'white' }}>Compiling JGM Data...</h2>;

    // Helper for metric cards
    const MetricCard = ({ title, value, icon, color, bg }) => (
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', flex: '1', minWidth: '220px' }}>
            <div style={{ backgroundColor: bg, color: color, width: '60px', height: '60px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem' }}>
                {icon}
            </div>
            <div>
                <p style={{ margin: '0 0 5px 0', color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</p>
                <h2 style={{ margin: 0, color: '#fff', fontSize: '1.8rem' }}>{value}</h2>
            </div>
        </div>
    );

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Pending': return { color: '#f1c40f', bg: 'rgba(241, 196, 15, 0.1)' };
            case 'Shipped': return { color: '#3498db', bg: 'rgba(52, 152, 219, 0.1)' };
            case 'Delivered': return { color: '#2ecc71', bg: 'rgba(46, 204, 113, 0.1)' };
            default: return { color: '#95a5a6', bg: 'rgba(149, 165, 166, 0.1)' };
        }
    };

    return (
        <div style={{ padding: '40px 40px 40px 20px' }}>
            <h1 style={{ marginBottom: '10px', color: '#fff', fontWeight: '300', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <FaChartLine style={{ color: '#2ecc71' }} /> Overview
            </h1>
            <p style={{ color: '#94a3b8', marginBottom: '40px' }}>Welcome to the JGM Industries administration panel.</p>

            {error && <p style={{ color: 'white', backgroundColor: 'rgba(231, 76, 60, 0.8)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e74c3c' }}>{error}</p>}

            {/* TOP METRICS ROW */}
            <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', marginBottom: '40px' }}>
                <MetricCard 
                    title="Total Sales" 
                    value={`₹${stats.totalSales.toLocaleString('en-IN')}`} 
                    icon={<FaRupeeSign />} 
                    color="#2ecc71" 
                    bg="rgba(46, 204, 113, 0.15)" 
                />
                <MetricCard 
                    title="Total Orders" 
                    value={stats.orderCount.toLocaleString('en-IN')} 
                    icon={<FaClipboardList />} 
                    color="#e67e22" 
                    bg="rgba(230, 126, 34, 0.15)" 
                />
                <MetricCard 
                    title="Active Products" 
                    value={stats.productCount.toLocaleString('en-IN')} 
                    icon={<FaBoxOpen />} 
                    color="#3498db" 
                    bg="rgba(52, 152, 219, 0.15)" 
                />
                <MetricCard 
                    title="Registered Users" 
                    value={stats.userCount.toLocaleString('en-IN')} 
                    icon={<FaUsers />} 
                    color="#9b59b6" 
                    bg="rgba(155, 89, 182, 0.15)" 
                />
            </div>

            {/* RECENT ORDERS SECTION */}
            <div className="glass-panel" style={{ padding: '30px', overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.2rem', fontWeight: '500' }}>Recent Transactions</h3>
                    <Link to="/orders" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>View All Orders &rarr;</Link>
                </div>

                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: '#e2e8f0' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Order ID</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Customer</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Date</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Amount</th>
                            <th style={{ padding: '15px 10px', color: '#94a3b8', fontWeight: '500' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentOrders.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No recent orders.</td></tr>
                        ) : (
                            recentOrders.map(order => {
                                const style = getStatusStyle(order.status);
                                return (
                                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px 10px', fontSize: '0.85em', color: '#94a3b8', fontFamily: 'monospace' }}>{order.id.substring(0, 10)}...</td>
                                        <td style={{ padding: '15px 10px', fontWeight: 'bold', color: '#fff' }}>{order.user?.name || 'Guest'}</td>
                                        <td style={{ padding: '15px 10px', color: '#cbd5e1' }}>{new Date(order.dateOrdered).toLocaleDateString('en-IN')}</td>
                                        <td style={{ padding: '15px 10px', color: '#2ecc71', fontWeight: 'bold' }}>₹{order.totalPrice?.toLocaleString('en-IN') || 0}</td>
                                        <td style={{ padding: '15px 10px' }}>
                                            <span style={{ backgroundColor: style.bg, color: style.color, padding: '4px 10px', borderRadius: '6px', fontSize: '0.85em', fontWeight: 'bold' }}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}