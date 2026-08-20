// JothidamUserApp/src/screens/user/jathagam/JathagamScreen.tsx
import {
  View,
  Text,
  ScrollView,
  RefreshControl
} from 'react-native';
import { styled } from '../../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import RequireAuth from '../../../components/common/RequireAuth';
import BackButton from '../../../components/common/BackButton';
import type { ChartData } from '../../../types/horoscope.types';

// Import sub-components
import JathagamForm from './JathagamForm';
import JathagamResult from './JathagamResult';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledSafeArea = styled(SafeAreaView);

// Types live in src/types/horoscope.types.ts (verified against the real
// backend response) — re-exported here so JathagamForm/JathagamResult's
// existing `from './JathagamScreen'` imports keep working unchanged.
export type { BirthInfo, Planet, DashaBhukti, DashaPeriod, ChartData } from '../../../types/horoscope.types';

function JathagamScreenInner({ navigation }: any) {
  const { user } = useAuth();
  const [result, setResult] = useState<ChartData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleResult = (data: ChartData) => {
    setResult(data);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      
      {/* Header */}
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        {/* Only Home shows the hamburger menu — every other screen, including
            this tab's own root, shows a back button that returns to Home. */}
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">
          🔮 ஜாதகம் / Horoscope
        </StyledText>
        {user && (
          <StyledView className="bg-gold/20 px-2 py-1 rounded-full">
            <StyledText className="text-gold text-[10px] font-sans">
              {user.name?.split(' ')[0] || 'User'}
            </StyledText>
          </StyledView>
        )}
      </StyledView>

      <StyledScrollView
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e2b714" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <StyledView className="mb-4">
          <StyledText className="text-gold text-2xl font-serif font-bold">
            ஜாதக கணிப்பு
          </StyledText>
          <StyledText className="text-light-text/50 text-sm font-sans mt-1">
            உங்கள் பிறப்பு விவரங்களை கொடுத்து முழு ஜாதகம் பெறுங்கள்
          </StyledText>
        </StyledView>

        {/* Form */}
        <JathagamForm onResult={handleResult} />

        {/* Result */}
        {result && <JathagamResult data={result} />}

        {/* Footer */}
        <StyledView className="py-4 items-center">
          <StyledText className="text-light-text/20 text-[10px] font-sans">
            © {new Date().getFullYear()} Jothidam • Jathagam
          </StyledText>
        </StyledView>
      </StyledScrollView>
    </StyledSafeArea>
  );
}

export default function JathagamScreen({ navigation }: any) {
  return (
    <RequireAuth navigation={navigation}>
      <JathagamScreenInner navigation={navigation} />
    </RequireAuth>
  );
}