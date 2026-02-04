import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '../store/auth';
import { 
  setupNotificationHandler, 
  handleNotificationResponse,
  registerForPushNotifications 
} from '../lib/notifications';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { session, user, initialized, loading, initialize } = useAuthStore();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, []);

  // Setup notifications
  useEffect(() => {
    // Set up notification handler
    setupNotificationHandler();

    // Register for push notifications if user is logged in
    if (user?.id) {
      registerForPushNotifications(user.id);
    }

    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for user tapping on notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      handleNotificationResponse(response, router);
    });

    // Cleanup
    return () => {
      if (notificationListener.current && notificationListener.current.remove) {
        notificationListener.current.remove();
      }
      if (responseListener.current && responseListener.current.remove) {
        responseListener.current.remove();
      }
    };
  }, [user]);

  // Protect routes based on auth state
  useEffect(() => {
    if (!initialized) return;
    if (session && (segments[0] === 'index' || segments[0] === 'auth')) {
      router.replace('/(tabs)/feed');
    }
  }, [session, initialized, segments]);

  // Show loading screen while checking auth
  if (!initialized || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="auth" options={{ title: 'Sign In' }} />
      <Stack.Screen name="verify" options={{ title: 'Verify' }} />
      <Stack.Screen name="profile-setup" options={{ title: 'Setup' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider>
      <RootLayoutNav />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
