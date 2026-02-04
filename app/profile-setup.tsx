import { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserPhone(user.phone || null);
      } else {
        // If no user, redirect to auth
        router.replace('/');
      }
    };

    getCurrentUser();
  }, []);

  const generateUsername = (name: string): string => {
    // Convert to lowercase, remove spaces and special characters
    const base = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    // Add random 3-digit number
    const random = Math.floor(100 + Math.random() * 900);
    return `${base}${random}`;
  };

  const handleNameChange = (text: string) => {
    setFullName(text);
    setError('');
    
    // Auto-suggest username if user hasn't typed one
    if (!username || username === generateUsername(fullName)) {
      setUsername(generateUsername(text));
    }
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!userId) {
      setError('User not found. Please try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const finalUsername = username.trim() || generateUsername(fullName);

      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', finalUsername)
        .single();

      if (existingUser) {
        // Generate a new username with random number
        const newUsername = generateUsername(fullName);
        setUsername(newUsername);
        setError('Username taken. Try: ' + newUsername);
        setLoading(false);
        return;
      }

      // Create profile
      const { data: profile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          phone_number: userPhone,
          full_name: fullName.trim(),
          username: finalUsername,
          commitment_score: 100,
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          // Unique constraint violation
          setError('Username already taken. Please try another.');
        } else {
          setError(insertError.message);
        }
        setLoading(false);
        return;
      }

      // Update store with new profile
      setUser(profile);

      // Navigate to main app (prevent back navigation)
      router.replace('/(tabs)/feed');
    } catch (err: any) {
      setError(err?.message || 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to VibeCheck!</Text>
            <Text style={styles.subtitle}>Set up your profile</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Full Name *"
              value={fullName}
              onChangeText={handleNameChange}
              placeholder="John Doe"
              mode="outlined"
              outlineColor="#e5e7eb"
              activeOutlineColor="#6366f1"
              style={styles.input}
              disabled={loading}
              error={!!error && !fullName.trim()}
            />

            <TextInput
              label="Username"
              value={username}
              onChangeText={(text) => {
                setUsername(text.toLowerCase().replace(/[^a-z0-9]/g, ''));
                setError('');
              }}
              placeholder="johndoe123"
              mode="outlined"
              outlineColor="#e5e7eb"
              activeOutlineColor="#6366f1"
              style={styles.input}
              disabled={loading}
              autoCapitalize="none"
            />

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || !fullName.trim()}
              style={styles.button}
              buttonColor="#6366f1"
              contentStyle={styles.buttonContent}
            >
              {loading ? 'Creating Profile...' : 'Get Started'}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 4,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
