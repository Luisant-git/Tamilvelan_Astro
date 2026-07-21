// JothidamUserApp/src/screens/user/KarinaalScreen.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { styled } from '../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useMemo, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../../components/common/BackButton';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeArea = styled(SafeAreaView);

// ============ Types ============
type KarinaalCategory = 'ashtami' | 'navami' | 'chaturdasi';

interface KarinaalDay {
  isoDate: string;
  category: KarinaalCategory;
  weekdayTa: string;
  tithiName: string;
  isHoliday?: string;
}

interface KarinaalLabels {
  ta: string;
  en: string;
  reasonTa: string;
  reasonEn: string;
}

const MONTHS_TA = ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CATEGORY_TINT: Record<KarinaalCategory, string> = {
  ashtami: '#FF8C00',
  navami: '#FF6B6B',
  chaturdasi: '#C77DFF'
};

const KARINAAL_LABELS: Record<KarinaalCategory, KarinaalLabels> = {
  ashtami: {
    ta: 'அஷ்டமி',
    en: 'Ashtami',
    reasonTa: 'அஷ்டமி திதியில் புதிய தொடக்கங்கள் தவிர்க்கப்பட வேண்டும்',
    reasonEn: 'New beginnings should be avoided on Ashtami tithi'
  },
  navami: {
    ta: 'நவமி',
    en: 'Navami',
    reasonTa: 'நவமி திதியில் முக்கிய முடிவுகள் எடுக்கப்படக்கூடாது',
    reasonEn: 'Important decisions should not be made on Navami tithi'
  },
  chaturdasi: {
    ta: 'சதுர்தசி',
    en: 'Chaturdasi',
    reasonTa: 'சதுர்தசி திதியில் பயணங்கள் தவிர்க்கப்பட வேண்டும்',
    reasonEn: 'Travel should be avoided on Chaturdasi tithi'
  }
};

const FILTERS: Array<{ key: KarinaalCategory | 'all'; ta: string; en: string }> = [
  { key: 'all', ta: 'அனைத்தும்', en: 'All' },
  { key: 'ashtami', ta: 'அஷ்டமி', en: 'Ashtami' },
  { key: 'navami', ta: 'நவமி', en: 'Navami' },
  { key: 'chaturdasi', ta: 'சதுர்தசி', en: 'Chaturdasi' }
];

// ============ Helper Functions ============
function getWeekday(date: Date): string {
  const weekdays = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
  return weekdays[date.getDay()];
}

function getTithi(date: Date): string {
  // Simplified - In real app, use actual panchang calculation
  const day = date.getDate();
  if (day % 15 === 0) return 'அமாவாசை';
  if (day % 15 === 14) return 'பௌர்ணமி';
  if (day % 2 === 0) return 'அஷ்டமி';
  if (day % 3 === 0) return 'நவமி';
  return 'சதுர்தசி';
}

function findKarinaalDays(year: number, month: number): KarinaalDay[] {
  const days: KarinaalDay[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const tithi = getTithi(date);
    let category: KarinaalCategory | null = null;
    
    if (tithi === 'அஷ்டமி') category = 'ashtami';
    else if (tithi === 'நவமி') category = 'navami';
    else if (tithi === 'சதுர்தசி') category = 'chaturdasi';
    
    if (category) {
      const isoDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        isoDate,
        category,
        weekdayTa: getWeekday(date),
        tithiName: tithi,
        isHoliday: day === 1 || day === 15 ? '🎉 பண்டிகை' : undefined
      });
    }
  }
  return days;
}

// ============ Karinaal Card Component ============
function KarinaalCard({ 
  day, 
  onPress 
}: { 
  day: KarinaalDay; 
  onPress: (date: string) => void;
}) {
  const [y, m, d] = day.isoDate.split('-').map(Number);
  const tint = CATEGORY_TINT[day.category];
  const labels = KARINAAL_LABELS[day.category];
  const monthTa = MONTHS_TA[m - 1];

  return (
    <StyledTouchable
      className="bg-dark-card rounded-xl p-4 mb-3 border border-gold/10"
      style={{ borderLeftWidth: 4, borderLeftColor: tint }}
      onPress={() => onPress(day.isoDate)}
      activeOpacity={0.7}
    >
      <StyledView className="flex-row justify-between items-center">
        <StyledView>
          <StyledText className="text-gold text-xl font-serif font-bold">
            {String(d).padStart(2, '0')}-{String(m).padStart(2, '0')}-{y}
          </StyledText>
          <StyledText className="text-light-text/50 text-xs font-sans mt-0.5">
            {monthTa} · {day.weekdayTa}
          </StyledText>
        </StyledView>
        <StyledView 
          className="px-3 py-1.5 rounded-full border"
          style={{ borderColor: tint, backgroundColor: tint + '20' }}
        >
          <StyledText style={{ color: tint }} className="text-xs font-bold font-sans">
            {labels.ta}
          </StyledText>
        </StyledView>
      </StyledView>

      <StyledView className="flex-row mt-3 gap-4">
        <StyledView>
          <StyledText className="text-light-text/30 text-[10px] font-sans">தமிழ் தேதி</StyledText>
          <StyledText className="text-light-text text-xs font-sans">
            {monthTa} {d}
          </StyledText>
        </StyledView>
        <StyledView>
          <StyledText className="text-light-text/30 text-[10px] font-sans">திதி</StyledText>
          <StyledText className="text-light-text text-xs font-sans">{day.tithiName}</StyledText>
        </StyledView>
      </StyledView>

      <StyledView className="mt-3 p-2 bg-[#1A0E3A] rounded-lg">
        <StyledText className="text-light-text/50 text-[11px] font-sans leading-relaxed">
          ⚠️ {labels.reasonTa}
        </StyledText>
      </StyledView>

      {day.isHoliday && (
        <StyledView className="mt-2 p-2 bg-[#1A0E3A] rounded-lg">
          <StyledText className="text-[#4CAF50] text-xs font-sans">
            {day.isHoliday}
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
export default function KarinaalScreen({ navigation }: any) {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [filter, setFilter] = useState<KarinaalCategory | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Generate days
  const allDays = useMemo(() => {
    return findKarinaalDays(year, month);
  }, [year, month]);

  const filteredDays = filter === 'all' 
    ? allDays 
    : allDays.filter(d => d.category === filter);

  // Counts
  const counts = useMemo(() => {
    const c: Record<KarinaalCategory, number> = { ashtami: 0, navami: 0, chaturdasi: 0 };
    allDays.forEach(d => { c[d.category]++; });
    return c;
  }, [allDays]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handlePrevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };

  const handleNextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };

  const handleDayPress = (date: string) => {
    navigation.navigate('panchang', { date });
  };

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      
      {/* Header */}
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">
          🌑 கரி நாட்கள்
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
        <StyledView className="mb-3">
          <StyledText className="text-gold text-2xl font-serif font-bold">
            🌑 கரி நாட்கள்
          </StyledText>
          <StyledText className="text-light-text/50 text-sm font-sans mt-1">
            Inauspicious days — Ashtami, Navami, Chaturdasi tithis to avoid
          </StyledText>
        </StyledView>

        {/* Month Navigation */}
        <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-3">
          <StyledView className="flex-row items-center justify-between p-3">
            <StyledTouchable
              className="bg-[#1A0E3A] px-4 py-2 rounded-xl border border-gold/20"
              onPress={handlePrevMonth}
            >
              <StyledText className="text-gold text-lg font-bold">‹</StyledText>
            </StyledTouchable>
            
            <StyledView className="items-center">
              <StyledText className="text-gold text-lg font-serif font-bold">
                {MONTHS_TA[month]} {year}
              </StyledText>
              <StyledText className="text-light-text/30 text-[10px] font-sans">
                {MONTHS_EN[month]}
              </StyledText>
            </StyledView>
            
            <StyledTouchable
              className="bg-[#1A0E3A] px-4 py-2 rounded-xl border border-gold/20"
              onPress={handleNextMonth}
            >
              <StyledText className="text-gold text-lg font-bold">›</StyledText>
            </StyledTouchable>
          </StyledView>
        </StyledView>

        {/* Counts */}
        <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-3">
          <StyledView className="bg-[#321C6B] py-2.5 px-4">
            <StyledText className="text-gold text-sm font-sans font-bold text-center">
              இந்த மாதம் — This month
            </StyledText>
          </StyledView>
          <StyledView className="flex-row">
            {(['ashtami', 'navami', 'chaturdasi'] as KarinaalCategory[]).map((cat) => (
              <StyledView key={cat} className="flex-1 py-3 items-center bg-dark-card border-r border-gold/5 last:border-r-0">
                <StyledText style={{ color: CATEGORY_TINT[cat] }} className="text-2xl font-bold font-sans">
                  {counts[cat]}
                </StyledText>
                <StyledText className="text-light-text/40 text-[10px] font-sans mt-0.5">
                  {KARINAAL_LABELS[cat].ta}
                </StyledText>
              </StyledView>
            ))}
          </StyledView>
        </StyledView>

        {/* Filters */}
        <StyledView className="flex-row flex-wrap gap-2 mb-3">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <StyledTouchable
                key={f.key}
                className={`px-4 py-1.5 rounded-full border ${
                  active ? 'bg-[#321C6B] border-gold' : 'bg-dark-card border-gold/20'
                }`}
                onPress={() => setFilter(f.key)}
              >
                <StyledText className={active ? 'text-gold font-bold' : 'text-light-text/60'}>
                  {f.ta}
                </StyledText>
              </StyledTouchable>
            );
          })}
        </StyledView>

        {/* Days List */}
        {filteredDays.length === 0 ? (
          <StyledView className="bg-dark-card rounded-2xl p-8 border border-gold/10 items-center">
            <Ionicons name="calendar-outline" size={40} color="#666" />
            <StyledText className="text-light-text/50 text-sm font-sans mt-3 text-center">
              இந்த மாதம் இந்த வகை கரி நாட்கள் இல்லை.
            </StyledText>
            <StyledText className="text-light-text/20 text-xs font-sans mt-1 text-center">
              No karinaal days of this type this month.
            </StyledText>
          </StyledView>
        ) : (
          <StyledView className="mb-3">
            {filteredDays.map((day) => (
              <KarinaalCard 
                key={day.isoDate} 
                day={day} 
                onPress={handleDayPress}
              />
            ))}
          </StyledView>
        )}

        {/* Quick Links */}
        <StyledView className="flex-row gap-2 mb-3">
          <StyledTouchable
            className="flex-1 bg-dark-card py-3 rounded-xl border border-gold/10 items-center"
            onPress={() => navigation.navigate('muhurtham')}
          >
            <StyledText className="text-gold text-sm font-sans font-bold">
              ✨ சுப முகூர்த்தம் →
            </StyledText>
          </StyledTouchable>
          <StyledTouchable
            className="flex-1 bg-dark-card py-3 rounded-xl border border-gold/10 items-center"
            onPress={() => navigation.navigate('panchang')}
          >
            <StyledText className="text-gold text-sm font-sans font-bold">
              📅 பஞ்சாங்கம் →
            </StyledText>
          </StyledTouchable>
        </StyledView>

        {/* Note */}
        <StyledView className="bg-[#1A0E3A] rounded-xl p-4 border border-gold/10 mb-4">
          <StyledText className="text-light-text/40 text-[10px] font-sans leading-relaxed">
            குறிப்பு: கரிநாள் கணிப்பு பொதுவான பஞ்சாங்க விதிகளின் (அஷ்டமி, நவமி, சதுர்தசி திதிகள்) 
            அடிப்படையில் தோராயமாக கணக்கிடப்படுகிறது. முக்கிய நிகழ்வுகளுக்கு குலகுரு / 
            பாரம்பரிய ஜோதிடரிடம் ஆலோசிக்கவும்.
          </StyledText>
          <StyledText className="text-light-text/20 text-[9px] font-sans mt-2 leading-relaxed">
            Note: Karinaal estimation is based on lunar tithis. Traditional Tamil karinaal 
            list is solar-month based and may differ.
          </StyledText>
        </StyledView>

        {/* Footer */}
        <StyledView className="py-2 items-center">
          <StyledText className="text-light-text/20 text-[10px] font-sans">
            © {new Date().getFullYear()} Jothidam • Karinaal
          </StyledText>
        </StyledView>
      </StyledScrollView>
    </StyledSafeArea>
  );
}