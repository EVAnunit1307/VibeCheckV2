import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { Text, Searchbar, Chip, Card, Button, Portal, Modal, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { formatEventDate, formatDistance } from '../../lib/helpers';
import { EventListSkeleton } from '../../components/LoadingSkeleton';

type Event = {
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
    city: string;
    latitude: number;
    longitude: number;
  };
};

const CATEGORIES = ['all', 'nightlife', 'dining', 'entertainment', 'other'];
const USER_LAT = 40.7589; // Mock user location (NYC)
const USER_LNG = -73.9851;

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
  const [distanceFilter, setDistanceFilter] = useState<number>(50); // miles

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          venue:venues(
            id,
            name,
            city,
            latitude,
            longitude
          )
        `)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(50);

      if (error) throw error;

      setEvents(data || []);
      setFilteredEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((event) => event.category === selectedCategory);
    }

    // Price filter
    if (priceFilter === 'free') {
      filtered = filtered.filter((event) => event.is_free);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter((event) => !event.is_free);
    }

    // Distance filter
    filtered = filtered.filter((event) => {
      const distance = calculateDistance(
        USER_LAT,
        USER_LNG,
        event.venue.latitude,
        event.venue.longitude
      );
      return distance <= distanceFilter;
    });

    setFilteredEvents(filtered);
  }, [searchQuery, selectedCategory, priceFilter, distanceFilter, events]);

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, []);

  const renderEventCard = ({ item }: { item: Event }) => {
    const distance = calculateDistance(
      USER_LAT,
      USER_LNG,
      item.venue.latitude,
      item.venue.longitude
    );

    const priceDisplay = item.is_free
      ? 'Free'
      : item.price_min === item.price_max
      ? `$${item.price_min}`
      : `$${item.price_min}-$${item.price_max}`;

    return (
      <TouchableOpacity onPress={() => router.push(`/event/${item.id}`)}>
        <Card style={styles.eventCard} mode="elevated">
          {item.cover_image_url && (
            <Card.Cover source={{ uri: item.cover_image_url }} style={styles.eventImage} />
          )}
          <Card.Content style={styles.eventContent}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {item.title}
            </Text>

            <View style={styles.eventRow}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#6b7280" />
              <Text style={styles.eventVenue} numberOfLines={1}>
                {item.venue.name}
              </Text>
            </View>

            <View style={styles.eventRow}>
              <MaterialCommunityIcons name="calendar-clock" size={16} color="#6b7280" />
              <Text style={styles.eventDate}>{formatEventDate(item.start_time)}</Text>
            </View>

            <View style={styles.eventFooter}>
              <Chip
                icon={item.is_free ? 'gift' : 'currency-usd'}
                style={[styles.priceChip, item.is_free && styles.freeChip]}
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
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="calendar-remove" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No Events Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'Try adjusting your search or filters'
          : 'Check back later for upcoming events'}
      </Text>
      {(searchQuery || selectedCategory !== 'all' || priceFilter !== 'all') && (
        <Button
          mode="outlined"
          onPress={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setPriceFilter('all');
            setDistanceFilter(50);
          }}
          style={styles.clearButton}
        >
          Clear Filters
        </Button>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Events</Text>
        <Searchbar
          placeholder="Search events or venues..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#6366f1"
        />

        {/* Category Filters */}
        <View style={styles.categoryContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Chip
                selected={selectedCategory === item}
                onPress={() => setSelectedCategory(item)}
                style={styles.categoryChip}
                selectedColor={selectedCategory === item ? '#fff' : '#6366f1'}
                textStyle={{
                  color: selectedCategory === item ? '#fff' : '#6b7280',
                }}
                mode={selectedCategory === item ? 'flat' : 'outlined'}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Chip>
            )}
            contentContainerStyle={styles.categoryList}
          />
          <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterButton}>
            <MaterialCommunityIcons name="filter-variant" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Event List */}
      {loading ? (
        <FlatList
          data={[1, 2, 3]}
          renderItem={() => <EventListSkeleton count={1} />}
          keyExtractor={(item) => item.toString()}
        />
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={showFilters}
          onDismiss={() => setShowFilters(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Filters</Text>

          <Text style={styles.filterLabel}>Price</Text>
          <View style={styles.filterRow}>
            <Chip
              selected={priceFilter === 'all'}
              onPress={() => setPriceFilter('all')}
              style={styles.filterChip}
              mode={priceFilter === 'all' ? 'flat' : 'outlined'}
            >
              All
            </Chip>
            <Chip
              selected={priceFilter === 'free'}
              onPress={() => setPriceFilter('free')}
              style={styles.filterChip}
              mode={priceFilter === 'free' ? 'flat' : 'outlined'}
            >
              Free
            </Chip>
            <Chip
              selected={priceFilter === 'paid'}
              onPress={() => setPriceFilter('paid')}
              style={styles.filterChip}
              mode={priceFilter === 'paid' ? 'flat' : 'outlined'}
            >
              Paid
            </Chip>
          </View>

          <Text style={styles.filterLabel}>Distance: {distanceFilter} miles</Text>
          <View style={styles.distanceOptions}>
            {[5, 10, 25, 50].map((miles) => (
              <Chip
                key={miles}
                selected={distanceFilter === miles}
                onPress={() => setDistanceFilter(miles)}
                style={styles.filterChip}
                mode={distanceFilter === miles ? 'flat' : 'outlined'}
              >
                {miles} mi
              </Chip>
            ))}
          </View>

          <Button mode="contained" onPress={() => setShowFilters(false)} style={styles.applyButton}>
            Apply Filters
          </Button>
        </Modal>
      </Portal>

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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  searchBar: {
    backgroundColor: '#f3f4f6',
    elevation: 0,
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryList: {
    paddingRight: 8,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#fff',
  },
  filterButton: {
    padding: 8,
  },
  list: {
    paddingVertical: 8,
  },
  eventCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  eventImage: {
    height: 200,
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventVenue: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
    flex: 1,
  },
  eventDate: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  eventFooter: {
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 64,
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
  clearButton: {
    marginTop: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  distanceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  applyButton: {
    backgroundColor: '#6366f1',
  },
});
