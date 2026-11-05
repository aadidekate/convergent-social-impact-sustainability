import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GroupedBarChart, HorizontalBarChart, LineChart } from '../../src/components/Charts';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { BackendPlaceholderBanner, Card, DetailRow, EmptyState } from '../../src/components/ui';
import { useServices } from '../../src/stores/ServicesContext';
import { colors, fonts, spacing } from '../../src/theme';
import type { FoodCategory, MonthlyReport } from '../../src/types/models';
import { categoryName, formatCurrency, formatMonth, formatPercent } from '../../src/utils/format';

function SummaryCard({ report, previous }: { report: MonthlyReport; previous?: MonthlyReport }) {
  const wastePercent = report.spent > 0 ? report.wastedValue / report.spent : 0;
  const change = previous ? report.wastedValue - previous.wastedValue : undefined;
  return (
    <Card style={styles.card}>
      <Text style={fonts.headline}>This month</Text>
      <DetailRow label="Spent" value={formatCurrency(report.spent)} />
      <DetailRow label="Wasted" value={formatCurrency(report.wastedValue)} />
      <DetailRow label="Wasted items" value={String(report.wastedItemCount)} />
      <DetailRow label="Waste % of spend" value={formatPercent(wastePercent)} />
      {change !== undefined && (
        <View style={styles.change}>
          {change === 0 ? (
            <>
              <Ionicons name="remove" size={14} color={colors.textSecondary} />
              <Text style={fonts.caption}>No change vs last month</Text>
            </>
          ) : (
            <>
              <Ionicons
                name={change < 0 ? 'trending-down' : 'trending-up'}
                size={14}
                color={change < 0 ? colors.success : colors.danger}
              />
              <Text style={[fonts.caption, { color: change < 0 ? colors.success : colors.danger }]}>
                {formatCurrency(Math.abs(change))} vs last month
              </Text>
            </>
          )}
        </View>
      )}
    </Card>
  );
}

export default function InsightsScreen() {
  const services = useServices();
  const [reports, setReports] = useState<MonthlyReport[] | null>(null);

  useEffect(() => {
    services.analytics.monthlyReports(6).then(setReports);
  }, [services]);

  const current = reports?.at(-1);
  const labels = reports?.map((r) => formatMonth(r.month)) ?? [];

  return (
    <SafeAreaView edges={['top']} style={styles.flex}>
      <ScreenHeader title="Insights" />
      {reports === null ? (
        <ActivityIndicator color={colors.accent} style={styles.flex} />
      ) : !current ? (
        <EmptyState title="No Data Yet" icon="bar-chart-outline" description="Scan receipts to see spending and waste." />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* TODO(backend): replace sample reports with aggregated receipts and removal events. */}
          <BackendPlaceholderBanner message="Spending and waste use sample data" />
          <SummaryCard report={current} previous={reports.at(-2)} />
          <Card style={styles.card}>
            <Text style={fonts.headline}>Spent vs wasted</Text>
            <GroupedBarChart
              labels={labels}
              series={[
                { name: 'Spent', color: colors.accent, values: reports.map((r) => r.spent) },
                { name: 'Wasted', color: colors.expiredText, values: reports.map((r) => r.wastedValue) },
              ]}
            />
          </Card>
          <Card style={styles.card}>
            <Text style={fonts.headline}>Waste trend</Text>
            <LineChart labels={labels} values={reports.map((r) => r.wastedValue)} color={colors.expiredText} />
          </Card>
          <Card style={styles.card}>
            <Text style={fonts.headline}>Most wasted this month</Text>
            <HorizontalBarChart
              color={colors.expiredText}
              rows={(Object.entries(current.wasteByCategory) as [FoodCategory, number][])
                .sort(([, a], [, b]) => b - a)
                .map(([category, value]) => ({ label: categoryName(category), value }))}
            />
          </Card>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.l, gap: spacing.l, paddingBottom: 140 },
  card: { gap: spacing.s },
  change: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
