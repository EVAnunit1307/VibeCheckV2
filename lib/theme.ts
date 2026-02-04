// Premium dark theme for night out vibes
export const theme = {
  colors: {
    // Premium dark palette
    background: '#0A0A0F',
    surface: '#1A1A24',
    surfaceVariant: '#252530',
    card: '#1E1E2D',
    
    // Neon accents for nightlife
    primary: '#8B5CF6', // Purple
    primaryGradient: ['#8B5CF6', '#EC4899'], // Purple to Pink
    secondary: '#EC4899', // Hot Pink
    accent: '#06B6D4', // Cyan
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    
    // Text
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    
    // Borders
    border: '#2D2D3D',
    borderLight: '#3D3D4D',
    
    // Glass morphism
    glass: 'rgba(255, 255, 255, 0.05)',
    glassStrong: 'rgba(255, 255, 255, 0.1)',
  },
  
  typography: {
    // Premium font sizes
    hero: 32,
    h1: 28,
    h2: 24,
    h3: 20,
    h4: 18,
    body: 16,
    bodySmall: 14,
    caption: 12,
    
    // Font weights
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      extrabold: '800' as const,
    }
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,
      elevation: 8,
    },
    neon: {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10,
    }
  }
};

// Vibe tags for events
export const vibes = [
  { id: 'chill', label: '🎧 Chill Vibes', color: '#06B6D4' },
  { id: 'hype', label: '🔥 High Energy', color: '#EF4444' },
  { id: 'classy', label: '🍷 Classy', color: '#8B5CF6' },
  { id: 'casual', label: '👟 Casual', color: '#10B981' },
  { id: 'party', label: '🎉 Party Mode', color: '#EC4899' },
  { id: 'underground', label: '🎵 Underground', color: '#6366F1' },
  { id: 'rooftop', label: '🌃 Rooftop', color: '#F59E0B' },
  { id: 'live_music', label: '🎸 Live Music', color: '#8B5CF6' },
];

// Dress codes
export const dressCodes = [
  { id: 'casual', label: 'Casual', icon: '👟' },
  { id: 'smart_casual', label: 'Smart Casual', icon: '👔' },
  { id: 'dress_to_impress', label: 'Dress to Impress', icon: '👗' },
  { id: 'formal', label: 'Formal', icon: '🤵' },
  { id: 'no_code', label: 'Come as You Are', icon: '😎' },
];

export type VibeId = 'chill' | 'hype' | 'classy' | 'casual' | 'party' | 'underground' | 'rooftop' | 'live_music';
export type DressCodeId = 'casual' | 'smart_casual' | 'dress_to_impress' | 'formal' | 'no_code';
