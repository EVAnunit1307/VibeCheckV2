import { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';

export default function AuthScreen() {
  const router = useRouter();
  const { session, initialized, loading: authLoading } = useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (initialized && !authLoading && session) {
      router.replace('/(tabs)/feed');
    }
  }, [session, initialized, authLoading]);

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters except +
    const cleaned = text.replace(/[^\d+]/g, '');
    
    // Format as +1 (XXX) XXX-XXXX
    if (cleaned.startsWith('+1') && cleaned.length > 2) {
      const digits = cleaned.slice(2);
      if (digits.length <= 3) {
        return `+1 (${digits}`;
      } else if (digits.length <= 6) {
        return `+1 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else {
        return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      }
    } else if (cleaned.startsWith('+')) {
      return cleaned;
    } else if (cleaned.length > 0) {
      return `+${cleaned}`;
    }
    return cleaned;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
    setError('');
  };

  const validatePhone = (phone: string): boolean => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
  };

  const handleSendCode = async () => {
    if (!validatePhone(phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Remove formatting for API call
      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
      
      const { error: signInError } = await supabase.auth.signInWithOtp({
        phone: cleanPhone,
      });

      if (signInError) {
        // Show user-friendly error
        if (signInError.message.includes('invalid username') || signInError.message.includes('Authentication Error')) {
          setError('Phone authentication is not fully configured yet. Please use the "Explore Demo Mode" button on the homepage to test the app.');
        } else {
          setError(signInError.message);
        }
      } else {
        router.push(`/verify?phone=${encodeURIComponent(cleanPhone)}`);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send code. Please try again or use Demo Mode.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.back();
  };

  if (!initialized || authLoading) {
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
            <Text style={styles.title}>VibeCheck</Text>
            <Text style={styles.subtitle}>Enter your phone number to get started</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              placeholder="+1 (555) 000-0000"
              keyboardType="phone-pad"
              mode="outlined"
              outlineColor="#e5e7eb"
              activeOutlineColor="#6366f1"
              style={styles.input}
              disabled={loading}
              error={!!error}
            />

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button
              mode="contained"
              onPress={handleSendCode}
              loading={loading}
              disabled={loading || !phoneNumber}
              style={styles.button}
              buttonColor="#6366f1"
              contentStyle={styles.buttonContent}
            >
              {loading ? 'Sending...' : 'Send Code'}
            </Button>

            <Button
              mode="text"
              onPress={handleBackToHome}
              style={styles.backButton}
              textColor="#6366f1"
            >
              Back to Home
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
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 16,
  },
});
