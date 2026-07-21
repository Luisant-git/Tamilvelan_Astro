import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/user/HomeScreen';
import RasiPalanScreen from '../screens/user/RasiPalanScreen';
import JathagamScreen from '../screens/user/jathagam/JathagamScreen';
import PoruthamScreen from '../screens/user/PoruthamScreen';
import PanchangScreen from '../screens/user/PanchangScreen';
import MuhurthamScreen from '../screens/user/MuhurthamScreen';
import NumerologyScreen from '../screens/user/NumerologyScreen';
import PanchaPakshiScreen from '../screens/user/PanchaPakshiScreen';
import KadhalScreen from '../screens/user/KadhalScreen';
import AriggaiScreen from '../screens/user/AriggaiScreen';
import GowriScreen from '../screens/user/GowriScreen';
import HoraScreen from '../screens/user/HoraScreen';
import KarinaalScreen from '../screens/user/KarinaalScreen';
import KathaikalScreen from '../screens/user/KathaikalScreen';
import MaathaSirappuScreen from '../screens/user/MaathaSirappuScreen';
import NaalaiSirappuScreen from '../screens/user/NaalaiSirappuScreen';
import VasthuScreen from '../screens/user/VasthuScreen';
import ImportantDaysScreen from '../screens/user/ImportantDaysScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import ComingSoonScreen from '../screens/common/ComingSoonScreen';
import AstrologerListScreen from '../screens/user/consultation/AstrologerListScreen';
import BookingScreen from '../screens/user/consultation/BookingScreen';
import BookingHistoryScreen from '../screens/user/consultation/BookingHistoryScreen';
import HoroscopeHistoryScreen from '../screens/user/history/HoroscopeHistoryScreen';
import MarriageHistoryScreen from '../screens/user/history/MarriageHistoryScreen';

const Stack = createStackNavigator();

// All content screens live in one shared stack, mirroring the website's flat
// routing (every feature is a sibling page reachable from the Home tile grid).
// Registering them here — rather than scattering across the tab stacks — means
// every existing `navigation.navigate('<slug>')` call in the screens resolves
// locally without needing cross-tab navigation.
export default function HomeStackNavigator() {
  return (
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
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="rasi-palan" component={RasiPalanScreen} />
      <Stack.Screen name="jathagam" component={JathagamScreen} />
      <Stack.Screen name="porutham" component={PoruthamScreen} />
      <Stack.Screen name="panchang" component={PanchangScreen} />
      <Stack.Screen name="muhurtham" component={MuhurthamScreen} />
      <Stack.Screen name="numerology" component={NumerologyScreen} />
      <Stack.Screen name="pancha-pakshi" component={PanchaPakshiScreen} />
      <Stack.Screen name="kadhal" component={KadhalScreen} />
      <Stack.Screen name="ariggai" component={AriggaiScreen} />
      <Stack.Screen name="gowri" component={GowriScreen} />
      <Stack.Screen name="hora" component={HoraScreen} />
      <Stack.Screen name="karinaal" component={KarinaalScreen} />
      <Stack.Screen name="kathaikal" component={KathaikalScreen} />
      <Stack.Screen name="maatha-sirappu" component={MaathaSirappuScreen} />
      <Stack.Screen name="naalai-sirappu" component={NaalaiSirappuScreen} />
      <Stack.Screen name="vasthu" component={VasthuScreen} />
      <Stack.Screen name="important-days" component={ImportantDaysScreen} />
      <Stack.Screen name="profile" component={ProfileScreen} />
      <Stack.Screen name="aalosanai" component={AstrologerListScreen} />
      <Stack.Screen name="aalosanai-book" component={BookingScreen} />
      <Stack.Screen name="aalosanai-history" component={BookingHistoryScreen} />
      <Stack.Screen name="jathagam-history" component={HoroscopeHistoryScreen} />
      <Stack.Screen name="porutham-history" component={MarriageHistoryScreen} />
      <Stack.Screen name="Payment" component={ComingSoonScreen} />
      <Stack.Screen name="ask-astrologer" component={ComingSoonScreen} />
    </Stack.Navigator>
  );
}
