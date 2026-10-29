import Constants from 'expo-constants';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FormRow, FormSection } from '../src/components/Form';
import { BackendPlaceholderBanner, Button } from '../src/components/ui';
import { usePantry } from '../src/stores/PantryStore';
import { useServices } from '../src/stores/ServicesContext';
import { colors, fonts, radius, spacing } from '../src/theme';

const LEAD_OPTIONS = [
  { label: 'Day of', value: 0 },
  { label: '1 day', value: 1 },
  { label: '2 days', value: 2 },
  { label: '3 days', value: 3 },
];

export default function SettingsScreen() {
  const services = useServices();
  const { leadDays, setLeadDays } = usePantry();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <FormSection title="Notifications">
        <Button title="Enable notifications" variant="secondary" onPress={() => services.notifications.requestAuthorization()} />
        <Text style={fonts.body}>Remind me</Text>
        <View style={styles.segmented}>
          {LEAD_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected: leadDays === option.value }}
              onPress={() => setLeadDays(option.value)}
              style={[styles.segment, leadDays === option.value && styles.segmentSelected]}
            >
              <Text style={[fonts.caption, { color: leadDays === option.value ? colors.onAccent : colors.textPrimary }]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={fonts.caption}>{leadDays === 0 ? 'On the day items expire.' : 'Before items expire.'}</Text>
        <Button title="Send test notification" variant="secondary" onPress={() => services.notifications.sendTest()} />
        <Text style={fonts.caption}>Arrives in 5 seconds. Lock the device to see it.</Text>
      </FormSection>
      <FormSection title="Account">
        {/* TODO(backend): sign-in needs an account service (Supabase Auth). */}
        <Text style={[fonts.body, { color: colors.textSecondary }]}>Sign in</Text>
        <BackendPlaceholderBanner message="Accounts need a backend" />
      </FormSection>
      <FormSection title="About">
        <FormRow label="Version">
          <Text style={[fonts.body, { color: colors.textSecondary }]}>{Constants.expoConfig?.version ?? 'Unknown'}</Text>
        </FormRow>
      </FormSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.l, gap: spacing.l },
  segmented: { flexDirection: 'row', padding: 3, borderRadius: radius.input, backgroundColor: colors.surface },
  segment: { flex: 1, alignItems: 'center', paddingVertical: spacing.s, borderRadius: radius.input - 2 },
  segmentSelected: { backgroundColor: colors.accent },
});
