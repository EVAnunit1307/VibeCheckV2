import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Card, Button, Text, FAB, Dialog, Portal, ProgressBar, Chip, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';

interface GroupMember {
  user_id: string;
  role: 'admin' | 'member';
  profiles: {
    full_name: string;
    commitment_score: number;
  };
  stats?: {
    plans_attended: number;
    plans_flaked: number;
  };
}

interface GroupPlan {
  id: string;
  title: string;
  planned_date: string;
  status: 'proposed' | 'confirmed' | 'completed';
  events?: {
    title: string;
  };
}

interface GroupStats {
  total_members: number;
  total_plans: number;
  completed_plans: number;
  success_rate: number;
  favorite_venues: Array<{ name: string; count: number }>;
}

interface GroupDetail {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export default function GroupDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [recentPlans, setRecentPlans] = useState<GroupPlan[]>([]);
  const [groupStats, setGroupStats] = useState<GroupStats>({
    total_members: 0,
    total_plans: 0,
    completed_plans: 0,
    success_rate: 0,
    favorite_venues: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leaveDialogVisible, setLeaveDialogVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchGroupDetails = async () => {
    try {
      // Fetch group info
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);

      // Fetch members with profiles
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select(`
          user_id,
          role,
          profiles (
            full_name,
            commitment_score
          )
        `)
        .eq('group_id', id);

      if (membersError) throw membersError;

      // For each member, calculate their stats
      const membersWithStats = await Promise.all(
        (membersData || []).map(async (member) => {
          // Get plans attended (confirmed status in plan_participants)
          const { count: attended } = await supabase
            .from('plan_participants')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', member.user_id)
            .eq('status', 'confirmed');

          // Get plans flaked (declined or didn't show up)
          const { count: flaked } = await supabase
            .from('plan_participants')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', member.user_id)
            .eq('status', 'declined');

          return {
            ...member,
            stats: {
              plans_attended: attended || 0,
              plans_flaked: flaked || 0,
            },
          };
        })
      );

      // Sort by commitment score (highest first)
      membersWithStats.sort((a, b) => 
        b.profiles.commitment_score - a.profiles.commitment_score
      );

      setMembers(membersWithStats);

      // Check if current user is admin
      const currentMember = membersData?.find(m => m.user_id === user?.id);
      setIsAdmin(currentMember?.role === 'admin');

      // Fetch recent plans
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select(`
          id,
          title,
          planned_date,
          status,
          events (
            title
          )
        `)
        .eq('group_id', id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (plansError) throw plansError;
      setRecentPlans(plansData || []);

      // Calculate group stats
      const { count: totalPlans } = await supabase
        .from('plans')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', id);

      const { count: completedPlans } = await supabase
        .from('plans')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', id)
        .eq('status', 'completed');

      const successRate = totalPlans && totalPlans > 0 
        ? Math.round((completedPlans || 0) / totalPlans * 100) 
        : 0;

      // Get favorite venues (top 3)
      const { data: venuesData } = await supabase
        .from('plans')
        .select(`
          events (
            venue_id,
            venues (
              name
            )
          )
        `)
        .eq('group_id', id)
        .not('events', 'is', null);

      // Count venue occurrences
      const venueCounts: Record<string, number> = {};
      venuesData?.forEach(plan => {
        const venueName = plan.events?.venues?.name;
        if (venueName) {
          venueCounts[venueName] = (venueCounts[venueName] || 0) + 1;
        }
      });

      const favoriteVenues = Object.entries(venueCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      setGroupStats({
        total_members: membersData?.length || 0,
        total_plans: totalPlans || 0,
        completed_plans: completedPlans || 0,
        success_rate: successRate,
        favorite_venues: favoriteVenues,
      });

    } catch (error: any) {
      console.error('Error fetching group:', error);
      Alert.alert('Error', 'Failed to load group details: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to member changes
    const membersSubscription = supabase
      .channel('group_members_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_members',
          filter: `group_id=eq.${id}`,
        },
        () => {
          fetchGroupDetails();
        }
      )
      .subscribe();

    // Subscribe to plan changes
    const plansSubscription = supabase
      .channel('group_plans_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'plans',
          filter: `group_id=eq.${id}`,
        },
        () => {
          fetchGroupDetails();
        }
      )
      .subscribe();

    return () => {
      membersSubscription.unsubscribe();
      plansSubscription.unsubscribe();
    };
  };

  const handleLeaveGroup = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      Alert.alert('Success', 'You have left the group');
      router.back();
    } catch (error: any) {
      console.error('Error leaving group:', error);
      Alert.alert('Error', 'Failed to leave group: ' + error.message);
    } finally {
      setLeaveDialogVisible(false);
    }
  };

  const handleAddMembers = () => {
    router.push(`/add-members?groupId=${id}`);
  };

  const handleCreatePlan = () => {
    router.push(`/create-plan?groupId=${id}`);
  };

  const handleOpenPlan = (planId: string) => {
    router.push(`/plan/${planId}`);
  };

  useEffect(() => {
    fetchGroupDetails();
    const cleanup = setupRealtimeSubscriptions();
    return cleanup;
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroupDetails();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading group...</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Group not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: group.name,
          headerShown: true,
          headerRight: () => (
            <Button onPress={handleAddMembers} textColor="#6366f1">
              Add Members
            </Button>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Group Stats Card */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text style={styles.sectionTitle}>Group Stats</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="account-group" size={24} color="#6366f1" />
                <Text style={styles.statValue}>{groupStats.total_members}</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>

              <View style={styles.statItem}>
                <MaterialCommunityIcons name="calendar-check" size={24} color="#10b981" />
                <Text style={styles.statValue}>{groupStats.total_plans}</Text>
                <Text style={styles.statLabel}>Plans</Text>
              </View>

              <View style={styles.statItem}>
                <MaterialCommunityIcons name="chart-line" size={24} color="#f59e0b" />
                <Text style={styles.statValue}>{groupStats.success_rate}%</Text>
                <Text style={styles.statLabel}>Success Rate</Text>
              </View>
            </View>

            {groupStats.favorite_venues.length > 0 && (
              <View style={styles.favoriteVenues}>
                <Text style={styles.subsectionTitle}>Favorite Venues</Text>
                {groupStats.favorite_venues.map((venue, index) => (
                  <View key={index} style={styles.venueItem}>
                    <MaterialCommunityIcons name="map-marker" size={16} color="#6b7280" />
                    <Text style={styles.venueName}>{venue.name}</Text>
                    <Text style={styles.venueCount}>({venue.count} plans)</Text>
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Members Section */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text style={styles.sectionTitle}>Members ({members.length})</Text>
            
            {members.map((member) => (
              <MemberListItem key={member.user_id} member={member} />
            ))}
          </Card.Content>
        </Card>

        {/* Recent Plans Section */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text style={styles.sectionTitle}>Recent Plans</Text>
            
            {recentPlans.length === 0 ? (
              <Text style={styles.emptyText}>No plans yet. Create your first plan!</Text>
            ) : (
              recentPlans.map((plan) => (
                <PlanListItem
                  key={plan.id}
                  plan={plan}
                  onPress={() => handleOpenPlan(plan.id)}
                />
              ))
            )}
          </Card.Content>
        </Card>

        {/* Leave Group Button */}
        <View style={styles.leaveButtonContainer}>
          <Button
            mode="outlined"
            onPress={() => setLeaveDialogVisible(true)}
            textColor="#ef4444"
            style={styles.leaveButton}
          >
            Leave Group
          </Button>
        </View>
      </ScrollView>

      {/* Create Plan FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreatePlan}
        label="Create Plan"
        color="#fff"
      />

      {/* Leave Group Confirmation Dialog */}
      <Portal>
        <Dialog visible={leaveDialogVisible} onDismiss={() => setLeaveDialogVisible(false)}>
          <Dialog.Title>Leave Group</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to leave "{group.name}"? You won't be able to see plans or participate anymore.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLeaveDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleLeaveGroup} textColor="#ef4444">Leave</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

// Member List Item Component
function MemberListItem({ member }: { member: GroupMember }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 70) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const scoreColor = getScoreColor(member.profiles.commitment_score);
  const initials = member.profiles.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.memberItem}>
      <Avatar.Text size={48} label={initials} style={styles.memberAvatar} />
      
      <View style={styles.memberInfo}>
        <View style={styles.memberHeader}>
          <Text style={styles.memberName}>{member.profiles.full_name}</Text>
          {member.role === 'admin' && (
            <Chip mode="flat" style={styles.adminBadge} textStyle={styles.adminBadgeText}>
              Admin
            </Chip>
          )}
        </View>

        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>
            Commitment Score: <Text style={[styles.scoreValue, { color: scoreColor }]}>
              {member.profiles.commitment_score}
            </Text>
          </Text>
          <ProgressBar
            progress={member.profiles.commitment_score / 100}
            color={scoreColor}
            style={styles.scoreBar}
          />
        </View>

        {member.stats && (
          <Text style={styles.memberStats}>
            {member.stats.plans_attended} plans attended • {member.stats.plans_flaked} flaked
          </Text>
        )}
      </View>
    </View>
  );
}

// Plan List Item Component
function PlanListItem({ plan, onPress }: { plan: GroupPlan; onPress: () => void }) {
  const getStatusColor = () => {
    switch (plan.status) {
      case 'confirmed': return '#10b981';
      case 'completed': return '#6b7280';
      default: return '#f59e0b';
    }
  };

  return (
    <Card style={styles.planCard} onPress={onPress} mode="outlined">
      <Card.Content>
        <View style={styles.planHeader}>
          <Text style={styles.planTitle} numberOfLines={1}>
            {plan.events?.title || plan.title}
          </Text>
          <Chip
            mode="flat"
            style={[styles.statusChip, { backgroundColor: getStatusColor() }]}
            textStyle={styles.statusChipText}
          >
            {plan.status.toUpperCase()}
          </Chip>
        </View>
        
        <View style={styles.planDateRow}>
          <MaterialCommunityIcons name="calendar" size={16} color="#6b7280" />
          <Text style={styles.planDate}>
            {format(new Date(plan.planned_date), 'EEE, MMM d, yyyy')}
          </Text>
        </View>
      </Card.Content>
    </Card>
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
    paddingBottom: 80,
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
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  favoriteVenues: {
    marginTop: 8,
  },
  venueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  venueName: {
    fontSize: 14,
    color: '#111827',
    marginLeft: 6,
    flex: 1,
  },
  venueCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  memberItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  memberAvatar: {
    backgroundColor: '#6366f1',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  adminBadge: {
    backgroundColor: '#6366f1',
    height: 24,
  },
  adminBadgeText: {
    fontSize: 10,
    color: '#fff',
    marginVertical: 0,
  },
  scoreSection: {
    marginBottom: 6,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  scoreValue: {
    fontWeight: 'bold',
  },
  scoreBar: {
    height: 6,
    borderRadius: 3,
  },
  memberStats: {
    fontSize: 11,
    color: '#9ca3af',
  },
  planCard: {
    marginBottom: 8,
    borderColor: '#e5e7eb',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    fontSize: 10,
    color: '#fff',
    marginVertical: 0,
  },
  planDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planDate: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    paddingVertical: 16,
  },
  leaveButtonContainer: {
    padding: 16,
  },
  leaveButton: {
    borderColor: '#ef4444',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6366f1',
  },
});
