import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme';
import { TextField } from './Form';
import { Button } from './ui';

function Backdrop({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss" />
        {children}
      </KeyboardAvoidingView>
    </Modal>
  );
}

export interface SheetOption<T> {
  label: string;
  value: T;
}

/** Action-sheet style picker; stands in for SwiftUI Picker/Menu. */
export function OptionSheet<T>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: SheetOption<T>[];
  selected?: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}) {
  return (
    <Backdrop visible={visible} onClose={onClose}>
      <View style={styles.sheet}>
        <Text style={[fonts.headline, styles.sheetTitle]}>{title}</Text>
        <ScrollView style={{ maxHeight: 360 }}>
          {options.map((option) => (
            <Pressable
              key={option.label}
              accessibilityRole="button"
              style={({ pressed }) => [styles.option, pressed && { backgroundColor: colors.surface }]}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
            >
              <Text style={[fonts.body, option.value === selected && { fontWeight: '700' }]}>{option.label}</Text>
              {option.value === selected && <Text style={fonts.body}>✓</Text>}
            </Pressable>
          ))}
        </ScrollView>
        <Button title="Cancel" variant="secondary" onPress={onClose} />
      </View>
    </Backdrop>
  );
}

/** Text-entry alert, like SwiftUI `.alert` with a TextField. */
export function PromptModal({
  visible,
  title,
  placeholder,
  confirmTitle = 'Create',
  onSubmit,
  onClose,
}: {
  visible: boolean;
  title: string;
  placeholder: string;
  confirmTitle?: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState('');

  const close = () => {
    setValue('');
    onClose();
  };

  const submit = () => {
    const trimmed = value.trim();
    close();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <Backdrop visible={visible} onClose={close}>
      <View style={styles.dialog}>
        <Text style={fonts.headline}>{title}</Text>
        <TextField value={value} onChangeText={setValue} placeholder={placeholder} autoFocus onSubmitEditing={submit} />
        <View style={styles.dialogButtons}>
          <Button title="Cancel" variant="secondary" onPress={close} style={styles.flex} />
          <Button title={confirmTitle} onPress={submit} style={styles.flex} />
        </View>
      </View>
    </Backdrop>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    marginTop: 'auto',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.card * 1.5,
    borderTopRightRadius: radius.card * 1.5,
    padding: spacing.l,
    paddingBottom: spacing.xxl,
    gap: spacing.s,
  },
  sheetTitle: { textAlign: 'center', marginBottom: spacing.s },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.s,
    borderRadius: radius.input,
  },
  dialog: {
    marginVertical: 'auto',
    marginHorizontal: spacing.xl,
    backgroundColor: colors.background,
    borderRadius: radius.card,
    padding: spacing.l,
    gap: spacing.m,
  },
  dialogButtons: { flexDirection: 'row', gap: spacing.s },
});
