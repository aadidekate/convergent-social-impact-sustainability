import { Alert, Platform } from 'react-native';

/** Destructive confirmation; `Alert` button callbacks don't fire on web. */
export function confirmAction(title: string, confirmTitle: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(title)) onConfirm();
    return;
  }
  Alert.alert(title, undefined, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmTitle, style: 'destructive', onPress: onConfirm },
  ]);
}

export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    globalThis.alert?.(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}
