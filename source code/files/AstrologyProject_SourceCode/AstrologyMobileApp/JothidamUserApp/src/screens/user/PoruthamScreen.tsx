// JothidamUserApp/src/screens/user/PoruthamScreen.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  FlatList,
  Keyboard,
  Dimensions
} from 'react-native';
import { styled } from '../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useState, useEffect, useCallback, useRef, useMemo, createContext, useContext } from 'react';
import BackButton from '../../components/common/BackButton';
import { useAuth } from '../../context/AuthContext';
import RequireAuth from '../../components/common/RequireAuth';
import { RASI_TAMIL, type PoruthamItem, type MatchDosham } from '../../utils/porutham';
import type { SideChart, MarriageMatchResponse } from '../../types/marriage.types';
import { marriageApi } from '../../services/marriage.api';
import { horoscopeApi } from '../../services/horoscope.api';
import { getErrorMessage } from '../../services/client';
import { notifyAlert } from '../../utils/alert';
import { useMutation } from '../../hooks';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledInput = styled(TextInput);
const StyledTouchable = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeArea = styled(SafeAreaView);
const StyledKeyboardView = styled(KeyboardAvoidingView);

// ============ Types ============
interface Suggestion {
  label: string;
  latitude: number;
  longitude: number;
}

interface Side {
  name: string;
  month: string;
  day: string;
  year: string;
  hour: string;
  minute: string;
  ampm: 'AM' | 'PM';
  birthPlace: string;
  selected: Suggestion | null;
}

type Result = MarriageMatchResponse;

// ============ Constants ============
const CURRENT_YEAR = new Date().getFullYear();

const PLANET_SHORT_TAMIL: Record<string, string> = {
  Sun: 'சூரி', Moon: 'சந்', Mars: 'செவ்', Mercury: 'புதன்',
  Jupiter: 'குரு', Venus: 'சுக்', Saturn: 'சனி', Rahu: 'ராகு', Ketu: 'கேது'
};

// ============ Helper Functions ============
function emptySide(): Side {
  return {
    name: '',
    month: '1',
    day: '1',
    year: String(CURRENT_YEAR),
    hour: '01',
    minute: '59',
    ampm: 'AM',
    birthPlace: '',
    selected: null
  };
}

function toIsoDate(s: Side): string {
  return `${s.year}-${s.month.padStart(2, '0')}-${s.day.padStart(2, '0')}`;
}

function toTime24(s: Side): string {
  let h = parseInt(s.hour, 10);
  if (s.ampm === 'PM' && h < 12) h += 12;
  if (s.ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${s.minute}`;
}

// Month/day/year/hour/minute are free-text inputs (no native picker), so a
// cleared or partially-edited field can otherwise reach the API as e.g.
// "2026--01" — the backend has no guard for this and crashes (500) trying
// to ISO-format the resulting Invalid Date. Catch it client-side instead.
function isValidSide(s: Side): boolean {
  const month = parseInt(s.month, 10);
  const day = parseInt(s.day, 10);
  const year = parseInt(s.year, 10);
  const hour = parseInt(s.hour, 10);
  const minute = parseInt(s.minute, 10);
  if (!Number.isInteger(month) || month < 1 || month > 12) return false;
  if (!Number.isInteger(day) || day < 1 || day > 31) return false;
  if (!Number.isInteger(year) || year < 1900 || year > CURRENT_YEAR) return false;
  if (!Number.isInteger(hour) || hour < 1 || hour > 12) return false;
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return false;
  const d = new Date(toIsoDate(s));
  return !isNaN(d.getTime());
}

function formatDateLong(iso: string, time: string): string {
  try {
    const d = new Date(iso);
    const base = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return `${base} ${time}`;
  } catch { return iso; }
}

// ============ Components ============

// 1. Icon Badge
function IconBadge({ icon, color }: { icon: string; color: string }) {
  return (
    <StyledView 
      className="w-7 h-7 rounded-lg items-center justify-center mr-2"
      style={{ backgroundColor: color }}
    >
      <StyledText className="text-white text-sm">{icon}</StyledText>
    </StyledView>
  );
}

// Suggestions used to render inline, absolutely-positioned right under each
// input — but PartyCard's outer wrapper below has overflow-hidden (for its
// rounded corners) and the whole form sits inside a ScrollView, so the list
// got clipped/trapped depending on scroll position, and a plain .map() with
// only maxHeight (no ScrollView/FlatList of its own) meant it never actually
// scrolled either. Fixed by lifting the dropdown out to render once at the
// screen root (see PoruthamScreenInner) — outside both the overflow-hidden
// ancestor and the ScrollView — positioned via the input's on-screen
// coordinates. A RN Modal would sidestep those same ancestors too, but on
// Android a Modal is a separate native Dialog window that can steal focus
// from an already-focused TextInput and dismiss the keyboard the moment it
// opens — exactly wrong for a dropdown that must stay open while the user
// keeps typing. Sharing the setter via context (rather than threading props
// through PartyCard) keeps PartyCard itself untouched.
interface SuggestionAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

const SuggestionsOverlayContext = createContext<{
  show: (anchor: SuggestionAnchor, suggestions: Suggestion[], onPick: (s: Suggestion) => void) => void;
  hide: () => void;
} | null>(null);

// 2. Place Autocomplete
function PlaceAutocomplete({
  value,
  onChange,
  onSelect
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (s: Suggestion | null) => void;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wrapRef = useRef<View>(null);
  const overlay = useContext(SuggestionsOverlayContext);

  const showList = (list: Suggestion[]) => {
    wrapRef.current?.measureInWindow((x, y, width, height) => {
      overlay?.show({ x, y, width, height }, list, (s) => {
        onSelect(s);
        onChange(s.label);
        overlay.hide();
      });
    });
  };

  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      overlay?.hide();
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { suggestions: results } = await horoscopeApi.geocode(value);
        const mapped = results.map((s) => ({ label: s.label, latitude: s.latitude, longitude: s.longitude }));
        setSuggestions(mapped);
        if (mapped.length > 0) showList(mapped);
      } catch {
        // Silent — geocode failures shouldn't block manual place entry.
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <StyledView ref={wrapRef} className="relative" collapsable={false}>
      <StyledInput
        className="bg-dark border border-gold/30 rounded-xl px-4 py-3 text-light-text"
        placeholder="பிறந்த இடம் / Birth Place"
        placeholderTextColor="#666"
        value={value}
        onChangeText={(text) => {
          onChange(text);
          onSelect(null);
        }}
        onFocus={() => suggestions.length > 0 && showList(suggestions)}
      />
      {loading && (
        <StyledText className="absolute right-3 top-3 text-light-text/40 text-[10px] font-sans">
          தேடுகிறது...
        </StyledText>
      )}
    </StyledView>
  );
}

// 3. Party Card
function PartyCard({
  title,
  subtitle,
  headerColor,
  iconColor,
  side,
  setSide
}: {
  title: string;
  subtitle: string;
  headerColor: string;
  iconColor: string;
  side: Side;
  setSide: React.Dispatch<React.SetStateAction<Side>>;
}) {
  const setField = <K extends keyof Side>(field: K, value: Side[K]) =>
    setSide(prev => ({ ...prev, [field]: value }));

  return (
    <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-4">
      <StyledView className="p-4 items-center" style={{ backgroundColor: headerColor }}>
        <StyledText className="text-white text-lg font-serif font-bold">{title}</StyledText>
        <StyledText className="text-white/70 text-xs font-sans">{subtitle}</StyledText>
      </StyledView>
      
      <StyledView className="p-4">
        {/* Name */}
        <StyledView className="mb-3">
          <StyledView className="flex-row items-center mb-1">
            <IconBadge icon="👤" color={iconColor} />
            <StyledText className="text-light-text/70 text-sm font-sans">பெயர் / Name</StyledText>
          </StyledView>
          <StyledInput
            className="bg-dark border border-gold/30 rounded-xl px-4 py-3 text-light-text"
            placeholder="பெயர்"
            placeholderTextColor="#666"
            value={side.name}
            onChangeText={(v) => setField('name', v)}
          />
        </StyledView>

        {/* Date of Birth */}
        <StyledView className="mb-3">
          <StyledView className="flex-row items-center mb-1">
            <IconBadge icon="📅" color={iconColor} />
            <StyledText className="text-light-text/70 text-sm font-sans">பிறந்த தேதி / DOB</StyledText>
          </StyledView>
          <StyledView className="flex-row gap-2">
            <StyledView className="flex-1">
              <StyledInput
                className="bg-dark border border-gold/30 rounded-xl px-3 py-3 text-light-text text-center"
                value={side.month}
                onChangeText={(v) => setField('month', v)}
                keyboardType="number-pad"
                maxLength={2}
              />
            </StyledView>
            <StyledView className="flex-1">
              <StyledInput
                className="bg-dark border border-gold/30 rounded-xl px-3 py-3 text-light-text text-center"
                value={side.day}
                onChangeText={(v) => setField('day', v)}
                keyboardType="number-pad"
                maxLength={2}
              />
            </StyledView>
            <StyledView className="flex-1">
              <StyledInput
                className="bg-dark border border-gold/30 rounded-xl px-3 py-3 text-light-text text-center"
                value={side.year}
                onChangeText={(v) => setField('year', v)}
                keyboardType="number-pad"
                maxLength={4}
              />
            </StyledView>
          </StyledView>
        </StyledView>

        {/* Birth Time */}
        <StyledView className="mb-3">
          <StyledView className="flex-row items-center mb-1">
            <IconBadge icon="🕒" color={iconColor} />
            <StyledText className="text-light-text/70 text-sm font-sans">பிறந்த நேரம் / Time</StyledText>
          </StyledView>
          <StyledView className="flex-row gap-2">
            <StyledView className="flex-1">
              <StyledInput
                className="bg-dark border border-gold/30 rounded-xl px-3 py-3 text-light-text text-center"
                value={side.hour}
                onChangeText={(v) => setField('hour', v)}
                keyboardType="number-pad"
                maxLength={2}
              />
            </StyledView>
            <StyledView className="flex-1">
              <StyledInput
                className="bg-dark border border-gold/30 rounded-xl px-3 py-3 text-light-text text-center"
                value={side.minute}
                onChangeText={(v) => setField('minute', v)}
                keyboardType="number-pad"
                maxLength={2}
              />
            </StyledView>
            <StyledView className="flex-1">
              <StyledView className="flex-row bg-dark border border-gold/30 rounded-xl overflow-hidden">
                <StyledTouchable
                  className={`flex-1 py-3 items-center ${side.ampm === 'AM' ? 'bg-gold' : 'bg-transparent'}`}
                  onPress={() => setField('ampm', 'AM')}
                >
                  <StyledText className={side.ampm === 'AM' ? 'text-dark' : 'text-light-text'}>AM</StyledText>
                </StyledTouchable>
                <StyledTouchable
                  className={`flex-1 py-3 items-center ${side.ampm === 'PM' ? 'bg-gold' : 'bg-transparent'}`}
                  onPress={() => setField('ampm', 'PM')}
                >
                  <StyledText className={side.ampm === 'PM' ? 'text-dark' : 'text-light-text'}>PM</StyledText>
                </StyledTouchable>
              </StyledView>
            </StyledView>
          </StyledView>
        </StyledView>

        {/* Birth Place */}
        <StyledView>
          <StyledView className="flex-row items-center mb-1">
            <IconBadge icon="📍" color={iconColor} />
            <StyledText className="text-light-text/70 text-sm font-sans">பிறந்த இடம் / Place</StyledText>
          </StyledView>
          <PlaceAutocomplete
            value={side.birthPlace}
            onChange={(v) => setField('birthPlace', v)}
            onSelect={(s) => setField('selected', s)}
          />
        </StyledView>
      </StyledView>
    </StyledView>
  );
}

// 4. Porutham Table
function PoruthamTable({ items }: { items: PoruthamItem[] }) {
  return (
    <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-4">
      <StyledView className="bg-[#1A0E3A] px-4 py-3">
        <StyledText className="text-gold text-base font-serif font-bold">
          📋 தசவித பொருத்தம்
        </StyledText>
      </StyledView>
      <StyledView>
        <StyledView className="flex-row bg-[#32205A] px-4 py-2">
          <StyledText className="text-gold text-[10px] font-bold font-sans w-[30px]">#</StyledText>
          <StyledText className="text-gold text-[10px] font-bold font-sans flex-1">பொருத்தம்</StyledText>
          <StyledText className="text-gold text-[10px] font-bold font-sans w-[80px]">முடிவு</StyledText>
        </StyledView>
        {items.map((p, i) => {
          const verdictColor = p.level === 'good' ? '#4CAF50' : p.level === 'mid' ? '#FFB74D' : '#FF6B6B';
          return (
            <StyledView
              key={p.num}
              className={`flex-row px-4 py-2.5 ${i % 2 === 0 ? 'bg-[#1A0E3A]' : 'bg-[#251450]'}`}
            >
              <StyledText className="text-light-text/40 text-xs font-sans w-[30px]">{p.num}</StyledText>
              <StyledText className="text-light-text/70 text-xs font-sans flex-1">{p.name}</StyledText>
              <StyledText style={{ color: verdictColor }} className="text-xs font-bold font-sans w-[80px]">
                {p.verdict}
              </StyledText>
            </StyledView>
          );
        })}
      </StyledView>
    </StyledView>
  );
}

// 5. Dosham Table
function DoshamTable({ doshams }: { doshams: MatchDosham[] }) {
  return (
    <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-4">
      <StyledView className="bg-[#1A0E3A] px-4 py-3">
        <StyledText className="text-gold text-base font-serif font-bold">
          ⚠️ தோட விவரம்
        </StyledText>
      </StyledView>
      <StyledView>
        <StyledView className="flex-row bg-[#32205A] px-4 py-2">
          <StyledText className="text-gold text-[10px] font-bold font-sans flex-1">தோட வகை</StyledText>
          <StyledText className="text-gold text-[10px] font-bold font-sans w-[120px]">முடிவு</StyledText>
        </StyledView>
        {doshams.map((d, i) => (
          <StyledView
            key={d.name}
            className={`flex-row px-4 py-2.5 ${i % 2 === 0 ? 'bg-[#1A0E3A]' : 'bg-[#251450]'}`}
          >
            <StyledText className="text-light-text/70 text-xs font-sans flex-1">{d.name}</StyledText>
            <StyledText style={{ color: d.matching ? '#4CAF50' : '#FF6B6B' }} className="text-xs font-bold font-sans w-[120px]">
              {d.note}
            </StyledText>
          </StyledView>
        ))}
      </StyledView>
    </StyledView>
  );
}

// 6. Side Birth Card
function SideBirthCard({ chart, accent, title }: { chart: SideChart; accent: string; title: string }) {
  const rows = [
    ['பிறந்த தேதி', formatDateLong(chart.dobIso, chart.birthTime)],
    ['லக்னம்', chart.lagna],
    ['ராசி', chart.rasi],
    ['நட்சத்திரம்', `${chart.nakshatra} - ${chart.pada} பாதம்`],
    ['பிறந்த ஊர்', chart.birthPlace]
  ];

  return (
    <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-4">
      <StyledView className="px-4 py-2.5" style={{ backgroundColor: accent }}>
        <StyledText className="text-white text-sm font-bold font-sans">📍 {title}</StyledText>
      </StyledView>
      {rows.map(([k, v], i) => (
        <StyledView
          key={k}
          className={`flex-row px-4 py-2 ${i % 2 === 0 ? 'bg-[#1A0E3A]' : 'bg-[#251450]'}`}
        >
          <StyledText className="text-light-text/50 text-xs font-sans w-[40%]">{k}</StyledText>
          <StyledText className="text-gold text-xs font-sans flex-1">{v}</StyledText>
        </StyledView>
      ))}
      <StyledView className="px-4 py-2.5 border-t border-gold/10">
        <StyledText className="text-light-text/40 text-[10px] font-sans mb-1.5">கிரக நிலைகள் / Planets</StyledText>
        <StyledView className="flex-row flex-wrap" style={{ gap: 6 }}>
          {Object.entries(chart.planets).map(([planet, { rasi }]) => (
            <StyledView key={planet} className="bg-[#1A0E3A] rounded-md px-2 py-1">
              <StyledText className="text-light-text/70 text-[9px] font-sans">
                {PLANET_SHORT_TAMIL[planet] || planet}: <StyledText className="text-gold">{RASI_TAMIL[rasi - 1]}</StyledText>
              </StyledText>
            </StyledView>
          ))}
        </StyledView>
      </StyledView>
    </StyledView>
  );
}

// ============ Main Screen ============
function PoruthamScreenInner({ navigation }: any) {
  const { user } = useAuth();
  // This screen is nested inside MainTabNavigator's HomeTab (via
  // HomeStackNavigator), so the bottom tab bar renders as a sibling below
  // it, not part of its own layout — but this screen's own SafeAreaView
  // (default edges) still applies the device's raw bottom safe-area inset
  // on top of that, and the ScrollView had no padding accounting for the
  // tab bar's actual rendered height at all. The two together made the
  // footer end up tight against — on some devices effectively under — the
  // tab bar. useBottomTabBarHeight() is react-navigation's own accessor for
  // the tab bar's real height (56 + its own safe-area padding, see
  // MainTabNavigator), which is what the ScrollView needs to clear.
  const tabBarHeight = useBottomTabBarHeight();
  const [bride, setBride] = useState<Side>(emptySide());
  const [groom, setGroom] = useState<Side>(emptySide());
  const [result, setResult] = useState<Result | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { mutate: matchMutate, loading } = useMutation(marriageApi.match);

  // Single shared place-suggestions overlay for both Bride's and Groom's
  // PlaceAutocomplete — only one can be open at a time anyway. Rendered
  // once at the screen root (below), positioned via measured coordinates
  // from whichever field is active. See the PlaceAutocomplete comment for
  // why this isn't inline or a Modal.
  const [placeOverlay, setPlaceOverlay] = useState<{
    anchor: SuggestionAnchor;
    suggestions: Suggestion[];
    onPick: (s: Suggestion) => void;
  } | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates?.height ?? 0));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const suggestionsOverlay = useMemo(
    () => ({
      show: (anchor: SuggestionAnchor, suggestions: Suggestion[], onPick: (s: Suggestion) => void) =>
        setPlaceOverlay({ anchor, suggestions, onPick }),
      hide: () => setPlaceOverlay(null),
    }),
    []
  );

  // Clamp dropdown height to whatever room is actually left between the
  // field and the keyboard, instead of a fixed max-height that can run
  // underneath the keyboard and become unreachable.
  const dropdownMaxHeight = placeOverlay
    ? Math.max(80, Math.min(220, Dimensions.get('window').height - keyboardHeight - (placeOverlay.anchor.y + placeOverlay.anchor.height) - 12))
    : 0;

  const handleSubmit = async () => {
    if (!bride.name.trim() || !groom.name.trim()) {
      notifyAlert('Error', 'இரு பெயர்களும் தேவை / Both names required');
      return;
    }
    if (!isValidSide(bride) || !isValidSide(groom)) {
      notifyAlert('Error', 'பிறந்த தேதி / நேரம் தவறானது — சரிபார்க்கவும் / Invalid birth date or time — please check');
      return;
    }

    try {
      const liveResult = await matchMutate({
        brideName: bride.name.trim(),
        brideDob: toIsoDate(bride),
        brideBirthTime: toTime24(bride),
        brideBirthPlace: bride.birthPlace || undefined,
        brideLatitude: bride.selected?.latitude,
        brideLongitude: bride.selected?.longitude,
        groomName: groom.name.trim(),
        groomDob: toIsoDate(groom),
        groomBirthTime: toTime24(groom),
        groomBirthPlace: groom.birthPlace || undefined,
        groomLatitude: groom.selected?.latitude,
        groomLongitude: groom.selected?.longitude,
      });
      setResult(liveResult);
    } catch (err) {
      notifyAlert('Error', getErrorMessage(err) || 'பொருத்தம் கணிக்கவில்லை / Failed to calculate');
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setResult(null);
    setBride(emptySide());
    setGroom(emptySide());
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SuggestionsOverlayContext.Provider value={suggestionsOverlay}>
    {/* edges omits 'bottom' — the tab bar sibling below already reserves the
        device's bottom safe-area inset as part of its own height, so also
        applying it here would double-count it (excess gap on top of the
        tabBarHeight padding the ScrollView already adds below). */}
    <StyledSafeArea className="flex-1 bg-dark" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">
          💍 திருமண பொருத்தம்
        </StyledText>
        {user && (
          <StyledView className="bg-gold/20 px-2 py-1 rounded-full">
            <StyledText className="text-gold text-[10px] font-sans">
              {user.name?.split(' ')[0] || 'User'}
            </StyledText>
          </StyledView>
        )}
      </StyledView>

      <StyledKeyboardView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <StyledScrollView
          className="flex-1"
          // Padding on the ScrollView's own style/className only insets its
          // outer viewport frame, not the scrollable content — it can't add
          // real extra scroll space at the bottom (that's what
          // contentContainerStyle is for), which is part of why the footer
          // had no genuine room to clear the tab bar below it.
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: tabBarHeight + 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e2b714" />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <StyledView className="mb-4">
            <StyledText className="text-gold text-2xl font-serif font-bold">
              💍 திருமண பொருத்தம்
            </StyledText>
            <StyledText className="text-light-text/50 text-sm font-sans mt-1">
              மணமகள் மற்றும் மணமகனின் பிறந்த விவரங்களை நிரப்பவும்
            </StyledText>
          </StyledView>

          {/* Bride Card */}
          <PartyCard
            title="🚺 பெண் விவரங்கள்"
            subtitle="பெண்ணின் பிறந்த விவரங்களை நிரப்பவும்"
            headerColor="#4B2A8F"
            iconColor="#FF8C00"
            side={bride}
            setSide={setBride}
          />

          {/* Groom Card */}
          <PartyCard
            title="🚹 ஆண் விவரங்கள்"
            subtitle="மணமகனின் பிறந்த விவரங்களை நிரப்பவும்"
            headerColor="#1A0E3A"
            iconColor="#7B1FA2"
            side={groom}
            setSide={setGroom}
          />

          {/* Submit Button */}
          <StyledTouchable
            className={`bg-gold rounded-xl py-4 items-center mb-4 ${loading ? 'opacity-70' : ''}`}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <StyledView className="flex-row items-center">
                <ActivityIndicator size="small" color="#1a1a2e" />
                <StyledText className="text-dark font-bold text-base ml-2">
                  கணிக்கிறோம்...
                </StyledText>
              </StyledView>
            ) : (
              <StyledText className="text-dark font-bold text-base">
                ❤ பொருத்தம் பார்க்க / Check Match
              </StyledText>
            )}
          </StyledTouchable>

          {/* Results */}
          {result && (
            <StyledView className="mt-2">
              {/* Score Header */}
              <StyledView className="bg-[#1A0E3A] rounded-2xl p-6 border border-gold/10 items-center mb-4">
                <StyledText className="text-4xl mb-1">💖</StyledText>
                <StyledText className="text-gold text-xl font-serif font-bold">
                  ஜாதக பொருத்தம் முடிவு
                </StyledText>
                <StyledText className="text-light-text/40 text-[10px] font-sans">
                  தசவித பொருத்தம் அடிப்படையில் கணிக்கப்பட்டது
                </StyledText>
                <StyledView className="mt-3">
                  <StyledText
                    className="text-5xl font-bold font-sans"
                    style={{
                      color: result.percentage >= 75 ? '#4CAF50' : result.percentage >= 45 ? '#FFD700' : '#FF6B6B',
                    }}
                  >
                    {result.percentage}%
                  </StyledText>
                  <StyledText className="text-gold text-sm font-sans">
                    {result.totalScore} / {result.maxScore} புள்ளி
                  </StyledText>
                  <StyledText className="text-light-text/60 text-xs font-sans mt-2 text-center">
                    {result.recommendation}
                  </StyledText>
                </StyledView>
              </StyledView>

              {/* Birth Details */}
              <StyledView className="flex-row flex-wrap gap-3">
                <StyledView className="flex-1 min-w-[140px]">
                  <SideBirthCard chart={result.bride} accent="#4B2A8F" title="பெண் பிறப்பு விவரங்கள்" />
                </StyledView>
                <StyledView className="flex-1 min-w-[140px]">
                  <SideBirthCard chart={result.groom} accent="#7B1FA2" title="ஆண் பிறப்பு விவரங்கள்" />
                </StyledView>
              </StyledView>

              {/* Porutham Table */}
              <PoruthamTable items={result.porutthams} />

              {/* Dosham Table */}
              <DoshamTable doshams={result.doshams} />
            </StyledView>
          )}

          {/* Footer */}
          <StyledView className="py-2 items-center">
            <StyledText className="text-light-text/20 text-[10px] font-sans">
              © {new Date().getFullYear()} Jothidam • Marriage Match
            </StyledText>
          </StyledView>
        </StyledScrollView>
      </StyledKeyboardView>

      {/* Place-suggestions overlay — rendered as a screen-root sibling (not
          inline, not a Modal) so it clears both PartyCard's overflow-hidden
          wrapper and the ScrollView; see the PlaceAutocomplete comment. */}
      {placeOverlay && (
        <>
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
            onPress={() => setPlaceOverlay(null)}
          />
          <StyledView
            className="absolute bg-dark-card rounded-xl border border-gold/20"
            style={{
              top: placeOverlay.anchor.y + placeOverlay.anchor.height + 4,
              left: placeOverlay.anchor.x,
              width: placeOverlay.anchor.width,
              maxHeight: dropdownMaxHeight,
              zIndex: 1000,
              elevation: 12,
              shadowColor: '#000',
              shadowOpacity: 0.3,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <FlatList
              data={placeOverlay.suggestions}
              keyExtractor={(_, i) => String(i)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item: s, index: i }) => (
                <StyledTouchable
                  className={`px-4 py-2.5 ${i < placeOverlay.suggestions.length - 1 ? 'border-b border-gold/10' : ''}`}
                  onPress={() => {
                    placeOverlay.onPick(s);
                    setPlaceOverlay(null);
                  }}
                >
                  <StyledText className="text-light-text text-sm font-sans">{s.label}</StyledText>
                </StyledTouchable>
              )}
            />
          </StyledView>
        </>
      )}
    </StyledSafeArea>
    </SuggestionsOverlayContext.Provider>
  );
}

export default function PoruthamScreen({ navigation }: any) {
  return (
    <RequireAuth navigation={navigation}>
      <PoruthamScreenInner navigation={navigation} />
    </RequireAuth>
  );
}