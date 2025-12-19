import { useState, useEffect } from 'react';
import { Geolocation as CapacitorGeolocation } from '@capacitor/geolocation';

export interface WebCoordinates {
    lat: number;
    lng: number;
    accuracy: number;
}

export const useLocation = (isEmergency: boolean) => {
    const [location, setLocation] = useState<WebCoordinates | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let watchId: string;

        const startTracking = async () => {
            try {
                // Request permissions first
                const perm = await CapacitorGeolocation.checkPermissions();
                if (perm.location !== 'granted') {
                    const req = await CapacitorGeolocation.requestPermissions();
                    if (req.location !== 'granted') {
                        setError("Location permission denied");
                        return;
                    }
                }

                if (isEmergency) {
                    // Continuous tracking
                    watchId = await CapacitorGeolocation.watchPosition({
                        enableHighAccuracy: true,
                        timeout: 30000,
                        maximumAge: 0
                    }, (position: any, err: any) => {
                        if (err) {
                            setError(err.message);
                            console.error("Watch Error:", err);
                        } else if (position) {
                            setLocation({
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                                accuracy: position.coords.accuracy
                            });
                            setError(null);
                        }
                    });
                    console.log("Started watching position:", watchId);
                } else {
                    // One-time get
                    const position = await CapacitorGeolocation.getCurrentPosition({
                        enableHighAccuracy: true,
                        timeout: 30000,
                        maximumAge: 5000 // Allow cached
                    });
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                    setError(null);
                }
            } catch (err: any) {
                console.error("Geolocation Error:", err);
                setError(err.message || "Failed to get location");
            }
        };

        startTracking();

        return () => {
            if (watchId) CapacitorGeolocation.clearWatch({ id: watchId });
        };
    }, [isEmergency]);

    return { location, error };
};
