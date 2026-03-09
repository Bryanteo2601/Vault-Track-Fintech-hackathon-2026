# GradualBlur Component

A sophisticated blur gradient component customized for Wealth Wellness Hub's liquid glass aesthetic. Creates smooth, directional blur effects with advanced configuration options.

## Features

- **Liquid Glass Design**: Integrated with your teal color scheme (#7ECCC4)
- **Multiple Directions**: Top, bottom, left, right positioning
- **Curve Functions**: Linear, bezier, ease-in, ease-out, ease-in-out
- **Responsive**: Mobile, tablet, and desktop breakpoints
- **Performance**: Optimized with React.memo and intersection observer
- **Accessibility**: Respects prefers-reduced-motion
- **Mathjs Integration**: Advanced mathematical calculations for blur curves

## Installation

The component is already installed in `/components/GradualBlur.tsx` with the required CSS file.

## Basic Usage

```tsx
import GradualBlur from '@/components/GradualBlur';

export function MyComponent() {
  return (
    <section style={{ position: 'relative', height: 500, overflow: 'hidden' }}>
      <div style={{ height: '100%', overflowY: 'auto', padding: '6rem 2rem' }}>
        {/* Your scrollable content here */}
      </div>
      <GradualBlur
        position="bottom"
        height="7rem"
        strength={2}
        divCount={5}
        curve="bezier"
      />
    </section>
  );
}
```

## Props

### Core Properties

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | string | 'bottom' | Direction: 'top', 'bottom', 'left', 'right' |
| `height` | string | '6rem' | Blur gradient height/width |
| `strength` | number | 2 | Blur intensity (0-5) |
| `divCount` | number | 5 | Number of blur layers |
| `curve` | string | 'linear' | Curve function: 'linear', 'bezier', 'ease-in', 'ease-out', 'ease-in-out' |
| `opacity` | number | 1 | Gradient opacity (0-1) |
| `exponential` | boolean | false | Use exponential blur progression |

### Glass Theme Properties

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `glassColor` | string | 'primary' | Color key: 'primary', 'surface', 'background', or hex color |
| `glassOpacity` | number | 0.65 | Glass background transparency |
| `glowIntensity` | number | 0.25 | Glow effect intensity |

### Animation Properties

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animated` | boolean \| string | false | 'scroll' for scroll animation, true for hover |
| `duration` | string | '0.3s' | Animation duration |
| `easing` | string | 'ease-out' | CSS easing function |
| `hoverIntensity` | number | - | Blur intensity multiplier on hover |

### Layout Properties

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `target` | string | 'parent' | 'parent' or 'page' positioning |
| `zIndex` | number | 1000 | Stacking order |
| `responsive` | boolean | false | Enable responsive sizing |
| `className` | string | '' | Additional CSS classes |
| `style` | object | {} | Inline styles |

### Callbacks

| Prop | Type | Description |
|------|------|-------------|
| `onAnimationComplete` | function | Called when scroll animation completes |

## Presets

Use presets for quick configuration:

```tsx
// Subtle blur
<GradualBlur preset="subtle" />

// Intense blur
<GradualBlur preset="intense" />

// Glass-specific presets
<GradualBlur preset="glass-light" />
<GradualBlur preset="glass-medium" />
<GradualBlur preset="glass-deep" />

// Component presets
<GradualBlur preset="header" />
<GradualBlur preset="footer" />
<GradualBlur preset="sidebar" />
```

## Design Colors

The component uses your design system colors:

```typescript
DESIGN_COLORS = {
  primary: '#7ECCC4',      // Teal accent
  background: '#0D1B23',   // Deep dark teal
  surface: '#1A3A47',      // Medium teal
  foreground: '#E8F1F5',   // Light cyan text
  muted: '#8DB5C4',        // Muted teal
  border: '#2A5A6F',       // Border teal
}
```

## Examples

### Dashboard Bottom Blur (Scrollable Content)

```tsx
<section style={{ position: 'relative', height: 400, overflow: 'hidden' }}>
  <ScrollView>
    {/* Dashboard content */}
  </ScrollView>
  <GradualBlur preset="glass-medium" position="bottom" />
</section>
```

### Header Blur (Page-Level)

```tsx
<GradualBlur
  preset="header"
  target="page"
  position="top"
  glassColor="primary"
  glassOpacity={0.75}
/>
```

### Interactive Hover Blur

```tsx
<GradualBlur
  position="bottom"
  height="8rem"
  strength={2}
  hoverIntensity={1.5}
  animated={true}
  duration="0.4s"
/>
```

### Scroll-Triggered Animation

```tsx
<GradualBlur
  position="bottom"
  animated="scroll"
  onAnimationComplete={() => console.log('Animation done')}
/>
```

### Responsive Blur

```tsx
<GradualBlur
  responsive={true}
  mobileHeight="4rem"
  tabletHeight="6rem"
  desktopHeight="8rem"
/>
```

## Performance Tips

1. **Use Presets**: Presets are optimized for common use cases
2. **Limit divCount**: Higher divCount = more layers = slower rendering. Default 5 is usually sufficient
3. **Responsive**: Enable only if needed for mobile optimization
4. **Intersection Observer**: Use `animated="scroll"` for viewport-triggered animations
5. **Memoization**: Component is memoized to prevent unnecessary re-renders

## Browser Support

- **Modern Browsers**: Full support with backdrop-filter
- **Fallback**: Solid overlay with reduced opacity for unsupported browsers
- **Mobile**: Optimized for iOS Safari and Android Chrome

## Accessibility

- Respects `prefers-reduced-motion` media query
- Respects `prefers-color-scheme` for dark mode
- No impact on keyboard navigation
- Non-interactive by default (pointer-events: none)

## Curve Functions

| Curve | Effect |
|-------|--------|
| `linear` | Uniform blur progression |
| `bezier` | Smooth S-curve progression |
| `ease-in` | Slow start, fast end |
| `ease-out` | Fast start, slow end |
| `ease-in-out` | Slow start and end |

## Advanced: Custom Colors

```tsx
<GradualBlur
  glassColor="#FF6B6B"  // Custom hex color
  glassOpacity={0.8}
  glowIntensity={0.4}
/>
```

## Static Properties

Access presets and curve functions:

```tsx
import GradualBlur from '@/components/GradualBlur';

// Available presets
console.log(GradualBlur.PRESETS);

// Available curve functions
console.log(GradualBlur.CURVE_FUNCTIONS);

// Design colors
console.log(GradualBlur.DESIGN_COLORS);
```

## Credits

Based on component by Ansh Dhanani (github.com/ansh-dhanani)
Customized for Wealth Wellness Hub liquid glass design system
