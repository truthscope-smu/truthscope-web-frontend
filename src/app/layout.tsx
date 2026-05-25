import type { Metadata } from 'next';
import './globals.css';
import { Navbar, Footer } from '@/04-widgets';

export const metadata: Metadata = {
  title: 'TruthScope — AI 뉴스 신뢰도 분석',
  description: 'AI 기반 뉴스 팩트체크 및 신뢰도 분석 서비스',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
