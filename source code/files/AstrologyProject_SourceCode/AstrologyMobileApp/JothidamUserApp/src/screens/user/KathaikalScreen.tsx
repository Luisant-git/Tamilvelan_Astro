// JothidamUserApp/src/screens/user/KathaikalScreen.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  LayoutAnimation,
  UIManager,
  Platform
} from 'react-native';
import { styled } from '../../utils/styled';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../../components/common/BackButton';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeArea = styled(SafeAreaView);

// ============ Types ============
type Category = 'puranic' | 'festival' | 'rasi' | 'remedy';

interface Story {
  id: string;
  category: Category;
  titleTa: string;
  titleEn: string;
  bodyTa: string[];
  bodyEn: string;
}

// ============ Constants ============
const COLORS = {
  card: '#251450',
  surface: '#1A0E3A',
  border: '#4B2A8F',
  divider: '#32205A',
  gold: '#FFD700',
  saffron: '#FF8C00',
  text: '#F5F0FF',
  muted: '#A89BC8',
  subtle: '#8B7BAA',
  green: '#4CAF50',
  red: '#FF6B6B'
};

const CATEGORIES: Array<{ key: Category | 'all'; ta: string; en: string; icon: string }> = [
  { key: 'all', ta: 'அனைத்தும்', en: 'All', icon: '📚' },
  { key: 'puranic', ta: 'புராணம்', en: 'Puranic', icon: '🕉' },
  { key: 'festival', ta: 'பண்டிகை', en: 'Festival', icon: '🪔' },
  { key: 'rasi', ta: 'ராசி', en: 'Rasi', icon: '⭐' },
  { key: 'remedy', ta: 'பரிகாரம்', en: 'Remedy', icon: '🌿' }
];

// ============ Stories Data (Full) ============
const STORIES: Story[] = [
  {
    id: 'vinayaka-chaturthi',
    category: 'puranic',
    titleTa: 'விநாயக சதுர்த்தி — யானை முகம் கொண்ட கதை',
    titleEn: 'Vinayaka Chaturthi — The Story of the Elephant Head',
    bodyTa: [
      'பார்வதி தேவி தனது குழந்தைக்கு காவலாக ஒரு பையனை மஞ்சளில் வடித்து உயிர் கொடுத்தாள். அப்பையன், தாயின் ஆணைப்படி, யாரும் உள்ளே நுழைய விடாமல் வாயிலைக் காத்து நின்றான். அப்போது வந்த சிவபெருமான், தம்மை அறியாமல் தடுத்த அக்குழந்தையின் தலையை கோபத்தில் வெட்டினார்.',
      'பின்னர் பார்வதியின் சோகம் கண்டு, சிவன் வழியில் முதலில் சந்தித்த ஒரு யானையின் தலையை அக்குழந்தைக்கு பொருத்தி, விநாயகர் என்ற பெயரோடு அனைத்து தெய்வங்களின் தலைமை தேவராக ஆசிர்வதித்தார். அதனால் எந்த சுப காரியத்திற்கு முன்னும் முதலில் பிள்ளையாரை வணங்குகிறோம்.',
      'விநாயக சதுர்த்தி அன்று — பத்திரிக்கைகள், முளைப்பாரி, கொழுக்கட்டை, தாங்கி வைக்கும் தேங்காய் என அனைத்தும் சேர்ந்து விக்னேஸ்வரனுக்கு வழிபடுகிறோம். தடைகள் (விக்னங்கள்) நீங்கி, புதிய தொடக்கங்கள் சுபமாக நடைபெறும்.'
    ],
    bodyEn: 'Parvati Devi created a boy from turmeric paste to guard her door. When Shiva returned and was blocked by this unknown boy, he beheaded him in anger. To console Parvati, Shiva replaced the head with that of the first being he met — an elephant. Thus Ganesha was born, and worshipped first before any auspicious undertaking to remove obstacles (vighnas).'
  },
  {
    id: 'maha-shivaratri',
    category: 'puranic',
    titleTa: 'மகா சிவராத்திரி — ஒரே இரவில் முக்தி',
    titleEn: 'Maha Shivaratri — Liberation in One Night',
    bodyTa: [
      'மாசி மாதம் அமாவாசை அன்று — ஒரு வேடன் காட்டில் வழி தவறி, ஒரு வில்வ மரத்தின் மீது ஏறி இரவைக் கழித்தான். ஒவ்வொரு முறை அசையும்போதும் வில்வ இலைகள் கீழே ஒரு லிங்கத்தின் மேல் விழுந்தன. அந்த லிங்கம் சிவலிங்கம் என்பது அவனுக்குத் தெரியாது.',
      'அறியாமலேயே நடந்த அந்த இரவு வழிபாட்டால், அவ்வேடனின் வாழ்நாள் முழுவதும் செய்த தவறுகள் கரைந்தன. சிவபெருமான் அவருக்கு முக்தி அளித்தார்.',
      'அதனால் சிவராத்திரி அன்று இரவு முழுவதும் விழித்திருந்து, வில்வ இலைகளால் சிவ வழிபாடு செய்கிறோம். ஒரே இரவில் ஆன்மீக மாற்றம் சாத்தியம் என்ற செய்தியை இக்கதை சொல்கிறது.'
    ],
    bodyEn: 'On the new-moon night of Maasi, a hunter lost in the forest climbed a bilva tree. As he shifted through the night, leaves fell on an unseen Shivalinga below. This unwitting all-night worship erased a lifetime of sins, and Shiva granted him moksha — symbolizing that one night of true devotion can transform a life.'
  },
  {
    id: 'deepavali',
    category: 'festival',
    titleTa: 'தீபாவளி — நரகாசுர வதம்',
    titleEn: 'Deepavali — The Slaying of Narakasura',
    bodyTa: [
      'நரகாசுரன் என்ற கொடிய அசுரன் — பூமி தேவியின் மகனாகப் பிறந்தாலும் — தனது வரத்தின் வலிமையில் தேவர்களையும், 16,000 பெண்களையும் சிறை வைத்திருந்தான். ஸ்ரீ கிருஷ்ணரும் அவரது மனைவி சத்யபாமாவும் சேர்ந்து போரிட்டு, ஐப்பசி மாதம் அமாவாசையின் முதல் நாள் அவனை வென்றனர்.',
      'விடிகாலையில் — விடுவிக்கப்பட்ட மக்கள், தங்கள் வீடுகளில் தீபம் ஏற்றி, கங்கா ஸ்நானம் செய்து, புதிய ஆடைகள் அணிந்து கொண்டாடினர். அதுவே தீபாவளியின் முதல் கொண்டாட்டம்.',
      'நாம் இன்றும் கங்கா ஸ்நானம் (எண்ணெய் தேய்த்துக் குளித்தல்), புது உடை, மாலை தீபங்கள், இனிப்பு பகிர்வு என அதே மரபை தொடர்கிறோம். இருளை வென்ற ஒளியின் வெற்றியே தீபாவளி.'
    ],
    bodyEn: 'The demon Narakasura, despite being earth-born, imprisoned the devas and 16,000 women through the power of his boon. Krishna and his wife Satyabhama defeated him on the day before Aipasi new moon. The freed people celebrated at dawn with oil baths, new clothes, and lamps — the first Deepavali, the victory of light over darkness.'
  },
  {
    id: 'pongal',
    category: 'festival',
    titleTa: 'பொங்கல் — உழவர் திருநாள்',
    titleEn: "Pongal — The Farmer's Festival",
    bodyTa: [
      'தை மாதம் முதல் நாள் — சூரியன் தென்பால் (தக்ஷிணாயனம்) போய், வடக்கு நோக்கி (உத்தராயணம்) திரும்பும் நாள். இது தமிழர்களின் அறுவடைத் திருநாள் — ஆண்டு முழுவதும் உழுத, விதைத்த, பாதுகாத்த உழவர்களின் கதையாக கொண்டாடப்படுகிறது.',
      'புதிய அரிசி, பால், சர்க்கரை, மஞ்சள் சேர்த்து களி மண் பானையில் சமைக்கிறோம். பால் பொங்கி வழியும்போது "பொங்கலோ பொங்கல்!" என்று கூவுகிறோம் — செழிப்பு உச்சத்தை அடைகிறது என்பதை குறிக்கிறது.',
      'மறுநாள் மாட்டுப் பொங்கல் — ஆண்டு முழுவதும் உழைத்த மாடுகளை அலங்கரித்து, பூஜித்து, அதிக உணவளிக்கிறோம். மூன்றாவது நாள் காணும் பொங்கல் — உறவினர்களை சந்தித்து புது வாழ்த்து வழங்கும் நாள்.'
    ],
    bodyEn: 'Falling on the first day of Thai — when the sun shifts from Dakshinayana to Uttarayana — Pongal is the Tamil farmer\'s harvest festival. New rice cooked in milk and jaggery is allowed to boil over while we cry "Pongalo Pongal!", symbolizing overflowing prosperity. Day two honors the cattle, and day three is for family visits.'
  },
  {
    id: 'mesham-origin',
    category: 'rasi',
    titleTa: 'மேஷ ராசி — பொற்செம்மறி கதை',
    titleEn: 'Mesha (Aries) — The Golden Ram',
    bodyTa: [
      'ஒரு பழங்கதையில் — மாற்றாந்தாயின் கடுங்கோபத்திலிருந்து இரண்டு குழந்தைகளைக் காப்பாற்ற, பறக்கும் பொற்செம்மறியாட்டை தேவர்கள் அனுப்பினர். அந்த ஆடு குழந்தைகளை முதுகில் ஏற்றி வானம் வழியாகப் பறந்து, பாதுகாப்பான இடம் சேர்த்தது.',
      'அதன் வீரத்திற்காக, அந்த பொற்செம்மறியின் தோல் இந்திரனுக்கு வழங்கப்பட்டது — பின்னர் தேவர்கள் அதை வானத்தில் ஒரு நட்சத்திர மண்டலமாக நிலைநிறுத்தினர். அதுவே மேஷ ராசி.',
      'மேஷ ராசியின் பண்புகள் — தைரியம், முன்னெடுத்துச் செல்லும் தலைமை, துடிப்பான ஆற்றல், அஞ்சாமை. செவ்வாய் (மங்கள்) கிரகம் ஆட்சி செய்கிறது.'
    ],
    bodyEn: "In an ancient tale, a winged golden ram was sent by the devas to rescue two children from a vengeful stepmother. Bearing them across the sky, it saved their lives. The ram's golden fleece was then placed among the stars as the constellation Aries — Mesha — symbolizing courage, leadership, and pioneering energy. Ruled by Mars."
  },
  {
    id: 'rishabam-origin',
    category: 'rasi',
    titleTa: 'ரிஷப ராசி — நந்தியின் கதை',
    titleEn: 'Rishabam (Taurus) — The Tale of Nandi',
    bodyTa: [
      'நந்தி — சிவ பெருமானின் வாகனம், மற்றும் அவரது மிக நெருங்கிய பக்தர். அவர் தினமும் சிவலிங்கத்திற்கு முன் அமைதியாக அமர்ந்து, பெரும் தவம் இருந்தார். அந்த நிலையான பக்தியின் வடிவமாகவே ரிஷப ராசி வானத்தில் நிற்கிறது.',
      'ரிஷபம் என்றால் காளை — பூமியில் வேரூன்றிய நிலையான ஆற்றலின் சின்னம். இந்த ராசியில் பிறந்தவர்கள் — அமைதியான பொறுமை, உறுதியான விசுவாசம், பொருளாதார உள்ளுணர்வு கொண்டவர்களாக இருப்பார்கள்.',
      'சுக்கிரன் (வீனஸ்) ஆட்சி செய்யும் ராசி. கலை, இசை, சுவையான உணவு, அழகான பொருட்கள் மீது இயல்பான ஈர்ப்பு ஏற்படும்.'
    ],
    bodyEn: "Nandi, Shiva's vehicle and most devoted disciple, sat silently before the Shivalinga in eternal tapas. That steady devotion became the constellation Taurus — Rishabam. Born under this sign means patience, loyalty, and a strong material instinct. Ruled by Venus, gifted with a natural pull toward art, music, and beauty."
  },
  {
    id: 'mithunam-origin',
    category: 'rasi',
    titleTa: 'மிதுன ராசி — இரட்டையர் கதை',
    titleEn: 'Mithunam (Gemini) — The Twins',
    bodyTa: [
      'ஒரு புராதனக் கதையில் — வானத்தின் இரு அரிய நட்சத்திரக் குழந்தைகள், ஒரே நேரத்தில் பிறந்து, என்றும் பிரியாத உறவாய் வாழ்ந்தனர். ஒருவன் அழியாதவன், மற்றவன் மனிதன் — ஆயினும் அவர்களின் அன்பும் ஒற்றுமையும் அவர்களைப் பிரிக்க முடியாதவர்களாக்கியது.',
      'தேவர்கள் அந்த உறவின் நினைவாக அவர்களை வானில் இரட்டை நட்சத்திரங்களாக நிறுத்தினர் — அதுவே மிதுன ராசி. மிதுனம் என்றால் இணை/ஜோடி — இரட்டை இயல்பு, சமநிலை, தொடர்பு ஆகியவற்றின் சின்னம்.',
      'புதன் (மெர்க்குரி) ஆட்சி செய்யும் ராசி. இதில் பிறந்தோர் — கூர்மையான அறிவு, பேச்சுத் திறன், ஆர்வம், விரைவான சிந்தனை கொண்டவர்களாக இருப்பர்.'
    ],
    bodyEn: 'An ancient legend tells of twin celestial children — one mortal, one immortal — born together and bound by a love so deep that even death could not separate them. The devas placed them in the heavens as twin stars, forever together: the constellation Gemini — Mithunam, meaning "pair", a symbol of duality, balance, and communication. Ruled by Mercury (Budhan), those born under this sign are known for sharp intellect, wit, curiosity, and a gift for conversation.'
  },
  {
    id: 'kadagam-origin',
    category: 'rasi',
    titleTa: 'கடக ராசி — கூர்ம அவதாரக் கதை',
    titleEn: "Kadakam (Cancer) — The Tortoise's Tale",
    bodyTa: [
      'பாற்கடலைக் கடைந்தபோது, மந்தர மலையை முதுகில் தாங்கி நிலைகுலையாமல் நின்றது ஒரு மாபெரும் ஆமை — அதுவே மகாவிஷ்ணுவின் கூர்ம அவதாரம் என்று கருதப்படுகிறது.',
      'அதன் பொறுமையும், தாங்கும் சக்தியும், தாய்மையின் அரவணைப்பும் வானில் ஒரு நட்சத்திர மண்டலமாக நிலைநிறுத்தப்பட்டது — அதுவே கடக ராசி. கடகம் என்றால் நண்டு — தனது இல்லத்தைத் தானே சுமந்து செல்லும் உயிரினம், வீடு, குடும்பம், உணர்வுபூர்வமான பாதுகாப்பு ஆகியவற்றின் சின்னம்.',
      'சந்திரன் ஆட்சி செய்யும் ராசி. இதில் பிறந்தோர் — உணர்ச்சிபூர்வமான ஆழம், அரவணைப்பு, குடும்பப் பற்று, உள்ளுணர்வு ஆகியவற்றில் சிறந்து விளங்குவர்.'
    ],
    bodyEn: "When the cosmic ocean was churned, a colossal turtle bore Mount Mandara on its back without wavering — Mahavishnu's Kurma avatar. Its patience, endurance, and nurturing strength were placed among the stars as the constellation Cancer — Kadakam, the crab, a symbol of home, family, and emotional shelter. Ruled by the Moon (Chandran), those born under this sign are deeply emotional, nurturing, intuitive, and devoted to family."
  },
  {
    id: 'simmam-origin',
    category: 'rasi',
    titleTa: 'சிம்ம ராசி — நரசிம்ம அவதாரக் கதை',
    titleEn: "Simmam (Leo) — The Lion's Roar",
    bodyTa: [
      'இரணியனை அழிக்க, மகாவிஷ்ணு அரை-சிங்கமாக, அரை-மனிதனாக நரசிம்ம அவதாரம் எடுத்தார். அந்த அவதாரத்தின் வீரமும், அரசத் தோரணையும், ஒளிமயமான வலிமையும் உலகெங்கும் போற்றப்பட்டது.',
      'அந்த சிங்க வடிவின் நினைவாக வானில் ஒரு நட்சத்திர மண்டலம் நிலைநிறுத்தப்பட்டது — அதுவே சிம்ம ராசி. சிம்மம் என்றால் சிங்கம் — தலைமைத்துவம், தன்னம்பிக்கை, பிரகாசம் ஆகியவற்றின் சின்னம்.',
      'சூரியன் ஆட்சி செய்யும் ராசி. இதில் பிறந்தோர் — இயல்பான தலைமைத் திறன், பெருந்தன்மை, கம்பீரம், படைப்பாற்றல் கொண்டவர்களாக இருப்பர்.'
    ],
    bodyEn: 'To destroy the demon Hiranyakashipu, Mahavishnu took the form of Narasimha — half-lion, half-man — radiant with courage and royal power. That fierce, luminous form was placed in the heavens as the constellation Leo — Simmam, the lion, symbolizing leadership, confidence, and radiance. Ruled by the Sun (Sooryan), those born under this sign are natural leaders — generous, dignified, and creatively gifted.'
  },
  {
    id: 'kanni-origin',
    category: 'rasi',
    titleTa: 'கன்னி ராசி — தூய கன்னிகையின் கதை',
    titleEn: 'Kanni (Virgo) — The Pure Maiden',
    bodyTa: [
      'தேவியின் தூய்மையான ஒரு வடிவமாகக் கருதப்படும் ஒரு கன்னிகை, விளைச்சலையும் செழுமையையும் தன் கைகளில் தாங்கி நின்றாள் என்று ஒரு பழங்கதை கூறுகிறது. அவளது தூய்மையும் பணிவும் கடவுளரை வியக்க வைத்தது.',
      'அவளது அந்த வடிவம் வானில் ஒரு நட்சத்திர மண்டலமாக நிறுத்தப்பட்டது — அதுவே கன்னி ராசி. கன்னி என்றால் இளம்பெண் — தூய்மை, நுணுக்கம், சேவை மனப்பான்மை ஆகியவற்றின் சின்னம்.',
      'புதன் (மெர்க்குரி) ஆட்சி செய்யும் ராசி. இதில் பிறந்தோர் — நுட்பமான கவனிப்பு, ஒழுங்கு, பகுப்பாய்வு சிந்தனை, உதவும் மனப்பான்மை கொண்டவர்களாக இருப்பர்.'
    ],
    bodyEn: 'An old tale speaks of a pure maiden, an embodiment of the goddess herself, who carried the harvest and abundance in her hands — her purity and humility a wonder even to the devas. Her form was placed among the stars as the constellation Virgo — Kanni, the maiden, symbolizing purity, precision, and a spirit of service. Ruled by Mercury (Budhan), those born under this sign are meticulous, analytical, organized, and naturally inclined to help others.'
  },
  {
    id: 'thulam-origin',
    category: 'rasi',
    titleTa: 'துலா ராசி — நீதி தேவதையின் கதை',
    titleEn: 'Thulam (Libra) — The Scales of Justice',
    bodyTa: [
      'நீதி தேவதையான தேவி, இரு கைகளில் தராசு ஏந்தி, உலகின் நன்மை-தீமைகளை சமமாக நிறுத்து தீர்ப்பு வழங்கினாள் என்று புராணம் கூறுகிறது. அவளது நேர்மையும் சமநிலையும் அனைவராலும் போற்றப்பட்டது.',
      'அந்த தராசின் வடிவம் வானில் ஒரு நட்சத்திர மண்டலமாக நிறுத்தப்பட்டது — அதுவே துலா ராசி. துலாம் என்றால் தராசு — நீதி, சமநிலை, அழகுணர்வு ஆகியவற்றின் சின்னம்.',
      'சுக்கிரன் (வீனஸ்) ஆட்சி செய்யும் ராசி. இதில் பிறந்தோர் — நீதியுணர்வு, இணக்கம், அழகியல் ரசனை, உறவுகளில் சமநிலை தேடும் இயல்பு கொண்டவர்களாக இருப்பர்.'
    ],
    bodyEn: 'Legend tells of the goddess of justice who held the scales aloft, weighing the good and ill of the world with perfect fairness — her balance and integrity admired by all. That image of the scales was placed among the stars as the constellation Libra — Thulam, symbolizing justice, balance, and a deep sense of beauty. Ruled by Venus (Sukran), those born under this sign seek harmony, fairness, aesthetic refinement, and balanced relationships.'
  },
  {
    id: 'viruchigam-origin',
    category: 'rasi',
    titleTa: 'விருச்சிக ராசி — தேளின் கதை',
    titleEn: "Viruchigam (Scorpio) — The Scorpion's Sting",
    bodyTa: [
      'வேடனான ஓரியனை வீழ்த்த, பூமித்தாய் ஒரு சிறிய தேள் ஒன்றை அனுப்பினாள் என்று ஒரு கலப்புப் புராணக் கதை கூறுகிறது. அந்த தேளின் கொடுந்தீண்டலால் வலிமைமிக்க வேடனே வீழ்ந்தான்.',
      'அதன் மறைமுக வலிமையும், தீர்க்கமான சக்தியும் வானில் ஒரு நட்சத்திர மண்டலமாக நிலைநிறுத்தப்பட்டது — அதுவே விருச்சிக ராசி. விருச்சிகம் என்றால் தேள் — ஆழ்ந்த உணர்வு, மறைமுக சக்தி, மாற்றம் ஆகியவற்றின் சின்னம்.',
      'செவ்வாய் (மங்கள்) ஆட்சி செய்யும் ராசி. இதில் பிறந்தோர் — தீவிரமான உணர்வுகள், ஆழ்ந்த உள்ளுணர்வு, உறுதியான மன உறுதி கொண்டவர்களாக இருப்பர்.'
    ],
    bodyEn: 'A blended legend tells of how a small scorpion was sent by Mother Earth to humble the mighty hunter Orion — and with a single sting, the great hunter fell. That hidden, decisive power was placed among the stars as the constellation Scorpio — Viruchigam, the scorpion, symbolizing intensity, transformation, and quiet strength. Ruled by Mars (Sevvai), those born under this sign are passionate, intuitive, and possess immense willpower.'
  },
  {
    id: 'dhanusu-origin',
    category: 'rasi',
    titleTa: 'தனுசு ராசி — வில்லாளனின் கதை',
    titleEn: 'Dhanusu (Sagittarius) — The Archer',
    bodyTa: [
      'பாதி-மனிதன், பாதி-குதிரை வடிவிலான ஒரு ஞானியான வில்லாளன், வானத்தை நோக்கி எப்போதும் தன் அம்பை எய்யத் தயாராய் நின்றான் என்று புராணக் கதை கூறுகிறது. அவனது அறிவும் இலக்கு நோக்கிய உறுதியும் தேவர்களையே வியக்க வைத்தது.',
      'அவனது அந்த வடிவம் வானில் ஒரு நட்சத்திர மண்டலமாக நிறுத்தப்பட்டது — அதுவே தனுசு ராசி. தனுசு என்றால் வில் — இலக்கு நோக்கிய பயணம், ஞானம், விரிந்த நோக்கு ஆகியவற்றின் சின்னம்.',
      'குரு (வியாழன்) ஆட்சி செய்யும் ராசி. இதில் பிறந்தோர் — தத்துவ ஞானம், சுதந்திர மனப்பான்மை, பயண ஆர்வம், நேர்மையான பேச்சு கொண்டவர்களாக இருப்பர்.'
    ],
    bodyEn: "A wise archer, half-man and half-horse, stood eternally with his bow drawn toward the heavens — his wisdom and unerring focus a marvel even to the devas. That form was placed among the stars as the constellation Sagittarius — Dhanusu, the bow, symbolizing purposeful journeys, wisdom, and broad vision. Ruled by Jupiter (Guru), those born under this sign are philosophical, freedom-loving, adventurous, and refreshingly straightforward."
  },
  {
    id: 'magaram-origin',
    category: 'rasi',
    titleTa: 'மகர ராசி — கடல்-ஜீவனின் கதை',
    titleEn: "Magaram (Capricorn) — The Sea-Creature's Tale",
    bodyTa: [
      'ஒரு பழங்கதையில் — பாதி-வெள்ளாடு, பாதி-மீன் வடிவிலான ஒரு அரிய ஜீவன், பேரழிவிலிருந்து தப்பிக்க கடலில் குதித்து, தன் வடிவை மாற்றிக் கொண்டு உயிர் தப்பியது.',
      'அதன் உறுதியும், கடினமான சூழலிலும் தாக்குப்பிடிக்கும் ஆற்றலும் வானில் ஒரு நட்சத்திர மண்டலமாக நிலைநிறுத்தப்பட்டது — அதுவே மகர ராசி. மகரம் என்றால் முதலை/கடல்-ஜீவன் — உறுதி, பொறுப்புணர்வு, நீடித்த உழைப்பு ஆகியவற்றின் சின்னம்.',
      'சனி ஆட்சி செய்யும் ராசி. இதில் பிறந்தோர் — ஒழுக்கம், பொறுமை, இலக்கு நோக்கிய உழைப்பு, நடைமுறை சிந்தனை கொண்டவர்களாக இருப்பர்.'
    ],
    bodyEn: 'An old legend tells of a rare creature — half-goat, half-fish — that leapt into the sea and transformed itself to escape a great calamity, surviving against all odds. Its resilience and ability to endure hardship were placed among the stars as the constellation Capricorn — Magaram, symbolizing discipline, responsibility, and persistent effort. Ruled by Saturn (Sani), those born under this sign are disciplined, patient, practical, and steadily ambitious.'
  },
  {
    id: 'kumbam-origin',
    category: 'rasi',
    titleTa: 'கும்ப ராசி — அமுதக் குடத்தின் கதை',
    titleEn: 'Kumbam (Aquarius) — The Water-Bearer',
    bodyTa: [
      'தேவலோகத்தில் ஒரு இளைஞன், அமுதம் நிறைந்த குடத்தைத் தாங்கி, தாகமுற்ற உலகிற்கு நீர் வழங்கும் பணியை ஏற்றுக் கொண்டான் என்று ஒரு கதை கூறுகிறது. அவனது கொடை மனப்பான்மை அனைவராலும் போற்றப்பட்டது.',
      'அந்த குடத்தின் வடிவம் வானில் ஒரு நட்சத்திர மண்டலமாக நிறுத்தப்பட்டது — அதுவே கும்ப ராசி. கும்பம் என்றால் குடம் — அறிவைப் பகிர்தல், புதுமை, மானுடநேயம் ஆகியவற்றின் சின்னம்.',
      'சனி ஆட்சி செய்யும் ராசி. இதில் பிறந்தோர் — தனித்துவமான சிந்தனை, புதுமையான பார்வை, சமூகநல சிந்தனை, நட்புணர்வு கொண்டவர்களாக இருப்பர்.'
    ],
    bodyEn: "A celestial youth, carrying a vessel brimming with the nectar of life, took it upon himself to bring water to a thirsting world — his generosity admired by all. That vessel was placed among the stars as the constellation Aquarius — Kumbam, the pot, symbolizing the sharing of knowledge, innovation, and humanity. Ruled by Saturn (Sani), those born under this sign are independent thinkers, inventive, socially conscious, and warmly friendly."
  },
  {
    id: 'meenam-origin',
    category: 'rasi',
    titleTa: 'மீன ராசி — மத்ஸ்ய அவதாரக் கதை',
    titleEn: "Meenam (Pisces) — The Fish's Tale",
    bodyTa: [
      'பெரும் பிரளயத்தின்போது, உலகைக் காக்க மகாவிஷ்ணு மத்ஸ்ய அவதாரம் எடுத்து, படகையும் உயிரினங்களையும் பாதுகாப்பாக இட்டுச் சென்றார் என்று புராணம் கூறுகிறது.',
      'அந்த மீன் வடிவின் கருணையும் வழிகாட்டும் ஆற்றலும் வானில் ஒரு நட்சத்திர மண்டலமாக நிலைநிறுத்தப்பட்டது — அதுவே மீன ராசி. மீனம் என்றால் மீன் — கருணை, ஆன்மீகம், கற்பனை ஆகியவற்றின் சின்னம்.',
      'குரு (வியாழன்) ஆட்சி செய்யும் ராசி. இதில் பிறந்தோர் — கனிவு, உள்ளுணர்வு, கலை உணர்வு, ஆன்மீக நாட்டம் கொண்டவர்களாக இருப்பர்.'
    ],
    bodyEn: 'During the great deluge, Mahavishnu took the form of Matsya, the fish, and guided the boat carrying all living beings safely through the flood. That compassionate, guiding form was placed among the stars as the constellation Pisces — Meenam, the fish, symbolizing compassion, spirituality, and imagination. Ruled by Jupiter (Guru), those born under this sign are gentle, intuitive, artistic, and deeply spiritual.'
  },
  {
    id: 'sevvai-dosham',
    category: 'remedy',
    titleTa: 'செவ்வாய் தோஷம் — பரிகாரம்',
    titleEn: 'Mangal Dosha — Remedies',
    bodyTa: [
      'ஜாதகத்தின் 1, 2, 4, 7, 8, 12-வது வீடுகளில் செவ்வாய் கிரகம் அமர்ந்திருந்தால் "செவ்வாய் தோஷம்" என்கிறோம். திருமண வாழ்க்கையில் மன அழுத்தம், தாமதம், கருத்து வேறுபாடு ஏற்படலாம் என்பது நம்பிக்கை.',
      'பரிகாரம்: (1) செவ்வாய்க்கிழமை விரதம் — ஆழியூர் / வைதீஸ்வரன் கோயில் வழிபாடு. (2) ஹனுமான் சாலிசா தினமும் சொல்லுதல். (3) தொடை சிவப்பு அல்லது செம்பவளம் (சில ஜாதகங்களுக்கு) — ஜோதிட ஆலோசனை பெற்று மட்டுமே.',
      '(4) "செவ்வாய் வேதம்" எனப்படும் சுப்ரமணியர் மந்திரம் — "ஓம் சரவண பவ" 108 முறை. (5) மிக முக்கியம் — இரண்டு பேருக்கும் தோஷம் இருந்தால் இரட்டை தோஷம் ஒன்றை ஒன்று ரத்து செய்துவிடும் என்ற நம்பிக்கையும் உண்டு.'
    ],
    bodyEn: "Mangal Dosha occurs when Mars sits in the 1st, 2nd, 4th, 7th, 8th, or 12th house — believed to delay marriage or cause friction. Common remedies: Tuesday fasting and visits to Subramanya temples, daily Hanuman Chalisa, and the Skanda mantra \"Om Saravana Bhava\" 108 times. Two affected partners often cancel out each other's dosha."
  },
  {
    id: 'rahu-ketu-dosham',
    category: 'remedy',
    titleTa: 'ராகு கேது தோஷம் — பரிகாரம்',
    titleEn: 'Rahu-Ketu Dosha — Remedies',
    bodyTa: [
      'ராகு மற்றும் கேது — நிழல் கிரகங்கள். இவை ஜாதகத்தில் தீய நிலையில் இருந்தால், எதிர்பாராத தாமதங்கள், மாயை, மன அமைதியின்மை, பாம்பு தோஷம் (சர்ப்ப தோஷம்) என்று பல வடிவங்களில் தாக்கம் ஏற்படலாம்.',
      'பரிகாரம்: (1) ராகு காலம், எம கண்டத்தில் முக்கிய காரியம் தவிர்க்கவும். (2) காளஹஸ்தி, திருநாகேஸ்வரம், திருப்பாம்புராம் கோயில்களில் ராகு கேது பூஜை. (3) நாக பஞ்சமி அன்று பாம்பு வழிபாடு — பால் அபிஷேகம்.',
      '(4) "ஓம் ராம் ராஹவே நமஹ" மற்றும் "ஓம் ஸ்ராம் ஸ்ரீம் ஸ்ரௌம் சஹ கேதவே நமஹ" மந்திரங்கள் 108 முறை. (5) வெள்ளி மாலையில் தினமும் தீபம் ஏற்றுதல், கருப்பு / நீல நிற ஆடை அணிதலை குறைத்தல்.'
    ],
    bodyEn: 'Rahu and Ketu, the shadow planets, can cause unexpected delays, illusions, and unrest when poorly placed. Remedies include avoiding Rahu Kalam and Yama Gandam for important work, visiting Kalahasti or Thirunageswaram temples for Rahu-Ketu pooja, Nag Panchami worship with milk abhishekam, and chanting the Rahu and Ketu beeja mantras 108 times daily.'
  }
];

// ============ Category Badge Component ============
function CategoryBadge({ cat }: { cat: Category }) {
  const meta = CATEGORIES.find(c => c.key === cat)!;
  return (
    <StyledView className="bg-[#1A0E3A] border border-gold/20 rounded-full px-3 py-1 flex-row items-center self-start">
      <StyledText className="text-sm mr-1">{meta.icon}</StyledText>
      <StyledText className="text-[#FF8C00] text-[10px] font-bold font-sans">
        {meta.ta}
      </StyledText>
    </StyledView>
  );
}

// ============ Story Card Component ============
function StoryCard({ 
  story, 
  expanded, 
  onToggle 
}: { 
  story: Story; 
  expanded: boolean; 
  onToggle: () => void;
}) {
  return (
    <StyledView 
      className="bg-dark-card rounded-xl overflow-hidden border border-gold/10 mb-3"
      style={{ borderLeftWidth: 4, borderLeftColor: expanded ? COLORS.gold : COLORS.border }}
    >
      <StyledTouchable
        className="p-4"
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <StyledView className="flex-row justify-between items-start">
          <StyledView className="flex-1">
            <CategoryBadge cat={story.category} />
            <StyledText className="text-gold text-base font-serif font-bold mt-2 leading-relaxed">
              {story.titleTa}
            </StyledText>
            <StyledText className="text-light-text/30 text-[10px] font-sans mt-0.5">
              {story.titleEn}
            </StyledText>
          </StyledView>
          <StyledText className="text-gold text-xl font-sans ml-3">
            {expanded ? '−' : '+'}
          </StyledText>
        </StyledView>
      </StyledTouchable>

      {expanded && (
        <StyledView className="px-4 pb-4 pt-2 border-t border-gold/10">
          {story.bodyTa.map((para, i) => (
            <StyledText 
              key={i} 
              className={`text-light-text text-sm font-sans leading-relaxed ${
                i === 0 ? 'mt-2' : 'mt-2'
              }`}
            >
              {para}
            </StyledText>
          ))}
          <StyledView className="mt-3 p-3 bg-[#1A0E3A] rounded-lg border-l-2 border-[#FF8C00]">
            <StyledText className="text-[#FF8C00] text-[10px] font-sans font-bold mb-1">
              In English:
            </StyledText>
            <StyledText className="text-light-text/60 text-[11px] font-sans leading-relaxed">
              {story.bodyEn}
            </StyledText>
          </StyledView>
        </StyledView>
      )}
    </StyledView>
  );
}

// ============ Main Screen ============
export default function KathaikalScreen({ navigation }: any) {
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filteredStories = filter === 'all' 
    ? STORIES 
    : STORIES.filter(s => s.category === filter);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleToggle = (id: string) => {
    // Use LayoutAnimation for smooth expand/collapse
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setOpenId(openId === id ? null : id);
  };

  return (
    <StyledSafeArea className="flex-1 bg-dark">
      <StatusBar style="light" />
      
      {/* Header */}
      <StyledView className="bg-dark-card px-4 py-4 shadow-lg flex-row items-center">
        <BackButton navigation={navigation} />
        <StyledText className="text-gold text-xl font-serif flex-1">
          📖 கதைகள் / Stories
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
            📖 கதைகள் / கட்டுரைகள்
          </StyledText>
          <StyledText className="text-light-text/50 text-sm font-sans mt-1">
            Tamil stories on astrology, festivals, rasi origins, and dosha remedies
          </StyledText>
        </StyledView>

        {/* Categories */}
        <StyledView className="bg-dark-card rounded-2xl overflow-hidden border border-gold/10 mb-4">
          <StyledView className="bg-[#321C6B] py-2.5 px-4">
            <StyledText className="text-gold text-sm font-sans font-bold text-center">
              பிரிவுகள் — Categories
            </StyledText>
          </StyledView>
          <StyledView className="p-3 flex-row flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = filter === c.key;
              return (
                <StyledTouchable
                  key={c.key}
                  className={`px-3 py-1.5 rounded-full border flex-row items-center gap-1 ${
                    active ? 'bg-[#321C6B] border-gold' : 'bg-[#1A0E3A] border-gold/20'
                  }`}
                  onPress={() => setFilter(c.key)}
                >
                  <StyledText className="text-sm">{c.icon}</StyledText>
                  <StyledText className={`text-xs font-sans ${
                    active ? 'text-gold font-bold' : 'text-light-text/60'
                  }`}>
                    {c.ta}
                  </StyledText>
                </StyledTouchable>
              );
            })}
          </StyledView>
        </StyledView>

        {/* Stories List */}
        {filteredStories.length === 0 ? (
          <StyledView className="bg-dark-card rounded-2xl p-8 border border-gold/10 items-center">
            <Ionicons name="book-outline" size={40} color="#666" />
            <StyledText className="text-light-text/50 text-sm font-sans mt-3 text-center">
              இந்த பிரிவில் கதைகள் இல்லை.
            </StyledText>
          </StyledView>
        ) : (
          <StyledView className="mb-4">
            {filteredStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                expanded={openId === story.id}
                onToggle={() => handleToggle(story.id)}
              />
            ))}
          </StyledView>
        )}

        {/* Note */}
        <StyledView className="bg-[#1A0E3A] rounded-xl p-4 border border-gold/10 mb-4">
          <StyledText className="text-light-text/40 text-[10px] font-sans leading-relaxed">
            குறிப்பு: இக்கதைகள் பாரம்பரிய தமிழ் / சம்ஸ்கிருத மரபுகளின் பல்வேறு பதிப்புகளில் 
            இருந்து சுருக்கமாகத் தொகுக்கப்பட்டுள்ளன. பகுதி / மாகாணம் / சம்பிரதாயத்திற்கு 
            ஏற்ப விவரங்கள் வேறுபடலாம்.
          </StyledText>
          <StyledText className="text-light-text/20 text-[9px] font-sans mt-2 leading-relaxed">
            Note: These are condensed retellings drawn from traditional Tamil and Sanskrit 
            sources. Details vary by region and tradition.
          </StyledText>
        </StyledView>

        {/* Footer */}
        <StyledView className="py-2 items-center">
          <StyledText className="text-light-text/20 text-[10px] font-sans">
            © {new Date().getFullYear()} Jothidam • Stories
          </StyledText>
        </StyledView>
      </StyledScrollView>
    </StyledSafeArea>
  );
}