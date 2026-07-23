import { View, Text, TouchableOpacity, Modal, Pressable, FlatList } from 'react-native';
import { styled } from '../../utils/styled';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const StyledPressable = styled(Pressable);

interface DropdownProps {
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  title?: string;
}

// Single-select via a Modal instead of an inline absolute-positioned list.
// The inline approach (still used by the birth-place suggestions box) kept
// breaking inside this form: percentage `top` resolved against the wrong
// ancestor, then maxHeight wasn't actually clipping the list, then the
// inner scroll got captured by the page's own ScrollView (nestedScrollEnabled
// didn't fully resolve it either). A Modal renders in its own top-level
// layer outside the page's view hierarchy, so none of those ancestor/
// stacking/nested-scroll issues can happen — its FlatList scrolls on its
// own with nothing to contend with.
export default function Dropdown({ value, options, onSelect, title }: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <StyledTouchable
        onPress={() => setOpen(true)}
        className="bg-dark border border-gold/30 rounded-xl px-3 py-2.5 flex-row items-center justify-between"
        activeOpacity={0.7}
      >
        <StyledText className="text-light-text text-sm font-sans" numberOfLines={1}>
          {value}
        </StyledText>
        <Ionicons name="chevron-down" size={16} color="#8B7BAA" />
      </StyledTouchable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <StyledPressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' }}
          onPress={() => setOpen(false)}
        >
          <StyledView
            className="bg-dark-card rounded-2xl border border-gold/30 overflow-hidden"
            style={{ width: 160, maxHeight: 360 }}
          >
            {!!title && (
              <StyledView className="px-4 py-3 border-b border-gold/20">
                <StyledText className="text-gold text-sm font-sans font-bold text-center">{title}</StyledText>
              </StyledView>
            )}
            <FlatList
              data={options}
              keyExtractor={(opt) => opt}
              initialNumToRender={options.length}
              getItemLayout={(_, index) => ({ length: 44, offset: 44 * index, index })}
              renderItem={({ item: opt, index }) => (
                <StyledTouchable
                  className={`px-4 py-3 items-center ${index < options.length - 1 ? 'border-b border-gold/10' : ''} ${
                    opt === value ? 'bg-gold/10' : ''
                  }`}
                  onPress={() => {
                    onSelect(opt);
                    setOpen(false);
                  }}
                >
                  <StyledText className={opt === value ? 'text-gold text-base font-sans font-bold' : 'text-light-text text-base font-sans'}>
                    {opt}
                  </StyledText>
                </StyledTouchable>
              )}
            />
          </StyledView>
        </StyledPressable>
      </Modal>
    </>
  );
}
