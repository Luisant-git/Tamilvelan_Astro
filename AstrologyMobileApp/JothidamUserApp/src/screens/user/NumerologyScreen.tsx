// JothidamUserApp/src/screens/user/NumerologyScreen.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { styled } from '../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useCallback } from 'react';
import BackButton from '../../components/common/BackButton';
import DateTimePicker from '../../components/common/CrossPlatformDateTimePicker';
import { notifyAlert } from '../../utils/alert';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledInput = styled(TextInput);
const StyledTouchable = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeArea = styled(SafeAreaView);
const StyledKeyboardView = styled(KeyboardAvoidingView);

// ============ Chaldean Numerology Values ============
const CHALDEAN: Record<string, number> = {
  A:1, B:2, C:3, D:4, E:5, F:8, G:3, H:5, I:1, J:1, K:2, L:3, M:4, N:5,
  O:7, P:8, Q:1, R:2, S:3, T:4, U:6, V:6, W:6, X:5, Y:1, Z:7
};

// ============ Helper Functions ============
function reduce(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((s, c) => s + parseInt(c, 10), 0);
  }
  return n;
}

function nameNumber(name: string): number {
  const total = Array.from(name.toUpperCase())
    .filter(c => /[A-Z]/.test(c))
    .reduce((s, c) => s + (CHALDEAN[c] || 0), 0);
  return reduce(total);
}

function destinyFromDob(iso: string): number {
  const digits = iso.replace(/-/g, '').split('').map(d => parseInt(d, 10)).filter(n => !Number.isNaN(n));
  return reduce(digits.reduce((s, d) => s + d, 0));
}

function lifePathFromDob(iso: string): number {
  const [y, m, d] = iso.split('-').map(n => parseInt(n, 10));
  return reduce(reduce(y) + reduce(m) + reduce(d));
}

// ============ Number Meanings ============
const NUMBER_MEANING: Record<number, { ta: string; en: string }> = {
  1: { 
    ta: 'தலைமை, தனிமை, புதிய தொடக்கம் — சூரியனின் ஆற்றல்.', 
    en: 'Leadership, individuality, fresh starts — energy of the Sun.' 
  },
  2: { 
    ta: 'பொருத்தம், அன்பு, உள்ளுணர்வு — சந்திரனின் ஆற்றல்.', 
    en: 'Harmony, love, intuition — energy of the Moon.' 
  },
  3: { 
    ta: 'வளர்ச்சி, கல்வி, ஞானம் — குருவின் ஆற்றல்.', 
    en: 'Growth, learning, wisdom — energy of Jupiter.' 
  },
  4: { 
    ta: 'நிலையான முயற்சி, ஒழுங்கு — ராகுவின் ஆற்றல்.', 
    en: 'Discipline, structure, perseverance — energy of Rahu.' 
  },
  5: { 
    ta: 'புதன், தகவல், விரைவான தொடர்பு — புதனின் ஆற்றல்.', 
    en: 'Communication, adaptability — energy of Mercury.' 
  },
  6: { 
    ta: 'அழகு, கலை, காதல், சொகுசு — சுக்கிரனின் ஆற்றல்.', 
    en: 'Beauty, art, love, comfort — energy of Venus.' 
  },
  7: { 
    ta: 'மறை ஞானம், ஆன்மிகம் — கேதுவின் ஆற்றல்.', 
    en: 'Mysticism, spirituality — energy of Ketu.' 
  },
  8: { 
    ta: 'நிலைத்தன்மை, கடினமான உழைப்பு — சனியின் ஆற்றல்.', 
    en: 'Stability, hard work, karma — energy of Saturn.' 
  },
  9: { 
    ta: 'வீரம், உயர் இலக்கு — செவ்வாயின் ஆற்றல்.', 
    en: 'Courage, drive, action — energy of Mars.' 
  },
  11: { 
    ta: 'மாஸ்டர் எண் — உள்ளுணர்வு, தலைமை, தெய்வீக ஞானம்.', 
    en: 'Master number — intuition, illumination, leadership.' 
  },
  22: { 
    ta: 'மாஸ்டர் கட்டுமான எண் — பெரிய சாதனை, மாற்றம்.', 
    en: 'Master builder — large-scale achievement, transformation.' 
  },
  33: { 
    ta: 'மாஸ்டர் ஆசிரியர் எண் — அன்பு, சேவை, கருணை.', 
    en: 'Master teacher — compassion, service, healing.' 
  }
};

// ============ Components ============

// 1. Number Card
function NumberCard({ 
  label, 
  labelEn, 
  value 
}: { 
  label: string; 
  labelEn: string; 
  value: number;
}) {
  return (
    <StyledView className="bg-[#1A0E3A] border border-gold/20 rounded-2xl p-4 items-center flex-1 min-w-[100px]">
      <StyledText className="text-light-text/50 text-xs font-sans">{label}</StyledText>
      <StyledText className="text-light-text/30 text-[9px] font-sans mb-1">{labelEn}</StyledText>
      <StyledText className="text-gold text-4xl font-bold font-sans">{value}</StyledText>
    </StyledView>
  );
}

// 2. Meaning Card
function MeaningCard({ 
  label, 
  value 
}: { 
  label: string; 
  value: number;
}) {
  const meaning = NUMBER_MEANING[value];
  if (!meaning) return null;
  
  return (
    <StyledView className="bg-[#1A0E3A] rounded-xl p-3 mb-2 border-l-2 border-gold">
      <StyledText className="text-gold text-sm font-bold font-sans">
        {label} = <StyledText className="text-lg">{value}</StyledText>
      </StyledText>
      <StyledText className="text-light-text text-sm font-sans mt-1 leading-relaxed">
        {meaning.ta}
      </StyledText>
      <StyledText className="text-light-text/40 text-[10px] font-sans mt-0.5 leading-relaxed">
        {meaning.en}
      </StyledText>
    </StyledView>
  );
}

// ============ Main Screen ============
export default function NumerologyScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [result, setResult] = useState<{ 
    name: number; 
    destiny: number; 
    lifePath: number;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleCalculate = () => {
    if (!name.trim()) {
      notifyAlert('Error', 'Please enter your name');
      return;
    }
    
    const dobISO = `${dob.getFullYear()}-${String(dob.getMonth() + 1).padStart(2, '0')}-${String(dob.getDate()).padStart(2, '0')}`;
    
    setResult({
      name: nameNumber(name),
      destiny: destinyFromDob(dobISO),
      lifePath: lifePathFromDob(dobISO)
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setResult(null);
    setName('');
    setDob(new Date());
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      
      {/* Header */}
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">
          🔢 எண் கணிதம் / Numerology
        </StyledText>
      </StyledView>

      <StyledKeyboardView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
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
              🔢 எண் கணிதம்
            </StyledText>
            <StyledText className="text-light-text/50 text-sm font-sans mt-1">
              Numerology
            </StyledText>
            <StyledText className="text-light-text/30 text-xs font-sans mt-0.5">
              சல்தீய எண் முறை — உங்கள் பெயர் மற்றும் பிறந்த தேதியின் அடிப்படையில் ஆற்றல் எண்கள்
            </StyledText>
          </StyledView>

          {/* Form */}
          <StyledView className="bg-dark-card rounded-2xl p-5 border border-gold/10 mb-4">
            {/* Name Input */}
            <StyledView className="mb-4">
              <StyledText className="text-light-text/70 text-sm font-sans mb-1">
                முழு பெயர் / Full Name (English)
              </StyledText>
              <StyledInput
                className="bg-dark border border-gold/30 rounded-xl px-4 py-3 text-light-text"
                placeholder="Karthik"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
                autoCapitalize="characters"
                returnKeyType="done"
              />
            </StyledView>

            {/* Date of Birth */}
            <StyledView className="mb-4">
              <StyledText className="text-light-text/70 text-sm font-sans mb-1">
                பிறந்த தேதி / Date of Birth
              </StyledText>
              <StyledTouchable
                className="bg-dark border border-gold/30 rounded-xl px-4 py-3"
                onPress={() => setShowDatePicker(true)}
              >
                <StyledText className="text-light-text">
                  {dob.toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </StyledText>
              </StyledTouchable>
              {showDatePicker && (
                <DateTimePicker
                  value={dob}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    // Android fires onChange on Cancel too, still carrying
                    // whatever date was last scrolled to — ignore it then.
                    if (event.type === 'dismissed') return;
                    if (selectedDate) setDob(selectedDate);
                  }}
                />
              )}
            </StyledView>

            {/* Calculate Button */}
            <StyledTouchable
              className="bg-gold rounded-xl py-4 items-center"
              onPress={handleCalculate}
            >
              <StyledText className="text-dark font-bold text-base">
                கணக்கிடு / Calculate
              </StyledText>
            </StyledTouchable>
          </StyledView>

          {/* Results */}
          {result && (
            <>
              {/* Number Cards */}
              <StyledView className="flex-row flex-wrap gap-3 mb-4">
                <NumberCard label="பெயர் எண்" labelEn="Name Number" value={result.name} />
                <NumberCard label="விதி எண்" labelEn="Destiny" value={result.destiny} />
                <NumberCard label="வாழ்க்கை பாதை" labelEn="Life Path" value={result.lifePath} />
              </StyledView>

              {/* Meanings */}
              <StyledView className="bg-dark-card rounded-2xl p-5 border border-gold/10 mb-4">
                <StyledText className="text-gold text-lg font-serif font-bold mb-1">
                  📖 எண்களின் பொருள்
                </StyledText>
                <StyledText className="text-light-text/30 text-[10px] font-sans mb-3">
                  Meaning of your numbers
                </StyledText>
                
                <MeaningCard label="பெயர் எண்" value={result.name} />
                <MeaningCard label="விதி எண்" value={result.destiny} />
                <MeaningCard label="வாழ்க்கை பாதை" value={result.lifePath} />
              </StyledView>
            </>
          )}

          {/* Footer */}
          <StyledView className="py-2 items-center">
            <StyledText className="text-light-text/20 text-[10px] font-sans">
              © {new Date().getFullYear()} Jothidam • Numerology
            </StyledText>
          </StyledView>
        </StyledScrollView>
      </StyledKeyboardView>
    </StyledSafeArea>
  );
}