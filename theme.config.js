/** @type {const} */
const themeColors = {
  // Liquid glass aesthetic - dark teal/slate with muted accents (matching reference image)
  primary: { light: '#7ECCC4', dark: '#7ECCC4' },
  accent: { light: '#7ECCC4', dark: '#7ECCC4' },
  background: { light: '#0D1B23', dark: '#0D1B23' },
  surface: { light: '#1A3A47', dark: '#1A3A47' },
  
  // Secondary panels - glassmorphism with muted transparency
  panel: { light: '#234A57', dark: '#234A57' },
  
  // Text colors for clarity on glass
  foreground: { light: '#E8F1F5', dark: '#E8F1F5' },
  muted: { light: '#8DB5C4', dark: '#8DB5C4' },
  
  // Borders - subtle glass edge definition with teal tone
  border: { light: '#2A5A6F', dark: '#2A5A6F' },
  
  // Status colors - vibrant on glass
  success: { light: '#4ADE80', dark: '#4ADE80' },
  warning: { light: '#FBBF24', dark: '#FBBF24' },
  error: { light: '#F87171', dark: '#F87171' },
  
  // Additional glass colors
  card: { light: '#1A3A47', dark: '#1A3A47' },
  tint: { light: '#7ECCC4', dark: '#7ECCC4' },
  
  // Hover and interactive states - glass highlight
  hover: { light: '#2A5A6F', dark: '#2A5A6F' },
  active: { light: '#7ECCC4', dark: '#7ECCC4' },
  
  // Glass-specific colors - muted teal
  glass: { light: 'rgba(26, 58, 71, 0.65)', dark: 'rgba(26, 58, 71, 0.65)' },
  glassLight: { light: 'rgba(35, 74, 87, 0.45)', dark: 'rgba(35, 74, 87, 0.45)' },
};

module.exports = { themeColors };
