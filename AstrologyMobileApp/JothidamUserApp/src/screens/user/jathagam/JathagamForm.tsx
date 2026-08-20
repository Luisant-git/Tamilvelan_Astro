import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { styled } from '../../../utils/styled';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '../../../components/common/CrossPlatformDateTimePicker';
import Dropdown from '../../../components/common/Dropdown';
import type { ChartData } from './JathagamScreen';
import { horoscopeApi } from '../../../services/horoscope.api';
import { getErrorMessage } from '../../../services/client';
import { useMutation } from '../../../hooks';
import { notifyAlert } from '../../../utils/alert';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledInput = styled(TextInput);
const StyledTouchable = styled(TouchableOpacity);

interface PlaceSuggestion {
  label: string;
  latitude: number;
  longitude: number;
}

const pad2 = (n: number) => String(n).padStart(2, '0');
const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => pad2(i + 1));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => pad2(i));
const AMPM_OPTIONS = ['AM', 'PM'];

export default function JathagamForm({ onResult }: { onResult: (data: ChartData) => void }) {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [place, setPlace] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dob, setDob] = useState<Date>(new Date(1995, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  // Hour/Minute/AM-PM as three separate selects (matching the web app)
  // instead of a single native time picker, so AM/PM is always explicit.
  const [hour, setHour] = useState('06');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
  const { mutate: generateMutate, loading } = useMutation(horoscopeApi.generate);

  useEffect(() => {
    if (!place || place.length < 2 || selectedPlace) {
      setSuggestions([]);
      return;
    }
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    geocodeTimer.current = setTimeout(async () => {
      try {
        const { suggestions: results } = await horoscopeApi.geocode(place);
        setSuggestions(results.map((s) => ({ label: s.label, latitude: s.latitude, longitude: s.longitude })));
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 400);
  }, [place, selectedPlace]);

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      notifyAlert('Error', 'பெயர் தேவை / Name is required');
      return;
    }
    if (!place.trim()) {
      notifyAlert('Error', 'பிறந்த ஊர் தேவை / Birth place is required');
      return;
    }

    // Resolve coordinates the same way the web app does: prefer the tapped
    // suggestion, but fall back to geocoding the typed text at submit time
    // rather than silently sending no coordinates (which the backend would
    // otherwise default to 0,0 — wrecking the Lagna/ascendant calculation).
    let latitude = selectedPlace?.latitude;
    let longitude = selectedPlace?.longitude;
    if (latitude == null || longitude == null) {
      try {
        const { suggestions: results } = await horoscopeApi.geocode(place.trim());
        if (results[0]) {
          latitude = results[0].latitude;
          longitude = results[0].longitude;
        }
      } catch {
        // fall through to the missing-coordinates check below
      }
    }
    if (latitude == null || longitude == null) {
      notifyAlert('Error', 'இடம் கண்டுபிடிக்கவில்லை — பட்டியலில் இருந்து தேர்வு செய்யவும் / Select the place from the suggestion list');
      return;
    }

    let h24 = parseInt(hour, 10);
    if (ampm === 'PM' && h24 < 12) h24 += 12;
    if (ampm === 'AM' && h24 === 12) h24 = 0;

    try {
      const response = await generateMutate({
        fullName: fullName.trim(),
        gender: gender === 'Male' ? 'ஆண்' : 'பெண்',
        // Build the date from the picker's local Y/M/D directly — going
        // through dob.toISOString() converts to UTC first, which silently
        // shifts the date back a day for any timezone ahead of UTC (e.g.
        // India), sending the wrong birth date to the chart calculation.
        dob: `${dob.getFullYear()}-${pad2(dob.getMonth() + 1)}-${pad2(dob.getDate())}`,
        birthTime: `${pad2(h24)}:${minute}`,
        birthPlace: place.trim(),
        latitude,
        longitude,
        chartStyle: 'south',
        language: 'ta',
        // Persists this chart so it shows up in the user's Horoscope History
        // — generate already requires auth, so if this call succeeds the
        // user is necessarily logged in.
        saveProfile: true,
      });
      onResult({ chart: response.chart });
    } catch (err) {
      notifyAlert('Error', getErrorMessage(err));
    }
  };

  return (
    <StyledView className="bg-dark-card rounded-2xl p-4 border border-gold/10">
      <StyledView className="mb-3">
        <StyledText className="text-light-text/70 text-xs font-sans mb-1.5">முழு பெயர் / Full Name</StyledText>
        <StyledView className="bg-dark border border-gold/30 rounded-xl px-3 py-2.5 flex-row items-center">
          <Ionicons name="person-outline" size={18} color="#8B7BAA" />
          <StyledInput
            className="flex-1 text-light-text ml-2"
            placeholder="உங்கள் பெயர்"
            placeholderTextColor="#8B7BAA"
            value={fullName}
            onChangeText={setFullName}
          />
        </StyledView>
      </StyledView>

      <StyledView className="mb-3">
        <StyledText className="text-light-text/70 text-xs font-sans mb-1.5">பாலினம் / Gender</StyledText>
        <StyledView className="flex-row" style={{ gap: 10 }}>
          {(['Male', 'Female'] as const).map((g) => (
            <StyledTouchable
              key={g}
              onPress={() => setGender(g)}
              style={{ minWidth: 0 }}
              className={`flex-1 rounded-xl py-2.5 px-2 items-center border ${gender === g ? 'bg-gold border-gold' : 'border-gold/30'}`}
            >
              <StyledText
                numberOfLines={1}
                className={gender === g ? 'text-dark font-bold' : 'text-light-text/60'}
              >
                {g === 'Male' ? 'ஆண்' : 'பெண்'}
              </StyledText>
            </StyledTouchable>
          ))}
        </StyledView>
      </StyledView>

      <StyledView className="mb-3">
        <StyledText className="text-light-text/70 text-xs font-sans mb-1.5">பிறந்த தேதி / DOB</StyledText>
        <StyledTouchable
          onPress={() => setShowDatePicker(true)}
          className="bg-dark border border-gold/30 rounded-xl px-3 py-2.5 flex-row items-center"
        >
          <Ionicons name="calendar-outline" size={18} color="#8B7BAA" />
          <StyledText className="text-light-text ml-2" numberOfLines={1}>
            {pad2(dob.getDate())}/{pad2(dob.getMonth() + 1)}/{dob.getFullYear()}
          </StyledText>
        </StyledTouchable>
      </StyledView>

      <StyledView className="mb-3">
        <StyledText className="text-light-text/70 text-xs font-sans mb-1.5">நேரம் / Time</StyledText>
        <StyledView className="flex-row" style={{ gap: 8 }}>
          <StyledView className="flex-1">
            <Dropdown value={hour} options={HOUR_OPTIONS} onSelect={setHour} title="மணி / Hour" />
          </StyledView>
          <StyledView className="flex-1">
            <Dropdown value={minute} options={MINUTE_OPTIONS} onSelect={setMinute} title="நிமிடம் / Minute" />
          </StyledView>
          <StyledView className="flex-1">
            <Dropdown value={ampm} options={AMPM_OPTIONS} onSelect={(v) => setAmpm(v as 'AM' | 'PM')} title="AM / PM" />
          </StyledView>
        </StyledView>
      </StyledView>

      {showDatePicker && (
        <DateTimePicker
          value={dob}
          mode="date"
          maximumDate={new Date()}
          onChange={(event, selected) => {
            setShowDatePicker(Platform.OS === 'ios');
            // Android fires onChange on Cancel too, still carrying whatever
            // date was last scrolled to (not a confirmed pick) — only apply
            // the value when the user actually confirmed it via "OK".
            if (event.type === 'dismissed') return;
            if (selected) setDob(selected);
          }}
        />
      )}

      <StyledView className="mb-4" style={{ position: 'relative', zIndex: 10 }}>
        <StyledText className="text-light-text/70 text-xs font-sans mb-1.5">பிறந்த ஊர் / Birth Place</StyledText>
        <StyledView className="bg-dark border border-gold/30 rounded-xl px-3 py-2.5 flex-row items-center">
          <Ionicons name="location-outline" size={18} color="#8B7BAA" />
          <StyledInput
            className="flex-1 text-light-text ml-2"
            placeholder="நகரம், மாவட்டம்"
            placeholderTextColor="#8B7BAA"
            value={place}
            onChangeText={(text) => {
              setPlace(text);
              setSelectedPlace(null);
            }}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          />
        </StyledView>
        {showSuggestions && suggestions.length > 0 && (
          <StyledView
            className="absolute top-full left-0 right-0 mt-1 bg-dark rounded-xl border border-gold/20 overflow-hidden"
            style={{ zIndex: 20 }}
          >
            {suggestions.map((s, i) => (
              <StyledTouchable
                key={`${s.label}-${i}`}
                className={`px-3 py-2.5 ${i < suggestions.length - 1 ? 'border-b border-gold/10' : ''}`}
                onPress={() => {
                  setPlace(s.label);
                  setSelectedPlace(s);
                  setShowSuggestions(false);
                }}
              >
                <StyledText className="text-light-text text-sm font-sans">{s.label}</StyledText>
              </StyledTouchable>
            ))}
          </StyledView>
        )}
      </StyledView>

      <StyledTouchable
        className="bg-gold rounded-xl py-3.5 items-center"
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}
      >
        <StyledText className="text-dark font-bold">
          {loading ? 'கணிக்கப்படுகிறது... / Generating...' : 'ஜாதகம் காண் / Generate Horoscope'}
        </StyledText>
      </StyledTouchable>
    </StyledView>
  );
}
