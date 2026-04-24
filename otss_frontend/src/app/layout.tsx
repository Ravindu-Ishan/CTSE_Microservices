import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AsgardeoProvider } from '@asgardeo/nextjs/server';
import { AppSessionProvider } from '@/components/AppSessionContext';
import OAuthCallbackRedirect from '@/components/OAuthCallbackRedirect';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Axiom Support',
  description: 'Official support portal for Axiom — reach out and get help fast.',
};

const asgardeoBaseUrl = process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL;
const asgardeoClientId = process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-full antialiased bg-bg-base text-text-primary">
        {asgardeoBaseUrl && asgardeoClientId ? (
          <AsgardeoProvider
            baseUrl={asgardeoBaseUrl}
            clientId={asgardeoClientId}
            clientSecret={process.env.ASGARDEO_CLIENT_SECRET}
            afterSignOutUrl="/"
            scopes={['openid', 'email', 'profile', 'groups', 'roles']}
          >
            <AppSessionProvider>
              <OAuthCallbackRedirect />
              {children}
            </AppSessionProvider>
          </AsgardeoProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
