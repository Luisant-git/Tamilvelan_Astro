import { TouchableOpacity } from 'react-native';
import { styled } from '../../utils/styled';
import { Ionicons } from '@expo/vector-icons';
import { tabNavigationRef } from '../../navigation/tabNavigationRef';

const StyledTouchable = styled(TouchableOpacity);

// Centralizes the back-button pattern that used to be copy-pasted inline
// across every content screen's header, so it can't drift between screens.
//
// Always renders — it used to self-hide via `if (!navigation.canGoBack())
// return null`, but canGoBack() is false for screens reached via the drawer
// (e.g. "Match" from AppDrawerContent jumps straight to HomeStack's
// "porutham" route with no "Home" entry pushed beneath it), leaving those
// screens with no way back at all.
//
// The fallback goes through tabNavigationRef (MainTabNavigator's own
// navigation object — the same one AppDrawerContent uses to switch tabs)
// instead of `navigation.navigate('Home')` on whatever navigator rendered
// this button. This component is used both by screens nested inside
// HomeStackNavigator (where 'Home' is a real local route) AND by
// JathagamScreen/PanchangScreen as MainTabNavigator's own tab-root screens
// (where the local navigator only knows 'JathagamTab'/'PanchangTab'/
// 'HomeTab' — 'Home' isn't a valid route there at all, so calling
// navigate('Home') directly would throw). Going through tabNavigationRef
// resolves correctly from either context.
export default function BackButton({ navigation }: { navigation: any }) {
  const handlePress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      tabNavigationRef.current?.navigate('HomeTab', { screen: 'Home' });
    }
  };
  return (
    <StyledTouchable
      onPress={handlePress}
      className="mr-3"
      accessibilityLabel="Go back"
      accessibilityRole="button"
    >
      <Ionicons name="arrow-back" size={24} color="#e2b714" />
    </StyledTouchable>
  );
}
