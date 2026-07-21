type Props = {
  size?: number;
  showWordmark?: boolean;
  wordmarkColor?: string;
  className?: string;
  animated?: boolean;
};

export default function Logo({ size = 48, showWordmark = false, wordmarkColor = '#FFD700', className, animated = true }: Props) {
  // The Vel is taller than wide — keep visual height = `size` and let width adapt.
  const w = size * 0.55;
  const h = size * 1.15;

  return (
    <div className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <svg
        width={w}
        height={h}
        viewBox="0 0 100 200"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="ௐ Vel logo"
        role="img"
        style={animated ? { animation: 'logo-breathe 3.5s ease-in-out infinite' } : undefined}
      >
        <defs>
          {/* Premium gold gradient */}
          <linearGradient id="velGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF3C4" />
            <stop offset="25%" stopColor="#FFE17B" />
            <stop offset="55%" stopColor="#FFD700" />
            <stop offset="85%" stopColor="#C9A227" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>
          {/* Stem darker gradient */}
          <linearGradient id="velStem" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C9A227" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>
          {/* Soft glow */}
          <filter id="velGlow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="1.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Drop shadow */}
          <filter id="velShadow" x="-10%" y="-10%" width="120%" height="125%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#000" floodOpacity="0.35" />
          </filter>
          {/* Animated shine gradient */}
          <linearGradient id="velShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFAE5" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FFFAE5" stopOpacity="0" />
          </linearGradient>
          {/* Clip to Vel shape so the shine stays inside */}
          <clipPath id="velClip">
            {/* Leaf head */}
            <path d="M 50 8
                     C 28 22, 22 55, 28 90
                     L 38 96 L 50 100 L 62 96 L 72 90
                     C 78 55, 72 22, 50 8 Z" />
            {/* Lotus bracket */}
            <path d="M 28 88 Q 26 100 35 108 L 65 108 Q 74 100 72 88 L 65 92 L 60 100 L 50 105 L 40 100 L 35 92 Z" />
            {/* Stem & bands */}
            <rect x="44" y="108" width="12" height="55" />
            {/* Base */}
            <rect x="36" y="163" width="28" height="6" rx="1" />
            <rect x="30" y="169" width="40" height="6" rx="1" />
            <rect x="24" y="175" width="52" height="9" rx="2" />
          </clipPath>
        </defs>

        <g filter="url(#velShadow)">
          {/* === LEAF HEAD === */}
          <g filter="url(#velGlow)">
            <path
              d="M 50 8
                 C 28 22, 22 55, 28 90
                 L 38 96 L 50 100 L 62 96 L 72 90
                 C 78 55, 72 22, 50 8 Z"
              fill="url(#velGold)"
              stroke="#8B6914"
              strokeWidth="0.8"
            />
            {/* Inner outline (etched) */}
            <path
              d="M 50 18
                 C 35 28, 30 55, 35 86
                 L 50 92 L 65 86
                 C 70 55, 65 28, 50 18 Z"
              fill="none"
              stroke="#8B6914"
              strokeWidth="0.6"
              opacity="0.55"
            />
          </g>

          {/* === ௐ INSIDE LEAF === */}
          <text
            x="50"
            y="72"
            textAnchor="middle"
            fontFamily='"Noto Serif Tamil", "Noto Sans Tamil", "Latha", serif'
            fontSize="50"
            fontWeight={700}
            fill="#8B6914"
          >
            ௐ
          </text>

          {/* === LOTUS / DECORATIVE BRACKET BELOW LEAF === */}
          <g>
            {/* Outer petals frame */}
            <path
              d="M 28 88
                 Q 26 100 35 108
                 L 65 108
                 Q 74 100 72 88
                 L 65 92 L 60 100 L 50 105 L 40 100 L 35 92 Z"
              fill="url(#velGold)"
              stroke="#8B6914"
              strokeWidth="0.6"
            />
            {/* Center lotus petal accent */}
            <path
              d="M 45 96 Q 50 90 55 96 Q 52 102 50 104 Q 48 102 45 96 Z"
              fill="#FFF3C4"
              opacity="0.7"
            />
            <line x1="50" y1="95" x2="50" y2="105" stroke="#8B6914" strokeWidth="0.6" />
            <line x1="43" y1="98" x2="46" y2="103" stroke="#8B6914" strokeWidth="0.5" />
            <line x1="57" y1="98" x2="54" y2="103" stroke="#8B6914" strokeWidth="0.5" />
          </g>

          {/* === STEM === */}
          <rect x="44" y="108" width="12" height="55" fill="url(#velStem)" stroke="#8B6914" strokeWidth="0.5" />
          {/* Ribbed bands */}
          <rect x="41" y="118" width="18" height="3" fill="url(#velGold)" stroke="#8B6914" strokeWidth="0.4" />
          <rect x="41" y="135" width="18" height="3" fill="url(#velGold)" stroke="#8B6914" strokeWidth="0.4" />
          <rect x="41" y="152" width="18" height="3" fill="url(#velGold)" stroke="#8B6914" strokeWidth="0.4" />

          {/* === STEPPED BASE === */}
          <rect x="36" y="163" width="28" height="6" rx="1" fill="url(#velGold)" stroke="#8B6914" strokeWidth="0.5" />
          <rect x="30" y="169" width="40" height="6" rx="1" fill="url(#velGold)" stroke="#8B6914" strokeWidth="0.5" />
          <rect x="24" y="175" width="52" height="9" rx="2" fill="url(#velGold)" stroke="#8B6914" strokeWidth="0.5" />

          {/* === ANIMATED SHINE — clipped to the Vel shape === */}
          {animated && (
            <g clipPath="url(#velClip)">
              <rect
                x="-30"
                y="0"
                width="22"
                height="200"
                fill="url(#velShine)"
                transform="skewX(-20)"
                style={{ animation: 'vel-shine 3.2s ease-in-out infinite' }}
              />
            </g>
          )}

          {/* === SPARKLE AT TIP === */}
          {animated && (
            <g style={{ animation: 'vel-spark 2.2s ease-in-out infinite', transformOrigin: '50px 8px' }}>
              <circle cx="50" cy="8" r="2.2" fill="#FFFFFF" opacity="0.9" />
              <path d="M 50 2 L 50 14 M 44 8 L 56 8" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.85" />
            </g>
          )}
        </g>
      </svg>

      {showWordmark && (
        <div style={{ lineHeight: 1.1 }}>
          <div style={{
            fontFamily: 'Noto Serif Tamil, serif',
            color: wordmarkColor,
            fontSize: size * 0.42,
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}>
            தமிழ்வேலன்
          </div>
          <div style={{
            color: '#A89BC8',
            fontSize: size * 0.22,
            fontFamily: 'system-ui, sans-serif',
            marginTop: '2px'
          }}>
            TamilVelan
          </div>
        </div>
      )}
    </div>
  );
}
