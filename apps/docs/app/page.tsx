import { HomeLayout } from 'fumadocs-ui/layouts/home';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { baseOptions } from '@/lib/layout.shared';

// Broker marks identify which service each tool works with. Kvant Tools is not affiliated
// with Avanza Bank AB or Nordnet Bank AB.
// Avanza's app icon (avanza.se/manifest.json), traced from the 512px PNG.
function AvanzaLogo() {
  return (
    <svg viewBox="0 0 512 512" className="size-8" role="img" aria-label="Avanza">
      <g fill="#00C77B">
        <rect x="41" y="307" width="62" height="205" />
        <rect x="164" y="266" width="61" height="246" />
        <rect x="287" y="184" width="61" height="328" />
        <rect x="409" y="0" width="62" height="512" />
      </g>
    </svg>
  );
}

// Nordnet's site icon (nordnet.se/static/assets/icon.svg).
function NordnetLogo() {
  return (
    <svg viewBox="0 0 512 512" className="size-10" role="img" aria-label="Nordnet">
      <rect width="512" height="512" rx="60" fill="#000" />
      <g fill="#fff">
        <polygon points="421.81 194.74 282.76 309.61 350.59 309.61 489.63 194.74 421.81 194.74" />
        <polygon points="161.11 194.74 22.07 309.61 89.9 309.61 228.94 194.74 161.11 194.74" />
        <rect x="228.94" y="194.74" width="53.82" height="114.87" />
      </g>
    </svg>
  );
}

// TypeScript mark from https://svgl.app/library/typescript.svg
function TypeScriptBadge() {
  return (
    <svg
      viewBox="0 0 256 256"
      className="size-full rounded-[3px]"
      role="img"
      aria-label="TypeScript"
    >
      <path
        d="M20 0h216c11.046 0 20 8.954 20 20v216c0 11.046-8.954 20-20 20H20C8.954 256 0 247.046 0 236V20C0 8.954 8.954 0 20 0Z"
        fill="#3178C6"
      />
      <path
        d="M150.518 200.475v27.62c4.492 2.302 9.805 4.028 15.938 5.179 6.133 1.151 12.597 1.726 19.393 1.726 6.622 0 12.914-.633 18.874-1.899 5.96-1.266 11.187-3.352 15.678-6.257 4.492-2.906 8.048-6.704 10.669-11.394 2.62-4.689 3.93-10.486 3.93-17.391 0-5.006-.749-9.394-2.246-13.163a30.748 30.748 0 0 0-6.479-10.055c-2.821-2.935-6.205-5.567-10.149-7.898-3.945-2.33-8.394-4.531-13.347-6.602-3.628-1.497-6.881-2.949-9.761-4.359-2.879-2.848-5.327-4.316-7.342-4.316-2.016-1.467-3.571-3.021-4.665-4.661-1.094-1.64-1.641-3.495-1.641-5.567 0-1.899.489-3.61 1.468-5.135s2.362-2.834 4.147-3.927c1.785-1.094 3.973-1.942 6.565-2.547 2.591-.604 5.471-.906 8.638-.906 2.304 0 4.737.173 7.299.518 2.563.345 5.14.877 7.732 1.597a53.669 53.669 0 0 1 7.558 2.719 41.7 41.7 0 0 1 6.781 3.797v-25.807c-4.204-1.611-8.797-2.805-13.778-3.582-4.981-.777-10.697-1.165-17.147-1.165-6.565 0-12.784.705-18.658 2.115-5.874 1.409-11.043 3.61-15.506 6.602-4.463 2.993-7.99 6.805-10.582 11.437-2.591 4.632-3.887 10.17-3.887 16.615 0 8.228 2.375 15.248 7.127 21.06 4.751 5.811 11.963 10.731 21.638 14.759a291.458 291.458 0 0 1 10.625 4.575c3.283 1.496 6.119 3.049 8.509 4.66 2.39 1.611 4.276 3.366 5.658 5.265 1.382 1.899 2.073 4.057 2.073 6.474a9.901 9.901 0 0 1-1.296 4.963c-.863 1.524-2.174 2.848-3.93 3.97-1.756 1.122-3.945 1.999-6.565 2.632-2.62.633-5.687.95-9.2.95-5.989 0-11.92-1.05-17.794-3.151-5.875-2.1-11.317-5.25-16.327-9.451Zm-46.036-68.733H140V109H41v22.742h35.345V233h28.137V131.742Z"
        fill="#fff"
      />
    </svg>
  );
}

function TerminalBadge() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="size-full" role="img" aria-label="Terminal">
      <rect width="32" height="32" rx="6" fill="#10B981" />
      <path
        d="m9 11 5 5-5 5m8 0h6"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Tailwind only generates classes it can see in full, so each accent spells its classes out.
const accents = {
  avanza: {
    bar: 'from-emerald-400 to-green-600',
    card: 'hover:border-emerald-500/50 hover:shadow-emerald-500/5 focus-visible:outline-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
    code: 'text-emerald-600 dark:text-emerald-400',
  },
  nordnet: {
    bar: 'from-sky-400 to-blue-600',
    card: 'hover:border-sky-500/50 hover:shadow-sky-500/5 focus-visible:outline-sky-500',
    text: 'text-sky-700 dark:text-sky-300',
    code: 'text-sky-600 dark:text-sky-400',
  },
};

interface Tool {
  accent: keyof typeof accents;
  badge: ReactNode;
  code: readonly [prefix: string, rest: string];
  description: string;
  eyebrow: string;
  href: string;
  linkText: string;
  logo: ReactNode;
  name: string;
}

const tools: readonly Tool[] = [
  {
    accent: 'avanza',
    badge: <TypeScriptBadge />,
    code: ['import', "{ AvanzaClient } from '@kvant-dev/avanza'"],
    description: 'A typed client for building your own applications with Avanza data.',
    eyebrow: 'Avanza · TypeScript SDK',
    href: '/docs/sdk',
    linkText: 'Explore Avanza SDK docs',
    logo: <AvanzaLogo />,
    name: '@kvant-dev/avanza',
  },
  {
    accent: 'avanza',
    badge: <TerminalBadge />,
    code: ['$', 'avanza market search --query volvo'],
    description: 'Search markets and inspect your Avanza accounts, right from the command line.',
    eyebrow: 'Avanza · Terminal CLI',
    href: '/docs/cli',
    linkText: 'Explore Avanza CLI docs',
    logo: <AvanzaLogo />,
    name: '@kvant-dev/avanza-cli',
  },
  {
    accent: 'nordnet',
    badge: <TypeScriptBadge />,
    code: ['import', "{ NordnetClient } from '@kvant-dev/nordnet'"],
    description: 'A typed client for Nordnet accounts, portfolios, and market data.',
    eyebrow: 'Nordnet · TypeScript SDK',
    href: '/docs/nordnet',
    linkText: 'Explore Nordnet SDK docs',
    logo: <NordnetLogo />,
    name: '@kvant-dev/nordnet',
  },
];

function ToolCard({ accent, badge, code, description, eyebrow, href, linkText, logo, name }: Tool) {
  const a = accents[accent];
  return (
    <Link
      href={href}
      className={`group relative grid gap-6 overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-6 pl-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 sm:p-8 sm:pl-10 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,29rem)] md:items-center ${a.card}`}
    >
      <div className={`absolute inset-y-0 left-0 w-1 bg-linear-to-b ${a.bar}`} />
      <span className="relative flex size-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        {logo}
        <span className="absolute -right-1.5 -bottom-1.5 size-6 rounded-md shadow-sm ring-2 ring-fd-card">
          {badge}
        </span>
      </span>
      <div>
        <span className={`text-xs font-semibold tracking-[0.18em] uppercase ${a.text}`}>
          {eyebrow}
        </span>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{name}</h2>
        <p className="mt-2 max-w-md leading-relaxed text-fd-muted-foreground">{description}</p>
      </div>
      <div>
        <div className="overflow-x-auto rounded-lg border border-fd-border bg-fd-background px-4 py-3 font-mono text-xs whitespace-nowrap text-fd-muted-foreground sm:text-sm">
          <span className={a.code}>{code[0]}</span> {code[1]}
        </div>
        <span className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold ${a.text}`}>
          {linkText}{' '}
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="relative isolate flex flex-1 flex-col overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_10%,rgba(56,189,248,0.10),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_10%,rgba(56,189,248,0.07),transparent_55%)]"
        />
        <div className="mx-auto w-full max-w-5xl px-6 pt-24 pb-20 sm:pt-32 lg:pt-40">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-semibold tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Kvant Tools<span className="text-sky-500">.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fd-muted-foreground sm:text-xl">
              Build with Avanza and Nordnet data in TypeScript, or explore Avanza from your
              terminal. Pick the tool that fits how you work.
            </p>
          </div>

          <div className="mt-16 flex flex-col gap-4">
            {tools.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>

          <section
            aria-labelledby="disclaimer-title"
            className="mt-16 border-t border-fd-border pt-8 text-sm leading-relaxed text-fd-muted-foreground"
          >
            <h2 id="disclaimer-title" className="mb-3 font-semibold text-fd-foreground">
              Disclaimer
            </h2>
            <p>
              Kvant Tools are unofficial tools for Avanza&apos;s and Nordnet&apos;s APIs. They are
              not affiliated with Avanza Bank AB or Nordnet Bank AB, and their names and logos
              belong to them. The underlying APIs can be taken down or changed without warning at
              any point in time.
            </p>
            <p className="mt-3">
              The author of this software is not responsible for any indirect damages (foreseeable
              or unforeseeable), such as, if necessary, loss or alteration of or fraudulent access
              to data, accidental transmission of viruses or of any other harmful element, loss of
              profits or opportunities, the cost of replacement goods and services or the attitude
              and behavior of a third party.
            </p>
          </section>
        </div>
      </main>
    </HomeLayout>
  );
}
