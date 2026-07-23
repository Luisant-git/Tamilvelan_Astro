import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import BackButton from '@/components/BackButton';
import PWARegister from '@/components/PWARegister';

export const metadata: Metadata = {
  title: 'தமிழ்வேலன் / TamilVelan',
  description: 'தமிழ்வேலன் / TamilVelan — தமிழ்நாட்டின் சிறந்த தமிழ் ஜோதிட வலைதளம்',
  manifest: '/manifest.json',
  applicationName: 'தமிழ்வேலன் / TamilVelan',
  appleWebApp: {
    capable: true,
    title: 'தமிழ்வேலன்',
    statusBarStyle: 'black-translucent'
  }
};

export const viewport: Viewport = {
  themeColor: '#1A0E3A',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ta">
      <body>
        <AuthProvider>
          <div className="min-h-screen flex flex-col kolam-bg">
            <Toaster
              position="top-center"
              toastOptions={{
                style: { background: '#251450', color: '#fff', border: '1px solid #4B2A8F' }
              }}
            />
            <Navbar />
            <BackButton />
            <main className="flex-1" style={{ paddingBottom: '76px' }}>{children}</main>
            <Footer />
            <BottomNav />
            <PWARegister />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
