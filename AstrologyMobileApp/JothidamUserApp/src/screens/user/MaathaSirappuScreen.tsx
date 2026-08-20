// JothidamUserApp/src/screens/user/MaathaSirappuScreen.tsx
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
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../../components/common/BackButton';
import MonthYearPicker from '../../components/common/MonthYearPicker';
import { holidaysForMonth, type Holiday } from '../../utils/holidays';

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
  warning: '#FF6B6B',
  festival: '#4CAF50',
  sundayRed: '#FF6B6B',
  todayBg: '#7C1A1A'
};

const MONTHS_TA = ['ஜனவரி','பிப்ரவரி','மார்ச்','ஏப்ரல்','மே','ஜூன்','ஜூலை','ஆகஸ்ட்','செப்டம்பர்','அக்டோபர்','நவம்பர்','டிசம்பர்'];
const WEEKDAYS_TA = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
const WEEKDAYS_SHORT = ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'];

const VIRATHA_LIST: Array<[string, string, string]> = [
  ['●', 'அமாவாசை', '16 சனி'],
  ['○', 'பௌர்ணமி', '1 வெள்ளி, 31 ஞாயிறு'],
  ['⭐', 'கிருத்திகை', '16 சனி'],
  ['🛕', 'திருவோணம்', '9 சனி'],
  ['🪔', 'ஏகாதசி', '13 புதன், 27 புதன்'],
  ['🌸', 'சஷ்டி', '7 வியாழன், 22 வெள்ளி'],
  ['🙏', 'சங்கடஹர சதுர்த்தி', '5 செவ்வாய்'],
  ['🕉', 'சிவராத்திரி', '15 வெள்ளி'],
  ['🐂', 'பிரதோஷம்', '14 வியாழன், 28 வியாழன்'],
  ['🪷', 'சதுர்த்தி', '20 புதன்']
];

// ============ Types ============
interface Panchang {
  tithi: string;
  nakshatra: string;
  karana: string;
  rahuKalam: string;
  yamagandam: string;
  sunrise: string;
  nallaNeram: { morning: string; evening: string };
  gowriNeram: { morning: string; evening: string };
}

// ============ Helper Functions ============
function toISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && 
         a.getMonth() === b.getMonth() && 
         a.getDate() === b.getDate();
}

function getTamilDay(date: Date): number {
  // Simplified - in real app use actual Tamil calendar
  return date.getDate();
}

function getMarker(date: Date): { icon?: string } {
  const day = date.getDate();
  const month = date.getMonth();
  const tithi = (day - 1) % 30;
  
  if (tithi === 14) return { icon: '○' };
  if (tithi === 29) return { icon: '●' };
  if (tithi === 5 || tithi === 20) return { icon: '🛕' };
  if (tithi === 10 || tithi === 25) return { icon: '🪔' };
  if (tithi === 12 || tithi === 27) return { icon: '🐂' };
  if (day % 7 === 0 && month === 4) return { icon: '🐄' };
  return {};
}

function getTamilMonthRange(_year: number, _month: number): string {
  return `தை - மாசி`; // Simplified
}

function getWeekdayTa(date: Date): string {
  return WEEKDAYS_TA[date.getDay()];
}

// ============ Sub-Components ============

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

// 2. Card Container
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
    if (kind === 'international') return '#4FC3F7';
    return COLORS.saffron;
  };

  const getTagLabel = (kind: string) => {
    if (kind === 'national') return 'NATL';
    if (kind === 'tamilnadu') return 'TN';
    if (kind === 'international') return 'INTL';
    return 'OPT';
  };

  return (
    <StyledView>
      {items.map((h, i) => {
        const [, m, d] = h.isoDate.split('-').map(Number);
        const monthTa = MONTHS_TA[m - 1];
        const wd = getWeekdayTa(new Date(Number(h.isoDate.split('-')[0]), m - 1, d));
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
              <StyledText className="text-light-text/30 text-[10px] font-sans">{wd}</StyledText>
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
export default function MaathaSirappuScreen({ navigation }: any) {
  const now = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [todayPanchang, setTodayPanchang] = useState<Panchang | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const today = new Date();

  // Fetch panchang
  useEffect(() => {
    // Mock panchang data
    setTodayPanchang({
      tithi: 'பிரதமை',
      nakshatra: 'அஸ்வினி',
      karana: 'பவம்',
      rahuKalam: '7:30 - 9:00',
      yamagandam: '10:30 - 12:00',
      sunrise: '6:00 AM',
      nallaNeram: { morning: '6:00 - 7:30', evening: '4:30 - 6:00' },
      gowriNeram: { morning: '6:00 - 7:30', evening: '4:30 - 6:00' }
    });
  }, []);

  // Calendar generation
  const calendarData = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startWeekday = firstOfMonth.getDay();

    const cells: Array<{ date: Date; inMonth: boolean }> = [];
    
    // Previous month days
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      cells.push({ date: d, inMonth: false });
    }
    
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(year, month, d), inMonth: true });
    }
    
    // Next month days
    while (cells.length % 7 !== 0 || cells.length < 42) {
      const last = cells[cells.length - 1].date;
      const next = new Date(last);
      next.setDate(next.getDate() + 1);
      cells.push({ date: next, inMonth: false });
      if (cells.length >= 42) break;
    }
    
    return cells;
  }, [year, month]);

  const tamilRange = getTamilMonthRange(year, month);
  const monthHolidays = holidaysForMonth(year, month);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handlePrevMonth = () => {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() - 1);
    setCursor(d);
  };

  const handleNextMonth = () => {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() + 1);
    setCursor(d);
  };

  const handleSelectMonthYear = (selectedYear: number, selectedMonth: number) => {
    setCursor(new Date(selectedYear, selectedMonth, 1));
    setPickerVisible(false);
  };

  const handleDatePress = (date: Date) => {
    navigation.navigate('panchang', { date: toISO(date) });
  };

  const renderCalendarRow = (rowIndex: number) => {
    const start = rowIndex * 7;
    const rowCells = calendarData.slice(start, start + 7);
    
    return (
      <StyledView key={rowIndex} className="flex-row">
        {rowCells.map((cell, idx) => {
          const isToday = cell.inMonth && isSameDay(cell.date, today);
          const isSunday = cell.date.getDay() === 0;
          const marker = cell.inMonth ? getMarker(cell.date) : {};
          const tamilDay = getTamilDay(cell.date);
          
          return (
            <StyledTouchable
              key={idx}
              className={`flex-1 items-center justify-center py-2 min-h-[60px] ${
                (idx + 1) % 7 ? 'border-r border-gold/5' : ''
              } ${rowIndex < 5 ? 'border-b border-gold/5' : ''}`}
              style={{
                backgroundColor: isToday ? COLORS.todayBg : 'transparent'
              }}
              onPress={() => handleDatePress(cell.date)}
              activeOpacity={0.7}
            >
              <StyledText className="text-[10px] text-light-text/30 font-sans absolute top-1 left-2">
                {tamilDay}
              </StyledText>
              <StyledText 
                className={`text-lg font-bold font-sans ${
                  isToday ? 'text-gold' : 
                  !cell.inMonth ? 'text-light-text/20' :
                  isSunday ? 'text-[#FF6B6B]' : 'text-light-text'
                }`}
              >
                {cell.date.getDate()}
              </StyledText>
              {marker.icon && (
                <StyledText className="text-[10px] absolute bottom-1 right-2">
                  {marker.icon}
                </StyledText>
              )}
            </StyledTouchable>
          );
        })}
      </StyledView>
    );
  };

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      
      {/* Header */}
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">
          📅 மாத காட்டி / Month
        </StyledText>
      </StyledView>

      <StyledScrollView
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e2b714" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Month Navigation */}
        <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-3">
          <StyledView className="flex-row items-center justify-between p-4">
            <StyledTouchable
              className="bg-[#1A0E3A] w-10 h-10 rounded-xl items-center justify-center border border-gold/20"
              onPress={handlePrevMonth}
            >
              <Ionicons name="chevron-back" size={24} color="#e2b714" />
            </StyledTouchable>
            
            <StyledTouchable
              className="items-center"
              activeOpacity={0.7}
              onPress={() => setPickerVisible(true)}
            >
              <StyledView className="flex-row items-center">
                <StyledText className="text-gold text-xl font-serif font-bold">
                  {MONTHS_TA[month]} - {year}
                </StyledText>
                <Ionicons name="chevron-down" size={16} color="#e2b714" style={{ marginLeft: 6 }} />
              </StyledView>
              <StyledText className="text-light-text/30 text-xs font-sans">
                {tamilRange}
              </StyledText>
            </StyledTouchable>
            
            <StyledTouchable
              className="bg-[#1A0E3A] w-10 h-10 rounded-xl items-center justify-center border border-gold/20"
              onPress={handleNextMonth}
            >
              <Ionicons name="chevron-forward" size={24} color="#e2b714" />
            </StyledTouchable>
          </StyledView>
        </StyledView>

        {/* Calendar Grid */}
        <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-3">
          <StyledView className="flex-row bg-[#1A0E3A] border-b border-gold/10">
            {WEEKDAYS_SHORT.map((wd, i) => (
              <StyledView key={wd} className="flex-1 py-2 items-center">
                <StyledText className={`text-xs font-bold font-sans ${
                  i === 0 ? 'text-[#FF6B6B]' : 'text-gold'
                }`}>
                  {wd}
                </StyledText>
              </StyledView>
            ))}
          </StyledView>
          
          {[0, 1, 2, 3, 4, 5].map((row) => renderCalendarRow(row))}
          
          <StyledView className="p-2 border-t border-gold/10 bg-[#1A0E3A]">
            <StyledText className="text-light-text/30 text-[10px] font-sans text-center">
              ஒரு தேதியைத் தேர்ந்தெடுக்க தட்டவும்
            </StyledText>
          </StyledView>
        </StyledView>

        {/* Today's Panchang */}
        <Card>
          <HeaderBand>{todayPanchang?.tithi || '—'}</HeaderBand>
          <StyledView className="p-3 items-center border-b border-gold/5">
            <StyledText className="text-light-text/50 text-xs font-sans">
              இன்றைய விவரங்கள் — {MONTHS_TA[today.getMonth()]} {today.getDate()}, {today.getFullYear()}
            </StyledText>
          </StyledView>
        </Card>

        {/* Nalla Neram */}
        <Card>
          <HeaderBand>நல்ல நேரம்</HeaderBand>
          {todayPanchang && (
            <TimeTable rows={[
              ['காலை / Morning', todayPanchang.nallaNeram.morning],
              ['மாலை / Evening', todayPanchang.nallaNeram.evening]
            ]} />
          )}
        </Card>

        {/* Gowri Nalla Neram */}
        <Card>
          <HeaderBand>கௌரி நல்ல நேரம்</HeaderBand>
          {todayPanchang && (
            <TimeTable rows={[
              ['காலை / Morning', todayPanchang.gowriNeram.morning],
              ['மாலை / Evening', todayPanchang.gowriNeram.evening]
            ]} />
          )}
        </Card>

        {/* Panchang Details */}
        <Card>
          <HeaderBand>பஞ்சாங்கம்</HeaderBand>
          {todayPanchang && (
            <StyledView className="flex-row flex-wrap">
              <StyledView className="w-1/2 p-3 border-b border-gold/5">
                <StyledText className="text-[#FF8C00] text-xs font-sans font-bold text-center">
                  சூரிய உதயம்
                </StyledText>
                <StyledText className="text-light-text text-sm font-sans text-center">
                  {todayPanchang.sunrise}
                </StyledText>
              </StyledView>
              <StyledView className="w-1/2 p-3 border-l border-gold/5 border-b border-gold/5">
                <StyledText className="text-[#FF8C00] text-xs font-sans font-bold text-center">
                  கரணன்
                </StyledText>
                <StyledText className="text-light-text text-sm font-sans text-center">
                  {todayPanchang.karana}
                </StyledText>
              </StyledView>
              <StyledView className="w-1/2 p-3">
                <StyledText className="text-[#FF8C00] text-xs font-sans font-bold text-center">
                  திதி
                </StyledText>
                <StyledText className="text-light-text text-xs font-sans text-center">
                  இன்று மாலை 04.38 வரை {todayPanchang.tithi}
                </StyledText>
              </StyledView>
              <StyledView className="w-1/2 p-3 border-l border-gold/5">
                <StyledText className="text-[#FF8C00] text-xs font-sans font-bold text-center">
                  நட்சத்திரம்
                </StyledText>
                <StyledText className="text-light-text text-xs font-sans text-center">
                  {todayPanchang.nakshatra}
                </StyledText>
              </StyledView>
            </StyledView>
          )}
        </Card>

        {/* Avoid Timings */}
        <Card>
          <HeaderBand>தவிர்க்க வேண்டிய நேரங்கள்</HeaderBand>
          {todayPanchang && (
            <TimeTable rows={[
              ['ராகு காலம்', todayPanchang.rahuKalam],
              ['யமகண்டம்', todayPanchang.yamagandam]
            ]} />
          )}
        </Card>

        {/* Viratha Days */}
        <Card>
          <HeaderBand>விரத தினங்கள்</HeaderBand>
          {VIRATHA_LIST.map(([icon, name, when], i) => (
            <StyledView
              key={name}
              className={`flex-row items-center justify-between px-4 py-3 ${
                i < VIRATHA_LIST.length - 1 ? 'border-b border-gold/5' : ''
              }`}
            >
              <StyledText className="text-xl min-w-[40px]">{icon}</StyledText>
              <StyledText className="text-light-text text-sm font-sans flex-1 ml-2">{name}</StyledText>
              <StyledText className="text-gold text-sm font-sans font-bold">{when}</StyledText>
            </StyledView>
          ))}
        </Card>

        {/* Government Holidays */}
        <Card>
          <HeaderBand>அரசு விடுமுறை நாட்கள் — {MONTHS_TA[month]} {year}</HeaderBand>
          <HolidayList items={monthHolidays} />
        </Card>

        {/* Footer */}
        <StyledView className="py-4 items-center">
          <StyledText className="text-light-text/20 text-[10px] font-sans">
            © {new Date().getFullYear()} Jothidam • Month Calendar
          </StyledText>
        </StyledView>
      </StyledScrollView>

      <MonthYearPicker
        visible={pickerVisible}
        year={year}
        month={month}
        monthsTa={MONTHS_TA}
        onSelect={handleSelectMonthYear}
        onClose={() => setPickerVisible(false)}
      />
    </StyledSafeArea>
  );
}