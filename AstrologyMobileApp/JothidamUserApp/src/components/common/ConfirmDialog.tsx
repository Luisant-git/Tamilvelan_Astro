import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, Animated } from 'react-native';
import { styled } from '../../utils/styled';
import { Ionicons } from '@expo/vector-icons';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ConfirmDialogProps {
  visible: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  messageEn: string;
  messageTa: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  // 'gold' (default) is the neutral/informational style (e.g. Exit App).
  // 'danger' is for destructive confirmations (e.g. Logout) — grey outlined
  // Cancel, red filled confirm, instead of gold/gold.
  variant?: 'gold' | 'danger';
}

// "English / Tamil" → ["English", "Tamil"], stacked on two lines instead of
// one inline string. A single line forces both languages to fight for the
// same row — whichever button's combined text is longer wraps mid-word while
// the other stays on one line, so the two buttons end up different heights.
// Fixed two-line stacking keeps every button the same height regardless of
// label length.
function splitLabel(label: string): [string, string] {
  const [first, second] = label.split('/').map((s) => s.trim());
  return [first, second ?? ''];
}

// Themed replacement for Alert.alert's OS-rendered dialog — matches the
// Dropdown modal's visual language (bg-dark-card card, gold border, overlay
// Pressable to dismiss) instead of falling back to the plain native look.
export default function ConfirmDialog({
  visible,
  icon = 'power-outline',
  title,
  messageEn,
  messageTa,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  variant = 'gold',
}: ConfirmDialogProps) {
  const [titleEn, titleTa] = splitLabel(title);
  const [cancelEn, cancelTa] = splitLabel(cancelLabel);
  const [confirmEn, confirmTa] = splitLabel(confirmLabel);
  const isDanger = variant === 'danger';

  // Modal's own animationType only offers fade/slide/none, no scale — so the
  // fade+scale entrance is driven manually here and Modal is set to "none".
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 6 }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.92);
    }
  }, [visible, opacity, scale]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        onPress={onCancel}
      >
        {/* stopPropagation via its own onPress — otherwise a tap anywhere on
            the card (not just the buttons) would fall through to the overlay
            Pressable above and close the dialog. */}
        <AnimatedPressable
          onPress={(e) => e.stopPropagation()}
          style={{ width: '100%', maxWidth: 320, opacity, transform: [{ scale }] }}
        >
          <StyledView
            className={`bg-dark-card rounded-2xl border items-center px-6 pt-6 pb-5 ${isDanger ? 'border-light-text/10' : 'border-gold/20'}`}
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.35,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 16,
            }}
          >
            <StyledView
              className="w-12 h-12 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: isDanger ? 'rgba(255,107,107,0.12)' : 'rgba(255,215,0,0.1)' }}
            >
              <Ionicons name={icon} size={22} color={isDanger ? '#FF6B6B' : '#FFD700'} />
            </StyledView>

            <StyledText className="text-gold text-base font-serif font-bold text-center">{titleEn}</StyledText>
            {!!titleTa && <StyledText className="text-gold/80 text-sm font-sans font-bold text-center">{titleTa}</StyledText>}

            <StyledText className="text-light-text/80 text-sm font-sans text-center mt-3">{messageEn}</StyledText>
            <StyledText className="text-light-text/60 text-xs font-sans text-center mt-1">{messageTa}</StyledText>

            <StyledView className="flex-row mt-6" style={{ gap: 12 }}>
              <StyledTouchable
                onPress={onCancel}
                activeOpacity={0.8}
                className={`flex-1 rounded-xl items-center justify-center border-2 ${isDanger ? 'border-light-text/40' : 'border-gold'}`}
                style={{ minHeight: 54, paddingVertical: 8 }}
              >
                <StyledText
                  className={`font-sans font-bold text-sm ${isDanger ? 'text-light-text' : 'text-gold'}`}
                  numberOfLines={1}
                >
                  {cancelEn}
                </StyledText>
                {!!cancelTa && (
                  <StyledText
                    className={`font-sans text-xs mt-0.5 ${isDanger ? 'text-light-text/70' : 'text-gold/80'}`}
                    numberOfLines={1}
                  >
                    {cancelTa}
                  </StyledText>
                )}
              </StyledTouchable>
              {/* Gold variant (Exit App): outlined red, not filled — matches
                  Cancel's outlined style but in a clearly distinct color, so
                  the two actions are easy to tell apart without relying on a
                  filled background (a previous version set backgroundColor:
                  undefined here to "clear" it for this branch, which instead
                  overrode and cancelled bg-gold's className color entirely,
                  leaving this button with no visible fill or border contrast
                  at all). Danger variant (Logout) keeps its solid red fill. */}
              <StyledTouchable
                onPress={onConfirm}
                activeOpacity={0.8}
                className={`flex-1 rounded-xl items-center justify-center border-2 ${
                  isDanger ? 'bg-[#FF6B6B] border-[#FF6B6B]' : 'border-[#FF6B6B]'
                }`}
                style={{ minHeight: 54, paddingVertical: 8 }}
              >
                <StyledText
                  className={`font-sans font-bold text-sm ${isDanger ? 'text-white' : 'text-[#FF6B6B]'}`}
                  numberOfLines={1}
                >
                  {confirmEn}
                </StyledText>
                {!!confirmTa && (
                  <StyledText
                    className={`font-sans text-xs mt-0.5 ${isDanger ? 'text-white/70' : 'text-[#FF6B6B]/80'}`}
                    numberOfLines={1}
                  >
                    {confirmTa}
                  </StyledText>
                )}
              </StyledTouchable>
            </StyledView>
          </StyledView>
        </AnimatedPressable>
      </Pressable>
    </Modal>
  );
}
