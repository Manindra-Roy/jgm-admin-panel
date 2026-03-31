// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    // Inside src/pages/Login.jsx, update handleLogin:
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/users/login', { email, password });
            
            // Set a simple flag so React knows we are logged in
            localStorage.setItem('is_authenticated', 'true');
            // Clean up the old insecure token just in case!
            localStorage.removeItem('jgm_admin_token'); 
            
            navigate('/');
        } catch (err) {
            setError('Invalid email or password. Access Denied.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a1a2e' }}>
            <div style={{ backgroundColor: '#16213e', padding: '40px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '100%', maxWidth: '400px' }}>
                <h1 style={{ color: '#fff', textAlign: 'center', marginBottom: '30px' }}>JGM Admin Portal</h1>
                
                {error && <div style={{ backgroundColor: '#e74c3c', color: 'white', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
                
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ color: '#a2a2bd', display: 'block', marginBottom: '5px' }}>Admin Email</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '4px', border: 'none', backgroundColor: '#0f3460', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ color: '#a2a2bd', display: 'block', marginBottom: '5px' }}>Password</label>
                        <input 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '4px', border: 'none', backgroundColor: '#0f3460', color: 'white' }}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ padding: '12px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px' }}
                    >
                        {loading ? 'Authenticating...' : 'Secure Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}