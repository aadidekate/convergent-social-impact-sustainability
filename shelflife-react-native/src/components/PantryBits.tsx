import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing, statusColors } from '../theme';
import type { CircleMember, FoodCategory, PantryItem } from '../types/models';
import { expiryLabel, expiryStatus, initials } from '../utils/format';

type MciName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const categoryIcons: Record<FoodCategory, MciName> = {
  produce: 'carrot',
  dairy: 'cheese',
  meat: 'food-drumstick',
  seafood: 'fish',
  bakery: 'baguette',
  pantry: 'package-variant',
  frozen: 'snowflake',
  beverages: 'cup-water',
  other: 'basket',
};

export function CategoryIcon({ category, size = 36 }: { category: FoodCategory; size?: number }) {
  return (
    <View style={[styles.icon, { width: size, height: size, borderRadius: size / 2 }]}>
      <MaterialCommunityIcons name={categoryIcons[category]} size={size * 0.5} color={colors.accent} />
    </View>
  );
}

export function ExpiryBadge({ item }: { item: Pick<PantryItem, 'expiresOn'> }) {
  const tone = statusColors[expiryStatus(item)];
  return (
    <View style={[styles.badge, { backgroundColor: tone.background }]}>
      <Text style={[fonts.caption, { color: tone.text, fontWeight: '600' }]}>{expiryLabel(item)}</Text>
    </View>
  );
}

export function MemberAvatar({ member, size = 32 }: { member: CircleMember; size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={{ fontSize: size * 0.4, fontWeight: '600', color: colors.textPrimary }}>{initials(member)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  badge: { paddingHorizontal: spacing.s, paddingVertical: spacing.xs, borderRadius: radius.pill },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fresh,
    borderWidth: 2,
    borderColor: colors.background,
  },
});
