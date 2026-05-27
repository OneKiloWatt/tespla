import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import '@/styles/globals.css';

const noto = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-noto',
});

export const metadata: Metadata = {
  title: 'テスプラ - テスト対策プランナー',
  description: '中学生・高校生のためのテスト勉強計画アプリ',
  icons: { icon: '/icon.png', apple: '/icon.png' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={noto.variable}>
      <body>
        <div className="max-w-md mx-auto min-h-screen flex flex-col bg-bg-base">
          {children}
        </div>
      </body>
    </html>
  );
}
