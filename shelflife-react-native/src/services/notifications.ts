import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { PantryItem } from '../types/models';
import { addDays, parseISODate } from '../utils/format';

export const CHECK_IN_TARGET = 'quick_check_in';

const EXPIRY_PREFIX = 'expiry-';
const REMINDER_HOUR = 9;
const MAX_PENDING = 60;
const supported = Platform.OS !== 'web';

export interface NotificationService {
  configure(): void;
  requestAuthorization(): Promise<boolean>;
  /** One notification per day listing everything hitting its lead time, to stay under the iOS pending cap. */
  reschedule(items: PantryItem[], leadDays: number): Promise<void>;
  sendTest(): Promise<void>;
  /** Returns false when local notifications aren't available (web), so callers can open the check-in directly. */
  sendCheckInTest(sampleNames: string[]): Promise<boolean>;
  onCheckInTapped(handler: () => void): () => void;
}

export const notificationService: NotificationService = {
  configure() {
    if (!supported) return;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  },

  async requestAuthorization() {
    if (!supported) return false;
    const { granted } = await Notifications.requestPermissionsAsync();
    return granted;
  },

  async reschedule(items, leadDays) {
    if (!supported) return;
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      pending
        .filter((n) => n.identifier.startsWith(EXPIRY_PREFIX))
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );

    const byDay = new Map<string, string[]>();
    for (const item of items) {
      const day = addDays(item.expiresOn, -leadDays);
      byDay.set(day, [...(byDay.get(day) ?? []), item.name]);
    }

    const now = Date.now();
    const due = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(0, MAX_PENDING);
    for (const [day, names] of due) {
      const fireDate = parseISODate(day);
      fireDate.setHours(REMINDER_HOUR);
      if (fireDate.getTime() <= now) continue;
      await Notifications.scheduleNotificationAsync({
        identifier: EXPIRY_PREFIX + day,
        content: {
          title: leadDays === 0 ? 'Expiring today' : `Expiring in ${leadDays} day${leadDays === 1 ? '' : 's'}`,
          body: names.sort().join(', '),
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireDate },
      });
    }
  },

  async sendTest() {
    if (!supported) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Pantree test',
        body: 'Spinach expires tomorrow. Try the Spinach Omelette recipe.',
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 },
    });
  },

  async sendCheckInTest(sampleNames) {
    if (!supported) return false;
    const { granted } = await Notifications.requestPermissionsAsync();
    if (!granted) return false;
    const examples = sampleNames.slice(0, 2).join(' or ') || 'your groceries';
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Pantree Check-in 🍎',
        body: `Do you still have items like ${examples}? Tap to check in.`,
        sound: true,
        data: { target: CHECK_IN_TARGET },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 },
    });
    return true;
  },

  onCheckInTapped(handler) {
    if (!supported) return () => {};
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      if (response.notification.request.content.data?.target === CHECK_IN_TARGET) handler();
    });
    return () => subscription.remove();
  },
};
