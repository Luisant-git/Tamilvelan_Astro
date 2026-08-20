// JothidamUserApp/src/screens/user/RegisterScreen.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { styled } from '../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useRef } from 'react';
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
const MOBILE_RE = /^[6-9]\d{9}$/;

interface FormData {
  name: string;
  mobile: string;
  otp: string;
}

// Backend registration still requires a valid, unique email even though the
// UI no longer collects one — derive a stable per-mobile placeholder so OTP
// registration works without surfacing an email field to the user.
const placeholderEmail = (mobile: string) => `${mobile}@no-email.jothidam.app`;

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [form, setForm] = useState<FormData>({
    name: '',
    mobile: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Refs for focus management
  const nameInput = useRef<TextInput>(null);
  const mobileInput = useRef<TextInput>(null);
  const otpInput = useRef<TextInput>(null);

  // Handle form changes
  const handleChange = (field: keyof FormData, value: string) => {
    let formattedValue = value;
    if (field === 'otp') {
      formattedValue = value.replace(/\D/g, '').slice(0, 6);
    } else if (field === 'mobile') {
      formattedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    setForm({ ...form, [field]: formattedValue });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  // Validate form — mobile is the only required field; name is optional
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!MOBILE_RE.test(form.mobile)) newErrors.mobile = 'சரியான 10-இலக்க மொபைல் / Valid 10-digit mobile';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Send OTP
  const sendOtp = () => {
    Keyboard.dismiss();
    if (!validateForm()) return;

    setOtpSent(true);
    notifyAlert('Success', 'OTP sent — use 1234');
  };

  // Handle Registration
  const handleRegister = async () => {
    if (!form.otp) {
      notifyAlert('Error', 'OTP required');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name: form.name.trim() || 'User',
        mobile: form.mobile,
        email: placeholderEmail(form.mobile),
        otp: form.otp
      });
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
          {/* Header with Back Button */}
          <StyledView className="flex-row items-center mb-6">
            {navigation.canGoBack() && (
              <StyledTouchable
                onPress={() => navigation.goBack()}
                className="w-10 h-10 rounded-full bg-gold/10 items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={22} color="#e2b714" />
              </StyledTouchable>
            )}
            <StyledText className="text-gold text-xl font-serif ml-3">
              Register
            </StyledText>
          </StyledView>

          {/* Logo */}
          <StyledView className="items-center mb-4">
            <Logo size={48} />
          </StyledView>

          {/* Title Section */}
          <StyledView className="mb-8">
            <StyledText className="text-gold text-3xl font-serif mb-1">
              புதிய பதிவு
            </StyledText>
            <StyledText className="text-light-text/60 text-sm font-sans">
              Register
            </StyledText>
            <StyledText className="text-light-text/40 text-xs mt-2 font-sans">
              OTP-மூலம் இலவசமாக கணக்கு உருவாக்குங்கள்
            </StyledText>
            <StyledText className="text-light-text/30 text-xs font-sans">
              Create a free account with OTP
            </StyledText>
          </StyledView>

          {/* Registration Form */}
          <StyledView className="bg-dark-card rounded-2xl p-6 border border-gold/10 shadow-lg">
            
            {/* Full Name (optional) */}
            <StyledView className="mb-4">
              <StyledText className="text-light-text/80 text-sm font-sans mb-1">
                முழு பெயர் <StyledText className="text-light-text/40 text-xs">(விருப்பத்தேர்வு)</StyledText>
              </StyledText>
              <StyledText className="text-light-text/30 text-xs font-sans mb-2">
                Full Name (optional)
              </StyledText>
              <StyledView className={`bg-dark border rounded-xl px-4 py-3 flex-row items-center ${
                errors.name ? 'border-red-500' : 'border-gold/30'
              }`}>
                <Ionicons name="person-outline" size={20} color="#666" />
                <StyledInput
                  ref={nameInput}
                  className="flex-1 text-light-text ml-2 text-base"
                  placeholder="உங்கள் பெயர் / Your name"
                  placeholderTextColor="#666"
                  value={form.name}
                  onChangeText={(text) => handleChange('name', text)}
                  editable={!otpSent}
                  returnKeyType="next"
                  onSubmitEditing={() => mobileInput.current?.focus()}
                />
                {form.name.length > 0 && !otpSent && (
                  <StyledTouchable onPress={() => handleChange('name', '')}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </StyledTouchable>
                )}
              </StyledView>
              {!!errors.name && (
                <StyledText className="text-red-500 text-xs mt-1">{errors.name}</StyledText>
              )}
            </StyledView>

            {/* Mobile Number (primary, required) */}
            <StyledView className={`mb-${otpSent ? '4' : '6'}`}>
              <StyledText className="text-light-text/80 text-sm font-sans mb-1">
                மொபைல் எண் <StyledText className="text-gold">*</StyledText>
              </StyledText>
              <StyledText className="text-light-text/30 text-xs font-sans mb-2">
                Mobile Number (required)
              </StyledText>
              <StyledView className={`bg-dark border rounded-xl px-4 py-3 flex-row items-center ${
                errors.mobile ? 'border-red-500' : 'border-gold/30'
              }`}>
                <Ionicons name="call-outline" size={20} color="#666" />
                <StyledInput
                  ref={mobileInput}
                  className="flex-1 text-light-text ml-2 text-base"
                  placeholder="98xxxxxxxx"
                  placeholderTextColor="#666"
                  value={form.mobile}
                  onChangeText={(text) => handleChange('mobile', text)}
                  editable={!otpSent}
                  keyboardType="phone-pad"
                  maxLength={10}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    if (!otpSent) sendOtp();
                  }}
                />
                {form.mobile.length > 0 && !otpSent && (
                  <StyledTouchable onPress={() => handleChange('mobile', '')}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </StyledTouchable>
                )}
              </StyledView>
              {!!errors.mobile && (
                <StyledText className="text-red-500 text-xs mt-1">{errors.mobile}</StyledText>
              )}
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
                      ref={otpInput}
                      className="flex-1 text-light-text ml-2 text-center text-xl tracking-widest"
                      placeholder="• • • •"
                      placeholderTextColor="#666"
                      value={form.otp}
                      onChangeText={(text) => handleChange('otp', text)}
                      keyboardType="number-pad"
                      maxLength={6}
                      autoFocus
                    />
                    {form.otp.length > 0 && (
                      <StyledTouchable onPress={() => handleChange('otp', '')}>
                        <Ionicons name="close-circle" size={20} color="#666" />
                      </StyledTouchable>
                    )}
                  </StyledView>
                  <StyledText className="text-light-text/30 text-xs mt-2 text-center">
                    Dev OTP: 1234
                  </StyledText>
                </StyledView>

                {/* Register Button */}
                <StyledTouchable
                  className={`bg-gold rounded-xl py-4 items-center mb-3 ${
                    loading ? 'opacity-70' : ''
                  }`}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#1a1a2e" />
                      <StyledText className="text-dark font-bold text-base ml-2">
                        Registering...
                      </StyledText>
                    </View>
                  ) : (
                    <StyledText className="text-dark font-bold text-base">
                      பதிவு செய் / Register
                    </StyledText>
                  )}
                </StyledTouchable>

                {/* Edit Details Button */}
                <StyledTouchable
                  className="border border-gold/30 rounded-xl py-3 items-center"
                  onPress={() => {
                    setOtpSent(false);
                    setForm({ ...form, otp: '' });
                  }}
                  activeOpacity={0.7}
                >
                  <StyledText className="text-gold/70 text-sm font-sans">
                    திருத்து / Edit details
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

            {/* Login Link */}
            <StyledView className="mt-6 pt-4 border-t border-gold/10 items-center">
              <StyledText className="text-light-text/50 text-sm font-sans">
                ஏற்கனவே கணக்கு உள்ளதா?
                <StyledText 
                  className="text-gold font-bold"
                  onPress={() => navigation.navigate('Login')}
                >
                  {' '}உள்நுழையுங்கள்
                </StyledText>
              </StyledText>
              <StyledText className="text-light-text/30 text-xs font-sans mt-1">
                Already have an account?
                <StyledText 
                  className="text-gold font-bold"
                  onPress={() => navigation.navigate('Login')}
                >
                  {' '}Login
                </StyledText>
              </StyledText>
            </StyledView>
          </StyledView>

          {/* Footer */}
          <StyledView className="mt-8 items-center">
            <StyledText className="text-light-text/20 text-xs font-sans">
              Jothidam • Secure Registration
            </StyledText>
          </StyledView>
        </StyledScrollView>
      </StyledKeyboardView>
    </StyledSafeArea>
  );
}