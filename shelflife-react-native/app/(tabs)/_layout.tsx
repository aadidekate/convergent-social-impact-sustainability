import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type ColorValue } from 'react-native';
import type { IconName } from '../../src/components/ui';
import { usePantry } from '../../src/stores/PantryStore';
import { useServices } from '../../src/stores/ServicesContext';
import { colors, fonts, radius, shadow, spacing } from '../../src/theme';

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={icon} size={size} color={color as string} />,
});

/** Floating test trigger for the check-in notification flow (dev aid carried over from ShelfLife). */
function TestNotificationButton() {
  const router = useRouter();
  const services = useServices();
  const pantry = usePantry();

  const trigger = async () => {
    const scheduled = await services.notifications.sendCheckInTest(pantry.sortedByExpiry.map((item) => item.name));
    if (!scheduled) router.push('/check-in');
  };

  return (
    <Pressable accessibilityRole="button" onPress={trigger} style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}>
      <Ionicons name="notifications" size={14} color={colors.onAccent} />
      <Text style={[fonts.caption, styles.fabText]}>Test Notif</Text>
    </Pressable>
  );
}

export default function TabsLayout() {
  return (
    <View style={styles.flex}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
          sceneStyle: { backgroundColor: colors.background },
        }}
      >
        <Tabs.Screen name="index" options={tab('Pantry', 'file-tray-stacked-outline')} />
        <Tabs.Screen name="recipes" options={tab('Recipes', 'book-outline')} />
        <Tabs.Screen name="scan" options={tab('Scan', 'scan-outline')} />
        <Tabs.Screen name="grocery" options={tab('Grocery', 'list-outline')} />
        <Tabs.Screen name="insights" options={tab('Insights', 'bar-chart-outline')} />
      </Tabs>
      <TestNotificationButton />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fab: {
    position: 'absolute',
    right: spacing.l,
    bottom: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.m,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    ...shadow,
  },
  fabText: { color: colors.onAccent, fontWeight: '700' },
});
