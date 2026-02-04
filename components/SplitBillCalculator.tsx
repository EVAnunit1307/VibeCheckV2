import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../lib/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface SplitBillCalculatorProps {
  totalAmount?: number;
  numPeople?: number;
  onClose?: () => void;
}

export const SplitBillCalculator: React.FC<SplitBillCalculatorProps> = ({
  totalAmount: initialAmount = 0,
  numPeople: initialPeople = 2,
  onClose,
}) => {
  const [total, setTotal] = useState(initialAmount.toString());
  const [people, setPeople] = useState(initialPeople.toString());
  const [tip, setTip] = useState('15');

  const totalNum = parseFloat(total) || 0;
  const peopleNum = parseInt(people) || 1;
  const tipPercent = parseFloat(tip) || 0;

  const tipAmount = totalNum * (tipPercent / 100);
  const grandTotal = totalNum + tipAmount;
  const perPerson = grandTotal / peopleNum;

  const tipPresets = [10, 15, 18, 20, 25];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>💸 Split the Bill</Text>
        {onClose && (
          <Pressable onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#FFF" />
          </Pressable>
        )}
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Total Bill */}
        <View style={styles.section}>
          <Text style={styles.label}>Total Bill</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currency}>$</Text>
            <TextInput
              style={styles.input}
              value={total}
              onChangeText={setTotal}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>
        </View>

        {/* Number of People */}
        <View style={styles.section}>
          <Text style={styles.label}>Number of People</Text>
          <View style={styles.peopleControls}>
            <Pressable
              style={styles.controlButton}
              onPress={() => setPeople(Math.max(1, peopleNum - 1).toString())}
            >
              <MaterialCommunityIcons name="minus" size={24} color="#FFF" />
            </Pressable>
            <Text style={styles.peopleNumber}>{people}</Text>
            <Pressable
              style={styles.controlButton}
              onPress={() => setPeople((peopleNum + 1).toString())}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
            </Pressable>
          </View>
        </View>

        {/* Tip Percentage */}
        <View style={styles.section}>
          <Text style={styles.label}>Tip</Text>
          <View style={styles.tipPresets}>
            {tipPresets.map((preset) => (
              <Pressable
                key={preset}
                style={[
                  styles.tipButton,
                  tip === preset.toString() && styles.tipButtonActive
                ]}
                onPress={() => setTip(preset.toString())}
              >
                <Text style={[
                  styles.tipButtonText,
                  tip === preset.toString() && styles.tipButtonTextActive
                ]}>
                  {preset}%
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={tip}
              onChangeText={setTip}
              keyboardType="decimal-pad"
              placeholder="Custom %"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${totalNum.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tip ({tipPercent}%)</Text>
            <Text style={styles.summaryValue}>${tipAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>${grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Per Person Amount */}
        <LinearGradient
          colors={theme.colors.primaryGradient}
          style={styles.resultCard}
        >
          <Text style={styles.resultLabel}>Each person pays</Text>
          <Text style={styles.resultAmount}>${perPerson.toFixed(2)}</Text>
          <Text style={styles.resultSubtext}>
            Including tip • Split {peopleNum} ways
          </Text>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable style={styles.actionButton}>
            <MaterialCommunityIcons name="content-copy" size={20} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Copy Amount</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <MaterialCommunityIcons name="share-variant" size={20} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Send Request</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: theme.typography.h2,
    fontWeight: theme.typography.weights.bold,
    color: '#FFF',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: theme.typography.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: 16,
  },
  currency: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  peopleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 8,
  },
  controlButton: {
    backgroundColor: theme.colors.primary,
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  peopleNumber: {
    fontSize: 32,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  tipPresets: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tipButton: {
    flex: 1,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  tipButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tipButtonText: {
    fontSize: theme.typography.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
  },
  tipButtonTextActive: {
    color: '#FFF',
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: theme.typography.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 8,
  },
  resultCard: {
    padding: 24,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: 24,
    ...theme.shadows.neon,
  },
  resultLabel: {
    fontSize: theme.typography.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  resultAmount: {
    fontSize: 48,
    fontWeight: theme.typography.weights.extrabold,
    color: '#FFF',
    marginBottom: 8,
  },
  resultSubtext: {
    fontSize: theme.typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  actionButtonText: {
    fontSize: theme.typography.bodySmall,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },
});
