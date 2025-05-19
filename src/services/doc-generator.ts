import type { SimplifiedDesign, GlobalVars, StyleTypes, SimplifiedFill, TextStyle, SimplifiedNode, StyleId, ComponentRendition } from './simplify-node-response.js';
import type { SimplifiedEffects } from '../transformers/effects.js';
import { type SimplifiedLayout, describeSimplifiedLayout } from '../transformers/layout.js';
import type { SimplifiedStroke } from '../transformers/style.js';
import fs from 'fs';
import path from 'path';

// Helper to sanitize strings for Markdown
function s(str: any): string {
  if (str === null || str === undefined) {
    return '';
  }
  return String(str)
    .replace(/`/g, '\\`') // Escape backticks
    .replace(/\$/g, '\\$'); // Escape dollar signs
}

const TBT = '```'; // Triple Back Tick constant

function formatJsonBlock(data: any): string {
  return TBT + 'json\n' + JSON.stringify(data, null, 2) + '\n' + TBT;
}

// Helper to sanitize file names
function sanitizeFileName(name: string, extension: string = '.md'): string {
  const baseName = name.replace(/[\/\\s<>:"\|?*]+/g, '_');
  return `${baseName}${extension}`;
}

// --- Main Orchestrator --- 
export function generateStructuredDesignSystemDocumentation(design: SimplifiedDesign, baseOutputDirectoryPath: string): void {
  // Ensure base directory exists (it should have been created by mcp.ts, but double check)
  if (!fs.existsSync(baseOutputDirectoryPath)) {
    fs.mkdirSync(baseOutputDirectoryPath, { recursive: true });
  }

  // 1. Generate Overview
  const overviewContent = generateOverviewMarkdown(design, baseOutputDirectoryPath);
  fs.writeFileSync(path.join(baseOutputDirectoryPath, '_Overview.md'), overviewContent);

  // 2. Generate Global Styles
  const globalStylesDir = path.join(baseOutputDirectoryPath, 'GlobalStyles');
  if (!fs.existsSync(globalStylesDir)) {
    fs.mkdirSync(globalStylesDir, { recursive: true });
  }
  generateAndSaveGlobalStylesMarkdown(design, globalStylesDir);

  // 3. Generate Components per Page
  const componentsDir = path.join(baseOutputDirectoryPath, 'Components');
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }
  generateAndSaveComponentsByPageMarkdown(design, componentsDir);
}

// --- Markdown Generation Functions --- 

function generateOverviewMarkdown(design: SimplifiedDesign, baseOutputDirectoryPath: string): string {
  let md = `# Design System Overview: ${s(design.name)}\n\n`;
  md += `*Last Modified:* ${s(design.lastModified)}\n\n`;

  if (design.thumbnailUrl) {
    md += `## Thumbnail\n`;
    md += `![Thumbnail](${s(design.thumbnailUrl)})\n\n`;
  }

  md += `## Table of Contents\n\n`;
  md += `- [Global Styles](./GlobalStyles/)\n`;
  md += `  - [Colors](./GlobalStyles/Colors.md)\n`;
  md += `  - [Typography](./GlobalStyles/Typography.md)\n`;
  md += `  - [Effects](./GlobalStyles/Effects.md)\n`;
  md += `  - [Layout & Spacing](./GlobalStyles/LayoutAndSpacing.md)\n`;
  md += `- [Components by Page](./Components/)\n`;

  // Dynamically add links to page-specific component files
  if (design.nodes && design.nodes.length > 0) {
    // Assuming top-level nodes in design.nodes are canvases/pages
    design.nodes.forEach(canvasNode => {
      if (canvasNode.type === 'CANVAS') { // Or whatever type your top-level page nodes are
        md += `  - [${s(canvasNode.name)} Components](./Components/${sanitizeFileName(canvasNode.name)})\n`;
      }
    });
  }
  md += `\n`;
  // Add link to tokens if we decide to place it here or know its path
  // md += `- [Design Tokens](./design_tokens.json)\n`; 

  return md;
}

function generateAndSaveGlobalStylesMarkdown(design: SimplifiedDesign, globalStylesDir: string): void {
  if (!design.globalVars || !design.globalVars.styles || Object.keys(design.globalVars.styles).length === 0) {
    fs.writeFileSync(path.join(globalStylesDir, 'NoGlobalStyles.md'), 'No global styles found in the design system.');
    return;
  }

  const styles = design.globalVars.styles;
  const styleIdToNameMap = design.globalVars.styleIdToFigmaName || {}; // This map contains internalStyleId -> semanticKebabCaseName

  const categorizedStyles: Record<string, Record<string, { internalId: StyleId, semanticName: string, def: StyleTypes }>> = {
    colors: {},    // Includes fills and strokes that are simple colors
    typography: {},
    effects: {},
    layout: {},
  };

  for (const styleId in styles) {
    const styleDefinition = styles[styleId as keyof GlobalVars['styles']];
    // Prioritize the semantic name from our map. Fallback is less ideal but kept for safety.
    const semanticName = styleIdToNameMap[styleId as StyleId] || 
                       styleId.substring(styleId.indexOf('_') + 1).replace(/[^a-zA-Z0-9\-\/]/g, '-').toLowerCase() || 
                       styleId;

    // Use a consistent (kebab-case) version for table keys and display, if not already.
    // Note: styleIdToNameMap should already store kebab-case names from simplify-node-response.
    const displaySemanticName = semanticName; // Assuming it's already kebab-case from the map.

    const dataToStore = { internalId: styleId as StyleId, semanticName: displaySemanticName, def: styleDefinition };

    if (styleId.startsWith('fill_')) {
      categorizedStyles.colors[displaySemanticName] = dataToStore;
    } else if (styleId.startsWith('text_')) {
      categorizedStyles.typography[displaySemanticName] = dataToStore;
    } else if (styleId.startsWith('effect_')) {
      categorizedStyles.effects[displaySemanticName] = dataToStore;
    } else if (styleId.startsWith('layout_')) {
      categorizedStyles.layout[displaySemanticName] = dataToStore;
    } else if (styleId.startsWith('stroke_')) {
      const stroke = styleDefinition as SimplifiedStroke;
      if (stroke.colors && stroke.colors.length === 1) {
        const strokeColor = stroke.colors[0];
        if (typeof strokeColor === 'string' || (typeof strokeColor === 'object' && (strokeColor.hex || strokeColor.rgba))) {
          // For strokes that are simple colors, add to colors, with a modified name for clarity
          categorizedStyles.colors[`${displaySemanticName} (Border)`] = dataToStore;
        }
      }
    }
  }

  // Generate Colors.md
  let colorsMd = '## Color Styles\n\n';
  if (Object.keys(categorizedStyles.colors).length > 0) {
    colorsMd += '| Token Name | Internal ID (Debug) | Value | Preview (Hex/RGBA) | Details |\n';
    colorsMd += '|------------|---------------------|-------|--------------------|---------|\n';
    for (const tokenKey in categorizedStyles.colors) { // tokenKey is displaySemanticName or displaySemanticName + " (Border)"
      const {internalId, semanticName, def} = categorizedStyles.colors[tokenKey];
      // Create an HTML anchor for direct linking if Markdown processor doesn't do it well for table rows/cells
      const anchor = `<a name="${s(semanticName.replace(/\s*\(Border\)$/i, ''))}"></a>`;
      
      if (Array.isArray(def)) { // SimplifiedFill[] from fill_ style
        const fills = def as SimplifiedFill[];
        fills.forEach((fill, index) => {
          let valueColumn = 'Complex Fill';
          let previewColumn = '-';
          let detailsColumn = '';
          if (typeof fill === 'string') {
            valueColumn = s(fill);
            previewColumn = s(fill);
            detailsColumn = 'Type: Direct Color String';
          } else if (fill.hex) {
            valueColumn = 'Solid Color';
            previewColumn = s(fill.hex);
            detailsColumn = 'Type: Solid (Hex), Opacity: ' + (fill.opacity || 1);
          } else if (fill.rgba) {
            valueColumn = 'Solid Color';
            previewColumn = s(fill.rgba);
            detailsColumn = 'Type: Solid (RGBA), Opacity: ' + (fill.opacity || 1);
          } else if (fill.imageRef) {
            valueColumn = 'Image Fill';
            previewColumn = 'Image Ref: ' + s(fill.imageRef);
            detailsColumn = 'Type: Image, Scale Mode: ' + s(fill.scaleMode);
          } else {
            valueColumn = s(fill.type || 'Complex Fill');
            detailsColumn = formatJsonBlock(fill);
          }
          // For the first fill of a multi-fill style, include the anchor.
          const displayName = fills.length > 1 ? `${tokenKey}-${index + 1}` : tokenKey;
          const firstFillAnchor = index === 0 ? anchor : '';
          colorsMd += `| ${firstFillAnchor}${s(displayName)} | ${s(internalId)} | ${valueColumn} | ${TBT}${previewColumn}${TBT} | ${detailsColumn.replace(/\n/g, '<br/>')} |\n`;
        });
      } else { // Must be a SimplifiedStroke, as per categorization logic
          const stroke = def as SimplifiedStroke;
          const strokeColorFill = stroke.colors[0];
          let valueColumn = 'Complex Stroke';
          let previewColumn = '-';
          let detailsColumn = 'Weight: ' + s(stroke.strokeWeight) + 'px';
          if (typeof strokeColorFill === 'string'){
            valueColumn = 'Solid Border';
            previewColumn = s(strokeColorFill);
            detailsColumn += ', Type: Direct Color String';
          } else if (strokeColorFill.hex) {
            valueColumn = 'Solid Border';
            previewColumn = s(strokeColorFill.hex);
            detailsColumn += ', Type: Solid (Hex), Opacity: ' + (strokeColorFill.opacity || 1);
          } else if (strokeColorFill.rgba) {
            valueColumn = 'Solid Border';
            previewColumn = s(strokeColorFill.rgba);
            detailsColumn += ', Type: Solid (RGBA), Opacity: ' + (strokeColorFill.opacity || 1);
          } else {
            valueColumn = 'Complex Border Color';
            detailsColumn += ', Color: ' + formatJsonBlock(strokeColorFill);
          }
          colorsMd += `| ${anchor}${s(tokenKey)} | ${s(internalId)} | ${valueColumn} | ${TBT}${previewColumn}${TBT} | ${detailsColumn.replace(/\n/g, '<br/>')} |\n`;
      }
    }
  } else { colorsMd += 'No color styles found.\n'; }
  fs.writeFileSync(path.join(globalStylesDir, 'Colors.md'), colorsMd + '\n');

  // Generate Typography.md
  let typographyMd = '## Typography Styles\n\n';
  if (Object.keys(categorizedStyles.typography).length > 0) {
    typographyMd += '| Token Name | Internal ID (Debug) | Font Family | Size | Weight | Line Height | Letter Spacing | Case | Align H | Align V |\n';
    typographyMd += '|------------|---------------------|-------------|------|--------|-------------|----------------|------|---------|---------|\n';
    for (const tokenKey in categorizedStyles.typography) { // tokenKey is displaySemanticName
      const {internalId, semanticName, def} = categorizedStyles.typography[tokenKey];
      const style = def as TextStyle;
      const anchor = `<a name="${s(semanticName)}"></a>`;
      typographyMd += `| ${anchor}${s(tokenKey)} | ${s(internalId)} | ${s(style.fontFamily) || '-'} | ${s(style.fontSize) || '-'}px | ${s(style.fontWeight) || '-'} | ${s(style.lineHeight) || '-'} | ${s(style.letterSpacing) || '-'} | ${s(style.textCase) || '-'} | ${s(style.textAlignHorizontal) || '-'} | ${s(style.textAlignVertical) || '-'} |\n`;
    }
  } else { typographyMd += 'No typography styles found.\n'; }
  fs.writeFileSync(path.join(globalStylesDir, 'Typography.md'), typographyMd + '\n');

  // Generate Effects.md
  let effectsMd = '## Effect Styles (Shadows, Blurs)\n\n';
  if (Object.keys(categorizedStyles.effects).length > 0) {
    effectsMd += '| Token Name | Internal ID (Debug) | Type | Details |\n';
    effectsMd += '|------------|---------------------|------|---------|\n';
    for (const tokenKey in categorizedStyles.effects) { // tokenKey is displaySemanticName
      const {internalId, semanticName, def} = categorizedStyles.effects[tokenKey];
      const effectStyle = def as SimplifiedEffects;
      const anchor = `<a name="${s(semanticName)}"></a>`;
      let typeColumn = 'Effect';
      let detailsValue = '';

      if (effectStyle.boxShadow) {
        typeColumn = 'Box Shadow';
        detailsValue += 'CSS: ' + TBT + 'css\nbox-shadow: ' + s(effectStyle.boxShadow) + ';\n' + TBT + '<br/>';
      }
      if (effectStyle.filter) {
        typeColumn = effectStyle.boxShadow ? 'Mixed (Shadow & Filter)' : 'Filter';
        detailsValue += 'CSS: ' + TBT + 'css\nfilter: ' + s(effectStyle.filter) + ';\n' + TBT + '<br/>';
      }
      if (effectStyle.backdropFilter) {
        typeColumn = (effectStyle.boxShadow || effectStyle.filter) ? 'Mixed (Multiple)' : 'Backdrop Filter';
        detailsValue += 'CSS: ' + TBT + 'css\nbackdrop-filter: ' + s(effectStyle.backdropFilter) + ';\n' + TBT + '<br/>';
      }
      
      if (!detailsValue) { // Fallback if no specific properties found
        typeColumn = 'Complex Effect';
        detailsValue = formatJsonBlock(effectStyle);
      }

      effectsMd += `| ${anchor}${s(tokenKey)} | ${s(internalId)} | ${s(typeColumn)} | ${detailsValue.replace(/\n/g, '').replace(/<br\/>$/, '')} |\n`;
    }
  } else { effectsMd += 'No effect styles found.\n'; }
  fs.writeFileSync(path.join(globalStylesDir, 'Effects.md'), effectsMd + '\n');
  
  // Generate LayoutAndSpacing.md
  let layoutMd = '## Layout & Spacing Styles\n\n';
  if (Object.keys(categorizedStyles.layout).length > 0) {
    layoutMd += '| Token Name | Internal ID (Debug) | Details |\n';
    layoutMd += '|------------|---------------------|---------|\n';
    for (const tokenKey in categorizedStyles.layout) { // tokenKey is displaySemanticName
      const {internalId, semanticName, def} = categorizedStyles.layout[tokenKey];
      const layout = def as SimplifiedLayout;
      const anchor = `<a name="${s(semanticName)}"></a>`;
      layoutMd += `| ${anchor}${s(tokenKey)} | ${s(internalId)} | ${s(describeSimplifiedLayout(layout))} |\n`;
    }
  } else { layoutMd += 'No layout/spacing styles found.\n'; }
  fs.writeFileSync(path.join(globalStylesDir, 'LayoutAndSpacing.md'), layoutMd + '\n');
}


function generateAndSaveComponentsByPageMarkdown(design: SimplifiedDesign, componentsDir: string): void {
  if (!design.nodes || design.nodes.length === 0) {
    fs.writeFileSync(path.join(componentsDir, 'NoPagesFound.md'), 'No pages (canvases) found in the Figma file.');
    return;
  }

  design.nodes.forEach(canvasNode => {
    // Assuming top-level nodes are canvases/pages. Adjust 'CANVAS' if your structure differs.
    if (canvasNode.type === 'CANVAS') { 
      let pageMd = `# Page: ${s(canvasNode.name)}\n\n`;
      pageMd += `*ID: ${s(canvasNode.id)}*\n\n`;
      
      if (canvasNode.children && canvasNode.children.length > 0) {
        pageMd += documentNodesRecursive(canvasNode.children, 0, design.globalVars, canvasNode.id);
      } else {
        pageMd += 'No components or top-level frames found on this page.\n';
      }
      fs.writeFileSync(path.join(componentsDir, sanitizeFileName(canvasNode.name)), pageMd);
    } else {
      // Handle cases where top-level nodes are not CANVASES if necessary
      // For now, we only process CANVASES as pages
      let nonCanvasPageMd = `# Node: ${s(canvasNode.name)} (Type: ${s(canvasNode.type)})\n\n`;
      nonCanvasPageMd += `This top-level node is not a 'CANVAS'. Its children are listed below if any.\n\n`;
      if (canvasNode.children && canvasNode.children.length > 0) {
        nonCanvasPageMd += documentNodesRecursive(canvasNode.children, 0, design.globalVars, canvasNode.id);
      } else {
        nonCanvasPageMd += 'No children found for this node.\n';
      }
      fs.writeFileSync(path.join(componentsDir, sanitizeFileName(`${canvasNode.type}_${canvasNode.name}`)), nonCanvasPageMd);
    }
  });
}

// Recursive function to document nodes (components, frames, instances, text, etc.)
// Needs to be adapted for the new multi-file structure (e.g., linking to global styles)
function documentNodesRecursive(nodesToDocument: SimplifiedNode[], level: number, globalVars: GlobalVars, pageId: string): string {
  let nodesMd = '';
  const indent = '  '.repeat(level);
  for (const currentNode of nodesToDocument) { 
    let nodePrefix = '';
    const componentLinkName = `component-${pageId}-${s(currentNode.id)}`;
    if (currentNode.type === 'COMPONENT') {
      nodePrefix = `<a name="${componentLinkName}"></a>**COMPONENT DEFINITION:** `;
    }
    nodesMd += `${indent}- ${nodePrefix}**${s(currentNode.name)}** (Type: ${s(currentNode.type)}, ID: ${s(currentNode.id)})\n`;
    
    if (currentNode.opacity !== undefined && currentNode.opacity !== 1) {
      nodesMd += `${indent}  - Opacity: ${currentNode.opacity}\n`;
    }
    if (currentNode.borderRadius) {
      nodesMd += `${indent}  - BorderRadius: ${s(currentNode.borderRadius)}\n`;
    }

    if (currentNode.type === 'TEXT' && currentNode.text) {
      nodesMd += `${indent}  - Text Content: "${s(currentNode.text)}"\n`;
    }
    if (currentNode.type === 'INSTANCE') {
      let instanceText = '  - (Instance of a component.';
      if (currentNode.mainComponentId) {
        // Link to component definition. If it's on a different page, this link might be more complex.
        // For now, assume component definitions are documented on their respective pages.
        // An advanced system might build a global component map to generate correct cross-page links.
        const mainCompPageId = globalVars.components?.[currentNode.mainComponentId]?.id.split(';')[0]; // Heuristic
        const mainCompLink = `../${sanitizeFileName(mainCompPageId || 'UnknownPage') }#component-${mainCompPageId || 'UnknownPage'}-${s(currentNode.mainComponentId)}`;
        
        instanceText += ` Main Component ID: [${s(currentNode.mainComponentId)}](${mainCompLink}).`;

        if (globalVars && globalVars.components && globalVars.components[currentNode.mainComponentId]) {
          const mainComp = globalVars.components[currentNode.mainComponentId];
          instanceText += ` (Main Component Name: "${s(mainComp.name)}"`;
          if (mainComp.description) {
            instanceText += `, Description: "${s(mainComp.description)}"`;
          }
          instanceText += ')';
        }
      }
      instanceText += ' Further details depend on main component definition.)\n';
      nodesMd += indent + instanceText;
    }
    
    // Linking to global styles (adjust paths as needed)
    const relativeGlobalStylesPath = '../GlobalStyles';
    if (currentNode.textStyle) {
      const semanticName = globalVars.styleIdToFigmaName?.[currentNode.textStyle as StyleId] || currentNode.textStyle;
      nodesMd += `${indent}  - TextStyle Ref: [${s(semanticName)}](${relativeGlobalStylesPath}/Typography.md#${s(semanticName)}) (See Typography Styles)\n`;
    }
    if (currentNode.fills) {
      const semanticName = globalVars.styleIdToFigmaName?.[currentNode.fills as StyleId] || currentNode.fills;
      nodesMd += `${indent}  - Fills Ref: [${s(semanticName)}](${relativeGlobalStylesPath}/Colors.md#${s(semanticName)}) (See Color Styles)\n`;
    }
    if (currentNode.strokes) {
      const semanticName = globalVars.styleIdToFigmaName?.[currentNode.strokes as StyleId] || currentNode.strokes;
      // For strokes, the anchor in Colors.md might have " (Border)" appended if it was categorized as a color.
      // We need to ensure the link anchor matches how it was created in generateAndSaveGlobalStylesMarkdown.
      // The semanticName from styleIdToFigmaName is the base (e.g., 'primary-border').
      // The anchor in Colors.md for a stroke added to colors is <a name="primary-border"></a> (without " (Border)").
      nodesMd += `${indent}  - Strokes Ref: [${s(semanticName)}](${relativeGlobalStylesPath}/Colors.md#${s(semanticName)}) (See Color Styles for Borders)\n`;
    }
    if (currentNode.effects) {
      const semanticName = globalVars.styleIdToFigmaName?.[currentNode.effects as StyleId] || currentNode.effects;
      nodesMd += `${indent}  - Effects Ref: [${s(semanticName)}](${relativeGlobalStylesPath}/Effects.md#${s(semanticName)}) (See Effect Styles)\n`;
    }
    if (currentNode.layout) {
      const semanticName = globalVars.styleIdToFigmaName?.[currentNode.layout as StyleId] || currentNode.layout;
      nodesMd += `${indent}  - Layout Style Ref: [${s(semanticName)}](${relativeGlobalStylesPath}/LayoutAndSpacing.md#${s(semanticName)}) (See Layout Styles)\n`;
    } else if (currentNode.type === 'FRAME' || currentNode.type === 'GROUP' || currentNode.type === 'RECTANGLE' || currentNode.type === 'COMPONENT') {
        // Output direct layout properties if not referencing a global style
        // This requires buildSimplifiedLayout to be callable for a node directly
        // and for SimplifiedNode to store these if not a global style.
        // For now, we check if a SimplifiedLayout object is directly on the node (not standard practice)
        // Or, describe raw properties if available.
        // Placeholder: the current simplifiedNode doesn't directly hold detailed layout props if not from a style.
    }

    if (currentNode.children && currentNode.children.length > 0) {
      nodesMd += documentNodesRecursive(currentNode.children, level + 1, globalVars, pageId);
    }
  }
  return nodesMd;
}


// This is the old function, kept for reference or if we need to revert. 
// It will be replaced by the new structured documentation generator.
export function generateMarkdownFromSimplifiedDesign(design: SimplifiedDesign): string {
  let md = ''; // Initialize as empty string

  md += '# Design System Documentation: ' + s(design.name) + '\n\n';
  md += 'Last Modified: ' + s(design.lastModified) + '\n\n';

  if (design.thumbnailUrl) {
    md += '## Thumbnail\n';
    md += '![Thumbnail](' + s(design.thumbnailUrl) + ')\n\n';
  }

  // Document Global Styles
  if (design.globalVars && design.globalVars.styles && Object.keys(design.globalVars.styles).length > 0) {
    md += '## Global Styles\n\n';
    
    const styles = design.globalVars.styles;
    const categorizedStyles: Record<string, Record<string, StyleTypes>> = {
      colors: {},
      typography: {},
      effects: {},
      layout: {},
    };

    for (const styleId in styles) {
      const styleDefinition = styles[styleId as keyof GlobalVars['styles']];
      
      let nameForTable: string;
      // Prioritize human-readable name from Figma's published styles via our map
      if (design.globalVars.styleIdToFigmaName && design.globalVars.styleIdToFigmaName[styleId as StyleId]) {
        nameForTable = design.globalVars.styleIdToFigmaName[styleId as StyleId]!;
      } else {
        // Fallback: strip prefix from our internal styleId
        let fallbackName = styleId;
        const knownPrefixes = ["fill_", "text_", "effect_", "layout_", "stroke_"];
        for (const p of knownPrefixes) {
          if (styleId.startsWith(p)) {
            fallbackName = styleId.substring(p.length);
            break;
          }
        }
        nameForTable = fallbackName;
      }

      if (styleId.startsWith('fill_')) {
        categorizedStyles.colors[nameForTable] = styleDefinition;
      } else if (styleId.startsWith('text_')) {
        categorizedStyles.typography[nameForTable] = styleDefinition;
      } else if (styleId.startsWith('effect_')) {
        categorizedStyles.effects[nameForTable] = styleDefinition;
      } else if (styleId.startsWith('layout_')) {
        categorizedStyles.layout[nameForTable] = styleDefinition;
      } else if (styleId.startsWith('stroke_')) {
        const stroke = styleDefinition as SimplifiedStroke;
        if (stroke.colors && stroke.colors.length === 1) {
          const strokeColor = stroke.colors[0];
          // Ensure the strokeColor is a simple color before categorizing it as a color
          if (typeof strokeColor === 'string' || (typeof strokeColor === 'object' && (strokeColor.hex || strokeColor.rgba))) {
             // Use nameForTable as the key. The 'Value' column in the table will indicate it's a border.
             categorizedStyles.colors[nameForTable] = styleDefinition; 
          }
        }
      }
    }

    // Render Colors
    if (Object.keys(categorizedStyles.colors).length > 0) {
      md += '### Colors\n\n';
      md += '| Name | Value | Preview (Hex/RGBA) | Details |\n';
      md += '|------|-------|--------------------|---------|\n';
      for (const name in categorizedStyles.colors) {
        const styleDef = categorizedStyles.colors[name];
        if (Array.isArray(styleDef)) { // SimplifiedFill[]
          const fills = styleDef as SimplifiedFill[];
          fills.forEach((fill, index) => {
            let valueColumn = 'Complex Fill';
            let previewColumn = '-';
            let detailsColumn = '';

            if (typeof fill === 'string') {
              valueColumn = s(fill);
              previewColumn = s(fill); // Assuming string fill is a direct color string
              detailsColumn = 'Type: Direct Color String';
            } else if (fill.hex) {
              valueColumn = 'Solid Color';
              previewColumn = s(fill.hex);
              detailsColumn = 'Type: Solid (Hex), Opacity: ' + (fill.opacity || 1);
            } else if (fill.rgba) {
              valueColumn = 'Solid Color';
              previewColumn = s(fill.rgba);
              detailsColumn = 'Type: Solid (RGBA), Opacity: ' + (fill.opacity || 1);
            } else if (fill.imageRef) {
              valueColumn = 'Image Fill';
              previewColumn = 'Image Ref: ' + s(fill.imageRef);
              detailsColumn = 'Type: Image, Scale Mode: ' + s(fill.scaleMode);
            } else { // Gradients or other complex fills
              valueColumn = s(fill.type || 'Complex Fill'); // e.g. GRADIENT_LINEAR
              detailsColumn = formatJsonBlock(fill);
            }
            md += '| ' + s(name) + (fills.length > 1 ? '-' + (index + 1) : '') + 
                  ' | ' + valueColumn +
                  ' | ' + TBT + previewColumn + TBT + 
                  ' | ' + detailsColumn.replace(/\n/g, '<br/>') + ' |\n';
          });
        } else if ((styleDef as SimplifiedStroke).colors) { // SimplifiedStroke
            const stroke = styleDef as SimplifiedStroke;
            const strokeColorFill = stroke.colors[0];
            let valueColumn = 'Complex Stroke';
            let previewColumn = '-';
            let detailsColumn = 'Weight: ' + s(stroke.strokeWeight) + 'px';

            if (typeof strokeColorFill === 'string'){
              valueColumn = 'Solid Border';
              previewColumn = s(strokeColorFill);
              detailsColumn += ', Type: Direct Color String';
            } else if (strokeColorFill.hex) {
              valueColumn = 'Solid Border';
              previewColumn = s(strokeColorFill.hex);
              detailsColumn += ', Type: Solid (Hex), Opacity: ' + (strokeColorFill.opacity || 1);
            } else if (strokeColorFill.rgba) {
              valueColumn = 'Solid Border';
              previewColumn = s(strokeColorFill.rgba);
              detailsColumn += ', Type: Solid (RGBA), Opacity: ' + (strokeColorFill.opacity || 1);
            } else {
              valueColumn = 'Complex Border Color';
              detailsColumn += ', Color: ' + formatJsonBlock(strokeColorFill);
            }
            md += '| ' + s(name) + 
                  ' | ' + valueColumn +
                  ' | ' + TBT + previewColumn + TBT +
                  ' | ' + detailsColumn.replace(/\n/g, '<br/>') + ' |\n';
        }
      }
      md += '\n';
    }

    // Render Typography
    if (Object.keys(categorizedStyles.typography).length > 0) {
      md += '### Typography\n\n';
      md += '| Name | Font Family | Size | Weight | Line Height | Letter Spacing | Case | Align H | Align V |\n';
      md += '|------|-------------|------|--------|-------------|----------------|------|---------|---------|\n';
      for (const name in categorizedStyles.typography) {
        const style = categorizedStyles.typography[name] as TextStyle;
        md += '| ' + s(name) + 
              ' | ' + (s(style.fontFamily) || '-') + 
              ' | ' + (s(style.fontSize) || '-') + 'px' +
              ' | ' + (s(style.fontWeight) || '-') + 
              ' | ' + (s(style.lineHeight) || '-') + 
              ' | ' + (s(style.letterSpacing) || '-') + 
              ' | ' + (s(style.textCase) || '-') + 
              ' | ' + (s(style.textAlignHorizontal) || '-') + 
              ' | ' + (s(style.textAlignVertical) || '-') + ' |\n';
      }
      md += '\n';
    }

    // Render Effects
    if (Object.keys(categorizedStyles.effects).length > 0) {
      md += '### Effects (Shadows, Blurs)\n\n';
      md += '| Name | Type | Details |\n';
      md += '|------|------|---------|\n';
      for (const name in categorizedStyles.effects) {
        const effectStyle = categorizedStyles.effects[name] as SimplifiedEffects;
        let typeColumn = 'Effect';
        let detailsValue = '';

        if (effectStyle.boxShadow) {
          typeColumn = 'Box Shadow';
          detailsValue += 'CSS: ' + TBT + 'css\nbox-shadow: ' + s(effectStyle.boxShadow) + ';\n' + TBT + '<br/>';
        }
        if (effectStyle.filter) {
          typeColumn = effectStyle.boxShadow ? 'Mixed (Shadow & Filter)' : 'Filter';
          detailsValue += 'CSS: ' + TBT + 'css\nfilter: ' + s(effectStyle.filter) + ';\n' + TBT + '<br/>';
        }
        if (effectStyle.backdropFilter) {
          typeColumn = (effectStyle.boxShadow || effectStyle.filter) ? 'Mixed (Multiple)' : 'Backdrop Filter';
          detailsValue += 'CSS: ' + TBT + 'css\nbackdrop-filter: ' + s(effectStyle.backdropFilter) + ';\n' + TBT + '<br/>';
        }
        
        if (!detailsValue) { // Fallback if no specific properties found
          typeColumn = 'Complex Effect';
          detailsValue = formatJsonBlock(effectStyle);
        }

        md += '| ' + s(name) + 
              ' | ' + s(typeColumn) +
              ' | ' + detailsValue.replace(/\n/g, '').replace(/<br\/>$/, '') + ' |\n'; // Remove trailing <br/> if any
      }
      md += '\n';
    }
    
    // Render Layout/Spacing (Basic)
    if (Object.keys(categorizedStyles.layout).length > 0) {
      md += '### Layout & Spacing Styles\n\n';
      md += '| Name | Details |\n';
      md += '|------|---------|\n';
      for (const name in categorizedStyles.layout) {
        const layout = categorizedStyles.layout[name] as SimplifiedLayout;
        md += '| ' + s(name) + ' | ' + s(describeSimplifiedLayout(layout)) + ' |\n';
      }
      md += '\n';
    }

  } else {
    md += 'No global styles found.\n\n';
  }

  // Document Nodes
  md += '## Nodes & Components\n\n';
  if (design.nodes && design.nodes.length > 0) {
    md += 'Found ' + design.nodes.length + ' top-level nodes.\n\n';
    
    function documentNodesRecursiveOld(nodesToDocument: SimplifiedNode[], level: number): string {
      let nodesMd = '';
      const indent = '  '.repeat(level);
      for (const currentNode of nodesToDocument) { 
        let nodePrefix = '';
        if (currentNode.type === 'COMPONENT') {
          nodePrefix = `<a name="component-${s(currentNode.id)}"></a>**COMPONENT DEFINITION:** `;
        }
        nodesMd += indent + '- ' + nodePrefix + '**' + s(currentNode.name) + '** (Type: ' + s(currentNode.type) + ', ID: ' + s(currentNode.id) + ')\n';
        
        // Common properties
        if (currentNode.opacity !== undefined && currentNode.opacity !== 1) {
          nodesMd += indent + '  - Opacity: ' + currentNode.opacity + '\n';
        }
        if (currentNode.borderRadius) {
          nodesMd += indent + '  - BorderRadius: ' + s(currentNode.borderRadius) + '\n';
        }

        // Type-specific properties
        if (currentNode.type === 'TEXT' && currentNode.text) {
          nodesMd += indent + '  - Text Content: "' + s(currentNode.text) + '"\n';
        }
        if (currentNode.type === 'INSTANCE') {
          let instanceText = '  - (Instance of a component.';
          if (currentNode.mainComponentId) {
            instanceText += ` Main Component ID: [${s(currentNode.mainComponentId)}](#component-${s(currentNode.mainComponentId)}).`;
            // Check if main component details are available in design.globalVars.components
            if (design.globalVars && design.globalVars.components && design.globalVars.components[currentNode.mainComponentId]) {
              const mainComp = design.globalVars.components[currentNode.mainComponentId];
              instanceText += ` (Main Component Name: "${s(mainComp.name)}"`;
              if (mainComp.description) {
                instanceText += `, Description: "${s(mainComp.description)}"`;
              }
              instanceText += ')';
            }
          }
          instanceText += ' Further details depend on main component definition.)\n';
          nodesMd += indent + instanceText;
        }
        // For frames or other elements, list direct style applications if any
        // These are style *references* to the globalVars.styles table
        if (currentNode.textStyle) {
          nodesMd += indent + '  - TextStyle Ref: ' + s(currentNode.textStyle) + ' (See Global Styles)\n';
        }
        if (currentNode.fills) {
          nodesMd += indent + '  - Fills Ref: ' + s(currentNode.fills) + ' (See Global Styles)\n';
        }
        if (currentNode.strokes) {
          nodesMd += indent + '  - Strokes Ref: ' + s(currentNode.strokes) + ' (See Global Styles)\n';
        }
        if (currentNode.effects) {
          nodesMd += indent + '  - Effects Ref: ' + s(currentNode.effects) + ' (See Global Styles)\n';
        }
        if (currentNode.layout) {
          // The layout property on a node is a *reference* to a global style layout
          nodesMd += indent + '  - Layout Style Ref: ' + s(currentNode.layout) + ' (See Global Styles)\n';
        } else if (currentNode.type === 'FRAME' || currentNode.type === 'GROUP' || currentNode.type === 'RECTANGLE') {
            // If there is no layout *style reference*, we might want to output raw layout properties if they exist directly on the node.
            // However, SimplifiedNode schema puts layout properties (like gap, padding) into a SimplifiedLayout object which is then referenced.
            // So, raw layout properties not part of a global style are less likely with current schema.
            // We can add specific checks if we adapt SimplifiedNode to hold more direct properties.
            nodesMd += indent + '  - (This node might have direct layout properties not captured as a global style. Check Figma.)\n';
        }

        if (currentNode.children && currentNode.children.length > 0) {
          nodesMd += documentNodesRecursiveOld(currentNode.children, level + 1);
        }
      }
      return nodesMd;
    }
    md += documentNodesRecursiveOld(design.nodes, 0);
  } else {
    md += 'No nodes found in the design.\n';
  }

  return md;
} 