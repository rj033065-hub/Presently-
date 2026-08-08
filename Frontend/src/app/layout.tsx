import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://presently.ai';

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} – AI-Powered Gift Recommendation Platform`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    'AI gift finder',
    'personalized gift recommendations',
    'gift concierge',
    'thoughtful gifts AI',
    'recipient survey',
    'gift wishlists',
    'unboxing reviews',
  ],
  authors: [{ name: 'Presently Team', url: siteUrl }],
  creator: 'Presently AI Inc.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: `${APP_NAME} – Gift Giving, Reimagined by AI`,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Presently AI Gift Recommendation Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} – AI Gift Recommendation Platform`,
    description: APP_DESCRIPTION,
    creator: '@presently_ai',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans selection:bg-indigo-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
