// src/components/Loader.jsx
export default function Loader({ message = "Loading..." }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', width: '100%' }}>
            <style>
                {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .glass-spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(255, 255, 255, 0.1);
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 15px;
                }
                `}
            </style>
            <div className="glass-spinner"></div>
            <p style={{ color: '#94a3b8', fontWeight: '500', letterSpacing: '1px' }}>{message}</p>
        </div>
    );
}