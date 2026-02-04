import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { Text, Chip, Card, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { formatEventDate } from '../../lib/helpers';
import { PlanListSkeleton } from '../../components/LoadingSkeleton';

type Plan = {
  id: string;
  status: 'proposed' | 'confirmed' | 'completed' | 'cancelled';
  planned_date: string;
  event: {
    id: string;
    title: string;
    cover_image_url: string | null;
    venue: {
      name: string;
    };
  };
  vote_count: {
    yes: number;
    maybe: number;
    no: number;
    pending: number;
  };
  total_participants: number;
};

export default function PlansScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchPlans();
  }, [user?.id]);

  useEffect(() => {
    filterPlans();
  }, [plans, tab]);

  const fetchPlans = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Get plans where user is a participant
      const { data, error } = await supabase
        .from('plan_participants')
        .select(`
          plan:plans (
            id,
            status,
            planned_date,
            event:events (
              id,
              title,
              cover_image_url,
              venue:venues (
                name
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get vote counts for each plan
      const plansWithVotes = await Promise.all(
        (data || [])
          .filter((item: any) => item.plan) // Filter out null plans
          .map(async (item: any) => {
            const { data: participants } = await supabase
              .from('plan_participants')
              .select('vote, status')
              .eq('plan_id', item.plan.id);

            const voteCounts = {
              yes: 0,
              maybe: 0,
              no: 0,
              pending: 0,
            };

            (participants || []).forEach((p: any) => {
              if (p.vote === 'yes') voteCounts.yes++;
              else if (p.vote === 'maybe') voteCounts.maybe++;
              else if (p.vote === 'no') voteCounts.no++;
              else voteCounts.pending++;
            });

            return {
              id: item.plan.id,
              status: item.plan.status,
              planned_date: item.plan.planned_date,
              event: item.plan.event,
              vote_count: voteCounts,
              total_participants: participants?.length || 0,
            };
          })
      );

      setPlans(plansWithVotes);
    } catch (error: any) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterPlans = () => {
    const now = new Date().toISOString();

    if (tab === 'upcoming') {
      const upcoming = plans.filter(
        (plan) =>
          plan.status !== 'completed' &&
          plan.status !== 'cancelled' &&
          plan.planned_date >= now
      );
      setFilteredPlans(upcoming);
    } else {
      const past = plans.filter(
        (plan) =>
          plan.status === 'completed' ||
          plan.status === 'cancelled' ||
          plan.planned_date < now
      );
      setFilteredPlans(past);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPlans();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed':
        return '#f59e0b';
      case 'confirmed':
        return '#10b981';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'proposed':
        return 'clock-outline';
      case 'confirmed':
        return 'check-circle';
      case 'completed':
        return 'check-all';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const renderPlanCard = ({ item }: { item: Plan }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);
    const votedCount = item.vote_count.yes + item.vote_count.maybe + item.vote_count.no;

    return (
      <TouchableOpacity onPress={() => router.push(`/plan/${item.id}`)}>
        <Card style={styles.planCard} mode="elevated">
          <View style={styles.planRow}>
            {item.event.cover_image_url ? (
              <Image
                source={{ uri: item.event.cover_image_url }}
                style={styles.thumbnail}
              />
            ) : (
              <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
                <MaterialCommunityIcons name="calendar" size={32} color="#d1d5db" />
              </View>
            )}

            <View style={styles.planInfo}>
              <Text style={styles.planTitle} numberOfLines={2}>
                {item.event.title}
              </Text>

              <View style={styles.planMeta}>
                <MaterialCommunityIcons name="map-marker" size={14} color="#6b7280" />
                <Text style={styles.planVenue} numberOfLines={1}>
                  {item.event.venue.name}
                </Text>
              </View>

              <View style={styles.planMeta}>
                <MaterialCommunityIcons name="calendar-clock" size={14} color="#6b7280" />
                <Text style={styles.planDate}>{formatEventDate(item.planned_date)}</Text>
              </View>

              <View style={styles.planFooter}>
                <Chip
                  icon={statusIcon}
                  style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
                  textStyle={[styles.statusText, { color: statusColor }]}
                  compact
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Chip>

                {item.status === 'proposed' && (
                  <Text style={styles.voteCount}>
                    {votedCount} of {item.total_participants} voted
                  </Text>
                )}

                {item.status === 'confirmed' && (
                  <Text style={styles.confirmedCount}>
                    {item.vote_count.yes} going
                  </Text>
                )}
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name={tab === 'upcoming' ? 'calendar-blank' : 'calendar-check'}
        size={64}
        color="#d1d5db"
      />
      <Text style={styles.emptyTitle}>
        {tab === 'upcoming' ? 'No Upcoming Plans' : 'No Past Plans'}
      </Text>
      <Text style={styles.emptyText}>
        {tab === 'upcoming'
          ? 'Create a plan from the Events feed'
          : 'Your completed plans will appear here'}
      </Text>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="account-alert" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptyText}>
            Please sign in to view your plans
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Plans</Text>
        
        <SegmentedButtons
          value={tab}
          onValueChange={(value) => setTab(value as 'upcoming' | 'past')}
          buttons={[
            {
              value: 'upcoming',
              label: 'Upcoming',
              icon: 'calendar-clock',
            },
            {
              value: 'past',
              label: 'Past',
              icon: 'calendar-check',
            },
          ]}
          style={styles.tabs}
        />
      </View>

      {loading ? (
        <FlatList
          data={[1, 2, 3]}
          renderItem={() => <PlanListSkeleton count={1} />}
          keyExtractor={(item) => item.toString()}
        />
      ) : (
        <FlatList
          data={filteredPlans}
          renderItem={renderPlanCard}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={filteredPlans.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  tabs: {
    marginBottom: 0,
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
  },
  planCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  planRow: {
    flexDirection: 'row',
    padding: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderThumbnail: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  planMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  planVenue: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
    flex: 1,
  },
  planDate: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
  },
  planFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  voteCount: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  confirmedCount: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
