import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { PromptModal } from '../../src/components/Sheets';
import { SwipeRow } from '../../src/components/SwipeRow';
import { EmptyState, IconButton } from '../../src/components/ui';
import { useGrocery } from '../../src/stores/GroceryStore';
import { colors, fonts, spacing } from '../../src/theme';

export default function GroceryScreen() {
  const router = useRouter();
  const grocery = useGrocery();
  const [isCreating, setIsCreating] = useState(false);

  return (
    <SafeAreaView edges={['top']} style={styles.flex}>
      <ScreenHeader
        title="Grocery Lists"
        trailing={<IconButton icon="add" size={26} label="New list" onPress={() => setIsCreating(true)} />}
      />
      {grocery.lists.length === 0 ? (
        <EmptyState title="No Grocery Lists" icon="list-outline" description="Tap + to start a list." />
      ) : (
        <FlatList
          data={grocery.lists}
          keyExtractor={(list) => list.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item: list }) => (
            <SwipeRow actions={[{ label: 'Delete', color: colors.danger, onPress: () => grocery.deleteList(list.id) }]}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/grocery/[id]', params: { id: list.id } })}
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surface }]}
              >
                <View style={styles.flex}>
                  <Text style={fonts.headline}>{list.name}</Text>
                  <Text style={fonts.caption}>
                    {list.items.filter((i) => i.isChecked).length} of {list.items.length} checked
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </Pressable>
            </SwipeRow>
          )}
        />
      )}
      <PromptModal
        visible={isCreating}
        title="New Grocery List"
        placeholder="Name"
        onSubmit={(name) => grocery.createList(name)}
        onClose={() => setIsCreating(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingBottom: 140 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.l, paddingVertical: spacing.m },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: spacing.l },
});
