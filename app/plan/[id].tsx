import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, FlatList, KeyboardAvoidingView, Platform, Image, RefreshControl } from 'react-native';
import { Card, Button, Text, TextInput, Chip, Avatar, ProgressBar, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, formatDistanceToNow } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';

interface Participant {
  user_id: string;
  vote: 'yes' | 'no' | 'maybe' | null;
  status: 'confirmed' | 'declined' | 'maybe' | 'pending';
  profiles: {
    full_name: string;
    commitment_score: number;
  };
}

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface PlanDetail {
  id: string;
  title: string;
  status: 'proposed' | 'confirmed' | 'completed';
  planned_date: string;
  min_attendees: number;
  events?: {
    title: string;
    cover_image: string;
    venues: {
      name: string;
      address: string;
    };
  };
}

export default function PlanDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  
  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [voteCounts, setVoteCounts] = useState({ yes: 0, no: 0, maybe: 0, pending: 0 });
  const scrollViewRef = useRef<ScrollView>(null);

  const fetchPlanDetails = async () => {
    try {
      // Fetch plan with event and venue
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select(`
          *,
          events (
            title,
            cover_image,
            venues (
              name,
              address
            )
          )
        `)
        .eq('id', id)
        .single();

      if (planError) throw planError;
      setPlan(planData);

      // Fetch participants with profiles
      const { data: participantsData, error: participantsError } = await supabase
        .from('plan_participants')
        .select(`
          user_id,
          vote,
          status,
          profiles (
            full_name,
            commitment_score
          )
        `)
        .eq('plan_id', id);

      if (participantsError) throw participantsError;
      
      // Sort participants: yes first, then maybe, no, pending
      const sorted = (participantsData || []).sort((a, b) => {
        const order = { yes: 0, maybe: 1, no: 2, pending: 3 };
        return order[a.vote || 'pending'] - order[b.vote || 'pending'];
      });
      
      setParticipants(sorted);

      // Calculate vote counts
      const counts = { yes: 0, no: 0, maybe: 0, pending: 0 };
      sorted.forEach(p => {
        if (p.vote) counts[p.vote]++;
        else counts.pending++;
      });
      setVoteCounts(counts);

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('plan_messages')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('plan_id', id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

    } catch (error: any) {
      console.error('Error fetching plan:', error);
      alert('Error loading plan: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleVote = async (vote: 'yes' | 'no' | 'maybe') => {
    if (!user) return;

    try {
      const status = vote === 'yes' ? 'confirmed' : vote === 'no' ? 'declined' : 'maybe';

      // Update participant vote
      const { error: updateError } = await supabase
        .from('plan_participants')
        .update({
          vote,
          status,
          voted_at: new Date().toISOString(),
        })
        .eq('plan_id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Check if we should auto-confirm the plan
      const yesVotes = participants.filter(p => p.vote === 'yes').length + (vote === 'yes' ? 1 : 0);
      
      if (plan && yesVotes >= plan.min_attendees && plan.status === 'proposed') {
        const { error: confirmError } = await supabase
          .from('plans')
          .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (confirmError) throw confirmError;
      }

      // Refresh data
      await fetchPlanDetails();
    } catch (error: any) {
      console.error('Error voting:', error);
      alert('Error submitting vote: ' + error.message);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !messageText.trim()) return;

    try {
      const { error } = await supabase
        .from('plan_messages')
        .insert({
          plan_id: id,
          user_id: user.id,
          message: messageText.trim(),
        });

      if (error) throw error;

      setMessageText('');
      // Messages will update via realtime subscription
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('Error sending message: ' + error.message);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to participant changes
    const participantsSubscription = supabase
      .channel('plan_participants_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'plan_participants',
          filter: `plan_id=eq.${id}`,
        },
        () => {
          fetchPlanDetails();
        }
      )
      .subscribe();

    // Subscribe to plan changes
    const planSubscription = supabase
      .channel('plan_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'plans',
          filter: `id=eq.${id}`,
        },
        () => {
          fetchPlanDetails();
        }
      )
      .subscribe();

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('plan_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'plan_messages',
          filter: `plan_id=eq.${id}`,
        },
        () => {
          fetchPlanDetails();
        }
      )
      .subscribe();

    return () => {
      participantsSubscription.unsubscribe();
      planSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
    };
  };

  useEffect(() => {
    fetchPlanDetails();
    const cleanup = setupRealtimeSubscriptions();
    return cleanup;
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPlanDetails();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Plan not found</Text>
      </View>
    );
  }

  const currentUserVote = participants.find(p => p.user_id === user?.id)?.vote;
  const totalVoted = voteCounts.yes + voteCounts.no + voteCounts.maybe;
  const totalParticipants = participants.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header Section */}
          {plan.events?.cover_image && (
            <Image source={{ uri: plan.events.cover_image }} style={styles.coverImage} />
          )}

          <View style={styles.headerSection}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{plan.events?.title || plan.title}</Text>
              <Chip
                mode="flat"
                style={[
                  styles.statusChip,
                  plan.status === 'confirmed' && styles.confirmedChip,
                  plan.status === 'completed' && styles.completedChip,
                ]}
                textStyle={styles.chipText}
              >
                {plan.status.toUpperCase()}
              </Chip>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="calendar" size={20} color="#6b7280" />
              <Text style={styles.infoText}>
                {format(new Date(plan.planned_date), 'EEE, MMM d')} at{' '}
                {format(new Date(plan.planned_date), 'h:mm a')}
              </Text>
            </View>

            {plan.events?.venues && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#6b7280" />
                <Text style={styles.infoText}>{plan.events.venues.name}</Text>
              </View>
            )}
          </View>

          {/* Confirmation Banner */}
          {plan.status === 'confirmed' && (
            <Card style={styles.confirmationBanner} mode="elevated">
              <Card.Content>
                <Text style={styles.confirmationTitle}>🎉 Plan Confirmed!</Text>
                <Text style={styles.confirmationText}>
                  Happening on {format(new Date(plan.planned_date), 'MMMM d')} at{' '}
                  {format(new Date(plan.planned_date), 'h:mm a')}
                </Text>
                <Text style={styles.confirmationCount}>
                  {voteCounts.yes} {voteCounts.yes === 1 ? 'person is' : 'people are'} going
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* Voting Section */}
          {plan.status === 'proposed' && (
            <Card style={styles.card} mode="elevated">
              <Card.Content>
                <Text style={styles.sectionTitle}>Vote Now</Text>
                
                <View style={styles.voteButtons}>
                  <VoteButton
                    label="YES"
                    icon="check"
                    color="#10b981"
                    selected={currentUserVote === 'yes'}
                    onPress={() => handleVote('yes')}
                  />
                  <VoteButton
                    label="MAYBE"
                    icon="help"
                    color="#f59e0b"
                    selected={currentUserVote === 'maybe'}
                    onPress={() => handleVote('maybe')}
                  />
                  <VoteButton
                    label="NO"
                    icon="close"
                    color="#ef4444"
                    selected={currentUserVote === 'no'}
                    onPress={() => handleVote('no')}
                  />
                </View>

                <Text style={styles.voteCount}>
                  {voteCounts.yes} Yes • {voteCounts.maybe} Maybe • {voteCounts.no} No
                </Text>

                <View style={styles.progressSection}>
                  <Text style={styles.progressText}>
                    {totalVoted} of {totalParticipants} voted
                  </Text>
                  <ProgressBar
                    progress={totalVoted / totalParticipants}
                    color="#6366f1"
                    style={styles.progressBar}
                  />
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Participants Section */}
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text style={styles.sectionTitle}>Who's Coming ({participants.length})</Text>
              {participants.map((participant) => (
                <ParticipantListItem
                  key={participant.user_id}
                  participant={participant}
                />
              ))}
            </Card.Content>
          </Card>

          {/* Chat Section */}
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text style={styles.sectionTitle}>Chat ({messages.length})</Text>
              
              {messages.length === 0 ? (
                <Text style={styles.emptyChat}>No messages yet. Start the conversation!</Text>
              ) : (
                <View style={styles.messagesContainer}>
                  {messages.map((message) => (
                    <MessageListItem key={message.id} message={message} currentUserId={user?.id} />
                  ))}
                </View>
              )}

              <View style={styles.messageInputContainer}>
                <TextInput
                  value={messageText}
                  onChangeText={setMessageText}
                  placeholder="Type a message..."
                  mode="outlined"
                  outlineColor="#e5e7eb"
                  activeOutlineColor="#6366f1"
                  style={styles.messageInput}
                  multiline
                  maxLength={500}
                />
                <Button
                  mode="contained"
                  onPress={handleSendMessage}
                  disabled={!messageText.trim()}
                  buttonColor="#6366f1"
                  style={styles.sendButton}
                >
                  Send
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Vote Button Component
function VoteButton({ label, icon, color, selected, onPress }: {
  label: string;
  icon: string;
  color: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      mode={selected ? 'contained' : 'outlined'}
      onPress={onPress}
      buttonColor={selected ? color : 'transparent'}
      textColor={selected ? '#fff' : color}
      style={[styles.voteButton, { borderColor: color }]}
      contentStyle={styles.voteButtonContent}
      icon={icon}
    >
      {label}
    </Button>
  );
}

// Participant List Item Component
function ParticipantListItem({ participant }: { participant: Participant }) {
  const getVoteIcon = () => {
    switch (participant.vote) {
      case 'yes': return { icon: 'check', color: '#10b981' };
      case 'maybe': return { icon: 'help', color: '#f59e0b' };
      case 'no': return { icon: 'close', color: '#ef4444' };
      default: return { icon: 'clock-outline', color: '#9ca3af' };
    }
  };

  const voteInfo = getVoteIcon();
  const initials = participant.profiles.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.participantItem}>
      <Avatar.Text size={40} label={initials} style={styles.avatar} />
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{participant.profiles.full_name}</Text>
        <Text style={styles.commitmentScore}>
          Score: {participant.profiles.commitment_score}
        </Text>
      </View>
      <View style={[styles.voteBadge, { backgroundColor: voteInfo.color }]}>
        <MaterialCommunityIcons name={voteInfo.icon} size={16} color="#fff" />
      </View>
    </View>
  );
}

// Message List Item Component
function MessageListItem({ message, currentUserId }: {
  message: Message;
  currentUserId?: string;
}) {
  const isCurrentUser = message.user_id === currentUserId;

  return (
    <View style={[styles.messageItem, isCurrentUser && styles.currentUserMessage]}>
      <Text style={styles.messageName}>{message.profiles.full_name}</Text>
      <Text style={styles.messageText}>{message.message}</Text>
      <Text style={styles.messageTime}>
        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  coverImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  headerSection: {
    padding: 16,
    backgroundColor: '#fff',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    backgroundColor: '#f59e0b',
  },
  confirmedChip: {
    backgroundColor: '#10b981',
  },
  completedChip: {
    backgroundColor: '#6b7280',
  },
  chipText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  confirmationBanner: {
    margin: 16,
    backgroundColor: '#10b981',
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  confirmationText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  confirmationCount: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  voteButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  voteButton: {
    flex: 1,
    borderWidth: 2,
  },
  voteButtonContent: {
    paddingVertical: 8,
  },
  voteCount: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  progressSection: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatar: {
    backgroundColor: '#6366f1',
  },
  participantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  commitmentScore: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  voteBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    marginBottom: 16,
  },
  messageItem: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  currentUserMessage: {
    backgroundColor: '#e0e7ff',
    alignSelf: 'flex-end',
  },
  messageName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  emptyChat: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    marginVertical: 16,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageInput: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: '#fff',
  },
  sendButton: {
    marginBottom: 4,
  },
});
