// JothidamUserApp/src/screens/user/RasiPalanScreen.tsx
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { styled } from '../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../../components/common/BackButton';
import { horoscopeApi } from '../../services/horoscope.api';
import { getErrorMessage } from '../../services/client';
import type { DailyRasiResponse } from '../../types/horoscope.types';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const StyledSafeArea = styled(SafeAreaView);

// ============ Data ============
const RASIS: Array<{ num: number; ta: string; symbol: string; en: string }> = [
  { num: 1,  ta: 'மேஷம்',     symbol: '♈', en: 'Aries' },
  { num: 2,  ta: 'ரிஷபம்',    symbol: '♉', en: 'Taurus' },
  { num: 3,  ta: 'மிதுனம்',   symbol: '♊', en: 'Gemini' },
  { num: 4,  ta: 'கடகம்',     symbol: '♋', en: 'Cancer' },
  { num: 5,  ta: 'சிம்மம்',   symbol: '♌', en: 'Leo' },
  { num: 6,  ta: 'கன்னி',     symbol: '♍', en: 'Virgo' },
  { num: 7,  ta: 'துலாம்',    symbol: '♎', en: 'Libra' },
  { num: 8,  ta: 'விருச்சிகம்', symbol: '♏', en: 'Scorpio' },
  { num: 9,  ta: 'தனுசு',     symbol: '♐', en: 'Sagittarius' },
  { num: 10, ta: 'மகரம்',     symbol: '♑', en: 'Capricorn' },
  { num: 11, ta: 'கும்பம்',   symbol: '♒', en: 'Aquarius' },
  { num: 12, ta: 'மீனம்',     symbol: '♓', en: 'Pisces' }
];

const TILE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#FF8C00', '#FF6B9D',
  '#74B9FF', '#A29BFE', '#FD79A8', '#00CEC9'
];

interface RasiCardProps {
  rasi: typeof RASIS[0];
  index: number;
  expanded: boolean;
  loading: boolean;
  error: string | null;
  result: DailyRasiResponse | null;
  onToggle: () => void;
  onRetry: () => void;
}

// ============ Rasi Card Component ============
// Collapsed by default — fetches its own prediction only when expanded
// (mirrors the website's RasiAccordion: one rasi at a time, not all 12 on
// load, to stay well under the backend's general rate limit).
function RasiCard({ rasi, index, expanded, loading, error, result, onToggle, onRetry }: RasiCardProps) {
  const color = TILE_COLORS[index % TILE_COLORS.length];

  return (
    <StyledView className="bg-dark-card rounded-2xl mb-3 border border-gold/10 overflow-hidden">
      <StyledTouchable
        className="flex-row items-center gap-3 p-4"
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <StyledView
          className="w-10 h-10 rounded-xl items-center justify-center border border-gold"
          style={{ backgroundColor: color + '20' }}
        >
          <StyledText className="text-gold text-xl">{rasi.symbol}</StyledText>
        </StyledView>
        <StyledView className="flex-1">
          <StyledText className="text-gold text-base font-serif font-bold">{rasi.ta}</StyledText>
          <StyledText className="text-light-text/40 text-[10px] font-sans">
            {rasi.en} · Rasi {rasi.num}
          </StyledText>
        </StyledView>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color="#FF8C00" />
      </StyledTouchable>

      {expanded && (
        <StyledView className="px-4 pb-4 pt-1 border-t border-gold/10">
          {loading ? (
            <StyledView className="flex-row items-center py-2">
              <ActivityIndicator size="small" color="#e2b714" />
              <StyledText className="text-light-text/50 text-xs font-sans ml-2">ஏற்றுகிறோம்...</StyledText>
            </StyledView>
          ) : error ? (
            <StyledView className="py-1">
              <StyledText className="text-[#FF6B6B] text-xs font-sans mb-2">{error}</StyledText>
              <StyledTouchable
                className="self-start border border-gold/30 rounded-full px-3 py-1"
                onPress={onRetry}
              >
                <StyledText className="text-gold text-xs font-sans">மீண்டும் முயற்சி / Retry</StyledText>
              </StyledTouchable>
            </StyledView>
          ) : (
            <StyledText className="text-light-text/70 text-sm font-sans mt-2 leading-relaxed">
              {result?.prediction}
            </StyledText>
          )}
        </StyledView>
      )}
    </StyledView>
  );
}

interface RasiState {
  result: DailyRasiResponse | null;
  loading: boolean;
  error: string | null;
}

// ============ Main Screen ============
export default function RasiPalanScreen({ navigation }: any) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [byRasi, setByRasi] = useState<Record<number, RasiState>>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadRasi = useCallback(async (num: number) => {
    setByRasi((prev) => ({ ...prev, [num]: { result: null, loading: true, error: null } }));
    try {
      const result = await horoscopeApi.fetchDailyRasi(num);
      setByRasi((prev) => ({ ...prev, [num]: { result, loading: false, error: null } }));
    } catch (err) {
      setByRasi((prev) => ({ ...prev, [num]: { result: null, loading: false, error: getErrorMessage(err) } }));
    }
  }, []);

  const handleToggle = (num: number) => {
    if (expanded === num) {
      setExpanded(null);
      return;
    }
    setExpanded(num);
    if (!byRasi[num]) loadRasi(num);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setByRasi({});
    setExpanded(null);
    setTimeout(() => setRefreshing(false), 400);
  }, []);

  const today = new Date().toLocaleDateString('ta-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const renderRasi = ({ item, index }: { item: typeof RASIS[0]; index: number }) => {
    const state = byRasi[item.num];
    return (
      <RasiCard
        rasi={item}
        index={index}
        expanded={expanded === item.num}
        loading={state?.loading ?? false}
        error={state?.error ?? null}
        result={state?.result ?? null}
        onToggle={() => handleToggle(item.num)}
        onRetry={() => loadRasi(item.num)}
      />
    );
  };

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />

      {/* Header */}
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">
          ⭐ ராசி பலன்கள்
        </StyledText>
      </StyledView>

      <FlatList
        data={RASIS}
        keyExtractor={(item) => String(item.num)}
        renderItem={renderRasi}
        contentContainerClassName="px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e2b714" />
        }
        ListHeaderComponent={
          <StyledView className="mb-4">
            <StyledText className="text-gold text-2xl font-serif font-bold">
              ⭐ ராசி பலன்கள்
            </StyledText>
            <StyledText className="text-light-text/50 text-sm font-sans mt-1">
              உங்கள் ராசியை தேர்ந்து இன்றைய பலனை காணுங்கள்
            </StyledText>
            <StyledText className="text-light-text/30 text-xs font-sans mt-0.5">
              இன்று — {today}
            </StyledText>
          </StyledView>
        }
        ListFooterComponent={
          <StyledView className="py-4 items-center">
            <StyledText className="text-light-text/20 text-[10px] font-sans">
              © {new Date().getFullYear()} Jothidam • Rasi Palan
            </StyledText>
          </StyledView>
        }
      />
    </StyledSafeArea>
  );
}
