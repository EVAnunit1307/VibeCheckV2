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

  // Protect routes based on auth state
  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const onAuthScreens = segments[0] === 'index' || segments[0] === 'verify' || segments[0] === 'profile-setup';

    if (!session && inAuthGroup) {
      // Redirect to auth if trying to access protected routes
      router.replace('/');
    } else if (session && segments[0] === 'index') {
      // Redirect to feed if already logged in and on auth screen
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
      <Stack.Screen name="index" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="(tabs)" />
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
