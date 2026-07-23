// JothidamUserApp/src/screens/user/ImportantDaysScreen.tsx
import {
  View,
  Text,
  ScrollView,
  RefreshControl
} from 'react-native';
import { styled } from '../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useCallback } from 'react';
import BackButton from '../../components/common/BackButton';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledSafeArea = styled(SafeAreaView);

// ============ Data ============
type Row = { day: string; ta: string; meta?: string };

const SUBA_MUHURTHAM: Row[] = [
  { day: 'மே 8',  ta: 'சித்திரை 25 - வெள்ளி' },
  { day: 'மே 13', ta: 'சித்திரை 30 - புதன்' },
  { day: 'மே 14', ta: 'சித்திரை 31 - வியாழன்' },
  { day: 'மே 18', ta: 'வைகாசி 4 - திங்கள்', meta: '✦' },
  { day: 'மே 28', ta: 'வைகாசி 14 - வியாழன்', meta: '✦' },
  { day: 'மே 29', ta: 'வைகாசி 15 - வெள்ளி', meta: '✦' }
];

const OTHER_DAYS: Row[] = [
  { day: 'அஷ்டமி', ta: '9 சனி, 23 சனி' },
  { day: 'நவமி',  ta: '10 ஞாயிறு, 24 ஞாயிறு' },
  { day: 'தசமி',  ta: '11 திங்கள், 25 திங்கள்' },
  { day: 'கரி நாட்கள்', ta: '21 வியாழன், 30 சனி, 31 ஞாயிறு' }
];

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

const HOLIDAYS: Row[] = [
  { day: '1',  ta: 'தொழிலாளர் தினம்' },
  { day: '28', ta: 'பக்ரீத் பண்டிகை' }
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

const SECTIONS = [
  { title: 'சுபமுகூர்த்த தினங்கள்', rows: SUBA_MUHURTHAM },
  { title: 'மற்ற தினங்கள்',         rows: OTHER_DAYS },
  { title: 'இந்து பண்டிகைகள்',      rows: HINDU_FESTIVALS },
  { title: 'முஸ்லீம் பண்டிகைகள்',   rows: MUSLIM_FESTIVALS },
  { title: 'கிறிஸ்த்துவ பண்டிகைகள்', rows: CHRISTIAN_FESTIVALS },
  { title: 'அரசு விடுமுறை நாட்கள்', rows: HOLIDAYS },
  { title: 'விரத தினங்கள்',         rows: VIRATHA }
];

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

// ============ Main Screen ============
export default function ImportantDaysScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      
      {/* Header */}
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">
          📅 முக்கிய தினங்கள்
        </StyledText>
      </StyledView>

      <StyledScrollView
        className="flex-1 px-3 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e2b714" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Month Title */}
        <StyledView className="items-center mb-3">
          <StyledText className="text-light-text/60 text-sm font-sans">
            மே 2026 — முக்கிய தினங்கள்
          </StyledText>
        </StyledView>

        {/* All Sections */}
        {SECTIONS.map((section, index) => (
          <Section key={index} section={section} />
        ))}

        {/* Footer */}
        <StyledView className="py-4 items-center">
          <StyledText className="text-light-text/20 text-[10px] font-sans">
            © {new Date().getFullYear()} Jothidam • Important Days
          </StyledText>
        </StyledView>
      </StyledScrollView>
    </StyledSafeArea>
  );
}