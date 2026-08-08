export const APP_NAME = 'Presently';
export const APP_DESCRIPTION = 'Discover hyper-personalized gift recommendations powered by artificial intelligence and real-world community stories.';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export const PUBLIC_NAV_LINKS = [
  { label: 'Features', href: '/features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Community', href: '/community-overview' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
];

export const NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Survey', href: '/survey' },
  { label: 'Community', href: '/community' },
  { label: 'Wishlist', href: '/wishlist' },
];

export const FOOTER_NAV_LINKS = {
  product: [
    { label: 'AI Gift Matcher', href: '/#features' },
    { label: 'Interactive Survey', href: '/survey' },
    { label: 'Features Breakdown', href: '/features' },
    { label: 'Pricing Plans', href: '/pricing' },
    { label: 'Community Hub', href: '/community-overview' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'AI Ethics & Transparency', href: '/about#ethics' },
    { label: 'Careers', href: '/about#careers' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookies Policy', href: '/cookies' },
    { label: 'Affiliate Disclaimer', href: '/terms#affiliate' },
  ],
  socials: [
    { label: 'Twitter / X', href: 'https://twitter.com', icon: 'Twitter' },
    { label: 'GitHub', href: 'https://github.com', icon: 'Github' },
    { label: 'Discord', href: 'https://discord.com', icon: 'MessageCircle' },
    { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'Linkedin' },
  ],
};

