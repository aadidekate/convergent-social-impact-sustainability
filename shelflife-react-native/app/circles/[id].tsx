import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FormSection, TextField } from '../../src/components/Form';
import { CategoryIcon, ExpiryBadge, MemberAvatar } from '../../src/components/PantryBits';
import { BackendPlaceholderBanner, Button, EmptyState } from '../../src/components/ui';
import { useCircles } from '../../src/stores/CircleStore';
import { colors, fonts, spacing } from '../../src/theme';

export default function CircleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { circles, invite } = useCircles();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const circle = circles.find((c) => c.id === id);

  if (!circle) return <EmptyState title="Circle not found" icon="people-outline" />;

  const sendInvite = async () => {
    setIsSending(true);
    try {
      await invite(email.trim(), circle.id);
      setResult('Invite sent (placeholder)');
      setEmail('');
    } catch (e) {
      setResult(e instanceof Error ? e.message : 'Invite failed.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: circle.name }} />
      <FormSection title="Members">
        {circle.members.map((member) => (
          <View key={member.id} style={styles.row}>
            <MemberAvatar member={member} />
            <Text style={fonts.body}>{member.name}</Text>
          </View>
        ))}
      </FormSection>
      <FormSection title="Shared items">
        {circle.sharedItems.length === 0 && <Text style={[fonts.body, { color: colors.textSecondary }]}>Nothing shared yet</Text>}
        {circle.sharedItems.map((item) => (
          <View key={item.id} style={styles.row}>
            <CategoryIcon category={item.category} size={28} />
            <Text style={[fonts.body, styles.flex]}>{item.name}</Text>
            <ExpiryBadge item={item} />
          </View>
        ))}
      </FormSection>
      <FormSection title="Invite">
        {/* TODO(backend): invites are not sent; service is a placeholder. */}
        <BackendPlaceholderBanner message="Invites are not sent yet" />
        <TextField
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Button title="Send invite" onPress={sendInvite} loading={isSending} disabled={!email.trim()} />
      </FormSection>
      {result && <Text style={fonts.caption}>{result}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.l, gap: spacing.l },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.m },
});
