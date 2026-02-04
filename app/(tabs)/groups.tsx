import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, FAB, Card, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';
import { GroupListSkeleton } from '../../components/LoadingSkeleton';

type Group = {
  id: string;
  name: string;
  created_at: string;
  member_count: number;
  role: string;
};

export default function GroupsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, [user?.id]);

  const fetchGroups = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Get user's groups with member count
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          role,
          group:groups (
            id,
            name,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // For each group, count members
      const groupsWithCounts = await Promise.all(
        (data || []).map(async (item: any) => {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', item.group.id);

          return {
            id: item.group.id,
            name: item.group.name,
            created_at: item.group.created_at,
            member_count: count || 0,
            role: item.role,
          };
        })
      );

      setGroups(groupsWithCounts);
    } catch (error: any) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGroups();
  }, []);

  const renderGroupCard = ({ item }: { item: Group }) => {
    const initials = item.name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <TouchableOpacity onPress={() => router.push(`/group/${item.id}`)}>
        <Card style={styles.groupCard} mode="elevated">
          <Card.Content>
            <View style={styles.groupRow}>
              <Avatar.Text
                size={56}
                label={initials}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
                color="#fff"
              />
              <View style={styles.groupInfo}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.role === 'admin' && (
                    <MaterialCommunityIcons name="crown" size={16} color="#f59e0b" />
                  )}
                </View>
                <View style={styles.memberRow}>
                  <MaterialCommunityIcons name="account-multiple" size={16} color="#6b7280" />
                  <Text style={styles.memberCount}>
                    {item.member_count} {item.member_count === 1 ? 'member' : 'members'}
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="account-group-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No Groups Yet</Text>
      <Text style={styles.emptyText}>
        Create a group to start planning events with friends
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
            Please sign in to view your groups
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Groups</Text>
        <Text style={styles.headerSubtitle}>
          {groups.length} {groups.length === 1 ? 'group' : 'groups'}
        </Text>
      </View>

      {loading ? (
        <FlatList
          data={[1, 2, 3]}
          renderItem={() => <GroupListSkeleton count={1} />}
          keyExtractor={(item) => item.toString()}
        />
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroupCard}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={groups.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/create-group')}
        label="Create Group"
        color="#fff"
      />

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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
  },
  groupCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#6366f1',
    marginRight: 16,
  },
  avatarLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
    flex: 1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6366f1',
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
