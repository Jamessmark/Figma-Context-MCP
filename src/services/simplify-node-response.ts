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
  parsePaint,
  isVisible,
  simpleHash,
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
  const [existingVarIdByValue] =
    Object.entries(globalVars.styles).find(
      ([_, existingValue]) => JSON.stringify(existingValue) === JSON.stringify(value),
    ) ?? [];

  if (existingVarIdByValue) {
    return existingVarIdByValue as StyleId;
  }

  // Create a new variable if it doesn't exist by value
  let newVarId: string;
  let baseId: string;

  const figmaStyleName = appliedStyleId && figmaPublishedStyles && figmaPublishedStyles[appliedStyleId]?.name;

  if (figmaStyleName) {
    // Use kebab-cased Figma name for the ID
    baseId = `${prefix}_${toKebabCase(figmaStyleName)}`;
  } else {
    // Fallback for unnamed styles: use a deterministic ID based on style content
    const styleDefinitionString = JSON.stringify(value);
    const contentHash = simpleHash(styleDefinitionString);
    baseId = `${prefix}_${contentHash}`;
  }

  // Ensure uniqueness if baseId already exists (can happen with name clashes or hash collisions)
  let potentialId = baseId;
  if (globalVars.styles[potentialId]) {
    let counter = 1;
    // Start with _1 if baseId itself is taken
    potentialId = `${baseId}_${counter}`;
    while (globalVars.styles[potentialId]) {
      counter++;
      potentialId = `${baseId}_${counter}`;
    }
  }
  newVarId = potentialId;
  
  globalVars.styles[newVarId] = value;
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

  // 处理绝对位置和尺寸
  if (hasValue("absoluteBoundingBox", n) && n.absoluteBoundingBox) {
    // 如果有父节点，计算相对位置
    if (parent && 'absoluteBoundingBox' in parent && parent.absoluteBoundingBox) {
      simplified.boundingBox = {
        x: n.absoluteBoundingBox.x - parent.absoluteBoundingBox.x,
        y: n.absoluteBoundingBox.y - parent.absoluteBoundingBox.y,
        width: n.absoluteBoundingBox.width,
        height: n.absoluteBoundingBox.height,
      };
    } else {
      // 如果没有父节点，使用绝对位置
      simplified.boundingBox = {
        x: n.absoluteBoundingBox.x,
        y: n.absoluteBoundingBox.y,
        width: n.absoluteBoundingBox.width,
        height: n.absoluteBoundingBox.height,
      };
    }
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

