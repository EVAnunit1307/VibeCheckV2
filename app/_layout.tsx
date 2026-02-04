import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/auth';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { session, initialized, loading, initialize } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, []);

  // Protect routes based on auth state (optional - allow demo mode)
  useEffect(() => {
    if (!initialized) return;

    // If logged in and on home/auth, redirect to feed
    if (session && (segments[0] === 'index' || segments[0] === 'auth')) {
      router.replace('/(tabs)/feed');
    }
  }, [session, initialized, segments]);

  // Show loading screen while initializing
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
