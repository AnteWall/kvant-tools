import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: 'Kvant Tools' },
    links: [
      { text: 'SDK', url: '/docs/sdk', active: 'nested-url' },
      { text: 'CLI', url: '/docs/cli', active: 'nested-url' },
    ],
  };
}
