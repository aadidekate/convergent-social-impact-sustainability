import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { BackendPlaceholderBanner, Button, Card } from '../../src/components/ui';
import { useScanDraft } from '../../src/stores/ScanStore';
import { useServices } from '../../src/stores/ServicesContext';
import { colors, fonts, spacing } from '../../src/theme';
import { notify } from '../../src/utils/confirm';

const cameraSupported = Platform.OS !== 'web';

export default function ScanScreen() {
  const router = useRouter();
  const services = useServices();
  const { setDraft } = useScanDraft();
  const [isParsing, setIsParsing] = useState(false);

  const parse = async (pages: string[]) => {
    setIsParsing(true);
    try {
      setDraft(await services.receiptScan.parseReceipt(pages));
      router.push('/scan/review');
    } catch (e) {
      notify("Couldn't read receipt", e instanceof Error ? e.message : undefined);
    } finally {
      setIsParsing(false);
    }
  };

  const scan = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      notify('Camera access needed', 'Pantree uses the camera to scan grocery receipts.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) await parse(result.assets.map((asset) => asset.uri));
  };

  return (
    <SafeAreaView edges={['top']} style={styles.flex}>
      <ScreenHeader title="Scan Receipt" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.hero}>
          <Ionicons name="scan-outline" size={36} color={colors.accent} />
          <Text style={fonts.title}>Scan a receipt</Text>
          <Text style={[fonts.body, { color: colors.textSecondary }]}>
            Point the camera at a grocery receipt. We&apos;ll pull out the items, prices, and estimated expiry dates so you can
            stock your pantry in one step.
          </Text>
        </Card>
        <BackendPlaceholderBanner message="Receipt OCR returns sample data" />
        {isParsing ? (
          <View style={styles.parsing}>
            <ActivityIndicator color={colors.accent} />
            <Text style={fonts.caption}>Reading receipt…</Text>
          </View>
        ) : (
          <View style={styles.actions}>
            <Button title="Scan receipt" icon="scan-outline" onPress={scan} disabled={!cameraSupported} />
            {!cameraSupported && <Text style={[fonts.caption, styles.center]}>Camera unavailable on web</Text>}
            {/* TODO(backend): remove sample path once real OCR is wired to the camera flow. */}
            <Button title="Use sample receipt" variant="secondary" onPress={() => parse([])} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.l, gap: spacing.l, paddingBottom: 140 },
  hero: { gap: spacing.s },
  parsing: { alignItems: 'center', gap: spacing.s },
  actions: { gap: spacing.s },
  center: { textAlign: 'center' },
});
