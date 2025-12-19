import RNSoundLevel from 'react-native-sound-level';
import { PermissionService } from './PermissionService';

export interface SoundLevelData {
    id: number;
    value: number; // decibels
    rawValue: number;
}

type AudioCallback = (data: SoundLevelData) => void;

class AudioMonitor {
    private isMonitoring = false;
    private listeners: AudioCallback[] = [];

    async start(): Promise<boolean> {
        const hasPermission = await PermissionService.requestMicrophonePermission();
        if (!hasPermission) {
            console.warn("Audio permission denied");
            return false;
        }

        if (this.isMonitoring) return true;

        // Monitoring interval in ms (default 250)
        (RNSoundLevel as any).monitorInterval = 250;

        RNSoundLevel.start();
        RNSoundLevel.onNewFrame = (data: SoundLevelData) => {
            this.notifyListeners(data);
        };
        this.isMonitoring = true;
        console.log("AudioMonitor started");
        return true;
    }

    stop() {
        if (!this.isMonitoring) return;
        RNSoundLevel.stop();
        this.isMonitoring = false;
        console.log("AudioMonitor stopped");
    }

    addListener(callback: AudioCallback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notifyListeners(data: SoundLevelData) {
        this.listeners.forEach(l => l(data));
    }

    isActive() {
        return this.isMonitoring;
    }
}

export const audioMonitor = new AudioMonitor();
