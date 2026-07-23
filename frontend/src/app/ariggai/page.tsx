'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

type Report = { id: string; name: string; price: number; description: string };

function ReportsList() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/reports/list')
      .then(r => setReports(r.data))
      .catch(() => toast.error('அறிக்கைகள் ஏற்றுவதில் பிழை'))
      .finally(() => setLoading(false));
  }, []);

  const onBuy = (report: Report) => {
    if (!isLoggedIn) {
      toast('வாங்க உள்நுழைய வேண்டும் / Please login to purchase', { icon: '🔒' });
      router.push('/login');
      return;
    }
    toast.success(`${report.name} — கட்டண பக்கத்திற்கு செல்கிறது...`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: 'clamp(20px, 4.8vw, 28px)', marginBottom: '8px' }}>
        📄 ஜோதிட அறிக்கைகள்
      </h1>
      <p style={{ color: '#8B7BAA', marginBottom: '24px' }}>
        தமிழில் PDF அறிக்கை — கட்டணம் செலுத்தி பதிவிறக்கம் செய்யுங்கள்
      </p>

      {loading ? (
        <div style={{ color: '#8B7BAA' }}>ஏற்றுகிறோம்...</div>
      ) : !reports || reports.length === 0 ? (
        <div style={{ color: '#8B7BAA' }}>அறிக்கைகள் இல்லை</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {reports.map(r => (
            <div
              key={r.id}
              style={{
                background: '#251450',
                border: '1px solid #4B2A8F',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                {r.name}
              </div>
              <div style={{ color: '#A89BC8', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px', flex: 1, fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                {r.description}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#FF8C00', fontSize: '20px', fontWeight: 700 }}>₹{r.price}</span>
                <button onClick={() => onBuy(r)} className="btn-gold" style={{ padding: '6px 14px', fontSize: '13px' }}>
                  வாங்க
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AriggaiPage() {
  return <ReportsList />;
}
