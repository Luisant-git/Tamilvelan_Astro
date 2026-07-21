import { NextResponse } from 'next/server';

// Public — anyone can browse the report catalogue.
// Login is enforced only at purchase time (handled client-side).
export async function GET() {
  return NextResponse.json([
    { id: 'full-kundli', name: 'முழு ஜாதக அறிக்கை', price: 199, description: 'பூர்ண ஜாதகம் PDF — தமிழில்' },
    { id: 'marriage', name: 'திருமண பொருத்த அறிக்கை', price: 149, description: '10 பொருத்தம் விரிவான PDF' },
    { id: 'yearly', name: 'வருட பலன் அறிக்கை', price: 299, description: '2026 வருட பலன் — தமிழில்' },
    { id: 'business', name: 'வணிக ஜோதிட அறிக்கை', price: 499, description: 'வணிக வெற்றி ஜோதிட ஆய்வு' }
  ]);
}
