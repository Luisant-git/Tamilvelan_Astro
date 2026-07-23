import { View, Text } from 'react-native';
import { styled } from '../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import BackButton from '../../components/common/BackButton';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledSafeArea = styled(SafeAreaView);

// Consultation now has a real screen (AstrologerListScreen) — only Payment
// stays a stub here, since no backend payment endpoint exists yet.
const TITLES: Record<string, { ta: string; en: string }> = {
  Payment: { ta: 'கட்டணம்', en: 'Payment' },
  'ask-astrologer': { ta: 'ஜோதிடர் பதில்', en: 'Ask Astrologer' },
};

export default function ComingSoonScreen({ navigation, route }: any) {
  const key = route?.params?.titleKey || route?.name;
  const title = TITLES[key] || { ta: 'விரைவில்', en: 'Coming Soon' };

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      <StyledView className="flex-row items-center px-4 pt-4">
        <BackButton navigation={navigation} />
      </StyledView>
      <StyledView className="flex-1 items-center justify-center px-8">
        <StyledText className="text-5xl mb-4">🔮</StyledText>
        <StyledText className="text-gold text-2xl font-serif font-bold text-center">
          {title.ta}
        </StyledText>
        <StyledText className="text-light-text/60 text-sm font-sans mt-1 text-center">
          {title.en}
        </StyledText>
        <StyledView className="bg-saffron/20 border border-saffron rounded-full px-4 py-1.5 mt-5">
          <StyledText className="text-saffron text-xs font-bold">விரைவில் — Coming Soon</StyledText>
        </StyledView>
      </StyledView>
    </StyledSafeArea>
  );
}
