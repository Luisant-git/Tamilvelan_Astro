import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styled } from '../../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../../../components/common/BackButton';
import DateTimePicker from '../../../components/common/CrossPlatformDateTimePicker';
import { Platform } from 'react-native';
import { consultationApi } from '../../../services/consultation.api';
import { useMutation } from '../../../hooks';
import { useAuth } from '../../../context/AuthContext';
import { notifyAlert } from '../../../utils/alert';
import type { Astrologer } from '../../../types/consultation.types';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const StyledSafeArea = styled(SafeAreaView);

// Backend imposes no enum on timeSlot (free text, just checked for clashes) —
// these are a UI choice: hourly slots covering a typical workday.
const TIME_SLOTS = [
  '09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM', '01:00 PM - 02:00 PM', '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM', '04:00 PM - 05:00 PM', '05:00 PM - 06:00 PM',
];

export default function BookingScreen({ navigation, route }: any) {
  const astrologer: Astrologer = route.params.astrologer;
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlot, setTimeSlot] = useState<string | null>(null);
  const { user } = useAuth();
  const { mutate, loading } = useMutation(consultationApi.book);

  const handleBook = async () => {
    // Browsing astrologers is public, but booking requires a login — mirrors
    // the website's aalosanai page, which checks isLoggedIn at this same
    // point rather than gating the whole page.
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    if (!timeSlot) {
      notifyAlert('Error', 'நேரத்தை தேர்ந்தெடுக்கவும் / Please select a time slot');
      return;
    }
    try {
      const { booking } = await mutate({
        astrologerId: astrologer.id,
        date: date.toISOString().split('T')[0],
        timeSlot,
      });
      notifyAlert(
        'பதிவு வெற்றி / Booked',
        `${booking.astrologerName} — ${booking.timeSlot}\nநிலை: ${booking.status}`,
        () => navigation.navigate('aalosanai-history')
      );
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        notifyAlert('Error', 'அந்த நேரம் ஏற்கனவே பதிவாகியுள்ளது. வேறு நேரம் தேர்வு செய்யவும்.');
      } else {
        notifyAlert('Error', err?.response?.data?.error || 'பதிவு செய்ய முடியவில்லை / Could not book');
      }
    }
  };

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">ஆலோசனை பதிவு / Book</StyledText>
      </StyledView>

      <StyledView className="px-4 py-4">
        <StyledView className="bg-dark-card rounded-2xl p-4 border border-gold/10 mb-4">
          <StyledText className="text-gold text-base font-serif font-bold">{astrologer.name}</StyledText>
          <StyledText className="text-light-text/50 text-xs font-sans mt-0.5">{astrologer.specialization}</StyledText>
          <StyledText className="text-[#FF8C00] text-sm font-bold mt-1">₹{astrologer.ratePerHour}/hr</StyledText>
        </StyledView>

        <StyledText className="text-light-text/70 text-sm font-sans mb-2">தேதி / Date</StyledText>
        <StyledTouchable
          onPress={() => setShowDatePicker(true)}
          className="bg-dark-card border border-gold/30 rounded-xl px-4 py-3 flex-row items-center mb-4"
        >
          <Ionicons name="calendar-outline" size={18} color="#8B7BAA" />
          <StyledText className="text-light-text ml-2">{date.toLocaleDateString('en-IN')}</StyledText>
        </StyledTouchable>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            minimumDate={new Date()}
            onChange={(event, selected) => {
              setShowDatePicker(Platform.OS === 'ios');
              // Android fires onChange on Cancel too, still carrying
              // whatever date was last scrolled to — ignore it then.
              if (event.type === 'dismissed') return;
              if (selected) setDate(selected);
            }}
          />
        )}

        <StyledText className="text-light-text/70 text-sm font-sans mb-2">நேரம் / Time Slot</StyledText>
        <StyledView className="flex-row flex-wrap" style={{ gap: 8 }}>
          {TIME_SLOTS.map((slot) => (
            <StyledTouchable
              key={slot}
              onPress={() => setTimeSlot(slot)}
              className={`px-3 py-2 rounded-full border ${timeSlot === slot ? 'bg-gold border-gold' : 'border-gold/30'}`}
            >
              <StyledText className={timeSlot === slot ? 'text-dark text-xs font-bold' : 'text-light-text/60 text-xs'}>
                {slot}
              </StyledText>
            </StyledTouchable>
          ))}
        </StyledView>

        <StyledTouchable
          className={`bg-gold rounded-xl py-3.5 items-center mt-6 ${loading ? 'opacity-70' : ''}`}
          onPress={handleBook}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#1a1a2e" />
          ) : (
            <StyledText className="text-dark font-bold">பதிவு செய் / Confirm Booking</StyledText>
          )}
        </StyledTouchable>
      </StyledView>
    </StyledSafeArea>
  );
}
