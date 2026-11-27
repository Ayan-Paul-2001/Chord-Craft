import { CmsFontKey } from './types';

export interface CmsFontOption {
  key: CmsFontKey;
  label: string;
  styleTag: string;
  className: string;
}

export const CMS_FONT_OPTIONS: CmsFontOption[] = [
  {
    key: 'default',
    label: 'Theme Default',
    styleTag: 'Auto',
    className: '',
  },
  {
    key: 'cormorant',
    label: 'Cormorant Garamond',
    styleTag: 'Editorial Serif',
    className: 'cms-font-cormorant',
  },
  {
    key: 'playfair',
    label: 'Playfair Display',
    styleTag: 'Luxury Serif',
    className: 'cms-font-playfair',
  },
  {
    key: 'cinzel',
    label: 'Cinzel',
    styleTag: 'Classical Display',
    className: 'cms-font-cinzel',
  },
  {
    key: 'great-vibes',
    label: 'Great Vibes',
    styleTag: 'Calligraphy Script',
    className: 'cms-font-great-vibes',
  },
  {
    key: 'lora',
    label: 'Lora',
    styleTag: 'Literary Serif',
    className: 'cms-font-lora',
  },
  {
    key: 'jakarta',
    label: 'Plus Jakarta Sans',
    styleTag: 'Modern Sans',
    className: 'cms-font-jakarta',
  },
  {
    key: 'grotesk',
    label: 'Space Grotesk',
    styleTag: 'Geometric Sans',
    className: 'cms-font-grotesk',
  },
  {
    key: 'mono',
    label: 'JetBrains Mono',
    styleTag: 'Studio Mono',
    className: 'cms-font-mono',
  },
];

const FONT_CLASS_MAP: Record<CmsFontKey, string> = {
  default: '',
  cormorant: 'cms-font-cormorant',
  playfair: 'cms-font-playfair',
  cinzel: 'cms-font-cinzel',
  'great-vibes': 'cms-font-great-vibes',
  lora: 'cms-font-lora',
  jakarta: 'cms-font-jakarta',
  grotesk: 'cms-font-grotesk',
  mono: 'cms-font-mono',
};

export function isValidCmsFont(key: string): key is CmsFontKey {
  return key in FONT_CLASS_MAP;
}

export function getCmsFontClass(
  font?: CmsFontKey | string,
  fallbackClass = ''
): string {
  if (!font || font === 'default' || !isValidCmsFont(font)) {
    return fallbackClass;
  }
  return FONT_CLASS_MAP[font] || fallbackClass;
}

export function hasRichCmsMarkers(text?: string): boolean {
  if (!text) return false;
  return /(\*\*|__|\*[^*\s]|==|\[font:[a-z-]+\])/i.test(text);
}

export function stripCmsMarkers(text: string): string {
  return text
    .replace(/\[font:[a-z-]+\]([\s\S]*?)\[\/font\]/gi, '$1')
    .replace(/\*\*([\s\S]*?)\*\*/g, '$1')
    .replace(/__([\s\S]*?)__/g, '$1')
    .replace(/==([\s\S]*?)==/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1');
}
