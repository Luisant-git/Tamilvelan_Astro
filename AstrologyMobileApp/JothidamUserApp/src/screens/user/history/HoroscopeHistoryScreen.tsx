import { View, Text, TouchableOpacity, RefreshControl, ActivityIndicator, FlatList } from 'react-native';
import { styled } from '../../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../../../components/common/BackButton';
import { horoscopeApi } from '../../../services/horoscope.api';
import { useFetch } from '../../../hooks';
import RequireAuth from '../../../components/common/RequireAuth';
import type { HoroscopeHistoryItem } from '../../../types/horoscope.types';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const StyledSafeArea = styled(SafeAreaView);

// The history endpoint only returns summary fields (rasi/lagna/nakshatra/
// dashaLord), not the full chart breakdown — so this is a flat read-only
// list, no drill-through to a full JathagamResult view.
function ChartRow({ item }: { item: HoroscopeHistoryItem }) {
  return (
    <StyledView className="bg-dark-card rounded-2xl p-4 mb-3 border border-gold/10">
      <StyledText className="text-gold text-base font-serif font-bold">{item.profile.fullName}</StyledText>
      <StyledText className="text-light-text/40 text-[10px] font-sans mt-0.5">
        {item.profile.birthPlace} · {new Date(item.profile.dob).toLocaleDateString('en-IN')}
      </StyledText>
      <StyledView className="flex-row flex-wrap mt-2" style={{ gap: 6 }}>
        <StyledView className="bg-dark rounded-md px-2 py-1">
          <StyledText className="text-light-text/60 text-[10px] font-sans">லக்னம்: <StyledText className="text-gold">{item.lagna}</StyledText></StyledText>
        </StyledView>
        <StyledView className="bg-dark rounded-md px-2 py-1">
          <StyledText className="text-light-text/60 text-[10px] font-sans">ராசி: <StyledText className="text-gold">{item.rasi}</StyledText></StyledText>
        </StyledView>
        <StyledView className="bg-dark rounded-md px-2 py-1">
          <StyledText className="text-light-text/60 text-[10px] font-sans">நட்சத்திரம்: <StyledText className="text-gold">{item.nakshatra}</StyledText></StyledText>
        </StyledView>
      </StyledView>
      <StyledText className="text-light-text/30 text-[9px] font-sans mt-2">
        {new Date(item.generatedAt).toLocaleString('en-IN')}
      </StyledText>
    </StyledView>
  );
}

function HoroscopeHistoryScreenInner({ navigation }: any) {
  const { data, loading, refreshing, error, refetch } = useFetch(horoscopeApi.fetchHistory, []);
  const charts = data?.charts || [];

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">என் ஜாதக வரலாறு / Horoscope History</StyledText>
      </StyledView>

      {loading ? (
        <StyledView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#e2b714" />
        </StyledView>
      ) : error ? (
        <StyledView className="flex-1 items-center justify-center px-4">
          <Ionicons name="alert-circle-outline" size={60} color="#FF6B6B" />
          <StyledText className="text-[#FF6B6B] text-center mt-4">{error}</StyledText>
          <StyledTouchable className="border border-gold/30 rounded-full px-5 py-2 mt-4" onPress={refetch}>
            <StyledText className="text-gold text-sm font-sans">மீண்டும் முயற்சி / Try Again</StyledText>
          </StyledTouchable>
        </StyledView>
      ) : (
        <FlatList
          data={charts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChartRow item={item} />}
          contentContainerClassName="px-4 py-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor="#e2b714" />}
          ListEmptyComponent={
            <StyledView className="items-center py-10">
              <StyledText className="text-light-text/50 text-sm font-sans">ஜாதகங்கள் இல்லை / No horoscopes yet</StyledText>
            </StyledView>
          }
        />
      )}
    </StyledSafeArea>
  );
}

export default function HoroscopeHistoryScreen({ navigation }: any) {
  return (
    <RequireAuth navigation={navigation}>
      <HoroscopeHistoryScreenInner navigation={navigation} />
    </RequireAuth>
  );
}
