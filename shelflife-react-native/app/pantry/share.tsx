import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { EmptyState, IconButton } from '../../src/components/ui';
import { useCircles } from '../../src/stores/CircleStore';
import { usePantry } from '../../src/stores/PantryStore';
import { colors, fonts, radius, spacing } from '../../src/theme';

export default function SharePantryItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const pantry = usePantry();
  const { circles, share } = useCircles();
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const item = pantry.items.find((i) => i.id === id);

  if (!item) return <EmptyState title="Item Removed" icon="trash-outline" />;

  const shareWith = async (circleId: string) => {
    setSharingId(circleId);
    setError(null);
    try {
      await share(item, circleId);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not share item.');
    } finally {
      setSharingId(null);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `Share ${item.name}`,
          headerLeft: () => <IconButton icon="close" label="Cancel" onPress={() => router.back()} />,
        }}
      />
      {circles.length === 0 ? (
        <EmptyState title="No circles yet" icon="people-outline" description={`Create a circle first to share ${item.name}.`} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {circles.map((circle) => (
            <Pressable
              key={circle.id}
              accessibilityRole="button"
              disabled={sharingId !== null}
              onPress={() => shareWith(circle.id)}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
            >
              <Text style={fonts.headline}>{circle.name}</Text>
              {sharingId === circle.id ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                <Ionicons name="share-outline" size={18} color={colors.accent} />
              )}
            </Pressable>
          ))}
          {error && <Text style={[fonts.body, { color: colors.danger }]}>{error}</Text>}
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.l, gap: spacing.s },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.l,
    backgroundColor: colors.card,
    borderRadius: radius.card,
  },
});
