import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextField } from '../../src/components/Form';
import { CategoryIcon, ExpiryBadge } from '../../src/components/PantryBits';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SwipeRow } from '../../src/components/SwipeRow';
import { Card, EmptyState, IconButton, Pill } from '../../src/components/ui';
import { usePantry } from '../../src/stores/PantryStore';
import { colors, fonts, spacing } from '../../src/theme';
import { FOOD_CATEGORIES, type FoodCategory, type PantryItem } from '../../src/types/models';
import { categoryName, expiryStatus, formatQuantity } from '../../src/utils/format';

type Filter = 'all' | 'expiring' | FoodCategory;
const FILTERS: Filter[] = ['all', 'expiring', ...FOOD_CATEGORIES];

const filterTitle = (filter: Filter) =>
  filter === 'all' ? 'All' : filter === 'expiring' ? 'Expiring' : categoryName(filter);

function matches(item: PantryItem, filter: Filter) {
  if (filter === 'all') return true;
  if (filter === 'expiring') return expiryStatus(item) !== 'fresh';
  return item.category === filter;
}

export default function PantryScreen() {
  const router = useRouter();
  const pantry = usePantry();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pantry.sortedByExpiry.filter((item) => matches(item, filter) && (!q || item.name.toLowerCase().includes(q)));
  }, [pantry.sortedByExpiry, filter, query]);

  return (
    <SafeAreaView edges={['top']} style={styles.flex}>
      <ScreenHeader
        title="Pantry"
        leading={
          <>
            <IconButton icon="people-outline" label="Circles" onPress={() => router.push('/circles')} />
            <IconButton icon="settings-outline" label="Settings" onPress={() => router.push('/settings')} />
          </>
        }
        trailing={<IconButton icon="add" size={26} label="Add item" onPress={() => router.push('/pantry/edit')} />}
      />
      {pantry.items.length === 0 ? (
        <EmptyState title="Pantry Is Empty" icon="file-tray-outline" description="Add an item or scan a receipt." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.search}>
                <Ionicons name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
                <TextField
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search pantry"
                  style={styles.searchInput}
                  clearButtonMode="while-editing"
                />
              </View>
              {pantry.expiringSoon.length > 0 && (
                <Card style={styles.strip}>
                  <View style={styles.stripLabel}>
                    <Ionicons name="warning-outline" size={20} color={colors.soonText} />
                    <Text style={[fonts.headline, { color: colors.soonText }]}>Expiring soon</Text>
                  </View>
                  <Text style={fonts.title}>{pantry.expiringSoon.length}</Text>
                </Card>
              )}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
                {FILTERS.map((f) => (
                  <Pressable key={f} accessibilityRole="button" onPress={() => setFilter(f)}>
                    <Pill label={filterTitle(f)} selected={filter === f} />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          }
          ListEmptyComponent={<EmptyState title="No Items" icon="funnel-outline" description="Try another filter or search." />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <SwipeRow
              actions={[
                { label: 'Used', color: colors.success, onPress: () => pantry.remove(item, 'used') },
                { label: 'Wasted', color: colors.danger, onPress: () => pantry.remove(item, 'wasted') },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/pantry/[id]', params: { id: item.id } })}
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surface }]}
              >
                <CategoryIcon category={item.category} />
                <View style={styles.flex}>
                  <Text style={fonts.headline}>{item.name}</Text>
                  <Text style={fonts.caption}>
                    {formatQuantity(item.quantity)} {item.unit}
                  </Text>
                </View>
                <ExpiryBadge item={item} />
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </Pressable>
            </SwipeRow>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { paddingBottom: 140 },
  header: { gap: spacing.m, paddingBottom: spacing.s },
  search: { marginHorizontal: spacing.l, justifyContent: 'center' },
  searchIcon: { position: 'absolute', left: spacing.m, zIndex: 1 },
  searchInput: { paddingLeft: spacing.xxl, paddingVertical: spacing.s },
  strip: { marginHorizontal: spacing.l, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.soon, borderColor: colors.soon },
  stripLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  pills: { gap: spacing.s, paddingHorizontal: spacing.l },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.m, paddingHorizontal: spacing.l, paddingVertical: spacing.m },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 68 },
});
