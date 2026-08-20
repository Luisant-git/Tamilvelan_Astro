// JothidamUserApp/src/screens/user/LoginScreen.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { styled } from '../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/common/Logo';
import { notifyAlert } from '../../utils/alert';
import { getErrorMessage } from '../../services/client';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledInput = styled(TextInput);
const StyledTouchable = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeArea = styled(SafeAreaView);
const StyledKeyboardView = styled(KeyboardAvoidingView);

// Validation RegEx
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [identifierError, setIdentifierError] = useState('');

  // Handle identifier change (mobile or email)
  const handleIdentifierChange = (text: string) => {
    const digitsOnly = /^\d*$/.test(text);
    setIdentifier(digitsOnly ? text.slice(0, 10) : text.trim());
    setIdentifierError('');
  };

  // Send OTP
  const sendOtp = () => {
    const id = identifier.trim();
    if (!EMAIL_RE.test(id) && !MOBILE_RE.test(id)) {
      setIdentifierError('சரியான 10-இலக்க மொபைல் எண் அல்லது மின்னஞ்சல் தேவை');
      notifyAlert('Error', 'Enter a valid 10-digit mobile or email');
      return;
    }
    setOtpSent(true);
    notifyAlert('Success', 'OTP sent — use 1234');
  };

  // Handle Login
  const handleLogin = async () => {
    if (!identifier || !otp) {
      notifyAlert('Error', 'Identifier and OTP required');
      return;
    }
    setLoading(true);
    try {
      const user = await login(identifier.trim(), otp);
      notifyAlert('Success', `Welcome, ${user.name}!`);
      navigation.replace('Home');
    } catch (err) {
      notifyAlert('Error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      
      <StyledKeyboardView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <StyledScrollView 
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 20 }}
        >
          {/* Back to Home */}
          <StyledTouchable
            onPress={() => navigation.navigate('Home')}
            className="flex-row items-center self-start mb-4 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20"
            activeOpacity={0.7}
          >
            <Ionicons name="home-outline" size={16} color="#e2b714" />
            <StyledText className="text-gold text-xs font-sans ml-1.5">
              முகப்புக்கு திரும்பு / Back to Home
            </StyledText>
          </StyledTouchable>

          {/* Header with Back Button */}
          <StyledView className="flex-row items-center mb-6">
            {navigation.canGoBack() && (
              <StyledTouchable
                onPress={() => navigation.goBack()}
                className="w-10 h-10 rounded-full bg-gold/10 items-center justify-center"
              >
                <Ionicons name="arrow-back" size={22} color="#e2b714" />
              </StyledTouchable>
            )}
            <StyledText className="text-gold text-xl font-serif ml-3">
              Login
            </StyledText>
          </StyledView>

          {/* Logo */}
          <StyledView className="items-center mb-4">
            <Logo size={48} />
          </StyledView>

          {/* Title Section */}
          <StyledView className="mb-8">
            <StyledText className="text-gold text-3xl font-serif mb-1">
              உள்நுழைவு
            </StyledText>
            <StyledText className="text-light-text/60 text-sm font-sans">
              Login
            </StyledText>
            <StyledText className="text-light-text/40 text-xs mt-2 font-sans">
              OTP-மூலம் உள்நுழையவும்
            </StyledText>
            <StyledText className="text-light-text/30 text-xs font-sans">
              Sign in with OTP
            </StyledText>
          </StyledView>

          {/* Login Form */}
          <StyledView className="bg-dark-card rounded-2xl p-6 border border-gold/10 shadow-lg">
            {/* Identifier Input */}
            <StyledView className="mb-4">
              <StyledText className="text-light-text/80 text-sm font-sans mb-1">
                மொபைல் எண் அல்லது மின்னஞ்சல்
              </StyledText>
              <StyledText className="text-light-text/30 text-xs font-sans mb-2">
                Mobile Number or Email
              </StyledText>
              <StyledView className={`bg-dark border rounded-xl px-4 py-3 flex-row items-center ${
                identifierError ? 'border-red-500' : 'border-gold/30'
              }`}>
                <Ionicons 
                  name={identifier.length > 0 ? 'checkmark-circle' : 'mail-outline'} 
                  size={20} 
                  color={identifier.length > 0 ? '#4ecdc4' : '#666'} 
                />
                <StyledInput
                  className="flex-1 text-light-text ml-2 text-base"
                  placeholder="98xxxxxxxx  or  you@example.com"
                  placeholderTextColor="#666"
                  value={identifier}
                  onChangeText={handleIdentifierChange}
                  editable={!otpSent}
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {identifier.length > 0 && !otpSent && (
                  <StyledTouchable onPress={() => setIdentifier('')}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </StyledTouchable>
                )}
              </StyledView>
              {identifierError ? (
                <StyledText className="text-red-500 text-xs mt-1">{identifierError}</StyledText>
              ) : null}
            </StyledView>

            {/* Send OTP Button */}
            {!otpSent ? (
              <StyledTouchable
                className="bg-gold rounded-xl py-4 items-center"
                onPress={sendOtp}
                activeOpacity={0.8}
              >
                <StyledText className="text-dark font-bold text-base">
                  OTP அனுப்பு / Send OTP
                </StyledText>
              </StyledTouchable>
            ) : (
              <>
                {/* OTP Input */}
                <StyledView className="mb-4">
                  <StyledText className="text-light-text/80 text-sm font-sans mb-1">
                    OTP
                  </StyledText>
                  <StyledText className="text-light-text/30 text-xs font-sans mb-2">
                    One-time password
                  </StyledText>
                  <StyledView className="bg-dark border border-gold/30 rounded-xl px-4 py-3 flex-row items-center">
                    <Ionicons name="key-outline" size={20} color="#666" />
                    <StyledInput
                      className="flex-1 text-light-text ml-2 text-center text-xl tracking-widest"
                      placeholder="• • • •"
                      placeholderTextColor="#666"
                      value={otp}
                      onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
                      keyboardType="number-pad"
                      maxLength={6}
                      autoFocus
                    />
                    {otp.length > 0 && (
                      <StyledTouchable onPress={() => setOtp('')}>
                        <Ionicons name="close-circle" size={20} color="#666" />
                      </StyledTouchable>
                    )}
                  </StyledView>
                  <StyledText className="text-light-text/30 text-xs mt-2 text-center">
                    Dev OTP: 1234
                  </StyledText>
                </StyledView>

                {/* Login Button */}
                <StyledTouchable
                  className={`bg-gold rounded-xl py-4 items-center mb-3 ${
                    loading ? 'opacity-70' : ''
                  }`}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#1a1a2e" />
                      <StyledText className="text-dark font-bold text-base ml-2">
                        Logging in...
                      </StyledText>
                    </View>
                  ) : (
                    <StyledText className="text-dark font-bold text-base">
                      உள்நுழை / Login
                    </StyledText>
                  )}
                </StyledTouchable>

                {/* Change Button */}
                <StyledTouchable
                  className="border border-gold/30 rounded-xl py-3 items-center"
                  onPress={() => {
                    setOtpSent(false);
                    setOtp('');
                  }}
                  activeOpacity={0.7}
                >
                  <StyledText className="text-gold/70 text-sm font-sans">
                    மாற்று / Change
                  </StyledText>
                </StyledTouchable>
              </>
            )}

            {/* OTP Delivery Note */}
            {!otpSent && (
              <StyledView className="mt-3 px-3 py-2.5 rounded-xl bg-gold/5 border border-gold/15">
                <StyledText className="text-light-text/55 text-xs font-sans text-center leading-5">
                  குறிப்பு: OTP உங்கள் WhatsApp அல்லது SMS (குறுஞ்செய்தி) மூலம் அனுப்பப்படும். WhatsApp கிடைக்கவில்லை என்றால் OTP குறுஞ்செய்தியாக பெறப்படும்.
                </StyledText>
                <StyledText className="text-light-text/35 text-xs font-sans text-center mt-1.5 leading-4">
                  Note: OTP will be sent via WhatsApp or SMS. If WhatsApp delivery is unavailable, the OTP will be sent through SMS.
                </StyledText>
              </StyledView>
            )}

            {/* Register Link */}
            <StyledView className="mt-6 pt-4 border-t border-gold/10 items-center">
              <StyledText className="text-light-text/50 text-sm font-sans">
                புதியவரா? 
                <StyledText 
                  className="text-gold font-bold"
                  onPress={() => navigation.navigate('Register')}
                >
                  {' '}பதிவு செய்யுங்கள்
                </StyledText>
              </StyledText>
              <StyledText className="text-light-text/30 text-xs font-sans mt-1">
                New here? 
                <StyledText 
                  className="text-gold font-bold"
                  onPress={() => navigation.navigate('Register')}
                >
                  {' '}Register
                </StyledText>
              </StyledText>
            </StyledView>
          </StyledView>

          {/* Footer */}
          <StyledView className="mt-8 items-center">
            <StyledText className="text-light-text/20 text-xs font-sans">
              Jothidam • Secure Login
            </StyledText>
          </StyledView>
        </StyledScrollView>
      </StyledKeyboardView>
    </StyledSafeArea>
  );
}