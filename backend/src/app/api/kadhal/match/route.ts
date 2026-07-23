import { NextRequest, NextResponse } from 'next/server';

function nameScore(name: string): number {
  return Array.from(name.toLowerCase().replace(/[^a-z஀-௿]/g, ''))
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, string>;
  const { name1, name2 } = body;
  if (!name1 || !name2) {
    return NextResponse.json({ error: 'இரு பெயர்களும் தேவை' }, { status: 400 });
  }

  const seed = (nameScore(name1) * 31 + nameScore(name2) * 17) % 101;
  const percentage = Math.max(35, Math.min(99, seed));

  let verdict = '';
  if (percentage >= 80) verdict = 'அற்புதமான பொருத்தம் — மிக நெருக்கமான காதல்.';
  else if (percentage >= 60) verdict = 'நல்ல பொருத்தம் — மரியாதையும் புரிதலும் வளரும்.';
  else if (percentage >= 45) verdict = 'மிதமான பொருத்தம் — பொறுமை அவசியம்.';
  else verdict = 'பொருத்தம் குறைவு — நட்பாக தொடரலாம்.';

  return NextResponse.json({
    name1,
    name2,
    percentage,
    verdict,
    traits: {
      trust: Math.min(99, percentage + 5),
      communication: Math.max(20, percentage - 8),
      passion: Math.min(99, percentage + 2),
      stability: Math.max(20, percentage - 5)
    }
  });
}
