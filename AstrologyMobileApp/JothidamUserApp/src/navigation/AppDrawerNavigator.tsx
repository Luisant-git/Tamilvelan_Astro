import { createDrawerNavigator } from '@react-navigation/drawer';

import MainTabNavigator from './MainTabNavigator';
import AppDrawerContent from '../components/common/AppDrawerContent';

const Drawer = createDrawerNavigator();

// swipeEnabled: false — @react-navigation/stack's swipe-back gesture and the
// Drawer's own edge-swipe-to-open both claim the same left-edge pan via
// gesture-handler; rather than fight that conflict, the hamburger button is
// the only opener (DrawerMenuButton, dispatched from each tab-root screen).
export default function AppDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        swipeEnabled: false,
        drawerStyle: { backgroundColor: '#1A0E3A', width: '80%' },
        sceneStyle: { backgroundColor: '#0D0620' },
      }}
      drawerContent={(props) => <AppDrawerContent {...props} />}
    >
      <Drawer.Screen name="Tabs" component={MainTabNavigator} />
    </Drawer.Navigator>
  );
}
