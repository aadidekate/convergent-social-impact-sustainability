import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { MemberAvatar } from '../../src/components/PantryBits';
import { PromptModal } from '../../src/components/Sheets';
import { BackendPlaceholderBanner, EmptyState, IconButton } from '../../src/components/ui';
import { useCircles } from '../../src/stores/CircleStore';
import { colors, fonts, spacing } from '../../src/theme';

export default function CirclesScreen() {
  const router = useRouter();
  const { circles, createCircle } = useCircles();
  const [isCreating, setIsCreating] = useState(false);

  return (
    <View style={styles.flex}>
      <Stack.Screen
        options={{ headerRight: () => <IconButton icon="add" size={26} label="New circle" onPress={() => setIsCreating(true)} /> }}
      />
      <View style={styles.banner}>
        {/* TODO(backend): circles come from the mock service until the backend exists. */}
        <BackendPlaceholderBanner message="Circles are local sample data" />
      </View>
      {circles.length === 0 ? (
        <EmptyState
          title="No circles yet"
          icon="people-outline"
          description="Create a circle to share pantry items with the people you live with."
        />
      ) : (
        <FlatList
          data={circles}
          keyExtractor={(c) => c.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item: circle }) => (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/circles/[id]', params: { id: circle.id } })}
              style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surface }]}
            >
              <View style={styles.avatars}>
                {circle.members.map((member, index) => (
                  <View key={member.id} style={index > 0 && { marginLeft: -spacing.s }}>
                    <MemberAvatar member={member} />
                  </View>
                ))}
              </View>
              <View style={styles.flex}>
                <Text style={fonts.headline}>{circle.name}</Text>
                <Text style={fonts.caption}>{circle.sharedItems.length} shared items</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
          )}
        />
      )}
      <PromptModal
        visible={isCreating}
        title="New circle"
        placeholder="Name"
        // TODO(backend): owner should be the signed-in user.
        onSubmit={(name) => createCircle(name, { name: 'You' })}
        onClose={() => setIsCreating(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  banner: { padding: spacing.l },
  avatars: { flexDirection: 'row' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.m, paddingHorizontal: spacing.l, paddingVertical: spacing.m },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: spacing.l },
});
