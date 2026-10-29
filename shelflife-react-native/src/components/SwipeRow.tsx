import { useMemo, useState, type ReactNode } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../theme';

export interface SwipeAction {
  label: string;
  color: string;
  onPress: () => void;
}

const ACTION_WIDTH = 84;

/** Row with trailing swipe actions, mirroring SwiftUI `.swipeActions`. */
export function SwipeRow({ actions, children }: { actions: SwipeAction[]; children: ReactNode }) {
  const [translateX] = useState(() => new Animated.Value(0));
  const openWidth = actions.length * ACTION_WIDTH;
  const clampedX = translateX.interpolate({
    inputRange: [-openWidth - 40, 0],
    outputRange: [-openWidth - 40, 0],
    extrapolate: 'clamp',
  });

  const responder = useMemo(() => {
    const settle = (to: number) =>
      Animated.spring(translateX, { toValue: to, useNativeDriver: true, bounciness: 4 }).start();
    return {
      settle,
      pan: PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
        // Keep the resting position (open/closed) as the offset so drags continue from it.
        onPanResponderGrant: () => translateX.extractOffset(),
        onPanResponderMove: (_, g) => translateX.setValue(g.dx),
        onPanResponderRelease: () => {
          translateX.flattenOffset();
          translateX.stopAnimation((x) => settle(Math.min(0, x) < -openWidth / 2 ? -openWidth : 0));
        },
        onPanResponderTerminate: () => {
          translateX.flattenOffset();
          settle(0);
        },
      }),
    };
  }, [openWidth, translateX]);

  return (
    <View style={styles.container}>
      <View style={[styles.actions, { width: openWidth }]}>
        {actions.map((action) => (
          <Pressable
            key={action.label}
            accessibilityRole="button"
            style={[styles.action, { backgroundColor: action.color }]}
            onPress={() => {
              responder.settle(0);
              action.onPress();
            }}
          >
            <Text style={[fonts.caption, styles.actionText]}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
      <Animated.View style={[styles.content, { transform: [{ translateX: clampedX }] }]} {...responder.pan.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', backgroundColor: colors.background },
  actions: { position: 'absolute', right: 0, top: 0, bottom: 0, flexDirection: 'row' },
  action: { width: ACTION_WIDTH, alignItems: 'center', justifyContent: 'center', padding: spacing.xs },
  actionText: { color: colors.onAccent, fontWeight: '600' },
  content: { backgroundColor: colors.background },
});
