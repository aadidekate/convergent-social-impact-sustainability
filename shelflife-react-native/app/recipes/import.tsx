import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { FormSection, TextField } from '../../src/components/Form';
import { BackendPlaceholderBanner, Button, IconButton } from '../../src/components/ui';
import { useRecipes } from '../../src/stores/RecipeStore';
import { colors, fonts, spacing } from '../../src/theme';

const isUrl = (text: string) => /^https?:\/\/\S+\.\S+/i.test(text);

export default function RecipeImportScreen() {
  const router = useRouter();
  const { importRecipe } = useRecipes();
  const [url, setUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trimmed = url.trim();

  const submit = async () => {
    setIsImporting(true);
    setError(null);
    try {
      await importRecipe(trimmed);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerLeft: () => <IconButton icon="close" label="Cancel" onPress={() => router.back()} /> }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormSection title="Recipe link">
          <TextField
            value={url}
            onChangeText={setUrl}
            placeholder="https://"
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
        </FormSection>
        <Button title="Import" onPress={submit} loading={isImporting} disabled={!isUrl(trimmed)} />
        {error && <Text style={[fonts.body, { color: colors.danger }]}>{error}</Text>}
        {/* TODO(backend): recipe import is a placeholder until server-side parsing exists. */}
        <BackendPlaceholderBanner message="Recipe import returns a placeholder recipe" />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.l, gap: spacing.l },
});
