// Mirrors the website's src/components/ProtectedRoute.tsx: wait for the
// auth context to finish restoring a session, then redirect to Login if
// there's no user. Re-runs whenever `user` changes, so logging out while
// sitting on a guarded screen redirects immediately instead of leaving the
// (now-401ing) screen visible.
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function RequireAuth({ navigation, children }: { navigation: any; children: React.ReactNode }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigation.replace('Login');
    }
  }, [loading, user, navigation]);

  if (loading || !user) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0620', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#e2b714" />
      </View>
    );
  }

  return <>{children}</>;
}
