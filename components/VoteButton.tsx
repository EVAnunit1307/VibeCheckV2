import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type VoteButtonProps = {
  type: 'yes' | 'maybe' | 'no';
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export default function VoteButton({ type, selected, onPress, disabled }: VoteButtonProps) {
  const getConfig = () => {
    switch (type) {
      case 'yes':
        return {
          label: 'YES',
          icon: 'check-circle',
          color: '#10b981',
          bgColor: selected ? '#10b981' : '#f0fdf4',
          textColor: selected ? '#fff' : '#10b981',
        };
      case 'maybe':
        return {
          label: 'MAYBE',
          icon: 'help-circle',
          color: '#f59e0b',
          bgColor: selected ? '#f59e0b' : '#fffbeb',
          textColor: selected ? '#fff' : '#f59e0b',
        };
      case 'no':
        return {
          label: 'NO',
          icon: 'close-circle',
          color: '#ef4444',
          bgColor: selected ? '#ef4444' : '#fef2f2',
          textColor: selected ? '#fff' : '#ef4444',
        };
    }
  };

  const config = getConfig();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor: config.bgColor },
        selected && styles.selectedButton,
        disabled && styles.disabledButton,
      ]}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name={config.icon as any}
        size={32}
        color={config.textColor}
        style={styles.icon}
      />
      <Text style={[styles.label, { color: config.textColor }]}>{config.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedButton: {
    borderColor: 'rgba(0,0,0,0.1)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  icon: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
