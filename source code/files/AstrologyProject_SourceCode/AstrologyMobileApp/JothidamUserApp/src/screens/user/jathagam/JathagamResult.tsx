import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { styled } from '../../../utils/styled';
import type { ChartData } from './JathagamScreen';
import RasiNavamsaCharts from './RasiNavamsaCharts';
import { formatYearsMonthsDays } from '../../../utils/horoscopeExport';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);

const PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

function SectionCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <StyledView className="bg-dark-card rounded-2xl border border-gold/10 mb-3 overflow-hidden">
      <StyledView className="bg-[#32205A] px-4 py-3">
        <StyledText className="text-gold text-base font-serif font-bold">
          {icon} {title}
        </StyledText>
      </StyledView>
      <StyledView className="p-3">{children}</StyledView>
    </StyledView>
  );
}

function KeyDetailRow({ label, value, i }: { label: string; value: string; i: number }) {
  return (
    <StyledView
      className="flex-row px-2 py-2 rounded-lg"
      style={{ backgroundColor: i % 2 === 0 ? '#1A0E3A' : '#251450' }}
    >
      <StyledText className="text-[#D4C5F0] text-xs font-sans flex-1" numberOfLines={2}>
        {label}
      </StyledText>
      <StyledText className="text-gold text-xs font-sans flex-1" numberOfLines={2}>
        {value}
      </StyledText>
    </StyledView>
  );
}

function DoshamRow({
  label,
  present,
  templeUrl,
  templeLabel,
  i,
}: {
  label: string;
  present: boolean;
  templeUrl: string;
  templeLabel: string;
  i: number;
}) {
  return (
    <StyledView
      className="flex-row items-center px-2 py-2.5 rounded-lg mb-1"
      style={{ backgroundColor: i % 2 === 0 ? '#1A0E3A' : '#251450' }}
    >
      <StyledText className="text-[#D4C5F0] text-xs font-sans flex-1">{label}</StyledText>
      <StyledText
        className="text-xs font-sans font-bold flex-1 text-center"
        style={{ color: present ? '#FF6B6B' : '#4CAF50' }}
      >
        {present ? 'Dosha Present' : 'Dosha not Present'}
      </StyledText>
      <StyledTouchable className="flex-1" onPress={() => Linking.openURL(templeUrl)}>
        <StyledText className="text-gold text-xs font-sans text-center underline">{templeLabel}</StyledText>
      </StyledTouchable>
    </StyledView>
  );
}

function PapaRow({ label, value, i }: { label: string; value: number; i: number }) {
  return (
    <StyledView
      className="flex-row px-2 py-2 rounded-lg"
      style={{ backgroundColor: i % 2 === 0 ? '#1A0E3A' : '#251450' }}
    >
      <StyledText className="text-[#D4C5F0] text-xs font-sans flex-1">{label}</StyledText>
      <StyledText className="text-gold text-xs font-sans flex-1 text-center">{value}%</StyledText>
    </StyledView>
  );
}

export default function JathagamResult({ data }: { data: ChartData }) {
  const { chart } = data;
  const [expandedLord, setExpandedLord] = useState<string | null>(null);

  const keyDetails: Array<[string, string]> = [
    ['பெயர்', chart.birthInfo.fullName],
    ['பிறந்த தேதி', chart.birthInfo.dobFormatted],
    ['பிறந்த நேரம்', chart.birthInfo.birthTime],
    ['பிறந்த இடம்', chart.birthInfo.birthPlace],
    ['அட்சரேகை', chart.birthInfo.latitude.toFixed(7)],
    ['தீர்க்க ரேகை', chart.birthInfo.longitude.toFixed(7)],
    ['லக்னம்', chart.lagna.rasiTamil],
    ['லக்னம் அதிபதி', chart.lagna.lord],
    ['ராசி', chart.rasi.nameTamil],
    ['நட்சத்திரம்', `${chart.nakshatra.nameTamil} - ${chart.nakshatra.pada} பாதம்`],
    ['திதி', chart.tithi.nameTamil],
    ['வளர்பிறை/தேய்பிறை', chart.tithi.paksha],
    ['அயனாம்சம் பெயர்', chart.ayanamsaName],
    ['அயனாம்சம்', chart.ayanamsa.toFixed(10)],
    ['இருப்பு தசா', `${chart.dasha.balanceLordTamil} ${formatYearsMonthsDays(chart.dasha.balanceYears)}`],
  ];

  const doshamRows = [
    { label: 'சனி தோஷம்', present: chart.dosham.saniDosha.present, url: chart.dosham.saniDosha.templeUrl, templeLabel: 'Saneeswaran Temples' },
    { label: 'செவ்வாய் தோஷம்', present: chart.dosham.chevvaiDosha.present, url: chart.dosham.chevvaiDosha.templeUrl, templeLabel: 'Mars Temples' },
    { label: 'சர்ப்ப தோஷம்', present: chart.dosham.sarpaDosha.present, url: chart.dosham.sarpaDosha.templeUrl, templeLabel: 'Rahu / Ketu Temples' },
  ];

  return (
    <StyledView className="mt-4">
      {/* 1. முக்கிய விவரங்கள் */}
      <SectionCard icon="👤" title="முக்கிய விவரங்கள்">
        {keyDetails.map(([label, value], i) => (
          <KeyDetailRow key={label} label={label} value={value} i={i} />
        ))}
      </SectionCard>

      {/* 2. ராசி கட்டம் / நவாம்சம் கட்டம் */}
      <SectionCard icon="📊" title="ராசி கட்டம் / நவாம்சம் கட்டம்">
        <RasiNavamsaCharts
          lagnaRasi={chart.lagna.rasi}
          planets={chart.planets}
          navamsaLagna={chart.navamsaLagna}
          navamsa={chart.navamsa}
        />
      </SectionCard>

      {/* 3. தோஷம் */}
      <SectionCard icon="⚠️" title="தோஷம்">
        {doshamRows.map((r, i) => (
          <DoshamRow key={r.label} label={r.label} present={r.present} templeUrl={r.url} templeLabel={r.templeLabel} i={i} />
        ))}
        <StyledView className="mt-2">
          <PapaRow label="பாப குறியீடு [லக்னம்]" value={chart.dosham.papaPercent.lagna} i={0} />
          <PapaRow label="பாப குறியீடு [சந்திரன்]" value={chart.dosham.papaPercent.moon} i={1} />
          <PapaRow label="பாப குறியீடு [சுக்கிரன்]" value={chart.dosham.papaPercent.venus} i={2} />
        </StyledView>
      </SectionCard>

      {/* 4. நடப்பு தசா புக்தி */}
      <SectionCard icon="🕉️" title="நடப்பு தசா புக்தி">
        {chart.currentMd && chart.currentBhukti ? (
          <StyledView className="flex-row" style={{ gap: 10 }}>
            <StyledView className="flex-1 bg-dark rounded-2xl border border-[#4B2A8F] p-3">
              <StyledText className="text-[#A89BC8] text-[11px] font-sans mb-1">நடப்பு மகா தசை</StyledText>
              <StyledText className="text-gold text-lg font-serif font-bold">{chart.currentMd.lordTamil}</StyledText>
              <StyledText className="text-[#8B7BAA] text-[11px] font-sans mt-1">
                {chart.currentMd.startDate} → {chart.currentMd.endDate}
              </StyledText>
            </StyledView>
            <StyledView className="flex-1 bg-dark rounded-2xl border border-[#8B6914] p-3">
              <StyledText className="text-[#A89BC8] text-[11px] font-sans mb-1">நடப்பு புக்தி</StyledText>
              <StyledText className="text-saffron text-lg font-serif font-bold">{chart.currentBhukti.lordTamil}</StyledText>
              <StyledText className="text-[#8B7BAA] text-[11px] font-sans mt-1">
                {chart.currentBhukti.startDate} → {chart.currentBhukti.endDate}
              </StyledText>
            </StyledView>
          </StyledView>
        ) : (
          <StyledText className="text-[#8B7BAA] text-sm font-sans">நடப்பு தசை தகவல் இல்லை</StyledText>
        )}
      </SectionCard>

      {/* 5. கிரக நிலைகள் */}
      <SectionCard icon="🪐" title="கிரக நிலைகள்">
        <StyledView className="flex-row bg-[#32205A] rounded-t-lg px-2 py-2">
          <StyledText className="text-gold text-[10px] font-sans font-bold flex-1">கிரகம்</StyledText>
          <StyledText className="text-gold text-[10px] font-sans font-bold flex-1">ராசி</StyledText>
          <StyledText className="text-gold text-[10px] font-sans font-bold flex-1">பாகை</StyledText>
          <StyledText className="text-gold text-[10px] font-sans font-bold flex-1">நட்சத்திரம்</StyledText>
          <StyledText className="text-gold text-[10px] font-sans font-bold" style={{ width: 28, textAlign: 'center' }}>
            பாதம்
          </StyledText>
        </StyledView>
        {PLANET_ORDER.filter((name) => chart.planets[name]).map((name, i) => {
          const p = chart.planets[name];
          return (
            <StyledView
              key={name}
              className="flex-row px-2 py-2"
              style={{ backgroundColor: i % 2 === 0 ? '#1A0E3A' : '#251450' }}
            >
              <StyledText className="text-light-text text-xs font-sans flex-1">{p.nameTamil}</StyledText>
              <StyledText className="text-light-text/80 text-xs font-sans flex-1">{p.rasiNameTamil}</StyledText>
              <StyledText className="text-saffron text-xs font-sans flex-1">{p.degInRasiStr}</StyledText>
              <StyledText className="text-light-text/60 text-xs font-sans flex-1">{p.nakshatraTamil}</StyledText>
              <StyledText className="text-[#A89BC8] text-xs font-sans" style={{ width: 28, textAlign: 'center' }}>
                {p.pada}
              </StyledText>
            </StyledView>
          );
        })}
      </SectionCard>

      {/* 6. தசா புக்தி விவரங்கள் – 120 வருட பகுப்பாய்வு */}
      <SectionCard icon="📅" title="தசா புக்தி விவரங்கள் - 120 வருட பகுப்பாய்வு">
        {chart.dasha.mahadashas.map((md) => {
          const isOpen = expandedLord === md.lord;
          return (
            <StyledView
              key={md.lord}
              className="rounded-xl mb-2 overflow-hidden border"
              style={{ borderColor: md.isCurrent ? '#FFD700' : '#4B2A8F', backgroundColor: md.isCurrent ? '#2A1A50' : '#1A0E3A' }}
            >
              <StyledTouchable
                className="flex-row items-center justify-between px-3 py-2.5"
                onPress={() => setExpandedLord(isOpen ? null : md.lord)}
                activeOpacity={0.7}
              >
                <StyledView className="flex-row items-center flex-1" style={{ gap: 8 }}>
                  <Ionicons name={isOpen ? 'chevron-down' : 'chevron-forward'} size={14} color="#FF8C00" />
                  <StyledView className="bg-dark-card rounded-full px-3 py-1 border border-[#4B2A8F]">
                    <StyledText className="text-gold text-xs font-sans font-bold">{md.lordTamil}</StyledText>
                  </StyledView>
                  <StyledView className="bg-[#32205A] rounded-full px-2 py-0.5">
                    <StyledText className="text-saffron text-[10px] font-sans">{md.canonicalYears}y</StyledText>
                  </StyledView>
                  {md.isCurrent && (
                    <StyledView className="bg-gold rounded-full px-2 py-0.5">
                      <StyledText className="text-dark text-[10px] font-sans font-bold">நடப்பு</StyledText>
                    </StyledView>
                  )}
                </StyledView>
                <StyledText className="text-[#A89BC8] text-[10px] font-sans">
                  {md.startDate} - {md.endDate}
                </StyledText>
              </StyledTouchable>

              {isOpen && md.bhukti && (
                <StyledView className="border-t border-[#4B2A8F]">
                  <StyledView className="flex-row bg-[#251450] px-3 py-1.5">
                    <StyledText className="text-gold text-[10px] font-sans flex-1">புக்தி</StyledText>
                    <StyledText className="text-gold text-[10px] font-sans flex-1">தொடக்கம்</StyledText>
                    <StyledText className="text-gold text-[10px] font-sans flex-1">முடிவு</StyledText>
                    <StyledText className="text-gold text-[10px] font-sans flex-1">காலம்</StyledText>
                  </StyledView>
                  {md.bhukti.map((bh, i) => (
                    <StyledView
                      key={bh.lord}
                      className="flex-row px-3 py-1.5"
                      style={{ backgroundColor: bh.isCurrent ? '#2A1A50' : i % 2 === 0 ? '#1A0E3A' : '#251450' }}
                    >
                      <StyledText className="text-light-text text-[11px] font-sans flex-1" numberOfLines={1}>
                        {md.lordTamil}-{bh.lordTamil}
                        {bh.isCurrent ? ' ✦' : ''}
                      </StyledText>
                      <StyledText className="text-saffron text-[11px] font-sans flex-1">{bh.startDate}</StyledText>
                      <StyledText className="text-saffron text-[11px] font-sans flex-1">{bh.endDate}</StyledText>
                      <StyledText className="text-[#A89BC8] text-[11px] font-sans flex-1">
                        {formatYearsMonthsDays(bh.years)}
                      </StyledText>
                    </StyledView>
                  ))}
                </StyledView>
              )}
            </StyledView>
          );
        })}
      </SectionCard>
    </StyledView>
  );
}
