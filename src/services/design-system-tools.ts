import type { DesignTokens } from './token-generator.js';
import fs from 'fs/promises';
import path from 'path';

// Types for design system tools
interface ComponentComparison {
  added: string[];
  removed: string[];
  modified: Array<{
    name: string;
    changes: string[];
  }>;
  unchanged: string[];
}

interface ValidationResult {
  passed: boolean;
  errors: Array<{
    rule: string;
    component: string;
    issue: string;
    severity: 'error' | 'warning';
  }>;
  warnings: Array<{
    rule: string;
    component: string;
    issue: string;
  }>;
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

interface AccessibilityIssue {
  type: 'contrast' | 'text-size' | 'touch-target' | 'color-only';
  severity: 'error' | 'warning';
  component: string;
  issue: string;
  suggestion: string;
}

interface MigrationResult {
  success: boolean;
  outputPath: string;
  format: string;
  summary: {
    tokensProcessed: number;
    errors: string[];
  };
}

/**
 * Tool 1: Compare design tokens between two versions/files
 */
export async function compareDesignTokens(
  tokens1: DesignTokens,
  tokens2: DesignTokens,
  outputPath?: string
): Promise<ComponentComparison> {
  const comparison: ComponentComparison = {
    added: [],
    removed: [],
    modified: [],
    unchanged: []
  };

  // Compare colors
  const colors1Keys = Object.keys(tokens1.colors);
  const colors2Keys = Object.keys(tokens2.colors);
  
  // Added colors
  colors2Keys.forEach(key => {
    if (!colors1Keys.includes(key)) {
      comparison.added.push(`color.${key}`);
    }
  });

  // Removed colors
  colors1Keys.forEach(key => {
    if (!colors2Keys.includes(key)) {
      comparison.removed.push(`color.${key}`);
    }
  });

  // Modified colors
  colors1Keys.forEach(key => {
    if (colors2Keys.includes(key)) {
      const val1 = typeof tokens1.colors[key] === 'string' ? tokens1.colors[key] : tokens1.colors[key].value;
      const val2 = typeof tokens2.colors[key] === 'string' ? tokens2.colors[key] : tokens2.colors[key].value;
      
      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        comparison.modified.push({
          name: `color.${key}`,
          changes: [`Value changed from ${JSON.stringify(val1)} to ${JSON.stringify(val2)}`]
        });
      } else {
        comparison.unchanged.push(`color.${key}`);
      }
    }
  });

  // Compare typography (similar pattern)
  const typo1Keys = Object.keys(tokens1.typography);
  const typo2Keys = Object.keys(tokens2.typography);
  
  typo2Keys.forEach(key => {
    if (!typo1Keys.includes(key)) {
      comparison.added.push(`typography.${key}`);
    }
  });

  typo1Keys.forEach(key => {
    if (!typo2Keys.includes(key)) {
      comparison.removed.push(`typography.${key}`);
    } else {
      const val1 = tokens1.typography[key].value;
      const val2 = tokens2.typography[key].value;
      
      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        comparison.modified.push({
          name: `typography.${key}`,
          changes: [`Typography properties changed`]
        });
      } else {
        comparison.unchanged.push(`typography.${key}`);
      }
    }
  });

  // Save comparison if output path provided
  if (outputPath) {
    await fs.writeFile(outputPath, JSON.stringify(comparison, null, 2));
  }

  return comparison;
}

/**
 * Tool 2: Validate design tokens against design system rules
 */
export function validateDesignSystem(tokens: DesignTokens): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  const warnings: ValidationResult['warnings'] = [];
  let totalChecks = 0;

  // Rule 1: Color naming conventions
  Object.keys(tokens.colors).forEach(colorName => {
    totalChecks++;
    if (!colorName.match(/^(primary|secondary|neutral|success|warning|error|info)-\d{2,3}$/)) {
      warnings.push({
        rule: 'color-naming',
        component: `color.${colorName}`,
        issue: 'Color name should follow pattern: {semantic}-{weight} (e.g., primary-500)'
      });
    }
  });

  // Rule 2: Typography scale consistency
  const typographySizes = Object.values(tokens.typography).map(t => t.value.fontSize);
  const uniqueSizes = [...new Set(typographySizes)];
  totalChecks++;
  
  if (uniqueSizes.length > 8) {
    warnings.push({
      rule: 'typography-scale',
      component: 'typography',
      issue: `Too many font sizes (${uniqueSizes.length}). Consider consolidating to max 8 sizes.`
    });
  }

  // Rule 3: Spacing scale (powers of 2 or 4)
  Object.entries(tokens.spacing).forEach(([name, spacing]) => {
    totalChecks++;
    const value = parseInt(spacing.value);
    if (value && value % 4 !== 0 && value % 8 !== 0) {
      warnings.push({
        rule: 'spacing-scale',
        component: `spacing.${name}`,
        issue: `Spacing value ${value} should be multiple of 4 or 8 for consistency`
      });
    }
  });

  // Rule 4: Contrast validation (basic)
  Object.entries(tokens.colors).forEach(([name, color]) => {
    totalChecks++;
    const colorValue = typeof color === 'string' ? color : color.value;
    if (typeof colorValue === 'string' && colorValue.includes('#')) {
      // Basic check for very light colors used as text
      if (name.includes('text') && (colorValue === '#ffffff' || colorValue === '#fff')) {
        errors.push({
          rule: 'color-contrast',
          component: `color.${name}`,
          issue: 'White text color may have contrast issues',
          severity: 'warning' as const
        });
      }
    }
  });

  const passed = totalChecks - errors.length - warnings.length;

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalChecks,
      passed,
      failed: errors.length,
      warnings: warnings.length
    }
  };
}

/**
 * Tool 3: Check accessibility compliance
 */
export function checkAccessibility(tokens: DesignTokens): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  // Check typography sizes with more comprehensive rules
  Object.entries(tokens.typography).forEach(([name, typo]) => {
    const fontSize = parseFloat(typo.value.fontSize);
    const fontWeight = typo.value.fontWeight ? parseInt(String(typo.value.fontWeight)) : 400;
    
    // WCAG text size requirements
    if (fontSize < 12) {
      issues.push({
        type: 'text-size',
        severity: 'error',
        component: `typography.${name}`,
        issue: `Font size ${fontSize}px is below WCAG minimum (12px)`,
        suggestion: 'Use minimum 12px for any text, 14px recommended for body text'
      });
    }
    
    // Body text recommendations
    if (name.includes('body') && fontSize < 14) {
      issues.push({
        type: 'text-size',
        severity: 'warning',
        component: `typography.${name}`,
        issue: `Body text ${fontSize}px is below recommended minimum (14px)`,
        suggestion: 'Use 14px or larger for body text to improve readability'
      });
    }

    // Large text definition for contrast (18px+ or 14px+ bold)
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
    
    // Check for very thin fonts
    if (fontWeight <= 200 && fontSize < 16) {
      issues.push({
        type: 'text-size',
        severity: 'warning',
        component: `typography.${name}`,
        issue: `Thin font weight (${fontWeight}) with small size (${fontSize}px) may be hard to read`,
        suggestion: 'Use font-weight 300+ for small text, or increase font size'
      });
    }

    // Line height recommendations
    if (typo.value.lineHeight) {
      const lineHeight = parseFloat(String(typo.value.lineHeight));
      if (lineHeight < 1.2) {
        issues.push({
          type: 'text-size',
          severity: 'warning',
          component: `typography.${name}`,
          issue: `Line height ${lineHeight} is too tight, may affect readability`,
          suggestion: 'Use line-height of 1.4-1.6 for body text, minimum 1.2 for headings'
        });
      }
    }
  });

  // Enhanced color contrast checking with real WCAG calculations
  const colorEntries = Object.entries(tokens.colors);
  
  // Find potential text/background color pairs
  const textColors = colorEntries.filter(([name]) => 
    name.includes('text') || name.includes('foreground') || name.includes('content')
  );
  const backgroundColors = colorEntries.filter(([name]) => 
    name.includes('background') || name.includes('surface') || name.includes('bg')
  );

  // Check contrast ratios for likely text/background combinations
  textColors.forEach(([textName, textColor]) => {
    const textColorValue = typeof textColor === 'string' ? textColor : textColor.value;
    
    if (typeof textColorValue === 'string') {
      // Check against white background (most common)
      const contrastWithWhite = calculateContrastRatio(textColorValue, '#ffffff');
      if (contrastWithWhite < 4.5) {
        issues.push({
          type: 'contrast',
          severity: contrastWithWhite < 3 ? 'error' : 'warning',
          component: `color.${textName}`,
          issue: `Contrast ratio ${contrastWithWhite.toFixed(2)}:1 with white background is below WCAG AA (4.5:1)`,
          suggestion: contrastWithWhite < 3 
            ? 'Use a darker color to meet WCAG AA standards (4.5:1) or AAA (7:1)'
            : 'Consider darkening color for better accessibility'
        });
      }

      // Check against common background colors
      backgroundColors.forEach(([bgName, bgColor]) => {
        const bgColorValue = typeof bgColor === 'string' ? bgColor : bgColor.value;
        if (typeof bgColorValue === 'string') {
          const contrastRatio = calculateContrastRatio(textColorValue, bgColorValue);
          
          if (contrastRatio < 4.5) {
            // Try to determine if this might be a large text scenario
            const mightBeLargeText = textName.includes('heading') || textName.includes('title') || textName.includes('large');
            const threshold = mightBeLargeText ? 3.0 : 4.5;
            
            if (contrastRatio < threshold) {
              issues.push({
                type: 'contrast',
                severity: contrastRatio < (threshold * 0.8) ? 'error' : 'warning',
                component: `color.${textName}`,
                issue: `Contrast ratio ${contrastRatio.toFixed(2)}:1 between ${textName} and ${bgName} is below WCAG ${mightBeLargeText ? 'AA large text (3:1)' : 'AA (4.5:1)'}`,
                suggestion: `Adjust colors to achieve ${mightBeLargeText ? '3:1' : '4.5:1'} contrast ratio for WCAG AA compliance`
              });
            }
          }
        }
      });

      // Check for problematic specific color combinations
      if (isLowContrastColor(textColorValue)) {
        issues.push({
          type: 'contrast',
          severity: 'warning',
          component: `color.${textName}`,
          issue: `Color ${textColorValue} is known to have poor contrast in many contexts`,
          suggestion: 'Test this color against its intended backgrounds and ensure 4.5:1 contrast ratio'
        });
      }
    }
  });

  // Check for color-only information indicators
  const statusColors = colorEntries.filter(([name]) => 
    name.includes('success') || name.includes('error') || name.includes('warning') || 
    name.includes('info') || name.includes('danger') || name.includes('alert')
  );

  if (statusColors.length > 0) {
    issues.push({
      type: 'color-only',
      severity: 'warning',
      component: 'color.status-colors',
      issue: 'Status colors detected - ensure they are not the only way to convey information',
      suggestion: 'Supplement status colors with icons, text labels, or other visual indicators'
    });
  }

  // Check spacing for touch targets (basic inference from spacing tokens)
  Object.entries(tokens.spacing).forEach(([name, spacing]) => {
    const size = parseFloat(spacing.value);
    
    if (name.includes('button') || name.includes('touch') || name.includes('tap')) {
      if (size < 44) {
        issues.push({
          type: 'touch-target',
          severity: 'error',
          component: `spacing.${name}`,
          issue: `Touch target size ${size}px is below WCAG minimum (44px)`,
          suggestion: 'Use minimum 44x44px for touch targets, 48px recommended for better usability'
        });
      } else if (size < 48) {
        issues.push({
          type: 'touch-target',
          severity: 'warning',
          component: `spacing.${name}`,
          issue: `Touch target size ${size}px meets minimum but could be larger`,
          suggestion: 'Consider 48px or larger for optimal touch target size'
        });
      }
    }
  });

  return issues;
}

// Helper function to calculate WCAG contrast ratio
function calculateContrastRatio(color1: string, color2: string): number {
  const luminance1 = getRelativeLuminance(color1);
  const luminance2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Calculate relative luminance according to WCAG formula
function getRelativeLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;
  
  // Convert to relative luminance
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;
  
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Handle different hex formats
  hex = hex.replace('#', '');
  
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  if (hex.length !== 6) {
    return null;
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
}

// Check for known problematic colors
function isLowContrastColor(color: string): boolean {
  const problematicColors = [
    '#cccccc', '#ccc', '#d3d3d3', '#dcdcdc', '#f5f5f5',
    '#ffff00', '#00ffff', '#ff00ff', // Pure saturated colors
    '#808080', '#a0a0a0', '#b0b0b0' // Mid-range grays
  ];
  
  return problematicColors.includes(color.toLowerCase());
}

/**
 * Tool 4: Migrate tokens to different formats
 */
export async function migrateTokens(
  tokens: DesignTokens,
  targetFormat: 'tailwind' | 'css-variables' | 'style-dictionary' | 'figma-tokens',
  outputPath: string
): Promise<MigrationResult> {
  const errors: string[] = [];
  let output = '';

  try {
    switch (targetFormat) {
      case 'tailwind':
        output = generateTailwindConfig(tokens);
        break;
      case 'css-variables':
        output = generateCSSVariables(tokens);
        break;
      case 'style-dictionary':
        output = generateStyleDictionary(tokens);
        break;
      case 'figma-tokens':
        output = generateFigmaTokensFormat(tokens);
        break;
      default:
        throw new Error(`Unsupported format: ${targetFormat}`);
    }

    await fs.writeFile(outputPath, output);

    return {
      success: true,
      outputPath,
      format: targetFormat,
      summary: {
        tokensProcessed: Object.keys(tokens.colors).length + Object.keys(tokens.typography).length + Object.keys(tokens.spacing).length,
        errors
      }
    };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error');
    return {
      success: false,
      outputPath,
      format: targetFormat,
      summary: {
        tokensProcessed: 0,
        errors
      }
    };
  }
}

/**
 * Tool 5: Sync check between design and code
 */
export async function checkDesignCodeSync(
  figmaTokens: DesignTokens,
  codeTokensPath: string
): Promise<ComponentComparison> {
  try {
    const codeTokensContent = await fs.readFile(codeTokensPath, 'utf-8');
    let codeTokens: DesignTokens;

    // Try to parse different formats
    if (codeTokensPath.endsWith('.json')) {
      codeTokens = JSON.parse(codeTokensContent);
    } else if (codeTokensPath.endsWith('.js') || codeTokensPath.endsWith('.ts')) {
      // Extract tokens from JS/TS files (simplified)
      codeTokens = extractTokensFromCode(codeTokensContent);
    } else {
      throw new Error('Unsupported code tokens file format');
    }

    return await compareDesignTokens(figmaTokens, codeTokens);
  } catch (error) {
    throw new Error(`Failed to sync check: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper functions for token migration
function generateTailwindConfig(tokens: DesignTokens): string {
  const colors: Record<string, string> = {};
  const fontSizes: Record<string, string> = {};
  const spacing: Record<string, string> = {};

  // Convert colors
  Object.entries(tokens.colors).forEach(([name, color]) => {
    const value = typeof color === 'string' ? color : color.value;
    colors[name.replace('-', '')] = Array.isArray(value) ? value[0] : value;
  });

  // Convert typography
  Object.entries(tokens.typography).forEach(([name, typo]) => {
    fontSizes[name] = typo.value.fontSize;
  });

  // Convert spacing
  Object.entries(tokens.spacing).forEach(([name, space]) => {
    spacing[name] = space.value;
  });

  return `module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(colors, null, 6)},
      fontSize: ${JSON.stringify(fontSizes, null, 6)},
      spacing: ${JSON.stringify(spacing, null, 6)}
    }
  }
}`;
}

function generateCSSVariables(tokens: DesignTokens): string {
  let css = ':root {\n';

  // Colors
  Object.entries(tokens.colors).forEach(([name, color]) => {
    const value = typeof color === 'string' ? color : color.value;
    const cssValue = Array.isArray(value) ? value[0] : value;
    css += `  --color-${name}: ${cssValue};\n`;
  });

  // Typography
  Object.entries(tokens.typography).forEach(([name, typo]) => {
    css += `  --font-size-${name}: ${typo.value.fontSize};\n`;
    if (typo.value.fontWeight) {
      css += `  --font-weight-${name}: ${typo.value.fontWeight};\n`;
    }
    if (typo.value.lineHeight) {
      css += `  --line-height-${name}: ${typo.value.lineHeight};\n`;
    }
  });

  // Spacing
  Object.entries(tokens.spacing).forEach(([name, space]) => {
    css += `  --spacing-${name}: ${space.value};\n`;
  });

  css += '}';
  return css;
}

function generateStyleDictionary(tokens: DesignTokens): string {
  const styleDictionary = {
    color: {} as any,
    size: {} as any,
    font: {} as any
  };

  // Convert colors
  Object.entries(tokens.colors).forEach(([name, color]) => {
    const value = typeof color === 'string' ? color : color.value;
    const path = name.split('-');
    let current = styleDictionary.color;
    
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = {
      value: Array.isArray(value) ? value[0] : value
    };
  });

  return JSON.stringify(styleDictionary, null, 2);
}

function generateFigmaTokensFormat(tokens: DesignTokens): string {
  const figmaTokens: any = {};

  // Colors
  if (Object.keys(tokens.colors).length > 0) {
    figmaTokens.colors = {};
    Object.entries(tokens.colors).forEach(([name, color]) => {
      const value = typeof color === 'string' ? color : color.value;
      figmaTokens.colors[name] = {
        value: Array.isArray(value) ? value[0] : value,
        type: 'color'
      };
    });
  }

  // Typography
  if (Object.keys(tokens.typography).length > 0) {
    figmaTokens.typography = {};
    Object.entries(tokens.typography).forEach(([name, typo]) => {
      figmaTokens.typography[name] = {
        value: typo.value,
        type: 'typography'
      };
    });
  }

  return JSON.stringify(figmaTokens, null, 2);
}

function extractTokensFromCode(codeContent: string): DesignTokens {
  // Simplified token extraction from code
  // In reality, this would be more sophisticated
  const tokens: DesignTokens = {
    colors: {},
    typography: {},
    effects: {},
    spacing: {}
  };

  // Basic regex patterns to extract common token patterns
  const colorRegex = /['"`]([a-zA-Z]+-\d+)['"`]\s*:\s*['"`](#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3})['"`]/g;
  
  let match;
  while ((match = colorRegex.exec(codeContent)) !== null) {
    tokens.colors[match[1]] = match[2];
  }

  return tokens;
}