// JothidamUserApp/src/screens/user/VasthuScreen.tsx
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
import { useState, useCallback } from 'react';
import BackButton from '../../components/common/BackButton';

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
  amber: '#FFC107'
};

type Verdict = 'excellent' | 'good' | 'caution' | 'avoid';

interface Direction {
  key: string;
  ta: string;
  en: string;
  abbr: string;
  deity: string;
  elementTa: string;
  elementEn: string;
  idealUseTa: string;
  doorVerdict: Verdict;
}

// ============ Data ============
const DIRECTIONS: Direction[] = [
  {
    key: 'NE', ta: 'வடகிழக்கு / ஈசான்யம்', en: 'North-East', abbr: 'NE',
    deity: 'ஈசானன்', elementTa: 'நீர்', elementEn: 'Water',
    idealUseTa: 'பூஜை அறை, கிணறு, நீர் தொட்டி, நுழைவாயில்',
    doorVerdict: 'excellent'
  },
  {
    key: 'E', ta: 'கிழக்கு', en: 'East', abbr: 'E',
    deity: 'இந்திரன்', elementTa: 'காற்று', elementEn: 'Air',
    idealUseTa: 'நுழைவாயில், ஜன்னல், படிக்கும் அறை',
    doorVerdict: 'excellent'
  },
  {
    key: 'SE', ta: 'தென்கிழக்கு / ஆக்னேயம்', en: 'South-East', abbr: 'SE',
    deity: 'அக்னி', elementTa: 'அக்னி', elementEn: 'Fire',
    idealUseTa: 'சமையலறை, மின்சார பெட்டி, அடுப்பு',
    doorVerdict: 'caution'
  },
  {
    key: 'S', ta: 'தெற்கு', en: 'South', abbr: 'S',
    deity: 'யமன்', elementTa: 'நிலம்', elementEn: 'Earth',
    idealUseTa: 'படுக்கையறை, பெரிய பீரோ, புத்தக அலமாரி',
    doorVerdict: 'avoid'
  },
  {
    key: 'SW', ta: 'தென்மேற்கு / நிருதி', en: 'South-West', abbr: 'SW',
    deity: 'நிருதி', elementTa: 'நிலம்', elementEn: 'Earth',
    idealUseTa: 'முதன்மை படுக்கையறை, பேழை, கனமான அலமாரி',
    doorVerdict: 'avoid'
  },
  {
    key: 'W', ta: 'மேற்கு', en: 'West', abbr: 'W',
    deity: 'வருணன்', elementTa: 'நீர்', elementEn: 'Water',
    idealUseTa: 'சாப்பாட்டு அறை, குழந்தைகள் அறை, கழிப்பறை',
    doorVerdict: 'good'
  },
  {
    key: 'NW', ta: 'வடமேற்கு / வாயவ்யம்', en: 'North-West', abbr: 'NW',
    deity: 'வாயு', elementTa: 'காற்று', elementEn: 'Air',
    idealUseTa: 'விருந்தினர் அறை, கழிப்பறை, தானியக் கிடங்கு',
    doorVerdict: 'good'
  },
  {
    key: 'N', ta: 'வடக்கு', en: 'North', abbr: 'N',
    deity: 'குபேரன்', elementTa: 'நீர்', elementEn: 'Water',
    idealUseTa: 'பணப்பெட்டி, வியாபார அலுவலகம், நுழைவாயில்',
    doorVerdict: 'excellent'
  }
];

const VERDICT_META: Record<Verdict, { ta: string; en: string; color: string; icon: string; adviceTa: string }> = {
  excellent: { ta: 'மிகச் சிறந்தது', en: 'Excellent', color: COLORS.green, icon: '⭐', adviceTa: 'எந்த மாற்றமும் தேவையில்லை.' },
  good: { ta: 'நன்று', en: 'Good', color: COLORS.gold, icon: '✅', adviceTa: 'பொதுவாக ஏற்றுக்கொள்ளக்கூடியது.' },
  caution: { ta: 'எச்சரிக்கை', en: 'Caution', color: COLORS.amber, icon: '⚠️', adviceTa: 'பரிகாரம் / மாற்று வடிவமைப்பு பரிசீலிக்கவும்.' },
  avoid: { ta: 'தவிர்க்கவும்', en: 'Avoid', color: COLORS.red, icon: '🚫', adviceTa: 'வாஸ்து தோஷம் — பரிகாரம் அவசியம்.' }
};

const ROOM_PLACEMENTS = [
  { roomTa: 'பூஜை அறை', roomEn: 'Pooja Room', bestTa: 'வடகிழக்கு (ஈசான்யம்)', avoidTa: 'தென்மேற்கு, தெற்கு' },
  { roomTa: 'சமையலறை', roomEn: 'Kitchen', bestTa: 'தென்கிழக்கு (ஆக்னேயம்)', avoidTa: 'வடகிழக்கு, வடக்கு' },
  { roomTa: 'முதன்மை படுக்கை', roomEn: 'Master Bedroom', bestTa: 'தென்மேற்கு (நிருதி)', avoidTa: 'வடகிழக்கு' },
  { roomTa: 'குழந்தை அறை', roomEn: 'Children Room', bestTa: 'வடமேற்கு, மேற்கு', avoidTa: 'தென்மேற்கு' },
  { roomTa: 'படிக்கும் அறை', roomEn: 'Study Room', bestTa: 'வடகிழக்கு, கிழக்கு', avoidTa: 'தென்மேற்கு' },
  { roomTa: 'பணப்பெட்டி', roomEn: 'Locker / Safe', bestTa: 'வடக்கு (குபேரன் திசை)', avoidTa: 'தெற்கு, தென்மேற்கு' },
  { roomTa: 'கழிப்பறை', roomEn: 'Toilet', bestTa: 'வடமேற்கு, மேற்கு', avoidTa: 'வடகிழக்கு, தென்கிழக்கு, மையம்' },
  { roomTa: 'நீர் தொட்டி', roomEn: 'Water Tank', bestTa: 'வடகிழக்கு', avoidTa: 'தென்மேற்கு, மையம்' }
];

const REMEDIES = [
  { icon: '🪞', ta: 'வாஸ்து தோஷம் உள்ள திசையில் தெளிவான கண்ணாடி (mirror) தொங்கவிடவும் — தோஷத்தை திருப்பும்.' },
  { icon: '🌿', ta: 'வடகிழக்கு மூலையில் ஒரு துளசி செடி வைக்கவும் — நேர்மறை ஆற்றலை அதிகரிக்கிறது.' },
  { icon: '🧂', ta: 'திறந்த ஒரு கிண்ணத்தில் கல் உப்பு படுக்கையறை மூலையில் வைக்கவும் — எதிர்மறை ஆற்றலை உறிஞ்சும்.' },
  { icon: '🔔', ta: 'நுழைவு வாயிலில் காற்று மணி (wind chime) — சுப ஆற்றல் வரவேற்பு.' },
  { icon: '🟠', ta: 'தென்மேற்கு திசையில் கனமான பொருட்கள் / பெரிய மரப்பொருட்கள் — நிலையான ஆற்றலுக்கு.' },
  { icon: '💡', ta: 'வடகிழக்கு மற்றும் கிழக்கு திசைகளை இலகுவாக, பிரகாசமாக வைக்கவும் — பாரம் வேண்டாம்.' }
];

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

// 2. Direction Card
function DirectionCard({
  direction,
  picked,
  onPick
}: {
  direction: Direction;
  picked: boolean;
  onPick: () => void;
}) {
  const verdict = VERDICT_META[direction.doorVerdict];
  
  return (
    <StyledTouchable
      className={`rounded-xl p-3 border ${picked ? 'border-gold bg-[#321C6B]' : 'border-gold/20 bg-dark-card'}`}
      onPress={onPick}
      activeOpacity={0.7}
    >
      <StyledView className="flex-row justify-between items-center">
        <StyledText className="text-gold text-sm font-serif font-bold">
          {direction.ta}
        </StyledText>
        <StyledText style={{ color: verdict.color }} className="text-base">
          {verdict.icon}
        </StyledText>
      </StyledView>
      <StyledText className="text-light-text/30 text-[9px] font-sans">
        {direction.en} · {direction.abbr} · {direction.deity}
      </StyledText>
      <StyledText className="text-light-text/40 text-[10px] font-sans">
        {direction.elementTa} ({direction.elementEn})
      </StyledText>
    </StyledTouchable>
  );
}

// 3. Room Placement Item
function RoomPlacementItem({ item }: { item: typeof ROOM_PLACEMENTS[0] }) {
  return (
    <StyledView className="flex-row justify-between py-3 px-4 border-b border-gold/5">
      <StyledView>
        <StyledText className="text-gold text-sm font-serif font-bold">
          {item.roomTa}
        </StyledText>
        <StyledText className="text-light-text/30 text-[9px] font-sans">
          {item.roomEn}
        </StyledText>
      </StyledView>
      <StyledView className="items-end">
        <StyledText className="text-green-500 text-xs font-sans">
          ✅ {item.bestTa}
        </StyledText>
        <StyledText className="text-red-500 text-xs font-sans">
          🚫 {item.avoidTa}
        </StyledText>
      </StyledView>
    </StyledView>
  );
}

// 4. Remedy Item
function RemedyItem({ item }: { item: typeof REMEDIES[0] }) {
  return (
    <StyledView className="flex-row gap-3 py-3 px-4 border-b border-gold/5">
      <StyledText className="text-2xl">{item.icon}</StyledText>
      <StyledText className="text-light-text/70 text-sm font-sans flex-1 leading-relaxed">
        {item.ta}
      </StyledText>
    </StyledView>
  );
}

// ============ Main Screen ============
export default function VasthuScreen({ navigation }: any) {
  const [doorDir, setDoorDir] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const picked = doorDir ? DIRECTIONS.find(d => d.key === doorDir)! : null;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setDoorDir(null);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      
      {/* Header */}
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">
          🏠 வாஸ்து சாஸ்திரம்
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
            🏠 வாஸ்து சாஸ்திரம்
          </StyledText>
          <StyledText className="text-light-text/50 text-sm font-sans mt-1">
            Vasthu Sastra — 8 directions, room placement, and door direction check
          </StyledText>
        </StyledView>

        {/* Door Direction */}
        <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-3">
          <HeaderBand>முதன்மை கதவின் திசை — Main door direction</HeaderBand>
          
          <StyledView className="flex-row flex-wrap p-3 gap-2">
            {DIRECTIONS.map((d) => (
              <StyledView key={d.key} className="w-[48%]">
                <DirectionCard
                  direction={d}
                  picked={doorDir === d.key}
                  onPick={() => setDoorDir(d.key)}
                />
              </StyledView>
            ))}
          </StyledView>

          {picked && (
            <StyledView className="border-t border-gold/10 p-4 bg-[#1A0E3A]">
              <StyledView className="flex-row items-center gap-3 mb-2">
                <StyledText className="text-3xl">
                  {VERDICT_META[picked.doorVerdict].icon}
                </StyledText>
                <StyledView>
                  <StyledText style={{ color: VERDICT_META[picked.doorVerdict].color }} className="text-lg font-serif font-bold">
                    {VERDICT_META[picked.doorVerdict].ta}
                  </StyledText>
                  <StyledText className="text-light-text/30 text-[10px] font-sans">
                    {picked.ta} ({picked.en}) — {VERDICT_META[picked.doorVerdict].en}
                  </StyledText>
                </StyledView>
              </StyledView>
              <StyledText className="text-light-text/70 text-sm font-sans leading-relaxed">
                {VERDICT_META[picked.doorVerdict].adviceTa}
              </StyledText>
              <StyledView className="mt-2 p-3 bg-dark-card rounded-lg">
                <StyledText className="text-light-text/40 text-xs font-sans">
                  <StyledText className="text-gold font-bold">இந்த திசையின் சிறந்த பயன்பாடு:</StyledText>
                  {' '}{picked.idealUseTa}
                </StyledText>
              </StyledView>
            </StyledView>
          )}
        </StyledView>

        {/* Room Placement */}
        <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-3">
          <HeaderBand>அறை அமைப்பு வழிகாட்டி — Room placement guide</HeaderBand>
          {ROOM_PLACEMENTS.map((item, index) => (
            <RoomPlacementItem key={index} item={item} />
          ))}
        </StyledView>

        {/* Remedies */}
        <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-3">
          <HeaderBand>எளிய வாஸ்து பரிகாரங்கள் — Simple remedies</HeaderBand>
          {REMEDIES.map((item, index) => (
            <RemedyItem key={index} item={item} />
          ))}
        </StyledView>

        {/* Note */}
        <StyledView className="bg-[#1A0E3A] rounded-xl p-4 border border-gold/10 mb-4">
          <StyledText className="text-light-text/40 text-[10px] font-sans leading-relaxed">
            குறிப்பு: வாஸ்து வழிகாட்டுதல் பாரம்பரிய எட்டு திசை கொள்கைகளின் சுருக்கம் ஆகும். 
            ஒவ்வொரு வீடு / கடைக்கும் தனிப்பட்ட சூழ்நிலை உள்ளது — வாஸ்து புருஷ மண்டல 
            கணக்கீடு, மண் தரம், மற்றும் சுற்றுப்புறம் அனைத்தும் முக்கியம்.
          </StyledText>
          <StyledText className="text-light-text/20 text-[9px] font-sans mt-2 leading-relaxed">
            Note: This is a summary of classical 8-direction Vasthu principles. 
            Each home is unique — Vasthu Purusha Mandala, soil quality, and 
            surroundings all matter.
          </StyledText>
        </StyledView>

        {/* Footer */}
        <StyledView className="py-2 items-center">
          <StyledText className="text-light-text/20 text-[10px] font-sans">
            © {new Date().getFullYear()} Jothidam • Vasthu Sastra
          </StyledText>
        </StyledView>
      </StyledScrollView>
    </StyledSafeArea>
  );
}