import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useEmergencyStore, emergencyLogic } from '../services/EmergencyManager';
import { backgroundMonitor } from '../services/BackgroundMonitor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const HomeScreen = ({ navigation }: any) => {
    const { status, currentDb, threshold } = useEmergencyStore();
    const insets = useSafeAreaInsets();

    // Auto-navigate to Emergency Screen
    useEffect(() => {
        if (status === 'EMERGENCY_TRIGGERED') {
            navigation.navigate('Emergency');
        }
    }, [status, navigation]);

    const toggleMonitoring = async () => {
        if (status === 'MONITORING') {
            // Stop
            await backgroundMonitor.stop();
            emergencyLogic.stopMonitoring();
        } else {
            // Start
            await backgroundMonitor.start();
            emergencyLogic.startMonitoring();
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Suraksha</Text>
                <Text style={styles.subtitle}>Passive Safety Monitor</Text>
            </View>

            <View style={styles.meterContainer}>
                <View style={[styles.circle, status === 'MONITORING' ? styles.activeCircle : styles.inactiveCircle]}>
                    <Text style={styles.dbText}>{currentDb.toFixed(1)} dB</Text>
                    <Text style={styles.statusText}>{status}</Text>
                </View>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>Threshold: {threshold} dB</Text>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.button, status === 'MONITORING' ? styles.stopButton : styles.startButton]}
                    onPress={toggleMonitoring}
                >
                    <Text style={styles.buttonText}>
                        {status === 'MONITORING' ? 'STOP PROTECTION' : 'ACTIVATE PROTECTION'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 40,
    },
    header: {
        marginTop: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 16,
        color: '#888888',
        marginTop: 5,
    },
    meterContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        width: 250,
        height: 250,
        borderRadius: 125,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
    },
    activeCircle: {
        borderColor: '#00FF9D',
        shadowColor: '#00FF9D',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    inactiveCircle: {
        borderColor: '#333333',
    },
    dbText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFF',
    },
    statusText: {
        fontSize: 14,
        color: '#AAA',
        marginTop: 10,
        letterSpacing: 1,
    },
    infoContainer: {
        padding: 10,
    },
    infoText: {
        color: 'gray',
    },
    controls: {
        width: '80%',
    },
    button: {
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
    },
    startButton: {
        backgroundColor: '#00FF9D',
    },
    stopButton: {
        backgroundColor: '#FF4444',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        letterSpacing: 1,
    }
});
