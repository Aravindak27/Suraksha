import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../hooks/useLocation';
import '../App.css';

interface CommunityUser {
    _id: string;
    name: string;
    location: {
        coordinates: [number, number]; // [lng, lat]
    };
    distance: number;
}

export const Community = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { location } = useLocation(false); // Get current location once
    const [nearbyUsers, setNearbyUsers] = useState<CommunityUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!location || !token) return;

        const fetchNearby = async () => {
            try {
                const res = await fetch(`http://10.12.98.111:5000/api/community/nearby?lat=${location.lat}&lng=${location.lng}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setNearbyUsers(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNearby();
    }, [location, token]);

    return (
        <div className="app-container">
            <header>
                <h1>🌍 COMMUNITY WATCH</h1>
                <button onClick={() => navigate('/dashboard')} className="small-btn" style={{ width: 'auto', padding: '10px 20px' }}>
                    BACK TO DASHBOARD
                </button>
            </header>

            <main>
                <div className="card" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <h2>All Users (Sorted by Distance)</h2>
                    {location && <p className="mono-text" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Your Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>}

                    {loading ? <p>Scanning global network...</p> : (
                        !location ? <p>Waiting for your location to calculate distances...</p> :
                            nearbyUsers.length === 0 ? (
                                <p style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                    No other users found.
                                </p>
                            ) : (
                                <ul className="contacts-list">
                                    {nearbyUsers.map(u => (
                                        <li key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0' }}>
                                            <div>
                                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>👤 {u.name}</span>
                                                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '5px' }}>
                                                    Details: {(u.distance / 1000).toFixed(2)} km away
                                                </div>
                                                <div className="mono-text" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                    [{u.location.coordinates[1].toFixed(4)}, {u.location.coordinates[0].toFixed(4)}]
                                                </div>
                                            </div>
                                            <a
                                                href={`https://www.google.com/maps?q=${u.location.coordinates[1]},${u.location.coordinates[0]}`}
                                                target="_blank"
                                                className="small-btn"
                                                style={{ textDecoration: 'none', background: '#3b82f6', fontSize: '0.9rem', width: 'auto' }}
                                            >
                                                📍 View on Map
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )
                    )}
                </div>
            </main>
        </div>
    );
};
