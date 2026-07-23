// Must be the very first import — installs the native gesture handler
// responder that @react-navigation/stack relies on for screen transitions.
// Without it, touches inside the navigator tree can fail silently on
// Android/iOS while web (which doesn't need it) keeps working.
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
