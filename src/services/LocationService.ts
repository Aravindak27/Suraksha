import Geolocation from 'react-native-geolocation-service';
import { PermissionService } from './PermissionService';

export interface Coordinates {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
}

class LocationService {
    async getCurrentLocation(): Promise<Coordinates | null> {
        const hasPermission = await PermissionService.requestLocationPermission();
        if (!hasPermission) {
            console.warn("Location permission denied");
            return null;
        }

        return new Promise((resolve) => {
            Geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp,
                    });
                },
                (error) => {
                    console.error("Location error", error);
                    resolve(null);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        });
    }
}

export const locationService = new LocationService();
