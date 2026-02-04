/**
 * Event Detail Screen - Eventbrite/Fever Style
 * With Google Maps, venue info, and create plan CTA
 */

import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity, Linking, Platform } from 'react-native';
import { Text, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { formatEventDate } from '../../lib/helpers';
import { generateTorontoEvents } from '../../lib/toronto-events';

const { width, height } = Dimensions.get('window');

type EventDetail = {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  category: string;
  is_free: boolean;
  priceMin?: number;
  priceMax?: number;
  cover_image_url: string | null;
  url?: string;
  venue: {
    name: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
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
      // For now, get from Toronto events generator
      // In production, this would fetch from Supabase or API
      const allEvents = generateTorontoEvents(50);
      const foundEvent = allEvents.find((e) => e.id === id);

      if (!foundEvent) {
        setError('Event not found');
        return;
      }

      setEvent(foundEvent as any);
    } catch (error: any) {
      console.error('Error fetching event:', error);
      setError(error.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    router.push(`/create-plan?eventId=${id}` as any);
  };

  const handleOpenInMaps = () => {
    if (!event?.venue) return;

    const { latitude, longitude, name, address } = event.venue;
    const label = encodeURIComponent(name);
    const query = encodeURIComponent(`${address}, ${event.venue.city}`);

    let url = '';
    if (Platform.OS === 'ios') {
      url = `maps://app?daddr=${latitude},${longitude}&q=${label}`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${label}`;
    }

    Linking.openURL(url).catch(() => {
      // Fallback to web Google Maps
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    });
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share event:', event?.title);
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
      <SafeAreaView style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>{error || 'Event not found'}</Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </SafeAreaView>
    );
  }

  const getPriceDisplay = () => {
    if (event.is_free) return 'FREE';
    if (event.priceMin && event.priceMax) {
      return `$${event.priceMin} - $${event.priceMax}`;
    }
    if (event.priceMin) return `From $${event.priceMin}`;
    return 'Paid Event';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <MaterialCommunityIcons name="share-variant" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: event.cover_image_url || 'https://via.placeholder.com/400x300' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          
          {/* Price Badge */}
          <View style={[styles.priceBadge, event.is_free && styles.freeBadge]}>
            <Text style={styles.priceText}>{getPriceDisplay()}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category */}
          {event.category && (
            <Chip mode="flat" style={styles.categoryChip} textStyle={styles.categoryChipText}>
              {event.category}
            </Chip>
          )}

          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Date & Time */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="calendar" size={20} color="#6366f1" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Date & Time</Text>
                <Text style={styles.infoValue}>{formatEventDate(event.start_time)}</Text>
              </View>
            </View>
          </View>

          {/* Venue with Map */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#6366f1" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{event.venue.name}</Text>
                <Text style={styles.infoSubtext}>{event.venue.address}, {event.venue.city}</Text>
              </View>
            </View>

            {/* Map Preview */}
            <View style={styles.mapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                  latitude: event.venue.latitude,
                  longitude: event.venue.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: event.venue.latitude,
                    longitude: event.venue.longitude,
                  }}
                  title={event.venue.name}
                />
              </MapView>
              
              {/* Tap to expand */}
              <TouchableOpacity style={styles.mapOverlay} onPress={handleOpenInMaps}>
                <View style={styles.mapButton}>
                  <MaterialCommunityIcons name="directions" size={16} color="#6366f1" />
                  <Text style={styles.mapButtonText}>Get Directions</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          {event.description && (
            <View style={styles.descriptionCard}>
              <Text style={styles.sectionTitle}>About This Event</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          {/* Spacer for fixed button */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Fixed CTA Button */}
      <SafeAreaView edges={['bottom']} style={styles.ctaContainer}>
        <Button
          mode="contained"
          onPress={handleCreatePlan}
          style={styles.ctaButton}
          contentStyle={styles.ctaButtonContent}
          labelStyle={styles.ctaButtonLabel}
          icon="account-group"
        >
          Create Plan with Friends
        </Button>
      </SafeAreaView>
    </View>
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
    padding: 40,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    width: width,
    height: height * 0.4,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  freeBadge: {
    backgroundColor: '#10b981',
  },
  priceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e7ff',
    marginBottom: 12,
  },
  categoryChipText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    lineHeight: 36,
  },
  infoCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  mapContainer: {
    marginTop: 16,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 12,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  descriptionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButton: {
    borderRadius: 12,
    backgroundColor: '#6366f1',
  },
  ctaButtonContent: {
    paddingVertical: 8,
  },
  ctaButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
});
