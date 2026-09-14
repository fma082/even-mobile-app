import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { tokens } from '@/theme/tokens';
import type { Evidence } from '@/types/decision';

// Resolved styles, not classes — see the note in Card.tsx.
const styles = StyleSheet.create({
  list: { gap: tokens.spacing[12] },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: tokens.spacing[12] },
  // Sits on the first line's optical centre rather than its top.
  bullet: {
    width: tokens.size.dot,
    height: tokens.size.dot,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.accent,
    marginTop: (tokens.type.body.lineHeight - tokens.size.dot) / 2,
  },
  label: { flex: 1 },
});

/**
 * The "why" behind a proposal — always rendered BEFORE the ask, never after it.
 * Reasoning the user can check is what makes approving a decision rather than obeying one.
 */
export function EvidenceList({ items }: { items: Evidence[] }) {
  return (
    <View style={styles.list} accessibilityRole="list">
      {items.map((item) => (
        <View key={item.label} style={styles.row}>
          <View style={styles.bullet} />
          <Text variant="body" tone="secondary" style={styles.label}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
