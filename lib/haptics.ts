import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptics are a native affordance; on web this is a silent no-op.
const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

const ignore = () => {};

export const haptics = {
  /** Light tap acknowledging a press. */
  press: () => {
    if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(ignore);
  },
  /** Discrete change (tab switch, toggle). */
  select: () => {
    if (enabled) Haptics.selectionAsync().catch(ignore);
  },
  /** User approved a decision. */
  approve: () => {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(ignore);
  },
};

export type HapticKind = keyof typeof haptics;
