import { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from '../../utils/styled';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Without this, an uncaught render error anywhere in the tree (e.g. a screen
// rendering a field the API didn't return) unmounts the whole RN root —
// which in a release build has no dev red-box to fall back to, so it looks
// exactly like the app closing. This catches it and shows a recoverable
// screen instead, matching the app's own theme, so no navigation/feature
// elsewhere is affected when nothing throws.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <StyledView className="flex-1 items-center justify-center px-6" style={{ backgroundColor: '#0D0620' }}>
          <StyledText className="text-gold text-lg font-serif font-bold text-center mb-2">
            ஏதோ தவறு நடந்தது
          </StyledText>
          <StyledText className="text-light-text/60 text-sm font-sans text-center mb-6">
            Something went wrong. Please try again.
          </StyledText>
          <StyledTouchable
            className="bg-gold px-6 py-3 rounded-full"
            onPress={this.reset}
          >
            <StyledText className="text-dark font-sans font-bold text-sm">
              மீண்டும் முயற்சி / Try Again
            </StyledText>
          </StyledTouchable>
        </StyledView>
      );
    }
    return this.props.children;
  }
}
