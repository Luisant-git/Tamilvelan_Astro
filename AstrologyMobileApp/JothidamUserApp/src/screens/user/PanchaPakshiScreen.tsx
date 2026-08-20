// JothidamUserApp/src/screens/user/PanchaPakshiScreen.tsx
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
import BackButton from '../../components/common/BackButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  green: '#4CAF50',
  red: '#FF6B6B',
  cyan: '#7DD3FC'
};

const ACTIVITY_COLOR: Record<string, string> = {
  rule: COLORS.gold,
  eat: COLORS.green,
  walk: COLORS.cyan,
  sleep: COLORS.muted,
  die: COLORS.red
};

const STORAGE_KEY = 'jothidam_my_nakshatra';

// ============ Data ============
const NAKSHATRA = [
  'அஸ்வினி', 'பரணி', 'கார்த்திகை', 'ரோகிணி', 'மிருகசீரிடம்',
  'திருவாதிரை', 'புனர்பூசம்', 'பூசம்', 'ஆயில்யம்', 'மகம்',
  'பூரம்', 'உத்திரம்', 'ஹஸ்தம்', 'சித்திரை', 'சுவாதி',
  'விசாகம்', 'அனுஷம்', 'கேட்டை', 'மூலம்', 'பூராடம்',
  'உத்திராடம்', 'திருவோணம்', 'அவிட்டம்', 'சதயம்', 'பூரட்டாதி',
  'உத்திரட்டாதி', 'ரேவதி'
];

const BIRDS = [
  { key: 'eagle', ta: 'கழுகு', en: 'Eagle', icon: '🦅', elementEn: 'Sky' },
  { key: 'owl', ta: 'ஆந்தை', en: 'Owl', icon: '🦉', elementEn: 'Night' },
  { key: 'peacock', ta: 'மயில்', en: 'Peacock', icon: '🦚', elementEn: 'Earth' },
  { key: 'crow', ta: 'காகம்', en: 'Crow', icon: '🐦‍⬛', elementEn: 'Air' },
  { key: 'cock', ta: 'சேவல்', en: 'Cock', icon: '🐓', elementEn: 'Fire' }
];

const BIRD_INFO: Record<string, { ta: string; en: string; icon: string; elementTa: string }> = {
  eagle: { ta: 'கழுகு', en: 'Eagle', icon: '🦅', elementTa: 'ஆகாயம்' },
  owl: { ta: 'ஆந்தை', en: 'Owl', icon: '🦉', elementTa: 'இரவு' },
  peacock: { ta: 'மயில்', en: 'Peacock', icon: '🦚', elementTa: 'பூமி' },
  crow: { ta: 'காகம்', en: 'Crow', icon: '🐦‍⬛', elementTa: 'காற்று' },
  cock: { ta: 'சேவல்', en: 'Cock', icon: '🐓', elementTa: 'நெருப்பு' }
};

const BIRD_TO_NAKSHATRA: Record<string, number[]> = {
  eagle: [0, 5, 10, 15, 20, 25],
  owl: [1, 6, 11, 16, 21, 26],
  peacock: [2, 7, 12, 17, 22],
  crow: [3, 8, 13, 18, 23],
  cock: [4, 9, 14, 19, 24]
};

const FRIENDS: Record<string, string[]> = {
  eagle: ['peacock', 'crow'],
  owl: ['crow', 'cock'],
  peacock: ['eagle', 'owl'],
  crow: ['owl', 'peacock'],
  cock: ['eagle', 'owl']
};

const ENEMIES: Record<string, string[]> = {
  eagle: ['owl', 'cock'],
  owl: ['eagle', 'peacock'],
  peacock: ['crow', 'cock'],
  crow: ['eagle', 'cock'],
  cock: ['peacock', 'crow']
};

const ACTIVITIES = {
  rule: { ta: 'ஆளுகை', en: 'Rule', icon: '👑', toneTa: 'தலைமை, அதிகாரம்', score: 5 },
  eat: { ta: 'உணவு', en: 'Eat', icon: '🍗', toneTa: 'செழிப்பு, வளர்ச்சி', score: 4 },
  walk: { ta: 'நடை', en: 'Walk', icon: '🚶', toneTa: 'இயக்கம், முன்னேற்றம்', score: 3 },
  sleep: { ta: 'தூக்கம்', en: 'Sleep', icon: '😴', toneTa: 'ஓய்வு, புத்துணர்வு', score: 1 },
  die: { ta: 'இறப்பு', en: 'Die', icon: '💀', toneTa: 'தடைகள், எச்சரிக்கை', score: -3 }
};

// ============ Helper Functions ============
function getBirdForNakshatra(idx: number): string {
  for (const [bird, indices] of Object.entries(BIRD_TO_NAKSHATRA)) {
    if (indices.includes(idx)) return bird;
  }
  return 'eagle';
}

function getNakshatrasForBird(bird: string): string[] {
  const indices = BIRD_TO_NAKSHATRA[bird] || [];
  return indices.map(i => NAKSHATRA[i]);
}

function getRulerBird(): string {
  const day = new Date().getDay();
  const rulers = ['eagle', 'owl', 'peacock', 'crow', 'cock', 'eagle', 'owl'];
  return rulers[day] || 'eagle';
}

function getPaksha(): string {
  const day = new Date().getDate();
  return day <= 15 ? 'shukla' : 'krishna';
}

function getSchedule(bird: string): any[] {
  // Simplified schedule - 5 periods of ~2.4 hours each
  const schedule = [];
  const birds = ['eagle', 'owl', 'peacock', 'crow', 'cock'];
  const startIdx = birds.indexOf(bird);
  const dayStart = 6; // 6 AM
  
  for (let i = 0; i < 5; i++) {
    const idx = (startIdx + i) % 5;
    const startHour = dayStart + (i * 2.4);
    const endHour = dayStart + ((i + 1) * 2.4);
    const activity = ['rule', 'eat', 'walk', 'sleep', 'die'][i];
    schedule.push({
      index: i,
      bird: birds[idx],
      activity: activity,
      startMinutes: startHour * 60,
      endMinutes: endHour * 60,
      clockStart: `${Math.floor(startHour)}:${String(Math.round((startHour % 1) * 60)).padStart(2, '0')}`,
      clockEnd: `${Math.floor(endHour)}:${String(Math.round((endHour % 1) * 60)).padStart(2, '0')}`
    });
  }
  return schedule;
}

function getRelationship(bird1: string, bird2: string): string {
  if (bird1 === bird2) return 'self';
  if (FRIENDS[bird1]?.includes(bird2)) return 'friend';
  if (ENEMIES[bird1]?.includes(bird2)) return 'enemy';
  return 'neutral';
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

// 2. Bird Badge
function BirdBadge({ 
  bird, 
  size = 'md' 
}: { 
  bird: string; 
  size?: 'sm' | 'md' | 'lg';
}) {
  const info = BIRD_INFO[bird];
  const dims = size === 'lg' ? { icon: 56, ta: 22, en: 13, pad: 18 }
    : size === 'sm' ? { icon: 28, ta: 13, en: 10, pad: 8 }
    : { icon: 36, ta: 16, en: 11, pad: 12 };

  return (
    <StyledView className="items-center" style={{ padding: dims.pad }}>
      <StyledText style={{ fontSize: dims.icon }}>{info.icon}</StyledText>
      <StyledText className="text-gold font-serif font-bold mt-1" style={{ fontSize: dims.ta }}>
        {info.ta}
      </StyledText>
      <StyledText className="text-light-text/30 font-sans" style={{ fontSize: dims.en }}>
        {info.en} · {info.elementTa}
      </StyledText>
    </StyledView>
  );
}

// 3. Slot Row
function SlotRow({ slot, isCurrent }: { slot: any; isCurrent: boolean }) {
  const activity = ACTIVITIES[slot.activity as keyof typeof ACTIVITIES];
  const tint = ACTIVITY_COLOR[slot.activity] || COLORS.gold;
  
  return (
    <StyledView 
      className={`flex-row items-center justify-between px-4 py-3 ${
        isCurrent ? 'bg-[#321C6B]' : ''
      }`}
      style={{ borderLeftWidth: 4, borderLeftColor: isCurrent ? tint : 'transparent' }}
    >
      <StyledView className="min-w-[60px]">
        <StyledText className="text-light-text text-sm font-sans">{slot.clockStart}</StyledText>
        <StyledText className="text-light-text/30 text-[10px] font-sans">{slot.clockEnd}</StyledText>
      </StyledView>
      
      <StyledView className="flex-1 ml-2">
        <StyledView className="flex-row items-center gap-2">
          <StyledText className="text-lg">{activity.icon}</StyledText>
          <StyledText style={{ color: tint }} className="text-sm font-bold font-sans">
            {activity.ta}
          </StyledText>
          <StyledText className="text-light-text/30 text-[10px] font-sans">
            ({activity.en})
          </StyledText>
        </StyledView>
        <StyledText className="text-light-text/40 text-[10px] font-sans mt-0.5">
          {activity.toneTa}
        </StyledText>
      </StyledView>
      
      <StyledView 
        className="px-3 py-1 rounded-full border"
        style={{ borderColor: tint, backgroundColor: tint + '20' }}
      >
        <StyledText style={{ color: tint }} className="text-xs font-bold font-sans">
          {activity.score > 0 ? `+${activity.score}` : activity.score}
        </StyledText>
      </StyledView>
    </StyledView>
  );
}

// ============ Main Screen ============
export default function PanchaPakshiScreen({ navigation }: any) {
  const now = useMemo(() => new Date(), []);
  const [selectedNak, setSelectedNak] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved !== null && !isNaN(Number(saved))) {
          setSelectedNak(Number(saved));
        }
      } catch {}
    };
    loadSaved();
  }, []);

  const persistNak = async (idx: number) => {
    setSelectedNak(idx);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(idx));
    } catch {}
    setShowPicker(false);
  };

  const clearNak = async () => {
    setSelectedNak(null);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const userBird = selectedNak !== null ? getBirdForNakshatra(selectedNak) : null;
  const ruler = getRulerBird();
  const paksha = getPaksha();
  const schedule = userBird ? getSchedule(userBird) : null;
  
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSlotIdx = schedule 
    ? schedule.findIndex((s: any) => nowMinutes >= s.startMinutes && nowMinutes < s.endMinutes)
    : -1;

  const isoToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

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
          🦚 பஞ்ச பட்சி சாஸ்திரம்
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
        <StyledView className="mb-4">
          <StyledText className="text-gold text-2xl font-serif font-bold">
            🦚 பஞ்ச பட்சி சாஸ்திரம்
          </StyledText>
          <StyledText className="text-light-text/50 text-sm font-sans mt-1">
            Pancha Pakshi Sastram — five birds mapped to your nakshatra
          </StyledText>
        </StyledView>

        {/* Nakshatra Selection */}
        <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-3">
          <HeaderBand>உங்கள் பிறந்த நட்சத்திரம்</HeaderBand>
          <StyledView className="p-4">
            <StyledTouchable
              className="bg-[#1A0E3A] border border-gold/20 rounded-xl px-4 py-3"
              onPress={() => setShowPicker(!showPicker)}
            >
              <StyledText className="text-light-text font-sans">
                {selectedNak !== null ? `${selectedNak + 1}. ${NAKSHATRA[selectedNak]}` : '— தேர்ந்தெடுக்கவும் / Select —'}
              </StyledText>
            </StyledTouchable>
            
            {showPicker && (
              <StyledView className="mt-2 bg-[#1A0E3A] border border-gold/20 rounded-xl max-h-48">
                <StyledScrollView>
                  {NAKSHATRA.map((nak, i) => (
                    <StyledTouchable
                      key={i}
                      className={`px-4 py-2.5 ${i < NAKSHATRA.length - 1 ? 'border-b border-gold/10' : ''}`}
                      onPress={() => persistNak(i)}
                    >
                      <StyledText className="text-light-text font-sans">
                        {i + 1}. {nak}
                      </StyledText>
                    </StyledTouchable>
                  ))}
                </StyledScrollView>
              </StyledView>
            )}
            
            {selectedNak !== null && (
              <StyledTouchable
                className="mt-2 border border-gold/20 rounded-lg px-4 py-1.5 self-start"
                onPress={clearNak}
              >
                <StyledText className="text-light-text/40 text-xs font-sans">
                  அகற்று / Clear
                </StyledText>
              </StyledTouchable>
            )}
          </StyledView>
        </StyledView>

        {userBird && (
          <>
            {/* User Bird */}
            <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-3">
              <HeaderBand>உங்கள் பறவை — Your bird</HeaderBand>
              <StyledView className="flex-row flex-wrap">
                <StyledView className="w-1/2 p-3 items-center">
                  <BirdBadge bird={userBird} size="lg" />
                </StyledView>
                <StyledView className="w-1/2 p-3 justify-center">
                  <StyledText className="text-light-text/40 text-[10px] font-sans">
                    நட்சத்திரங்கள்
                  </StyledText>
                  <StyledText className="text-light-text text-xs font-sans leading-relaxed">
                    {getNakshatrasForBird(userBird).join(', ')}
                  </StyledText>
                </StyledView>
              </StyledView>
            </StyledView>

            {/* Today's Schedule */}
            <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-3">
              <HeaderBand>இன்று ({isoToday}) — Today</HeaderBand>
              <StyledView className="flex-row justify-between p-3 border-b border-gold/10">
                <StyledView>
                  <StyledText className="text-light-text/30 text-[10px] font-sans">
                    பக்ஷம் / Paksha
                  </StyledText>
                  <StyledText className="text-gold text-sm font-bold font-sans">
                    {paksha === 'shukla' ? 'சுக்ல (வளர்பிறை)' : 'கிருஷ்ண (தேய்பிறை)'}
                  </StyledText>
                </StyledView>
                <StyledView className="items-end">
                  <StyledText className="text-light-text/30 text-[10px] font-sans">
                    இன்றைய ஆதிக்கப் பறவை
                  </StyledText>
                  <StyledText className="text-gold text-sm font-bold font-sans">
                    {BIRD_INFO[ruler].icon} {BIRD_INFO[ruler].ta}
                  </StyledText>
                </StyledView>
              </StyledView>
              
              {schedule?.map((slot: any, i: number) => (
                <SlotRow 
                  key={i} 
                  slot={slot} 
                  isCurrent={i === currentSlotIdx} 
                />
              ))}
              
              <StyledView className="p-3 border-t border-gold/10">
                <StyledText className="text-light-text/30 text-[10px] font-sans text-center">
                  * பகல் நேரம் (06:00 - 18:00) ஐந்து சம பகுதிகளாகப் பிரிக்கப்பட்டுள்ளது.
                </StyledText>
              </StyledView>
            </StyledView>

            {/* Friends & Enemies */}
            <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-3">
              <HeaderBand>நட்பு / எதிரி பறவைகள்</HeaderBand>
              <StyledView className="flex-row flex-wrap">
                <StyledView className="w-1/2 p-3 items-center border-r border-gold/10">
                  <StyledText className="text-[#4CAF50] text-xs font-bold font-sans mb-2">
                    🤝 நட்பு / Friends
                  </StyledText>
                  <StyledView className="flex-row flex-wrap justify-center gap-2">
                    {FRIENDS[userBird]?.map((b) => (
                      <BirdBadge key={b} bird={b} size="sm" />
                    ))}
                  </StyledView>
                </StyledView>
                <StyledView className="w-1/2 p-3 items-center">
                  <StyledText className="text-[#FF6B6B] text-xs font-bold font-sans mb-2">
                    ⚔️ எதிரி / Enemies
                  </StyledText>
                  <StyledView className="flex-row flex-wrap justify-center gap-2">
                    {ENEMIES[userBird]?.map((b) => (
                      <BirdBadge key={b} bird={b} size="sm" />
                    ))}
                  </StyledView>
                </StyledView>
              </StyledView>
            </StyledView>
          </>
        )}

        {/* All Five Birds */}
        <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-3">
          <HeaderBand>ஐந்து பறவைகள் — All five birds</HeaderBand>
          <StyledView className="flex-row flex-wrap">
            {BIRDS.map((bird) => {
              const rel = userBird ? getRelationship(userBird, bird.key) : null;
              const tint = rel === 'self' ? COLORS.gold
                : rel === 'friend' ? COLORS.green
                : rel === 'enemy' ? COLORS.red
                : COLORS.subtle;
              const isActive = userBird === bird.key;
              
              return (
                <StyledTouchable
                  key={bird.key}
                  className={`w-[20%] p-2 items-center ${
                    isActive ? 'border-t-2 border-gold' : 'border-t-2 border-transparent'
                  }`}
                  onPress={() => {
                    const idx = BIRD_TO_NAKSHATRA[bird.key]?.[0];
                    if (idx !== undefined) persistNak(idx);
                  }}
                  activeOpacity={0.7}
                >
                  <StyledText className="text-3xl">{bird.icon}</StyledText>
                  <StyledText style={{ color: tint }} className="text-xs font-bold font-sans">
                    {bird.ta}
                  </StyledText>
                  <StyledText className="text-light-text/30 text-[8px] font-sans">
                    {bird.elementEn}
                  </StyledText>
                  {rel && rel !== 'self' && (
                    <StyledText className="text-[10px]">
                      {rel === 'friend' ? '🤝' : rel === 'enemy' ? '⚔️' : ''}
                    </StyledText>
                  )}
                </StyledTouchable>
              );
            })}
          </StyledView>
        </StyledView>

        {/* Note */}
        <StyledView className="bg-[#1A0E3A] rounded-xl p-4 border border-gold/10 mb-4">
          <StyledText className="text-light-text/40 text-[10px] font-sans leading-relaxed">
            குறிப்பு: பஞ்ச பட்சி நேர அட்டவணை ஒரு பொதுவான மாதிரியாக கணக்கிடப்பட்டுள்ளது. 
            உண்மையான பஞ்ச பட்சி கணக்கீடு உள்ளூர் சூரியோதய நேரம், உண்மையான பக்ஷம், 
            மற்றும் தனிப்பட்ட சம்பிரதாயங்களின் அடிப்படையில் வேறுபடலாம்.
          </StyledText>
          <StyledText className="text-light-text/20 text-[9px] font-sans mt-2 leading-relaxed">
            Note: This Pancha Pakshi schedule is a generic heuristic. Authentic calculations 
            use local sunrise, true paksha, and tradition-specific sequences.
          </StyledText>
        </StyledView>

        {/* Footer */}
        <StyledView className="py-2 items-center">
          <StyledText className="text-light-text/20 text-[10px] font-sans">
            © {new Date().getFullYear()} Jothidam • Pancha Pakshi
          </StyledText>
        </StyledView>
      </StyledScrollView>
    </StyledSafeArea>
  );
}