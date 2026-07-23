import { View, Text, TouchableOpacity, RefreshControl, ActivityIndicator, FlatList } from 'react-native';
import { styled } from '../../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { consultationApi } from '../../../services/consultation.api';
import { useFetch } from '../../../hooks';
import BackButton from '../../../components/common/BackButton';
import type { Astrologer } from '../../../types/consultation.types';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const StyledSafeArea = styled(SafeAreaView);

function AstrologerCard({ astrologer, onPress }: { astrologer: Astrologer; onPress: () => void }) {
  return (
    <StyledView className="bg-dark-card rounded-2xl p-4 mb-3 border border-gold/10">
      <StyledView className="flex-row items-center justify-between">
        <StyledView className="flex-1">
          <StyledText className="text-gold text-base font-serif font-bold">{astrologer.name}</StyledText>
          <StyledText className="text-light-text/50 text-xs font-sans mt-0.5">{astrologer.specialization}</StyledText>
        </StyledView>
        <StyledView
          className="px-2 py-1 rounded-full border"
          style={{ borderColor: astrologer.available ? '#4CAF50' : '#FF6B6B' }}
        >
          <StyledText
            className="text-[9px] font-bold font-sans"
            style={{ color: astrologer.available ? '#4CAF50' : '#FF6B6B' }}
          >
            {astrologer.available ? 'AVAILABLE' : 'BUSY'}
          </StyledText>
        </StyledView>
      </StyledView>

      {!!astrologer.bio && (
        <StyledText className="text-light-text/60 text-xs font-sans mt-2 leading-relaxed">
          {astrologer.bio}
        </StyledText>
      )}

      <StyledView className="flex-row items-center justify-between mt-3 pt-3 border-t border-gold/10">
        <StyledView className="flex-row items-center" style={{ gap: 12 }}>
          <StyledView className="flex-row items-center">
            <Ionicons name="ribbon-outline" size={14} color="#8B7BAA" />
            <StyledText className="text-light-text/50 text-xs font-sans ml-1">
              {astrologer.experienceYrs} ஆண்டுகள்
            </StyledText>
          </StyledView>
          <StyledText className="text-[#FF8C00] text-sm font-bold">₹{astrologer.ratePerHour}/hr</StyledText>
        </StyledView>
        <StyledTouchable
          className={`px-4 py-2 rounded-lg ${astrologer.available ? 'bg-gold' : 'bg-gold/30'}`}
          onPress={onPress}
          disabled={!astrologer.available}
        >
          <StyledText className="text-dark text-sm font-bold">பதிவு / Book</StyledText>
        </StyledTouchable>
      </StyledView>
    </StyledView>
  );
}

export default function AstrologerListScreen({ navigation }: any) {
  const { data, loading, refreshing, error, refetch } = useFetch(consultationApi.fetchAstrologers, []);
  const astrologers = data || [];

  const renderItem = ({ item }: { item: Astrologer }) => (
    <AstrologerCard
      astrologer={item}
      onPress={() => navigation.navigate('aalosanai-book', { astrologer: item })}
    />
  );

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />

      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">🔮 ஜோதிடர் ஆலோசனை</StyledText>
        <StyledTouchable onPress={() => navigation.navigate('aalosanai-history')}>
          <Ionicons name="time-outline" size={24} color="#e2b714" />
        </StyledTouchable>
      </StyledView>

      {loading ? (
        <StyledView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#e2b714" />
          <StyledText className="text-light-text/60 mt-4">ஏற்றுகிறோம்...</StyledText>
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
          data={astrologers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerClassName="px-4 py-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor="#e2b714" />}
          ListHeaderComponent={
            <StyledView className="mb-4">
              <StyledText className="text-gold text-2xl font-serif font-bold">🔮 ஜோதிடர் ஆலோசனை</StyledText>
              <StyledText className="text-light-text/50 text-sm font-sans mt-1">
                அனுபவமுள்ள ஜோதிடர்களிடம் நேரடி ஆலோசனை பெறுங்கள்
              </StyledText>
            </StyledView>
          }
          ListEmptyComponent={
            <StyledView className="items-center py-10">
              <StyledText className="text-light-text/50 text-sm font-sans">தற்போது ஜோதிடர்கள் இல்லை</StyledText>
            </StyledView>
          }
          ListFooterComponent={
            <StyledView className="py-4 items-center">
              <StyledText className="text-light-text/20 text-[10px] font-sans">
                © {new Date().getFullYear()} Jothidam • Consultation
              </StyledText>
            </StyledView>
          }
        />
      )}
    </StyledSafeArea>
  );
}
