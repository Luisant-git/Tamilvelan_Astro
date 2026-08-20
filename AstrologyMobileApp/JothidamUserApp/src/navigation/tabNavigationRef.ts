// Plain mutable holder (not React state) for MainTabNavigator's own
// navigation object. AppDrawerContent uses this to switch tabs directly —
// dispatching from the root-level navigationRef through Stack > Drawer >
// Tabs via the screen/params shorthand does not reliably resolve in this
// version combination (confirmed: the nested action collapses into inert
// params on the outer "Home" route instead of drilling down). Going
// straight to the tab navigator's own scope sidesteps that entirely, since
// tab names are valid local routes there with no nesting required.
export const tabNavigationRef: { current: any } = { current: null };
