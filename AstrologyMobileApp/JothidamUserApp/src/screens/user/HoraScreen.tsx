// JothidamUserApp/src/screens/user/HoraScreen.tsx
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

// ============ Data ============
const CHALDEAN_ORDER = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];

const PLANET_TA: Record<string, string> = {
  Sun: 'சூரியன்', Moon: 'சந்திரன்', Mars: 'செவ்வாய்',
  Mercury: 'புதன்', Jupiter: 'குரு', Venus: 'சுக்கிரன்',
  Saturn: 'சனி'
};

const PLANET_ICON: Record<string, string> = {
  Sun: '☀', Moon: '🌙', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄'
};

const PLANET_COLOR: Record<string, string> = {
  Sun: '#FF8C00', Moon: '#9FB4D9', Mars: '#FF6B6B',
  Mercury: '#4CAF50', Jupiter: '#FFD700', Venus: '#F48FB1',
  Saturn: '#7B6FAA'
};

const PLANET_QUALITY: Record<string, { ta: string; en: string; good: boolean }> = {
  Sun: { 
    ta: 'அதிகார காரியங்கள், அரசாங்கம், ஆரோக்கியம்', 
    en: 'Authority, government, health', 
    good: true 
  },
  Moon: { 
    ta: 'புதிய முயற்சி, பயணம், அன்பு', 
    en: 'New ventures, travel, love', 
    good: true 
  },
  Mars: { 
    ta: 'சண்டை, அறுவை, விளையாட்டு — கவனம்', 
    en: 'Conflict, surgery, sports — caution', 
    good: false 
  },
  Mercury: { 
    ta: 'வியாபாரம், கல்வி, தகவல் தொடர்பு', 
    en: 'Trade, study, communication', 
    good: true 
  },
  Jupiter: { 
    ta: 'ஞானம், ஆன்மிகம், திருமணம் — மிகச்சிறந்த', 
    en: 'Wisdom, spiritual, marriage — best', 
    good: true 
  },
  Venus: { 
    ta: 'அழகு, கலை, காதல், சொகுசு', 
    en: 'Beauty, art, love, luxury', 
    good: true 
  },
  Saturn: { 
    ta: 'நீண்டகால திட்டங்கள் — பொறுமை', 
    en: 'Long-term plans — patience', 
    good: false 
  }
};

const WEEKDAY_RULER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const WEEKDAY_TA = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];

const SUNRISE_H = 6, SUNRISE_M = 0;
const SUNSET_H = 18, SUNSET_M = 15;

// ============ Helper Functions ============
function pad(n: number) { 
  return String(n).padStart(2, '0'); 
}

function fmt(totalMin: number) {
  const t = ((totalMin % 1440) + 1440) % 1440;
  const h = Math.floor(t / 60);
  const m = Math.round(t % 60);
  const am = h < 12;
  const hh = h % 12 || 12;
  return `${pad(hh)}:${pad(m)} ${am ? 'AM' : 'PM'}`;
}

// ============ Types ============
interface Hora {
  planet: string;
  start: number;
  end: number;
  isDay: boolean;
  index: number;
  isCurrent: boolean;
}

// ============ Hora Card Component ============
function HoraCard({ hora, index }: { hora: Hora; index: number }) {
  const isEven = index % 2 === 0;
  const bgColor = isEven ? 'bg-[#1A0E3A]' : 'bg-[#251450]';
  const planet = hora.planet;
  const color = PLANET_COLOR[planet];
  const icon = PLANET_ICON[planet];
  const name = PLANET_TA[planet];
  const isCurrent = hora.isCurrent;

  return (
    <StyledView 
      className={`flex-row items-center p-3 ${bgColor} ${isCurrent ? 'border-l-2 border-gold' : 'border-l-2 border-transparent'}`}
    >
      {/* Number */}
      <StyledText className="text-light-text/30 text-xs font-sans min-w-[30px]">
        {index + 1}
      </StyledText>
      
      {/* Time */}
      <StyledText className="text-light-text/60 text-xs font-sans min-w-[80px]">
        {fmt(hora.start)} – {fmt(hora.end)}
      </StyledText>
      
      {/* Planet */}
      <StyledView className="flex-1 flex-row items-center ml-2">
        <StyledText style={{ color }} className="text-base mr-1">
          {icon}
        </StyledText>
        <StyledText className="text-gold text-sm font-sans font-bold">
          {name}
        </StyledText>
        {isCurrent && (
          <StyledView className="bg-gold px-2 py-0.5 rounded-full ml-2">
            <StyledText className="text-dark text-[9px] font-bold font-sans">
              இப்போது
            </StyledText>
          </StyledView>
        )}
      </StyledView>
      
      {/* Day/Night */}
      <StyledText className={`text-xs font-sans ${
        hora.isDay ? 'text-[#FF8C00]' : 'text-[#9FB4D9]'
      }`}>
        {hora.isDay ? '☀ பகல்' : '🌙 இரவு'}
      </StyledText>
    </StyledView>
  );
}

// ============ Hora Significance Component ============
function HoraSignificance() {
  const significances = Object.entries(PLANET_QUALITY);
  
  return (
    <StyledView className="bg-dark-card rounded-2xl p-4 border border-gold/10">
      <StyledText className="text-gold text-base font-serif font-bold mb-3">
        📖 கிரக ஓரை பலன்கள் / Hora Significance
      </StyledText>
      
      {significances.map(([planet, info]) => (
        <StyledView
          key={planet}
          className="bg-dark rounded-xl p-3 mb-2"
          style={{ borderLeftWidth: 3, borderLeftColor: PLANET_COLOR[planet] }}
        >
          <StyledText style={{ color: PLANET_COLOR[planet] }} className="text-sm font-bold font-sans">
            {PLANET_ICON[planet]} {PLANET_TA[planet]}
            <StyledText className="text-light-text/40 text-[10px] font-sans ml-1">
              ({planet})
            </StyledText>
          </StyledText>
          <StyledText className="text-light-text/70 text-xs font-sans mt-1 leading-relaxed">
            {info.ta}
          </StyledText>
          <StyledText className="text-light-text/40 text-[10px] font-sans mt-0.5">
            {info.en}
          </StyledText>
        </StyledView>
      ))}
    </StyledView>
  );
}

// ============ Main Screen ============
export default function HoraScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);

  // Generate horas
  const horas = useMemo(() => {
    const now = new Date();
    const dayIdx = now.getDay();
    const ruler = WEEKDAY_RULER[dayIdx];
    const startIdx = CHALDEAN_ORDER.indexOf(ruler);

    const sunriseMin = SUNRISE_H * 60 + SUNRISE_M;
    const sunsetMin = SUNSET_H * 60 + SUNSET_M;
    const dayDur = sunsetMin - sunriseMin;
    const nightDur = 24 * 60 - dayDur;
    const dayHora = dayDur / 12;
    const nightHora = nightDur / 12;

    const horaList: Hora[] = [];
    
    // Day horas
    for (let i = 0; i < 12; i++) {
      horaList.push({
        planet: CHALDEAN_ORDER[(startIdx + i) % 7],
        start: sunriseMin + i * dayHora,
        end: sunriseMin + (i + 1) * dayHora,
        isDay: true,
        index: i,
        isCurrent: false
      });
    }
    
    // Night horas
    for (let i = 0; i < 12; i++) {
      horaList.push({
        planet: CHALDEAN_ORDER[(startIdx + 12 + i) % 7],
        start: sunsetMin + i * nightHora,
        end: sunsetMin + (i + 1) * nightHora,
        isDay: false,
        index: i + 12,
        isCurrent: false
      });
    }

    // Find current hora
    const nowMin = now.getHours() * 60 + now.getMinutes();
    for (let i = 0; i < horaList.length; i++) {
      const h = horaList[i];
      if (h.start <= h.end) {
        if (nowMin >= h.start && nowMin < h.end) {
          horaList[i].isCurrent = true;
          break;
        }
      } else {
        if (nowMin >= h.start || nowMin < h.end) {
          horaList[i].isCurrent = true;
          break;
        }
      }
    }

    return {
      horas: horaList,
      dayIdx,
      ruler,
      weekdayTa: WEEKDAY_TA[dayIdx],
      rulerIcon: PLANET_ICON[ruler],
      rulerName: PLANET_TA[ruler]
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
          🌞 கிரக ஓரைகளின் காலம்
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
            🌞 கிரக ஓரைகளின் காலம்
          </StyledText>
          <StyledText className="text-light-text/60 text-sm font-sans">
            Planetary Hora
          </StyledText>
          <StyledText className="text-light-text/40 text-xs font-sans mt-1">
            இன்று {horas.weekdayTa} — அதிபதி: {horas.rulerIcon} {horas.rulerName}
          </StyledText>
        </StyledView>

        {/* Horas List */}
        <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-4">
          <StyledView className="bg-[#1A0E3A] px-4 py-3 flex-row items-center">
            <StyledText className="text-gold text-sm font-serif font-bold">
              24 ஓரைகள்
            </StyledText>
            <StyledText className="text-light-text/40 text-[10px] font-sans ml-2">
              · 12 day + 12 night
            </StyledText>
          </StyledView>

          {/* Headers */}
          <StyledView className="flex-row items-center bg-[#32205A] px-3 py-2">
            <StyledText className="text-gold text-[10px] font-bold font-sans min-w-[30px]">#</StyledText>
            <StyledText className="text-gold text-[10px] font-bold font-sans min-w-[80px]">நேரம்</StyledText>
            <StyledText className="text-gold text-[10px] font-bold font-sans flex-1 ml-2">கிரகம்</StyledText>
            <StyledText className="text-gold text-[10px] font-bold font-sans">வகை</StyledText>
          </StyledView>

          {horas.horas.map((hora, index) => (
            <HoraCard key={index} hora={hora} index={index} />
          ))}
        </StyledView>

        {/* Significance */}
        <HoraSignificance />

        {/* Footer */}
        <StyledView className="py-4 items-center">
          <StyledText className="text-light-text/20 text-[10px] font-sans">
            © {new Date().getFullYear()} Jothidam • Planetary Hora
          </StyledText>
        </StyledView>
      </StyledScrollView>
    </StyledSafeArea>
  );
}