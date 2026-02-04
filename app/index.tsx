import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useAuthStore } from '../store/auth';

export default function HomePage() {
  const router = useRouter();
  const { session, initialized, loading: authLoading } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    if (initialized && !authLoading && session) {
      router.replace('/(tabs)/feed');
    }
  }, [session, initialized, authLoading]);

  const handleGetStarted = () => {
    router.push('/auth');
  };

  const handleDemoMode = () => {
    // Navigate to tabs without auth for demo/testing
    router.push('/(tabs)/feed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.logo}>VibeCheck</Text>
          <Text style={styles.tagline}>Plan together, show up together</Text>
          <Text style={styles.description}>
            The social app that holds everyone accountable. Make plans with friends and track who actually shows up.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.features}>
          <FeatureCard
            icon="calendar-check"
            title="Make Plans"
            description="Vote on events with your group and confirm plans together"
          />
          <FeatureCard
            icon="account-group"
            title="Track Attendance"
            description="See who shows up and who flakes with commitment scores"
          />
          <FeatureCard
            icon="trophy"
            title="Build Trust"
            description="Earn points for showing up, lose points for canceling"
          />
        </View>

        {/* CTA Buttons */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleGetStarted}
            style={styles.primaryButton}
            buttonColor="#6366f1"
            contentStyle={styles.buttonContent}
          >
            Get Started
          </Button>

          <Button
            mode="outlined"
            onPress={handleDemoMode}
            style={styles.secondaryButton}
            textColor="#6366f1"
            contentStyle={styles.buttonContent}
          >
            Explore Demo Mode
          </Button>

          <Text style={styles.demoNote}>
            * Demo mode lets you explore the app without authentication
          </Text>
        </View>

        {/* How It Works */}
        <View style={styles.howItWorks}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Create a Group</Text>
              <Text style={styles.stepDescription}>Add your friends and start planning</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Vote on Plans</Text>
              <Text style={styles.stepDescription}>Everyone votes YES, MAYBE, or NO on events</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Check In & Show Up</Text>
              <Text style={styles.stepDescription}>Check in when you arrive and earn points</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Build Your Score</Text>
              <Text style={styles.stepDescription}>Track your commitment score and compete with friends</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Card style={styles.featureCard} mode="elevated">
      <Card.Content style={styles.featureContent}>
        <MaterialCommunityIcons name={icon as any} size={40} color="#6366f1" />
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  hero: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  logo: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 20,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 600,
  },
  features: {
    padding: 16,
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#fff',
  },
  featureContent: {
    alignItems: 'center',
    padding: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  actions: {
    padding: 24,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 12,
    borderRadius: 8,
  },
  secondaryButton: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 8,
    borderColor: '#6366f1',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  demoNote: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 12,
    textAlign: 'center',
  },
  howItWorks: {
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
