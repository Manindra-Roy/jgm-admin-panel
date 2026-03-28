// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaShoppingCart, FaMoneyBillWave, FaUsers } from 'react-icons/fa';

export default function Dashboard() {
    const [stats, setStats] = useState({ totalSales: 0, orderCount: 0, userCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [salesRes, ordersRes, usersRes] = await Promise.all([
                    api.get('/orders/get/totalsales'),
                    api.get('/orders/get/count'),
                    api.get('/users/get/count')
                ]);
                setStats({
                    totalSales: salesRes.data.totalsales || 0,
                    orderCount: ordersRes.data.orderCount || 0,
                    userCount: usersRes.data.userCount || 0
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const GlassCard = ({ title, value, icon, color }) => (
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: '280px' }}>
            <div>
                <h4 style={{ color: '#94a3b8', margin: '0 0 10px 0', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h4>
                <h2 style={{ margin: 0, color: '#fff', fontSize: '2.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{value}</h2>
            </div>
            <div style={{ backgroundColor: `rgba(${color}, 0.2)`, color: `rgb(${color})`, padding: '20px', borderRadius: '50%', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid rgba(${color}, 0.3)`, boxShadow: `0 0 20px rgba(${color}, 0.2)` }}>
                {icon}
            </div>
        </div>
    );

    if (loading) return <h2 style={{ padding: '40px', color: 'white' }}>Loading Analytics...</h2>;

    return (
        <div style={{ padding: '40px 40px 40px 20px' }}>
            <h1 style={{ marginBottom: '40px', color: '#fff', fontWeight: '300', fontSize: '2.5rem' }}>Dashboard Overview</h1>
            
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                <GlassCard 
                    title="Total Revenue" 
                    value={`₹${stats.totalSales.toLocaleString('en-IN')}`} 
                    icon={<FaMoneyBillWave />} 
                    color="46, 204, 113" /* Emerald Green RGB */
                />
                <GlassCard 
                    title="Total Orders" 
                    value={stats.orderCount.toLocaleString('en-IN')} 
                    icon={<FaShoppingCart />} 
                    color="52, 152, 219" /* Peter River Blue RGB */
                />
                <GlassCard 
                    title="Registered Users" 
                    value={stats.userCount.toLocaleString('en-IN')} 
                    icon={<FaUsers />} 
                    color="155, 89, 182" /* Amethyst Purple RGB */
                />
            </div>
        </div>
    );
}