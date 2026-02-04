// Event feed - Browse and discover events

import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Text, Searchbar, Chip, Button, Portal, Modal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { fetchRealEvents, RealEvent } from '../../lib/events-api-real';
import { searchRealEventsWithGemini } from '../../lib/gemini-search-real';
import { calculateDistance } from '../../lib/helpers';
import { EventListSkeleton } from '../../components/LoadingSkeleton';
import { LoadingProgress } from '../../components/LoadingProgress';
import { PremiumEventCard } from '../../components/PremiumEventCard';
import { MAJOR_CITIES, City, getDefaultCity } from '../../lib/cities';
import { estimateRideCost } from '../../lib/ride-estimates';
import { cacheEvents } from '../../lib/event-store';

type Event = RealEvent;

const CATEGORIES = [
  { id: 'all', name: '🎭 All', icon: 'view-grid' },
  { id: '103', name: '🎵 Music', icon: 'music' },
  { id: '110', name: '🍕 Food', icon: 'food' },
  { id: '105', name: '🎬 Arts', icon: 'palette' },
  { id: '108', name: '⚽ Sports', icon: 'basketball' },
  { id: '116', name: '✈️ Travel', icon: 'airplane' },
];

export default function FeedScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City>(getDefaultCity());
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Initialize with default city (Toronto)
  useEffect(() => {
    setUserLocation({
      latitude: selectedCity.latitude,
      longitude: selectedCity.longitude,
    });
  }, [selectedCity]);

  // Request location permissions
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setLocationPermission(true);
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
      }
    })();
  }, []);

  // Fetch REAL EVENTS - Gemini searches web, then try direct APIs
  const fetchEvents = async () => {
    if (!userLocation) return;

    try {
      setLoading(true);
      setLoadingProgress(0.1);
      setLoadingStatus('🔍 Searching for real events...');

      console.log(`\n📍 Fetching events for ${selectedCity.name}...`);

      let allEvents: Event[] = [];
      let sources: string[] = [];

      // STRATEGY 1: Gemini Web Search (searches Instagram, Eventbrite, etc.)
      if (process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
        setLoadingProgress(0.2);
        setLoadingStatus('🤖 Gemini searching the web...');
        
        try {
          const geminiResult = await searchRealEventsWithGemini(
            selectedCity.name,
            selectedCity.province,
            {
              category: selectedCategory !== 'all' ? selectedCategory : undefined,
              when: 'upcoming this month and next month',
              query: searchQuery,
            },
            (status) => {
              setLoadingStatus(status);
              console.log('Gemini:', status);
            }
          );

          if (geminiResult.success && geminiResult.events.length > 0) {
            allEvents.push(...(geminiResult.events as any));
            sources.push(...geminiResult.sources);
            console.log(`✅ Gemini: ${geminiResult.events.length} real events found via web search`);
          }
        } catch (geminiError) {
          console.warn('⚠️ Gemini search failed:', geminiError);
        }
      }

      // STRATEGY 2: Direct APIs (Ticketmaster, Eventbrite, SeatGeek)
      setLoadingProgress(0.6);
      setLoadingStatus('🎫 Checking Ticketmaster & more...');
      
      try {
        const apiResult = await fetchRealEvents(
          userLocation.latitude,
          userLocation.longitude,
          25,
          selectedCategory !== 'all' ? selectedCategory : undefined
        );

        if (apiResult.success && apiResult.events.length > 0) {
          allEvents.push(...apiResult.events);
          sources.push(...apiResult.sources);
          console.log(`✅ APIs: ${apiResult.events.length} events from ${apiResult.sources.join(', ')}`);
        }
      } catch (apiError) {
        console.warn('⚠️ Direct APIs failed:', apiError);
      }

      setLoadingProgress(0.9);

      // Remove duplicates (same title + same date)
      const uniqueEvents = deduplicateEvents(allEvents);
      
      if (uniqueEvents.length > 0) {
        setLoadingStatus(`✅ Found ${uniqueEvents.length} real events from ${sources.length} sources`);
        
        console.log(`✅ TOTAL: ${uniqueEvents.length} verified events`);
        console.log(`   Sources: ${sources.join(', ')}`);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setLoadingProgress(1);
        cacheEvents(uniqueEvents);
        setEvents(uniqueEvents);
        setFilteredEvents(uniqueEvents);
      } else {
        const message = sources.length === 0 
          ? 'No API keys configured. Add Gemini or Ticketmaster key to .env'
          : `No events found in ${selectedCity.name}. Try a different city or category.`;
        
        console.warn(`⚠️ ${message}`);
        setLoadingStatus('⚠️ No events found');
        Alert.alert('No Events', message);
        setEvents([]);
        setFilteredEvents([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching events:', error);
      setLoadingStatus('❌ Failed to load events');
      Alert.alert('Error', 'Failed to load events. Please try again.');
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingProgress(1);
      setLoadingStatus('');
    }
  };

  // Helper to remove duplicate events
  const deduplicateEvents = (events: Event[]): Event[] => {
    const seen = new Set<string>();
    return events.filter(event => {
      const key = `${event.title.toLowerCase()}_${event.start_time}_${event.venue.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  useEffect(() => {
    if (userLocation) {
      fetchEvents();
    }
  }, [userLocation, selectedCategory]);

  // Apply filters
  useEffect(() => {
    let filtered = [...events];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.venue.name.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query)
      );
    }

    // Price filter
    if (priceFilter === 'free') {
      filtered = filtered.filter((event) => event.is_free);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter((event) => !event.is_free);
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, priceFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, [userLocation, selectedCategory]);

  const handleUseMyLocation = async () => {
    if (!locationPermission) {
      Alert.alert(
        'Location Permission Required',
        'Please enable location permissions in your device settings.'
      );
      return;
    }

    try {
      setLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      Alert.alert('✅ Success', 'Now showing events near your actual location!');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderEventCard = ({ item }: { item: Event }) => {
    const distance = userLocation && item.venue.latitude && item.venue.longitude
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          item.venue.latitude,
          item.venue.longitude
        )
      : undefined;

    // Calculate ride cost estimate
    const rideCost = userLocation && item.venue.latitude && item.venue.longitude
      ? estimateRideCost(
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          { latitude: item.venue.latitude, longitude: item.venue.longitude },
          new Date(item.start_time)
        ).average
      : undefined;

    // Format date and time
    const eventDate = new Date(item.start_time);
    const formattedDate = eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const formattedTime = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    // Format price
    const price = item.is_free ? 'Free' : item.priceMin ? item.priceMin : 'TBA';

    return (
      <PremiumEventCard
        id={item.id}
        title={item.title}
        venue={item.venue.name}
        imageUrl={item.cover_image_url}
        date={formattedDate}
        time={formattedTime}
        price={price}
        distance={distance}
        vibeTag={item.vibeTag}
        dressCode={item.dressCode}
        ageRestriction={item.ageRestriction}
        attendees={item.estimatedAttendees}
        rideCost={rideCost}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="calendar-remove-outline" size={80} color="#e5e7eb" />
      <Text style={styles.emptyStateTitle}>No events found</Text>
      <Text style={styles.emptyStateText}>
        Try adjusting your filters or selecting a different city
      </Text>
      <Button mode="contained" onPress={onRefresh} style={styles.emptyStateButton}>
        Refresh Feed
      </Button>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🎫 Real Events</Text>
          <TouchableOpacity onPress={() => setShowCityPicker(true)} style={styles.locationButton}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#6366f1" />
            <Text style={styles.locationText}>{selectedCity.name}, {selectedCity.province}</Text>
            <MaterialCommunityIcons name="chevron-down" size={16} color="#6366f1" />
          </TouchableOpacity>
          <Text style={styles.headerSubtext}>AI-powered web search + verified APIs</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search events, venues..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          icon="magnify"
          clearIcon="close"
        />
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat.id}
            selected={selectedCategory === cat.id}
            onPress={() => setSelectedCategory(cat.id)}
            style={[
              styles.categoryChip,
              selectedCategory === cat.id && styles.categoryChipSelected,
            ]}
            textStyle={[
              styles.categoryChipText,
              selectedCategory === cat.id && styles.categoryChipTextSelected,
            ]}
            mode="flat"
          >
            {cat.name}
          </Chip>
        ))}
      </ScrollView>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <MaterialCommunityIcons name="filter-variant" size={18} color="#6366f1" />
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>

        {priceFilter !== 'all' && (
          <Chip
            onClose={() => setPriceFilter('all')}
            style={styles.activeFilterChip}
            textStyle={styles.activeFilterText}
          >
            {priceFilter === 'free' ? 'Free only' : 'Paid only'}
          </Chip>
        )}
      </View>

      {/* Events List */}
      {loading && !refreshing ? (
        <LoadingProgress status={loadingStatus} progress={loadingProgress} />
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6366f1']}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* City Selection Modal */}
      <Portal>
        <Modal
          visible={showCityPicker}
          onDismiss={() => setShowCityPicker(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Select a City</Text>
          <ScrollView style={styles.cityList}>
            {MAJOR_CITIES.map((city) => (
              <TouchableOpacity
                key={city.name}
                style={[
                  styles.cityItem,
                  selectedCity.name === city.name && styles.cityItemSelected,
                ]}
                onPress={() => {
                  setSelectedCity(city);
                  setShowCityPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.cityItemText,
                    selectedCity.name === city.name && styles.cityItemTextSelected,
                  ]}
                >
                  {city.emoji} {city.name}, {city.province}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button
            mode="contained"
            onPress={handleUseMyLocation}
            disabled={!locationPermission}
            style={styles.useLocationButton}
            icon="crosshairs-gps"
          >
            Use My Current Location
          </Button>
        </Modal>

        {/* Price Filter Modal */}
        <Modal
          visible={showFilters}
          onDismiss={() => setShowFilters(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Filter by Price</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                priceFilter === 'all' && styles.filterOptionSelected,
              ]}
              onPress={() => {
                setPriceFilter('all');
                setShowFilters(false);
              }}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  priceFilter === 'all' && styles.filterOptionTextSelected,
                ]}
              >
                All Events
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                priceFilter === 'free' && styles.filterOptionSelected,
              ]}
              onPress={() => {
                setPriceFilter('free');
                setShowFilters(false);
              }}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  priceFilter === 'free' && styles.filterOptionTextSelected,
                ]}
              >
                Free Only
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                priceFilter === 'paid' && styles.filterOptionSelected,
              ]}
              onPress={() => {
                setPriceFilter('paid');
                setShowFilters(false);
              }}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  priceFilter === 'paid' && styles.filterOptionTextSelected,
                ]}
              >
                Paid Only
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  headerSubtext: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    fontStyle: 'italic',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f3f4f6',
  },
  searchInput: {
    fontSize: 15,
  },
  categoryList: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryChipSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryChipText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  activeFilterChip: {
    backgroundColor: '#e0e7ff',
  },
  activeFilterText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    marginTop: 10,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#111827',
  },
  cityList: {
    maxHeight: 300,
  },
  cityItem: {
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  cityItemSelected: {
    backgroundColor: '#e0e7ff',
  },
  cityItemText: {
    fontSize: 16,
    color: '#374151',
  },
  cityItemTextSelected: {
    fontWeight: '700',
    color: '#6366f1',
  },
  useLocationButton: {
    marginTop: 20,
  },
  filterOptions: {
    gap: 12,
  },
  filterOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  filterOptionSelected: {
    backgroundColor: '#e0e7ff',
    borderColor: '#6366f1',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: '#6366f1',
    fontWeight: '700',
  },
});
