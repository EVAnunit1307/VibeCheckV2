/**
 * Modern Event Card - Eventbrite/Fever Style
 * Clean, image-focused, with all key info visible
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatEventDate } from '../lib/helpers';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

interface Event {
  id: string;
  title: string;
  start_time: string;
  is_free: boolean;
  cover_image_url: string;
  venue: {
    name: string;
    city: string;
    address: string;
  };
  priceMin?: number;
  priceMax?: number;
  category?: string;
}

interface Props {
  event: Event;
  onPress: () => void;
  distance?: string;
}

export function ModernEventCard({ event, onPress, distance }: Props) {
  const getPriceDisplay = () => {
    if (event.is_free) return 'FREE';
    if (event.priceMin && event.priceMax) {
      return `$${event.priceMin}-${event.priceMax}`;
    }
    if (event.priceMin) return `From $${event.priceMin}`;
    return 'Paid';
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.cover_image_url }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Price Badge */}
        <View style={[styles.priceBadge, event.is_free && styles.freeBadge]}>
          <Text style={styles.priceText}>{getPriceDisplay()}</Text>
        </View>

        {/* Category Badge */}
        {event.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Date */}
        <View style={styles.dateRow}>
          <MaterialCommunityIcons name="calendar" size={16} color="#6366f1" />
          <Text style={styles.dateText}>{formatEventDate(event.start_time)}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        {/* Venue */}
        <View style={styles.venueRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color="#6b7280" />
          <Text style={styles.venueText} numberOfLines={1}>
            {event.venue.name}
          </Text>
          {distance && (
            <Text style={styles.distanceText}>• {distance}</Text>
          )}
        </View>

        {/* CTA */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaButton} onPress={onPress}>
            <Text style={styles.ctaText}>View Details</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  freeBadge: {
    backgroundColor: '#10b981',
  },
  priceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 24,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  venueText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  distanceText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  ctaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
});
