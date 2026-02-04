import { StyleSheet, View } from 'react-native';
import { List, Text, Avatar, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getCommitmentScoreColor, getCommitmentScoreLabel } from '../lib/helpers';

type Participant = {
  user_id: string;
  vote: 'yes' | 'maybe' | 'no' | null;
  status: 'confirmed' | 'declined' | 'maybe' | 'pending';
  user: {
    full_name: string;
    commitment_score: number;
  };
};

type ParticipantListItemProps = {
  participant: Participant;
  showScore?: boolean;
};

export default function ParticipantListItem({
  participant,
  showScore = true,
}: ParticipantListItemProps) {
  const getVoteBadge = () => {
    switch (participant.vote) {
      case 'yes':
        return { icon: 'check-circle', color: '#10b981', label: 'YES' };
      case 'maybe':
        return { icon: 'help-circle', color: '#f59e0b', label: 'MAYBE' };
      case 'no':
        return { icon: 'close-circle', color: '#ef4444', label: 'NO' };
      default:
        return { icon: 'clock-outline', color: '#6b7280', label: 'PENDING' };
    }
  };

  const voteBadge = getVoteBadge();
  const initials = participant.user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const scoreColor = getCommitmentScoreColor(participant.user.commitment_score);
  const scoreLabel = getCommitmentScoreLabel(participant.user.commitment_score);

  return (
    <List.Item
      title={participant.user.full_name}
      description={
        showScore ? (
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>{scoreLabel}</Text>
            <ProgressBar
              progress={participant.user.commitment_score / 100}
              color={scoreColor}
              style={styles.progressBar}
            />
            <Text style={[styles.scoreValue, { color: scoreColor }]}>
              {participant.user.commitment_score}
            </Text>
          </View>
        ) : null
      }
      left={() => (
        <Avatar.Text
          size={40}
          label={initials}
          style={[styles.avatar, { backgroundColor: scoreColor + '30' }]}
          labelStyle={{ color: scoreColor }}
        />
      )}
      right={() => (
        <View style={styles.voteBadgeContainer}>
          <MaterialCommunityIcons
            name={voteBadge.icon as any}
            size={24}
            color={voteBadge.color}
          />
          <Text style={[styles.voteLabel, { color: voteBadge.color }]}>{voteBadge.label}</Text>
        </View>
      )}
      style={styles.item}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  avatar: {
    marginRight: 8,
  },
  scoreContainer: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  scoreValue: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 28,
    textAlign: 'right',
  },
  voteBadgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  voteLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});
