import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Chip, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';

type FoundUser = {
  id: string;
  full_name: string;
  phone_number: string;
  commitment_score: number;
};

export default function CreateGroupScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [groupName, setGroupName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [foundUsers, setFoundUsers] = useState<FoundUser[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<FoundUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearchUser = async () => {
    if (!searchPhone.trim()) {
      setSearchError('Please enter a phone number');
      return;
    }

    setSearching(true);
    setSearchError(null);
    setFoundUsers([]);

    try {
      // Search for users by phone number (partial match)
      const { data, error: searchError } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number, commitment_score')
        .ilike('phone_number', `%${searchPhone}%`)
        .neq('id', user?.id) // Don't include current user
        .limit(10);

      if (searchError) throw searchError;

      if (!data || data.length === 0) {
        setSearchError('No users found with that phone number');
        return;
      }

      // Filter out already selected members
      const newUsers = data.filter(
        (u: FoundUser) => !selectedMembers.some((m) => m.id === u.id)
      );

      setFoundUsers(newUsers);
    } catch (error: any) {
      console.error('Error searching users:', error);
      setSearchError(error.message || 'Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = (user: FoundUser) => {
    setSelectedMembers([...selectedMembers, user]);
    setFoundUsers(foundUsers.filter((u) => u.id !== user.id));
    setSearchPhone('');
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== userId));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      // Create the group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: groupName.trim(),
          created_by: user?.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin
      const members = [
        {
          group_id: groupData.id,
          user_id: user?.id,
          role: 'admin',
        },
      ];

      // Add selected members
      selectedMembers.forEach((member) => {
        members.push({
          group_id: groupData.id,
          user_id: member.id,
          role: 'member',
        });
      });

      const { error: membersError } = await supabase
        .from('group_members')
        .insert(members);

      if (membersError) throw membersError;

      // Navigate to the new group
      router.replace(`/group/${groupData.id}`);
    } catch (error: any) {
      console.error('Error creating group:', error);
      setError(error.message || 'Failed to create group');
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create a Group</Text>
            <Text style={styles.subtitle}>
              Invite friends to plan events together
            </Text>
          </View>

          {/* Group Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Group Name *</Text>
            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="e.g., Weekend Crew, Book Club, Work Friends"
              mode="outlined"
              style={styles.input}
              outlineColor="#e5e7eb"
              activeOutlineColor="#6366f1"
              error={!!error && !groupName.trim()}
            />
          </View>

          {/* Add Members */}
          <View style={styles.section}>
            <Text style={styles.label}>Add Members (Optional)</Text>
            <Text style={styles.helperText}>
              Search by phone number to invite friends
            </Text>

            <View style={styles.searchRow}>
              <TextInput
                value={searchPhone}
                onChangeText={setSearchPhone}
                placeholder="+1 (555) 000-0000"
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.searchInput}
                outlineColor="#e5e7eb"
                activeOutlineColor="#6366f1"
                error={!!searchError}
              />
              <Button
                mode="contained"
                onPress={handleSearchUser}
                loading={searching}
                disabled={searching}
                style={styles.searchButton}
                buttonColor="#6366f1"
                icon="magnify"
              >
                Search
              </Button>
            </View>

            {searchError && (
              <Text style={styles.searchError}>{searchError}</Text>
            )}

            {/* Found Users */}
            {foundUsers.length > 0 && (
              <View style={styles.foundUsers}>
                <Text style={styles.foundTitle}>Found Users</Text>
                {foundUsers.map((foundUser) => (
                  <Card key={foundUser.id} style={styles.userCard} mode="outlined">
                    <Card.Content>
                      <View style={styles.userRow}>
                        <View style={styles.userAvatar}>
                          <MaterialCommunityIcons
                            name="account"
                            size={24}
                            color="#6366f1"
                          />
                        </View>
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>{foundUser.full_name}</Text>
                          <Text style={styles.userPhone}>{foundUser.phone_number}</Text>
                          <Text style={styles.userScore}>
                            Score: {foundUser.commitment_score}
                          </Text>
                        </View>
                        <Button
                          mode="contained"
                          onPress={() => handleAddMember(foundUser)}
                          compact
                          buttonColor="#6366f1"
                        >
                          Add
                        </Button>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}

            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <View style={styles.selectedMembers}>
                <Text style={styles.selectedTitle}>
                  Selected Members ({selectedMembers.length})
                </Text>
                <View style={styles.membersList}>
                  {selectedMembers.map((member) => (
                    <Chip
                      key={member.id}
                      onClose={() => handleRemoveMember(member.id)}
                      style={styles.memberChip}
                      textStyle={styles.memberChipText}
                    >
                      {member.full_name}
                    </Chip>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Summary */}
          <Card style={styles.summaryCard} mode="outlined">
            <Card.Content>
              <View style={styles.summaryRow}>
                <MaterialCommunityIcons name="account-group" size={24} color="#6366f1" />
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryLabel}>Total Members</Text>
                  <Text style={styles.summaryValue}>
                    {selectedMembers.length + 1} (including you)
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Error Message */}
          {error && (
            <Card style={styles.errorCard} mode="outlined">
              <Card.Content>
                <View style={styles.errorRow}>
                  <MaterialCommunityIcons name="alert-circle" size={20} color="#ef4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Create Button */}
          <Button
            mode="contained"
            onPress={handleCreateGroup}
            loading={creating}
            disabled={creating || !groupName.trim()}
            style={styles.createButton}
            buttonColor="#6366f1"
            contentStyle={styles.createButtonContent}
            icon="check"
          >
            {creating ? 'Creating...' : 'Create Group'}
          </Button>

          <Button
            mode="text"
            onPress={() => router.back()}
            disabled={creating}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchButton: {
    justifyContent: 'center',
  },
  searchError: {
    marginTop: 8,
    fontSize: 12,
    color: '#ef4444',
  },
  foundUsers: {
    marginTop: 16,
  },
  foundTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  userCard: {
    marginBottom: 8,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  userScore: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '500',
  },
  selectedMembers: {
    marginTop: 16,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  membersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberChip: {
    backgroundColor: '#ede9fe',
  },
  memberChipText: {
    color: '#6366f1',
    fontWeight: '500',
  },
  summaryCard: {
    marginBottom: 16,
    borderColor: '#dbeafe',
    backgroundColor: '#eff6ff',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryInfo: {
    marginLeft: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  errorCard: {
    marginBottom: 16,
    borderColor: '#fecaca',
    backgroundColor: '#fee2e2',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#ef4444',
    flex: 1,
  },
  createButton: {
    borderRadius: 8,
    marginBottom: 12,
  },
  createButtonContent: {
    paddingVertical: 8,
  },
  cancelButton: {
    marginBottom: 16,
  },
});
