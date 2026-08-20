'use client';

import { PLANET_SHORT_TAMIL } from '@/lib/planetLabels';

// South-Indian fixed grid (Mesham at top-left position 1, going clockwise)
const GRID_TO_RASI: Array<number | null> = [
  12, 1,  2, 3,
  11, null, null, 4,
  10, null, null, 5,
   9, 8,  7, 6
];

type PlanetByRasi = Record<number, string[]>;

type RasiChartProps = {
  title: string;
  centerLabel: string;
  lagnaRasi: number;
  planetsByRasi: PlanetByRasi;
};

function ChartGrid({ title, centerLabel, lagnaRasi, planetsByRasi }: RasiChartProps) {
  const CELL = 90;
  const COLS = 4;
  const W = CELL * COLS;
  const H = CELL * COLS;

  return (
    <div style={{
      background: '#1A0E3A',
      border: '1px solid #4B2A8F',
      borderRadius: '16px',
      overflow: 'hidden'
    }}>
      <div style={{
        background: '#251450',
        color: '#FFD700',
        padding: '10px 14px',
        fontSize: '15px',
        fontWeight: 600,
        fontFamily: 'Noto Serif Tamil, serif',
        textAlign: 'center',
        borderBottom: '1px solid #4B2A8F'
      }}>
        {title}
      </div>
      <div style={{ padding: '12px' }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', maxWidth: '380px', margin: '0 auto' }}>
          <rect width={W} height={H} fill="#0D0620" rx={8} />
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
                  <g key={pos}>
                    <rect
                      x={CELL} y={CELL} width={CELL * 2} height={CELL * 2}
                      fill="#251450" stroke="#8B6914" strokeWidth={1.5}
                    />
                    <text
                      x={CELL * 2} y={CELL * 2.05}
                      textAnchor="middle" fill="#FFD700"
                      fontSize={18} fontWeight={700}
                      fontFamily="Noto Serif Tamil, serif"
                    >
                      {centerLabel}
                    </text>
                  </g>
                );
              }
              return null;
            }

            return (
              <g key={pos}>
                <rect
                  x={x} y={y} width={CELL} height={CELL}
                  fill={isLagna ? '#2A1A50' : '#1A0E3A'}
                  stroke={isLagna ? '#FFD700' : '#4B2A8F'}
                  strokeWidth={isLagna ? 1.5 : 0.8}
                />
                <text x={x + 5} y={y + 13} fill="#8B6914" fontSize={9} fontFamily="sans-serif">{rasi}</text>
                {isLagna && (
                  <text x={x + CELL - 14} y={y + 13} fill="#FFD700" fontSize={11} fontWeight={700}>ல</text>
                )}
                {here.slice(0, 5).map((planetCode, i) => (
                  <text
                    key={planetCode + i}
                    x={x + CELL / 2}
                    y={y + 30 + i * 14}
                    textAnchor="middle"
                    fill={isLagna ? '#FFD700' : '#FF8C00'}
                    fontSize={11}
                    fontWeight={500}
                    fontFamily="Noto Sans Tamil, sans-serif"
                  >
                    {planetCode}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

type Props = {
  lagnaRasi: number;
  planets: Record<string, { rasi: number }>;
  navamsaLagna: number;
  navamsa: Record<string, { rasi: number }>;
};

export default function HoroscopeCharts({ lagnaRasi, planets, navamsaLagna, navamsa }: Props) {
  const groupByRasi = (data: Record<string, { rasi: number }>): PlanetByRasi => {
    const map: PlanetByRasi = {};
    Object.entries(data).forEach(([name, d]) => {
      if (!map[d.rasi]) map[d.rasi] = [];
      map[d.rasi].push(PLANET_SHORT_TAMIL[name] || name.slice(0, 3));
    });
    return map;
  };

  const rasiByPlanet = groupByRasi(planets);
  const navByPlanet = groupByRasi(navamsa);

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px',
        marginBottom: '16px'
      }}>
        <ChartGrid title="ராசி கட்டம்" centerLabel="ராசி" lagnaRasi={lagnaRasi} planetsByRasi={rasiByPlanet} />
        <ChartGrid title="நவாம்சம் கட்டம்" centerLabel="நவாம்சம்" lagnaRasi={navamsaLagna} planetsByRasi={navByPlanet} />
      </div>
      <div style={{
        background: '#1A0E3A',
        border: '1px solid #4B2A8F',
        color: '#D4C5F0',
        borderRadius: '999px',
        padding: '10px 16px',
        fontSize: '12px',
        fontFamily: 'Noto Sans Tamil, sans-serif',
        textAlign: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px',
        rowGap: '6px'
      }}>
        <span>சூரியன் (Sun)</span><span style={{ color: '#4B2A8F' }}>|</span>
        <span>சந்திரன் (Moon)</span><span style={{ color: '#4B2A8F' }}>|</span>
        <span>செவ்வாய் (Mar)</span><span style={{ color: '#4B2A8F' }}>|</span>
        <span>புதன் (Mer)</span><span style={{ color: '#4B2A8F' }}>|</span>
        <span>சனி (Sat)</span><span style={{ color: '#4B2A8F' }}>|</span>
        <span>குரு (Jup)</span><span style={{ color: '#4B2A8F' }}>|</span>
        <span>சுக்கிரன் (Ven)</span><span style={{ color: '#4B2A8F' }}>|</span>
        <span>ராகு (Rah)</span><span style={{ color: '#4B2A8F' }}>|</span>
        <span>கேது (Ket)</span>
      </div>
    </div>
  );
}
