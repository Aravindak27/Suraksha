import { Platform } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  Permission,
} from 'react-native-permissions';

export class PermissionService {
  static async requestMicrophonePermission(): Promise<boolean> {
    const permission: Permission | null = Platform.select({
      android: PERMISSIONS.ANDROID.RECORD_AUDIO,
      ios: PERMISSIONS.IOS.MICROPHONE,
    });

    if (!permission) return false;

    const result = await check(permission);
    if (result === RESULTS.GRANTED) return true;

    const requestResult = await request(permission);
    return requestResult === RESULTS.GRANTED;
  }

  static async requestLocationPermission(): Promise<boolean> {
      const permission: Permission | null = Platform.select({
          android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE, 
      });

      if (!permission) return false;
      
      const result = await check(permission);
      if (result === RESULTS.GRANTED) return true;
      
      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
  }
  
  static async requestBackgroundPermission(): Promise<boolean> {
      // Android 10+ needs explicit background location if needed
      // And Notification permission for Android 13+
       if (Platform.OS === 'android' && Platform.Version >= 33) {
          await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
       }
       
       return true;
  }
}
