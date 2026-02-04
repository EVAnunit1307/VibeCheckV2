import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Text, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth';

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
        </View>

        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.full_name.charAt(0).toUpperCase()}
                </Text>
              </View>
              
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
              <Text style={styles.scoreValue}>{user.commitment_score}</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
            <ProgressBar 
              progress={commitmentPercent} 
              color="#6366f1"
              style={styles.progressBar}
            />
            <Text style={styles.scoreDescription}>
              {user.commitment_score >= 80 
                ? "Excellent! You're a reliable friend 🌟"
                : user.commitment_score >= 60
                ? "Good! Keep showing up 👍"
                : "Let's improve by attending more events 💪"
              }
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleSignOut}
            style={styles.signOutButton}
            buttonColor="#ef4444"
            contentStyle={styles.buttonContent}
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
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
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  scoreMax: {
    fontSize: 24,
    color: '#9ca3af',
    marginLeft: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
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
