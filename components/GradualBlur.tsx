/**
 * GradualBlur Component - Customized for Wealth Wellness Hub
 * 
 * Creates smooth blur gradients with liquid glass aesthetic
 * Integrated with design system colors (teal #7ECCC4, dark background #0D1B23)
 * 
 * Based on component by Ansh Dhanani (github.com/ansh-dhanani)
 * Customized for Wealth Wellness Hub glass morphism design
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as math from 'mathjs';
import './GradualBlur.css';

// Design system colors - liquid glass aesthetic
const DESIGN_COLORS = {
  primary: '#7ECCC4',      // Teal accent
  background: '#0D1B23',   // Deep dark teal
  surface: '#1A3A47',      // Medium teal
  foreground: '#E8F1F5',   // Light cyan text
  muted: '#8DB5C4',        // Muted teal
  border: '#2A5A6F',       // Border teal
};

const DEFAULT_CONFIG = {
  position: 'bottom',
  strength: 2,
  height: '6rem',
  divCount: 5,
  exponential: false,
  zIndex: 1000,
  animated: false,
  duration: '0.3s',
  easing: 'ease-out',
  opacity: 1,
  curve: 'linear',
  responsive: false,
  target: 'parent',
  className: '',
  style: {},
  // Custom glass theme options
  glassColor: 'primary',    // 'primary', 'surface', 'background', or custom hex
  glassOpacity: 0.65,       // Transparency level
  glowIntensity: 0.25,      // Glow effect intensity
};

// Presets optimized for Wealth Wellness Hub
const PRESETS = {
  // Basic directional presets
  top: { position: 'top', height: '6rem', glassOpacity: 0.65 },
  bottom: { position: 'bottom', height: '6rem', glassOpacity: 0.65 },
  left: { position: 'left', height: '6rem', glassOpacity: 0.65 },
  right: { position: 'right', height: '6rem', glassOpacity: 0.65 },
  
  // Intensity presets
  subtle: { height: '4rem', strength: 1, opacity: 0.8, divCount: 3, glassOpacity: 0.45 },
  intense: { height: '10rem', strength: 4, divCount: 8, exponential: true, glassOpacity: 0.85 },
  smooth: { height: '8rem', curve: 'bezier', divCount: 10, glassOpacity: 0.65 },
  sharp: { height: '5rem', curve: 'linear', divCount: 4, glassOpacity: 0.65 },
  
  // Component-specific presets
  header: { position: 'top', height: '8rem', curve: 'ease-out', glassOpacity: 0.65 },
  footer: { position: 'bottom', height: '8rem', curve: 'ease-out', glassOpacity: 0.65 },
  sidebar: { position: 'left', height: '6rem', strength: 2.5, glassOpacity: 0.65 },
  
  // Page-level presets
  'page-header': { position: 'top', height: '10rem', target: 'page', strength: 3, glassOpacity: 0.75 },
  'page-footer': { position: 'bottom', height: '10rem', target: 'page', strength: 3, glassOpacity: 0.75 },
  
  // Glass-specific presets for liquid glass aesthetic
  'glass-light': { height: '6rem', strength: 1.5, opacity: 0.7, divCount: 6, glassOpacity: 0.45 },
  'glass-medium': { height: '7rem', strength: 2, opacity: 0.8, divCount: 7, glassOpacity: 0.65 },
  'glass-deep': { height: '8rem', strength: 3, opacity: 0.9, divCount: 8, glassOpacity: 0.85 },
};

const CURVE_FUNCTIONS = {
  linear: (p: number) => p,
  bezier: (p: number) => p * p * (3 - 2 * p),
  'ease-in': (p: number) => p * p,
  'ease-out': (p: number) => 1 - Math.pow(1 - p, 2),
  'ease-in-out': (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
};

const mergeConfigs = (...configs: any[]) => configs.reduce((acc, c) => ({ ...acc, ...c }), {});
const getGradientDirection = (position: string) =>
  ({
    top: 'to top',
    bottom: 'to bottom',
    left: 'to left',
    right: 'to right',
  })[position] || 'to bottom';

const getGlassColor = (colorKey: string): string => {
  if (colorKey.startsWith('#')) return colorKey;
  return DESIGN_COLORS[colorKey as keyof typeof DESIGN_COLORS] || DESIGN_COLORS.primary;
};

const debounce = (fn: Function, wait: number) => {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...a: any[]) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...a), wait);
  };
};

const useResponsiveDimension = (responsive: boolean, config: any, key: string) => {
  const [value, setValue] = useState(config[key]);
  useEffect(() => {
    if (!responsive) return;
    const calc = () => {
      const w = window.innerWidth;
      let v = config[key];
      if (w <= 480 && config[`mobile${key[0].toUpperCase() + key.slice(1)}`])
        v = config[`mobile${key[0].toUpperCase() + key.slice(1)}`];
      else if (w <= 768 && config[`tablet${key[0].toUpperCase() + key.slice(1)}`])
        v = config[`tablet${key[0].toUpperCase() + key.slice(1)}`];
      else if (w <= 1024 && config[`desktop${key[0].toUpperCase() + key.slice(1)}`])
        v = config[`desktop${key[0].toUpperCase() + key.slice(1)}`];
      setValue(v);
    };
    const debounced = debounce(calc, 100);
    calc();
    window.addEventListener('resize', debounced);
    return () => window.removeEventListener('resize', debounced);
  }, [responsive, config, key]);
  return responsive ? value : config[key];
};

const useIntersectionObserver = (ref: React.RefObject<HTMLDivElement | null>, shouldObserve = false) => {
  const [isVisible, setIsVisible] = useState(!shouldObserve);

  useEffect(() => {
    if (!shouldObserve || !ref.current) return;

    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      threshold: 0.1,
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, shouldObserve]);

  return isVisible;
};

interface GradualBlurProps {
  position?: string;
  strength?: number;
  height?: string;
  divCount?: number;
  exponential?: boolean;
  zIndex?: number;
  animated?: boolean | string;
  duration?: string;
  easing?: string;
  opacity?: number;
  curve?: string;
  responsive?: boolean;
  target?: string;
  className?: string;
  style?: React.CSSProperties;
  preset?: string;
  glassColor?: string;
  glassOpacity?: number;
  glowIntensity?: number;
  hoverIntensity?: number;
  onAnimationComplete?: () => void;
}

function GradualBlur(props: GradualBlurProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const config = useMemo(() => {
    const presetConfig = props.preset && PRESETS[props.preset as keyof typeof PRESETS] ? PRESETS[props.preset as keyof typeof PRESETS] : {};
    return mergeConfigs(DEFAULT_CONFIG, presetConfig, props);
  }, [props]);

  const responsiveHeight = useResponsiveDimension(config.responsive, config, 'height');
  const responsiveWidth = useResponsiveDimension(config.responsive, config, 'width');

  const isVisible = useIntersectionObserver(containerRef, config.animated === 'scroll');

  const blurDivs = useMemo(() => {
    const divs = [];
    const increment = 100 / config.divCount;
    const currentStrength = isHovered && config.hoverIntensity ? config.strength * config.hoverIntensity : config.strength;

    const curveFunc = CURVE_FUNCTIONS[config.curve as keyof typeof CURVE_FUNCTIONS] || CURVE_FUNCTIONS.linear;

    for (let i = 1; i <= config.divCount; i++) {
      let progress = i / config.divCount;
      progress = curveFunc(progress);

      let blurValue;
      if (config.exponential) {
        blurValue = (Number(math.pow(2, progress * 4)) * 0.0625 * currentStrength);
      } else {
        blurValue = 0.0625 * (progress * config.divCount + 1) * currentStrength;
      }

      const p1 = Number(math.round((increment * i - increment) * 10)) / 10;
      const p2 = Number(math.round(increment * i * 10)) / 10;
      const p3 = Number(math.round((increment * i + increment) * 10)) / 10;
      const p4 = Number(math.round((increment * i + increment * 2) * 10)) / 10;

      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;

      const direction = getGradientDirection(config.position);

      const divStyle: React.CSSProperties = {
        position: 'absolute',
        inset: '0',
        maskImage: `linear-gradient(${direction}, ${gradient})`,
        WebkitMaskImage: `linear-gradient(${direction}, ${gradient})`,
        backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        opacity: config.opacity,
        transition: config.animated && config.animated !== 'scroll' ? `backdrop-filter ${config.duration} ${config.easing}` : undefined,
      };

      divs.push(<div key={i} style={divStyle} />);
    }

    return divs;
  }, [config, isHovered]);

  const containerStyle = useMemo(() => {
    const isVertical = ['top', 'bottom'].includes(config.position);
    const isHorizontal = ['left', 'right'].includes(config.position);
    const isPageTarget = config.target === 'page';

    // Get glass color from design system
    const glassColor = getGlassColor(config.glassColor);
    const glassOpacity = config.glassOpacity || 0.65;

    // Create glass background with teal tint
    const glassBackground = `rgba(${parseInt(glassColor.slice(1, 3), 16)}, ${parseInt(glassColor.slice(3, 5), 16)}, ${parseInt(glassColor.slice(5, 7), 16)}, ${glassOpacity})`;

    const baseStyle: React.CSSProperties = {
      position: isPageTarget ? 'fixed' : 'absolute',
      pointerEvents: config.hoverIntensity ? 'auto' : 'none',
      opacity: isVisible ? 1 : 0,
      transition: config.animated ? `opacity ${config.duration} ${config.easing}` : undefined,
      zIndex: isPageTarget ? config.zIndex + 100 : config.zIndex,
      background: glassBackground,
      backdropFilter: `blur(${config.strength * 2}px)`,
      WebkitBackdropFilter: `blur(${config.strength * 2}px)`,
      borderTop: isVertical && config.position === 'bottom' ? `1px solid rgba(126, 204, 196, 0.2)` : undefined,
      borderBottom: isVertical && config.position === 'top' ? `1px solid rgba(126, 204, 196, 0.2)` : undefined,
      borderLeft: isHorizontal && config.position === 'right' ? `1px solid rgba(126, 204, 196, 0.2)` : undefined,
      borderRight: isHorizontal && config.position === 'left' ? `1px solid rgba(126, 204, 196, 0.2)` : undefined,
      ...config.style,
    };

    if (isVertical) {
      baseStyle.height = responsiveHeight;
      baseStyle.width = responsiveWidth || '100%';
      if (config.position === 'top' || config.position === 'bottom') {
        (baseStyle as any)[config.position] = 0;
      }
      baseStyle.left = 0;
      baseStyle.right = 0;
    } else if (isHorizontal) {
      baseStyle.width = responsiveWidth || responsiveHeight;
      baseStyle.height = '100%';
      if (config.position === 'left' || config.position === 'right') {
        (baseStyle as any)[config.position] = 0;
      }
      baseStyle.top = 0;
      baseStyle.bottom = 0;
    }

    return baseStyle;
  }, [config, responsiveHeight, responsiveWidth, isVisible]);

  const { hoverIntensity, animated, onAnimationComplete, duration } = config;

  useEffect(() => {
    if (isVisible && animated === 'scroll' && onAnimationComplete) {
      const ms = parseFloat(duration) * 1000;
      const t = setTimeout(() => onAnimationComplete(), ms);
      return () => clearTimeout(t);
    }
  }, [isVisible, animated, onAnimationComplete, duration]);

  return (
    <div
      ref={containerRef}
      className={`gradual-blur ${config.target === 'page' ? 'gradual-blur-page' : 'gradual-blur-parent'} ${config.className}`}
      style={containerStyle}
      onMouseEnter={hoverIntensity ? () => setIsHovered(true) : undefined}
      onMouseLeave={hoverIntensity ? () => setIsHovered(false) : undefined}
    >
      <div
        className="gradual-blur-inner"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        {blurDivs}
      </div>
    </div>
  );
}

const GradualBlurMemo = React.memo(GradualBlur) as any;
GradualBlurMemo.displayName = 'GradualBlur';
GradualBlurMemo.PRESETS = PRESETS;
GradualBlurMemo.CURVE_FUNCTIONS = CURVE_FUNCTIONS;
GradualBlurMemo.DESIGN_COLORS = DESIGN_COLORS;
export default GradualBlurMemo;

const injectStyles = () => {
  if (typeof document === 'undefined') return;

  const styleId = 'gradual-blur-styles';
  if (document.getElementById(styleId)) return;

  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = `
  .gradual-blur { 
    pointer-events: none; 
    transition: opacity 0.3s ease-out;
  }
  .gradual-blur-parent { 
    overflow: hidden; 
  }
  .gradual-blur-inner { 
    pointer-events: none; 
  }
  .gradual-blur-page {
    pointer-events: none;
  }`;

  document.head.appendChild(styleElement);
};

if (typeof document !== 'undefined') {
  injectStyles();
}
