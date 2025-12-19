import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../App.css'; // Ensure you have some basic map styles if needed

// Fix Leaflet Marker Icons in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface SafetyMapProps {
    userLocation: { lat: number; lng: number } | null;
    onClose: () => void;
    token: string | null;
}

export const SafetyMap = ({ userLocation, onClose, token }: SafetyMapProps) => {
    const [reports, setReports] = useState<any[]>([]);

    useEffect(() => {
        if (!token) return;
        fetch('http://10.12.98.111:5000/api/reports', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setReports(data))
            .catch(console.error);
    }, [token]);

    const center = userLocation ? [userLocation.lat, userLocation.lng] : [13.0827, 80.2707]; // Default Chennai

    return (
        <div className="modal-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000 }}>
            <div className="map-modal" style={{ width: '90%', height: '80%', background: 'white', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                <header style={{ padding: '10px 20px', background: '#dc2626', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>🔥 Safety Heatmap (Red Zones)</h3>
                    <button onClick={onClose} style={{ background: 'white', color: '#dc2626', border: 'none', padding: '5px 15px', cursor: 'pointer', fontWeight: 'bold' }}>CLOSE</button>
                </header>

                <div style={{ height: 'calc(100% - 50px)' }}>
                    {/* @ts-ignore */}
                    <MapContainer center={center as any} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* User Location */}
                        {userLocation && (
                            /* @ts-ignore */
                            <Marker position={[userLocation.lat, userLocation.lng]}>
                                <Popup>You are Here</Popup>
                            </Marker>
                        )}

                        {/* Red Zones from Reports */}
                        {reports.map((r, i) => (
                            /* @ts-ignore */
                            <Circle
                                key={i}
                                center={[r.location.coordinates[1], r.location.coordinates[0]]}
                                radius={300} // 300m radius
                                pathOptions={{ color: 'red', fillColor: '#f87171', fillOpacity: 0.5 }}
                            >
                                <Popup>
                                    <strong>UNSAFE AREA reported!</strong><br />
                                    {r.description}
                                </Popup>
                            </Circle>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};
