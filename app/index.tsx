// VibeCheck landing page

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/auth';

export default function HomePage() {
  const router = useRouter();
  const { session } = useAuthStore();

  React.useEffect(() => {
    if (session) {
      router.replace('/(tabs)/feed');
    }
  }, [session]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Premium Dark Gradient */}
      <LinearGradient
        colors={['#0A0A0F', '#1A1A24', '#8B5CF6', '#EC4899']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="calendar-check" size={32} color="#fff" />
            </View>
            <Text style={styles.logoText}>VibeCheck</Text>
          </View>

          {/* Main Heading */}
          <View style={styles.heroContent}>
            <Text style={styles.heading}>
              Your Night Out{'\n'}
              <Text style={styles.headingAccent}>Starts Here</Text>
            </Text>
            
            <Text style={styles.subheading}>
              Find clubs, concerts & parties. Split costs. Track rides. Know who's really coming.
            </Text>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <MaterialCommunityIcons name="shimmer" size={24} color="#8B5CF6" />
              <Text style={styles.featureTitle}>Live Events</Text>
              <Text style={styles.featureText}>AI finds tonight's best clubs & parties</Text>
            </View>
            
            <View style={styles.featureCard}>
              <MaterialCommunityIcons name="cash-multiple" size={24} color="#10B981" />
              <Text style={styles.featureTitle}>Split Bills</Text>
              <Text style={styles.featureText}>Calculate covers, drinks & rides</Text>
            </View>
            
            <View style={styles.featureCard}>
              <MaterialCommunityIcons name="car" size={24} color="#06B6D4" />
              <Text style={styles.featureTitle}>Ride Costs</Text>
              <Text style={styles.featureText}>See Uber estimates before you go</Text>
            </View>
            
            <View style={styles.featureCard}>
              <MaterialCommunityIcons name="shield-check" size={24} color="#EC4899" />
              <Text style={styles.featureTitle}>Vibe Scores</Text>
              <Text style={styles.featureText}>Know who actually shows up</Text>
            </View>
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(tabs)/feed')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="party-popper" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Find Tonight's Events</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/auth')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Sign Up  •  Plan with Friends</Text>
            </TouchableOpacity>
          </View>

          {/* Social Proof */}
          <View style={styles.socialProof}>
            <MaterialCommunityIcons name="fire" size={16} color="#F59E0B" />
            <Text style={styles.socialProofText}>
              <Text style={styles.socialProofBold}>Popular in Toronto</Text> • Made for 18-30 year olds
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6366f1',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  heroContent: {
    marginBottom: 40,
  },
  heading: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 48,
    marginBottom: 16,
  },
  headingAccent: {
    color: '#EC4899',
  },
  subheading: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 40,
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  ctaContainer: {
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  socialProofText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  socialProofBold: {
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
});
