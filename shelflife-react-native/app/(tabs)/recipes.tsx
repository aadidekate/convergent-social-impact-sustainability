import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SwipeRow } from '../../src/components/SwipeRow';
import { BackendPlaceholderBanner, Card, EmptyState, IconButton, Pill } from '../../src/components/ui';
import { usePantry } from '../../src/stores/PantryStore';
import { useRecipes } from '../../src/stores/RecipeStore';
import { colors, fonts, radius, spacing } from '../../src/theme';
import type { Recipe } from '../../src/types/models';

type Listing = 'Suggested' | 'Saved';

function RecipeRow({ recipe, usesExpiring, onPress }: { recipe: Recipe; usesExpiring?: number; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.8 }}>
      <Card style={styles.recipeCard}>
        <Text style={fonts.headline}>{recipe.title}</Text>
        <Text style={fonts.caption} numberOfLines={2}>
          {recipe.summary}
        </Text>
        <View style={styles.pills}>
          <Pill label={`${recipe.minutes} min`} icon="time-outline" />
          <Pill label={`${recipe.servings} servings`} icon="people-outline" />
          {usesExpiring ? <Pill label={`Uses ${usesExpiring} expiring`} icon="alert-circle-outline" selected /> : null}
        </View>
      </Card>
    </Pressable>
  );
}

export default function RecipesScreen() {
  const router = useRouter();
  const recipes = useRecipes();
  const pantry = usePantry();
  const [listing, setListing] = useState<Listing>('Suggested');
  const { refreshSuggestions } = recipes;

  const refresh = useCallback(() => refreshSuggestions(pantry.items), [refreshSuggestions, pantry.items]);
  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Undefined when the recipe uses no expiring items, so the pill is hidden. */
  const usesExpiring = (recipe: Recipe) => {
    const names = new Set(pantry.expiringSoon.map((i) => i.name.toLowerCase()));
    return recipe.ingredients.filter((ing) => names.has(ing.name.toLowerCase())).length || undefined;
  };

  const open = (recipe: Recipe) => router.push({ pathname: '/recipes/[id]', params: { id: recipe.id } });

  return (
    <SafeAreaView edges={['top']} style={styles.flex}>
      <ScreenHeader
        title="Recipes"
        trailing={<IconButton icon="download-outline" label="Import recipe" onPress={() => router.push('/recipes/import')} />}
      />
      <View style={styles.segmented}>
        {(['Suggested', 'Saved'] as const).map((option) => (
          <Pressable
            key={option}
            accessibilityRole="tab"
            accessibilityState={{ selected: listing === option }}
            onPress={() => setListing(option)}
            style={[styles.segment, listing === option && styles.segmentSelected]}
          >
            <Text style={[fonts.headline, { fontSize: 14, color: listing === option ? colors.onAccent : colors.textPrimary }]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>

      {listing === 'Suggested' ? (
        <FlatList
          data={recipes.suggestions}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={colors.accent} />}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              {/* TODO(backend): suggestions come from the mock recipe service until a recipe search API exists. */}
              <BackendPlaceholderBanner message="Suggestions are sample data" />
              {recipes.isLoadingSuggestions && <ActivityIndicator color={colors.accent} />}
            </View>
          }
          renderItem={({ item }) => <RecipeRow recipe={item} usesExpiring={usesExpiring(item)} onPress={() => open(item)} />}
        />
      ) : recipes.saved.length === 0 ? (
        <EmptyState title="No saved recipes" icon="book-outline" description="Bookmark a recipe to keep it here." />
      ) : (
        <FlatList
          data={recipes.saved}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <SwipeRow actions={[{ label: 'Unsave', color: colors.danger, onPress: () => recipes.toggleSaved(item) }]}>
              <RecipeRow recipe={item} onPress={() => open(item)} />
            </SwipeRow>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  segmented: {
    flexDirection: 'row',
    marginHorizontal: spacing.l,
    marginBottom: spacing.m,
    padding: 3,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
  },
  segment: { flex: 1, alignItems: 'center', paddingVertical: spacing.s, borderRadius: radius.input - 2 },
  segmentSelected: { backgroundColor: colors.accent },
  list: { paddingHorizontal: spacing.l, paddingBottom: 140, gap: spacing.m },
  listHeader: { gap: spacing.m },
  recipeCard: { gap: spacing.s },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s },
});
