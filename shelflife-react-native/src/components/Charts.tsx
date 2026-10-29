import { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { colors, fonts, spacing } from '../theme';

const AXIS = 28;
const LABEL_HEIGHT = 18;

function useWidth() {
  const [width, setWidth] = useState(0);
  return [width, (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)] as const;
}

function niceMax(values: number[]): number {
  const max = Math.max(1, ...values);
  const step = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / step) * step;
}

function Gridlines({ width, height, max }: { width: number; height: number; max: number }) {
  return (
    <>
      {[0, 0.5, 1].map((t) => {
        const y = height - t * height;
        return (
          <SvgText key={t} x={0} y={y + 4} fontSize={10} fill={colors.textSecondary}>
            {Math.round(max * t)}
          </SvgText>
        );
      })}
      {[0, 0.5, 1].map((t) => (
        <Line
          key={`l${t}`}
          x1={AXIS}
          x2={width}
          y1={height - t * height}
          y2={height - t * height}
          stroke={colors.border}
          strokeWidth={1}
        />
      ))}
    </>
  );
}

export interface Series {
  name: string;
  color: string;
  values: number[];
}

export function GroupedBarChart({ labels, series, height = 200 }: { labels: string[]; series: Series[]; height?: number }) {
  const [width, onLayout] = useWidth();
  const plotHeight = height - LABEL_HEIGHT;
  const max = niceMax(series.flatMap((s) => s.values));
  const groupWidth = (width - AXIS) / Math.max(1, labels.length);
  const barWidth = (groupWidth * 0.7) / series.length;

  return (
    <View>
      <View onLayout={onLayout} style={{ height }}>
        {width > 0 && (
          <Svg width={width} height={height}>
            <Gridlines width={width} height={plotHeight} max={max} />
            {labels.map((label, i) => {
              const x0 = AXIS + i * groupWidth + groupWidth * 0.15;
              return series.map((s, j) => {
                const h = (s.values[i] / max) * plotHeight;
                return (
                  <Rect key={`${label}-${s.name}`} x={x0 + j * barWidth} y={plotHeight - h} width={barWidth - 2} height={h} rx={3} fill={s.color} />
                );
              })}
            )}
            {labels.map((label, i) => (
              <SvgText key={label + i} x={AXIS + (i + 0.5) * groupWidth} y={height - 4} fontSize={11} fill={colors.textSecondary} textAnchor="middle">
                {label}
              </SvgText>
            ))}
          </Svg>
        )}
      </View>
      <Legend series={series} />
    </View>
  );
}

export function LineChart({ labels, values, color, height = 160 }: { labels: string[]; values: number[]; color: string; height?: number }) {
  const [width, onLayout] = useWidth();
  const plotHeight = height - LABEL_HEIGHT;
  const max = niceMax(values);
  const step = (width - AXIS) / Math.max(1, labels.length);
  const points = values.map((v, i) => ({ x: AXIS + (i + 0.5) * step, y: plotHeight - (v / max) * plotHeight }));

  return (
    <View onLayout={onLayout} style={{ height }}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Gridlines width={width} height={plotHeight} max={max} />
          <Polyline points={points.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={color} strokeWidth={2.5} />
          {points.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={4} fill={color} />
          ))}
          {labels.map((label, i) => (
            <SvgText key={label + i} x={AXIS + (i + 0.5) * step} y={height - 4} fontSize={11} fill={colors.textSecondary} textAnchor="middle">
              {label}
            </SvgText>
          ))}
        </Svg>
      )}
    </View>
  );
}

export function HorizontalBarChart({ rows, color }: { rows: { label: string; value: number }[]; color: string }) {
  const max = niceMax(rows.map((r) => r.value));
  return (
    <View style={{ gap: spacing.s }}>
      {rows.map((row) => (
        <View key={row.label} style={styles.hRow}>
          <Text style={[fonts.caption, styles.hLabel]}>{row.label}</Text>
          <View style={styles.hTrack}>
            <View style={[styles.hBar, { width: `${(row.value / max) * 100}%`, backgroundColor: color }]} />
          </View>
          <Text style={[fonts.caption, styles.hValue]}>${row.value}</Text>
        </View>
      ))}
    </View>
  );
}

function Legend({ series }: { series: Series[] }) {
  return (
    <View style={styles.legend}>
      {series.map((s) => (
        <View key={s.name} style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: s.color }]} />
          <Text style={fonts.caption}>{s.name}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', gap: spacing.l, marginTop: spacing.s },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  swatch: { width: 10, height: 10, borderRadius: 5 },
  hRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  hLabel: { width: 72 },
  hTrack: { flex: 1, height: 18 },
  hBar: { height: 18, borderRadius: 4 },
  hValue: { width: 36, textAlign: 'right' },
});
