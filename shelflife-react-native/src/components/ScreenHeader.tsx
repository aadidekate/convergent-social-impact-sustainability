import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../theme';

/** Large-title header for tab roots, with optional leading/trailing actions. */
export function ScreenHeader({ title, leading, trailing }: { title: string; leading?: ReactNode; trailing?: ReactNode }) {
  return (
    <View style={styles.container}>
      {(leading || trailing) && (
        <View style={styles.actions}>
          <View style={styles.group}>{leading}</View>
          <View style={styles.group}>{trailing}</View>
        </View>
      )}
      <Text style={fonts.largeTitle} accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.l, paddingTop: spacing.s, paddingBottom: spacing.m, backgroundColor: colors.background },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  group: { flexDirection: 'row', gap: spacing.m },
});
