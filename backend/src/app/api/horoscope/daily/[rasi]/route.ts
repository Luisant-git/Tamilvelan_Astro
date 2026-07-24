import { NextResponse } from 'next/server';
import { RASI_NAMES_TAMIL } from '../../../../../lib/astrology';

const PREDICTIONS = [
  'இன்று உங்களுக்கு அனுகூலமான நாள். புதிய திட்டங்களை தொடங்கலாம்.',
  'குடும்பத்தினருடன் நேரம் செலவிட சிறந்த நாள். உறவுகள் வலுப்படும்.',
  'தொழிலில் முன்னேற்றம் உண்டாகும். நிதி விஷயங்களில் கவனம் தேவை.',
  'ஆரோக்கியத்தில் கவனம் செலுத்துங்கள். உடற்பயிற்சி நன்மை தரும்.',
  'புதிய நண்பர்களை சந்திக்கும் வாய்ப்பு. சமூக நடவடிக்கைகள் வெற்றி பெறும்.'
];

function getDailyPrediction(rasi: number, dateStr: string): string {
  const seed = (rasi * 7 + parseInt(dateStr.replace(/-/g, ''))) % PREDICTIONS.length;
  return PREDICTIONS[seed];
}

export async function GET(_req: Request, { params }: { params: { rasi: string } }) {
  const rasi = parseInt(params.rasi, 10);
  if (Number.isNaN(rasi) || rasi < 1 || rasi > 12) {
    return NextResponse.json({ error: 'சரியான ராசி எண் தேவை (1-12)' }, { status: 400 });
  }
  const today = new Date().toISOString().split('T')[0];
  return NextResponse.json({
    rasi,
    rasiName: RASI_NAMES_TAMIL[rasi - 1],
    date: today,
    prediction: getDailyPrediction(rasi, today)
  });
}
