import { type SimplifiedLayout, buildSimplifiedLayout } from "~/transformers/layout.js";
import type {
  GetFileNodesResponse,
  Node as FigmaDocumentNode,
  Paint,
  Vector,
  GetFileResponse,
  Style,
} from "@figma/rest-api-spec";
import { hasValue, isRectangleCornerRadii, isTruthy } from "~/utils/identity.js";
import {
  removeEmptyKeys,
  generateVarId,
  parsePaint,
  isVisible,
} from "~/utils/common.js";
import { buildSimplifiedStrokes, type SimplifiedStroke } from "~/transformers/style.js";
import { buildSimplifiedEffects, type SimplifiedEffects } from "~/transformers/effects.js";

// Placed StyleId and ComponentRendition definitions at the top and exported
export type StyleId = string;

export interface ComponentRendition {
  name: string;
  id: string; // Typically the component's node ID
  description?: string;
  // We can add more properties here later, like props, variants, etc.
}

/**
 * TODO ITEMS
 *
 * - Improve layout handling—translate from Figma vocabulary to CSS
 * - Pull image fills/vectors out to top level for better AI visibility
 *   ? Implement vector parents again for proper downloads
 * ? Look up existing styles in new MCP endpoint—Figma supports individual lookups without enterprise /v1/styles/:key
 * ? Parse out and save .cursor/rules/design-tokens file on command
 **/

// -------------------- SIMPLIFIED STRUCTURES --------------------

export type TextStyle = Partial<{
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  lineHeight: string;
  letterSpacing: string;
  textCase: string;
  textAlignHorizontal: string;
  textAlignVertical: string;
}>;
export type StrokeWeights = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};
export type StyleTypes =
  | TextStyle
  | SimplifiedFill[]
  | SimplifiedLayout
  | SimplifiedStroke
  | SimplifiedEffects
  | string;
export interface GlobalVars {
  styles: {
    [id: StyleId]: StyleTypes; // fill, text, effect, layout, stroke
  };
  components: Record<string, ComponentRendition>;
  figmaPublishedStyles?: FigmaPublishedStylesMap; // Raw published styles from Figma API
  styleIdToFigmaName?: Record<StyleId, string>; // Map our internal style ID to Figma's published name
}
export interface SimplifiedDesign {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  nodes: SimplifiedNode[];
  globalVars: GlobalVars;
}

export interface SimplifiedNode {
  id: string;
  name: string;
  type: string; // e.g. FRAME, TEXT, INSTANCE, RECTANGLE, etc.
  mainComponentId?: string;
  // geometry
  boundingBox?: BoundingBox;
  // text
  text?: string;
  textStyle?: string;
  // appearance
  fills?: string;
  styles?: string;
  strokes?: string;
  effects?: string;
  opacity?: number;
  borderRadius?: string;
  // layout & alignment
  layout?: string;
  // backgroundColor?: ColorValue; // Deprecated by Figma API
  // for rect-specific strokes, etc.
  // children
  children?: SimplifiedNode[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CSSRGBAColor = `rgba(${number}, ${number}, ${number}, ${number})`;
export type CSSHexColor = `#${string}`;
export type SimplifiedFill =
  | {
      type?: Paint["type"];
      hex?: string;
      rgba?: string;
      opacity?: number;
      imageRef?: string;
      scaleMode?: string;
      gradientHandlePositions?: Vector[];
      gradientStops?: {
        position: number;
        color: ColorValue | string;
      }[];
    }
  | CSSRGBAColor
  | CSSHexColor;

export interface ColorValue {
  hex: string;
  opacity: number;
}

// Type for the map of Figma's published styles
type FigmaPublishedStylesMap = Record<string, Style>;

// ---------------------- PARSING ----------------------
export function parseFigmaResponse(data: GetFileResponse | GetFileNodesResponse): SimplifiedDesign {
  const { name, lastModified, thumbnailUrl } = data;
  let nodes: FigmaDocumentNode[];
  let figmaPublishedStyles: FigmaPublishedStylesMap | undefined = undefined;

  if ("document" in data) {
    nodes = Object.values(data.document.children);
    if (data.styles) {
      figmaPublishedStyles = data.styles;
    }
  } else {
    nodes = Object.values(data.nodes).map((n) => n.document);
  }
  let globalVars: GlobalVars = {
    styles: {},
    components: {},
    styleIdToFigmaName: {}
  };
  const simplifiedNodes: SimplifiedNode[] = nodes
    .filter(isVisible)
    .map((n) => parseNode(globalVars, n, undefined, figmaPublishedStyles))
    .filter((child) => child !== null && child !== undefined);

  return {
    name,
    lastModified,
    thumbnailUrl: thumbnailUrl || "",
    nodes: simplifiedNodes,
    globalVars,
  };
}

// Helper function to find node by ID
const findNodeById = (id: string, nodes: SimplifiedNode[]): SimplifiedNode | undefined => {
  for (const node of nodes) {
    if (node?.id === id) {
      return node;
    }

    if (node?.children && node.children.length > 0) {
      const foundInChildren = findNodeById(id, node.children);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }

  return undefined;
};

function sanitizeNameForId(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-]+/g, '_').replace(/\s+/g, '_');
}

// New utility function
function toKebabCase(name: string): string {
  if (!name) return '';
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // Separate camelCase
    .replace(/[^a-zA-Z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .toLowerCase();
}

/**
 * Find or create global variables
 * @param globalVars - Global variables object
 * @param value - Value to store
 * @param prefix - Variable ID prefix
 * @param appliedStyleId - ID of the Figma published style applied to the node (e.g., S:guid...)
 * @param figmaPublishedStyles - Map of Figma's published styles
 * @returns Variable ID
 */
function findOrCreateVar(
  globalVars: GlobalVars, 
  value: any, 
  prefix: string, 
  appliedStyleId?: string, 
  figmaPublishedStyles?: FigmaPublishedStylesMap
): StyleId {
  // Check if the same value already exists
  const [existingVarIdByValue] =
    Object.entries(globalVars.styles).find(
      ([_, existingValue]) => JSON.stringify(existingValue) === JSON.stringify(value),
    ) ?? [];

  if (existingVarIdByValue) {
    // If it exists by value, ensure its semantic name is in styleIdToFigmaName if not already
    // This handles cases where a named style's value is identical to an unnamed one processed later
    if (appliedStyleId && figmaPublishedStyles && figmaPublishedStyles[appliedStyleId]?.name && !globalVars.styleIdToFigmaName?.[existingVarIdByValue]) {
      const figmaStyleName = figmaPublishedStyles[appliedStyleId]!.name;
      // Using kebab-case for the semantic name stored in styleIdToFigmaName
      globalVars.styleIdToFigmaName![existingVarIdByValue] = toKebabCase(figmaStyleName);
    }
    return existingVarIdByValue as StyleId;
  }

  // Create a new variable if it doesn't exist by value
  let newVarId: string;
  let semanticName: string | undefined = undefined; // This will be stored in styleIdToFigmaName

  const figmaStyleName = appliedStyleId && figmaPublishedStyles && figmaPublishedStyles[appliedStyleId]?.name;

  if (figmaStyleName) {
    semanticName = toKebabCase(figmaStyleName);
    // The actual styleId key in globalVars.styles will still include the prefix
    // and a counter if needed for uniqueness of the *value*.
    // The semanticName is for the token generator to use.
    let potentialId = `${prefix}_${sanitizeNameForId(figmaStyleName)}`; // Keep original sanitize for internal ID generation
    if (globalVars.styles[potentialId]) {
      let counter = 1;
      let tempId = `${potentialId}_${counter}`;
      while (globalVars.styles[tempId]) {
        counter++;
        tempId = `${potentialId}_${counter}`;
      }
      newVarId = tempId;
    } else {
      newVarId = potentialId;
    }
  } else {
    // Fallback for unnamed styles
    newVarId = generateVarId(prefix); // Keep random ID for internal uniqueness of the value
    
    // Try to generate a more descriptive semantic name based on value type
    if (prefix === 'fill_' && Array.isArray(value) && value.length > 0) {
      const firstFill = value[0];
      if (typeof firstFill === 'object' && firstFill !== null && firstFill.hex) {
        semanticName = `hex-${firstFill.hex.replace('#', '')}`;
        if (firstFill.opacity !== undefined && firstFill.opacity < 1) {
          const alphaHex = Math.round(firstFill.opacity * 255).toString(16).padStart(2, '0');
          semanticName += alphaHex;
        }
      } else if (typeof firstFill === 'string' && firstFill.startsWith('#')) {
         semanticName = `hex-${firstFill.replace('#', '')}`;
      } else if (typeof firstFill === 'string' && firstFill.startsWith('rgba')) {
        semanticName = `rgba-${firstFill.substring(5, firstFill.length - 1).replace(/[^0-9,.]/g, '').replace(/,/g, '-').replace(/\.\d+$/, '')}`; // simplified rgba
      } else if (typeof firstFill === 'object' && firstFill !== null && firstFill.imageRef) {
        semanticName = `image-${firstFill.imageRef.substring(0, 8)}`; // image-abcdef12
      } else {
        semanticName = `${prefix.replace(/_$/, '')}-unnamed-complex`;
      }
    } else if (prefix === 'text_' && typeof value === 'object' && value !== null) {
      const textStyle = value as TextStyle;
      let parts: string[] = ['text'];
      if (textStyle.fontFamily) parts.push(textStyle.fontFamily.toLowerCase().replace(/\s+/g, '-'));
      if (textStyle.fontSize) parts.push(`${textStyle.fontSize}px`);
      if (textStyle.fontWeight) parts.push(String(textStyle.fontWeight));
      if (parts.length > 1) {
        semanticName = parts.join('-');
      } else {
        semanticName = 'text-unnamed-custom';
      }
    } else if (prefix === 'stroke_' && typeof value === 'object' && value !== null) {
      const strokeStyle = value as SimplifiedStroke;
      if (strokeStyle.colors && strokeStyle.colors.length > 0) {
        const firstColor = strokeStyle.colors[0];
        let colorPart = 'unknown-color';
        if (typeof firstColor === 'object' && firstColor !== null && firstColor.hex) {
          colorPart = `hex-${firstColor.hex.replace('#', '')}`;
          if (firstColor.opacity !== undefined && firstColor.opacity < 1) {
            const alphaHex = Math.round(firstColor.opacity * 255).toString(16).padStart(2, '0');
            colorPart += alphaHex;
          }
        } else if (typeof firstColor === 'string' && firstColor.startsWith('#')) {
          colorPart = `hex-${firstColor.replace('#', '')}`;
        } else if (typeof firstColor === 'string' && firstColor.startsWith('rgba')) {
          colorPart = `rgba-${firstColor.substring(5, firstColor.length - 1).replace(/[^0-9,.]/g, '').replace(/,/g, '-').replace(/\.\d+$/, '')}`;
        }
        semanticName = `stroke-${colorPart}-w${strokeStyle.strokeWeight || '1px'}`;
      } else {
        semanticName = 'stroke-unnamed-custom';
      }
    } else if (prefix === 'effect_' && typeof value === 'object' && value !== null) {
      const effectStyle = value as SimplifiedEffects;
      if (effectStyle.boxShadow) {
        semanticName = 'effect-box-shadow'; // Simplistic, could be improved
      } else if (effectStyle.filter) {
        semanticName = 'effect-filter'; // Simplistic
      } else if (effectStyle.backdropFilter) {
        semanticName = 'effect-backdrop-filter'; // Simplistic
      } else {
        semanticName = 'effect-unnamed-custom';
      }
    } else if (prefix === 'layout_' && typeof value === 'object' && value !== null) {
        const layoutStyle = value as SimplifiedLayout;
        if (layoutStyle.gap) {
            semanticName = `layout-gap-${String(layoutStyle.gap).replace(/\s/g, '')}`;
        } else if (layoutStyle.padding) {
            semanticName = `layout-padding-${String(layoutStyle.padding).replace(/[^a-zA-Z0-9\-]/g, '')}`;
        } else {
            semanticName = 'layout-unnamed-custom';
        }
    }
    // Always apply toKebabCase to the generated semanticName
    if (semanticName) {
        semanticName = toKebabCase(semanticName);
    }

    if (!semanticName) {
      // If no better semantic name could be generated after attempting specifics,
      // use a generic name based on prefix and a part of the random ID.
      semanticName = toKebabCase(`${prefix.replace(/_$/, '')}-${newVarId.split('_').pop()?.substring(0,6) || 'fallback'}`);
    }
  }
  
  globalVars.styles[newVarId as StyleId] = value;
  if (semanticName) {
    if (!globalVars.styleIdToFigmaName) {
      globalVars.styleIdToFigmaName = {};
    }
    // Ensure the semantic name is also unique if multiple different styles resolve to the same semantic name
    // (e.g. two different black colors, one named "black", one unnamed but also #000000)
    // The token generator will handle final name collision (_1, _2) based on these semantic names.
    globalVars.styleIdToFigmaName[newVarId as StyleId] = semanticName;
  }
  return newVarId as StyleId;
}

function parseNode(
  globalVars: GlobalVars,
  n: FigmaDocumentNode,
  parent?: FigmaDocumentNode,
  figmaPublishedStyles?: FigmaPublishedStylesMap
): SimplifiedNode | null {
  const { id, name, type } = n;

  const simplified: SimplifiedNode = {
    id,
    name,
    type,
  };

  if (type === 'INSTANCE' && n.componentId) {
    simplified.mainComponentId = n.componentId;
  }

  // text
  if (hasValue("style", n) && Object.keys(n.style).length) {
    const style = n.style;
    const textStyle = {
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      fontSize: style.fontSize,
      lineHeight:
        style.lineHeightPx && style.fontSize
          ? `${style.lineHeightPx / style.fontSize}em`
          : undefined,
      letterSpacing:
        style.letterSpacing && style.letterSpacing !== 0 && style.fontSize
          ? `${(style.letterSpacing / style.fontSize) * 100}%`
          : undefined,
      textCase: style.textCase,
      textAlignHorizontal: style.textAlignHorizontal,
      textAlignVertical: style.textAlignVertical,
    };
    let appliedTextStyleId: string | undefined = undefined;
    if ('styles' in n && n.styles) {
        appliedTextStyleId = n.styles["TEXT"];
    }
    simplified.textStyle = findOrCreateVar(globalVars, textStyle, "text", appliedTextStyleId, figmaPublishedStyles);
  }

  // fills
  if (hasValue("fills", n) && Array.isArray(n.fills) && n.fills.length) {
    const fills = n.fills.map(parsePaint);
    let appliedFillStyleId: string | undefined = undefined;
    if ('styles' in n && n.styles) {
        appliedFillStyleId = n.styles["FILL"];
    }
    simplified.fills = findOrCreateVar(globalVars, fills, "fill", appliedFillStyleId, figmaPublishedStyles);
  }

  const strokes = buildSimplifiedStrokes(n);
  if (strokes.colors.length) {
    let appliedStrokeStyleId: string | undefined = undefined;
    if ('styles' in n && n.styles) {
        appliedStrokeStyleId = n.styles["STROKE"];
    }
    simplified.strokes = findOrCreateVar(globalVars, strokes, "stroke", appliedStrokeStyleId, figmaPublishedStyles);
  }

  const effects = buildSimplifiedEffects(n);
  if (Object.keys(effects).length) {
    let appliedEffectStyleId: string | undefined = undefined;
    if ('styles' in n && n.styles) {
        appliedEffectStyleId = n.styles["EFFECT"];
    }
    simplified.effects = findOrCreateVar(globalVars, effects, "effect", appliedEffectStyleId, figmaPublishedStyles);
  }

  // Process layout (Auto Layout properties)
  const layout = buildSimplifiedLayout(n, parent);
  if (Object.keys(layout).length > 1) { // Only store if more than just {mode: "none"}
    // For layout properties derived from Auto Layout, there isn't a direct Figma "Style" ID in n.styles like FILL or TEXT.
    // Layout Grid styles are different (n.styles.GRID).
    // So, we pass undefined for appliedStyleId for these synthesized Auto Layout objects.
    simplified.layout = findOrCreateVar(globalVars, layout, "layout", undefined, figmaPublishedStyles);
  }
  // TODO: Future: If we specifically parse Layout Grids and want to name them if they are styled,
  // we would need a separate call to findOrCreateVar for them, using n.styles.GRID.
  // For now, buildSimplifiedLayout primarily focuses on Auto Layout properties, not separate grid styles.

  // Keep other simple properties directly
  if (hasValue("characters", n, isTruthy)) {
    simplified.text = n.characters;
  }

  // border/corner

  // opacity
  if (hasValue("opacity", n) && typeof n.opacity === "number" && n.opacity !== 1) {
    simplified.opacity = n.opacity;
  }

  if (hasValue("cornerRadius", n) && typeof n.cornerRadius === "number") {
    simplified.borderRadius = `${n.cornerRadius}px`;
  }
  if (hasValue("rectangleCornerRadii", n, isRectangleCornerRadii)) {
    simplified.borderRadius = `${n.rectangleCornerRadii[0]}px ${n.rectangleCornerRadii[1]}px ${n.rectangleCornerRadii[2]}px ${n.rectangleCornerRadii[3]}px`;
  }

  // Recursively process child nodes
  if (hasValue("children", n) && n.children.length > 0) {
    let children = n.children
      .filter(isVisible)
      .map((child) => parseNode(globalVars, child, n, figmaPublishedStyles))
      .filter((child) => child !== null && child !== undefined);
    if (children.length) {
      simplified.children = children;
    }
  }

  // Convert VECTOR to IMAGE
  if (type === "VECTOR") {
    simplified.type = "IMAGE-SVG";
  }

  return removeEmptyKeys(simplified);
}
