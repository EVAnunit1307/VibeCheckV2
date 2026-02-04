/**
 * VibeCheck - Production-Ready Homepage
 * Beautiful dark theme with gradients and animations
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function HomePage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#16213e', '#0a0a0a']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <Animated.View entering={FadeInUp.delay(100)} style={styles.heroSection}>
            {/* Badge */}
            <View style={styles.badge}>
              <MaterialCommunityIcons name="star" size={14} color="#fbbf24" />
              <Text style={styles.badgeText}>AWARD-WINNING APP</Text>
            </View>

            {/* Main Heading with Gradient */}
            <Text style={styles.heading}>
              Plan Together{'\n'}
              <Text style={styles.gradientText}>Show Up Together</Text>
            </Text>

            {/* Description */}
            <Text style={styles.description}>
              Create plans with friends. Vote together. Never flake again.
              Track commitment scores and build reliable friend groups.
            </Text>

            {/* CTA Buttons */}
            <Animated.View entering={FadeInUp.delay(300)} style={styles.ctaContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/auth')}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push('/(tabs)/feed')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="play" size={16} color="#fff" />
                <Text style={styles.secondaryButtonText}>Explore Demo</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Stats Card */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.statsCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']}
              style={styles.glassCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Main Stat */}
              <View style={styles.mainStat}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="target" size={28} color="#fff" />
                </View>
                <View>
                  <Text style={styles.mainStatValue}>10K+</Text>
                  <Text style={styles.mainStatLabel}>Active Users</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>User Satisfaction</Text>
                  <Text style={styles.progressValue}>98%</Text>
                </View>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={['#fff', '#999']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: '98%' }]}
                  />
                </View>
              </View>

              <View style={styles.divider} />

              {/* Mini Stats */}
              <View style={styles.miniStats}>
                <StatItem value="5+" label="YEARS" />
                <View style={styles.statDivider} />
                <StatItem value="24/7" label="SUPPORT" />
                <View style={styles.statDivider} />
                <StatItem value="100%" label="QUALITY" />
              </View>

              {/* Status Pills */}
              <View style={styles.pillsContainer}>
                <View style={styles.activePill}>
                  <View style={styles.pulsingDot} />
                  <Text style={styles.pillText}>LIVE</Text>
                </View>
                <View style={styles.premiumPill}>
                  <MaterialCommunityIcons name="crown" size={12} color="#fbbf24" />
                  <Text style={styles.pillText}>PREMIUM</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Features Grid */}
          <Animated.View entering={FadeInDown.delay(500)} style={styles.featuresGrid}>
            <FeatureCard
              icon="calendar-check"
              title="Real Events"
              description="Powered by Eventbrite with 1000s of live events"
            />
            <FeatureCard
              icon="account-group"
              title="Group Voting"
              description="Democratic decision making simplified"
            />
            <FeatureCard
              icon="chart-line"
              title="Commitment Tracking"
              description="See who shows up and who flakes"
            />
            <FeatureCard
              icon="bell-ring"
              title="Smart Reminders"
              description="Never miss a plan with timely alerts"
            />
          </Animated.View>

          {/* Trust Badge */}
          <Animated.View entering={FadeInUp.delay(600)} style={styles.trustBadge}>
            <Text style={styles.trustText}>
              🔒 Secure & Private • 💚 Always Free • ⚡ Lightning Fast
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Helper Components
function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <View style={styles.featureCard}>
      <LinearGradient
        colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.04)']}
        style={styles.featureCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.featureIcon}>
          <MaterialCommunityIcons name={icon as any} size={28} color="#6366f1" />
        </View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    marginBottom: 32,
    marginTop: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 28,
    gap: 6,
  },
  badgeText: {
    color: '#e5e5e5',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  heading: {
    fontSize: 52,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
    lineHeight: 58,
    letterSpacing: -1,
  },
  gradientText: {
    fontSize: 52,
    fontWeight: '800',
    color: '#ffcd75',
  },
  description: {
    fontSize: 17,
    color: '#b0b0b0',
    lineHeight: 26,
    marginBottom: 36,
  },
  ctaContainer: {
    gap: 14,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  statsCard: {
    marginBottom: 28,
  },
  glassCard: {
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  mainStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 28,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainStatValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: -0.5,
  },
  mainStatLabel: {
    fontSize: 15,
    color: '#b0b0b0',
  },
  progressSection: {
    marginBottom: 28,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    color: '#b0b0b0',
  },
  progressValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 28,
  },
  miniStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: '#808080',
    letterSpacing: 1.2,
    marginTop: 6,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  premiumPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  pillText: {
    fontSize: 11,
    color: '#e5e5e5',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 28,
  },
  featureCard: {
    width: (width - 54) / 2,
  },
  featureCardGradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    minHeight: 160,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(99,102,241,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 13,
    color: '#b0b0b0',
    lineHeight: 19,
  },
  trustBadge: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  trustText: {
    fontSize: 13,
    color: '#808080',
    textAlign: 'center',
  },
});
