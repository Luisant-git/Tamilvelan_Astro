// JothidamUserApp/src/screens/user/HomeScreen.tsx
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
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/common/Logo';
import { notifyAlert } from '../../utils/alert';
import DrawerMenuButton from '../../components/common/DrawerMenuButton';
import { tabNavigationRef } from '../../navigation/tabNavigationRef';
import { horoscopeApi } from '../../services/horoscope.api';
import { getErrorMessage } from '../../services/client';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeArea = styled(SafeAreaView);

// ============ Data ============

const RASI_LIST = [
  { num: 1, name: 'மேஷம்', symbol: '♈', en: 'Mesham' },
  { num: 2, name: 'ரிஷபம்', symbol: '♉', en: 'Rishabam' },
  { num: 3, name: 'மிதுனம்', symbol: '♊', en: 'Midhunam' },
  { num: 4, name: 'கடகம்', symbol: '♋', en: 'Kadagam' },
  { num: 5, name: 'சிம்மம்', symbol: '♌', en: 'Simmam' },
  { num: 6, name: 'கன்னி', symbol: '♍', en: 'Kanni' },
  { num: 7, name: 'துலாம்', symbol: '♎', en: 'Thulam' },
  { num: 8, name: 'விருச்சிகம்', symbol: '♏', en: 'Viruchigam' },
  { num: 9, name: 'தனுசு', symbol: '♐', en: 'Dhanusu' },
  { num: 10, name: 'மகரம்', symbol: '♑', en: 'Magaram' },
  { num: 11, name: 'கும்பம்', symbol: '♒', en: 'Kumbam' },
  { num: 12, name: 'மீனம்', symbol: '♓', en: 'Meenam' }
];

// Matrimony tile hidden per explicit request — not deleted, just left out
// of this array for now.
const QUICK_ACCESS = [
  { icon: '📅', ta: 'நாள் காட்டி', en: 'Day Calendar', route: 'panchang', bg: '#FF6B6B' },
  { icon: '🗓', ta: 'மாத காட்டி', en: 'Month Calendar', route: 'maatha-sirappu', bg: '#4CAF50' },
  { icon: '⭐', ta: 'ராசி பலன்கள்', en: 'Rasi Predictions', route: 'rasi-palan', bg: '#2196F3' },
  { icon: '🌟', ta: 'முக்கிய தினங்கள்', en: 'Important Days', route: 'important-days', bg: '#03A9F4' },
  { icon: '🕉', ta: 'ஆன்மிகம்', en: 'Spiritual', route: 'gowri', bg: '#FF8C00' },
  { icon: '🔮', ta: 'ஜாதகம் கணிக்க', en: 'Get Horoscope', route: 'jathagam', bg: '#FFD700' }
];

const CATEGORIES = [
  {
    ta: 'ஜாதக சேவைகள்', en: 'Horoscope Services', icon: '⭐',
    tiles: [
      { icon: '⭐', ta: 'உங்கள் ஜாதகம்', en: 'Your Horoscope', route: 'jathagam', bg: '#FFD700' },
      { icon: '💍', ta: 'திருமண பொருத்தம்', en: 'Marriage Match', route: 'porutham', bg: '#D4537E' }
      // ஜோதிட அறிக்கை/Astrology Report (ariggai) and ஜோதிடர் ஆலோசனை/
      // Consultation (aalosanai) tiles hidden per explicit request.
    ]
  },
  {
    ta: 'சிறப்பு தகவல்கள்', en: 'Special Info', icon: '✨',
    tiles: [
      { icon: '🌅', ta: 'இன்றைய சிறப்புகள்', en: "Today's Highlights", route: 'panchang', bg: '#4CAF50' },
      { icon: '🌄', ta: 'நாளைய சிறப்புகள்', en: "Tomorrow's Highlights", route: 'naalai-sirappu', bg: '#03A9F4' },
      { icon: '📅', ta: 'மாத சிறப்புகள்', en: "Monthly Highlights", route: 'maatha-sirappu', bg: '#FF8C00' },
      { icon: '💎', ta: 'சுபமுகூர்த்த தேர்வு', en: 'Muhurtham Finder', route: 'muhurtham', bg: '#E91E63' }
    ]
  },
  {
    ta: 'ஆன்மிக தகவல்கள்', en: 'Spiritual Info', icon: '🕉',
    tiles: [
      { icon: '📜', ta: 'இன்றைய பஞ்சாங்கம்', en: 'Today Panchang', route: 'panchang', bg: '#FFD700' },
      { icon: '⛔', ta: 'இராகு, குளிகை, எமகண்டம்', en: 'Rahu/Yamagandam', route: 'panchang', bg: '#FF6B6B' },
      { icon: '🌞', ta: 'கிரக ஓரைகளின் காலம்', en: 'Planetary Hora', route: 'hora', bg: '#FF8C00' },
      { icon: '🚫', ta: 'கரி நாட்கள், அஷ்டமி, நவமி', en: 'Karinaal / Ashtami / Navami', route: 'karinaal', bg: '#8B6914' }
    ]
  },
  {
    ta: 'கூடுதல்', en: 'More', icon: '➕',
    tiles: [
      { icon: '🏠', ta: 'வாஸ்து தகவல்கள்', en: 'Vasthu Information', route: 'vasthu', bg: '#FF5722' },
      { icon: '🦚', ta: 'பஞ்ச பட்சி சாஸ்திரம்', en: 'Pancha Pakshi Sastram', route: 'pancha-pakshi', bg: '#2196F3' },
      { icon: '🔍', ta: 'ஜோதிட தேடல்', en: 'Jothida Search', route: 'jathagam', bg: '#FFD700' },
      { icon: '🔢', ta: 'எண் கணிதம்', en: 'Numerology', route: 'numerology', bg: '#E91E63' },
      { icon: '📖', ta: 'கதைகள் / கட்டுரைகள்', en: 'Stories / Articles', route: 'kathaikal', bg: '#9C27B0' },
      { icon: '🪔', ta: 'கௌரி பஞ்சாங்கம்', en: 'Gowri Panchangam', route: 'gowri', bg: '#4CAF50' },
      { icon: '❓', ta: 'ஜோதிடர் பதில்', en: 'Ask Astrologer', route: 'ask-astrologer', bg: '#673AB7', comingSoon: true },
      { icon: '❤️', ta: 'காதல் பொருத்தம்', en: 'Love Match', route: 'kadhal', bg: '#FF4081' }
    ]
  }
];

// ============ Helper Functions ============

const MY_RASI_KEY = 'jothidam_my_rasi';

function getTodayLong() {
  const d = new Date();
  return d.toLocaleDateString('en-IN', { 
    weekday: 'long', 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
}

function getTodayTamilLong() {
  const d = new Date();
  const weekdays = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
  return `${weekdays[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

// ============ Components ============

// 1. Service Tile
function ServiceTile({ 
  icon, 
  ta, 
  en, 
  bg, 
  route, 
  navigation,
  comingSoon 
}: { 
  icon: string; 
  ta: string; 
  en: string; 
  bg: string; 
  route?: string; 
  navigation: any;
  comingSoon?: boolean;
}) {
  return (
    <StyledTouchable
      className="bg-dark-card p-3 items-center rounded-xl m-[1px] flex-1 min-h-[100px]"
      style={{ backgroundColor: '#251450' }}
      onPress={() => {
        if (comingSoon) {
          notifyAlert('Coming Soon', `${ta} — விரைவில் / Coming soon`);
          return;
        }
        if (route) navigation.navigate(route);
      }}
      activeOpacity={0.7}
    >
      <StyledView 
        className="w-11 h-11 rounded-xl items-center justify-center mb-1"
        style={{ backgroundColor: bg }}
      >
        <StyledText className="text-xl">{icon}</StyledText>
      </StyledView>
      <StyledText className="text-gold text-xs font-sans text-center font-bold">
        {ta}
      </StyledText>
      <StyledText className="text-light-text/50 text-[9px] font-sans text-center mt-0.5">
        {en}
      </StyledText>
      {comingSoon && (
        <StyledView className="absolute top-1 right-1 bg-[#FF8C00] px-1.5 py-0.5 rounded-full">
          <StyledText className="text-white text-[8px] font-bold">SOON</StyledText>
        </StyledView>
      )}
    </StyledTouchable>
  );
}

// 2. Category Section
function CategorySection({ 
  ta, 
  en, 
  icon, 
  tiles, 
  navigation 
}: { 
  ta: string; 
  en: string; 
  icon: string; 
  tiles: any[]; 
  navigation: any;
}) {
  return (
    <StyledView className="mb-5">
      <StyledView className="flex-row items-center gap-2 px-1 mb-2">
        <StyledText className="text-2xl">{icon}</StyledText>
        <StyledView>
          <StyledText className="text-gold text-lg font-serif font-bold">
            {ta}
          </StyledText>
          <StyledText className="text-light-text/40 text-xs font-sans">
            {en}
          </StyledText>
        </StyledView>
      </StyledView>
      <StyledView 
        className="flex-row flex-wrap rounded-xl overflow-hidden"
        style={{ backgroundColor: '#4B2A8F', borderWidth: 1, borderColor: '#4B2A8F' }}
      >
        {tiles.map((t, i) => (
          <StyledView key={i} className="w-1/2">
            <ServiceTile {...t} navigation={navigation} />
          </StyledView>
        ))}
      </StyledView>
    </StyledView>
  );
}

// 3. Today Widget
function TodayWidget({ navigation }: { navigation: any }) {
  const [data, setData] = useState<any>(null);
  const [viratha, setViratha] = useState<any>(null);

  useEffect(() => {
    // Simulate API call
    setData({
      rahuKalam: '7:30 - 9:00',
      yamagandam: '10:30 - 12:00',
      nallaNeram: { morning: '6:00 - 7:30', evening: '4:30 - 6:00' },
      specialDay: '🌞 சூரிய உதயம் 6:00 AM'
    });
    setViratha({ name: 'பிரதோஷ விரதம்', daysAway: 0 });
  }, []);

  const cells = [
    { label: 'நல்ல நேரம் காலை', value: data?.nallaNeram?.morning || '—', accent: '#4CAF50' },
    { label: 'நல்ல நேரம் மாலை', value: data?.nallaNeram?.evening || '—', accent: '#4CAF50' },
    { label: 'ராகு காலம்', value: data?.rahuKalam || '—', accent: '#FF6B6B' },
    { label: 'யமகண்டம்', value: data?.yamagandam || '—', accent: '#FF6B6B' },
    { 
      label: 'அடுத்த விரதம்', 
      value: viratha ? `${viratha.name} · ${viratha.daysAway === 0 ? 'இன்று' : `${viratha.daysAway} நாட்கள்`}` : '—',
      accent: '#FFD700',
      wide: true 
    }
  ];

  return (
    <StyledView className="bg-dark-card rounded-xl overflow-hidden mb-4 border border-gold/10">
      <StyledView className="bg-[#321C6B] p-2.5 border-b border-gold/10 flex-row justify-between items-center">
        <StyledText className="text-gold text-sm font-bold font-sans">
          இன்றைய பார்வை — Today at a glance
        </StyledText>
        <StyledTouchable onPress={() => navigation.navigate('panchang')}>
          <StyledText className="text-[#FF8C00] text-[10px] font-sans">
            முழு பஞ்சாங்கம் →
          </StyledText>
        </StyledTouchable>
      </StyledView>
      
      <StyledView className="flex-row flex-wrap">
        {cells.map((cell, index) => (
          <StyledView 
            key={index}
            className={cell.wide ? 'w-full' : 'w-1/2'}
            style={{ backgroundColor: '#251450', padding: 8, borderWidth: 0.5, borderColor: '#32205A' }}
          >
            <StyledText className="text-light-text/60 text-[10px] font-sans">
              {cell.label}
            </StyledText>
            <StyledText style={{ color: cell.accent }} className="text-sm font-bold font-sans">
              {cell.value}
            </StyledText>
          </StyledView>
        ))}
      </StyledView>

      {data?.specialDay && (
        <StyledView className="bg-[#1A0E3A] p-2 border-t border-gold/10">
          <StyledText className="text-[#FF8C00] text-xs text-center font-sans">
            {data.specialDay}
          </StyledText>
        </StyledView>
      )}
    </StyledView>
  );
}

// 4. Rasi Accordion
function RasiAccordion() {
  const [open, setOpen] = useState(false);
  const [selectedRasi, setSelectedRasi] = useState<any>(null);
  const [myRasiNum, setMyRasiNum] = useState<number | null>(null);
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  // Tracks the most recently requested rasi so a slow response for a rasi
  // the user has since tapped away from can't overwrite the newer one.
  const latestRequestRef = useRef<number | null>(null);

  const fetchPrediction = async (r: any) => {
    setSelectedRasi(r);
    setLoading(true);
    latestRequestRef.current = r.num;
    try {
      const result = await horoscopeApi.fetchDailyRasi(r.num);
      if (latestRequestRef.current !== r.num) return;
      setPrediction(result.prediction);
    } catch (err) {
      if (latestRequestRef.current !== r.num) return;
      setPrediction(getErrorMessage(err));
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadSavedRasi = async () => {
      try {
        const saved = await AsyncStorage.getItem(MY_RASI_KEY);
        if (saved) {
          const num = Number(saved);
          const r = RASI_LIST.find(x => x.num === num);
          if (r) {
            setMyRasiNum(num);
            setOpen(true);
            fetchPrediction(r);
          }
        }
      } catch {}
    };
    loadSavedRasi();
  }, []);

  const saveMyRasi = async (r: any) => {
    try {
      await AsyncStorage.setItem(MY_RASI_KEY, String(r.num));
      setMyRasiNum(r.num);
      notifyAlert('Success', `${r.symbol} ${r.name} — உங்கள் ராசியாக சேமிக்கப்பட்டது`);
    } catch {}
  };

  const clearMyRasi = async () => {
    try {
      await AsyncStorage.removeItem(MY_RASI_KEY);
      setMyRasiNum(null);
      notifyAlert('Info', 'என் ராசி நீக்கப்பட்டது');
    } catch {}
  };

  return (
    <StyledView className="bg-dark-card rounded-xl overflow-hidden mb-4 border border-gold/10">
      <StyledTouchable
        className="p-3.5 flex-row justify-between items-center"
        onPress={() => setOpen(!open)}
        activeOpacity={0.7}
      >
        <StyledView>
          <StyledText className="text-gold text-base font-serif font-bold">
            ⭐ இன்றைய ராசி பலன்
          </StyledText>
          <StyledText className="text-light-text/40 text-[10px] font-sans">
            {myRasiNum 
              ? 'Today\'s prediction for your saved rasi' 
              : 'Today\'s Rasi Prediction — tap to expand'}
          </StyledText>
        </StyledView>
        <Ionicons 
          name={open ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#FF8C00" 
        />
      </StyledTouchable>

      {open && (
        <StyledView className="border-t border-gold/10 p-3">
          <StyledScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-2"
          >
            {RASI_LIST.map(r => {
              const isSelected = selectedRasi?.num === r.num;
              const isMine = myRasiNum === r.num;
              return (
                <StyledTouchable
                  key={r.num}
                  className="min-w-[70px] p-2 rounded-lg mx-1 items-center"
                  style={{
                    backgroundColor: isSelected ? '#2A1A50' : '#1A0E3A',
                    borderWidth: 1,
                    borderColor: isSelected ? '#FFD700' : '#4B2A8F'
                  }}
                  onPress={() => fetchPrediction(r)}
                >
                  {isMine && (
                    <StyledView className="absolute -top-1 -right-1 bg-[#FF8C00] w-4 h-4 rounded-full items-center justify-center">
                      <StyledText className="text-white text-[10px]">★</StyledText>
                    </StyledView>
                  )}
                  <StyledText className="text-lg">{r.symbol}</StyledText>
                  <StyledText className="text-light-text text-[10px] font-sans">
                    {r.name}
                  </StyledText>
                </StyledTouchable>
              );
            })}
          </StyledScrollView>

          {selectedRasi && (
            <StyledView className="bg-[#1A0E3A] border border-gold rounded-xl p-3">
              <StyledText className="text-gold text-center font-bold">
                {selectedRasi.symbol} {selectedRasi.name}
                <StyledText className="text-light-text/40 text-[10px] font-sans ml-1">
                  ({selectedRasi.en})
                </StyledText>
              </StyledText>
              <StyledView className="mt-2">
                {loading ? (
                  <StyledView className="items-center py-2">
                    <ActivityIndicator size="small" color="#e2b714" />
                  </StyledView>
                ) : (
                  <StyledText className="text-light-text/80 text-xs text-center leading-relaxed font-sans">
                    {prediction}
                  </StyledText>
                )}
              </StyledView>
              <StyledView className="mt-2 items-center">
                {myRasiNum === selectedRasi.num ? (
                  <StyledTouchable
                    className="border border-gold/30 px-4 py-1.5 rounded-full"
                    onPress={clearMyRasi}
                  >
                    <StyledText className="text-light-text/60 text-[10px] font-sans">
                      ★ என் ராசி — Remove
                    </StyledText>
                  </StyledTouchable>
                ) : (
                  <StyledTouchable
                    className="bg-gold px-4 py-1.5 rounded-full"
                    onPress={() => saveMyRasi(selectedRasi)}
                  >
                    <StyledText className="text-dark text-[10px] font-bold font-sans">
                      ★ என் ராசியாக சேமி / Save
                    </StyledText>
                  </StyledTouchable>
                )}
              </StyledView>
            </StyledView>
          )}
        </StyledView>
      )}
    </StyledView>
  );
}

// 5. Next Festival Banner
function NextFestivalBanner() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    setInfo({ ta: 'தீபாவளி', en: 'Diwali', daysAway: 15 });
  }, []);

  if (!info) return null;

  return (
    <StyledView className="bg-[#321C6B] py-2 px-3 flex-row items-center justify-center flex-wrap border-b border-gold/10">
      <StyledText className="text-xl mr-1">🎉</StyledText>
      <StyledText className="text-gold text-xs font-bold font-sans">
        அடுத்த பண்டிகை: {info.ta}
      </StyledText>
      <StyledText className="text-light-text/60 text-[10px] font-sans ml-1">
        — {info.daysAway === 0 ? 'இன்று / today' : `${info.daysAway} நாட்கள் / days`}
      </StyledText>
      <StyledText className="text-light-text/40 text-[9px] font-sans ml-1">
        ({info.en})
      </StyledText>
    </StyledView>
  );
}

// 6. Daily Quote
function DailyQuote() {
  const [quote, setQuote] = useState<any>(null);

  useEffect(() => {
    setQuote({
      text: 'உங்கள் வாழ்க்கையில் ஒவ்வொரு நாளும் ஒரு புதிய ஆரம்பம்',
      author: 'ஜோதிடம்'
    });
  }, []);

  if (!quote) return null;

  return (
    <StyledView className="bg-[#1A0E3A] py-2 px-3 border-b border-gold/10">
      <StyledText className="text-light-text/60 text-xs text-center italic font-sans">
        “{quote.text}”
      </StyledText>
    </StyledView>
  );
}

// ============ Main HomeScreen ============

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Capture MainTabNavigator's own navigation object so the drawer can
  // switch tabs directly (tab names are valid LOCAL routes from there, no
  // cross-navigator nesting needed). `navigation` here is scoped to
  // HomeStackNavigator; getParent() escapes one level up to the Tab
  // navigator itself. Home is the tab navigator's initial route, so this
  // runs immediately on app start — unlike capturing from Jathagam/Panchang/
  // Tools, which would stay null until the user visits those tabs directly.
  useEffect(() => {
    const tabNav = navigation.getParent?.();
    if (tabNav) tabNavigationRef.current = tabNav;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      
      <StyledScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e2b714" />
        }
      >
        {/* Festival Banner */}
        <NextFestivalBanner />

        {/* Daily Quote */}
        <DailyQuote />

        {/* Header */}
        <LinearGradient
          colors={['#251450', '#0D0620']}
          style={{ paddingHorizontal: 16, paddingVertical: 20 }}
        >
          {/* Row 1: logo + brand on the left, hamburger fixed top-right — no
              wrap, so the hamburger never gets pushed onto a second line. */}
          <StyledView className="flex-row items-center justify-between">
            <StyledView className="flex-row items-center gap-3 flex-1 mr-2">
              <Logo size={52} />
              <StyledView className="flex-1">
                <StyledText className="text-gold text-xl font-serif font-bold">
                  தமிழ்வேலன் / TamilVelan
                </StyledText>
                <StyledText className="text-light-text/60 text-[10px] font-sans">
                  தமிழ்நாட்டின் நம்பகமான தமிழ் நாட்காட்டி வலைதளம்
                </StyledText>
                <StyledText className="text-light-text/40 text-[9px] font-sans">
                  TamilVelan Calendar
                </StyledText>
              </StyledView>
            </StyledView>

            {/* Home is always the tab root — always show the menu, never a
                back button. (navigation.canGoBack() isn't reliable here:
                Login/Register's `replace('Home')` leaves a second "Home"
                entry in RootNavigator's stack, which makes canGoBack()
                return true app-wide, since it bubbles up through parent
                navigators.) */}
            <DrawerMenuButton navigation={navigation} spacing="" />
          </StyledView>

          {/* Row 2: account pill + date card, right-aligned below */}
          <StyledView className="items-end mt-3" style={{ gap: 6 }}>
              {/* Account pill — mirrors the website Navbar's login/register or user+logout area */}
              <StyledTouchable
                className="flex-row items-center bg-[#1A0E3A] border border-gold/20 rounded-full px-3 py-1.5"
                onPress={() => navigation.navigate(user ? 'profile' : 'Login')}
                activeOpacity={0.7}
              >
                <Ionicons name={user ? 'person-circle' : 'log-in-outline'} size={14} color="#FFD700" />
                <StyledText className="text-gold text-[10px] font-sans font-bold ml-1">
                  {user ? (user.name?.split(' ')[0] || 'சுயவிவரம்') : 'உள்நுழை / Login'}
                </StyledText>
              </StyledTouchable>

              {/* Date Card */}
              <StyledTouchable
                className="bg-[#1A0E3A] border border-gold/20 rounded-xl px-3 py-2 min-w-[140px]"
                onPress={() => navigation.navigate('panchang')}
                activeOpacity={0.7}
              >
                <StyledView className="flex-row items-center justify-end gap-1">
                  <StyledText className="text-light-text/40 text-[9px] font-sans">📅 இன்றைய தேதி</StyledText>
                  <StyledText className="text-[#FF8C00] text-[10px]">→</StyledText>
                </StyledView>
                <StyledText className="text-gold text-sm font-serif font-bold text-right">
                  {getTodayTamilLong()}
                </StyledText>
                <StyledText className="text-light-text/30 text-[8px] font-sans text-right">
                  {getTodayLong()}
                </StyledText>
              </StyledTouchable>
          </StyledView>
        </LinearGradient>

        {/* Quick Access */}
        <StyledView className="px-4 pt-4">
          <StyledView className="flex-row flex-wrap rounded-xl overflow-hidden" style={{ backgroundColor: '#4B2A8F' }}>
            {QUICK_ACCESS.map((t, i) => (
              <StyledView key={i} className="w-[33.33%]">
                <ServiceTile 
                  icon={t.icon} 
                  ta={t.ta} 
                  en={t.en} 
                  bg={t.bg} 
                  route={t.route} 
                  navigation={navigation} 
                />
              </StyledView>
            ))}
          </StyledView>
        </StyledView>

        {/* Today Widget */}
        <StyledView className="px-4 pt-4">
          <TodayWidget navigation={navigation} />
        </StyledView>

        {/* Rasi Accordion */}
        <StyledView className="px-4 pt-2">
          <RasiAccordion />
        </StyledView>

        {/* Categories */}
        <StyledView className="px-4 pb-5" style={{ backgroundColor: '#0D0620' }}>
          <StyledView className="items-center mb-3 pt-2">
            <StyledText className="text-gold text-xl font-serif font-bold">
              எங்கள் சேவைகள்
            </StyledText>
            <StyledText className="text-light-text/40 text-[10px] font-sans">
              Our Services — categorized
            </StyledText>
          </StyledView>
          {CATEGORIES.map((c, i) => (
            <CategorySection key={i} {...c} navigation={navigation} />
          ))}
        </StyledView>

        {/* Footer */}
        <StyledView className="px-4 py-4 items-center border-t border-gold/10" style={{ backgroundColor: '#0D0620' }}>
          <StyledText className="text-light-text/20 text-[10px] font-sans">
            © {new Date().getFullYear()} தமிழ்வேலன் / TamilVelan
          </StyledText>
          <StyledText className="text-light-text/15 text-[8px] font-sans">
            TamilVelan • All rights reserved
          </StyledText>
        </StyledView>
      </StyledScrollView>
    </StyledSafeArea>
  );
}