import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { DateStepper, FormRow, FormSection, TextField, parseNumber } from '../../src/components/Form';
import { OptionSheet } from '../../src/components/Sheets';
import { BackendPlaceholderBanner, IconButton } from '../../src/components/ui';
import { usePantry } from '../../src/stores/PantryStore';
import { useServices } from '../../src/stores/ServicesContext';
import { colors, fonts, spacing } from '../../src/theme';
import { FOOD_CATEGORIES, type FoodCategory, type ISODate } from '../../src/types/models';
import { categoryName, createId, today } from '../../src/utils/format';

export default function PantryItemEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const pantry = usePantry();
  const services = useServices();
  const item = id ? pantry.items.find((i) => i.id === id) : undefined;
  const isNew = !item;

  const [name, setName] = useState(item?.name ?? '');
  const [category, setCategory] = useState<FoodCategory>(item?.category ?? 'other');
  const [quantity, setQuantity] = useState(String(item?.quantity ?? 1));
  const [unit, setUnit] = useState(item?.unit ?? '');
  const [price, setPrice] = useState(item?.price != null ? item.price.toFixed(2) : '');
  const [purchasedOn, setPurchasedOn] = useState<ISODate>(item?.purchasedOn ?? today());
  const [expiresOn, setExpiresOn] = useState<ISODate>(
    item?.expiresOn ?? services.expiration.estimatedExpiry('other', today()),
  );
  const [pickingCategory, setPickingCategory] = useState(false);

  // New items get expiry estimated from category + purchase date, as in ShelfLife.
  const refillExpiry = (nextCategory: FoodCategory, nextPurchased: ISODate) => {
    if (isNew) setExpiresOn(services.expiration.estimatedExpiry(nextCategory, nextPurchased));
  };

  const canSave = name.trim().length > 0;

  const save = () => {
    const fields = {
      name: name.trim(),
      category,
      quantity: parseNumber(quantity) ?? 1,
      unit: unit.trim(),
      price: parseNumber(price),
      purchasedOn,
      expiresOn,
    };
    if (item) pantry.update({ ...item, ...fields });
    else pantry.add([{ id: createId(), ...fields }]);
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isNew ? 'New Item' : 'Edit Item',
          headerLeft: () => <IconButton icon="close" label="Cancel" onPress={() => router.back()} />,
          headerRight: () => (
            <Text
              accessibilityRole="button"
              onPress={canSave ? save : undefined}
              style={[fonts.headline, { color: colors.accent, opacity: canSave ? 1 : 0.4 }]}
            >
              Save
            </Text>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormSection>
          <TextField value={name} onChangeText={setName} placeholder="Name" autoFocus={isNew} />
          <FormRow label="Category" onPress={() => setPickingCategory(true)}>
            <Text style={[fonts.body, { color: colors.textSecondary }]}>{categoryName(category)}</Text>
            <Ionicons name="chevron-expand" size={16} color={colors.textSecondary} />
          </FormRow>
        </FormSection>
        <FormSection title="Quantity">
          <TextField value={quantity} onChangeText={setQuantity} placeholder="Quantity" keyboardType="decimal-pad" />
          <TextField value={unit} onChangeText={setUnit} placeholder="Unit" autoCapitalize="none" />
        </FormSection>
        <FormSection>
          <TextField value={price} onChangeText={setPrice} placeholder="Price ($)" keyboardType="decimal-pad" />
        </FormSection>
        <FormSection>
          <FormRow label="Purchased">
            <DateStepper
              value={purchasedOn}
              onChange={(value) => {
                setPurchasedOn(value);
                refillExpiry(category, value);
              }}
            />
          </FormRow>
          <FormRow label="Expires">
            <DateStepper value={expiresOn} onChange={setExpiresOn} />
          </FormRow>
        </FormSection>
        {/* TODO(backend): replace category defaults with per-item shelf-life lookup. */}
        {isNew && <BackendPlaceholderBanner message="expiry estimates use category defaults" />}
      </ScrollView>
      <OptionSheet
        visible={pickingCategory}
        title="Category"
        options={FOOD_CATEGORIES.map((c) => ({ label: categoryName(c), value: c }))}
        selected={category}
        onSelect={(value) => {
          setCategory(value);
          refillExpiry(value, purchasedOn);
        }}
        onClose={() => setPickingCategory(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.l, gap: spacing.l },
});
