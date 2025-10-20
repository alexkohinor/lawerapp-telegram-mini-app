import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ThemeBridge from '@/components/ThemeBridge';

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
        <meta httpEquiv="Cache-Control" content="public, max-age=300" />
        <meta name="version" content="1.0.0" />
        <script
          src="https://telegram.org/js/telegram-web-app.js"
          async
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --tg-theme-bg-color: #ffffff;
              --tg-theme-text-color: #111827;
              --tg-theme-hint-color: #6b7280;
              --tg-theme-link-color: #2563eb;
              --tg-theme-button-color: #2563eb;
              --tg-theme-button-text-color: #ffffff;
              --tg-theme-secondary-bg-color: #f3f4f6;
            }
            
            body {
              background: var(--tg-theme-bg-color, #ffffff) !important;
              color: var(--tg-theme-text-color, #111827) !important;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            }
            
            .card {
              background: var(--tg-theme-bg-color, #ffffff) !important;
              border: 1px solid #e5e7eb !important;
              border-radius: 12px !important;
              padding: 16px !important;
              margin: 8px 0 !important;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
            }
            
            .btn {
              background: var(--tg-theme-button-color, #2563eb) !important;
              color: var(--tg-theme-button-text-color, #ffffff) !important;
              border: none !important;
              border-radius: 8px !important;
              padding: 12px 16px !important;
              font-weight: 500 !important;
              cursor: pointer !important;
              transition: all 0.2s ease !important;
              display: block !important;
              width: 100% !important;
              text-align: center !important;
              margin: 8px 0 !important;
              font-size: 14px !important;
            }
            
            .btn:hover {
              opacity: 0.9 !important;
              transform: translateY(-1px) !important;
            }
            
            .btn-outline {
              background: transparent !important;
              color: var(--tg-theme-button-color, #2563eb) !important;
              border: 1px solid var(--tg-theme-button-color, #2563eb) !important;
            }
            
            .btn-outline:hover {
              background: var(--tg-theme-button-color, #2563eb) !important;
              color: var(--tg-theme-button-text-color, #ffffff) !important;
            }
            
            .section {
              margin: 16px 0 !important;
            }
            
            .section h2 {
              color: var(--tg-theme-text-color, #111827) !important;
              font-size: 18px !important;
              font-weight: 600 !important;
              margin: 0 0 8px 0 !important;
            }
            
            .section p {
              color: var(--tg-theme-hint-color, #6b7280) !important;
              font-size: 14px !important;
              margin: 0 0 12px 0 !important;
              line-height: 1.4 !important;
            }
            
            .disclaimer {
              background: var(--tg-theme-secondary-bg-color, #f3f4f6) !important;
              color: var(--tg-theme-hint-color, #6b7280) !important;
              padding: 12px !important;
              border-radius: 8px !important;
              font-size: 12px !important;
              text-align: center !important;
              margin: 16px 0 !important;
            }
            
            .contact-link {
              color: var(--tg-theme-link-color, #2563eb) !important;
              text-decoration: underline !important;
              font-size: 14px !important;
              text-align: center !important;
              display: block !important;
              margin: 16px 0 !important;
            }
          `
        }} />
      </head>
      <body className={inter.className}>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
          <ThemeBridge />
      </body>
    </html>
  );
}