// JothidamUserApp/src/screens/user/AriggaiScreen.tsx
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { styled } from '../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../../components/common/BackButton';
import { useAuth } from '../../context/AuthContext';
import { reportsApi } from '../../services/reports.api';
import { useFetch } from '../../hooks';
import { confirmAlert } from '../../utils/alert';
import type { Report } from '../../types/reports.types';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const StyledSafeArea = styled(SafeAreaView);

// ============ Report Card Component ============
function ReportCard({ 
  report, 
  onBuy 
}: { 
  report: Report; 
  onBuy: (report: Report) => void;
}) {
  return (
    <StyledView className="bg-dark-card rounded-2xl p-5 mb-4 border border-gold/10">
      <StyledText className="text-gold text-base font-serif font-bold mb-1.5">
        {report.name}
      </StyledText>
      
      <StyledText className="text-light-text/60 text-sm font-sans leading-relaxed mb-4 flex-1">
        {report.description}
      </StyledText>
      
      <StyledView className="flex-row justify-between items-center pt-3 border-t border-gold/10">
        <StyledText className="text-[#FF8C00] text-xl font-bold">
          ₹{report.price}
        </StyledText>
        <StyledTouchable
          className="bg-gold px-5 py-2 rounded-lg"
          onPress={() => onBuy(report)}
        >
          <StyledText className="text-dark text-sm font-bold">
            வாங்க / Buy
          </StyledText>
        </StyledTouchable>
      </StyledView>
    </StyledView>
  );
}

// ============ Main Screen ============
export default function AriggaiScreen({ navigation }: any) {
  const { user } = useAuth();
  const { data, loading, refreshing, error, refetch } = useFetch(reportsApi.list, []);
  const reports = data || [];

  const onRefresh = () => {
    refetch();
  };

  const handleBuy = (report: Report) => {
    if (!user) {
      confirmAlert(
        'Login Required',
        'வாங்க உள்நுழைய வேண்டும் / Please login to purchase',
        () => navigation.navigate('Login'),
        'Login',
        'Cancel'
      );
      return;
    }

    confirmAlert(
      'Purchase',
      `${report.name} - ₹${report.price}\n\nDo you want to proceed with payment?`,
      () => navigation.navigate('Payment', { reportId: report.id }),
      'Buy Now',
      'Cancel'
    );
  };

  const renderReport = ({ item }: { item: Report }) => (
    <ReportCard report={item} onBuy={handleBuy} />
  );

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      
      {/* Header */}
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">
          📄 ஜோதிட அறிக்கைகள்
        </StyledText>
      </StyledView>

      {/* Content */}
      {loading ? (
        <StyledView className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#e2b714" />
          <StyledText className="text-light-text/60 mt-4">ஏற்றுகிறோம்...</StyledText>
        </StyledView>
      ) : error ? (
        <StyledView className="flex-1 items-center justify-center px-4">
          <Ionicons name="alert-circle-outline" size={60} color="#FF6B6B" />
          <StyledText className="text-[#FF6B6B] text-center mt-4">{error}</StyledText>
          <StyledTouchable className="border border-gold/30 rounded-full px-5 py-2 mt-4" onPress={refetch}>
            <StyledText className="text-gold text-sm font-sans">மீண்டும் முயற்சி / Try Again</StyledText>
          </StyledTouchable>
        </StyledView>
      ) : reports.length === 0 ? (
        <StyledView className="flex-1 items-center justify-center px-4">
          <Ionicons name="document-text-outline" size={60} color="#e2b714" />
          <StyledText className="text-light-text/60 text-center mt-4">
            அறிக்கைகள் இல்லை
          </StyledText>
          <StyledText className="text-light-text/40 text-center text-sm">
            No reports available at the moment
          </StyledText>
        </StyledView>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderReport}
          contentContainerClassName="px-4 py-4"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#e2b714"
            />
          }
          ListHeaderComponent={
            <StyledView className="mb-4">
              <StyledText className="text-gold text-2xl font-serif font-bold">
                📄 ஜோதிட அறிக்கைகள்
              </StyledText>
              <StyledText className="text-light-text/50 text-sm font-sans mt-1">
                தமிழில் PDF அறிக்கை — கட்டணம் செலுத்தி பதிவிறக்கம் செய்யுங்கள்
              </StyledText>
              <StyledText className="text-light-text/30 text-xs font-sans mt-1">
                Tamil PDF Reports — Purchase & Download
              </StyledText>
            </StyledView>
          }
          ListFooterComponent={
            <StyledView className="py-4 items-center">
              <StyledText className="text-light-text/20 text-[10px] font-sans">
                © {new Date().getFullYear()} Jothidam • All reports are PDF format
              </StyledText>
            </StyledView>
          }
        />
      )}
    </StyledSafeArea>
  );
}