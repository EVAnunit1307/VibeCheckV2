import { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';

export default function VerifyScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { checkProfile, setSession, setUser } = useAuthStore();
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: phone || '',
        token: code,
        type: 'sms',
      });

      if (verifyError) {
        setError(verifyError.message);
        setCode('');
        setLoading(false);
        return;
      }

      if (data.session) {
        setSession(data.session);

        // Check if profile exists
        const hasProfile = await checkProfile(data.user.id);

        if (hasProfile) {
          // Fetch and set user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            setUser(profile);
          }

          router.replace('/(tabs)/feed');
        } else {
          router.replace('/profile-setup');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please try again.');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    setError('');

    try {
      const { error: resendError } = await supabase.auth.signInWithOtp({
        phone: phone || '',
      });

      if (resendError) {
        setError(resendError.message);
      } else {
        setResendTimer(30);
        setCanResend(false);
        setError('');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text: string) => {
    // Only allow digits
    const cleaned = text.replace(/\D/g, '').slice(0, 6);
    setCode(cleaned);
    setError('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Enter verification code</Text>
            <Text style={styles.subtitle}>
              We sent a code to {phone}
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Verification Code"
              value={code}
              onChangeText={handleCodeChange}
              placeholder="000000"
              keyboardType="number-pad"
              mode="outlined"
              outlineColor="#e5e7eb"
              activeOutlineColor="#6366f1"
              style={styles.input}
              disabled={loading}
              error={!!error}
              maxLength={6}
            />

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Button
              mode="contained"
              onPress={handleVerify}
              loading={loading}
              disabled={loading || code.length !== 6}
              style={styles.button}
              buttonColor="#6366f1"
              contentStyle={styles.buttonContent}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>

            <Button
              mode="text"
              onPress={handleResend}
              disabled={!canResend || loading}
              style={styles.resendButton}
              textColor={canResend ? '#6366f1' : '#9ca3af'}
            >
              {canResend 
                ? 'Resend Code' 
                : `Resend in ${resendTimer}s`
              }
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
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
    fontSize: 24,
    textAlign: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 4,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  resendButton: {
    marginTop: 16,
  },
});
