import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, BackHandler, Platform } from 'react-native';
import { styled } from '../../utils/styled';
import { DrawerContentScrollView, useDrawerStatus } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Logo from './Logo';
import ConfirmDialog from './ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { tabNavigationRef } from '../../navigation/tabNavigationRef';

// The only place the app is allowed to close itself — everywhere else
// (tab/drawer navigation, screen crashes, etc.) must never terminate the
// app. BackHandler.exitApp() only exists on Android; iOS has no supported
// way for an app to quit itself (Apple's HIG explicitly forbids it), so
// there this is a no-op after the confirmation.
function exitApp() {
  if (Platform.OS === 'android') BackHandler.exitApp();
}

// Calling navigate('Tabs', { screen: 'XTab' }) from drawerContent's own
// (Drawer-scoped) navigation prop — or the equivalent via the root
// navigationRef — does not reliably resolve in this Drawer+Tabs version
// combination: the nested action collapses into inert params on the outer
// "Home" route instead of actually drilling into Drawer > Tabs > XTab.
// Going straight to MainTabNavigator's own captured navigation object
// (tabNavigationRef) sidesteps that: tab names are valid LOCAL routes there,
// no cross-navigator nesting required at all.
function goToTab(tabName: string, nestedScreen?: string) {
  const nav = tabNavigationRef.current as any;
  if (!nav) return;
  if (nestedScreen) {
    nav.navigate(tabName, { screen: nestedScreen });
  } else {
    nav.navigate(tabName);
  }
}

interface ActiveRoute {
  tab: string | null;
  // Current screen within HomeTab's own nested stack — needed because
  // "Match" (porutham) lives inside HomeTab rather than being its own tab,
  // so matching on `tab` alone would highlight both Home and Match at once
  // any time HomeTab is focused.
  nested: string | null;
}

// Reads the tab navigator's own state (not a prop — the drawer sits above
// the tabs, so it has no direct subscription to which tab is focused) to
// drive the active-item highlight in the menu below. Re-subscribes every
// time the drawer opens rather than just once on mount: tabNavigationRef
// is only populated once HomeScreen's own effect runs, which can race with
// this component's first mount (drawer content mounts immediately at app
// start) — if the ref was still null then, the subscription would silently
// never attach and the highlight would stay stuck forever. By the time a
// user can actually open the drawer (the hamburger button only renders
// after the app has loaded), the ref is guaranteed to be set.
function useActiveRoute(): ActiveRoute {
  const [active, setActive] = useState<ActiveRoute>({ tab: null, nested: null });
  const isOpen = useDrawerStatus() === 'open';

  useEffect(() => {
    if (!isOpen) return;
    const nav = tabNavigationRef.current as any;
    if (!nav) return;
    const sync = () => {
      const state = nav.getState?.();
      if (!state) return;
      const tab = state.routeNames[state.index];
      const tabRoute = state.routes[state.index];
      const nestedState = tabRoute?.state;
      const nested = nestedState ? nestedState.routes[nestedState.index ?? 0]?.name ?? null : null;
      setActive({ tab, nested });
    };
    sync();
    const unsub = nav.addListener?.('state', sync);
    return unsub;
  }, [isOpen]);

  return active;
}

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);

interface MenuItem {
  ta: string;
  en: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  active?: boolean;
  danger?: boolean;
}

function MenuRow({ ta, en, icon, onPress, active, danger }: MenuItem) {
  const scale = useRef(new Animated.Value(1)).current;
  const highlight = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(highlight, { toValue: active ? 1 : 0, duration: 220, useNativeDriver: false }).start();
  }, [active, highlight]);

  const backgroundColor = highlight.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,215,0,0)', 'rgba(255,215,0,0.12)'],
  });

  return (
    <Animated.View style={{ backgroundColor, transform: [{ scale }] }}>
      <StyledTouchable
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start()}
        activeOpacity={1}
        className="px-5 py-3.5 border-b border-gold/10 flex-row items-center"
        style={{ gap: 12 }}
        accessibilityLabel={`drawer-item-${en}`}
      >
        <StyledView
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: danger ? 'rgba(255,107,107,0.12)' : active ? 'rgba(255,215,0,0.18)' : 'rgba(255,215,0,0.08)' }}
        >
          <Ionicons name={icon} size={17} color={danger ? '#FF6B6B' : active ? '#FFD700' : '#A89BC8'} />
        </StyledView>
        <StyledView className="flex-1">
          <StyledText className={danger ? 'text-[#FF6B6B] font-sans font-bold text-base' : active ? 'text-gold font-sans font-bold text-base' : 'text-light-text font-sans font-bold text-base'}>
            {ta}
          </StyledText>
          <StyledText className="text-light-text/40 text-xs font-sans">{en}</StyledText>
        </StyledView>
        {active && <StyledView className="w-1.5 h-1.5 rounded-full bg-gold" />}
      </StyledTouchable>
    </Animated.View>
  );
}

// Side-by-side button chips for the drawer footer (My Account/Logout when
// signed in, Login/Register when signed out) — matches the reference design,
// distinct from the full-width MenuRow list style used above.
function FooterButton({ ta, en, onPress, filled, danger }: Omit<MenuItem, 'icon' | 'active'> & { filled?: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <StyledTouchable
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start()}
        activeOpacity={1}
        className={`rounded-2xl py-3 items-center border ${
          filled ? 'bg-gold border-gold' : danger ? 'border-[#FF6B6B]' : 'border-gold'
        }`}
        accessibilityLabel={`drawer-item-${en}`}
      >
        <StyledText
          className={`font-sans font-bold text-sm ${
            filled ? 'text-dark' : danger ? 'text-[#FF6B6B]' : 'text-gold'
          }`}
        >
          {ta}
        </StyledText>
        <StyledText className={`text-[10px] font-sans ${filled ? 'text-dark/60' : 'text-light-text/40'}`}>
          {en}
        </StyledText>
      </StyledTouchable>
    </Animated.View>
  );
}

export default function AppDrawerContent({ navigation }: { navigation: any }) {
  const { user, logout } = useAuth();
  const { tab: activeTab, nested: activeNested } = useActiveRoute();
  const insets = useSafeAreaInsets();
  const [exitDialogVisible, setExitDialogVisible] = useState(false);

  const goTo = (tabName: string, nestedScreen?: string) => {
    goToTab(tabName, nestedScreen);
    navigation.closeDrawer();
  };

  // அறிக்கை (Report) and ஆலோசனை (Consultation) are temporarily hidden from
  // the menu per explicit request, mirroring the same change in the web
  // app's Navbar.tsx NAV_LINKS — not deleted, just not rendered for now.
  // `isActive` is checked explicitly per item (rather than a plain tab-name
  // match) because Match lives nested inside HomeTab's own stack — matching
  // on tab alone would highlight both Home and Match together any time
  // HomeTab is focused, regardless of which screen is actually showing.
  //
  // Every item targets an explicit nested screen (not just the tab name) so
  // the destination is always deterministic — e.g. "Home" always lands on
  // HomeStack's actual "Home" route, regardless of whatever screen (Profile,
  // a tile, etc.) HomeTab's stack happened to be showing last. Leaving the
  // nested screen unspecified previously meant "navigate to HomeTab" was a
  // no-op whenever HomeTab was already focused on something else.
  const navItems: Array<Omit<MenuItem, 'active'> & { isActive: boolean }> = [
    { ta: 'முகப்பு', en: 'Home', icon: 'home-outline', onPress: () => goTo('HomeTab', 'Home'), isActive: activeTab === 'HomeTab' && activeNested !== 'porutham' && activeNested !== 'profile' },
    { ta: 'ஜாதகம்', en: 'Horoscope', icon: 'star-outline', onPress: () => goTo('JathagamTab'), isActive: activeTab === 'JathagamTab' },
    { ta: 'பொருந்தம்', en: 'Match', icon: 'heart-outline', onPress: () => goTo('HomeTab', 'porutham'), isActive: activeTab === 'HomeTab' && activeNested === 'porutham' },
    { ta: 'பஞ்சாங்கம்', en: 'Panchang', icon: 'sparkles-outline', onPress: () => goTo('PanchangTab'), isActive: activeTab === 'PanchangTab' },
    { ta: 'வெளியேறு', en: 'Exit', icon: 'power-outline', onPress: () => setExitDialogVisible(true), isActive: false, danger: true },
  ];

  return (
    <>
    <DrawerContentScrollView
      contentContainerStyle={{ flex: 1, backgroundColor: '#1A0E3A' }}
    >
      {/* Brand header — background extends behind the status bar, but its
          content (logo/title/close button) is pushed below it via insets.top
          so it doesn't get visually covered by the status bar's own icons. */}
      <StyledView
        className="flex-row items-center px-5 pb-5 border-b border-gold/10"
        style={{ backgroundColor: '#251450', paddingTop: insets.top + 20 }}
      >
        <Logo size={36} />
        <StyledView className="flex-1 ml-3">
          <StyledText className="text-gold text-base font-serif font-bold">
            தமிழ்வேலன் / TamilVelan
          </StyledText>
          <StyledText className="text-light-text/40 text-[10px] font-sans">
            TamilVelan Calendar
          </StyledText>
        </StyledView>
        {/* navigation here is the Drawer's own object, so closeDrawer() works directly */}
        <StyledTouchable onPress={() => navigation.closeDrawer()}>
          <Ionicons name="close" size={24} color="#FFD700" />
        </StyledTouchable>
      </StyledView>

      {navItems.map(({ isActive, ...item }) => (
        <MenuRow key={item.en} {...item} active={isActive} />
      ))}

      <StyledView className="flex-1" />

      <StyledView
        className="border-t border-gold/10 p-4 flex-row"
        style={{ gap: 10, paddingBottom: Math.max(insets.bottom, 16) }}
      >
        {user ? (
          <>
            <FooterButton ta="என் கணக்கு" en="My Account" onPress={() => goTo('HomeTab', 'profile')} />
            <FooterButton ta="வெளியேறு" en="Logout" danger onPress={() => logout()} />
          </>
        ) : (
          <>
            <FooterButton ta="உள்நுழை" en="Login" onPress={() => navigation.navigate('Login')} />
            <FooterButton ta="பதிவு செய்" en="Register" filled onPress={() => navigation.navigate('Register')} />
          </>
        )}
      </StyledView>
    </DrawerContentScrollView>

    <ConfirmDialog
      visible={exitDialogVisible}
      icon="power-outline"
      title="Exit App / வெளியேறு"
      messageEn="Are you sure you want to exit the app?"
      messageTa="ஆப்ஸிலிருந்து வெளியேற விரும்புகிறீர்களா?"
      cancelLabel="Cancel / ரத்து செய்"
      confirmLabel="Exit / வெளியேறு"
      onCancel={() => setExitDialogVisible(false)}
      onConfirm={() => {
        setExitDialogVisible(false);
        exitApp();
      }}
    />
    </>
  );
}
