import type { DesignTokens } from './token-generator.js';

interface DeducedVariable {
  name: string;
  type: 'color' | 'number' | 'string';
  value: string | number;
  category?: string;
  usage?: string[];
}

interface DeducedVariableCollection {
  name: string;
  variables: DeducedVariable[];
  description?: string;
}

interface VariableDeductionResult {
  collections: DeducedVariableCollection[];
  metadata: {
    totalVariables: number;
    deductionMethod: 'pattern-analysis';
    limitations: string[];
  };
}

/**
 * Analyzes design tokens to deduce variable-like structures
 * This is a workaround for users without Figma Enterprise plans
 */
export function deduceVariablesFromTokens(tokens: DesignTokens): VariableDeductionResult {
  const collections: DeducedVariableCollection[] = [];
  
  // Analyze color tokens for patterns
  if (tokens.colors) {
    const colorCollection = analyzeColorTokens(tokens.colors);
    if (colorCollection.variables.length > 0) {
      collections.push(colorCollection);
    }
  }
  
  // Analyze typography tokens
  if (tokens.typography) {
    const typographyCollection = analyzeTypographyTokens(tokens.typography);
    if (typographyCollection.variables.length > 0) {
      collections.push(typographyCollection);
    }
  }
  
  // Analyze spacing tokens
  if (tokens.spacing) {
    const spacingCollection = analyzeSpacingTokens(tokens.spacing);
    if (spacingCollection.variables.length > 0) {
      collections.push(spacingCollection);
    }
  }
  
  return {
    collections,
    metadata: {
      totalVariables: collections.reduce((sum, col) => sum + col.variables.length, 0),
      deductionMethod: 'pattern-analysis',
      limitations: [
        'Cannot detect mode/theme variations (light/dark)',
        'Cannot identify variable references to other variables', 
        'Variable names are algorithmically generated, not original designer names',
        'Cannot determine complete semantic intent',
        'Single mode only (no theme switching capability)'
      ]
    }
  };
}

function analyzeColorTokens(colors: Record<string, any>): DeducedVariableCollection {
  const variables: DeducedVariable[] = [];
  const colorGroups: Record<string, DeducedVariable[]> = {};
  
  for (const [tokenName, tokenData] of Object.entries(colors)) {
    const value = typeof tokenData === 'string' ? tokenData : tokenData.value;
    if (typeof value !== 'string') continue;
    
    // Try to detect color scale patterns (primary-500, primary-400, etc.)
    const scaleMatch = tokenName.match(/^(.+)-(\d+)$/);
    if (scaleMatch) {
      const [, colorName, scale] = scaleMatch;
      if (!colorGroups[colorName]) {
        colorGroups[colorName] = [];
      }
      colorGroups[colorName].push({
        name: `${colorName}-${scale}`,
        type: 'color',
        value: value,
        category: colorName,
        usage: inferColorUsage(tokenName, tokenData)
      });
    } else {
      // Standalone color
      variables.push({
        name: tokenName,
        type: 'color', 
        value: value,
        usage: inferColorUsage(tokenName, tokenData)
      });
    }
  }
  
  // Add grouped colors as variables
  for (const [groupName, groupVariables] of Object.entries(colorGroups)) {
    variables.push(...groupVariables);
  }
  
  return {
    name: 'Colors',
    variables,
    description: 'Deduced color variables from design tokens'
  };
}

function analyzeTypographyTokens(typography: Record<string, any>): DeducedVariableCollection {
  const variables: DeducedVariable[] = [];
  
  for (const [tokenName, tokenData] of Object.entries(typography)) {
    const style = tokenData.value;
    if (!style || typeof style !== 'object') continue;
    
    // Create variables for different typography properties
    if (style.fontSize) {
      variables.push({
        name: `${tokenName}-size`,
        type: 'number',
        value: style.fontSize,
        category: 'typography',
        usage: ['font-size']
      });
    }
    
    if (style.lineHeight) {
      variables.push({
        name: `${tokenName}-line-height`, 
        type: 'number',
        value: style.lineHeight,
        category: 'typography',
        usage: ['line-height']
      });
    }
    
    if (style.fontWeight) {
      variables.push({
        name: `${tokenName}-weight`,
        type: 'number',
        value: style.fontWeight,
        category: 'typography', 
        usage: ['font-weight']
      });
    }
    
    if (style.letterSpacing) {
      variables.push({
        name: `${tokenName}-letter-spacing`,
        type: 'number',
        value: style.letterSpacing,
        category: 'typography',
        usage: ['letter-spacing']
      });
    }
  }
  
  return {
    name: 'Typography',
    variables,
    description: 'Deduced typography variables from design tokens'
  };
}

function analyzeSpacingTokens(spacing: Record<string, any>): DeducedVariableCollection {
  const variables: DeducedVariable[] = [];
  
  for (const [tokenName, tokenData] of Object.entries(spacing)) {
    const value = typeof tokenData === 'string' ? tokenData : tokenData.value;
    if (typeof value !== 'string') continue;
    
    // Extract numeric value if it has px suffix
    const numericMatch = value.match(/^(\d+(?:\.\d+)?)px$/);
    const numericValue = numericMatch ? parseFloat(numericMatch[1]) : value;
    
    variables.push({
      name: tokenName,
      type: typeof numericValue === 'number' ? 'number' : 'string',
      value: numericValue,
      category: 'spacing',
      usage: ['margin', 'padding', 'gap']
    });
  }
  
  return {
    name: 'Spacing',
    variables,
    description: 'Deduced spacing variables from design tokens'
  };
}

function inferColorUsage(tokenName: string, tokenData: any): string[] {
  const usage: string[] = [];
  
  // Infer from token name patterns
  if (tokenName.includes('border') || tokenName.includes('stroke')) {
    usage.push('border-color');
  } else if (tokenName.includes('background') || tokenName.includes('bg')) {
    usage.push('background-color');
  } else if (tokenName.includes('text') || tokenName.includes('foreground')) {
    usage.push('color');
  } else {
    // Generic color - could be used for multiple purposes
    usage.push('color', 'background-color', 'border-color');
  }
  
  // Check token metadata for more specific usage info
  if (tokenData.type === 'borderColor') {
    usage.length = 0; // Clear generic usage
    usage.push('border-color');
  }
  
  return usage;
}

/**
 * Converts deduced variables to a format similar to Figma Variables API response
 */
export function formatAsVariablesResponse(deductionResult: VariableDeductionResult): any {
  const collections: Record<string, any> = {};
  const variables: Record<string, any> = {};
  
  deductionResult.collections.forEach((collection, colIndex) => {
    const collectionId = `deduced-collection-${colIndex}`;
    
    collections[collectionId] = {
      id: collectionId,
      name: collection.name,
      description: collection.description,
      variableIds: collection.variables.map((_, varIndex) => `deduced-var-${colIndex}-${varIndex}`),
      modes: [{
        modeId: 'deduced-mode-default',
        name: 'Default'
      }]
    };
    
    collection.variables.forEach((variable, varIndex) => {
      const variableId = `deduced-var-${colIndex}-${varIndex}`;
      
      variables[variableId] = {
        id: variableId,
        name: variable.name,
        resolvedType: variable.type.toUpperCase(),
        valuesByMode: {
          'deduced-mode-default': variable.value
        },
        description: `Deduced from design tokens. Usage: ${variable.usage?.join(', ') || 'unknown'}`,
        scopes: ['ALL_SCOPES'], // Since we can't deduce actual scopes
        codeSyntax: {}
      };
    });
  });
  
  return {
    status: 200,
    error: false,
    meta: {
      variableCollections: collections,
      variables: variables,
      deductionMetadata: deductionResult.metadata
    }
  };
} 