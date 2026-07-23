'use client';

import { useState } from 'react';

const COLOR = {
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

type Category = 'puranic' | 'festival' | 'rasi' | 'remedy';

const CATEGORIES: Array<{ key: Category | 'all'; ta: string; en: string; icon: string }> = [
  { key: 'all',      ta: 'அனைத்தும்',  en: 'All',       icon: '📚' },
  { key: 'puranic',  ta: 'புராணம்',    en: 'Puranic',   icon: '🕉' },
  { key: 'festival', ta: 'பண்டிகை',   en: 'Festival',  icon: '🪔' },
  { key: 'rasi',     ta: 'ராசி',        en: 'Rasi',      icon: '⭐' },
  { key: 'remedy',   ta: 'பரிகாரம்',  en: 'Remedy',    icon: '🌿' }
];

type Story = {
  id: string;
  category: Category;
  titleTa: string;
  titleEn: string;
  bodyTa: string[];
  bodyEn: string;
};

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
    titleEn: 'Pongal — The Farmer\'s Festival',
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
    bodyEn: 'In an ancient tale, a winged golden ram was sent by the devas to rescue two children from a vengeful stepmother. Bearing them across the sky, it saved their lives. The ram\'s golden fleece was then placed among the stars as the constellation Aries — Mesha — symbolizing courage, leadership, and pioneering energy. Ruled by Mars.'
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
    bodyEn: 'Nandi, Shiva\'s vehicle and most devoted disciple, sat silently before the Shivalinga in eternal tapas. That steady devotion became the constellation Taurus — Rishabam. Born under this sign means patience, loyalty, and a strong material instinct. Ruled by Venus, gifted with a natural pull toward art, music, and beauty.'
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
    titleEn: 'Kadakam (Cancer) — The Tortoise’s Tale',
    bodyTa: [
      'பாற்கடலைக் கடைந்தபோது, மந்தர மலையை முதுகில் தாங்கி நிலைகுலையாமல் நின்றது ஒரு மாபெரும் ஆமை — அதுவே மகாவிஷ்ணுவின் கூர்ம அவதாரம் என்று கருதப்படுகிறது.',
      'அதன் பொறுமையும், தாங்கும் சக்தியும், தாய்மையின் அரவணைப்பும் வானில் ஒரு நட்சத்திர மண்டலமாக நிலைநிறுத்தப்பட்டது — அதுவே கடக ராசி. கடகம் என்றால் நண்டு — தனது இல்லத்தைத் தானே சுமந்து செல்லும் உயிரினம், வீடு, குடும்பம், உணர்வுபூர்வமான பாதுகாப்பு ஆகியவற்றின் சின்னம்.',
      'சந்திரன் ஆட்சி செய்யும் ராசி. இதில் பிறந்தோர் — உணர்ச்சிபூர்வமான ஆழம், அரவணைப்பு, குடும்பப் பற்று, உள்ளுணர்வு ஆகியவற்றில் சிறந்து விளங்குவர்.'
    ],
    bodyEn: 'When the cosmic ocean was churned, a colossal turtle bore Mount Mandara on its back without wavering — Mahavishnu’s Kurma avatar. Its patience, endurance, and nurturing strength were placed among the stars as the constellation Cancer — Kadakam, the crab, a symbol of home, family, and emotional shelter. Ruled by the Moon (Chandran), those born under this sign are deeply emotional, nurturing, intuitive, and devoted to family.'
  },
  {
    id: 'simmam-origin',
    category: 'rasi',
    titleTa: 'சிம்ம ராசி — நரசிம்ம அவதாரக் கதை',
    titleEn: 'Simmam (Leo) — The Lion’s Roar',
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
    titleEn: 'Viruchigam (Scorpio) — The Scorpion’s Sting',
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
    bodyEn: 'A wise archer, half-man and half-horse, stood eternally with his bow drawn toward the heavens — his wisdom and unerring focus a marvel even to the devas. That form was placed among the stars as the constellation Sagittarius — Dhanusu, the bow, symbolizing purposeful journeys, wisdom, and broad vision. Ruled by Jupiter (Guru), those born under this sign are philosophical, freedom-loving, adventurous, and refreshingly straightforward.'
  },
  {
    id: 'magaram-origin',
    category: 'rasi',
    titleTa: 'மகர ராசி — கடல்-ஜீவனின் கதை',
    titleEn: 'Magaram (Capricorn) — The Sea-Creature’s Tale',
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
    bodyEn: 'A celestial youth, carrying a vessel brimming with the nectar of life, took it upon himself to bring water to a thirsting world — his generosity admired by all. That vessel was placed among the stars as the constellation Aquarius — Kumbam, the pot, symbolizing the sharing of knowledge, innovation, and humanity. Ruled by Saturn (Sani), those born under this sign are independent thinkers, inventive, socially conscious, and warmly friendly.'
  },
  {
    id: 'meenam-origin',
    category: 'rasi',
    titleTa: 'மீன ராசி — மத்ஸ்ய அவதாரக் கதை',
    titleEn: 'Meenam (Pisces) — The Fish’s Tale',
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
    bodyEn: 'Mangal Dosha occurs when Mars sits in the 1st, 2nd, 4th, 7th, 8th, or 12th house — believed to delay marriage or cause friction. Common remedies: Tuesday fasting and visits to Subramanya temples, daily Hanuman Chalisa, and the Skanda mantra "Om Saravana Bhava" 108 times. Two affected partners often cancel out each other\'s dosha.'
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

function HeaderBand({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #321C6B 0%, #251450 100%)',
      color: COLOR.gold, padding: '10px 14px', textAlign: 'center',
      fontFamily: 'Noto Sans Tamil, sans-serif', fontWeight: 600, fontSize: '16px',
      borderBottom: `1px solid ${COLOR.border}`
    }}>{children}</div>
  );
}

function CategoryBadge({ cat }: { cat: Category }) {
  const meta = CATEGORIES.find(c => c.key === cat)!;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: COLOR.surface, color: COLOR.saffron,
      border: `1px solid ${COLOR.border}`, borderRadius: '999px',
      padding: '3px 10px', fontSize: '11px', fontWeight: 700,
      fontFamily: 'Noto Sans Tamil, sans-serif'
    }}>
      <span>{meta.icon}</span>{meta.ta}
    </div>
  );
}

function StoryCard({ story, expanded, onToggle }: { story: Story; expanded: boolean; onToggle: () => void }) {
  return (
    <div style={{
      background: COLOR.card, border: `1px solid ${COLOR.border}`,
      borderLeft: expanded ? `4px solid ${COLOR.gold}` : `4px solid ${COLOR.border}`,
      borderRadius: '12px', overflow: 'hidden',
      transition: 'border-color 0.15s'
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', background: 'transparent', border: 'none',
          padding: '14px', textAlign: 'left', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px'
        }}
      >
        <div style={{ flex: 1 }}>
          <CategoryBadge cat={story.category} />
          <div style={{
            color: COLOR.gold, fontFamily: 'Noto Serif Tamil, serif',
            fontSize: '17px', fontWeight: 700, marginTop: '8px', lineHeight: 1.35
          }}>
            {story.titleTa}
          </div>
          <div style={{ color: COLOR.subtle, fontSize: '11px', fontFamily: 'system-ui, sans-serif', marginTop: '2px' }}>
            {story.titleEn}
          </div>
        </div>
        <div style={{
          color: COLOR.gold, fontSize: '20px', fontFamily: 'system-ui, sans-serif',
          flexShrink: 0, lineHeight: 1
        }}>
          {expanded ? '−' : '+'}
        </div>
      </button>
      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${COLOR.divider}` }}>
          {story.bodyTa.map((para, i) => (
            <p key={i} style={{
              color: COLOR.text, fontFamily: 'Noto Sans Tamil, sans-serif',
              fontSize: '14px', lineHeight: 1.7, marginTop: i === 0 ? '12px' : '8px'
            }}>
              {para}
            </p>
          ))}
          <div style={{
            marginTop: '12px', padding: '10px 12px',
            background: COLOR.surface, borderRadius: '6px',
            color: COLOR.muted, fontSize: '12px',
            fontFamily: 'system-ui, sans-serif', lineHeight: 1.6,
            borderLeft: `3px solid ${COLOR.saffron}`
          }}>
            <strong style={{ color: COLOR.saffron }}>In English:</strong> {story.bodyEn}
          </div>
        </div>
      )}
    </div>
  );
}

export default function KathaikalPage() {
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = filter === 'all' ? STORIES : STORIES.filter(s => s.category === filter);

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)' }} className="kolam-bg">
      <div className="max-w-2xl mx-auto px-3 py-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        <div>
          <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: COLOR.gold, fontSize: 'clamp(18px, 4vw, 24px)', marginBottom: '2px' }}>
            கதைகள் / கட்டுரைகள்
          </h1>
          <div style={{ color: COLOR.muted, fontSize: '13px', fontFamily: 'system-ui, sans-serif' }}>
            Tamil stories on astrology, festivals, rasi origins, and dosha remedies
          </div>
        </div>

        <div style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: '12px', overflow: 'hidden' }}>
          <HeaderBand>பிரிவுகள் — Categories</HeaderBand>
          <div style={{ padding: '12px 10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {CATEGORIES.map(c => {
              const active = filter === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setFilter(c.key)}
                  style={{
                    background: active ? '#321C6B' : COLOR.surface,
                    color: active ? COLOR.gold : COLOR.text,
                    border: `1px solid ${active ? COLOR.gold : COLOR.border}`,
                    borderRadius: '999px',
                    padding: '6px 12px', cursor: 'pointer',
                    fontFamily: 'Noto Sans Tamil, sans-serif',
                    fontSize: '12px', fontWeight: active ? 700 : 500,
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    transition: 'background 0.15s, color 0.15s'
                  }}
                >
                  <span>{c.icon}</span>{c.ta}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.length === 0 ? (
            <div style={{
              background: COLOR.card, border: `1px dashed ${COLOR.border}`,
              borderRadius: '12px', padding: '24px',
              textAlign: 'center', color: COLOR.muted,
              fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '14px'
            }}>
              இந்த பிரிவில் கதைகள் இல்லை.
            </div>
          ) : (
            filtered.map(story => (
              <StoryCard
                key={story.id}
                story={story}
                expanded={openId === story.id}
                onToggle={() => setOpenId(openId === story.id ? null : story.id)}
              />
            ))
          )}
        </div>

        <div style={{
          marginTop: '4px', padding: '12px 14px',
          background: COLOR.surface, border: `1px dashed ${COLOR.border}`,
          borderRadius: '8px',
          color: COLOR.subtle, fontSize: '11px',
          fontFamily: 'Noto Sans Tamil, sans-serif', lineHeight: 1.5
        }}>
          குறிப்பு: இக்கதைகள் பாரம்பரிய தமிழ் / சம்ஸ்கிருத மரபுகளின் பல்வேறு பதிப்புகளில் இருந்து சுருக்கமாகத் தொகுக்கப்பட்டுள்ளன. பகுதி / மாகாணம் / சம்பிரதாயத்திற்கு ஏற்ப விவரங்கள் வேறுபடலாம். ஆழமான கல்விக்கு பாரம்பரிய நூல்களைப் பார்க்கவும்.
          <br />
          <span style={{ fontFamily: 'system-ui, sans-serif' }}>
            Note: These are condensed retellings drawn from traditional Tamil and Sanskrit sources. Details vary by region and tradition — refer to canonical texts for deeper study.
          </span>
        </div>
      </div>
    </div>
  );
}
