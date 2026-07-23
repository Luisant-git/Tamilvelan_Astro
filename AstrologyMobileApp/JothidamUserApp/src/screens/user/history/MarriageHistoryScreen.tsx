import { View, Text, TouchableOpacity, RefreshControl, ActivityIndicator, FlatList } from 'react-native';
import { styled } from '../../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../../../components/common/BackButton';
import { marriageApi } from '../../../services/marriage.api';
import { useFetch } from '../../../hooks';
import RequireAuth from '../../../components/common/RequireAuth';
import type { MarriageHistoryItem } from '../../../types/marriage.types';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const StyledSafeArea = styled(SafeAreaView);

// The history endpoint only returns summary fields (names + totalScore),
// not the full porutham/dosham breakdown — flat read-only list, no
// drill-through to a full result view.
function MatchRow({ item }: { item: MarriageHistoryItem }) {
  return (
    <StyledView className="bg-dark-card rounded-2xl p-4 mb-3 border border-gold/10">
      <StyledView className="flex-row items-center justify-between">
        <StyledText className="text-gold text-base font-serif font-bold">
          {item.brideName} ❤ {item.groomName}
        </StyledText>
        <StyledText className="text-[#FF8C00] text-sm font-bold">{item.totalScore} pts</StyledText>
      </StyledView>
      <StyledText className="text-light-text/30 text-[9px] font-sans mt-2">
        {new Date(item.createdAt).toLocaleString('en-IN')}
      </StyledText>
    </StyledView>
  );
}

function MarriageHistoryScreenInner({ navigation }: any) {
  const { data, loading, refreshing, error, refetch } = useFetch(marriageApi.fetchHistory, []);
  const matches = data?.matches || [];

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">பொருத்த வரலாறு / Match History</StyledText>
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
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MatchRow item={item} />}
          contentContainerClassName="px-4 py-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor="#e2b714" />}
          ListEmptyComponent={
            <StyledView className="items-center py-10">
              <StyledText className="text-light-text/50 text-sm font-sans">பொருத்தங்கள் இல்லை / No matches yet</StyledText>
            </StyledView>
          }
        />
      )}
    </StyledSafeArea>
  );
}

export default function MarriageHistoryScreen({ navigation }: any) {
  return (
    <RequireAuth navigation={navigation}>
      <MarriageHistoryScreenInner navigation={navigation} />
    </RequireAuth>
  );
}
