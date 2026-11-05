import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DateStepper, TextField } from '../../src/components/Form';
import { CategoryIcon } from '../../src/components/PantryBits';
import { Button, EmptyState } from '../../src/components/ui';
import { usePantry } from '../../src/stores/PantryStore';
import { useScanDraft } from '../../src/stores/ScanStore';
import { colors, fonts, spacing } from '../../src/theme';
import type { Receipt, ReceiptLineItem } from '../../src/types/models';
import { createId, formatCurrency, formatDate, formatQuantity } from '../../src/utils/format';

export default function ReceiptReviewScreen() {
  const { draft } = useScanDraft();
  if (!draft) return <EmptyState title="No receipt" icon="receipt-outline" description="Scan a receipt to review it." />;
  return <ReceiptReview initial={draft} />;
}

function ReceiptReview({ initial }: { initial: Receipt }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pantry = usePantry();
  const { setDraft } = useScanDraft();
  const [receipt, setReceipt] = useState(initial);
  const included = receipt.lineItems.filter((line) => line.isIncluded);
  const total = receipt.lineItems.reduce((sum, line) => sum + line.price, 0);

  const updateLine = (id: string, change: Partial<ReceiptLineItem>) =>
    setReceipt((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((line) => (line.id === id ? { ...line, ...change } : line)),
    }));

  const addToPantry = () => {
    pantry.add(
      included.map((line) => ({
        id: createId(),
        name: line.name,
        category: line.category,
        quantity: line.quantity,
        unit: line.unit,
        price: line.price,
        purchasedOn: receipt.date,
        expiresOn: line.expiresOn,
      })),
    );
    setDraft(null);
    router.back();
  };

  return (
    <View style={styles.flex}>
      <FlatList
        data={receipt.lineItems}
        keyExtractor={(line) => line.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.summary}>
            <Text style={fonts.title}>{receipt.storeName}</Text>
            <View style={styles.summaryRow}>
              <Text style={fonts.caption}>{formatDate(receipt.date)}</Text>
              <Text style={[fonts.headline, { color: colors.textSecondary }]}>{formatCurrency(total)}</Text>
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item: line }) => (
          <View style={[styles.line, !line.isIncluded && { opacity: 0.4 }]}>
            <Switch
              value={line.isIncluded}
              onValueChange={(isIncluded) => updateLine(line.id, { isIncluded })}
              trackColor={{ true: colors.accent, false: colors.border }}
              accessibilityLabel={`Include ${line.name}`}
            />
            <CategoryIcon category={line.category} size={28} />
            <View style={styles.lineBody}>
              <TextField
                value={line.name}
                onChangeText={(name) => updateLine(line.id, { name })}
                placeholder="Item name"
                style={styles.nameInput}
              />
              <Text style={fonts.caption}>
                {formatQuantity(line.quantity)} {line.unit} · {formatCurrency(line.price)}
              </Text>
              <View style={styles.expires}>
                <Text style={fonts.caption}>Expires</Text>
                <DateStepper value={line.expiresOn} onChange={(expiresOn) => updateLine(line.id, { expiresOn })} />
              </View>
            </View>
          </View>
        )}
      />
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.l }]}>
        <Button
          title={`Add ${included.length} ${included.length === 1 ? 'item' : 'items'} to pantry`}
          onPress={addToPantry}
          disabled={included.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.l },
  summary: { gap: spacing.xs, marginBottom: spacing.l },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  line: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.m, paddingVertical: spacing.m },
  lineBody: { flex: 1, gap: spacing.xs },
  nameInput: { ...fonts.headline, paddingVertical: spacing.xs },
  expires: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  footer: { padding: spacing.l, backgroundColor: colors.card, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
