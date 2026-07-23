import { View, Text, TouchableOpacity, RefreshControl, ActivityIndicator, FlatList } from 'react-native';
import { styled } from '../../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../../../components/common/BackButton';
import { consultationApi } from '../../../services/consultation.api';
import { useFetch } from '../../../hooks';
import RequireAuth from '../../../components/common/RequireAuth';
import type { Booking } from '../../../types/consultation.types';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const StyledSafeArea = styled(SafeAreaView);

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#FFD700',
  CONFIRMED: '#4CAF50',
  CANCELLED: '#FF6B6B',
};

function BookingRow({ booking }: { booking: Booking }) {
  const color = STATUS_COLOR[booking.status] || '#A89BC8';
  return (
    <StyledView className="bg-dark-card rounded-2xl p-4 mb-3 border border-gold/10">
      <StyledView className="flex-row items-center justify-between">
        <StyledText className="text-gold text-base font-serif font-bold">{booking.astrologerName}</StyledText>
        <StyledView className="px-2 py-0.5 rounded-full border" style={{ borderColor: color }}>
          <StyledText style={{ color }} className="text-[9px] font-bold font-sans">{booking.status}</StyledText>
        </StyledView>
      </StyledView>
      <StyledText className="text-light-text/60 text-sm font-sans mt-1">
        {new Date(booking.date).toLocaleDateString('en-IN')} · {booking.timeSlot}
      </StyledText>
    </StyledView>
  );
}

function BookingHistoryScreenInner({ navigation }: any) {
  const { data, loading, refreshing, error, refetch } = useFetch(consultationApi.fetchList, []);
  const bookings = data?.bookings || [];

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">என் பதிவுகள் / My Bookings</StyledText>
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
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BookingRow booking={item} />}
          contentContainerClassName="px-4 py-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor="#e2b714" />}
          ListEmptyComponent={
            <StyledView className="items-center py-10">
              <StyledText className="text-light-text/50 text-sm font-sans">பதிவுகள் இல்லை / No bookings yet</StyledText>
            </StyledView>
          }
        />
      )}
    </StyledSafeArea>
  );
}

export default function BookingHistoryScreen({ navigation }: any) {
  return (
    <RequireAuth navigation={navigation}>
      <BookingHistoryScreenInner navigation={navigation} />
    </RequireAuth>
  );
}
