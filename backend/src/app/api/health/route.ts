import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'தமிழ்வேலன் API இயங்குகிறது' });
}
