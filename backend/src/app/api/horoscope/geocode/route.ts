import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

type Suggestion = {
  label: string;
  latitude: number;
  longitude: number;
  country?: string;
  state?: string;
  timezone?: string;
};

type OpenMeteoResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  admin2?: string;
  timezone?: string;
};

type GoogleResult = {
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  address_components?: Array<{ types: string[]; long_name: string }>;
};

export async function GET(req: NextRequest) {
  const place = req.nextUrl.searchParams.get('place')?.trim();
  if (!place || place.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const googleKey = process.env.GOOGLE_MAPS_API_KEY;
  if (googleKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=${googleKey}`;
      const r = await axios.get(url, { timeout: 5000 });
      const suggestions: Suggestion[] = (r.data.results || []).slice(0, 8).map((res: GoogleResult) => {
        const comps = res.address_components || [];
        const country = comps.find(c => c.types.includes('country'))?.long_name;
        const state = comps.find(c => c.types.includes('administrative_area_level_1'))?.long_name;
        return {
          label: res.formatted_address,
          latitude: res.geometry.location.lat,
          longitude: res.geometry.location.lng,
          country, state
        };
      });
      if (suggestions.length > 0) return NextResponse.json({ suggestions });
    } catch { /* fall through */ }
  }

  // Open-Meteo geocoding — free, no auth, designed for city-level lookups
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=10&language=en&format=json`;
    const r = await axios.get(url, { timeout: 8000 });
    const suggestions: Suggestion[] = ((r.data.results as OpenMeteoResult[]) || []).map(res => {
      const parts = [res.name, res.admin2, res.admin1, res.country].filter(Boolean);
      return {
        label: parts.join(', '),
        latitude: res.latitude,
        longitude: res.longitude,
        country: res.country,
        state: res.admin1,
        timezone: res.timezone
      };
    });
    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error('geocode error:', (err as Error).message);
    return NextResponse.json({ suggestions: [], error: 'இட தேடல் தோல்வி' }, { status: 500 });
  }
}
