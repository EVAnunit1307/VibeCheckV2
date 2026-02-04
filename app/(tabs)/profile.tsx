import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Text, ProgressBar, Divider, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { getCommitmentScoreColor, getCommitmentScoreLabel } from '../../lib/helpers';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.placeholderText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const commitmentPercent = user.commitment_score / 100;
  const scoreColor = getCommitmentScoreColor(user.commitment_score);
  const scoreLabel = getCommitmentScoreLabel(user.commitment_score);
  
  // Get initials for avatar
  const initials = user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const totalAttended = user.total_attended || 0;
  const totalFlaked = user.total_flaked || 0;
  const totalEvents = totalAttended + totalFlaked;
  const attendanceRate = totalEvents > 0 ? (totalAttended / totalEvents) * 100 : 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
        </View>

        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.userInfo}>
              <Avatar.Text
                size={80}
                label={initials}
                style={[styles.avatar, { backgroundColor: scoreColor }]}
                labelStyle={{ fontSize: 32, fontWeight: 'bold' }}
              />
              
              <Text style={styles.name}>{user.full_name}</Text>
              <Text style={styles.username}>@{user.username}</Text>
              <Text style={styles.phone}>{user.phone_number}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text style={styles.cardTitle}>Commitment Score</Text>
            <View style={styles.scoreContainer}>
              <Text style={[styles.scoreValue, { color: scoreColor }]}>
                {user.commitment_score}
              </Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
            <Text style={[styles.scoreLabel, { color: scoreColor }]}>
              {scoreLabel}
            </Text>
            <ProgressBar 
              progress={commitmentPercent} 
              color={scoreColor}
              style={styles.progressBar}
            />
            <Text style={styles.scoreDescription}>
              Earn points by showing up, lose points by flaking
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text style={styles.cardTitle}>Statistics</Text>
            
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="check-circle" size={32} color="#10b981" />
                <Text style={styles.statValue}>{totalAttended}</Text>
                <Text style={styles.statLabel}>Attended</Text>
              </View>
              
              <Divider style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="close-circle" size={32} color="#ef4444" />
                <Text style={styles.statValue}>{totalFlaked}</Text>
                <Text style={styles.statLabel}>Flaked</Text>
              </View>
              
              <Divider style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="chart-line" size={32} color="#6366f1" />
                <Text style={styles.statValue}>{attendanceRate.toFixed(0)}%</Text>
                <Text style={styles.statLabel}>Rate</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleSignOut}
            style={styles.signOutButton}
            buttonColor="#ef4444"
            contentStyle={styles.buttonContent}
            icon="logout"
          >
            Sign Out
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeholderText: {
    fontSize: 16,
    color: '#6b7280',
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  userInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#6366f1',
    marginBottom: 8,
  },
  phone: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 24,
    color: '#9ca3af',
    marginLeft: 4,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  scoreDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 80,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actions: {
    marginTop: 16,
  },
  signOutButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
