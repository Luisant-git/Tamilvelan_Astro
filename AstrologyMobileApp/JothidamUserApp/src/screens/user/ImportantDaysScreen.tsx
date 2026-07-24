// JothidamUserApp/src/screens/user/ImportantDaysScreen.tsx
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
import { useState, useCallback, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../../components/common/BackButton';
import MonthYearPicker from '../../components/common/MonthYearPicker';
import { holidaysForMonth, type Holiday } from '../../utils/holidays';
import { findKarinaalDays, findGeneralMuhurthams, type KarinaalCategory, type KarinaalDay } from '../../utils/muhurtham';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeArea = styled(SafeAreaView);

const MONTHS_TA = ['ஜனவரி','பிப்ரவரி','மார்ச்','ஏப்ரல்','மே','ஜூன்','ஜூலை','ஆகஸ்ட்','செப்டம்பர்','அக்டோபர்','நவம்பர்','டிசம்பர்'];

const HOLIDAY_TAG_COLOR: Record<string, string> = {
  national: '#FF6B6B',
  tamilnadu: '#4CAF50',
  international: '#4FC3F7',
  optional: '#FF8C00'
};

const HOLIDAY_TAG_LABEL: Record<string, string> = {
  national: 'NATL',
  tamilnadu: 'TN',
  international: 'INTL',
  optional: 'OPT'
};

// ============ Data ============
type Row = { day: string; ta: string; meta?: string };

// Suba Muhurtham & Other Days (Ashtami/Navami/Chaturdasi) are computed per
// month below (see computeSubaMuhurthamRows/computeOtherDaysRows) — they
// used to be a frozen May-2026 snapshot, which never matched the selected
// month. Same heuristic tithi math as the Muhurtham Finder / Karinaal screens.

const HINDU_FESTIVALS: Row[] = [
  { day: '1',  ta: 'சித்ரா பௌர்ணமி, புத்த பூர்ணிமா, ஸ்ரீ கள்ளழகர் வைகை எழுந்தருளல்' },
  { day: '4',  ta: 'அக்னி நட்சத்திரம் ஆரம்பம்' },
  { day: '11', ta: 'திருநாவுக்கரசு குருபூஜை' },
  { day: '28', ta: 'அக்னி நட்சத்திரம் நிவர்த்தி' },
  { day: '30', ta: 'வைகாசி விசாகம்' }
];

const MUSLIM_FESTIVALS: Row[] = [
  { day: '4',  ta: 'ஹாஜா பந்தே நவாஸ் உரூஸ்' },
  { day: '27', ta: 'அரபா மெக்காவுக்கு ஹஜ் யாத்திரை செய்த நாள்' },
  { day: '28', ta: 'பக்ரீத் பண்டிகை' }
];

const CHRISTIAN_FESTIVALS: Row[] = [
  { day: '3',  ta: 'ஹோலி கிராஸ் டே' },
  { day: '10', ta: 'ரொகேஷன் சன்டே' },
  { day: '14', ta: 'அஸன் தர்ஸ்டே' },
  { day: '24', ta: 'உவிட் சன்டே' },
  { day: '31', ta: 'திருத்துவ ஞாயிறு' }
];

const VIRATHA: Row[] = [
  { day: '●', ta: 'அமாவாசை',         meta: '16 சனி' },
  { day: '○', ta: 'பௌர்ணமி',         meta: '1 வெள்ளி, 31 ஞாயிறு' },
  { day: '⭐', ta: 'கிருத்திகை',       meta: '16 சனி' },
  { day: '🛕', ta: 'திருவோணம்',       meta: '9 சனி' },
  { day: '🪔', ta: 'ஏகாதசி',          meta: '13 புதன், 27 புதன்' },
  { day: '🌸', ta: 'சஷ்டி',           meta: '7 வியாழன், 22 வெள்ளி' },
  { day: '🙏', ta: 'சங்கடஹர சதுர்த்தி', meta: '5 செவ்வாய்' },
  { day: '🕉', ta: 'சிவராத்திரி',      meta: '15 வெள்ளி' },
  { day: '🐂', ta: 'பிரதோஷம்',        meta: '14 வியாழன், 28 வியாழன்' },
  { day: '🪷', ta: 'சதுர்த்தி',        meta: '20 புதன்' }
];

// Government Holidays (real, month/year-aware — see holidaysForMonth) is
// rendered separately below, in the same position this list used to hold it,
// so the static reference sections keep their exact original order/spacing.
const STATIC_SECTIONS_BEFORE_HOLIDAYS = [
  { title: 'இந்து பண்டிகைகள்',      rows: HINDU_FESTIVALS },
  { title: 'முஸ்லீம் பண்டிகைகள்',   rows: MUSLIM_FESTIVALS },
  { title: 'கிறிஸ்த்துவ பண்டிகைகள்', rows: CHRISTIAN_FESTIVALS }
];

const SECTIONS_AFTER_HOLIDAYS = [
  { title: 'விரத தினங்கள்',         rows: VIRATHA }
];

function computeSubaMuhurthamRows(year: number, month: number): Row[] {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const days = findGeneralMuhurthams({ startDate: start, endDate: end, limit: 6 });
  return days.map(d => {
    const dd = Number(d.isoDate.split('-')[2]);
    return {
      day: `${MONTHS_TA[month]} ${dd}`,
      ta: `${d.tithiName} - ${d.weekdayTa}`,
      meta: d.meta
    };
  });
}

const KARINAAL_ROW_LABEL: Record<KarinaalCategory, string> = {
  ashtami: 'அஷ்டமி',
  navami: 'நவமி',
  chaturdasi: 'சதுர்தசி'
};

function computeOtherDaysRows(year: number, month: number): Row[] {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const days = findKarinaalDays({ startDate: start, endDate: end });
  const byCategory: Record<KarinaalCategory, KarinaalDay[]> = { ashtami: [], navami: [], chaturdasi: [] };
  days.forEach(d => byCategory[d.category].push(d));
  return (['ashtami', 'navami', 'chaturdasi'] as KarinaalCategory[]).map(cat => {
    const list = byCategory[cat];
    return {
      day: KARINAAL_ROW_LABEL[cat],
      ta: list.length
        ? list.map(d => `${Number(d.isoDate.split('-')[2])} ${d.weekdayTa}`).join(', ')
        : 'இல்லை'
    };
  });
}

// ============ Section Header Component ============
function SectionHeader({ title }: { title: string }) {
  return (
    <StyledView className="bg-[#321C6B] py-3 px-4 border-b border-gold/10">
      <StyledText className="text-gold text-center font-sans font-bold text-base">
        {title}
      </StyledText>
    </StyledView>
  );
}

// ============ Row Item Component ============
function RowItem({ row, isLast }: { row: Row; isLast: boolean }) {
  return (
    <StyledView 
      className={`px-4 py-3 flex-row items-center flex-wrap ${
        isLast ? '' : 'border-b border-gold/5'
      }`}
    >
      <StyledText className="text-gold font-bold text-sm min-w-[50px]">
        {row.day}
      </StyledText>
      <StyledText className="text-light-text text-sm flex-1 font-sans">
        {row.ta}
      </StyledText>
      {row.meta && (
        <StyledText className="text-[#FF8C00] text-sm font-sans ml-1">
          {row.meta}
        </StyledText>
      )}
    </StyledView>
  );
}

// ============ Section Component ============
function Section({ section }: { section: { title: string; rows: Row[] } }) {
  return (
    <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-3">
      <SectionHeader title={section.title} />
      {section.rows.map((row, index) => (
        <RowItem 
          key={index} 
          row={row} 
          isLast={index === section.rows.length - 1} 
        />
      ))}
    </StyledView>
  );
}

// ============ Government Holidays (real, month/year-aware) ============
function HolidayList({ items }: { items: Holiday[] }) {
  if (items.length === 0) {
    return (
      <StyledView className="p-4 items-center">
        <StyledText className="text-light-text/40 text-sm font-sans">இல்லை</StyledText>
      </StyledView>
    );
  }
  return (
    <StyledView>
      {items.map((h, i) => {
        const [, m, d] = h.isoDate.split('-').map(Number);
        const tagColor = HOLIDAY_TAG_COLOR[h.kind];
        return (
          <StyledView
            key={h.isoDate}
            className={`flex-row items-center justify-between px-4 py-3 ${
              i < items.length - 1 ? 'border-b border-gold/5' : ''
            }`}
          >
            <StyledView className="min-w-[70px]">
              <StyledText className="text-gold text-sm font-sans font-bold">
                {MONTHS_TA[m - 1]} {String(d).padStart(2, '0')}
              </StyledText>
            </StyledView>
            <StyledView className="flex-1 ml-2">
              <StyledText className="text-light-text text-sm font-sans">{h.ta}</StyledText>
              <StyledText className="text-light-text/30 text-[10px] font-sans">{h.en}</StyledText>
            </StyledView>
            <StyledView className="px-2 py-0.5 rounded-full border" style={{ borderColor: tagColor }}>
              <StyledText style={{ color: tagColor }} className="text-[8px] font-bold font-sans">
                {HOLIDAY_TAG_LABEL[h.kind]}
              </StyledText>
            </StyledView>
          </StyledView>
        );
      })}
    </StyledView>
  );
}

// ============ Main Screen ============
export default function ImportantDaysScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [pickerVisible, setPickerVisible] = useState(false);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const monthHolidays = useMemo(() => holidaysForMonth(year, month), [year, month]);
  const subaMuhurthamRows = useMemo(() => computeSubaMuhurthamRows(year, month), [year, month]);
  const otherDaysRows = useMemo(() => computeOtherDaysRows(year, month), [year, month]);
  const sectionsBeforeHolidays = useMemo(() => [
    { title: 'சுபமுகூர்த்த தினங்கள்', rows: subaMuhurthamRows },
    { title: 'மற்ற தினங்கள்', rows: otherDaysRows },
    ...STATIC_SECTIONS_BEFORE_HOLIDAYS
  ], [subaMuhurthamRows, otherDaysRows]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleSelectMonthYear = (selectedYear: number, selectedMonth: number) => {
    setCursor(new Date(selectedYear, selectedMonth, 1));
    setPickerVisible(false);
  };

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />

      {/* Header */}
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">
          📅 முக்கிய தினங்கள்
        </StyledText>
        <StyledTouchable onPress={() => setPickerVisible(true)}>
          <Ionicons name="calendar-outline" size={24} color="#e2b714" />
        </StyledTouchable>
      </StyledView>

      <StyledScrollView
        className="flex-1 px-3 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e2b714" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Month Title */}
        <StyledTouchable
          className="items-center mb-3"
          activeOpacity={0.7}
          onPress={() => setPickerVisible(true)}
        >
          <StyledView className="flex-row items-center">
            <StyledText className="text-light-text/60 text-sm font-sans">
              {MONTHS_TA[month]} {year} — முக்கிய தினங்கள்
            </StyledText>
            <Ionicons name="chevron-down" size={12} color="#8B7BAA" style={{ marginLeft: 4 }} />
          </StyledView>
        </StyledTouchable>

        {/* Suba Muhurtham + Other Days (computed per month) + static reference sections */}
        {sectionsBeforeHolidays.map((section, index) => (
          <Section key={index} section={section} />
        ))}

        {/* Government Holidays — real, month/year-aware */}
        <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-3">
          <SectionHeader title={`அரசு விடுமுறை நாட்கள் — ${MONTHS_TA[month]} ${year}`} />
          <HolidayList items={monthHolidays} />
        </StyledView>

        {SECTIONS_AFTER_HOLIDAYS.map((section, index) => (
          <Section key={index} section={section} />
        ))}

        {/* Footer */}
        <StyledView className="py-4 items-center">
          <StyledText className="text-light-text/20 text-[10px] font-sans">
            © {new Date().getFullYear()} Jothidam • Important Days
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