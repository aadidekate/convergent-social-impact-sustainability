import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { notificationService } from '../src/services/notifications';
import { AppProviders } from '../src/stores/AppProviders';
import { colors } from '../src/theme';

notificationService.configure();

function NotificationRouter() {
  const router = useRouter();
  useEffect(() => {
    notificationService.requestAuthorization().catch(() => {});
    return notificationService.onCheckInTapped(() => router.push('/check-in'));
  }, [router]);
  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <StatusBar style="dark" />
        <NotificationRouter />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.accent,
            headerTitleStyle: { color: colors.textPrimary, fontWeight: '600' },
            headerShadowVisible: false,
            headerBackTitle: 'Back',
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Pantree' }} />
          <Stack.Screen name="pantry/[id]" options={{ title: '' }} />
          <Stack.Screen name="pantry/edit" options={{ presentation: 'modal' }} />
          <Stack.Screen name="pantry/share" options={{ presentation: 'modal', title: 'Share' }} />
          <Stack.Screen name="recipes/[id]" options={{ title: '' }} />
          <Stack.Screen name="recipes/import" options={{ presentation: 'modal', title: 'Import Recipe' }} />
          <Stack.Screen name="grocery/[id]" options={{ title: 'Grocery List' }} />
          <Stack.Screen name="scan/review" options={{ title: 'Review' }} />
          <Stack.Screen name="circles/index" options={{ title: 'Circles' }} />
          <Stack.Screen name="circles/[id]" options={{ title: 'Circle' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
          <Stack.Screen name="check-in" options={{ presentation: 'modal', title: 'Quick Check-In' }} />
        </Stack>
      </AppProviders>
    </SafeAreaProvider>
  );
}
