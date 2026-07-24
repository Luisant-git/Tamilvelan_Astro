import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, Animated, Dimensions } from 'react-native';
import { styled } from '../../utils/styled';
import { Ionicons } from '@expo/vector-icons';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

interface MonthYearPickerProps {
  visible: boolean;
  year: number;
  month: number; // 0-based
  monthsTa: string[];
  onSelect: (year: number, month: number) => void;
  onClose: () => void;
}

// Bottom-sheet month/year picker — opened by tapping the "மாத - ஆண்டு" title
// in the calendar nav card, so users can jump straight to any month/year
// instead of tapping the prev/next arrows one step at a time. Reuses the same
// Modal + manual-Animated approach as ConfirmDialog/Dropdown (a slide-up
// sheet here fits "pick one of many" better than a centered card, but the
// animation primitives, overlay-dismiss, and color palette are unchanged).
export default function MonthYearPicker({
  visible,
  year,
  month,
  monthsTa,
  onSelect,
  onClose,
}: MonthYearPickerProps) {
  const [pickerYear, setPickerYear] = useState(year);

  useEffect(() => {
    if (visible) setPickerYear(year);
  }, [visible, year]);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(sheetTranslateY, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 4 }),
      ]).start();
    } else {
      overlayOpacity.setValue(0);
      sheetTranslateY.setValue(Dimensions.get('window').height);
    }
  }, [visible, overlayOpacity, sheetTranslateY]);

  const isCurrentSelection = (m: number) => pickerYear === year && m === month;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <AnimatedPressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', opacity: overlayOpacity }}
        onPress={onClose}
      >
        <AnimatedView
          style={{ transform: [{ translateY: sheetTranslateY }] }}
          onStartShouldSetResponder={() => true}
        >
          <StyledView
            className="bg-dark-card rounded-t-3xl border-t border-x border-gold/20 px-4 pt-3 pb-6"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.35,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: -4 },
              elevation: 16,
            }}
          >
            {/* Grab handle */}
            <StyledView className="items-center mb-2">
              <StyledView className="w-10 h-1 rounded-full bg-gold/20" />
            </StyledView>

            {/* Year selector */}
            <StyledView className="flex-row items-center justify-between mb-4">
              <StyledTouchable
                className="bg-[#1A0E3A] w-10 h-10 rounded-xl items-center justify-center border border-gold/20"
                onPress={() => setPickerYear(y => y - 1)}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={22} color="#e2b714" />
              </StyledTouchable>

              <StyledText className="text-gold text-xl font-serif font-bold">
                {pickerYear}
              </StyledText>

              <StyledTouchable
                className="bg-[#1A0E3A] w-10 h-10 rounded-xl items-center justify-center border border-gold/20"
                onPress={() => setPickerYear(y => y + 1)}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={22} color="#e2b714" />
              </StyledTouchable>
            </StyledView>

            {/* Month grid */}
            <StyledView className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
              {monthsTa.map((mTa, idx) => {
                const selected = isCurrentSelection(idx);
                return (
                  <StyledView key={mTa} style={{ width: '33.333%', padding: 4 }}>
                    <StyledTouchable
                      className={`rounded-xl items-center justify-center py-3.5 border ${
                        selected ? 'bg-gold/10 border-gold' : 'bg-[#1A0E3A] border-gold/10'
                      }`}
                      activeOpacity={0.75}
                      onPress={() => onSelect(pickerYear, idx)}
                    >
                      <StyledText
                        className={`font-sans text-sm ${selected ? 'text-gold font-bold' : 'text-light-text'}`}
                      >
                        {mTa}
                      </StyledText>
                    </StyledTouchable>
                  </StyledView>
                );
              })}
            </StyledView>
          </StyledView>
        </AnimatedView>
      </AnimatedPressable>
    </Modal>
  );
}
