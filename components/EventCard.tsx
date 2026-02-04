import { TouchableOpacity, StyleSheet, View, Image } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatEventDate } from '../lib/helpers';

type Event = {
  id: string;
  title: string;
  cover_image_url: string | null;
  start_time: string;
  is_free: boolean;
  price_min: number | null;
  price_max: number | null;
  venue: {
    name: string;
    latitude: number;
    longitude: number;
  };
};

type EventCardProps = {
  event: Event;
  onPress: () => void;
  userLatitude?: number;
  userLongitude?: number;
};

export default function EventCard({
  event,
  onPress,
  userLatitude = 40.7589,
  userLongitude = -73.9851,
}: EventCardProps) {
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distance = calculateDistance(
    userLatitude,
    userLongitude,
    event.venue.latitude,
    event.venue.longitude
  );

  const priceDisplay = event.is_free
    ? 'Free'
    : event.price_min === event.price_max
    ? `$${event.price_min}`
    : `$${event.price_min}-$${event.price_max}`;

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card} mode="elevated">
        {event.cover_image_url && (
          <Card.Cover source={{ uri: event.cover_image_url }} style={styles.image} />
        )}
        <Card.Content style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>

          <View style={styles.row}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#6b7280" />
            <Text style={styles.venue} numberOfLines={1}>
              {event.venue.name}
            </Text>
          </View>

          <View style={styles.row}>
            <MaterialCommunityIcons name="calendar-clock" size={16} color="#6b7280" />
            <Text style={styles.date}>{formatEventDate(event.start_time)}</Text>
          </View>

          <View style={styles.footer}>
            <Chip
              icon={event.is_free ? 'gift' : 'currency-usd'}
              style={[styles.priceChip, event.is_free && styles.freeChip]}
              textStyle={styles.chipText}
            >
              {priceDisplay}
            </Chip>
            <Text style={styles.distance}>{distance.toFixed(1)} mi away</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  image: {
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  venue: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
    flex: 1,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  priceChip: {
    backgroundColor: '#dbeafe',
  },
  freeChip: {
    backgroundColor: '#dcfce7',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  distance: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});
