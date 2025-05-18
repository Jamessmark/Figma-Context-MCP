import { isFrame, isLayout, isRectangle } from "~/utils/identity.js";
import type {
  Node as FigmaDocumentNode,
  HasFramePropertiesTrait,
  HasLayoutTrait,
} from "@figma/rest-api-spec";
import { generateCSSShorthand } from "~/utils/common.js";

export interface SimplifiedLayout {
  mode: "none" | "row" | "column";
  justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "baseline" | "stretch";
  alignItems?: "flex-start" | "flex-end" | "center" | "space-between" | "baseline" | "stretch";
  alignSelf?: "flex-start" | "flex-end" | "center" | "stretch";
  wrap?: boolean;
  gap?: string;
  locationRelativeToParent?: {
    x: number;
    y: number;
  };
  dimensions?: {
    width?: number;
    height?: number;
    aspectRatio?: number;
  };
  padding?: string;
  sizing?: {
    horizontal?: "fixed" | "fill" | "hug";
    vertical?: "fixed" | "fill" | "hug";
  };
  overflowScroll?: ("x" | "y")[];
  position?: "absolute";
}

// Convert Figma's layout config into a more typical flex-like schema
export function buildSimplifiedLayout(
  n: FigmaDocumentNode,
  parent?: FigmaDocumentNode,
): SimplifiedLayout {
  const frameValues = buildSimplifiedFrameValues(n);
  const layoutValues = buildSimplifiedLayoutValues(n, parent, frameValues.mode) || {};

  return { ...frameValues, ...layoutValues };
}

// For flex layouts, process alignment and sizing
function convertAlign(
  axisAlign?:
    | HasFramePropertiesTrait["primaryAxisAlignItems"]
    | HasFramePropertiesTrait["counterAxisAlignItems"],
  stretch?: {
    children: FigmaDocumentNode[];
    axis: "primary" | "counter";
    mode: "row" | "column" | "none";
  },
) {
  if (stretch && stretch.mode !== "none") {
    const { children, mode, axis } = stretch;

    // Compute whether to check horizontally or vertically based on axis and direction
    const direction = getDirection(axis, mode);

    const shouldStretch =
      children.length > 0 &&
      children.reduce((shouldStretch, c) => {
        if (!shouldStretch) return false;
        if ("layoutPositioning" in c && c.layoutPositioning === "ABSOLUTE") return true;
        if (direction === "horizontal") {
          return "layoutSizingHorizontal" in c && c.layoutSizingHorizontal === "FILL";
        } else if (direction === "vertical") {
          return "layoutSizingVertical" in c && c.layoutSizingVertical === "FILL";
        }
        return false;
      }, true);

    if (shouldStretch) return "stretch";
  }

  switch (axisAlign) {
    case "MIN":
      // MIN, AKA flex-start, is the default alignment
      return undefined;
    case "MAX":
      return "flex-end";
    case "CENTER":
      return "center";
    case "SPACE_BETWEEN":
      return "space-between";
    case "BASELINE":
      return "baseline";
    default:
      return undefined;
  }
}

function convertSelfAlign(align?: HasLayoutTrait["layoutAlign"]) {
  switch (align) {
    case "MIN":
      // MIN, AKA flex-start, is the default alignment
      return undefined;
    case "MAX":
      return "flex-end";
    case "CENTER":
      return "center";
    case "STRETCH":
      return "stretch";
    default:
      return undefined;
  }
}

// interpret sizing
function convertSizing(
  s?: HasLayoutTrait["layoutSizingHorizontal"] | HasLayoutTrait["layoutSizingVertical"],
) {
  if (s === "FIXED") return "fixed";
  if (s === "FILL") return "fill";
  if (s === "HUG") return "hug";
  return undefined;
}

function getDirection(
  axis: "primary" | "counter",
  mode: "row" | "column",
): "horizontal" | "vertical" {
  switch (axis) {
    case "primary":
      switch (mode) {
        case "row":
          return "horizontal";
        case "column":
          return "vertical";
      }
    case "counter":
      switch (mode) {
        case "row":
          return "horizontal";
        case "column":
          return "vertical";
      }
  }
}

function buildSimplifiedFrameValues(n: FigmaDocumentNode): SimplifiedLayout | { mode: "none" } {
  if (!isFrame(n)) {
    return { mode: "none" };
  }

  const frameValues: SimplifiedLayout = {
    mode:
      !n.layoutMode || n.layoutMode === "NONE"
        ? "none"
        : n.layoutMode === "HORIZONTAL"
          ? "row"
          : "column",
  };

  const overflowScroll: SimplifiedLayout["overflowScroll"] = [];
  if (n.overflowDirection?.includes("HORIZONTAL")) overflowScroll.push("x");
  if (n.overflowDirection?.includes("VERTICAL")) overflowScroll.push("y");
  if (overflowScroll.length > 0) frameValues.overflowScroll = overflowScroll;

  if (frameValues.mode === "none") {
    return frameValues;
  }

  // TODO: convertAlign should be two functions, one for justifyContent and one for alignItems
  frameValues.justifyContent = convertAlign(n.primaryAxisAlignItems ?? "MIN", {
    children: n.children,
    axis: "primary",
    mode: frameValues.mode,
  });
  frameValues.alignItems = convertAlign(n.counterAxisAlignItems ?? "MIN", {
    children: n.children,
    axis: "counter",
    mode: frameValues.mode,
  });
  frameValues.alignSelf = convertSelfAlign(n.layoutAlign);

  // Only include wrap if it's set to WRAP, since flex layouts don't default to wrapping
  frameValues.wrap = n.layoutWrap === "WRAP" ? true : undefined;
  frameValues.gap = n.itemSpacing ? `${n.itemSpacing ?? 0}px` : undefined;
  // gather padding
  if (n.paddingTop || n.paddingBottom || n.paddingLeft || n.paddingRight) {
    frameValues.padding = generateCSSShorthand({
      top: n.paddingTop ?? 0,
      right: n.paddingRight ?? 0,
      bottom: n.paddingBottom ?? 0,
      left: n.paddingLeft ?? 0,
    });
  }

  return frameValues;
}

function buildSimplifiedLayoutValues(
  n: FigmaDocumentNode,
  parent: FigmaDocumentNode | undefined,
  mode: "row" | "column" | "none",
): SimplifiedLayout | undefined {
  if (!isLayout(n)) return undefined;

  const layoutValues: SimplifiedLayout = { mode };

  layoutValues.sizing = {
    horizontal: convertSizing(n.layoutSizingHorizontal),
    vertical: convertSizing(n.layoutSizingVertical),
  };

  // Only include positioning-related properties if parent layout isn't flex or if the node is absolute
  if (isFrame(parent) && (parent?.layoutMode === "NONE" || n.layoutPositioning === "ABSOLUTE")) {
    if (n.layoutPositioning === "ABSOLUTE") {
      layoutValues.position = "absolute";
    }
    if (n.absoluteBoundingBox && parent.absoluteBoundingBox) {
      layoutValues.locationRelativeToParent = {
        x: n.absoluteBoundingBox.x - (parent?.absoluteBoundingBox?.x ?? n.absoluteBoundingBox.x),
        y: n.absoluteBoundingBox.y - (parent?.absoluteBoundingBox?.y ?? n.absoluteBoundingBox.y),
      };
    }
    return layoutValues;
  }

  // Handle dimensions based on layout growth and alignment
  if (isRectangle("absoluteBoundingBox", n) && isRectangle("absoluteBoundingBox", parent)) {
    const dimensions: { width?: number; height?: number; aspectRatio?: number } = {};

    // Only include dimensions that aren't meant to stretch
    if (mode === "row") {
      if (!n.layoutGrow && n.layoutSizingHorizontal == "FIXED")
        dimensions.width = n.absoluteBoundingBox.width;
      if (n.layoutAlign !== "STRETCH" && n.layoutSizingVertical == "FIXED")
        dimensions.height = n.absoluteBoundingBox.height;
    } else if (mode === "column") {
      // column
      if (n.layoutAlign !== "STRETCH" && n.layoutSizingHorizontal == "FIXED")
        dimensions.width = n.absoluteBoundingBox.width;
      if (!n.layoutGrow && n.layoutSizingVertical == "FIXED")
        dimensions.height = n.absoluteBoundingBox.height;

      if (n.preserveRatio) {
        dimensions.aspectRatio = n.absoluteBoundingBox?.width / n.absoluteBoundingBox?.height;
      }
    }

    if (Object.keys(dimensions).length > 0) {
      layoutValues.dimensions = dimensions;
    }
  }

  return layoutValues;
}

export function describeSimplifiedLayout(layout: SimplifiedLayout): string {
  if (!layout) return 'No layout defined.';

  const parts: string[] = [];

  // Mode
  if (layout.mode) {
    let modeDesc = 'Arrangement: ';
    if (layout.mode === 'row') modeDesc += 'Horizontal (Row)';
    else if (layout.mode === 'column') modeDesc += 'Vertical (Column)';
    else modeDesc += 'None';
    parts.push(modeDesc + '.');
  }

  // Flex container properties (only if mode is row or column)
  if (layout.mode === 'row' || layout.mode === 'column') {
    if (layout.justifyContent) parts.push(`Justify Content: ${layout.justifyContent}.`);
    if (layout.alignItems) parts.push(`Align Items: ${layout.alignItems}.`);
    if (layout.gap) parts.push(`Item Spacing (Gap): ${layout.gap}.`);
    if (layout.wrap) parts.push('Wrapping: Enabled.');
  }

  // Flex item property
  if (layout.alignSelf) parts.push(`Align Self: ${layout.alignSelf}.`);

  // Padding
  if (layout.padding) {
    parts.push(`Padding: ${layout.padding}.`); // Keeping it simple for now, could expand to describe TRBL
  }

  // Sizing
  if (layout.sizing) {
    const sizingParts: string[] = [];
    if (layout.sizing.horizontal) sizingParts.push(`Horizontal: ${layout.sizing.horizontal}`);
    if (layout.sizing.vertical) sizingParts.push(`Vertical: ${layout.sizing.vertical}`);
    if (sizingParts.length > 0) parts.push(`Sizing: ${sizingParts.join(', ')}.`);
  }

  // Dimensions
  if (layout.dimensions) {
    const dimParts: string[] = [];
    if (layout.dimensions.width !== undefined) dimParts.push(`Width: ${layout.dimensions.width}px`);
    if (layout.dimensions.height !== undefined) dimParts.push(`Height: ${layout.dimensions.height}px`);
    if (layout.dimensions.aspectRatio !== undefined) dimParts.push(`Aspect Ratio: ${layout.dimensions.aspectRatio}`);
    if (dimParts.length > 0) parts.push(`Dimensions: ${dimParts.join(', ')}.`);
  }
  
  // Position
  if (layout.position) parts.push(`Positioning: ${layout.position}.`);
  
  // Location relative to parent (only if absolute)
  if (layout.position === 'absolute' && layout.locationRelativeToParent) {
    parts.push(`Offset: X: ${layout.locationRelativeToParent.x}px, Y: ${layout.locationRelativeToParent.y}px.`);
  }

  // Overflow
  if (layout.overflowScroll && layout.overflowScroll.length > 0) {
    parts.push(`Overflow Scroll: ${layout.overflowScroll.join(', ')}.`);
  }

  return parts.length > 0 ? parts.join(' ') : 'Basic or undefined layout properties.';
}
