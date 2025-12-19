import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';

interface Incident {
    _id: string;
    timestamp: string;
    decibelLevel: number;
    location: {
        lat: number;
        lng: number;
    };
    notifiedContacts: boolean;
    status: string;
    notifiedCommunity: Array<{ name: string, email: string }>;
}

export const History = () => {
    const { token } = useAuth(); // Need to expose token in context
    const navigate = useNavigate();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data if no API yet, or fetch if API ready
        // For now, we mock to show UI until AuthContext is upgraded
        // setIncidents([...]); 
        // setLoading(false);

        const fetchHistory = async () => {
            try {
                const res = await fetch('http://10.12.98.111:5000/api/emergency/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setIncidents(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchHistory();
        else setLoading(false);

    }, [token]);

    return (
        <div className="app-container">
            <header>
                <h1>📜 PAST HISTORY</h1>
                <button onClick={() => navigate('/dashboard')} className="small-btn" style={{ width: 'auto', padding: '10px 20px' }}>
                    BACK TO DASHBOARD
                </button>
            </header>

            <main>
                <div className="card" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    {loading ? <p>Loading history...</p> : (
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #334155' }}>
                                    <th style={{ padding: '10px' }}>Date/Time</th>
                                    <th style={{ padding: '10px' }}>Details</th>
                                    <th style={{ padding: '10px' }}>Location</th>
                                    <th style={{ padding: '10px' }}>Alerts</th>
                                    <th style={{ padding: '10px' }}>Community Notified</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incidents.length === 0 ? (
                                    <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No incidents recorded.</td></tr>
                                ) : incidents.map(inc => (
                                    <tr key={inc._id} style={{ borderBottom: '1px solid #1e293b' }}>
                                        <td style={{ padding: '10px' }}>{new Date(inc.timestamp).toLocaleString()}</td>
                                        <td style={{ padding: '10px' }}>
                                            {inc.decibelLevel} dB <br />
                                            <span style={{ fontSize: '0.8rem', color: inc.status === 'resolved' ? '#10b981' : '#f43f5e' }}>
                                                {inc.status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <a
                                                href={`https://www.google.com/maps?q=${inc.location.lat},${inc.location.lng}`}
                                                target="_blank"
                                                style={{ color: '#60a5fa' }}
                                            >
                                                View Map
                                            </a>
                                        </td>
                                        <td style={{ padding: '10px' }}>{inc.notifiedContacts ? '✅ Sent' : '❌ Failed'}</td>
                                        <td style={{ padding: '10px' }}>
                                            {inc.notifiedCommunity && inc.notifiedCommunity.length > 0 ? (
                                                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                                    {inc.notifiedCommunity.map((u: any, i: number) => (
                                                        <li key={i}>{u.name}</li>
                                                    ))}
                                                </ul>
                                            ) : <span style={{ color: '#64748b' }}>None</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};
