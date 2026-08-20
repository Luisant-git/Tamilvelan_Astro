// Uses the same brand artwork as the app icon/favicon (assets/icon.png,
// sourced from Applogo.png) so the in-app header matches what's shown on
// the device home screen and browser tab — previously this rendered a
// separate hand-drawn SVG that mirrored the website's own logo component,
// which had drifted out of sync with the app's actual icon.
import { View, Text, Image } from 'react-native';
import { styled } from '../../utils/styled';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';

const StyledView = styled(View);
const StyledText = styled(Text);

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  wordmarkColor?: string;
  animated?: boolean;
}

export default function Logo({ size = 48, showWordmark = false, wordmarkColor = '#FFD700', animated = true }: LogoProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!animated) return;
    scale.value = withRepeat(
      withTiming(1.04, { duration: 1750, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const mark = (
    <Image
      source={require('../../../assets/icon.png')}
      style={{ width: size, height: size, borderRadius: size * 0.18 }}
      resizeMode="contain"
    />
  );

  return (
    <StyledView className="flex-row items-center" style={{ gap: 10 }}>
      {animated ? <Animated.View style={animatedStyle}>{mark}</Animated.View> : mark}
      {showWordmark && (
        <StyledView>
          <StyledText className="font-serif font-bold" style={{ color: wordmarkColor, fontSize: size * 0.42 }}>
            தமிழ்வேலன்
          </StyledText>
          <StyledText className="font-sans" style={{ color: '#A89BC8', fontSize: size * 0.22, marginTop: 2 }}>
            TamilVelan
          </StyledText>
        </StyledView>
      )}
    </StyledView>
  );
}
