import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { useEmergencyStore } from '../services/EmergencyManager';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const EmergencyScreen = ({ navigation }: any) => {
    const { status, cancelEmergency, location } = useEmergencyStore();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (status !== 'EMERGENCY_TRIGGERED') {
            navigation.goBack();
        }
    }, [status]);

    // Simulate SOS visual
    useEffect(() => {
        // Vibration.vibrate([1000, 1000], true); // Android loop
        // return () => Vibration.cancel();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.alertBox}>
                <Text style={styles.alertTitle}>EMERGENCY DETECTED</Text>
                <Text style={styles.alertDesc}>High decibel sound detected.</Text>

                {location && (
                    <Text style={styles.locationText}>
                        Loc: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </Text>
                )}
            </View>

            <TouchableOpacity style={styles.cancelButton} onPress={cancelEmergency}>
                <Text style={styles.cancelText}>I AM SAFE (CANCEL)</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FF0000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    alertBox: {
        alignItems: 'center',
        marginBottom: 50,
    },
    alertTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 20,
    },
    alertDesc: {
        fontSize: 18,
        color: '#FFEEEE',
        textAlign: 'center',
    },
    locationText: {
        marginTop: 20,
        fontSize: 14,
        color: '#FFDDDD',
        fontFamily: 'monospace',
    },
    cancelButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 40,
        paddingVertical: 20,
        borderRadius: 50,
        width: '100%',
        alignItems: 'center',
    },
    cancelText: {
        color: '#FF0000',
        fontSize: 20,
        fontWeight: 'bold',
    }
});
