// JothidamUserApp/src/screens/user/MuhurthamScreen.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { styled } from '../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useCallback, useMemo } from 'react';
import BackButton from '../../components/common/BackButton';
import DateTimePicker from '../../components/common/CrossPlatformDateTimePicker';
import { notifyAlert } from '../../utils/alert';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeArea = styled(SafeAreaView);

// ============ Constants ============
const COLORS = {
  card: '#251450',
  surface: '#1A0E3A',
  border: '#4B2A8F',
  divider: '#32205A',
  gold: '#FFD700',
  saffron: '#FF8C00',
  text: '#F5F0FF',
  muted: '#A89BC8',
  subtle: '#8B7BAA',
  festival: '#4CAF50'
};

const MONTHS_TA = ['ஜனவரி','பிப்ரவரி','மார்ச்','ஏப்ரல்','மே','ஜூன்','ஜூலை','ஆகஸ்ட்','செப்டம்பர்','அக்டோபர்','நவம்பர்','டிசம்பर'];

// ============ Types ============
interface Purpose {
  key: string;
  ta: string;
  en: string;
  icon: string;
}

interface Slot {
  isoDate: string;
  score: number;
  nakshatra: string;
  tithi: string;
  nallaNeram: { morning: string; evening: string };
  isHoliday?: string;
}

// ============ Mock Data ============
const PURPOSES: Purpose[] = [
  { key: 'wedding', ta: 'திருமணம்', en: 'Wedding', icon: '💍' },
  { key: 'housewarming', ta: 'வீடு புகுதல்', en: 'Housewarming', icon: '🏠' },
  { key: 'business', ta: 'வியாபாரம்', en: 'Business', icon: '💼' },
  { key: 'education', ta: 'கல்வி', en: 'Education', icon: '📚' },
  { key: 'travel', ta: 'பயணம்', en: 'Travel', icon: '✈️' },
  { key: 'health', ta: 'உடல்நலம்', en: 'Health', icon: '🏥' }
];

function getWeekdayTa(date: Date): string {
  const weekdays = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
  return weekdays[date.getDay()];
}

function getWeekdayForISO(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return getWeekdayTa(new Date(y, m - 1, d));
}

// ============ Components ============

// 1. Header Band
function HeaderBand({ children }: { children: React.ReactNode }) {
  return (
    <StyledView className="bg-[#321C6B] py-3 px-4 border-b border-gold/10">
      <StyledText className="text-gold text-center font-sans font-bold text-sm">
        {children}
      </StyledText>
    </StyledView>
  );
}

// 2. Slot Card
function SlotCard({ slot, onPress }: { slot: Slot; onPress: () => void }) {
  const [y, m, d] = slot.isoDate.split('-').map(Number);
  
  return (
    <StyledTouchable
      className="bg-dark-card rounded-xl p-4 mb-3 border border-gold/10"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <StyledView className="flex-row justify-between items-center">
        <StyledView>
          <StyledText className="text-gold text-xl font-serif font-bold">
            {String(d).padStart(2, '0')}-{String(m).padStart(2, '0')}-{y}
          </StyledText>
          <StyledText className="text-light-text/50 text-xs font-sans mt-0.5">
            {MONTHS_TA[m - 1]} · {getWeekdayForISO(slot.isoDate)}
          </StyledText>
        </StyledView>
        <StyledView className="bg-[#1A0E3A] px-3 py-1 rounded-full border border-gold/20">
          <StyledText className="text-[#FF8C00] text-xs font-bold font-sans">
            Score {slot.score}
          </StyledText>
        </StyledView>
      </StyledView>

      <StyledView className="flex-row flex-wrap mt-3 gap-3">
        <StyledView className="flex-1 min-w-[80px]">
          <StyledText className="text-light-text/30 text-[10px] font-sans">நட்சத்திரம்</StyledText>
          <StyledText className="text-light-text text-sm font-sans">{slot.nakshatra}</StyledText>
        </StyledView>
        <StyledView className="flex-1 min-w-[80px]">
          <StyledText className="text-light-text/30 text-[10px] font-sans">திதி</StyledText>
          <StyledText className="text-light-text text-sm font-sans">{slot.tithi}</StyledText>
        </StyledView>
      </StyledView>

      <StyledView className="flex-row flex-wrap mt-2 gap-3">
        <StyledView className="flex-1 min-w-[80px]">
          <StyledText className="text-light-text/30 text-[10px] font-sans">நல்ல நேரம் காலை</StyledText>
          <StyledText className="text-gold text-sm font-sans">{slot.nallaNeram.morning}</StyledText>
        </StyledView>
        <StyledView className="flex-1 min-w-[80px]">
          <StyledText className="text-light-text/30 text-[10px] font-sans">நல்ல நேரம் மாலை</StyledText>
          <StyledText className="text-gold text-sm font-sans">{slot.nallaNeram.evening}</StyledText>
        </StyledView>
      </StyledView>

      {slot.isHoliday && (
        <StyledView className="mt-2 p-2 bg-[#1A0E3A] rounded-lg">
          <StyledText className="text-[#4CAF50] text-xs font-sans">
            🎉 {slot.isHoliday}
          </StyledText>
        </StyledView>
      )}

      <StyledText className="text-light-text/20 text-[10px] font-sans text-right mt-2">
        இந்த நாள் பஞ்சாங்கம் பார்க்க →
      </StyledText>
    </StyledTouchable>
  );
}

// ============ Main Screen ============
export default function MuhurthamScreen({ navigation }: any) {
  const today = useMemo(() => new Date(), []);
  const ninetyDaysOut = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 90);
    return d;
  }, [today]);

  const [purpose, setPurpose] = useState<Purpose>(PURPOSES[0]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(ninetyDaysOut);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const findMuhurthams = useCallback(() => {
    if (endDate < startDate) {
      notifyAlert('Error', 'End date must be after start date');
      return;
    }
    
    setLoading(true);
    
    // Mock API call - replace with actual API
    setTimeout(() => {
      const mockSlots: Slot[] = [
        {
          isoDate: '2026-01-15',
          score: 92,
          nakshatra: 'ரோகிணி',
          tithi: 'சுக்ல பிரதமை',
          nallaNeram: { morning: '6:00 - 7:30', evening: '4:30 - 6:00' },
          isHoliday: '🌺 திருவோணம்'
        },
        {
          isoDate: '2026-01-22',
          score: 88,
          nakshatra: 'உத்திரம்',
          tithi: 'சுக்ல அஷ்டமி',
          nallaNeram: { morning: '7:00 - 8:30', evening: '5:00 - 6:30' }
        },
        {
          isoDate: '2026-01-28',
          score: 85,
          nakshatra: 'சுவாதி',
          tithi: 'சுக்ல சதுர்தசி',
          nallaNeram: { morning: '6:30 - 8:00', evening: '4:00 - 5:30' }
        },
        {
          isoDate: '2026-02-05',
          score: 90,
          nakshatra: 'மிருகசீரிடம்',
          tithi: 'கிருஷ்ண பிரதமை',
          nallaNeram: { morning: '5:30 - 7:00', evening: '4:30 - 6:00' }
        }
      ];
      setSlots(mockSlots);
      setLoading(false);
    }, 1000);
  }, [startDate, endDate]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    findMuhurthams();
    setTimeout(() => setRefreshing(false), 1000);
  }, [findMuhurthams]);

  const handleSlotPress = (isoDate: string) => {
    navigation.navigate('panchang', { date: isoDate });
  };

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      
      {/* Header */}
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">
          ✨ சுபமுகூர்த்த தேர்வு
        </StyledText>
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
            ✨ சுபமுகூர்த்த தேர்வு
          </StyledText>
          <StyledText className="text-light-text/50 text-sm font-sans mt-1">
            Muhurtham Finder — pick a purpose + date range
          </StyledText>
        </StyledView>

        {/* Purpose Selection */}
        <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-3">
          <HeaderBand>நோக்கம் தேர்வு — Choose purpose</HeaderBand>
          <StyledView className="flex-row flex-wrap">
            {PURPOSES.map((p) => {
              const isActive = purpose.key === p.key;
              return (
                <StyledTouchable
                  key={p.key}
                  className={`w-[33.33%] p-3 items-center ${
                    isActive ? 'bg-[#321C6B]' : 'bg-dark-card'
                  }`}
                  style={{
                    borderTopWidth: isActive ? 2 : 0,
                    borderTopColor: isActive ? COLORS.gold : 'transparent'
                  }}
                  onPress={() => setPurpose(p)}
                >
                  <StyledText className="text-2xl">{p.icon}</StyledText>
                  <StyledText className={`text-sm font-sans font-bold ${
                    isActive ? 'text-gold' : 'text-light-text'
                  }`}>
                    {p.ta}
                  </StyledText>
                  <StyledText className="text-light-text/30 text-[10px] font-sans">
                    {p.en}
                  </StyledText>
                </StyledTouchable>
              );
            })}
          </StyledView>
        </StyledView>

        {/* Date Range */}
        <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-3">
          <HeaderBand>தேதி வரம்பு — Date range</HeaderBand>
          
          <StyledView className="p-4">
            {/* Start Date */}
            <StyledView className="mb-3">
              <StyledText className="text-light-text/50 text-xs font-sans mb-1">
                தொடக்கம் / From
              </StyledText>
              <StyledTouchable
                className="bg-[#1A0E3A] border border-gold/20 rounded-xl px-4 py-3"
                onPress={() => setShowStartPicker(true)}
              >
                <StyledText className="text-light-text font-sans">
                  {startDate.toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </StyledText>
              </StyledTouchable>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowStartPicker(false);
                    // Android fires onChange on Cancel too, still carrying
                    // whatever date was last scrolled to — ignore it then.
                    if (event.type === 'dismissed') return;
                    if (selectedDate) setStartDate(selectedDate);
                  }}
                />
              )}
            </StyledView>

            {/* End Date */}
            <StyledView className="mb-4">
              <StyledText className="text-light-text/50 text-xs font-sans mb-1">
                முடிவு / To
              </StyledText>
              <StyledTouchable
                className="bg-[#1A0E3A] border border-gold/20 rounded-xl px-4 py-3"
                onPress={() => setShowEndPicker(true)}
              >
                <StyledText className="text-light-text font-sans">
                  {endDate.toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </StyledText>
              </StyledTouchable>
              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowEndPicker(false);
                    // Android fires onChange on Cancel too, still carrying
                    // whatever date was last scrolled to — ignore it then.
                    if (event.type === 'dismissed') return;
                    if (selectedDate) setEndDate(selectedDate);
                  }}
                />
              )}
            </StyledView>

            {/* Find Button */}
            <StyledTouchable
              className="bg-gold rounded-xl py-4 items-center"
              onPress={findMuhurthams}
              disabled={loading}
            >
              {loading ? (
                <StyledView className="flex-row items-center">
                  <ActivityIndicator size="small" color="#1a1a2e" />
                  <StyledText className="text-dark font-bold text-base ml-2">
                    Searching...
                  </StyledText>
                </StyledView>
              ) : (
                <StyledText className="text-dark font-bold text-base">
                  ✨ சுபமுகூர்த்தம் கண்டறி
                </StyledText>
              )}
            </StyledTouchable>
          </StyledView>
        </StyledView>

        {/* Results */}
        {slots !== null && (
          <StyledView className="mb-3">
            <StyledText className="text-light-text/50 text-sm font-sans text-center mb-3">
              {slots.length > 0
                ? `${purpose.ta} — சிறந்த ${slots.length} நாட்கள் / Top ${slots.length} for ${purpose.en}`
                : 'பொருத்தமான நாட்கள் இல்லை. வேறு வரம்பை முயற்சிக்கவும்.'}
            </StyledText>
            {slots.map((slot, index) => (
              <SlotCard 
                key={slot.isoDate + index} 
                slot={slot} 
                onPress={() => handleSlotPress(slot.isoDate)} 
              />
            ))}
          </StyledView>
        )}

        {/* Note */}
        <StyledView className="bg-[#1A0E3A] rounded-xl p-4 border border-gold/10 mb-4">
          <StyledText className="text-light-text/40 text-[10px] font-sans leading-relaxed">
            குறிப்பு: இந்த கணிப்பு பொதுவான பஞ்சாங்க விதிகளின் அடிப்படையில் தோராயமாக 
            கணக்கிடப்படுகிறது. முக்கியமான நிகழ்வுகளுக்கு குலகுரு / பாரம்பரிய 
            ஜோதிடரிடம் ஆலோசிக்கவும்.
          </StyledText>
          <StyledText className="text-light-text/20 text-[9px] font-sans mt-2 leading-relaxed">
            Note: This is a heuristic estimate based on common panchang rules. 
            For important events, consult a traditional astrologer.
          </StyledText>
        </StyledView>

        {/* Footer */}
        <StyledView className="py-2 items-center">
          <StyledText className="text-light-text/20 text-[10px] font-sans">
            © {new Date().getFullYear()} Jothidam • Muhurtham
          </StyledText>
        </StyledView>
      </StyledScrollView>
    </StyledSafeArea>
  );
}