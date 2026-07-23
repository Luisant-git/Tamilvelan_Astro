import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import HomeStackNavigator from './HomeStackNavigator';
import JathagamScreen from '../screens/user/jathagam/JathagamScreen';
import PanchangScreen from '../screens/user/PanchangScreen';

const Tab = createBottomTabNavigator();
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Mirrors the website's src/components/BottomNav.tsx destinations and
// bilingual labels. Icons use the bundled Ionicons font (not emoji) — emoji
// glyph rendering isn't guaranteed across every Android device/OS-version's
// font fallback chain in a release build, which is why they were showing up
// blank on real hardware despite working fine in dev/Expo Go.
// ToolsTab (Tools/Consultation) is temporarily hidden per explicit request —
// not deleted, ToolsStackNavigator still exists, just not registered below.
const TABS: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; iconFocused: keyof typeof Ionicons.glyphMap; ta: string; en: string }
> = {
  HomeTab: { icon: 'home-outline', iconFocused: 'home', ta: 'முகப்பு', en: 'Home' },
  JathagamTab: { icon: 'star-outline', iconFocused: 'star', ta: 'ஜாதகம்', en: 'Horoscope' },
  PanchangTab: { icon: 'sparkles-outline', iconFocused: 'sparkles', ta: 'ஆன்மிகம்', en: 'Spiritual' },
};

// A stable, named component (not an inline arrow function passed straight to
// `tabBarButton`) so its Animated.Value refs survive across re-renders
// instead of resetting — inline component identities change every render of
// the navigator, which would otherwise remount this and kill the animation.
function TabButton({ routeName, onPress, onLongPress, 'aria-selected': ariaSelected, style }: any) {
  // @react-navigation/bottom-tabs (v7) passes focus state to a custom
  // tabBarButton as the `aria-selected` prop, not the legacy RN
  // `accessibilityState.selected` — reading the latter silently always
  // returned undefined, so no tab ever rendered its focused/active style.
  const focused = !!ariaSelected;
  const tab = TABS[routeName];
  const highlight = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(highlight, { toValue: focused ? 1 : 0, duration: 220, useNativeDriver: false }).start();
    if (focused) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.18, duration: 110, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }),
      ]).start();
    }
  }, [focused, highlight, scale]);

  const backgroundColor = highlight.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(37,20,80,0)', 'rgba(37,20,80,1)'],
  });
  const borderTopColor = highlight.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,215,0,0)', 'rgba(255,215,0,1)'],
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityState={{ selected: focused }}
      style={[
        style,
        {
          flex: 1,
          backgroundColor,
          borderTopWidth: 2,
          borderTopColor,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 2,
        },
      ]}
    >
      <Animated.View style={{ alignItems: 'center', transform: [{ scale }] }}>
        <Ionicons name={focused ? tab.iconFocused : tab.icon} size={20} color={focused ? '#FFD700' : '#A89BC8'} />
        <Text
          style={{
            fontSize: 11,
            lineHeight: 13,
            marginTop: 3,
            fontWeight: focused ? '600' : '400',
            color: focused ? '#FFD700' : '#A89BC8',
            textAlign: 'center',
          }}
        >
          {tab.ta}
        </Text>
        <Text style={{ fontSize: 9, lineHeight: 11, color: focused ? '#FF8C00' : '#6B5A8A', textAlign: 'center' }}>
          {tab.en}
        </Text>
      </Animated.View>
    </AnimatedPressable>
  );
}

export default function MainTabNavigator() {
  // edgeToEdgeEnabled (app.json) means the app draws behind the Android
  // system navigation bar by default — without adding this inset, the tab
  // bar's bottom portion sits underneath the system back/home/recents
  // buttons and gets visually clipped.
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        // 'none' — no shift/fade transition between tabs, so there's no
        // intermediate frame where either scene's edge can expose a gap.
        // Instant cut, matching native app screen-switch behavior.
        animation: 'none',
        sceneStyle: { backgroundColor: '#0D0620' },
        tabBarStyle: {
          backgroundColor: '#1A0E3A',
          borderTopColor: '#4B2A8F',
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        // Rendering icon + both labels directly as the tabBarButton's own
        // children (instead of via the tabBarIcon slot) so they get the
        // full tab-segment width to lay out in. The tabBarIcon slot react-
        // navigation reserves is sized for an icon alone — cramming two
        // lines of bilingual text into it caused both lines to truncate
        // with an ellipsis even for short words like "முகப்பு".
        tabBarButton: (props) => <TabButton {...props} routeName={route.name} />,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
      <Tab.Screen name="JathagamTab" component={JathagamScreen} />
      <Tab.Screen name="PanchangTab" component={PanchangScreen} />
    </Tab.Navigator>
  );
}
