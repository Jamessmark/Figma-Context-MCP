import type { SimplifiedDesign, GlobalVars, StyleTypes, SimplifiedFill, TextStyle, SimplifiedNode, StyleId, ComponentRendition } from './simplify-node-response.js';
import type { SimplifiedEffects } from '../transformers/effects.js';
import { type SimplifiedLayout, describeSimplifiedLayout } from '../transformers/layout.js';
import type { SimplifiedStroke } from '../transformers/style.js';
import { analyzeComponents, type ComponentAnalysisResult } from './component-analysis.js';
import { validateDesignSystem, checkAccessibility } from './design-system-tools.js';
import { generateTokensFromSimplifiedDesign } from './token-generator.js';
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

// Add toKebabCase utility function if not present (it should be added)
function toKebabCase(name: string): string {
  if (!name) return '';
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // Separate camelCase
    .replace(/[^a-zA-Z0-9\-]+/g, '-')      // Replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '')             // Remove leading/trailing hyphens
    .toLowerCase();
}

// --- Main Orchestrator --- 
export function generateStructuredDesignSystemDocumentation(design: SimplifiedDesign, baseOutputDirectoryPath: string): void {
  console.log('Starting enhanced documentation generation...');
  
  // Ensure base directory exists (it should have been created by mcp.ts, but double check)
  if (!fs.existsSync(baseOutputDirectoryPath)) {
    fs.mkdirSync(baseOutputDirectoryPath, { recursive: true });
  }

  let tokens: any;
  let componentAnalysis: any;
  let validation: any;
  let accessibilityIssues: any[] = [];

  try {
    console.log('Generating design tokens for validation and accessibility...');
    // Generate design tokens for validation and accessibility checking
    tokens = generateTokensFromSimplifiedDesign(design);
    console.log('Tokens generated successfully');
  } catch (error) {
    console.error('Error generating tokens:', error);
    tokens = { colors: {}, typography: {}, spacing: {}, effects: {} };
  }
  
  try {
    console.log('Performing component analysis...');
    // Perform component analysis
    componentAnalysis = analyzeComponents(design);
    console.log('Component analysis completed:', componentAnalysis.summary);
  } catch (error) {
    console.error('Error in component analysis:', error);
    componentAnalysis = {
      summary: { totalComponents: 0, complexityScore: 0, consistencyScore: 0, implementationEffort: 'low', keyRecommendations: [] },
      atomicHierarchy: { atoms: [], molecules: [], organisms: [] },
      implementationReadiness: { readyToImplement: [], needsSpecification: [], hasIssues: [] },
      designPatterns: []
    };
  }
  
  try {
    console.log('Validating design system...');
    // Validate design system
    validation = validateDesignSystem(tokens);
    console.log('Validation completed:', validation.passed);
  } catch (error) {
    console.error('Error in validation:', error);
    validation = { passed: false, summary: { totalChecks: 0, passed: 0, failed: 0, warnings: 0 }, errors: [], warnings: [] };
  }
  
  try {
    console.log('Checking accessibility compliance...');
    // Check accessibility compliance
    accessibilityIssues = checkAccessibility(tokens);
    console.log('Accessibility check completed:', accessibilityIssues.length, 'issues found');
  } catch (error) {
    console.error('Error in accessibility check:', error);
    accessibilityIssues = [];
  }

  try {
    console.log('Generating enhanced overview...');
    // 1. Generate Enhanced Overview with analysis results
    const overviewContent = generateEnhancedOverviewMarkdown(design, baseOutputDirectoryPath, componentAnalysis, validation, accessibilityIssues);
    fs.writeFileSync(path.join(baseOutputDirectoryPath, '_Overview.md'), overviewContent);
    console.log('Enhanced overview generated successfully');
  } catch (error) {
    console.error('Error generating enhanced overview:', error);
    // Fallback to basic overview
    const basicOverview = `# Design System Overview: ${design.name}\n\n*Last Modified:* ${design.lastModified}\n\nBasic documentation generated due to analysis errors.`;
    fs.writeFileSync(path.join(baseOutputDirectoryPath, '_Overview.md'), basicOverview);
  }

  console.log('Generating global styles...');
  // 2. Generate Global Styles
  const globalStylesDir = path.join(baseOutputDirectoryPath, 'GlobalStyles');
  if (!fs.existsSync(globalStylesDir)) {
    fs.mkdirSync(globalStylesDir, { recursive: true });
  }
  generateAndSaveGlobalStylesMarkdown(design, globalStylesDir);

  console.log('Generating components documentation...');
  // 3. Generate Components per Page
  const componentsDir = path.join(baseOutputDirectoryPath, 'Components');
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }
  generateAndSaveComponentsByPageMarkdown(design, componentsDir);

  console.log('Creating Analysis directory...');
  // 4. Generate Component Analysis Report
  const analysisDir = path.join(baseOutputDirectoryPath, 'Analysis');
  if (!fs.existsSync(analysisDir)) {
    fs.mkdirSync(analysisDir, { recursive: true });
  }
  console.log('Analysis directory created:', analysisDir);
  
  try {
    console.log('Generating component analysis markdown...');
    generateComponentAnalysisMarkdown(componentAnalysis, analysisDir);
    console.log('Component analysis markdown generated');
  } catch (error) {
    console.error('Error generating component analysis markdown:', error);
  }
  
  try {
    console.log('Generating validation report...');
    // 5. Generate Validation Report
    generateValidationReportMarkdown(validation, analysisDir);
    console.log('Validation report generated');
  } catch (error) {
    console.error('Error generating validation report:', error);
  }
  
  try {
    console.log('Generating accessibility report...');
    // 6. Generate Accessibility Report
    generateAccessibilityReportMarkdown(accessibilityIssues, analysisDir);
    console.log('Accessibility report generated');
  } catch (error) {
    console.error('Error generating accessibility report:', error);
  }
  
  try {
    console.log('Generating implementation guide...');
    // 7. Generate Implementation Guide
    generateImplementationGuideMarkdown(componentAnalysis, tokens, analysisDir);
    console.log('Implementation guide generated');
  } catch (error) {
    console.error('Error generating implementation guide:', error);
  }
  
  console.log('Enhanced documentation generation completed!');
}

// --- Markdown Generation Functions --- 

function generateEnhancedOverviewMarkdown(design: SimplifiedDesign, baseOutputDirectoryPath: string, componentAnalysis: ComponentAnalysisResult, validation: any, accessibilityIssues: any[]): string {
  let md = `# Design System Overview: ${s(design.name)}\n\n`;
  md += `*Last Modified:* ${s(design.lastModified)}\n\n`;

  if (design.thumbnailUrl) {
    md += `## Thumbnail\n`;
    md += `![Thumbnail](${s(design.thumbnailUrl)})\n\n`;
  }

  // Add Health Summary
  md += `## System Health Summary\n\n`;
  md += `### Component Analysis\n`;
  md += `- **Total Components**: ${componentAnalysis.summary.totalComponents}\n`;
  md += `- **Atoms**: ${componentAnalysis.atomicHierarchy.atoms.length}\n`;
  md += `- **Molecules**: ${componentAnalysis.atomicHierarchy.molecules.length}\n`;
  md += `- **Organisms**: ${componentAnalysis.atomicHierarchy.organisms.length}\n`;
  md += `- **Complexity Score**: ${componentAnalysis.summary.complexityScore}/100\n`;
  md += `- **Consistency Score**: ${componentAnalysis.summary.consistencyScore}/100\n`;
  md += `- **Implementation Effort**: ${componentAnalysis.summary.implementationEffort.toUpperCase()}\n\n`;

  md += `### Validation Status\n`;
  const validationStatus = validation.passed ? '✅ PASSED' : '❌ FAILED';
  md += `- **Overall Status**: ${validationStatus}\n`;
  md += `- **Checks Passed**: ${validation.summary.passed}/${validation.summary.totalChecks}\n`;
  md += `- **Errors**: ${validation.summary.failed}\n`;
  md += `- **Warnings**: ${validation.summary.warnings}\n\n`;

  md += `### Accessibility Status\n`;
  const accessibilityErrors = accessibilityIssues.filter(issue => issue.severity === 'error').length;
  const accessibilityWarnings = accessibilityIssues.filter(issue => issue.severity === 'warning').length;
  const accessibilityStatus = accessibilityErrors === 0 ? '✅ COMPLIANT' : '❌ ISSUES FOUND';
  md += `- **Overall Status**: ${accessibilityStatus}\n`;
  md += `- **Critical Issues**: ${accessibilityErrors}\n`;
  md += `- **Warnings**: ${accessibilityWarnings}\n\n`;

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
  
  md += `- [Analysis Reports](./Analysis/)\n`;
  md += `  - [Component Analysis](./Analysis/ComponentAnalysis.md)\n`;
  md += `  - [Validation Report](./Analysis/ValidationReport.md)\n`;
  md += `  - [Accessibility Report](./Analysis/AccessibilityReport.md)\n`;
  md += `  - [Implementation Guide](./Analysis/ImplementationGuide.md)\n`;
  md += `\n`;

  return md;
}

function generateAndSaveGlobalStylesMarkdown(design: SimplifiedDesign, globalStylesDir: string): void {
  if (!design.globalVars || !design.globalVars.styles || Object.keys(design.globalVars.styles).length === 0) {
    fs.writeFileSync(path.join(globalStylesDir, 'NoGlobalStyles.md'), 'No global styles found in the design system.');
    return;
  }

  const styles = design.globalVars.styles;

  const categorizedStyles: Record<string, Record<string, { internalId: StyleId, def: StyleTypes }>> = {
    colors: {},    // Includes fills and strokes that are simple colors
    typography: {},
    effects: {},
    layout: {},
  };

  for (const styleId in styles) {
    const styleDefinition = styles[styleId as keyof GlobalVars['styles']];
    // The styleId is the name. Kebab-case it for consistent display and linking.
    const displayName = toKebabCase(styleId);

    const dataToStore = { internalId: styleId as StyleId, def: styleDefinition };

    if (styleId.startsWith('fill_')) {
      categorizedStyles.colors[displayName] = dataToStore;
    } else if (styleId.startsWith('text_')) {
      categorizedStyles.typography[displayName] = dataToStore;
    } else if (styleId.startsWith('effect_')) {
      categorizedStyles.effects[displayName] = dataToStore;
    } else if (styleId.startsWith('layout_')) {
      categorizedStyles.layout[displayName] = dataToStore;
    } else if (styleId.startsWith('stroke_')) {
      const stroke = styleDefinition as SimplifiedStroke;
      if (stroke.colors && stroke.colors.length === 1) {
        const strokeColor = stroke.colors[0];
        if (typeof strokeColor === 'string' || (typeof strokeColor === 'object' && (strokeColor.hex || strokeColor.rgba))) {
          categorizedStyles.colors[`${displayName} (Border)`] = dataToStore; // Keep (Border) for clarity in Colors table
        }
      }
    }
  }

  // Generate Colors.md
  let colorsMd = '## Color Styles\n\n';
  if (Object.keys(categorizedStyles.colors).length > 0) {
    colorsMd += '| Token Name | Value | Preview (Hex/RGBA) | Details |\n'; // REMOVED Internal ID column
    colorsMd += '|------------|-------|--------------------|---------|\n';
    for (const tokenKey in categorizedStyles.colors) { // tokenKey is kebab-cased styleId or kebab-cased styleId + " (Border)"
      const {def} = categorizedStyles.colors[tokenKey];
      // The anchor name should be the base styleId (kebab-cased), without " (Border)"
      const anchorName = toKebabCase(tokenKey.replace(/\s*\(Border\)$/i, ''));
      const anchor = `<a name="${s(anchorName)}"></a>`;
      
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
          const displayNameForTable = fills.length > 1 ? `${tokenKey}-${index + 1}` : tokenKey;
          const firstFillAnchor = index === 0 ? anchor : '';
          colorsMd += `| ${firstFillAnchor}${s(displayNameForTable)} | ${valueColumn} | ${TBT}${previewColumn}${TBT} | ${detailsColumn.replace(/\n/g, '<br/>')} |\n`; // REMOVED internalId from table
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
          colorsMd += `| ${anchor}${s(tokenKey)} | ${valueColumn} | ${TBT}${previewColumn}${TBT} | ${detailsColumn.replace(/\n/g, '<br/>')} |\n`;// REMOVED internalId
      }
    }
  } else { colorsMd += 'No color styles found.\n'; }
  fs.writeFileSync(path.join(globalStylesDir, 'Colors.md'), colorsMd + '\n');

  // Generate Typography.md
  let typographyMd = '## Typography Styles\n\n';
  if (Object.keys(categorizedStyles.typography).length > 0) {
    typographyMd += '| Token Name | Font Family | Size | Weight | Line Height | Letter Spacing | Case | Align H | Align V |\n'; // REMOVED Internal ID
    typographyMd += '|------------|-------------|------|--------|-------------|----------------|------|---------|---------|\n';
    for (const tokenKey in categorizedStyles.typography) { // tokenKey is kebab-cased styleId
      const {def} = categorizedStyles.typography[tokenKey];
      const style = def as TextStyle;
      const anchor = `<a name="${s(toKebabCase(tokenKey))}"></a>`; // Ensure anchor is kebab-case
      typographyMd += `| ${anchor}${s(tokenKey)} | ${s(style.fontFamily) || '-'} | ${s(style.fontSize) || '-'}px | ${s(style.fontWeight) || '-'} | ${s(style.lineHeight) || '-'} | ${s(style.letterSpacing) || '-'} | ${s(style.textCase) || '-'} | ${s(style.textAlignHorizontal) || '-'} | ${s(style.textAlignVertical) || '-'} |\n`; // REMOVED internalId
    }
  } else { typographyMd += 'No typography styles found.\n'; }
  fs.writeFileSync(path.join(globalStylesDir, 'Typography.md'), typographyMd + '\n');

  // Generate Effects.md
  let effectsMd = '## Effect Styles (Shadows, Blurs)\n\n';
  if (Object.keys(categorizedStyles.effects).length > 0) {
    effectsMd += '| Token Name | Type | Details |\n'; // REMOVED Internal ID
    effectsMd += '|------------|------|---------|\n';
    for (const tokenKey in categorizedStyles.effects) { // tokenKey is kebab-cased styleId
      const {def} = categorizedStyles.effects[tokenKey];
      const effectStyle = def as SimplifiedEffects;
      const anchor = `<a name="${s(toKebabCase(tokenKey))}"></a>`; // Ensure anchor is kebab-case
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

      effectsMd += `| ${anchor}${s(tokenKey)} | ${s(typeColumn)} | ${detailsValue.replace(/\n/g, '').replace(/<br\/>$/, '')} |\n`; // REMOVED internalId
    }
  } else { effectsMd += 'No effect styles found.\n'; }
  fs.writeFileSync(path.join(globalStylesDir, 'Effects.md'), effectsMd + '\n');
  
  // Generate LayoutAndSpacing.md
  let layoutMd = '## Layout & Spacing Styles\n\n';
  if (Object.keys(categorizedStyles.layout).length > 0) {
    layoutMd += '| Token Name | Details |\n'; // REMOVED Internal ID
    layoutMd += '|------------|---------|\n';
    for (const tokenKey in categorizedStyles.layout) { // tokenKey is kebab-cased styleId
      const {def} = categorizedStyles.layout[tokenKey];
      const layout = def as SimplifiedLayout;
      const anchor = `<a name="${s(toKebabCase(tokenKey))}"></a>`; // Ensure anchor is kebab-case
      layoutMd += `| ${anchor}${s(tokenKey)} | ${s(describeSimplifiedLayout(layout))} |\n`; // REMOVED internalId
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
      // Use the styleId directly (currentNode.textStyle), kebab-case it for linking
      const linkTargetName = toKebabCase(currentNode.textStyle as StyleId);
      nodesMd += `${indent}  - TextStyle Ref: [${s(currentNode.textStyle)}](${relativeGlobalStylesPath}/Typography.md#${s(linkTargetName)}) (See Typography Styles)\n`;
    }
    if (currentNode.fills) {
      const linkTargetName = toKebabCase(currentNode.fills as StyleId);
      nodesMd += `${indent}  - Fills Ref: [${s(currentNode.fills)}](${relativeGlobalStylesPath}/Colors.md#${s(linkTargetName)}) (See Color Styles)\n`;
    }
    if (currentNode.strokes) {
      const linkTargetName = toKebabCase(currentNode.strokes as StyleId);
      // The anchor in Colors.md for strokes is the kebab-cased styleId directly (without " (Border)").
      nodesMd += `${indent}  - Strokes Ref: [${s(currentNode.strokes)}](${relativeGlobalStylesPath}/Colors.md#${s(linkTargetName)}) (See Color Styles for Borders)\n`;
    }
    if (currentNode.effects) {
      const linkTargetName = toKebabCase(currentNode.effects as StyleId);
      nodesMd += `${indent}  - Effects Ref: [${s(currentNode.effects)}](${relativeGlobalStylesPath}/Effects.md#${s(linkTargetName)}) (See Effect Styles)\n`;
    }
    if (currentNode.layout) {
      const linkTargetName = toKebabCase(currentNode.layout as StyleId);
      nodesMd += `${indent}  - Layout Style Ref: [${s(currentNode.layout)}](${relativeGlobalStylesPath}/LayoutAndSpacing.md#${s(linkTargetName)}) (See Layout Styles)\n`;
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
      
      // Directly use styleId or a part of it for the table name, kebab-cased.
      let nameForTable = toKebabCase(styleId);

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

// --- Enhanced Analysis and Reporting Functions ---

function generateComponentAnalysisMarkdown(componentAnalysis: ComponentAnalysisResult, analysisDir: string): void {
  let md = '# Component Analysis Report\n\n';
  
  md += `## Summary\n\n`;
  md += `- **Total Components**: ${componentAnalysis.summary.totalComponents}\n`;
  md += `- **Complexity Score**: ${componentAnalysis.summary.complexityScore}/100\n`;
  md += `- **Consistency Score**: ${componentAnalysis.summary.consistencyScore}/100\n`;
  md += `- **Implementation Effort**: ${componentAnalysis.summary.implementationEffort.toUpperCase()}\n\n`;

  md += `## Atomic Design Hierarchy\n\n`;
  md += `### Atoms (${componentAnalysis.atomicHierarchy.atoms.length})\n`;
  if (componentAnalysis.atomicHierarchy.atoms.length > 0) {
    componentAnalysis.atomicHierarchy.atoms.forEach(atom => {
      md += `- ${atom}\n`;
    });
  } else {
    md += 'No atoms identified.\n';
  }
  md += '\n';

  md += `### Molecules (${componentAnalysis.atomicHierarchy.molecules.length})\n`;
  if (componentAnalysis.atomicHierarchy.molecules.length > 0) {
    componentAnalysis.atomicHierarchy.molecules.forEach(molecule => {
      md += `- ${molecule}\n`;
    });
  } else {
    md += 'No molecules identified.\n';
  }
  md += '\n';

  md += `### Organisms (${componentAnalysis.atomicHierarchy.organisms.length})\n`;
  if (componentAnalysis.atomicHierarchy.organisms.length > 0) {
    componentAnalysis.atomicHierarchy.organisms.forEach(organism => {
      md += `- ${organism}\n`;
    });
  } else {
    md += 'No organisms identified.\n';
  }
  md += '\n';

  md += `## Implementation Readiness\n\n`;
  md += `### Ready to Implement (${componentAnalysis.implementationReadiness.readyToImplement.length})\n`;
  componentAnalysis.implementationReadiness.readyToImplement.forEach(component => {
    md += `- **${component.name}**: ${component.description || 'No description'}\n`;
  });
  md += '\n';

  md += `### Needs Specification (${componentAnalysis.implementationReadiness.needsSpecification.length})\n`;
  componentAnalysis.implementationReadiness.needsSpecification.forEach(component => {
    md += `- **${component.name}**: ${component.description || 'Requires more detailed specification'}\n`;
  });
  md += '\n';

  md += `### Has Issues (${componentAnalysis.implementationReadiness.hasIssues.length})\n`;
  componentAnalysis.implementationReadiness.hasIssues.forEach(component => {
    md += `- **${component.name}**: ${component.description || 'Has implementation issues'}\n`;
  });
  md += '\n';

  md += `## Design Patterns\n\n`;
  componentAnalysis.designPatterns.forEach(pattern => {
    md += `### ${pattern.name}\n`;
    md += `${pattern.description}\n\n`;
    md += `**Components**: ${pattern.components.join(', ')}\n\n`;
    md += `**Usage**: ${pattern.usage}\n\n`;
    md += `**Implementation**: ${pattern.implementation}\n\n`;
  });

  md += `## Key Recommendations\n\n`;
  componentAnalysis.summary.keyRecommendations.forEach(rec => {
    md += `- ${rec}\n`;
  });

  fs.writeFileSync(path.join(analysisDir, 'ComponentAnalysis.md'), md);
}

function generateValidationReportMarkdown(validation: any, analysisDir: string): void {
  let md = '# Design System Validation Report\n\n';
  
  const status = validation.passed ? '✅ PASSED' : '❌ FAILED';
  md += `## Overall Status: ${status}\n\n`;
  
  md += `## Summary\n\n`;
  md += `- **Total Checks**: ${validation.summary.totalChecks}\n`;
  md += `- **Passed**: ${validation.summary.passed}\n`;
  md += `- **Failed**: ${validation.summary.failed}\n`;
  md += `- **Warnings**: ${validation.summary.warnings}\n\n`;

  if (validation.errors && validation.errors.length > 0) {
    md += `## Errors\n\n`;
    validation.errors.forEach((error: any) => {
      md += `### ${error.component}\n`;
      md += `**Rule**: ${error.rule}\n\n`;
      md += `**Issue**: ${error.issue}\n\n`;
      md += `**Severity**: ${error.severity}\n\n`;
    });
  }

  if (validation.warnings && validation.warnings.length > 0) {
    md += `## Warnings\n\n`;
    validation.warnings.forEach((warning: any) => {
      md += `### ${warning.component}\n`;
      md += `**Rule**: ${warning.rule}\n\n`;
      md += `**Issue**: ${warning.issue}\n\n`;
    });
  }

  fs.writeFileSync(path.join(analysisDir, 'ValidationReport.md'), md);
}

function generateAccessibilityReportMarkdown(accessibilityIssues: any[], analysisDir: string): void {
  let md = '# Accessibility Compliance Report\n\n';
  
  const errors = accessibilityIssues.filter(issue => issue.severity === 'error');
  const warnings = accessibilityIssues.filter(issue => issue.severity === 'warning');
  
  const status = errors.length === 0 ? '✅ COMPLIANT' : '❌ ISSUES FOUND';
  md += `## Overall Status: ${status}\n\n`;
  
  md += `## Summary\n\n`;
  md += `- **Total Issues**: ${accessibilityIssues.length}\n`;
  md += `- **Critical Issues**: ${errors.length}\n`;
  md += `- **Warnings**: ${warnings.length}\n\n`;

  if (errors.length > 0) {
    md += `## Critical Issues\n\n`;
    errors.forEach(issue => {
      md += `### ${issue.component}\n`;
      md += `**Type**: ${issue.type}\n\n`;
      md += `**Issue**: ${issue.issue}\n\n`;
      md += `**Suggestion**: ${issue.suggestion}\n\n`;
    });
  }

  if (warnings.length > 0) {
    md += `## Warnings\n\n`;
    warnings.forEach(issue => {
      md += `### ${issue.component}\n`;
      md += `**Type**: ${issue.type}\n\n`;
      md += `**Issue**: ${issue.issue}\n\n`;
      md += `**Suggestion**: ${issue.suggestion}\n\n`;
    });
  }

  if (accessibilityIssues.length === 0) {
    md += `## No Issues Found\n\n`;
    md += `Congratulations! Your design system meets accessibility compliance standards.\n\n`;
  }

  fs.writeFileSync(path.join(analysisDir, 'AccessibilityReport.md'), md);
}

function generateImplementationGuideMarkdown(componentAnalysis: ComponentAnalysisResult, tokens: any, analysisDir: string): void {
  let md = '# Implementation Guide\n\n';
  
  md += `This guide provides developers with practical information for implementing the design system components.\n\n`;

  md += `## Quick Start\n\n`;
  md += `### Priority Components\n\n`;
  md += `Start with these components for maximum impact:\n\n`;
  
  componentAnalysis.implementationReadiness.readyToImplement.slice(0, 5).forEach(component => {
    md += `#### ${component.name}\n`;
    md += `**Category**: ${component.category}\n\n`;
    md += `**Props**:\n`;
    component.props.forEach(prop => {
      md += `- \`${prop.name}\` (${prop.type}): ${prop.description || 'No description'}\n`;
    });
    md += '\n';
    
    if (component.codeHints.examples.length > 0) {
      md += `**Example Usage**:\n`;
      md += '```jsx\n';
      md += component.codeHints.examples[0];
      md += '\n```\n\n';
    }
  });

  md += `## Design Token Usage\n\n`;
  
  md += `### Colors\n`;
  Object.keys(tokens.colors).slice(0, 10).forEach(colorName => {
    const color = tokens.colors[colorName];
    const value = typeof color === 'string' ? color : color.value;
    md += `- \`${colorName}\`: ${value}\n`;
  });
  md += '\n';

  md += `### Typography\n`;
  Object.keys(tokens.typography).slice(0, 5).forEach(typoName => {
    const typo = tokens.typography[typoName];
    md += `- \`${typoName}\`: ${typo.value.fontSize}px, ${typo.value.fontWeight}\n`;
  });
  md += '\n';

  md += `## Component Relationships\n\n`;
  md += `Understanding how components work together:\n\n`;
  
  componentAnalysis.designPatterns.forEach(pattern => {
    md += `### ${pattern.name} Pattern\n`;
    md += `${pattern.description}\n\n`;
    md += `**Implementation Notes**: ${pattern.implementation}\n\n`;
  });

  md += `## Best Practices\n\n`;
  componentAnalysis.summary.keyRecommendations.forEach(rec => {
    md += `- ${rec}\n`;
  });

  fs.writeFileSync(path.join(analysisDir, 'ImplementationGuide.md'), md);
} 