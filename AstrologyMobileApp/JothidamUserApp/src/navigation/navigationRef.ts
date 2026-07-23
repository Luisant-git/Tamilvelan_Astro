import { createNavigationContainerRef } from '@react-navigation/native';

// Lets code outside the component tree (AuthContext's logout/401 handler)
// drive navigation without prop-drilling a `navigation` object down to it.
export const navigationRef = createNavigationContainerRef();
