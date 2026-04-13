/**
 * @fileoverview Admin Dashboard Component.
 * Acts as the central hub for the admin panel, displaying real-time metrics,
 * revenue trends, order status distributions, and recent transactions.
 */

import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { io } from 'socket.io-client';
import { FaUserClock } from 'react-icons/fa'; 
import { 
    FaMoneyBillWave, FaClipboardList, FaBoxOpen, FaUsers, 
    FaCheckCircle, FaTimesCircle, FaChartLine, FaHourglassHalf
} from 'react-icons/fa';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

/**
 * Dashboard Component
 * @returns {JSX.Element} The rendered admin dashboard with metrics and charts.
 */
export default function Dashboard() {
    // Standardized color palette for different order statuses
    const STATUS_COLORS = {
        'Delivered': '#2ecc71', 'Processing': '#9b59b6', 'Cancelled': '#e74c3c',
        'Shipped': '#3498db', 'Pending': '#f1c40f', 'Out for Delivery': '#1abc9c', 'Default': '#95a5a6'
    };

    // --- METRIC STATES ---
    const [liveUsers, setLiveUsers] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [activeProducts, setActiveProducts] = useState(0);
    const [registeredUsers, setRegisteredUsers] = useState(0);
    const [successfulOrders, setSuccessfulOrders] = useState(0);
    const [canceledOrders, setCanceledOrders] = useState(0);
    const [processingOrders, setProcessingOrders] = useState(0);

    // --- CHART & DATA STATES ---
    const [chartData, setChartData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [statusData, setStatusData] = useState([]); 
    const [loading, setLoading] = useState(true);

    /**
     * Effect: Fetches all required dashboard metrics concurrently.
     * Uses Promise.all to optimize loading times across multiple API endpoints.
     */
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch product count, user count, and complex order aggregations simultaneously
                const [ productsRes, usersRes, dashboardRes ] = await Promise.all([
                    api.get('/products/get/count'),
                    api.get('/users/get/count'),
                    api.get('/orders/get/dashboard-stats') 
                ]);

                setActiveProducts(productsRes.data.productCount || 0);
                setRegisteredUsers(usersRes.data.userCount || 0);

                const { totalOrders, totalSales, statusCounts, dailySales, recentOrders } = dashboardRes.data;

                setTotalOrders(totalOrders);
                setTotalSales(totalSales);
                setSuccessfulOrders(statusCounts['Delivered'] || 0);
                setCanceledOrders(statusCounts['Cancelled'] || 0);
                setProcessingOrders(statusCounts['Processing'] || 0);

                // Format data for the Recharts PieChart
                const formattedStatusData = Object.keys(statusCounts).map(status => ({
                    name: status,
                    value: statusCounts[status]
                }));
                setStatusData(formattedStatusData); 

                // Format data for the Recharts AreaChart
                let formattedChartData = dailySales.map(day => ({
                    date: day._id,
                    Sales: day.totalSales
                }));

                // Handle edge cases for chart rendering (ensures lines draw correctly even with limited data)
                if (formattedChartData.length === 1) {
                    formattedChartData = [{ date: "Previous", Sales: 0 }, formattedChartData[0]];
                } else if (formattedChartData.length === 0) {
                    formattedChartData = [{ date: "No Data", Sales: 0 }];
                }

                setChartData(formattedChartData);
                setRecentOrders(recentOrders);
            } catch (error) {
                toast.error("Failed to load dashboard metrics");
            } finally {
                setLoading(false);
            }
        };    

        fetchDashboardData();
    }, []);

    /**
     * Effect: Initializes WebSocket connection for real-time live user tracking.
     */
    useEffect(() => {
        // Dynamically connect to the base URL of the backend
        const baseUrl = import.meta.env.VITE_API_URL 
            ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
            : 'http://localhost:3000';
            
        const socket = io(baseUrl);

        // Listen for broadcasts from the server regarding active connections
        socket.on('liveUsersUpdate', (count) => {
            setLiveUsers(count);
        });

        // Cleanup the socket connection to prevent memory leaks when navigating away
        return () => {
            socket.disconnect();
        };
    }, []);

    /**
     * Determines the visual styling for an order status badge.
     * @param {string} status - The current status of the order.
     * @returns {Object} An object containing the background, text, and border colors.
     */
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

    return (
        <div style={{ padding: '40px 40px 40px 20px' }}>
            <h1 style={{ marginBottom: '10px', color: '#fff', fontWeight: '300', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <FaChartLine style={{ color: '#2ecc71' }} /> Overview
            </h1>
            <p style={{ color: '#94a3b8', marginBottom: '40px' }}>Welcome to the JGM Industries administration panel.</p>

            {loading ? (
                <Loader message="Aggregating Store Data..." />
            ) : (
                <>
                    {/* --- KPI CARDS ROW --- */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    
                        <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '3px solid #2ECC71' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '12px', backgroundColor: 'rgba(46, 204, 113, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem', color: '#2ecc71' }}><FaMoneyBillWave /></div>
                            <div>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Sales</p>
                                <h2 style={{ margin: '5px 0 0 0', color: '#fff', fontSize: '2rem' }}>₹{totalSales.toLocaleString('en-IN')}</h2>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '3px solid #F39C12' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '12px', backgroundColor: 'rgba(243, 156, 18, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem', color: '#f39c12' }}><FaClipboardList /></div>
                            <div>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Orders</p>
                                <h2 style={{ margin: '5px 0 0 0', color: '#fff', fontSize: '2rem' }}>{totalOrders}</h2>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '3px solid #2ecc71' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '12px', backgroundColor: 'rgba(46, 204, 113, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem', color: '#2ecc71' }}><FaCheckCircle /></div>
                            <div>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Successful</p>
                                <h2 style={{ margin: '5px 0 0 0', color: '#fff', fontSize: '2rem' }}>{successfulOrders}</h2>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '3px solid #9b59b6' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '12px', backgroundColor: 'rgba(155, 89, 182, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem', color: '#9b59b6' }}><FaHourglassHalf /></div>
                            <div>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Processing</p>
                                <h2 style={{ margin: '5px 0 0 0', color: '#fff', fontSize: '2rem' }}>{processingOrders}</h2>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '3px solid #e74c3c' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '12px', backgroundColor: 'rgba(231, 76, 60, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem', color: '#e74c3c' }}><FaTimesCircle /></div>
                            <div>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Canceled</p>
                                <h2 style={{ margin: '5px 0 0 0', color: '#fff', fontSize: '2rem' }}>{canceledOrders}</h2>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '3px solid #3498DB' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '12px', backgroundColor: 'rgba(52, 152, 219, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem', color: '#3498db' }}><FaBoxOpen /></div>
                            <div>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Products</p>
                                <h2 style={{ margin: '5px 0 0 0', color: '#fff', fontSize: '2rem' }}>{activeProducts}</h2>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '3px solid #6C5CE7' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '12px', backgroundColor: 'rgba(108, 92, 231, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem', color: '#6c5ce7' }}><FaUsers /></div>
                            <div>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Registered Users</p>
                                <h2 style={{ margin: '5px 0 0 0', color: '#fff', fontSize: '2rem' }}>{registeredUsers}</h2>
                            </div>
                        </div>

                        {/* Live Active Users Card (WebSocket Driven) */}
                        <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '3px solid #e84393' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '12px', backgroundColor: 'rgba(232, 67, 147, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem', color: '#e84393' }}>
                                <FaUserClock />
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Users</p>
                                    {/* Pulsing red dot indicator */}
                                    <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#e74c3c', borderRadius: '50%', boxShadow: '0 0 8px #e74c3c', animation: 'pulse 1.5s infinite' }}></span>
                                </div>
                                <h2 style={{ margin: '5px 0 0 0', color: '#fff', fontSize: '2rem' }}>{liveUsers}</h2>
                            </div>
                            
                            {/* CSS for the pulsing dot */}
                            <style>
                                {`
                                @keyframes pulse {
                                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
                                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
                                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
                                }
                                `}
                            </style>
                        </div>
                    </div>

                    {/* --- CHARTS ROW --- */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                        
                        {/* Revenue Trend Area Chart */}
                        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#e2e8f0', fontSize: '1.2rem', fontWeight: '500' }}>Revenue Trend (Last 14 Active Days)</h3>
                            {chartData.length === 0 ? (
                                <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>No sales data available.</div>
                            ) : (
                                <div style={{ width: '100%', height: 350, flexGrow: 1 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#2ecc71" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickMargin={10} />
                                            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} width={60} />
                                            <Tooltip contentStyle={{ backgroundColor: '#16213e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#2ecc71', fontWeight: 'bold' }} />
                                            <Area type="monotone" dataKey="Sales" stroke="#2ecc71" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        {/* Order Status Distribution Pie Chart */}
                        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#e2e8f0', fontSize: '1.2rem', fontWeight: '500' }}>Order Status Distribution</h3>
                            {statusData.length === 0 ? (
                                <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>No status data available.</div>
                            ) : (
                                <div style={{ width: '100%', height: 350, flexGrow: 1 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={110}
                                                fill="#8884d8"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                labelLine={true}
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || STATUS_COLORS['Default']} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#16213e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                            <Legend iconType="circle" wrapperStyle={{ color: '#fff' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- RECENT TRANSACTIONS TABLE --- */}
                    <div className="glass-panel" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.2rem', fontWeight: '500' }}>Recent Transactions</h3>
                            <a href="/orders" style={{ color: '#3498db', textDecoration: 'none', fontSize: '0.9rem' }}>View All Orders &rarr;</a>
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
                                    <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No recent orders.</td></tr>
                                ) : (
                                    recentOrders.map((order) => {
                                        const statusStyle = getStatusStyle(order.status);
                                        return (
                                            <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '15px 10px', fontSize: '0.85em', color: '#94a3b8', fontFamily: 'monospace' }}>
                                                    {order.id.substring(order.id.length - 8).toUpperCase()}
                                                </td>
                                                <td style={{ padding: '15px 10px', fontWeight: 'bold', color: '#fff' }}>
                                                    {order.user ? order.user.name : 'Guest'}
                                                </td>
                                                <td style={{ padding: '15px 10px', color: '#cbd5e1' }}>
                                                    {new Date(order.dateOrdered).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '15px 10px', color: '#2ecc71', fontWeight: 'bold' }}>
                                                    ₹{order.totalPrice?.toLocaleString('en-IN')}
                                                </td>
                                                <td style={{ padding: '15px 10px' }}>
                                                    <span style={{ 
                                                        padding: '4px 10px', borderRadius: '4px', border: `1px solid ${statusStyle.border}`,
                                                        backgroundColor: statusStyle.bg, color: statusStyle.color, fontWeight: 'bold', fontSize: '0.85em'
                                                    }}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}