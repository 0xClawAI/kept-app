// Design Tokens — 8px base unit
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

export const FontSize = {
  caption: 12,
  small: 13,
  body: 16,
  section: 20,
  title: 28,
  hero: 32,
  display: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const Colors = {
  background: '#0F0F13',
  surface: '#1A1A24',
  surfaceElevated: '#242432',
  primary: '#4ADE80',
  primaryMuted: '#22633D',
  secondary: '#818CF8',
  warning: '#FBBF24',
  error: '#EF4444',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textDisabled: '#475569',
  border: '#2D2D3D',
  streakFire: '#F97316',
};

// Shared card style
export const CardStyle = {
  backgroundColor: Colors.surface,
  borderRadius: Radius.lg,
  padding: Spacing.md,
  borderWidth: 1,
  borderColor: Colors.border,
};

// Shared header style
export const HeaderStyle = {
  title: {
    fontSize: FontSize.title,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
};
