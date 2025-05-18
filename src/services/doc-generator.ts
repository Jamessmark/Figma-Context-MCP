import type { SimplifiedDesign, GlobalVars, StyleTypes, SimplifiedFill, TextStyle, SimplifiedNode } from './simplify-node-response.js';
import type { SimplifiedEffects } from '../transformers/effects.js';
import type { SimplifiedLayout } from '../transformers/layout.js';
import type { SimplifiedStroke } from '../transformers/style.js';

// Helper to sanitize strings
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
      const name = styleId.replace(/^(fill_|text_|effect_|layout_|stroke_)/, '');

      if (styleId.startsWith('fill_')) {
        categorizedStyles.colors[name] = styleDefinition;
      } else if (styleId.startsWith('text_')) {
        categorizedStyles.typography[name] = styleDefinition;
      } else if (styleId.startsWith('effect_')) {
        categorizedStyles.effects[name] = styleDefinition;
      } else if (styleId.startsWith('layout_')) {
        categorizedStyles.layout[name] = styleDefinition;
      } else if (styleId.startsWith('stroke_')) {
        const stroke = styleDefinition as SimplifiedStroke;
        if (stroke.colors && stroke.colors.length === 1) {
          const strokeColor = stroke.colors[0];
          if (typeof strokeColor === 'string' || strokeColor.hex || strokeColor.rgba) {
             categorizedStyles.colors['stroke_' + s(name)] = styleDefinition;
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
            const strokeColorFill = stroke.colors[0]; // This is a SimplifiedFill object/string
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
        md += '| ' + s(name) + ' | ' + formatJsonBlock(layout) + ' |\n';
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
    
    function documentNodesRecursive(nodesToDocument: SimplifiedNode[], level: number): string {
      let nodesMd = '';
      const indent = '  '.repeat(level);
      for (const currentNode of nodesToDocument) { 
        nodesMd += indent + '- **' + s(currentNode.name) + '** (Type: ' + s(currentNode.type) + ', ID: ' + s(currentNode.id) + ')\n';
        
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
          nodesMd += indent + '  - (Instance of a component. Further details depend on main component definition.)\n';
          // Future: if mainComponentId is available on SimplifiedNode, could print: `Instance of: ${currentNode.mainComponentId}`
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
          nodesMd += documentNodesRecursive(currentNode.children, level + 1);
        }
      }
      return nodesMd;
    }
    md += documentNodesRecursive(design.nodes, 0);
  } else {
    md += 'No nodes found in the design.\n';
  }

  return md;
} 