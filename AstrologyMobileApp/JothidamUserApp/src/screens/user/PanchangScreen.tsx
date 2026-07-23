// JothidamUserApp/src/screens/user/PanchangScreen.tsx
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
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '../../components/common/CrossPlatformDateTimePicker';
import { panchangApi } from '../../services/panchang.api';
import { useFetch } from '../../hooks';
import BackButton from '../../components/common/BackButton';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeArea = styled(SafeAreaView);

// ============ Constants ============
const COLORS = {
  bg: '#0D0620',
  card: '#251450',
  surface: '#1A0E3A',
  border: '#4B2A8F',
  divider: '#32205A',
  gold: '#FFD700',
  saffron: '#FF8C00',
  text: '#F5F0FF',
  muted: '#A89BC8',
  subtle: '#8B7BAA',
  warning: '#FF6B6B',
  festival: '#4CAF50'
};

const MONTHS_TA = ['ஜனவரி','பிப்ரவரி','மார்ச்','ஏப்ரல்','மே','ஜூன்','ஜூலை','ஆகஸ்ட்','செப்டம்பர்','அக்டோபர்','நவம்பர்','டிசம்பர்'];
const TAMIL_WEEKDAYS = ['ஞாயிற்றுக்கிழமை', 'திங்கட்கிழமை', 'செவ்வாய்க்கிழமை', 'புதன்கிழமை', 'வியாழக்கிழமை', 'வெள்ளிக்கிழமை', 'சனிக்கிழமை'];

// ============ Types ============
interface Holiday {
  isoDate: string;
  ta: string;
  en: string;
  kind: 'national' | 'tamilnadu' | 'optional';
}

// ============ Helper Functions ============
function toISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getTamilMonthName(date: Date): string {
  const monthNames = ['சித்திரை', 'வைகாசி', 'ஆனி', 'ஆடி', 'ஆவணி', 'புரட்டாசி', 'ஐப்பசி', 'கார்த்திகை', 'மார்கழி', 'தை', 'மாசி', 'பங்குனி'];
  return monthNames[date.getMonth()] || '—';
}

function getTamilDay(date: Date): number {
  return date.getDate();
}

function getHolidaysForMonth(year: number, month: number): Holiday[] {
  // Mock holidays
  const holidays: Holiday[] = [];
  const days = [1, 15, 26];
  const names = ['தொழிலாளர் தினம்', 'சுதந்திர தினம்', 'குடியரசு தினம்'];
  days.forEach((day, i) => {
    if (day <= new Date(year, month + 1, 0).getDate()) {
      holidays.push({
        isoDate: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        ta: names[i],
        en: names[i],
        kind: i === 0 ? 'national' : i === 1 ? 'tamilnadu' : 'optional'
      });
    }
  });
  return holidays;
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

// 2. Card
function Card({ children }: { children: React.ReactNode }) {
  return (
    <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-3">
      {children}
    </StyledView>
  );
}

// 3. Time Table
function TimeTable({ rows }: { rows: Array<[string, string]> }) {
  return (
    <StyledView>
      {rows.map(([label, value], i) => (
        <StyledView
          key={label}
          className={`flex-row justify-between items-center px-4 py-3 ${
            i < rows.length - 1 ? 'border-b border-gold/5' : ''
          }`}
        >
          <StyledText className="text-light-text/70 text-sm font-sans">{label}</StyledText>
          <StyledText className="text-gold text-sm font-sans font-bold">{value}</StyledText>
        </StyledView>
      ))}
    </StyledView>
  );
}

// 4. Panchang Cell
function PanchangCell({ 
  title, 
  value, 
  multiline = false 
}: { 
  title: string; 
  value: string; 
  multiline?: boolean;
}) {
  return (
    <StyledView className={`p-3 flex-1 ${multiline ? 'border-t border-gold/5' : ''}`}>
      <StyledText className="text-[#FF8C00] text-sm font-sans font-bold text-center mb-1">
        {title}
      </StyledText>
      <StyledText className={`text-light-text text-center font-sans ${
        multiline ? 'text-xs' : 'text-sm'
      }`}>
        {value}
      </StyledText>
    </StyledView>
  );
}

// 5. Holiday List
function HolidayList({ items }: { items: Holiday[] }) {
  if (items.length === 0) {
    return (
      <StyledView className="p-4 items-center">
        <StyledText className="text-light-text/40 text-sm font-sans">இல்லை</StyledText>
      </StyledView>
    );
  }
  
  const getTagColor = (kind: string) => {
    if (kind === 'national') return COLORS.warning;
    if (kind === 'tamilnadu') return COLORS.festival;
    return COLORS.saffron;
  };
  
  const getTagLabel = (kind: string) => {
    if (kind === 'national') return 'NATL';
    if (kind === 'tamilnadu') return 'TN';
    return 'OPT';
  };

  return (
    <StyledView>
      {items.map((h, i) => {
        const [, m, d] = h.isoDate.split('-').map(Number);
        const monthTa = MONTHS_TA[m - 1];
        const tagColor = getTagColor(h.kind);
        
        return (
          <StyledView
            key={h.isoDate}
            className={`flex-row items-center justify-between px-4 py-3 ${
              i < items.length - 1 ? 'border-b border-gold/5' : ''
            }`}
          >
            <StyledView className="min-w-[70px]">
              <StyledText className="text-gold text-sm font-sans font-bold">
                {monthTa} {String(d).padStart(2, '0')}
              </StyledText>
            </StyledView>
            <StyledView className="flex-1 ml-2">
              <StyledText className="text-light-text text-sm font-sans">{h.ta}</StyledText>
              <StyledText className="text-light-text/30 text-[10px] font-sans">{h.en}</StyledText>
            </StyledView>
            <StyledView 
              className="px-2 py-0.5 rounded-full border"
              style={{ borderColor: tagColor }}
            >
              <StyledText style={{ color: tagColor }} className="text-[8px] font-bold font-sans">
                {getTagLabel(h.kind)}
              </StyledText>
            </StyledView>
          </StyledView>
        );
      })}
    </StyledView>
  );
}

// ============ Main Screen ============
export default function PanchangScreen({ navigation, route }: any) {
  const initialDate = route?.params?.date ? new Date(route.params.date) : new Date();
  const [date, setDate] = useState(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const tamilMonth = getTamilMonthName(date);
  const tamilDay = getTamilDay(date);
  const dow = date.getDay();
  const monthHolidays = getHolidaysForMonth(date.getFullYear(), date.getMonth());

  const { data, loading, refreshing, error, refetch } = useFetch(
    () => panchangApi.fetchToday(toISO(date)),
    [date]
  );

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDateChange = (selectedDate: Date) => {
    setDate(selectedDate);
    setShowDatePicker(false);
  };

  const shiftDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d);
  };

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      
      {/* Header */}
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        {/* Only Home shows the hamburger menu — every other screen, including
            this tab's own root, shows a back button that returns to Home. */}
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">
          📅 பஞ்சாங்கம்
        </StyledText>
        <StyledTouchable onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={24} color="#e2b714" />
        </StyledTouchable>
      </StyledView>

      <StyledScrollView
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e2b714" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Date Header */}
        <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-3">
          <StyledView className="flex-row items-center justify-between p-4">
            <StyledTouchable
              className="bg-[#1A0E3A] w-10 h-10 rounded-xl items-center justify-center border border-gold/20"
              onPress={() => shiftDate(-1)}
            >
              <Ionicons name="chevron-back" size={24} color="#e2b714" />
            </StyledTouchable>
            
            <StyledView className="items-center flex-1">
              <StyledText className="text-light-text/50 text-xs font-sans">
                {MONTHS_TA[date.getMonth()]} - {TAMIL_WEEKDAYS[dow].replace('கிழமை', '').trim()}
              </StyledText>
              <StyledText className="text-gold text-2xl font-bold font-sans mt-1">
                {String(date.getDate()).padStart(2, '0')}-{String(date.getMonth() + 1).padStart(2, '0')}-{date.getFullYear()}
              </StyledText>
              <StyledText className="text-light-text/30 text-[10px] font-sans mt-1">
                {tamilMonth} மாதம் - வசந்த ருது - உத்தராயணம்
              </StyledText>
              <StyledText className="text-light-text/20 text-[10px] font-sans">
                பராபவ - {tamilMonth} - {tamilDay}
              </StyledText>
            </StyledView>
            
            <StyledTouchable
              className="bg-[#1A0E3A] w-10 h-10 rounded-xl items-center justify-center border border-gold/20"
              onPress={() => shiftDate(1)}
            >
              <Ionicons name="chevron-forward" size={24} color="#e2b714" />
            </StyledTouchable>
          </StyledView>
        </StyledView>

        {loading ? (
          <StyledView className="py-10 items-center">
            <ActivityIndicator size="large" color="#e2b714" />
            <StyledText className="text-light-text/50 text-sm font-sans mt-4">
              ஏற்றுகிறோம்... / Loading...
            </StyledText>
          </StyledView>
        ) : !data ? (
          <StyledView className="bg-dark-card rounded-2xl p-8 border border-gold/10 items-center">
            <Ionicons name="alert-circle-outline" size={40} color="#FF6B6B" />
            <StyledText className="text-[#FF6B6B] text-sm font-sans mt-3 text-center">
              {error || 'பஞ்சாங்க தகவலை பெற முடியவில்லை.'}
            </StyledText>
            <StyledTouchable
              className="border border-gold/30 rounded-full px-5 py-2 mt-4"
              onPress={refetch}
            >
              <StyledText className="text-gold text-sm font-sans">மீண்டும் முயற்சி / Try Again</StyledText>
            </StyledTouchable>
          </StyledView>
        ) : (
          <>
            {/* Tithi Card */}
            <Card>
              <HeaderBand>{data.tithi}</HeaderBand>
              <StyledView className="flex-row justify-around items-center py-4">
                <StyledText className="text-3xl">🪔</StyledText>
                <StyledText className="text-3xl">🌙</StyledText>
                <StyledText className="text-[#FF8C00] text-3xl">⬆</StyledText>
              </StyledView>
              {!!data.specialDay && (
                <StyledView className="border-t border-gold/5 px-4 py-3">
                  <StyledText className="text-light-text text-sm font-sans text-center">
                    {data.specialDay}
                  </StyledText>
                </StyledView>
              )}
            </Card>

            {/* How is today */}
            <Card>
              <HeaderBand>இன்றைய நாள் எப்படி உள்ளது?</HeaderBand>
              <StyledView className="p-4 items-center">
                <StyledText className="text-light-text/60 text-sm font-sans">
                  இன்று நல்ல நாள். முயற்சிகள் வெற்றி பெறும்.
                </StyledText>
              </StyledView>
            </Card>

            {/* Nalla Neram */}
            <Card>
              <HeaderBand>நல்ல நேரம்</HeaderBand>
              <TimeTable rows={[
                ['காலை / Morning', data.nallaNeram.morning],
                ['மாலை / Evening', data.nallaNeram.evening]
              ]} />
            </Card>

            {/* Gowri Nalla Neram */}
            <Card>
              <HeaderBand>கௌரி நல்ல நேரம்</HeaderBand>
              <TimeTable rows={[
                ['காலை / Morning', data.gowriNeram.morning],
                ['மாலை / Evening', data.gowriNeram.evening]
              ]} />
            </Card>

            {/* Panchang Grid */}
            <Card>
              <HeaderBand>பஞ்சாங்கம்</HeaderBand>
              <StyledView className="flex-row flex-wrap">
                <StyledView className="w-1/2">
                  <PanchangCell title="சூரிய உதயம்" value={data.sunrise} />
                </StyledView>
                <StyledView className="w-1/2 border-l border-gold/5">
                  <PanchangCell title="சூரிய அஸ்தமனம்" value={data.sunset} />
                </StyledView>
                <StyledView className="w-1/2 border-t border-gold/5">
                  <PanchangCell title="கரணன்" value={data.karana} />
                </StyledView>
                <StyledView className="w-1/2 border-l border-t border-gold/5">
                  <PanchangCell title="யோகம்" value={data.yoga} />
                </StyledView>
                <StyledView className="w-1/2 border-t border-gold/5">
                  <PanchangCell title="திதி" value={data.tithi} />
                </StyledView>
                <StyledView className="w-1/2 border-l border-t border-gold/5">
                  <PanchangCell title="நட்சத்திரம்" value={data.nakshatra} />
                </StyledView>
              </StyledView>
            </Card>

            {/* Subha Muhurtham */}
            <Card>
              <HeaderBand>சுப முகூர்த்த நேரம்</HeaderBand>
              <TimeTable rows={[['இன்று / Today', data.shubhaMuhurtham]]} />
            </Card>

            {/* Avoid Timings */}
            <Card>
              <HeaderBand>தவிர்க்க வேண்டிய நேரங்கள்</HeaderBand>
              <TimeTable rows={[
                ['ராகு காலம்', data.rahuKalam],
                ['யமகண்டம்', data.yamagandam]
              ]} />
            </Card>

            {/* Government Holidays */}
            <Card>
              <HeaderBand>அரசு விடுமுறை நாட்கள் — {MONTHS_TA[date.getMonth()]} {date.getFullYear()}</HeaderBand>
              <HolidayList items={monthHolidays} />
            </Card>
          </>
        )}

        {/* Footer */}
        <StyledView className="py-2 items-center">
          <StyledText className="text-light-text/20 text-[10px] font-sans">
            © {new Date().getFullYear()} Jothidam • Panchang
          </StyledText>
        </StyledView>
      </StyledScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            // Android fires onChange on Cancel too, still carrying whatever
            // date was last scrolled to — only apply it when confirmed.
            if (event.type === 'dismissed') {
              setShowDatePicker(false);
              return;
            }
            if (selectedDate) handleDateChange(selectedDate);
          }}
        />
      )}
    </StyledSafeArea>
  );
}