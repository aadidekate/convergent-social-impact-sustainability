import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme';
import type { ISODate } from '../types/models';
import { addDays, formatDate } from '../utils/format';

export function TextField(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.textSecondary} {...props} style={[styles.input, props.style]} />;
}

export function FormSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export function FormRow({ label, children, onPress }: { label: string; children?: ReactNode; onPress?: () => void }) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={styles.row} accessibilityRole={onPress ? 'button' : undefined}>
      <Text style={fonts.body}>{label}</Text>
      <View style={styles.rowValue}>{children}</View>
    </Pressable>
  );
}

function Stepper({ onMinus, onPlus, children }: { onMinus: () => void; onPlus: () => void; children: ReactNode }) {
  return (
    <View style={styles.stepper}>
      <Pressable accessibilityLabel="Decrease" hitSlop={6} onPress={onMinus}>
        <Ionicons name="remove-circle-outline" size={26} color={colors.accent} />
      </Pressable>
      {children}
      <Pressable accessibilityLabel="Increase" hitSlop={6} onPress={onPlus}>
        <Ionicons name="add-circle-outline" size={26} color={colors.accent} />
      </Pressable>
    </View>
  );
}

/** Cross-platform date control stepping by day. */
export function DateStepper({ value, onChange }: { value: ISODate; onChange: (value: ISODate) => void }) {
  return (
    <Stepper onMinus={() => onChange(addDays(value, -1))} onPlus={() => onChange(addDays(value, 1))}>
      <Text style={[fonts.body, styles.stepperValue]}>{formatDate(value)}</Text>
    </Stepper>
  );
}

export function parseNumber(text: string): number | undefined {
  const n = Number(text.replace(/[^0-9.]/g, ''));
  return text.trim() === '' || Number.isNaN(n) ? undefined : n;
}

const styles = StyleSheet.create({
  input: {
    ...fonts.body,
    backgroundColor: colors.card,
    borderRadius: radius.input,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
  },
  section: { gap: spacing.s },
  sectionTitle: { ...fonts.caption, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionBody: { backgroundColor: colors.card, borderRadius: radius.card, padding: spacing.m, gap: spacing.m },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.m, minHeight: 36 },
  rowValue: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  stepperValue: { minWidth: 110, textAlign: 'center' },
});
