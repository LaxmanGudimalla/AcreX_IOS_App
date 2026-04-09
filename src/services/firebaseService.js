import messaging from '@react-native-firebase/messaging';

// 🔔 Request permission
export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  console.log("Permission:", enabled);

  return enabled;
}

// 📱 Get FCM token
export async function getFCMToken() {
  const token = await messaging().getToken();
  console.log("FCM TOKEN:", token);
  return token;
}