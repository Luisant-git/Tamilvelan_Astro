import { Alert, Platform } from 'react-native';

// react-native-web's Alert.alert() is a no-op stub (it never shows anything
// and never fires onPress/callbacks), so any Alert.alert-based flow is
// silently dead on web. These route web through window.alert/window.confirm
// instead; native platforms keep using the real Alert.alert.

export function notifyAlert(title: string, message: string, onDismiss?: () => void) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    onDismiss?.();
    return;
  }
  Alert.alert(title, message, onDismiss ? [{ text: 'OK', onPress: onDismiss }] : undefined);
}

export function confirmAlert(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText = 'OK',
  cancelText = 'Cancel'
) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelText, style: 'cancel' },
    { text: confirmText, style: 'destructive', onPress: onConfirm },
  ]);
}
