import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Animated, Modal, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryIcon, ExpiryBadge } from '../src/components/PantryBits';
import { Button, Divider } from '../src/components/ui';
import { usePantry } from '../src/stores/PantryStore';
import { colors, fonts, radius, shadow, spacing } from '../src/theme';
import type { PantryItem } from '../src/types/models';
import { formatQuantity } from '../src/utils/format';

const SWIPE_THRESHOLD = 90;

export default function QuickCheckInScreen() {
  const router = useRouter();
  const pantry = usePantry();
  // Snapshot so removals during the check-in don't reshuffle the deck.
  const [items] = useState<PantryItem[]>(() => (pantry.expiringSoon.length ? pantry.expiringSoon : pantry.items));
  const [index, setIndex] = useState(0);
  const [adjusting, setAdjusting] = useState<PantryItem | null>(null);
  const [position] = useState(() => new Animated.ValueXY());
  const current = items[index];

  const advance = () => {
    setAdjusting(null);
    position.setValue({ x: 0, y: 0 });
    setIndex((i) => i + 1);
  };

  const fling = (direction: 1 | -1, then: () => void) =>
    Animated.spring(position, { toValue: { x: direction * 500, y: 0 }, useNativeDriver: true, speed: 20 }).start(then);

  // Swipe right: none left (remove). Swipe left: still have (adjust quantity).
  const remove = () =>
    fling(1, () => {
      pantry.remove(current, 'used');
      advance();
    });
  const adjust = () => fling(-1, () => setAdjusting(pantry.items.find((i) => i.id === current.id) ?? current));

  // Rebuilt each render so handlers see the current card; drags don't trigger renders.
  const responder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6,
    onPanResponderMove: (_, g) => position.setValue({ x: g.dx, y: g.dy * 0.2 }),
    onPanResponderRelease: (_, g) => {
      if (g.dx > SWIPE_THRESHOLD) remove();
      else if (g.dx < -SWIPE_THRESHOLD) adjust();
      else Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true, bounciness: 12 }).start();
    },
  });

  const rotate = position.x.interpolate({ inputRange: [-300, 0, 300], outputRange: ['-20deg', '0deg', '20deg'] });

  return (
    <SafeAreaView edges={['bottom']} style={styles.flex}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Text accessibilityRole="button" onPress={() => router.back()} style={[fonts.headline, { color: colors.accent }]}>
              Close
            </Text>
          ),
        }}
      />
      {!current ? (
        <View style={styles.done}>
          <Ionicons name="checkmark-circle" size={56} color={colors.success} />
          <Text style={fonts.title}>All Caught Up!</Text>
          <Text style={[fonts.body, { color: colors.textSecondary }]}>You&apos;ve checked all your inventory items.</Text>
          <Button title="Done" onPress={() => router.back()} style={styles.doneButton} />
        </View>
      ) : (
        <View style={styles.flex}>
          <Text style={[fonts.caption, styles.counter]}>
            Item {index + 1} of {items.length}
          </Text>
          <View style={styles.cardArea}>
            <Animated.View
              {...responder.panHandlers}
              style={[styles.card, { transform: [...position.getTranslateTransform(), { rotate }] }]}
            >
              <CategoryIcon category={current.category} size={58} />
              <Text style={fonts.title}>{current.name}</Text>
              <Text style={[fonts.body, { color: colors.textSecondary }]}>
                Current: {formatQuantity(current.quantity)} {current.unit}
              </Text>
              <ExpiryBadge item={current} />
              <Divider />
              <View style={styles.hints}>
                <Text style={[fonts.caption, styles.hint]}>← Swipe left: still have</Text>
                <Text style={[fonts.caption, styles.hint]}>Swipe right: none left →</Text>
              </View>
            </Animated.View>
          </View>
          <View style={styles.actions}>
            <Button title="Don't Have" icon="close-circle" variant="secondary" onPress={remove} style={styles.flex} />
            <Button title="Still Have" icon="checkmark-circle" onPress={adjust} style={styles.flex} />
          </View>
        </View>
      )}
      <AdjustQuantityModal
        item={adjusting}
        onSave={(item) => {
          pantry.update(item);
          advance();
        }}
        onCancel={() => {
          setAdjusting(null);
          Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
        }}
      />
    </SafeAreaView>
  );
}

function AdjustQuantityModal({
  item,
  onSave,
  onCancel,
}: {
  item: PantryItem | null;
  onSave: (item: PantryItem) => void;
  onCancel: () => void;
}) {
  const [quantity, setQuantity] = useState(0);
  const [shownId, setShownId] = useState<string | null>(null);
  if (item && item.id !== shownId) {
    setShownId(item.id);
    setQuantity(item.quantity);
  }

  return (
    <Modal visible={item !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={onCancel}>
      {item && (
        <SafeAreaView style={styles.adjust}>
          <View style={styles.adjustHeader}>
            <Text accessibilityRole="button" onPress={onCancel} style={[fonts.body, { color: colors.accent }]}>
              Cancel
            </Text>
            <Text style={fonts.headline}>Adjust Quantity</Text>
            <View style={{ width: 50 }} />
          </View>
          <Text style={[fonts.body, { color: colors.textSecondary }]}>Update Quantity for</Text>
          <Text style={fonts.title}>{item.name}</Text>
          <View style={styles.stepper}>
            <Pressable accessibilityLabel="Decrease" onPress={() => setQuantity((q) => (q > 0.5 ? q - 0.5 : q))}>
              <Ionicons name="remove-circle" size={44} color={colors.accent} />
            </Pressable>
            <Text style={[fonts.largeTitle, styles.quantity]}>
              {formatQuantity(quantity)} {item.unit}
            </Text>
            <Pressable accessibilityLabel="Increase" onPress={() => setQuantity((q) => q + 0.5)}>
              <Ionicons name="add-circle" size={44} color={colors.accent} />
            </Pressable>
          </View>
          <View style={styles.flex} />
          <Button title="Save Changes" onPress={() => onSave({ ...item, quantity })} style={styles.save} />
        </SafeAreaView>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  counter: { textAlign: 'center', marginTop: spacing.l },
  cardArea: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.l },
  card: {
    alignItems: 'center',
    gap: spacing.m,
    padding: spacing.xl,
    minHeight: 280,
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.card,
    ...shadow,
  },
  hints: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch' },
  hint: { fontSize: 11, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: spacing.l, padding: spacing.l },
  done: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.s, padding: spacing.xl },
  doneButton: { alignSelf: 'stretch', marginTop: spacing.l },
  adjust: { flex: 1, alignItems: 'center', gap: spacing.l, backgroundColor: colors.background, padding: spacing.l },
  adjustHeader: { flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.s },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, padding: spacing.l },
  quantity: { minWidth: 120, textAlign: 'center' },
  save: { alignSelf: 'stretch', marginBottom: spacing.l },
});
