import { TouchableOpacity, StyleSheet, View, Image } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatEventDate } from '../lib/helpers';

type Plan = {
  id: string;
  status: 'proposed' | 'confirmed' | 'completed' | 'cancelled';
  planned_date: string;
  event: {
    title: string;
    cover_image_url: string | null;
    venue: {
      name: string;
    };
  };
  vote_count?: {
    yes: number;
    maybe: number;
    no: number;
    pending: number;
  };
  total_participants?: number;
};

type PlanCardProps = {
  plan: Plan;
  onPress: () => void;
};

export default function PlanCard({ plan, onPress }: PlanCardProps) {
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

  const statusColor = getStatusColor(plan.status);
  const statusIcon = getStatusIcon(plan.status);
  const votedCount = plan.vote_count
    ? plan.vote_count.yes + plan.vote_count.maybe + plan.vote_count.no
    : 0;

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card} mode="elevated">
        <View style={styles.row}>
          {plan.event.cover_image_url ? (
            <Image source={{ uri: plan.event.cover_image_url }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
              <MaterialCommunityIcons name="calendar" size={32} color="#d1d5db" />
            </View>
          )}

          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>
              {plan.event.title}
            </Text>

            <View style={styles.meta}>
              <MaterialCommunityIcons name="map-marker" size={14} color="#6b7280" />
              <Text style={styles.venue} numberOfLines={1}>
                {plan.event.venue.name}
              </Text>
            </View>

            <View style={styles.meta}>
              <MaterialCommunityIcons name="calendar-clock" size={14} color="#6b7280" />
              <Text style={styles.date}>{formatEventDate(plan.planned_date)}</Text>
            </View>

            <View style={styles.footer}>
              <Chip
                icon={statusIcon}
                style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
                textStyle={[styles.statusText, { color: statusColor }]}
                compact
              >
                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              </Chip>

              {plan.status === 'proposed' && plan.total_participants && (
                <Text style={styles.voteCount}>
                  {votedCount} of {plan.total_participants} voted
                </Text>
              )}

              {plan.status === 'confirmed' && plan.vote_count && (
                <Text style={styles.confirmedCount}>{plan.vote_count.yes} going</Text>
              )}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  row: {
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
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  venue: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
    flex: 1,
  },
  date: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
  },
  footer: {
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
});
