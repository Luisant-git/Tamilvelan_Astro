// JothidamUserApp/src/screens/user/NaalaiSirappuScreen.tsx
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
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../../components/common/BackButton';
import { notifyAlert } from '../../utils/alert';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeArea = styled(SafeAreaView);

// ============ Types ============
interface Panchang {
  date: string;
  isoDate: string;
  varam: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  rahuKalam: string;
  yamagandam: string;
  sunrise: string;
  sunset: string;
  shubhaMuhurtham: string;
  nallaNeram: { morning: string; evening: string };
  gowriNeram: { morning: string; evening: string };
  specialDay: string;
}

// ============ Helper Functions ============
function toISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getTomorrowDate(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

function getDateLong(date: Date): string {
  return date.toLocaleDateString('ta-IN', { 
    weekday: 'long', 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
}

// ============ Components ============

// 1. Row Component
function Row({ label, value }: { label: string; value?: string }) {
  return (
    <StyledView className="flex-row justify-between py-2.5 border-b border-gold/5">
      <StyledText className="text-light-text/60 text-sm font-sans">{label}</StyledText>
      <StyledText className="text-gold text-sm font-sans font-bold">{value || '—'}</StyledText>
    </StyledView>
  );
}

// 2. Detail Card
function DetailCard({ 
  children, 
  borderColor = 'border-gold/10',
  bgColor = 'bg-dark-card'
}: { 
  children: React.ReactNode; 
  borderColor?: string;
  bgColor?: string;
}) {
  return (
    <StyledView className={`${bgColor} rounded-2xl p-4 mb-3 border ${borderColor}`}>
      {children}
    </StyledView>
  );
}

// 3. Section Header
function SectionHeader({ 
  icon, 
  title, 
  subtitle, 
  color = 'text-gold'
}: { 
  icon: string; 
  title: string; 
  subtitle?: string;
  color?: string;
}) {
  return (
    <StyledView className="mb-3">
      <StyledView className="flex-row items-center gap-2">
        <StyledText className="text-lg">{icon}</StyledText>
        <StyledText className={`${color} text-sm font-sans font-bold`}>
          {title}
        </StyledText>
      </StyledView>
      {subtitle && (
        <StyledText className="text-light-text/30 text-[10px] font-sans mt-0.5">
          {subtitle}
        </StyledText>
      )}
    </StyledView>
  );
}

// ============ Main Screen ============
export default function NaalaiSirappuScreen({ navigation }: any) {
  const tomorrow = getTomorrowDate();
  const tomorrowISO = toISO(tomorrow);
  const dateLong = getDateLong(tomorrow);

  const [data, setData] = useState<Panchang | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPanchang = useCallback(async () => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setData({
        date: tomorrowISO,
        isoDate: tomorrowISO,
        varam: 'வெள்ளி',
        tithi: 'சுக்ல பிரதமை',
        nakshatra: 'ரோகிணி',
        yoga: 'விஷ்கும்பம்',
        karana: 'பவம்',
        rahuKalam: '7:30 - 9:00',
        yamagandam: '10:30 - 12:00',
        sunrise: '6:00 AM',
        sunset: '6:15 PM',
        shubhaMuhurtham: 'காலை 6:00 - 7:30, மாலை 4:30 - 6:00',
        nallaNeram: { morning: '6:00 - 7:30', evening: '4:30 - 6:00' },
        gowriNeram: { morning: '6:00 - 7:30', evening: '4:30 - 6:00' },
        specialDay: '🌺 திருவோணம் - அதிர்ஷ்ட நாள்'
      });
    } catch (err) {
      notifyAlert('Error', 'Could not load panchang data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tomorrowISO]);

  useEffect(() => {
    fetchPanchang();
  }, [fetchPanchang]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPanchang();
  }, [fetchPanchang]);

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      
      {/* Header */}
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">
          🌄 நாளைய சிறப்புகள்
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
            🌄 நாளைய சிறப்புகள்
          </StyledText>
          <StyledText className="text-light-text/50 text-sm font-sans mt-1">
            Tomorrow's Highlights
          </StyledText>
          <StyledText className="text-light-text/30 text-xs font-sans mt-0.5">
            {dateLong}
          </StyledText>
        </StyledView>

        {loading ? (
          <StyledView className="flex-1 items-center justify-center py-10">
            <ActivityIndicator size="large" color="#e2b714" />
            <StyledText className="text-light-text/50 text-sm font-sans mt-4">
              ஏற்றுகிறோம்... / Loading...
            </StyledText>
          </StyledView>
        ) : !data ? (
          <StyledView className="bg-dark-card rounded-2xl p-8 border border-gold/10 items-center">
            <Ionicons name="alert-circle-outline" size={40} color="#FF6B6B" />
            <StyledText className="text-[#FF6B6B] text-sm font-sans mt-3 text-center">
              பஞ்சாங்க தகவலை பெற முடியவில்லை.
            </StyledText>
            <StyledText className="text-light-text/30 text-[10px] font-sans mt-1">
              Could not load panchang.
            </StyledText>
          </StyledView>
        ) : (
          <>
            {/* Main Panchang Details */}
            <DetailCard>
              <Row label="வாரம் / Weekday" value={data.varam} />
              <Row label="திதி / Tithi" value={data.tithi} />
              <Row label="நட்சத்திரம் / Nakshatra" value={data.nakshatra} />
              <Row label="யோகம் / Yoga" value={data.yoga} />
              <Row label="கரணம் / Karana" value={data.karana} />
              <Row label="சூரிய உதயம் / Sunrise" value={data.sunrise} />
              <Row label="சூரிய அஸ்தமனம் / Sunset" value={data.sunset} />
            </DetailCard>

            {/* Avoid Timings */}
            <DetailCard 
              borderColor="border-[#FF6B6B33]"
              bgColor="bg-[#251450]"
            >
              <SectionHeader 
                icon="⚠️" 
                title="தவிர்க்க வேண்டிய நேரங்கள் / Avoid these hours"
                color="text-[#FF6B6B]"
              />
              <Row label="ராகு காலம் / Rahu Kalam" value={data.rahuKalam} />
              <Row label="யமகண்டம் / Yamagandam" value={data.yamagandam} />
            </DetailCard>

            {/* Auspicious Timings */}
            <DetailCard 
              borderColor="border-[#4CAF5033]"
              bgColor="bg-[#1A2A1A]"
            >
              <SectionHeader 
                icon="✨" 
                title="சுப முகூர்த்த நேரம் / Auspicious time"
                color="text-[#4CAF50]"
              />
              <StyledText className="text-gold text-sm font-sans mb-3">
                {data.shubhaMuhurtham}
              </StyledText>
              
              <StyledView className="flex-row gap-4">
                <StyledView className="flex-1">
                  <StyledText className="text-light-text/40 text-[10px] font-sans">
                    நல்ல நேரம் காலை
                  </StyledText>
                  <StyledText className="text-gold text-sm font-sans font-bold">
                    {data.nallaNeram.morning}
                  </StyledText>
                </StyledView>
                <StyledView className="flex-1">
                  <StyledText className="text-light-text/40 text-[10px] font-sans">
                    நல்ல நேரம் மாலை
                  </StyledText>
                  <StyledText className="text-gold text-sm font-sans font-bold">
                    {data.nallaNeram.evening}
                  </StyledText>
                </StyledView>
              </StyledView>
            </DetailCard>

            {/* Special Day */}
            {!!data.specialDay && (
              <DetailCard borderColor="border-[#FFD70044]">
                <SectionHeader 
                  icon="🎉" 
                  title="சிறப்பு நாள் / Special day"
                />
                <StyledText className="text-light-text text-sm font-sans leading-relaxed">
                  {data.specialDay}
                </StyledText>
              </DetailCard>
            )}

            {/* Action Buttons */}
            <StyledView className="flex-row gap-3 mb-4">
              <StyledTouchable
                className="flex-1 border border-gold/30 py-3 rounded-xl items-center"
                onPress={() => navigation.navigate('panchang')}
              >
                <StyledText className="text-gold text-sm font-sans font-bold">
                  📅 இன்றைய பஞ்சாங்கம்
                </StyledText>
              </StyledTouchable>
              <StyledTouchable
                className="flex-1 border border-gold/30 py-3 rounded-xl items-center"
                onPress={() => navigation.navigate('panchang', { date: tomorrowISO })}
              >
                <StyledText className="text-gold text-sm font-sans font-bold">
                  📖 முழு பஞ்சாங்கம்
                </StyledText>
              </StyledTouchable>
            </StyledView>
          </>
        )}

        {/* Footer */}
        <StyledView className="py-2 items-center">
          <StyledText className="text-light-text/20 text-[10px] font-sans">
            © {new Date().getFullYear()} Jothidam • Tomorrow's Panchang
          </StyledText>
        </StyledView>
      </StyledScrollView>
    </StyledSafeArea>
  );
}