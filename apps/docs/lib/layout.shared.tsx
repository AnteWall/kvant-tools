import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: 'Kvant Tools' },
    links: [
      { text: 'Avanza SDK', url: '/docs/sdk', active: 'nested-url' },
      { text: 'Avanza CLI', url: '/docs/cli', active: 'nested-url' },
      { text: 'Nordnet SDK', url: '/docs/nordnet', active: 'nested-url' },
    ],
  };
}
