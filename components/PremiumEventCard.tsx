import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, vibes, dressCodes, VibeId, DressCodeId } from '../lib/theme';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

interface PremiumEventCardProps {
  id: string;
  title: string;
  venue: string;
  imageUrl: string;
  date: string;
  time: string;
  price: number | string;
  distance?: number;
  vibeTag?: VibeId;
  dressCode?: DressCodeId;
  ageRestriction?: string;
  attendees?: number;
  rideCost?: number;
}

export const PremiumEventCard: React.FC<PremiumEventCardProps> = ({
  id,
  title,
  venue,
  imageUrl,
  date,
  time,
  price,
  distance,
  vibeTag,
  dressCode,
  ageRestriction = '19+',
  attendees,
  rideCost,
}) => {
  const vibe = vibes.find(v => v.id === vibeTag);
  const dressCodeInfo = dressCodes.find(d => d.id === dressCode);

  return (
    <Pressable 
      style={styles.card}
      onPress={() => router.push(`/event/${id}`)}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.9)']}
          style={styles.gradient}
        >
          {/* Top badges */}
          <View style={styles.topBadges}>
            {vibe && (
              <View style={[styles.vibeBadge, { backgroundColor: vibe.color }]}>
                <Text style={styles.vibeText}>{vibe.label}</Text>
              </View>
            )}
            {ageRestriction && (
              <View style={styles.ageBadge}>
                <Text style={styles.ageText}>{ageRestriction}</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>{title}</Text>
            
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.accent} />
              <Text style={styles.venue} numberOfLines={1}>{venue}</Text>
              {distance && (
                <Text style={styles.distance}> • {distance.toFixed(1)} mi</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.accent} />
              <Text style={styles.dateTime}>{date} • {time}</Text>
            </View>

            {/* Bottom row with quick info */}
            <View style={styles.bottomRow}>
              <View style={styles.leftInfo}>
                {dressCodeInfo && (
                  <View style={styles.dressCodeChip}>
                    <Text style={styles.dressCodeIcon}>{dressCodeInfo.icon}</Text>
                    <Text style={styles.dressCodeText}>{dressCodeInfo.label}</Text>
                  </View>
                )}
              </View>

              <View style={styles.rightInfo}>
                {attendees && attendees > 0 && (
                  <View style={styles.attendeesChip}>
                    <MaterialCommunityIcons name="account-group" size={14} color={theme.colors.success} />
                    <Text style={styles.attendeesText}>{attendees}</Text>
                  </View>
                )}
                
                {rideCost && (
                  <View style={styles.rideChip}>
                    <MaterialCommunityIcons name="car" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.rideText}>${rideCost}</Text>
                  </View>
                )}

                <View style={styles.priceChip}>
                  <Text style={styles.priceText}>
                    {typeof price === 'number' ? `$${price}` : price}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  image: {
    borderRadius: theme.borderRadius.lg,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 12,
  },
  topBadges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  vibeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.md,
  },
  vibeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  ageBadge: {
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  ageText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  venue: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: theme.typography.weights.medium,
    flex: 1,
  },
  distance: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  dateTime: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: theme.typography.weights.medium,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  leftInfo: {
    flex: 1,
  },
  dressCodeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.glass,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
    gap: 4,
    alignSelf: 'flex-start',
  },
  dressCodeIcon: {
    fontSize: 12,
  },
  dressCodeText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  rightInfo: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  attendeesChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  attendeesText: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  rideChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.glass,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  rideText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  priceChip: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.neon,
  },
  priceText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
