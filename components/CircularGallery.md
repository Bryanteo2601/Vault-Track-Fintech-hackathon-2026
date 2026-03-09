# CircularGallery Component

A sophisticated WebGL-based interactive carousel component using ogl library. Creates smooth, curved gallery effects with touch/mouse support and customizable bending animations.

## Features

- **WebGL Rendering**: GPU-accelerated graphics using ogl library
- **Interactive Scrolling**: Smooth mouse wheel, touch, and drag support
- **Curved Layout**: Customizable bending effect for items
- **Responsive**: Adapts to container size and device pixel ratio
- **Rounded Corners**: Configurable border radius for items
- **Text Labels**: Automatic text rendering on items
- **Smooth Animations**: Eased scrolling and interpolated movement

## Installation

The component is already installed in `/components/CircularGallery.tsx` with CSS styles.

## Basic Usage

```tsx
import CircularGallery from '@/components/CircularGallery';

export function MyComponent() {
  const items = [
    { image: 'https://example.com/image1.jpg', text: 'Item 1' },
    { image: 'https://example.com/image2.jpg', text: 'Item 2' },
    { image: 'https://example.com/image3.jpg', text: 'Item 3' },
  ];

  return (
    <div style={{ height: '600px' }}>
      <CircularGallery items={items} bend={3} />
    </div>
  );
}
```

## Props

### Core Properties

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | Array | undefined | Array of items with `image` (URL) and `text` (label) |
| `bend` | number | 3 | Curvature amount (0 = straight, higher = more curved) |
| `textColor` | string | '#E8F1F5' | Text label color (hex or CSS color) |
| `borderRadius` | number | 0.05 | Border radius for item corners (0-1) |
| `font` | string | 'bold 30px sans-serif' | Font specification for labels |
| `scrollSpeed` | number | 2 | Scroll sensitivity multiplier |
| `scrollEase` | number | 0.05 | Easing factor for smooth scrolling (0-1) |

## Examples

### Portfolio Asset Showcase

```tsx
<div style={{ height: '600px' }}>
  <CircularGallery
    items={portfolioAssets.map(asset => ({
      image: asset.imageUrl,
      text: asset.name
    }))}
    bend={2}
    textColor="#7ECCC4"
    borderRadius={0.1}
    scrollSpeed={2.5}
  />
</div>
```

### Straight Gallery (No Bend)

```tsx
<CircularGallery
  items={items}
  bend={0}
  scrollSpeed={1.5}
  scrollEase={0.08}
/>
```

### Highly Curved Gallery

```tsx
<CircularGallery
  items={items}
  bend={5}
  borderRadius={0.15}
  scrollSpeed={3}
/>
```

### Custom Styling

```tsx
<CircularGallery
  items={items}
  bend={2}
  textColor="#FF6B6B"
  font="bold 24px 'Figtree', sans-serif"
  borderRadius={0.08}
/>
```

## Interaction

### Mouse/Trackpad
- **Scroll**: Wheel up/down to navigate
- **Drag**: Click and drag left/right to scroll
- **Auto-snap**: Releases snap to nearest item

### Touch
- **Swipe**: Swipe left/right to navigate
- **Momentum**: Smooth deceleration after swipe
- **Auto-snap**: Snaps to nearest item on release

## Performance Tips

1. **Image Optimization**: Use optimized image URLs (compressed, appropriate size)
2. **Item Count**: 6-12 items optimal for smooth performance
3. **Bend Value**: Higher bend values require more GPU resources
4. **Device Pixel Ratio**: Component automatically limits to 2x for performance
5. **Responsive**: Container height should be fixed (e.g., `height: 600px`)

## Browser Support

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 15+)
- **Mobile**: Touch support on iOS and Android

## Technical Details

### WebGL Shaders

The component uses custom GLSL shaders for:
- **Vertex Shader**: Handles position, rotation, and wave animations
- **Fragment Shader**: Manages texture mapping, rounded corners, and antialiasing

### Rendering Pipeline

1. **Geometry**: Plane with 100x50 segments for smooth deformation
2. **Textures**: Dynamically loaded from image URLs with mipmapping
3. **Text Rendering**: Canvas-based text converted to WebGL textures
4. **Animation**: RequestAnimationFrame for 60fps updates

### Memory Management

- Automatic cleanup of WebGL resources on unmount
- Event listener removal on component destroy
- Canvas element properly removed from DOM

## Customization

### Change Bend Dynamically

```tsx
const [bend, setBend] = useState(3);

return (
  <>
    <CircularGallery items={items} bend={bend} />
    <button onClick={() => setBend(bend + 1)}>Increase Bend</button>
  </>
);
```

### Load Items from API

```tsx
const [items, setItems] = useState([]);

useEffect(() => {
  fetch('/api/gallery-items')
    .then(res => res.json())
    .then(data => setItems(data));
}, []);

return <CircularGallery items={items} />;
```

### Responsive Container

```tsx
const [height, setHeight] = useState(600);

useEffect(() => {
  const handleResize = () => {
    setHeight(window.innerHeight * 0.6);
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

return (
  <div style={{ height: `${height}px` }}>
    <CircularGallery items={items} />
  </div>
);
```

## Troubleshooting

### Black Screen
- Check browser console for WebGL errors
- Ensure images are CORS-enabled (`crossOrigin="anonymous"`)
- Verify container has explicit height

### Slow Performance
- Reduce number of items
- Lower bend value
- Optimize image sizes
- Check GPU usage in DevTools

### Text Not Showing
- Verify `textColor` is visible against background
- Check font is available in system
- Ensure text is not too long

## Advanced: Custom Shaders

To modify the wave animation, edit the vertex shader in the `createShader()` method:

```glsl
// Current wave formula
p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);

// Custom formula example
p.z = sin(p.x * 2.0 + uTime) * cos(p.y * 3.0 + uTime) * 0.2;
```

## Credits

WebGL implementation using ogl library by OGL Contributors
Customized for Wealth Wellness Hub design system
