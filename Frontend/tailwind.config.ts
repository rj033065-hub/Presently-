import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: '#18181B',
          foreground: '#FAFAFA',
        },
        accent: {
          violet: '#6366F1',
          rose: '#F43F5E',
          emerald: '#10B981',
        },
      },
      borderRadius: {
        lg: '8px',
        xl: '12px',
      },
    },
  },
  plugins: [],
};

export default config;
