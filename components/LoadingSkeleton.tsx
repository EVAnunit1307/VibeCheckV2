import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Card } from 'react-native-paper';

// Shimmer animation component
function ShimmerView({ style }: { style?: any }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        style,
        {
          backgroundColor: '#e5e7eb',
          opacity,
        },
      ]}
    />
  );
}

// Event Card Skeleton
export function EventCardSkeleton() {
  return (
    <Card style={styles.eventCard} mode="elevated">
      <ShimmerView style={styles.eventImage} />
      <Card.Content style={styles.eventContent}>
        <ShimmerView style={styles.eventTitle} />
        <View style={styles.eventRow}>
          <ShimmerView style={styles.eventIcon} />
          <ShimmerView style={styles.eventText} />
        </View>
        <View style={styles.eventRow}>
          <ShimmerView style={styles.eventIcon} />
          <ShimmerView style={styles.eventTextShort} />
        </View>
        <View style={styles.eventFooter}>
          <ShimmerView style={styles.eventBadge} />
          <ShimmerView style={styles.eventDistance} />
        </View>
      </Card.Content>
    </Card>
  );
}

// Plan Card Skeleton
export function PlanCardSkeleton() {
  return (
    <Card style={styles.planCard} mode="elevated">
      <Card.Content style={styles.planContent}>
        <View style={styles.planHeader}>
          <ShimmerView style={styles.planThumbnail} />
          <View style={styles.planInfo}>
            <ShimmerView style={styles.planTitle} />
            <ShimmerView style={styles.planSubtitle} />
            <ShimmerView style={styles.planStatus} />
          </View>
        </View>
        <ShimmerView style={styles.planProgress} />
      </Card.Content>
    </Card>
  );
}

// Group Card Skeleton
export function GroupCardSkeleton() {
  return (
    <Card style={styles.groupCard} mode="elevated">
      <Card.Content style={styles.groupContent}>
        <View style={styles.groupRow}>
          <ShimmerView style={styles.groupAvatar} />
          <View style={styles.groupInfo}>
            <ShimmerView style={styles.groupName} />
            <ShimmerView style={styles.groupMemberCount} />
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

// Participant List Item Skeleton
export function ParticipantSkeleton() {
  return (
    <View style={styles.participantContainer}>
      <ShimmerView style={styles.participantAvatar} />
      <View style={styles.participantInfo}>
        <ShimmerView style={styles.participantName} />
        <ShimmerView style={styles.participantScore} />
      </View>
      <ShimmerView style={styles.participantVote} />
    </View>
  );
}

// Message Skeleton
export function MessageSkeleton({ isOwnMessage = false }: { isOwnMessage?: boolean }) {
  return (
    <View style={[styles.messageContainer, isOwnMessage && styles.messageContainerOwn]}>
      {!isOwnMessage && <ShimmerView style={styles.messageAvatar} />}
      <View style={[styles.messageBubble, isOwnMessage && styles.messageBubbleOwn]}>
        <ShimmerView style={styles.messageText} />
        <ShimmerView style={styles.messageTime} />
      </View>
    </View>
  );
}

// Member Card Skeleton (for group detail)
export function MemberCardSkeleton() {
  return (
    <Card style={styles.memberCard} mode="elevated">
      <Card.Content style={styles.memberContent}>
        <View style={styles.memberRow}>
          <ShimmerView style={styles.memberAvatar} />
          <View style={styles.memberInfo}>
            <ShimmerView style={styles.memberName} />
            <ShimmerView style={styles.memberRole} />
          </View>
        </View>
        <ShimmerView style={styles.memberScore} />
        <ShimmerView style={styles.memberStats} />
      </Card.Content>
    </Card>
  );
}

// Profile Section Skeleton
export function ProfileSkeleton() {
  return (
    <View style={styles.profileContainer}>
      <ShimmerView style={styles.profileAvatar} />
      <ShimmerView style={styles.profileName} />
      <ShimmerView style={styles.profilePhone} />
      <View style={styles.profileScoreContainer}>
        <ShimmerView style={styles.profileScoreLabel} />
        <ShimmerView style={styles.profileScoreBar} />
      </View>
    </View>
  );
}

// List of skeletons (for feeds)
export function EventListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </>
  );
}

export function PlanListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <PlanCardSkeleton key={index} />
      ))}
    </>
  );
}

export function GroupListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <GroupCardSkeleton key={index} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  // Event Card Styles
  eventCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    height: 24,
    borderRadius: 4,
    marginBottom: 12,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  eventText: {
    height: 16,
    flex: 1,
    borderRadius: 4,
  },
  eventTextShort: {
    height: 16,
    width: '60%',
    borderRadius: 4,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  eventBadge: {
    width: 60,
    height: 24,
    borderRadius: 12,
  },
  eventDistance: {
    width: 80,
    height: 16,
    borderRadius: 4,
  },

  // Plan Card Styles
  planCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  planContent: {
    padding: 16,
  },
  planHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  planThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  planSubtitle: {
    height: 16,
    width: '70%',
    borderRadius: 4,
    marginBottom: 8,
  },
  planStatus: {
    width: 80,
    height: 24,
    borderRadius: 12,
  },
  planProgress: {
    height: 8,
    borderRadius: 4,
  },

  // Group Card Styles
  groupCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  groupContent: {
    padding: 16,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  groupMemberCount: {
    height: 14,
    width: '50%',
    borderRadius: 4,
  },

  // Participant Styles
  participantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    height: 16,
    width: '60%',
    borderRadius: 4,
    marginBottom: 6,
  },
  participantScore: {
    height: 12,
    width: '40%',
    borderRadius: 4,
  },
  participantVote: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },

  // Message Styles
  messageContainer: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'flex-end',
  },
  messageContainerOwn: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  messageBubbleOwn: {
    backgroundColor: '#dbeafe',
  },
  messageText: {
    height: 16,
    width: 120,
    borderRadius: 4,
    marginBottom: 6,
  },
  messageTime: {
    height: 10,
    width: 50,
    borderRadius: 4,
  },

  // Member Card Styles
  memberCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  memberContent: {
    padding: 16,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    height: 18,
    borderRadius: 4,
    marginBottom: 6,
  },
  memberRole: {
    width: 60,
    height: 20,
    borderRadius: 10,
  },
  memberScore: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  memberStats: {
    height: 14,
    width: '80%',
    borderRadius: 4,
  },

  // Profile Styles
  profileContainer: {
    alignItems: 'center',
    padding: 24,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    height: 24,
    width: 150,
    borderRadius: 4,
    marginBottom: 8,
  },
  profilePhone: {
    height: 16,
    width: 120,
    borderRadius: 4,
    marginBottom: 24,
  },
  profileScoreContainer: {
    width: '100%',
  },
  profileScoreLabel: {
    height: 18,
    width: 120,
    borderRadius: 4,
    marginBottom: 8,
  },
  profileScoreBar: {
    height: 24,
    borderRadius: 12,
  },
});
