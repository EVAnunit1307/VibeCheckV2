import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import { formatEventDate } from '../lib/helpers';

type Group = {
  id: string;
  name: string;
  member_count: number;
};

type Event = {
  id: string;
  title: string;
  start_time: string;
  cover_image_url: string | null;
  venue: {
    name: string;
  };
};

export default function CreatePlanScreen() {
  const router = useRouter();
  const { eventId, groupId: preselectedGroupId } = useLocalSearchParams();
  const { user } = useAuthStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    preselectedGroupId as string || ''
  );
  const [description, setDescription] = useState('');
  const [plannedDate, setPlannedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [minAttendees, setMinAttendees] = useState(3);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      // Fetch event details
      if (eventId) {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select(`
            id,
            title,
            start_time,
            cover_image_url,
            venue:venues(name)
          `)
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;
        setEvent(eventData);
        setPlannedDate(new Date(eventData.start_time));
      }

      // Fetch user's groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('group_members')
        .select(`
          group:groups(
            id,
            name
          )
        `)
        .eq('user_id', user?.id);

      if (groupsError) throw groupsError;

      const userGroups = groupsData
        .map((item: any) => item.group)
        .filter(Boolean);

      setGroups(userGroups);

      // Pre-select first group if no group is pre-selected
      if (!preselectedGroupId && userGroups.length > 0) {
        setSelectedGroupId(userGroups[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!selectedGroupId) {
      setError('Please select a group');
      return;
    }

    if (!eventId) {
      setError('Event is required');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      // Create the plan
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .insert({
          event_id: eventId,
          group_id: selectedGroupId,
          created_by: user?.id,
          description: description.trim() || null,
          planned_date: plannedDate.toISOString(),
          min_attendees: minAttendees,
          status: 'proposed',
        })
        .select()
        .single();

      if (planError) throw planError;

      // Get all group members
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', selectedGroupId);

      if (membersError) throw membersError;

      // Add all members as participants
      const participants = membersData.map((member: any) => ({
        plan_id: planData.id,
        user_id: member.user_id,
        status: 'pending',
        vote: null,
      }));

      const { error: participantsError } = await supabase
        .from('plan_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      // Navigate to the new plan
      router.replace(`/plan/${planData.id}`);
    } catch (error: any) {
      console.error('Error creating plan:', error);
      setError(error.message || 'Failed to create plan');
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="account-group-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No Groups Yet</Text>
          <Text style={styles.emptyText}>
            You need to create a group before you can make plans
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/create-group')}
            style={styles.emptyButton}
            icon="plus"
          >
            Create Your First Group
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create a Plan</Text>
          <Text style={styles.subtitle}>Invite your group to this event</Text>
        </View>

        {/* Event Preview */}
        {event && (
          <Card style={styles.eventCard} mode="elevated">
            <Card.Content>
              <View style={styles.eventRow}>
                <MaterialCommunityIcons name="calendar" size={32} color="#6366f1" />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventVenue}>{event.venue.name}</Text>
                  <Text style={styles.eventDate}>{formatEventDate(event.start_time)}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Select Group */}
        <View style={styles.section}>
          <Text style={styles.label}>Select Group</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedGroupId}
              onValueChange={(value) => setSelectedGroupId(value)}
              style={styles.picker}
            >
              <Picker.Item label="Choose a group..." value="" />
              {groups.map((group) => (
                <Picker.Item key={group.id} label={group.name} value={group.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add any notes or details..."
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            outlineColor="#e5e7eb"
            activeOutlineColor="#6366f1"
          />
        </View>

        {/* Planned Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Planned Date & Time</Text>
          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            icon="calendar"
            style={styles.dateButton}
            contentStyle={styles.dateButtonContent}
          >
            {formatEventDate(plannedDate.toISOString())}
          </Button>
          {showDatePicker && (
            <DateTimePicker
              value={plannedDate}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) setPlannedDate(date);
              }}
            />
          )}
        </View>

        {/* Minimum Attendees */}
        <View style={styles.section}>
          <Text style={styles.label}>Minimum Attendees</Text>
          <Text style={styles.helperText}>
            Plan auto-confirms when this many people vote YES
          </Text>
          <View style={styles.attendeesRow}>
            {[2, 3, 4, 5, 6].map((num) => (
              <Chip
                key={num}
                selected={minAttendees === num}
                onPress={() => setMinAttendees(num)}
                style={styles.attendeeChip}
                mode={minAttendees === num ? 'flat' : 'outlined'}
                selectedColor={minAttendees === num ? '#fff' : '#6366f1'}
                textStyle={{
                  color: minAttendees === num ? '#fff' : '#111827',
                  fontWeight: '600',
                }}
              >
                {num}
              </Chip>
            ))}
          </View>
        </View>

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
          onPress={handleCreatePlan}
          loading={creating}
          disabled={creating || !selectedGroupId}
          style={styles.createButton}
          buttonColor="#6366f1"
          contentStyle={styles.createButtonContent}
          icon="check"
        >
          {creating ? 'Creating...' : 'Create Plan'}
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
      <StatusBar style="auto" />
    </SafeAreaView>
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
  eventCard: {
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventInfo: {
    marginLeft: 16,
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  eventVenue: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 12,
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
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  input: {
    backgroundColor: '#fff',
  },
  dateButton: {
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  dateButtonContent: {
    paddingVertical: 8,
  },
  attendeesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attendeeChip: {
    minWidth: 50,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#6366f1',
  },
});
