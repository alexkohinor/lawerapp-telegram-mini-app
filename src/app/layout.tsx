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
              font-size: 14px !important;
              line-height: 1.5 !important;
              -webkit-text-size-adjust: 100% !important;
              -ms-text-size-adjust: 100% !important;
              text-rendering: optimizeLegibility !important;
              -webkit-font-smoothing: antialiased !important;
              -moz-osx-font-smoothing: grayscale !important;
            }
            
            /* Адаптивная типографика */
            h1 {
              font-size: clamp(20px, 4vw, 28px) !important;
              font-weight: 700 !important;
              line-height: 1.2 !important;
              margin: 0 0 16px 0 !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
              hyphens: auto !important;
            }
            
            h2 {
              font-size: clamp(16px, 3.5vw, 20px) !important;
              font-weight: 600 !important;
              line-height: 1.3 !important;
              margin: 0 0 12px 0 !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }
            
            h3 {
              font-size: clamp(14px, 3vw, 18px) !important;
              font-weight: 600 !important;
              line-height: 1.4 !important;
              margin: 0 0 8px 0 !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }
            
            p {
              font-size: clamp(12px, 2.5vw, 14px) !important;
              line-height: 1.5 !important;
              margin: 0 0 12px 0 !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }
            
            /* Адаптивные контейнеры */
            .container {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 auto !important;
              padding: 0 16px !important;
              box-sizing: border-box !important;
            }
            
            .container-narrow {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 auto !important;
              padding: 16px !important;
              box-sizing: border-box !important;
            }
            
            /* Адаптивная сетка */
            .grid-responsive {
              display: grid !important;
              grid-template-columns: 1fr !important;
              gap: 16px !important;
              width: 100% !important;
            }
            
            @media (min-width: 480px) {
              .grid-responsive {
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
              }
            }
            
            /* Адаптивные кнопки */
            .btn-responsive {
              width: 100% !important;
              min-width: 0 !important;
              padding: 12px 16px !important;
              font-size: clamp(12px, 2.5vw, 14px) !important;
              white-space: nowrap !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              box-sizing: border-box !important;
            }
            
            /* Адаптивная навигация */
            .nav-responsive {
              display: flex !important;
              width: 100% !important;
              gap: 8px !important;
              overflow-x: auto !important;
              -webkit-overflow-scrolling: touch !important;
              scrollbar-width: none !important;
              -ms-overflow-style: none !important;
            }
            
            .nav-responsive::-webkit-scrollbar {
              display: none !important;
            }
            
            .nav-item {
              flex: 1 !important;
              min-width: 0 !important;
              padding: 8px 12px !important;
              font-size: clamp(11px, 2.2vw, 13px) !important;
              white-space: nowrap !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              text-align: center !important;
              border-radius: 8px !important;
              transition: all 0.2s ease !important;
              box-sizing: border-box !important;
            }
            
            .nav-item.active {
              background: var(--tg-theme-button-color, #2563eb) !important;
              color: var(--tg-theme-button-text-color, #ffffff) !important;
            }
            
            .nav-item:not(.active) {
              background: var(--tg-theme-secondary-bg-color, #f3f4f6) !important;
              color: var(--tg-theme-text-color, #111827) !important;
            }
            
            /* Адаптивные карточки */
            .card-responsive {
              width: 100% !important;
              padding: 16px !important;
              margin: 8px 0 !important;
              border-radius: 12px !important;
              box-sizing: border-box !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }
            
            /* Адаптивный текст */
            .text-responsive {
              font-size: clamp(12px, 2.5vw, 14px) !important;
              line-height: 1.5 !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
              hyphens: auto !important;
            }
            
            .text-small-responsive {
              font-size: clamp(10px, 2vw, 12px) !important;
              line-height: 1.4 !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }
            
            /* Адаптивные отступы */
            .spacing-responsive {
              margin: clamp(8px, 2vw, 16px) 0 !important;
            }
            
            .padding-responsive {
              padding: clamp(12px, 3vw, 16px) !important;
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
              user-select: none !important;
              -webkit-tap-highlight-color: transparent !important;
              touch-action: manipulation !important;
            }
            
            .btn:active {
              transform: scale(0.98) !important;
              opacity: 0.8 !important;
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
            
            .btn-outline {
              background: transparent !important;
              color: var(--tg-theme-button-color, #2563eb) !important;
              border: 1px solid var(--tg-theme-button-color, #2563eb) !important;
              border-radius: 8px !important;
              padding: 12px 16px !important;
              font-weight: 500 !important;
              cursor: pointer !important;
              transition: all 0.2s ease !important;
              display: inline-block !important;
              text-align: center !important;
              font-size: 14px !important;
              user-select: none !important;
              -webkit-tap-highlight-color: transparent !important;
              touch-action: manipulation !important;
            }
            
            .btn-outline:hover {
              background: var(--tg-theme-button-color, #2563eb) !important;
              color: var(--tg-theme-button-text-color, #ffffff) !important;
            }
            
            .btn-outline:active {
              transform: scale(0.98) !important;
              opacity: 0.8 !important;
            }
            
            .btn-outline:disabled {
              opacity: 0.5 !important;
              cursor: not-allowed !important;
              background: var(--tg-theme-secondary-bg-color, #f3f4f6) !important;
              color: var(--tg-theme-hint-color, #6b7280) !important;
              border-color: var(--tg-theme-hint-color, #6b7280) !important;
            }
            
            .flex {
              display: flex !important;
            }
            
            .justify-between {
              justify-content: space-between !important;
            }
            
            .space-y-4 > * + * {
              margin-top: 16px !important;
            }
            
            .container-narrow {
              padding: 16px !important;
              max-width: 100% !important;
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
            
            .section h3 {
              color: var(--tg-theme-text-color, #111827) !important;
              font-size: 16px !important;
              font-weight: 600 !important;
              margin: 0 0 8px 0 !important;
            }
            
            .section p {
              color: var(--tg-theme-hint-color, #6b7280) !important;
              font-size: 14px !important;
              margin: 0 0 12px 0 !important;
              line-height: 1.4 !important;
            }
            
            .space-y-2 > * + * {
              margin-top: 8px !important;
            }
            
            .space-y-3 > * + * {
              margin-top: 12px !important;
            }
            
            .space-y-6 > * + * {
              margin-top: 24px !important;
            }
            
            .grid {
              display: grid !important;
            }
            
            .grid-cols-1 {
              grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
            }
            
            .grid-cols-2 {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
            
            .gap-4 {
              gap: 16px !important;
            }
            
            .gap-6 {
              gap: 24px !important;
            }
            
            .w-full {
              width: 100% !important;
            }
            
            .text-center {
              text-align: center !important;
            }
            
            .text-sm {
              font-size: 14px !important;
            }
            
            .text-lg {
              font-size: 18px !important;
            }
            
            .font-medium {
              font-weight: 500 !important;
            }
            
            .font-semibold {
              font-weight: 600 !important;
            }
            
            .text-gray-500 {
              color: var(--tg-theme-hint-color, #6b7280) !important;
            }
            
            .text-gray-700 {
              color: var(--tg-theme-text-color, #111827) !important;
            }
            
            .border {
              border: 1px solid #e5e7eb !important;
            }
            
            .border-gray-300 {
              border-color: #d1d5db !important;
            }
            
            .rounded {
              border-radius: 4px !important;
            }
            
            .rounded-md {
              border-radius: 6px !important;
            }
            
            .rounded-lg {
              border-radius: 8px !important;
            }
            
            .p-4 {
              padding: 16px !important;
            }
            
            .p-6 {
              padding: 24px !important;
            }
            
            .mb-4 {
              margin-bottom: 16px !important;
            }
            
            .mb-6 {
              margin-bottom: 24px !important;
            }
            
            .mt-4 {
              margin-top: 16px !important;
            }
            
            .mt-6 {
              margin-top: 24px !important;
            }
            
            .input {
              width: 100% !important;
              padding: 12px 16px !important;
              border: 1px solid #d1d5db !important;
              border-radius: 8px !important;
              font-size: 14px !important;
              color: var(--tg-theme-text-color, #111827) !important;
              background: var(--tg-theme-bg-color, #ffffff) !important;
              transition: border-color 0.2s ease !important;
            }
            
            .input:focus {
              outline: none !important;
              border-color: var(--tg-theme-button-color, #2563eb) !important;
              box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
            }
            
            .input::placeholder {
              color: var(--tg-theme-hint-color, #6b7280) !important;
            }
            
            .textarea {
              width: 100% !important;
              padding: 12px 16px !important;
              border: 1px solid #d1d5db !important;
              border-radius: 8px !important;
              font-size: 14px !important;
              color: var(--tg-theme-text-color, #111827) !important;
              background: var(--tg-theme-bg-color, #ffffff) !important;
              transition: border-color 0.2s ease !important;
              resize: vertical !important;
              min-height: 100px !important;
            }
            
            .textarea:focus {
              outline: none !important;
              border-color: var(--tg-theme-button-color, #2563eb) !important;
              box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
            }
            
            .textarea::placeholder {
              color: var(--tg-theme-hint-color, #6b7280) !important;
            }
            
            .label {
              display: block !important;
              font-size: 14px !important;
              font-weight: 500 !important;
              color: var(--tg-theme-text-color, #111827) !important;
              margin-bottom: 8px !important;
            }
            
            .radio-group {
              display: flex !important;
              flex-direction: column !important;
              gap: 12px !important;
            }
            
            .radio-item {
              display: flex !important;
              align-items: flex-start !important;
              gap: 12px !important;
              padding: 16px !important;
              border: 1px solid #e5e7eb !important;
              border-radius: 8px !important;
              cursor: pointer !important;
              transition: all 0.2s ease !important;
            }
            
            .radio-item:hover {
              border-color: var(--tg-theme-button-color, #2563eb) !important;
              background: rgba(37, 99, 235, 0.05) !important;
            }
            
            .radio-item.selected {
              border-color: var(--tg-theme-button-color, #2563eb) !important;
              background: rgba(37, 99, 235, 0.1) !important;
            }
            
            .radio-input {
              margin: 0 !important;
              width: 16px !important;
              height: 16px !important;
              accent-color: var(--tg-theme-button-color, #2563eb) !important;
            }
            
            .radio-content {
              flex: 1 !important;
            }
            
            .radio-title {
              font-size: 16px !important;
              font-weight: 600 !important;
              color: var(--tg-theme-text-color, #111827) !important;
              margin: 0 0 4px 0 !important;
            }
            
            .radio-description {
              font-size: 14px !important;
              color: var(--tg-theme-hint-color, #6b7280) !important;
              margin: 0 !important;
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