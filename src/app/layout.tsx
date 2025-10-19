import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TelegramProvider } from '@/lib/telegram/telegram-auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LawerApp - Правовая помощь',
  description: 'Telegram Mini App для правовой помощи и консультаций',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0088cc',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        <TelegramProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </TelegramProvider>
      </body>
    </html>
  );
}