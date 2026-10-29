import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { OptionSheet } from '../../src/components/Sheets';
import { Button, EmptyState, IconButton, Pill } from '../../src/components/ui';
import { useGrocery } from '../../src/stores/GroceryStore';
import { usePantry } from '../../src/stores/PantryStore';
import { useRecipes } from '../../src/stores/RecipeStore';
import { colors, fonts, spacing } from '../../src/theme';
import { confirmAction, notify } from '../../src/utils/confirm';
import { formatQuantity } from '../../src/utils/format';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipes = useRecipes();
  const pantry = usePantry();
  const grocery = useGrocery();
  const [pickingList, setPickingList] = useState(false);
  const recipe = recipes.find(id);

  if (!recipe) return <EmptyState title="Recipe not found" icon="book-outline" />;

  const missing = pantry.missingIngredients(recipe);
  const missingIds = new Set(missing.map((i) => i.id));
  const saved = recipes.isSaved(recipe);

  const addMissingTo = (listId: string, listName: string) => {
    grocery.addMissing(missing, listId);
    notify(`Added ${missing.length} ${missing.length === 1 ? 'item' : 'items'} to ${listName}`);
  };

  const addMissing = () => {
    if (grocery.lists.length === 0) {
      addMissingTo(grocery.createList('Groceries'), 'Groceries');
    } else {
      setPickingList(true);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <IconButton
              icon={saved ? 'bookmark' : 'bookmark-outline'}
              label={saved ? 'Unsave recipe' : 'Save recipe'}
              onPress={() => recipes.toggleSaved(recipe)}
            />
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={fonts.largeTitle}>{recipe.title}</Text>
        <Text style={[fonts.body, { color: colors.textSecondary }]}>{recipe.summary}</Text>
        <View style={styles.pills}>
          <Pill label={`${recipe.minutes} min`} icon="time-outline" />
          <Pill label={`${recipe.servings} servings`} icon="people-outline" />
        </View>

        <View style={styles.section}>
          <Text style={fonts.headline}>Ingredients</Text>
          {recipe.ingredients.map((ing) => (
            <View key={ing.id} style={styles.ingredient}>
              <Text style={[fonts.body, styles.flex]}>
                {formatQuantity(ing.quantity)} {ing.unit} {ing.name}
              </Text>
              {missingIds.has(ing.id) ? (
                <Text style={[fonts.caption, { color: colors.soonText, fontWeight: '600' }]}>missing</Text>
              ) : (
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={fonts.headline}>Steps</Text>
          {recipe.steps.map((step, index) => (
            <View key={index} style={styles.step}>
              <Text style={fonts.headline}>{index + 1}.</Text>
              <Text style={[fonts.body, styles.flex]}>{step}</Text>
            </View>
          ))}
        </View>

        <Button
          title="Cooked it"
          icon="restaurant-outline"
          onPress={() => confirmAction('Remove used ingredients from pantry?', 'Remove', () => pantry.consume(recipe.ingredients))}
        />
        {missing.length > 0 && (
          <Button title="Add missing to grocery list" icon="cart-outline" variant="secondary" onPress={addMissing} />
        )}
        {recipe.sourceUrl && (
          <Text style={[fonts.body, styles.link]} onPress={() => Linking.openURL(recipe.sourceUrl!)}>
            View original recipe
          </Text>
        )}
      </ScrollView>
      <OptionSheet
        visible={pickingList}
        title="Add to grocery list"
        options={grocery.lists.map((list) => ({ label: list.name, value: list }))}
        onSelect={(list) => addMissingTo(list.id, list.name)}
        onClose={() => setPickingList(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.l, gap: spacing.l, paddingBottom: spacing.xxl },
  pills: { flexDirection: 'row', gap: spacing.s },
  section: { gap: spacing.s },
  ingredient: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  step: { flexDirection: 'row', gap: spacing.s },
  link: { color: colors.accent, textDecorationLine: 'underline', textAlign: 'center' },
});
