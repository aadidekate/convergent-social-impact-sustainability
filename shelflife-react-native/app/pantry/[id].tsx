import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CategoryIcon, ExpiryBadge } from '../../src/components/PantryBits';
import { Button, Card, DetailRow, EmptyState } from '../../src/components/ui';
import { useCircles } from '../../src/stores/CircleStore';
import { usePantry } from '../../src/stores/PantryStore';
import { fonts, spacing } from '../../src/theme';
import { formatCurrency, formatDate, formatQuantity } from '../../src/utils/format';

export default function PantryItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const pantry = usePantry();
  const { circles } = useCircles();
  const item = pantry.items.find((i) => i.id === id);

  if (!item) {
    return <EmptyState title="Item Removed" icon="trash-outline" description="This item is no longer in your pantry." />;
  }

  const sharedWith = circles.filter((c) => c.sharedItems.some((s) => s.id === item.id)).map((c) => c.name);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: item.name }} />
      <CategoryIcon category={item.category} size={96} />
      <Text style={[fonts.largeTitle, styles.center]}>{item.name}</Text>
      <ExpiryBadge item={item} />
      <Card style={styles.details}>
        <DetailRow label="Quantity" value={`${formatQuantity(item.quantity)} ${item.unit}`} />
        <DetailRow label="Price" value={item.price != null ? formatCurrency(item.price) : 'None'} />
        <DetailRow label="Purchased" value={formatDate(item.purchasedOn)} />
        <DetailRow label="Expires" value={formatDate(item.expiresOn)} />
        <DetailRow label="Shared with" value={sharedWith.length ? sharedWith.join(', ') : 'Not shared'} />
      </Card>
      <View style={styles.actions}>
        <Button title="Edit" variant="secondary" icon="create-outline" onPress={() => router.push({ pathname: '/pantry/edit', params: { id: item.id } })} />
        <Button title="Share with circle" variant="secondary" icon="people-outline" onPress={() => router.push({ pathname: '/pantry/share', params: { id: item.id } })} />
        <Button
          title="Mark used"
          variant="success"
          icon="checkmark-circle-outline"
          onPress={() => {
            pantry.remove(item, 'used');
            router.back();
          }}
        />
        <Button
          title="Mark wasted"
          variant="danger"
          icon="trash-outline"
          onPress={() => {
            pantry.remove(item, 'wasted');
            router.back();
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.l, gap: spacing.l, alignItems: 'center' },
  center: { textAlign: 'center' },
  details: { alignSelf: 'stretch', gap: spacing.m },
  actions: { alignSelf: 'stretch', gap: spacing.s },
});
