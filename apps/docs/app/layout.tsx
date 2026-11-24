import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Search } from '@/components/search';

import './global.css';

export const metadata: Metadata = {
  title: { default: 'Kvant Tools', template: '%s | Kvant Tools' },
  description: 'Documentation for Kvant Tools: TypeScript SDKs and a CLI for Avanza and Nordnet.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider search={{ SearchDialog: Search }}>{children}</RootProvider>
      </body>
    </html>
  );
}
