import { Inter } from 'next/font/google';
import Script from 'next/script';
import { UserProvider } from '@/contexts/UserContext';
import { TelegramThemeProvider } from '@/components/telegram/TelegramThemeProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'LawerApp - Правовая помощь',
  description: 'AI-консультации и управление спорами в Telegram',
  keywords: ['правовая помощь', 'юрист', 'споры', 'AI', 'Telegram'],
  authors: [{ name: 'LawerApp Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'noindex, nofollow', // Telegram Mini App не должен индексироваться
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          async
        />
      </head>
      <body className={inter.className}>
        <UserProvider>
          <TelegramThemeProvider>
            {children}
          </TelegramThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}