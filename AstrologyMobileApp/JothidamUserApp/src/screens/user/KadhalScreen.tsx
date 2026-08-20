// JothidamUserApp/src/screens/user/KadhalScreen.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Share
} from 'react-native';
import { styled } from '../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../../components/common/BackButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notifyAlert } from '../../utils/alert';
import { useAuth } from '../../context/AuthContext';
import { kadhalApi } from '../../services/kadhal.api';
import { getErrorMessage } from '../../services/client';
import { useMutation } from '../../hooks';
import type { KadhalMatchResponse, KadhalTraits } from '../../types/kadhal.types';

const SAVED_MATCHES_KEY = 'jothidam_kadhal_saved';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledInput = styled(TextInput);
const StyledTouchable = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeArea = styled(SafeAreaView);
const StyledKeyboardView = styled(KeyboardAvoidingView);

// ============ Types ============
type Traits = KadhalTraits;
type Result = KadhalMatchResponse;

const TRAIT_LABEL: Record<keyof Traits, { ta: string; en: string; icon: string }> = {
  trust: { ta: 'நம்பிக்கை', en: 'Trust', icon: '🔒' },
  communication: { ta: 'தொடர்பு', en: 'Communication', icon: '💬' },
  passion: { ta: 'காதல்', en: 'Passion', icon: '🔥' },
  stability: { ta: 'நிலைத்தன்மை', en: 'Stability', icon: '⚓' }
};

// ============ Trait Bar Component ============
function TraitBar({ label, value }: { label: string; value: number }) {
  return (
    <StyledView className="mb-3">
      <StyledView className="flex-row justify-between mb-1">
        <StyledText className="text-light-text/60 text-xs font-sans">
          {label}
        </StyledText>
        <StyledText className="text-gold text-xs font-bold font-sans">
          {value}%
        </StyledText>
      </StyledView>
      <StyledView className="bg-[#1A0E3A] h-2 rounded-full overflow-hidden">
        <StyledView 
          className="h-full rounded-full"
          style={{ 
            width: `${value}%`, 
            backgroundColor: value >= 70 ? '#4CAF50' : value >= 40 ? '#FFD700' : '#FF6B6B' 
          }} 
        />
      </StyledView>
    </StyledView>
  );
}

// ============ Result Card ============
function ResultCard({ result, onSave }: { result: Result; onSave: (result: Result) => void }) {
  const getVerdictColor = (percentage: number) => {
    if (percentage >= 70) return '#4CAF50';
    if (percentage >= 40) return '#FFD700';
    return '#FF6B6B';
  };

  const getVerdictEmoji = (percentage: number) => {
    if (percentage >= 70) return '😍';
    if (percentage >= 40) return '😊';
    return '💔';
  };

  return (
    <StyledView className="bg-dark-card rounded-2xl p-5 border border-[#D4537E] mt-4">
      {/* Header */}
      <StyledView className="items-center mb-4">
        <StyledText className="text-light-text/50 text-sm font-sans">
          {result.name1} <StyledText className="text-[#FF6B9D]">❤</StyledText> {result.name2}
        </StyledText>
        <StyledView className="flex-row items-center mt-2">
          <StyledText className="text-[52px] font-bold" style={{ color: getVerdictColor(result.percentage) }}>
            {result.percentage}%
          </StyledText>
          <StyledText className="text-3xl ml-2">{getVerdictEmoji(result.percentage)}</StyledText>
        </StyledView>
        <StyledView 
          className="px-4 py-1.5 rounded-full mt-2"
          style={{ backgroundColor: getVerdictColor(result.percentage) + '20' }}
        >
          <StyledText style={{ color: getVerdictColor(result.percentage) }} className="text-sm font-sans font-bold">
            {result.verdict}
          </StyledText>
        </StyledView>
      </StyledView>

      {/* Traits */}
      <StyledView className="border-t border-gold/10 pt-4">
        {Object.entries(result.traits).map(([key, value]) => {
          const trait = TRAIT_LABEL[key as keyof Traits];
          return (
            <TraitBar 
              key={key} 
              label={`${trait.icon} ${trait.ta} (${trait.en})`} 
              value={value} 
            />
          );
        })}
      </StyledView>

      {/* Action Buttons */}
      <StyledView className="flex-row gap-3 mt-4 pt-4 border-t border-gold/10">
        <StyledTouchable
          className="flex-1 bg-[#4B2A8F] py-2.5 rounded-xl items-center flex-row justify-center"
          onPress={() => {
            Share.share({
              message: `${result.name1} ❤ ${result.name2} — ${result.percentage}% காதல் பொருத்தம்! (${result.verdict})\n\nஜோதிடம் ஆப்பில் சோதிக்கவும்.`,
            }).catch(() => {});
          }}
        >
          <Ionicons name="share-social" size={18} color="white" />
          <StyledText className="text-white text-sm font-sans font-bold ml-2">
            பகிர் / Share
          </StyledText>
        </StyledTouchable>
        <StyledTouchable
          className="flex-1 border border-gold py-2.5 rounded-xl items-center flex-row justify-center"
          onPress={() => onSave(result)}
        >
          <Ionicons name="heart" size={18} color="#e2b714" />
          <StyledText className="text-gold text-sm font-sans font-bold ml-2">
            சேமி / Save
          </StyledText>
        </StyledTouchable>
      </StyledView>
    </StyledView>
  );
}

// ============ Love Quote ============
function LoveQuote() {
  const quotes = [
    { ta: 'காதல் என்பது இதயத்தின் மொழி', en: 'Love is the language of the heart' },
    { ta: 'இரண்டு இதயங்கள் ஒன்று சேரும் போது', en: 'When two hearts become one' },
    { ta: 'காதல் எல்லா தடைகளையும் வெல்லும்', en: 'Love conquers all obstacles' }
  ];
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <StyledView className="bg-gold/10 rounded-xl p-4 border border-gold/20 mb-4">
      <StyledText className="text-gold text-sm font-serif text-center italic">
        "{randomQuote.ta}"
      </StyledText>
      <StyledText className="text-light-text/30 text-[10px] font-sans text-center mt-1">
        {randomQuote.en}
      </StyledText>
    </StyledView>
  );
}

// ============ Main Screen ============
export default function KadhalScreen({ navigation }: any) {
  const { user } = useAuth();
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { mutate: matchMutate, loading } = useMutation(kadhalApi.match);

  const handleSubmit = async () => {
    if (!name1.trim() || !name2.trim()) {
      notifyAlert('Error', 'இரு பெயர்களையும் உள்ளிடவும் / Enter both names');
      return;
    }
    try {
      const liveResult = await matchMutate({ name1: name1.trim(), name2: name2.trim() });
      setResult(liveResult);
    } catch (err) {
      notifyAlert('Error', getErrorMessage(err));
    }
  };

  const handleSaveResult = async (toSave: Result) => {
    try {
      const existing = await AsyncStorage.getItem(SAVED_MATCHES_KEY);
      const list = existing ? JSON.parse(existing) : [];
      list.unshift({ ...toSave, savedAt: new Date().toISOString() });
      await AsyncStorage.setItem(SAVED_MATCHES_KEY, JSON.stringify(list.slice(0, 20)));
      notifyAlert('Saved', 'காதல் பொருத்தம் சேமிக்கப்பட்டது / Match saved');
    } catch {
      notifyAlert('Error', 'சேமிக்க முடியவில்லை / Could not save');
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setResult(null);
    setName1('');
    setName2('');
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      
      {/* Header */}
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">
          ❤️ காதல் கணிப்பு
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
          className="flex-1 px-4 py-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e2b714" />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <StyledView className="mb-4">
            <StyledText className="text-gold text-2xl font-serif font-bold">
              ❤️ காதல் கணிப்பு
            </StyledText>
            <StyledText className="text-light-text/50 text-sm font-sans mt-1">
              இரு பெயர்களையும் கொடுத்து காதல் பொருத்தம் சதவீதம் கண்டறியுங்கள்
            </StyledText>
          </StyledView>

          {/* Love Quote */}
          <LoveQuote />

          {/* Form */}
          <StyledView className="bg-dark-card rounded-2xl p-5 border border-gold/10">
            {/* Name 1 */}
            <StyledView className="mb-4">
              <StyledText className="text-[#F4C0D1] text-sm font-sans mb-1">
                பெயர் 1 / Name 1
              </StyledText>
              <StyledInput
                className="bg-dark border border-gold/30 rounded-xl px-4 py-3 text-light-text"
                placeholder="உங்கள் பெயர் / Your name"
                placeholderTextColor="#666"
                value={name1}
                onChangeText={setName1}
                returnKeyType="next"
              />
            </StyledView>

            {/* Name 2 */}
            <StyledView className="mb-5">
              <StyledText className="text-[#B5D4F4] text-sm font-sans mb-1">
                பெயர் 2 / Name 2
              </StyledText>
              <StyledInput
                className="bg-dark border border-gold/30 rounded-xl px-4 py-3 text-light-text"
                placeholder="அவர்/அவள் பெயர் / Their name"
                placeholderTextColor="#666"
                value={name2}
                onChangeText={setName2}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </StyledView>

            {/* Submit Button */}
            <StyledTouchable
              className={`bg-gold rounded-xl py-4 items-center ${loading ? 'opacity-70' : ''}`}
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
                  ❤️ காதல் சதவீதம் கண்டறி / Find Love
                </StyledText>
              )}
            </StyledTouchable>
          </StyledView>

          {/* Result */}
          {result && <ResultCard result={result} onSave={handleSaveResult} />}

          {/* Footer */}
          <StyledView className="py-4 items-center">
            <StyledText className="text-light-text/20 text-[10px] font-sans">
              © {new Date().getFullYear()} Jothidam • Love Calculator
            </StyledText>
          </StyledView>
        </StyledScrollView>
      </StyledKeyboardView>
    </StyledSafeArea>
  );
}