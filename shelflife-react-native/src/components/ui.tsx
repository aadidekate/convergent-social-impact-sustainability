import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({ label, icon, selected = false }: { label: string; icon?: IconName; selected?: boolean }) {
  const color = selected ? colors.onAccent : colors.textPrimary;
  return (
    <View style={[styles.pill, selected && styles.pillSelected]}>
      {icon && <Ionicons name={icon} size={13} color={color} />}
      <Text style={[fonts.caption, { color }]}>{label}</Text>
    </View>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger';

export function Button({
  title,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const filled = variant !== 'secondary';
  const textColor = filled ? colors.onAccent : colors.accent;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={textColor} />}
          <Text style={[fonts.headline, { color: textColor }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  color = colors.accent,
  size = 22,
}: {
  icon: IconName;
  onPress: () => void;
  label: string;
  color?: string;
  size?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

export function EmptyState({ title, icon, description }: { title: string; icon: IconName; description?: string }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={44} color={colors.textSecondary} />
      <Text style={[fonts.title, styles.center]}>{title}</Text>
      {description && <Text style={[fonts.body, styles.center, { color: colors.textSecondary }]}>{description}</Text>}
    </View>
  );
}

export function BackendPlaceholderBanner({ message }: { message: string }) {
  return (
    <View style={styles.banner}>
      <Ionicons name="server-outline" size={14} color={colors.textSecondary} />
      <Text style={[fonts.caption, { flexShrink: 1 }]}>Backend not connected: {message}</Text>
    </View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[fonts.body, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[fonts.body, styles.detailValue]}>{value}</Text>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.l,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  pillSelected: { backgroundColor: colors.accent },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    minHeight: 48,
    paddingHorizontal: spacing.l,
    borderRadius: radius.card,
  },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surface },
  success: { backgroundColor: colors.success },
  danger: { backgroundColor: colors.danger },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
  iconButton: { padding: spacing.xs },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.s, padding: spacing.xxl },
  center: { textAlign: 'center' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    padding: spacing.m,
    borderRadius: radius.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textSecondary,
  },
  sectionTitle: {
    ...fonts.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.m },
  detailValue: { flexShrink: 1, textAlign: 'right' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.s },
});
