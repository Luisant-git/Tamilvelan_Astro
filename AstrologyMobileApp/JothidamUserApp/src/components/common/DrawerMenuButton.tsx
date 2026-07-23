import { TouchableOpacity } from 'react-native';
import { styled } from '../../utils/styled';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';

const StyledTouchable = styled(TouchableOpacity);

// dispatch (not navigation.getParent()) so this works regardless of how many
// stack/tab layers sit between the calling screen and the Drawer — the
// action bubbles up until a navigator that handles it is found.
export default function DrawerMenuButton({ navigation, spacing = 'mr-3' }: { navigation: any; spacing?: string }) {
  return (
    <StyledTouchable
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      className={`w-10 h-10 rounded-full bg-gold/10 items-center justify-center ${spacing}`}
      activeOpacity={0.7}
      accessibilityLabel="Open menu"
      accessibilityRole="button"
    >
      <Ionicons name="menu" size={22} color="#e2b714" />
    </StyledTouchable>
  );
}
