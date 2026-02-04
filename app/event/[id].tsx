import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { Text, Button, Card, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { formatEventDate } from '../../lib/helpers';

const { width } = Dimensions.get('window');

type EventDetail = {
  id: string;
  title: string;
  description: string;
  start_time: string;
  category: string;
  is_free: boolean;
  price_min: number | null;
  price_max: number | null;
  cover_image_url: string | null;
  venue: {
    id: string;
    name: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    category: string;
    price_range: string;
  };
};

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          venue:venues(
            id,
            name,
            address,
            city,
            latitude,
            longitude,
            category,
            price_range
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        setError('Event not found');
        return;
      }

      setEvent(data);
    } catch (error: any) {
      console.error('Error fetching event:', error);
      setError(error.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    router.push(`/create-plan?eventId=${id}`);
  };

  const handleViewVenue = () => {
    if (event?.venue) {
      // Could navigate to a venue detail screen or open in maps
      const { latitude, longitude, name } = event.venue;
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      console.log('Open maps:', url);
      // On mobile, you'd use Linking.openURL(url)
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error || 'Event not found'}</Text>
          <Button mode="contained" onPress={() => router.back()} style={styles.errorButton}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const priceDisplay = event.is_free
    ? 'Free'
    : event.price_min === event.price_max
    ? `$${event.price_min}`
    : `$${event.price_min} - $${event.price_max}`;

  const categoryIcon =
    event.category === 'nightlife'
      ? 'glass-cocktail'
      : event.category === 'dining'
      ? 'silverware-fork-knife'
      : event.category === 'entertainment'
      ? 'music'
      : 'calendar';

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerTransparent: true,
          headerTintColor: '#fff',
          headerStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Hero Image */}
          {event.cover_image_url && (
            <View style={styles.heroContainer}>
              <Image source={{ uri: event.cover_image_url }} style={styles.heroImage} />
              <View style={styles.heroOverlay} />
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>{event.title}</Text>
              <View style={styles.categoryRow}>
                <Chip
                  icon={categoryIcon}
                  style={styles.categoryChip}
                  textStyle={styles.categoryText}
                >
                  {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                </Chip>
                <Chip
                  icon={event.is_free ? 'gift' : 'currency-usd'}
                  style={[styles.priceChip, event.is_free && styles.freeChip]}
                  textStyle={styles.priceText}
                >
                  {priceDisplay}
                </Chip>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Date & Time */}
            <Card style={styles.infoCard} mode="outlined">
              <Card.Content>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="calendar-clock" size={24} color="#6366f1" />
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>When</Text>
                    <Text style={styles.infoValue}>{formatEventDate(event.start_time)}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Venue */}
            <Card style={styles.infoCard} mode="outlined">
              <Card.Content>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="map-marker" size={24} color="#6366f1" />
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Where</Text>
                    <Text style={styles.infoValue}>{event.venue.name}</Text>
                    <Text style={styles.infoSubValue}>
                      {event.venue.address}, {event.venue.city}
                    </Text>
                  </View>
                </View>
              </Card.Content>
              <Card.Actions>
                <Button
                  mode="text"
                  onPress={handleViewVenue}
                  icon="map"
                  textColor="#6366f1"
                >
                  View on Map
                </Button>
              </Card.Actions>
            </Card>

            {/* Description */}
            {event.description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>About This Event</Text>
                <Text style={styles.description}>{event.description}</Text>
              </View>
            )}

            {/* Venue Details */}
            <View style={styles.venueDetails}>
              <Text style={styles.sectionTitle}>Venue Details</Text>
              <View style={styles.venueRow}>
                <MaterialCommunityIcons name="store" size={20} color="#6b7280" />
                <Text style={styles.venueText}>
                  {event.venue.category.charAt(0).toUpperCase() + event.venue.category.slice(1)}
                </Text>
              </View>
              <View style={styles.venueRow}>
                <MaterialCommunityIcons name="cash" size={20} color="#6b7280" />
                <Text style={styles.venueText}>Price Range: {event.venue.price_range}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Create Plan Button (Fixed at bottom) */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleCreatePlan}
            style={styles.createButton}
            buttonColor="#6366f1"
            contentStyle={styles.createButtonContent}
            icon="calendar-plus"
          >
            Create Plan for This Event
          </Button>
        </View>

        <StatusBar style="light" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#6366f1',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroContainer: {
    width: width,
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    padding: 16,
  },
  titleSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 36,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#ede9fe',
  },
  categoryText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  priceChip: {
    backgroundColor: '#dbeafe',
  },
  freeChip: {
    backgroundColor: '#dcfce7',
  },
  priceText: {
    color: '#111827',
    fontWeight: '600',
  },
  divider: {
    marginVertical: 16,
  },
  infoCard: {
    marginBottom: 12,
    borderColor: '#e5e7eb',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 2,
  },
  infoSubValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  descriptionSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  venueDetails: {
    marginTop: 8,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  venueText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  createButton: {
    borderRadius: 8,
  },
  createButtonContent: {
    paddingVertical: 8,
  },
});
