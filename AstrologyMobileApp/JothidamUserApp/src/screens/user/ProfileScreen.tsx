// JothidamUserApp/src/screens/user/ProfileScreen.tsx
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { styled } from '../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/common/BackButton';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeArea = styled(SafeAreaView);

function MenuRow({
  icon,
  ta,
  en,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  ta: string;
  en: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <StyledTouchable
      className="flex-row items-center bg-dark-card rounded-2xl px-4 py-3.5 mb-2.5 border border-gold/10"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <StyledView
        className="w-9 h-9 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: danger ? 'rgba(255,107,107,0.12)' : 'rgba(255,215,0,0.1)' }}
      >
        <Ionicons name={icon} size={18} color={danger ? '#FF6B6B' : '#FFD700'} />
      </StyledView>
      <StyledView className="flex-1">
        <StyledText className={danger ? 'text-[#FF6B6B] font-sans font-bold' : 'text-light-text font-sans font-bold'}>
          {ta}
        </StyledText>
        <StyledText className="text-light-text/40 text-xs font-sans">{en}</StyledText>
      </StyledView>
      {!danger && <Ionicons name="chevron-forward" size={18} color="#8B7BAA" />}
    </StyledTouchable>
  );
}

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  const handleLogout = () => setLogoutDialogVisible(true);

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">
          சுயவிவரம் / Profile
        </StyledText>
      </StyledView>
      <StyledScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <StyledView
          className="px-4 pt-6 pb-8 items-center"
          style={{ backgroundColor: '#251450' }}
        >
          <StyledView className="w-20 h-20 rounded-full bg-gold/15 border-2 border-gold items-center justify-center mb-3">
            <Ionicons name={user ? 'person' : 'person-outline'} size={36} color="#FFD700" />
          </StyledView>
          {user ? (
            <>
              <StyledText className="text-gold text-xl font-serif font-bold">{user.name}</StyledText>
              <StyledText className="text-light-text/50 text-xs font-sans mt-1">{user.email || user.mobile}</StyledText>
            </>
          ) : (
            <>
              <StyledText className="text-gold text-xl font-serif font-bold">விருந்தினர் பயனர்</StyledText>
              <StyledText className="text-light-text/50 text-xs font-sans mt-1">Guest — not signed in</StyledText>
            </>
          )}
        </StyledView>

        <StyledView className="px-4 pt-5 pb-10">
          {!user ? (
            <StyledView className="flex-row mb-5" style={{ gap: 10 }}>
              <StyledTouchable
                className="flex-1 bg-gold rounded-xl py-3.5 items-center"
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.8}
              >
                <StyledText className="text-dark font-bold">உள்நுழை / Login</StyledText>
              </StyledTouchable>
              <StyledTouchable
                className="flex-1 border border-gold rounded-xl py-3.5 items-center"
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.8}
              >
                <StyledText className="text-gold font-bold">பதிவு / Register</StyledText>
              </StyledTouchable>
            </StyledView>
          ) : null}

          <StyledText className="text-light-text/40 text-xs font-sans mb-2 ml-1">
            கணக்கு — Account
          </StyledText>
          <MenuRow
            icon="bookmark-outline"
            ta="என் ஜாதகம்"
            en="My Horoscope"
            onPress={() => navigation.navigate('jathagam')}
          />
          <MenuRow
            icon="calendar-outline"
            ta="இன்றைய பஞ்சாங்கம்"
            en="Today's Panchang"
            onPress={() => navigation.navigate('panchang')}
          />
          {/* ஜோதிடர் ஆலோசனை / Astrologer Consultation MenuRow hidden per
              explicit request. */}

          {user && (
            <>
              <StyledText className="text-light-text/40 text-xs font-sans mb-2 mt-4 ml-1">
                வரலாறு — History
              </StyledText>
              <MenuRow
                icon="time-outline"
                ta="என் ஜாதக வரலாறு"
                en="My Horoscope History"
                onPress={() => navigation.navigate('jathagam-history')}
              />
              <MenuRow
                icon="heart-outline"
                ta="பொருத்த வரலாறு"
                en="Match History"
                onPress={() => navigation.navigate('porutham-history')}
              />
              <MenuRow
                icon="briefcase-outline"
                ta="ஆலோசனை பதிவுகள்"
                en="My Bookings"
                onPress={() => navigation.navigate('aalosanai-history')}
              />
            </>
          )}

          {user ? (
            <StyledView className="mt-2">
              <MenuRow icon="log-out-outline" ta="வெளியேறு" en="Logout" onPress={handleLogout} danger />
            </StyledView>
          ) : null}

          <StyledView className="items-center mt-6">
            <StyledText className="text-light-text/20 text-[10px] font-sans">
              Jothidam • v1.0.0
            </StyledText>
          </StyledView>
        </StyledView>
      </StyledScrollView>

      <ConfirmDialog
        visible={logoutDialogVisible}
        icon="log-out-outline"
        variant="danger"
        title="Logout / வெளியேறு"
        messageEn="Are you sure you want to logout?"
        messageTa="நீங்கள் வெளியேற விரும்புகிறீர்களா?"
        cancelLabel="Cancel / ரத்து செய்"
        confirmLabel="Logout / வெளியேறு"
        onCancel={() => setLogoutDialogVisible(false)}
        onConfirm={() => {
          setLogoutDialogVisible(false);
          logout();
        }}
      />
    </StyledSafeArea>
  );
}
