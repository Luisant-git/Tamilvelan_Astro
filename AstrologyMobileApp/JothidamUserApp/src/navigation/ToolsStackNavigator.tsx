import { createStackNavigator } from '@react-navigation/stack';

import AstrologerListScreen from '../screens/user/consultation/AstrologerListScreen';
import BookingScreen from '../screens/user/consultation/BookingScreen';
import BookingHistoryScreen from '../screens/user/consultation/BookingHistoryScreen';

const Stack = createStackNavigator();

// ToolsTab needs its own nested stack (mirroring HomeStackNavigator) because
// AstrologerListScreen navigates onward to booking/history — routes that
// only exist inside HomeStackNavigator otherwise. navigate() bubbles up to
// ancestor navigators, never sideways into a sibling tab's stack, so without
// this, tapping "Book" from the Tools tab would fail to resolve.
export default function ToolsStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="aalosanai"
      screenOptions={{
        headerShown: false,
        // See RootNavigator.tsx for why this is needed — without it, web
        // ScrollViews on this stack's screens don't scroll (content gets
        // clipped at the viewport edge instead).
        headerMode: 'float',
        cardStyle: { backgroundColor: '#0D0620' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="aalosanai" component={AstrologerListScreen} />
      <Stack.Screen name="aalosanai-book" component={BookingScreen} />
      <Stack.Screen name="aalosanai-history" component={BookingHistoryScreen} />
    </Stack.Navigator>
  );
}
