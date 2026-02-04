/**
 * VibeCheck - Mobile-First Launch Homepage
 * Reference: Eventbrite, Fever app onboarding
 */

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
      
      {/* Hero Gradient */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6', '#ec4899']}
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
              Discover Events.{'\n'}
              Plan with Friends.{'\n'}
              <Text style={styles.headingAccent}>Actually Show Up.</Text>
            </Text>
            
            <Text style={styles.subheading}>
              Find the hottest events in Toronto, create plans with your crew, and track who actually shows up.
            </Text>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <MaterialCommunityIcons name="map-marker-radius" size={24} color="#6366f1" />
              <Text style={styles.featureTitle}>20K+ Events</Text>
              <Text style={styles.featureText}>Concerts, clubs, festivals in Toronto</Text>
            </View>
            
            <View style={styles.featureCard}>
              <MaterialCommunityIcons name="account-group" size={24} color="#8b5cf6" />
              <Text style={styles.featureTitle}>Group Plans</Text>
              <Text style={styles.featureText}>Vote together on what to do</Text>
            </View>
            
            <View style={styles.featureCard}>
              <MaterialCommunityIcons name="chart-line" size={24} color="#ec4899" />
              <Text style={styles.featureTitle}>Commitment Score</Text>
              <Text style={styles.featureText}>Track who flakes, who shows</Text>
            </View>
            
            <View style={styles.featureCard}>
              <MaterialCommunityIcons name="chat" size={24} color="#f59e0b" />
              <Text style={styles.featureTitle}>Real-Time Chat</Text>
              <Text style={styles.featureText}>Coordinate with your group</Text>
            </View>
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(tabs)/feed')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Explore Events</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#6366f1" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/auth')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Sign Up to Create Plans</Text>
            </TouchableOpacity>
          </View>

          {/* Social Proof */}
          <View style={styles.socialProof}>
            <View style={styles.avatarStack}>
              <View style={[styles.avatar, { backgroundColor: '#6366f1' }]} />
              <View style={[styles.avatar, { backgroundColor: '#8b5cf6', marginLeft: -12 }]} />
              <View style={[styles.avatar, { backgroundColor: '#ec4899', marginLeft: -12 }]} />
            </View>
            <Text style={styles.socialProofText}>
              <Text style={styles.socialProofBold}>1,000+</Text> people planning together
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
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 44,
    marginBottom: 16,
  },
  headingAccent: {
    color: '#fbbf24',
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
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6b7280',
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
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366f1',
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
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  socialProofBold: {
    fontWeight: '700',
  },
});
