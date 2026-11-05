import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextField } from '../../src/components/Form';
import { categoryIcons } from '../../src/components/PantryBits';
import { OptionSheet } from '../../src/components/Sheets';
import { SwipeRow } from '../../src/components/SwipeRow';
import { Button, EmptyState } from '../../src/components/ui';
import { useGrocery } from '../../src/stores/GroceryStore';
import { usePantry } from '../../src/stores/PantryStore';
import { colors, fonts, radius, spacing } from '../../src/theme';
import { FOOD_CATEGORIES, type FoodCategory } from '../../src/types/models';
import { notify } from '../../src/utils/confirm';
import { categoryName, formatQuantity } from '../../src/utils/format';

export default function GroceryListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const grocery = useGrocery();
  const pantry = usePantry();
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<FoodCategory>('other');
  const [pickingCategory, setPickingCategory] = useState(false);
  const list = grocery.lists.find((l) => l.id === id);

  if (!list) return <EmptyState title="List Not Found" icon="list-outline" />;

  const trimmed = newName.trim();
  const addItem = () => {
    if (!trimmed) return;
    grocery.add({ name: trimmed, category: newCategory, quantity: 1, unit: 'ct', isChecked: false }, list.id);
    setNewName('');
  };

  const moveChecked = () => {
    const moved = grocery.takeChecked(list.id);
    pantry.add(moved);
    notify(`Added ${moved.length} ${moved.length === 1 ? 'item' : 'items'} to pantry`);
  };

  // Unchecked items first within each category.
  const sections = FOOD_CATEGORIES.map((category) => ({
    title: categoryName(category),
    data: list.items.filter((i) => i.category === category).sort((a, b) => Number(a.isChecked) - Number(b.isChecked)),
  })).filter((section) => section.data.length > 0);

  return (
    <View style={styles.flex}>
      <Stack.Screen options={{ title: list.name }} />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={styles.addRow}>
            <TextField
              value={newName}
              onChangeText={setNewName}
              placeholder="Item name"
              onSubmitEditing={addItem}
              returnKeyType="done"
              style={styles.flex}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Category: ${categoryName(newCategory)}`}
              onPress={() => setPickingCategory(true)}
              style={styles.categoryButton}
            >
              <MaterialCommunityIcons name={categoryIcons[newCategory]} size={20} color={colors.accent} />
            </Pressable>
            <Button title="Add" onPress={addItem} disabled={!trimmed} />
          </View>
        }
        renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
        renderItem={({ item }) => (
          <SwipeRow actions={[{ label: 'Delete', color: colors.danger, onPress: () => grocery.remove(item.id, list.id) }]}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.isChecked }}
              onPress={() => grocery.toggle(item.id, list.id)}
              style={styles.row}
            >
              <Ionicons
                name={item.isChecked ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={item.isChecked ? colors.accent : colors.textSecondary}
              />
              <Text
                style={[
                  fonts.body,
                  styles.flex,
                  item.isChecked && { textDecorationLine: 'line-through', color: colors.textSecondary },
                ]}
              >
                {item.name}
              </Text>
              <Text style={[fonts.body, { color: colors.textSecondary }]}>
                {formatQuantity(item.quantity)} {item.unit}
              </Text>
            </Pressable>
          </SwipeRow>
        )}
      />
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.m }]}>
        <Button title="Move Checked to Pantry" onPress={moveChecked} disabled={!list.items.some((i) => i.isChecked)} />
      </View>
      <OptionSheet
        visible={pickingCategory}
        title="Category"
        options={FOOD_CATEGORIES.map((c) => ({ label: categoryName(c), value: c }))}
        selected={newCategory}
        onSelect={setNewCategory}
        onClose={() => setPickingCategory(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: spacing.xl },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s, padding: spacing.l },
  categoryButton: {
    width: 44,
    height: 44,
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    ...fonts.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.xs,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.m, paddingHorizontal: spacing.l, paddingVertical: spacing.m },
  footer: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
