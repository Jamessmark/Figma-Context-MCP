import type { SimplifiedDesign, GlobalVars, StyleTypes } from './simplify-node-response.js';
// Import specific types for narrowing directly from their source
import type { TextStyle, SimplifiedFill } from './simplify-node-response.js'; // SimplifiedFill is from here
import type { SimplifiedLayout } from '../transformers/layout.js';
import type { SimplifiedStroke } from '../transformers/style.js';
import type { SimplifiedEffects } from '../transformers/effects.js';

// Add toKebabCase utility function
function toKebabCase(name: string): string {
  if (!name) return '';
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // Separate camelCase
    .replace(/[^a-zA-Z0-9\-]+/g, '-')      // Replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '')             // Remove leading/trailing hyphens
    .toLowerCase();
}

interface DesignTokens {
  colors: Record<string, string | { value: string | string[]; type: string; [key: string]: any }>;
  typography: Record<string, { value: TextStyle; type: string; [key: string]: any }>;
  effects: Record<string, { value: SimplifiedEffects | string; type: string; [key: string]: any }>;
  spacing: Record<string, { value: string; type: string; [key: string]: any }>;
  // Add other token categories as needed (e.g., borderRadius, borderWidths, etc.)
}

// Export the interface for use in other files
export type { DesignTokens };

function categorizeStyle(styleId: string, styleDefinition: StyleTypes, globalVars?: GlobalVars): { category: keyof DesignTokens | null; name: string; token: any } {
  let baseName = styleId; // Use the styleId directly as the base for the name to be processed.

  let category: keyof DesignTokens | null = null;
  let token: any = { value: styleDefinition }; 

  if (styleId.startsWith('fill_') && Array.isArray(styleDefinition)) {
    const fills = styleDefinition as SimplifiedFill[];
    category = 'colors';
    if (fills.length === 1) {
      const fill = fills[0];
      if (typeof fill === 'string') { 
        token = { value: fill, type: 'color' };
      } else if (fill.imageRef) {
        token = { value: `Image Fill (Ref: ${fill.imageRef})`, type: 'image', imageRef: fill.imageRef };
      } else if (fill.rgba) { // Check object form for rgba
        token = { value: fill.rgba, type: 'color' };
      } else if (fill.hex) { // Check object form for hex
        token = { value: fill.hex, type: 'color' };
      } else {
        token = { value: JSON.stringify(fill), type: 'complex_fill' }; 
      }
    } else if (fills.length > 1) {
      token = { 
        value: fills.map(f => {
          if (typeof f === 'string') return f;
          if (f.imageRef) return `Image Fill (Ref: ${f.imageRef})`;
          return f.rgba || f.hex || JSON.stringify(f);
        }), 
        type: 'multi_color' 
      };
    } else {
        token = {value: 'empty_fill', type: 'color'};
    }
  } else if (styleId.startsWith('text_') && typeof styleDefinition === 'object' && !Array.isArray(styleDefinition)) {
    category = 'typography';
    token = { value: styleDefinition as TextStyle, type: 'typography' };
  } else if (styleId.startsWith('effect_') && typeof styleDefinition === 'object' && !Array.isArray(styleDefinition)) {
    category = 'effects';
    const effect = styleDefinition as SimplifiedEffects;
    token = { value: effect.boxShadow || JSON.stringify(effect), type: 'effect' };
    if (effect.boxShadow) {
      token.value = effect.boxShadow;
    } else if (effect.filter) {
      token.value = effect.filter;
    } else if (effect.backdropFilter) {
      token.value = effect.backdropFilter;
    } else {
      token.value = JSON.stringify(effect);
    }
  } else if (styleId.startsWith('layout_') && typeof styleDefinition === 'object' && !Array.isArray(styleDefinition)) {
    const layout = styleDefinition as SimplifiedLayout;
    if (layout.gap) { 
      category = 'spacing';
      token = { value: layout.gap, type: 'spacing' };
    }
    // TODO: Extract borderRadius if present in layout.padding (needs parsing if shorthand)
    // or if there's a dedicated borderRadius property on SimplifiedLayout
  } else if (styleId.startsWith('stroke_') && typeof styleDefinition === 'object' && !Array.isArray(styleDefinition)){
    const stroke = styleDefinition as SimplifiedStroke;
    if(stroke.colors && stroke.colors.length === 1){
        const strokeColor = stroke.colors[0];
        if (typeof strokeColor === 'string') {
            category = 'colors';
            token = { value: strokeColor, type: 'borderColor', weight: stroke.strokeWeight };
        } else if (strokeColor.rgba) { // Check object form for rgba
            category = 'colors';
            token = { value: strokeColor.rgba, type: 'borderColor', weight: stroke.strokeWeight };
        } else if (strokeColor.hex) { // Check object form for hex
            category = 'colors';
            token = { value: strokeColor.hex, type: 'borderColor', weight: stroke.strokeWeight };
        }
    }
  } else if (typeof styleDefinition === 'string') {
    if (styleDefinition.startsWith('#') || styleDefinition.startsWith('rgb')) {
        category = 'colors';
        token = { value: styleDefinition, type: 'color' };
    }
  }

  return { category, name: baseName, token };
}

export function generateTokensFromSimplifiedDesign(simplifiedDesign: SimplifiedDesign): DesignTokens {
  const tokens: DesignTokens = {
    colors: {},
    typography: {},
    effects: {},
    spacing: {},
  };

  if (simplifiedDesign.globalVars && simplifiedDesign.globalVars.styles) {
    for (const styleId in simplifiedDesign.globalVars.styles) {
      const styleDefinition = simplifiedDesign.globalVars.styles[styleId as keyof GlobalVars['styles']]; 
      // Pass globalVars (though it's not used for naming anymore in categorizeStyle with these changes)
      const { category, name, token } = categorizeStyle(styleId, styleDefinition, simplifiedDesign.globalVars);

      if (category && tokens[category]) {
        // Use toKebabCase for the final token name, derived from the styleId (which is passed as 'name')
        let tokenName = toKebabCase(name); // 'name' here IS the styleId from categorizeStyle
        if (!tokenName) { // Ensure tokenName is not empty after kebab-casing
            tokenName = 'unnamed-token';
        }

        let counter = 1;
        const originalTokenName = tokenName; // Keep original for incrementing
        while(tokens[category]?.[tokenName]){
            tokenName = `${originalTokenName}-${counter}`;
            counter++;
        }
        tokens[category][tokenName] = token;
      }
    }
  }

  // Clean up empty categories
  Object.keys(tokens).forEach(key => {
    const categoryKey = key as keyof DesignTokens;
    if (tokens[categoryKey] && Object.keys(tokens[categoryKey]).length === 0) {
      delete tokens[categoryKey];
    }
  });

  return tokens;
} 