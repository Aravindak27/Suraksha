import { create } from 'zustand';
import { audioMonitor, SoundLevelData } from './AudioMonitor';
import { locationService, Coordinates } from './LocationService';
import { navigate } from '../utils/NavigationUtils';

// Types
type EmergencyStatus = 'NORMAL' | 'MONITORING' | 'EMERGENCY_TRIGGERED';

interface EmergencyState {
    status: EmergencyStatus;
    currentDb: number;
    threshold: number;
    location: Coordinates | null;
    setStatus: (status: EmergencyStatus) => void;
    setDb: (db: number) => void;
    setThreshold: (db: number) => void;
    triggerEmergency: () => void;
    cancelEmergency: () => void;
}

// Zustand Store for UI
export const useEmergencyStore = create<EmergencyState>((set, get) => ({
    status: 'NORMAL',
    currentDb: 0,
    threshold: 80, // Default threshold dB
    location: null,
    setStatus: (status) => set({ status }),
    setDb: (db) => set({ currentDb: db }),
    setThreshold: (threshold) => set({ threshold }),
    triggerEmergency: async () => {
        const { status } = get();
        if (status === 'EMERGENCY_TRIGGERED') return;

        console.warn("EMERGENCY TRIGGERED!");
        set({ status: 'EMERGENCY_TRIGGERED' });

        // Navigation to Emergency Screen
        navigate('Emergency');

        // Actions
        // 1. Get Location
        const loc = await locationService.getCurrentLocation();
        if (loc) {
            set({ location: loc });
            console.log("Emergency Location:", loc);
        }

        // 2. Play Sound / Send SMS (TODO)
    },
    cancelEmergency: () => {
        set({ status: 'MONITORING', location: null });
        console.log("Emergency Cancelled");
    }
}));

// Logic Class (Singleton) to bind Audio to Store
class EmergencyLogic {
    private consecutiveLoudFrames = 0;
    private REQUIRED_FRAMES = 5; // e.g., if 250ms interval, 5 frames = 1.25s

    startMonitoring() {
        const store = useEmergencyStore.getState();
        store.setStatus('MONITORING');

        audioMonitor.addListener(this.onAudioData);
    }

    stopMonitoring() {
        useEmergencyStore.getState().setStatus('NORMAL');
        // We might want to remove listener, but AudioMonitor handles own listeners cleanup if we wanted
        // Actually, we pass method reference, so we need to be careful with binding or removeListener return
        // Ideally we keep listening but ignore logic, but better to unsubsribe
    }

    private onAudioData = (data: SoundLevelData) => {
        const store = useEmergencyStore.getState();
        store.setDb(data.value);

        if (store.status !== 'MONITORING') return;

        if (data.value >= store.threshold) {
            this.consecutiveLoudFrames++;
            if (this.consecutiveLoudFrames >= this.REQUIRED_FRAMES) {
                store.triggerEmergency();
                this.consecutiveLoudFrames = 0;
            }
        } else {
            this.consecutiveLoudFrames = 0;
        }
    };
}

export const emergencyLogic = new EmergencyLogic();
