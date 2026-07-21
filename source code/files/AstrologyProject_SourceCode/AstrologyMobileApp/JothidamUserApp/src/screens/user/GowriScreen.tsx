// JothidamUserApp/src/screens/user/GowriScreen.tsx
import {
  View,
  Text,
  ScrollView,
  RefreshControl
} from 'react-native';
import { styled } from '../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useMemo, useCallback } from 'react';
import BackButton from '../../components/common/BackButton';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledSafeArea = styled(SafeAreaView);

// ============ Types ============
type Quality = 'good' | 'bad' | 'mid';

interface PeriodInfo {
  ta: string;
  en: string;
  quality: Quality;
}

interface Period {
  name: string;
  info: PeriodInfo;
  start: string;
  end: string;
}

// ============ Data ============
const PERIOD_INFO: Record<string, PeriodInfo> = {
  Udayam:   { ta: 'உதயம்',   en: 'Udayam',   quality: 'mid'  },
  Amrutham: { ta: 'அமிர்தம்', en: 'Amrutham', quality: 'good' },
  Siddham:  { ta: 'சித்தம்',  en: 'Siddham',  quality: 'good' },
  Sukam:    { ta: 'சுகம்',   en: 'Sukam',    quality: 'good' },
  Roga:     { ta: 'ரோகம்',   en: 'Roga',     quality: 'bad'  },
  Kala:     { ta: 'காலம்',   en: 'Kala',     quality: 'bad'  },
  Marana:   { ta: 'மரணம்',   en: 'Marana',   quality: 'bad'  },
  Labha:    { ta: 'லாபம்',   en: 'Labha',    quality: 'good' }
};

const DAY_SEQUENCES: Record<number, string[]> = {
  0: ['Udayam', 'Amrutham', 'Siddham', 'Marana', 'Roga', 'Labha', 'Kala', 'Sukam'],
  1: ['Sukam',  'Udayam',   'Amrutham','Siddham','Marana', 'Roga', 'Labha', 'Kala'],
  2: ['Kala',   'Sukam',    'Udayam',  'Amrutham','Siddham','Marana','Roga',  'Labha'],
  3: ['Labha',  'Kala',     'Sukam',   'Udayam', 'Amrutham','Siddham','Marana','Roga'],
  4: ['Roga',   'Labha',    'Kala',    'Sukam',  'Udayam', 'Amrutham','Siddham','Marana'],
  5: ['Marana', 'Roga',     'Labha',   'Kala',   'Sukam',  'Udayam', 'Amrutham','Siddham'],
  6: ['Siddham','Marana',   'Roga',    'Labha',  'Kala',   'Sukam',  'Udayam', 'Amrutham']
};

const WEEKDAY_TA = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
const WEEKDAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const qualityColor: Record<Quality, string> = {
  good: '#4CAF50',
  mid:  '#FFD700',
  bad:  '#FF6B6B'
};

const qualityLabel: Record<Quality, { ta: string; en: string }> = {
  good: { ta: 'நல்ல நேரம்', en: 'Good' },
  mid:  { ta: 'மிதம்',     en: 'Neutral' },
  bad:  { ta: 'தவிர்க்க',   en: 'Avoid' }
};

// ============ Helper Functions ============
function pad(n: number) { 
  return String(n).padStart(2, '0'); 
}

function fmtTime(h: number, m: number) {
  const am = h < 12;
  const hh = h % 12 || 12;
  return `${pad(hh)}:${pad(m)} ${am ? 'AM' : 'PM'}`;
}

function nightSequenceFor(day: number): string[] {
  const seq = DAY_SEQUENCES[day];
  return [...seq.slice(5), ...seq.slice(0, 5)];
}

function buildPeriods(startH: number, startM: number, durationMin: number, names: string[]) {
  const per = durationMin / 8;
  let cursor = startH * 60 + startM;
  return names.map(n => {
    const s = cursor;
    const e = cursor + per;
    cursor = e;
    return {
      name: n,
      info: PERIOD_INFO[n],
      start: fmtTime(Math.floor(s / 60) % 24, Math.round(s % 60)),
      end: fmtTime(Math.floor(e / 60) % 24, Math.round(e % 60))
    };
  });
}

// ============ Legend Component ============
function Legend() {
  const legendItems = Object.entries(PERIOD_INFO);
  
  return (
    <StyledView className="bg-dark-card rounded-2xl p-4 border border-gold/10">
      <StyledText className="text-gold text-base font-serif font-bold mb-3">
        📖 விளக்கம் / Legend
      </StyledText>
      <StyledView className="flex-row flex-wrap">
        {legendItems.map(([key, value]) => (
          <StyledView
            key={key}
            className="w-[48%] bg-dark rounded-lg p-2 mb-2 mr-[2%]"
            style={{ borderLeftWidth: 3, borderLeftColor: qualityColor[value.quality] }}
          >
            <StyledText className="text-gold text-xs font-sans font-bold">
              {value.ta}
              <StyledText className="text-light-text/40 text-[10px] font-sans ml-1">
                ({value.en})
              </StyledText>
            </StyledText>
          </StyledView>
        ))}
      </StyledView>
    </StyledView>
  );
}

// ============ Period Card Component ============
function PeriodCard({ period, index }: { period: Period; index: number }) {
  const isEven = index % 2 === 0;
  const bgColor = isEven ? 'bg-[#1A0E3A]' : 'bg-[#251450]';
  const quality = period.info.quality;
  const color = qualityColor[quality];
  const label = qualityLabel[quality];

  return (
    <StyledView className={`flex-row justify-between items-center p-3 ${bgColor}`}>
      <StyledText className="text-light-text/70 text-xs font-sans min-w-[80px]">
        {period.start} – {period.end}
      </StyledText>
      <StyledText className="text-gold text-sm font-sans font-bold flex-1 text-center">
        {period.info.ta}
        <StyledText className="text-light-text/40 text-[10px] font-sans ml-1">
          ({period.info.en})
        </StyledText>
      </StyledText>
      <StyledView
        className="px-3 py-1 rounded-full"
        style={{ backgroundColor: color }}
      >
        <StyledText className="text-dark text-[10px] font-bold font-sans">
          {label.ta}
        </StyledText>
      </StyledView>
    </StyledView>
  );
}

// ============ Period Section Component ============
function PeriodSection({
  title,
  subtitle,
  icon,
  periods
}: {
  title: string;
  subtitle: string;
  icon: string;
  periods: Period[];
}) {
  return (
    <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-4">
      <StyledView className="bg-[#1A0E3A] px-4 py-3 flex-row items-center">
        <StyledText className="text-xl mr-2">{icon}</StyledText>
        <StyledView>
          <StyledText className="text-gold text-base font-serif font-bold">
            {title}
          </StyledText>
          <StyledText className="text-light-text/40 text-[10px] font-sans">
            {subtitle}
          </StyledText>
        </StyledView>
      </StyledView>
      
      {periods.map((period, index) => (
        <PeriodCard key={index} period={period} index={index} />
      ))}
    </StyledView>
  );
}

// ============ Main Screen ============
export default function GowriScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);

  // Calculate periods
  const data = useMemo(() => {
    const now = new Date();
    const dayIdx = now.getDay();

    const daySeq = DAY_SEQUENCES[dayIdx];
    const nightSeq = nightSequenceFor(dayIdx);

    const SUNRISE_H = 6, SUNRISE_M = 0;
    const SUNSET_H = 18, SUNSET_M = 15;
    const sunsetMin = SUNSET_H * 60 + SUNSET_M;
    const sunriseMin = SUNRISE_H * 60 + SUNRISE_M;
    const dayDur = sunsetMin - sunriseMin;
    const nightDur = 24 * 60 - dayDur;

    const dayPeriods = buildPeriods(SUNRISE_H, SUNRISE_M, dayDur, daySeq);
    const nightPeriods = buildPeriods(SUNSET_H, SUNSET_M, nightDur, nightSeq);

    return {
      dayIdx,
      dayPeriods,
      nightPeriods,
      weekdayTa: WEEKDAY_TA[dayIdx],
      weekdayEn: WEEKDAY_EN[dayIdx]
    };
  }, []);

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
          🪔 கௌரி பஞ்சாங்கம்
        </StyledText>
      </StyledView>

      <StyledScrollView
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e2b714" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <StyledView className="mb-4">
          <StyledText className="text-gold text-2xl font-serif font-bold">
            🪔 கௌரி பஞ்சாங்கம்
          </StyledText>
          <StyledText className="text-light-text/60 text-sm font-sans">
            Gowri Panchangam
          </StyledText>
          <StyledText className="text-light-text/40 text-xs font-sans mt-1">
            இன்று {data.weekdayTa} · {data.weekdayEn} — 8 பகல் + 8 இரவு பெரியதுகள்
          </StyledText>
        </StyledView>

        {/* Day Periods */}
        <PeriodSection
          title="☀️ பகல் பெரியது"
          subtitle="Day Period (Sunrise → Sunset)"
          icon="☀️"
          periods={data.dayPeriods}
        />

        {/* Night Periods */}
        <PeriodSection
          title="🌙 இரவு பெரியது"
          subtitle="Night Period (Sunset → Sunrise)"
          icon="🌙"
          periods={data.nightPeriods}
        />

        {/* Legend */}
        <Legend />

        {/* Footer */}
        <StyledView className="py-4 items-center">
          <StyledText className="text-light-text/20 text-[10px] font-sans">
            © {new Date().getFullYear()} Jothidam • Gowri Panchangam
          </StyledText>
        </StyledView>
      </StyledScrollView>
    </StyledSafeArea>
  );
}