import { View, Text, LayoutChangeEvent } from 'react-native';
import { useState } from 'react';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { styled } from '../../../utils/styled';

const StyledView = styled(View);
const StyledText = styled(Text);

// South-Indian fixed grid (Mesham/Aries at top-left position 1, going
// clockwise) — mirrors source/src/components/HoroscopeChart.tsx exactly so
// the mobile chart matches the website's layout.
const GRID_TO_RASI: Array<number | null> = [
  12, 1, 2, 3,
  11, null, null, 4,
  10, null, null, 5,
  9, 8, 7, 6,
];

const PLANET_SHORT_TAMIL: Record<string, string> = {
  Sun: 'சூரி', Moon: 'சந்', Mars: 'செவ்', Mercury: 'புதன்',
  Jupiter: 'குரு', Venus: 'சுக்', Saturn: 'சனி', Rahu: 'ராகு', Ketu: 'கேது',
};

export type PlanetByRasi = Record<number, string[]>;

// Exported so PoruthamScreen's Marriage Match result can draw each side's own
// single Rasi Chakkaram (bride/groom individually) using the identical
// chart-drawing logic, instead of duplicating it — mirrors the website's
// porutham/page.tsx, which reuses its own MiniRasiChart the same way for both.
export function groupByRasi(data: Record<string, { rasi: number }>): PlanetByRasi {
  const map: PlanetByRasi = {};
  Object.entries(data).forEach(([name, d]) => {
    if (!map[d.rasi]) map[d.rasi] = [];
    map[d.rasi].push(PLANET_SHORT_TAMIL[name] || name.slice(0, 3));
  });
  return map;
}

const BASE_CELL = 78;
const COLS = 4;
const BASE_SIZE = BASE_CELL * COLS;
// Upper bound so the chart doesn't balloon to an unwieldy size on tablets
// now that it's full-width instead of squeezed into half a row.
const MAX_SIZE = 380;

export function ChartGrid({
  title,
  centerLabel,
  lagnaRasi,
  planetsByRasi,
}: {
  title: string;
  centerLabel: string;
  lagnaRasi: number;
  planetsByRasi: PlanetByRasi;
}) {
  // The chart used to render at a fixed 312px inside a squeezed flex column
  // (two side by side) — on narrower Android screens that fixed size didn't
  // fit the shrunk column, so it overlapped/overflowed and rendered
  // illegibly small. Now that each chart is full-width and stacked, size it
  // off the card's own measured width instead of a constant, so it always
  // fills the available space (minus the card's own padding) with no
  // overflow, and scale every font size / offset in SvgGroup proportionally
  // so text stays readable and correctly centered at any size.
  const [bodyWidth, setBodyWidth] = useState(0);
  const onBodyLayout = (e: LayoutChangeEvent) => setBodyWidth(e.nativeEvent.layout.width);

  const SIZE = bodyWidth > 0 ? Math.min(bodyWidth, MAX_SIZE) : BASE_SIZE;
  const CELL = SIZE / COLS;
  const scale = CELL / BASE_CELL;

  return (
    <StyledView className="bg-dark rounded-2xl border border-gold/20 overflow-hidden w-full">
      <StyledView className="bg-dark-card px-3 py-2.5 border-b border-gold/20">
        <StyledText className="text-gold text-sm font-serif font-bold text-center">{title}</StyledText>
      </StyledView>
      <StyledView className="items-center p-3" onLayout={onBodyLayout}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Rect width={SIZE} height={SIZE} fill="#0D0620" rx={8} />
          {Array.from({ length: 16 }, (_, pos) => {
            const rasi = GRID_TO_RASI[pos];
            const isCenter = [5, 6, 9, 10].includes(pos);
            const isLagna = rasi === lagnaRasi;
            const here = rasi ? planetsByRasi[rasi] || [] : [];
            const col = pos % COLS;
            const row = Math.floor(pos / COLS);
            const x = col * CELL;
            const y = row * CELL;

            if (isCenter) {
              if (pos === 5) {
                return (
                  <Rect
                    key={pos}
                    x={CELL}
                    y={CELL}
                    width={CELL * 2}
                    height={CELL * 2}
                    fill="#251450"
                    stroke="#8B6914"
                    strokeWidth={1.5}
                  />
                );
              }
              return null;
            }

            return (
              <SvgGroup
                key={pos}
                x={x}
                y={y}
                cell={CELL}
                scale={scale}
                rasi={rasi as number}
                isLagna={isLagna}
                planets={here}
              />
            );
          })}
          <SvgText
            x={SIZE / 2}
            y={SIZE / 2 + 5 * scale}
            textAnchor="middle"
            fill="#FFD700"
            fontSize={16 * scale}
            fontWeight="700"
          >
            {centerLabel}
          </SvgText>
        </Svg>
      </StyledView>
    </StyledView>
  );
}

function SvgGroup({
  x,
  y,
  cell,
  scale,
  rasi,
  isLagna,
  planets,
}: {
  x: number;
  y: number;
  cell: number;
  scale: number;
  rasi: number;
  isLagna: boolean;
  planets: string[];
}) {
  return (
    <>
      <Rect
        x={x}
        y={y}
        width={cell}
        height={cell}
        fill={isLagna ? '#2A1A50' : '#1A0E3A'}
        stroke={isLagna ? '#FFD700' : '#4B2A8F'}
        strokeWidth={isLagna ? 1.5 : 0.8}
      />
      <SvgText x={x + 4 * scale} y={y + 11 * scale} fill="#8B6914" fontSize={8 * scale}>
        {rasi}
      </SvgText>
      {isLagna && (
        <SvgText x={x + cell - 13 * scale} y={y + 12 * scale} fill="#FFD700" fontSize={10 * scale} fontWeight="700">
          ல
        </SvgText>
      )}
      {planets.slice(0, 4).map((code, i) => (
        <SvgText
          key={code + i}
          x={x + cell / 2}
          y={y + 26 * scale + i * 12 * scale}
          textAnchor="middle"
          fill={isLagna ? '#FFD700' : '#FF8C00'}
          fontSize={9.5 * scale}
          fontWeight="500"
        >
          {code}
        </SvgText>
      ))}
    </>
  );
}

interface Props {
  lagnaRasi: number;
  planets: Record<string, { rasi: number }>;
  navamsaLagna: number;
  navamsa: Record<string, { rasi: number }>;
}

export default function RasiNavamsaCharts({ lagnaRasi, planets, navamsaLagna, navamsa }: Props) {
  const rasiByPlanet = groupByRasi(planets);
  const navByPlanet = groupByRasi(navamsa);

  return (
    <StyledView>
      <StyledView style={{ gap: 16 }}>
        <ChartGrid title="ராசி கட்டம்" centerLabel="ராசி" lagnaRasi={lagnaRasi} planetsByRasi={rasiByPlanet} />
        <ChartGrid title="நவாம்சம் கட்டம்" centerLabel="நவாம்சம்" lagnaRasi={navamsaLagna} planetsByRasi={navByPlanet} />
      </StyledView>
      <StyledView className="bg-dark rounded-full border border-gold/20 px-3 py-2.5 mt-3">
        <StyledText className="text-light-text/60 text-[11px] font-sans text-center">
          சூரியன் (Sun) · சந்திரன் (Moon) · செவ்வாய் (Mar) · புதன் (Mer) · குரு (Jup) · சுக்கிரன் (Ven) · சனி (Sat) · ராகு (Rah) · கேது (Ket)
        </StyledText>
      </StyledView>
    </StyledView>
  );
}
