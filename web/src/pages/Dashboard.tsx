import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudioMonitor } from '../hooks/useAudioMonitor';
import { useLocation } from '../hooks/useLocation';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { useNavigate } from 'react-router-dom';

import '../App.css';
import '../map.css';
import { SafetyMap } from '../components/SafetyMap';

export const Dashboard = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    // Lower threshold to 50 for testing
    const { start, stop, isMonitoring, stats, analyser } = useAudioMonitor(25);
    const { location, error: locationError } = useLocation(stats.isEmergency);

    const [alertStatus, setAlertStatus] = useState<'idle' | 'warning' | 'sending' | 'sent' | 'failed' | 'resolved'>('idle');
    const [manualEmergency, setManualEmergency] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
    const [locationSynced, setLocationSynced] = useState(false);
    const [showMap, setShowMap] = useState(false);

    // Sync Location to Backend Profile
    useEffect(() => {
        if (location && token && !locationSynced) {
            fetch('http://10.12.98.111:5000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ location })
            })
                .then(res => {
                    if (res.ok) {
                        setLocationSynced(true);
                        console.log("Location successfully synced to Cloud");
                    }
                })
                .catch(console.error);
        }
    }, [location, token, locationSynced]);

    useEffect(() => {
        let timer: any;
        // 1. Detected High Sound -> Start Warning Countdown
        if (stats.isEmergency && alertStatus === 'idle' && !manualEmergency) {
            setAlertStatus('warning');
            setCountdown(10);
        }

        // 2. Countdown Logic
        if (alertStatus === 'warning') {
            if (countdown > 0) {
                timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            } else {
                // 3. Time's up -> Send Alert
                triggerEmergencyAPI();
            }
        }

        // 4. Reset if system stops
        // Only reset if we are not in a final state (sent/resolved/failed) and not sending
        if (!stats.isEmergency && !manualEmergency && ['idle', 'warning'].includes(alertStatus)) {
            setAlertStatus('idle');
            setCountdown(10);
        }

        return () => clearTimeout(timer);
    }, [stats.isEmergency, alertStatus, countdown, manualEmergency]);


    const triggerEmergencyAPI = async () => {
        if (!token) return;
        // Prevent multiple calls if already sending or sent/resolved
        if (alertStatus === 'sending' || alertStatus === 'sent' || alertStatus === 'resolved') return;

        setAlertStatus('sending');
        console.log("TRIGGERING EMERGENCY API...");

        const payloadLocation = location || { lat: 0, lng: 0, accuracy: 0 };

        try {
            const res = await fetch('http://10.12.98.111:5000/api/emergency/trigger', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    decibelLevel: stats.db > 0 ? stats.db : 100,
                    location: payloadLocation
                })
            });

            if (res.ok) {
                const data = await res.json();
                setActiveIncidentId(data.incidentId);
                setAlertStatus('sent');
            } else {
                setAlertStatus('failed');
            }
        } catch (e) {
            console.error(e);
            setAlertStatus('failed');
        }
    };

    const markAsSafe = async () => {
        if (!activeIncidentId || !token) return;
        try {
            await fetch(`http://10.12.98.111:5000/api/emergency/resolve/${activeIncidentId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlertStatus('resolved');
            setManualEmergency(false);
            if (isMonitoring) stop();
            // Removed auto-reset to allow user to answer safety question
        } catch (e) {
            console.error(e);
            alert("Failed to mark as safe. Try again.");
        }
    };

    const handleReportUnsafe = async () => {
        if (!location || !token) return;
        try {
            await fetch('http://10.12.98.111:5000/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    lat: location.lat,
                    lng: location.lng,
                    type: 'unsafe',
                    description: 'Reported by user after emergency alert'
                })
            });
            alert("Location marked as UNSAFE in Heatmap.");
            dismissCompletedAlert();
        } catch (e) {
            console.error(e);
        }
    };

    const handleManualSOS = () => {
        setManualEmergency(true);
        triggerEmergencyAPI(); // Manual SOS skips countdown
    };

    const cancelAlert = () => {
        setAlertStatus('idle');
        setCountdown(10);
        if (stats.isEmergency) stop(); // Stop monitoring to prevent immediate re-trigger
    };

    const dismissCompletedAlert = () => {
        if (isMonitoring) stop();
        setManualEmergency(false);
        setAlertStatus('idle');
    };

    const toggleMonitoring = () => {
        if (isMonitoring) stop();
        else start();
    };

    const isEmergencyActive = (stats.isEmergency && alertStatus !== 'idle') || manualEmergency || alertStatus === 'sent' || alertStatus === 'resolved';

    return (
        <div className={`app-container ${isEmergencyActive ? 'emergency-mode' : ''}`}>
            <header>
                <h1>🛡️ SURAKSHA</h1>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div className="status-badge">
                        {isEmergencyActive ? '⚠️ EMERGENCY' : isMonitoring ? '🟢 PROTECTION ON' : '⚪ IDLE'}
                    </div>
                    {/* History Button */}
                    <button onClick={() => navigate('/history')} className="small-btn" style={{ width: 'auto', padding: '5px 15px', background: '#3b82f6' }}>
                        📜 History
                    </button>
                    {/* Community Button */}
                    <button onClick={() => navigate('/community')} className="small-btn" style={{ width: 'auto', padding: '5px 15px', background: '#8b5cf6' }}>
                        🌍 Community
                    </button>
                    {/* Safety Map Button */}
                    <button onClick={() => setShowMap(true)} className="small-btn" style={{ width: 'auto', padding: '5px 15px', background: '#dc2626' }}>
                        🔥 Unsafe Areas
                    </button>
                    <button onClick={() => navigate('/profile')} className="small-btn" style={{ width: 'auto', padding: '5px 15px', fontSize: '1rem' }}>
                        👤 {user?.name}
                    </button>
                </div>
            </header>

            {/* Safety Map Modal */}
            {showMap && <SafetyMap userLocation={location} onClose={() => setShowMap(false)} token={token} />}

            <main>
                <div className="dashboard-grid">
                    {/* Left: Stats */}
                    <div className="card stats-card">
                        <h2>Sound Level</h2>
                        <div className="db-meter">
                            <span className="db-value">{stats.db.toFixed(1)}</span>
                            <span className="db-unit">dB</span>
                        </div>

                        <button
                            className={`action-btn ${isMonitoring ? 'stop-btn' : 'start-btn'}`}
                            onClick={toggleMonitoring}
                        >
                            {isMonitoring ? 'STOP SYSTEM' : 'ACTIVATE SYSTEM'}
                        </button>

                        <button
                            className="sos-btn"
                            onClick={handleManualSOS}
                            title="Trigger Immediate Panic Alert"
                        >
                            🆘 SOS
                        </button>
                    </div>

                    {/* Right: Info */}
                    <div className="card map-card">
                        <h2>Live Info</h2>

                        <div className="info-section">
                            <h3>📍 Location</h3>
                            {location ? (
                                <p className="mono-text">
                                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)} <br />
                                    <span className="accuracy-badge">Accuracy: {location.accuracy.toFixed(0)}m</span>
                                    <br />
                                    {locationSynced && <span style={{ color: '#10b981', fontSize: '0.8rem' }}>☁️ Synced to Cloud</span>}
                                </p>
                            ) : (
                                <p className="waiting-text">{locationError || "Waiting for coordinates..."}</p>
                            )}
                        </div>

                        <div className="info-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h3>📞 Contacts</h3>
                                <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}>Edit</button>
                            </div>
                            <ul className="contacts-list">
                                {user?.emergencyContacts.map((c, i) => (
                                    <li key={i}>
                                        {c.name}
                                    </li>
                                ))}
                                {(!user?.emergencyContacts || user.emergencyContacts.length === 0) && <p>No contacts set.</p>}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="visualizer-container">
                    <AudioVisualizer analyser={analyser} isMonitoring={isMonitoring} />
                </div>
            </main>

            {isEmergencyActive && (
                <div className="emergency-overlay">
                    {alertStatus === 'warning' ? (
                        <>
                            <h1 style={{ animation: 'none', color: 'orange' }}>⚠️ HIGH NOISE DETECTED</h1>
                            <div style={{ fontSize: '5rem', fontWeight: 'bold', margin: '20px 0' }}>{countdown}</div>
                            <p>Alerting contacts in {countdown} seconds...</p>
                            <button onClick={cancelAlert} className="start-btn" style={{ background: '#10b981', marginTop: '20px' }}>
                                I AM SAFE (CANCEL)
                            </button>
                        </>
                    ) : alertStatus === 'resolved' ? (
                        <>
                            <h1 style={{ color: '#10b981' }}>✅ SAFE</h1>
                            <p>Emergency marked as resolved.</p>

                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '10px', marginTop: '20px' }}>
                                <h3 style={{ margin: '0 0 15px 0' }}>Was this location Unsafe?</h3>
                                <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>Help the community by flagging this Red Zone.</p>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <button onClick={handleReportUnsafe} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
                                        YES, IT'S UNSAFE
                                    </button>
                                    <button onClick={dismissCompletedAlert} style={{ background: '#64748b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
                                        NO, JUST TESTING
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h1>🚨 EMERGENCY DETECTED 🚨</h1>
                            <p>
                                {manualEmergency ? "MANUAL SOS TRIGGERED" : `High decibel sound detected (${stats.db.toFixed(0)} dB)`}
                            </p>

                            {location && <div className="loc-box" style={{ fontSize: '1.5rem', margin: '20px 0', color: 'white' }}>
                                📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                            </div>}

                            {alertStatus === 'sending' && <p style={{ fontSize: '1.5rem', color: 'yellow' }}>⏳ SENDING ALERTS...</p>}
                            {alertStatus === 'sent' && (
                                <div className="sms-sent-box">
                                    ✅ ALERTS EMAILED TO {user?.emergencyContacts.length} CONTACTS
                                    <br />
                                    (Also notifying nearby users within 10km)
                                </div>
                            )}

                            {alertStatus === 'sent' && (
                                <button onClick={markAsSafe} className="start-btn" style={{ background: '#10b981', marginTop: '30px', padding: '20px' }}>
                                    ✅ I AM SAFE NOW
                                </button>
                            )}

                            {alertStatus === 'failed' && <p style={{ color: 'red' }}>❌ FAILED TO SEND ALERTS</p>}

                            <button onClick={dismissCompletedAlert} style={{ marginTop: '20px' }}>DISMISS ALERT</button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
