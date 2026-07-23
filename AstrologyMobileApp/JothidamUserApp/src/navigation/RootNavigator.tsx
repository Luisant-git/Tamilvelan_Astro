import { NavigationContainer, DarkTheme, Theme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import AppDrawerNavigator from './AppDrawerNavigator';
import LoginScreen from '../screens/user/LoginScreen';
import RegisterScreen from '../screens/user/RegisterScreen';
import { navigationRef } from './navigationRef';

const Stack = createStackNavigator();

// NavigationContainer defaults to React Navigation's own light DefaultTheme
// (colors.background: white) unless given an explicit theme — every
// individual navigator's cardStyle/sceneStyle was already set to match the
// app, but react-native-screens' native rendering falls back to this
// container-level theme color in some transition edge cases, which is what
// was actually causing the white flash on real Android devices despite the
// per-navigator background fixes (those alone were enough on web, where this
// native fallback path doesn't exist).
const AppNavigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0D0620',
    card: '#251450',
    primary: '#FFD700',
    text: '#F5F0FF',
    border: '#4B2A8F',
  },
};

// 'Home' here is the entire tabbed app (not the HomeScreen leaf). Login and
// Register call `navigation.replace('Home')` after success, which only
// resolves against screens in their own navigator — so that route lives at
// this same outer level rather than nested inside the tabs.
export default function RootNavigator() {
  return (
    <NavigationContainer ref={navigationRef} theme={AppNavigationTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          // Defaults to 'screen' off iOS, which makes @react-navigation/stack
          // render the active screen with minHeight:'100%' instead of flex:1
          // on web — relying on document.body to scroll, which react-native-web
          // blocks (body has overflow:hidden by default). That broke every
          // ScrollView-based form on web (content got clipped, nothing scrolled).
          headerMode: 'float',
          cardStyle: { backgroundColor: '#0D0620' },
          // 'none' — no slide/fade transition at all, so there's no
          // intermediate frame where the outgoing and incoming screens'
          // edges can expose a gap. Instant cut, matching native app
          // screen-switch behavior.
          animation: 'none',
        }}
      >
        <Stack.Screen name="Home" component={AppDrawerNavigator} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
