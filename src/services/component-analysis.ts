import type { SimplifiedDesign } from './simplify-node-response.js';

// Types for component analysis
export interface ComponentVariant {
  name: string;
  properties: Record<string, string>;
  nodeId: string;
  description?: string;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  description?: string;
  category: 'atom' | 'molecule' | 'organism' | 'template' | 'page';
  variants: ComponentVariant[];
  props: ComponentProperty[];
  usage: ComponentUsage;
  styling: ComponentStyling;
  accessibility: ComponentAccessibility;
  codeHints: CodeGenerationHints;
}

export interface ComponentProperty {
  name: string;
  type: 'boolean' | 'string' | 'enum' | 'number';
  values?: string[];
  default?: string;
  required: boolean;
  description?: string;
}

export interface ComponentUsage {
  frequency: number;
  contexts: string[];
  commonPairings: string[];
  layoutRoles: string[];
}

export interface ComponentStyling {
  hasStates: boolean;
  states: string[];
  responsiveBehavior: 'fixed' | 'flexible' | 'responsive';
  spacing: { internal: string[], external: string[] };
  colorTokens: string[];
  typographyTokens: string[];
}

export interface ComponentAccessibility {
  role?: string;
  hasProperLabels: boolean;
  keyboardNavigable: boolean;
  issues: string[];
  recommendations: string[];
}

export interface CodeGenerationHints {
  htmlElement: string;
  reactPatterns: string[];
  cssApproach: 'css-modules' | 'styled-components' | 'tailwind' | 'css-in-js';
  propsMapping: Record<string, string>;
  stateManagement: string[];
  examples: string[];
}

export interface ComponentRelationship {
  parent: string;
  children: string[];
  siblings: string[];
  dependsOn: string[];
  usedBy: string[];
}

export interface ComponentAnalysisResult {
  components: ComponentDefinition[];
  relationships: Record<string, ComponentRelationship>;
  designPatterns: DesignPattern[];
  atomicHierarchy: AtomicHierarchy;
  implementationReadiness: ImplementationReadiness;
  summary: AnalysisSummary;
}

export interface DesignPattern {
  name: string;
  description: string;
  components: string[];
  usage: string;
  implementation: string;
}

export interface AtomicHierarchy {
  atoms: string[];
  molecules: string[];
  organisms: string[];
  templates: string[];
  pages: string[];
}

export interface ImplementationReadiness {
  readyToImplement: ComponentDefinition[];
  needsSpecification: ComponentDefinition[];
  hasIssues: ComponentDefinition[];
  suggestions: string[];
}

export interface AnalysisSummary {
  totalComponents: number;
  byCategory: Record<string, number>;
  complexityScore: number;
  consistencyScore: number;
  implementationEffort: 'low' | 'medium' | 'high';
  keyRecommendations: string[];
}

/**
 * Analyzes Figma components to understand structure, variants, and relationships
 * for better AI-driven code generation
 */
export function analyzeComponents(design: SimplifiedDesign): ComponentAnalysisResult {
  const components: ComponentDefinition[] = [];
  const relationships: Record<string, ComponentRelationship> = {};

  // Find all component definitions and instances
  const componentNodes = findComponentNodes(design);
  const instanceNodes = findInstanceNodes(design);

  // Analyze each component
  componentNodes.forEach(node => {
    const component = analyzeComponentNode(node, design, instanceNodes);
    if (component) {
      components.push(component);
      relationships[component.id] = analyzeComponentRelationships(component, design, components);
    }
  });

  // Identify design patterns
  const designPatterns = identifyDesignPatterns(components, relationships);

  // Create atomic hierarchy
  const atomicHierarchy = categorizeByAtomicDesign(components);

  // Assess implementation readiness
  const implementationReadiness = assessImplementationReadiness(components);

  // Generate summary
  const summary = generateAnalysisSummary(components, designPatterns, implementationReadiness);

  return {
    components,
    relationships,
    designPatterns,
    atomicHierarchy,
    implementationReadiness,
    summary
  };
}

function findComponentNodes(design: SimplifiedDesign): any[] {
  const components: any[] = [];
  
  function traverse(node: any) {
    if (node.type === 'COMPONENT') {
      components.push(node);
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  design.nodes.forEach(traverse);
  return components;
}

function findInstanceNodes(design: SimplifiedDesign): any[] {
  const instances: any[] = [];
  
  function traverse(node: any) {
    if (node.type === 'INSTANCE') {
      instances.push(node);
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  design.nodes.forEach(traverse);
  return instances;
}

function analyzeComponentNode(node: any, design: SimplifiedDesign, instances: any[]): ComponentDefinition | null {
  if (!node.name) return null;

  // Find all instances of this component
  const componentInstances = instances.filter(instance => 
    instance.componentId === node.id || instance.name?.includes(node.name)
  );

  // Analyze variants
  const variants = analyzeComponentVariants(node, componentInstances);

  // Determine component properties
  const props = inferComponentProperties(node, variants);

  // Analyze usage patterns
  const usage = analyzeComponentUsage(componentInstances, design);

  // Extract styling information
  const styling = analyzeComponentStyling(node);

  // Check accessibility
  const accessibility = analyzeComponentAccessibility(node);

  // Generate code hints
  const codeHints = generateCodeHints(node, props, styling);

  // Categorize by atomic design
  const category = categorizeComponent(node, componentInstances);

  return {
    id: node.id,
    name: node.name,
    description: node.description || undefined,
    category,
    variants,
    props,
    usage,
    styling,
    accessibility,
    codeHints
  };
}

function analyzeComponentVariants(node: any, instances: any[]): ComponentVariant[] {
  const variants: ComponentVariant[] = [];
  
  // Base variant (the component itself)
  variants.push({
    name: 'Default',
    properties: {},
    nodeId: node.id,
    description: 'Default state of the component'
  });

  // Analyze instances for variant patterns
  instances.forEach(instance => {
    if (instance.componentProperties) {
      const properties = instance.componentProperties;
      const variantName = Object.values(properties).join(' / ') || 'Variant';
      
      variants.push({
        name: variantName,
        properties,
        nodeId: instance.id,
        description: `Variant with properties: ${JSON.stringify(properties)}`
      });
    }
  });

  // Remove duplicates
  return variants.filter((variant, index, self) => 
    index === self.findIndex(v => v.name === variant.name)
  );
}

function inferComponentProperties(node: any, variants: ComponentVariant[]): ComponentProperty[] {
  const props: ComponentProperty[] = [];
  const allProperties = new Set<string>();

  // Collect all property names from variants
  variants.forEach(variant => {
    Object.keys(variant.properties).forEach(prop => allProperties.add(prop));
  });

  // Analyze each property
  allProperties.forEach(propName => {
    const values = variants
      .map(v => v.properties[propName])
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);

    // Determine property type
    let type: ComponentProperty['type'] = 'string';
    if (values.every(v => v === 'true' || v === 'false')) {
      type = 'boolean';
    } else if (values.every(v => !isNaN(Number(v)))) {
      type = 'number';
    } else if (values.length > 1 && values.length <= 10) {
      type = 'enum';
    }

    props.push({
      name: propName,
      type,
      values: type === 'enum' ? values : undefined,
      default: values[0],
      required: false, // TODO: Better analysis needed
      description: `Component property: ${propName}`
    });
  });

  return props;
}

function analyzeComponentUsage(instances: any[], design: SimplifiedDesign): ComponentUsage {
  const contexts = new Set<string>();
  const commonPairings = new Set<string>();

  instances.forEach(instance => {
    // Analyze context (parent frame/page name)
    const context = findInstanceContext(instance, design);
    if (context) contexts.add(context);

    // Find common pairings (siblings)
    const siblings = findInstanceSiblings(instance, design);
    siblings.forEach(sibling => commonPairings.add(sibling));
  });

  return {
    frequency: instances.length,
    contexts: Array.from(contexts),
    commonPairings: Array.from(commonPairings),
    layoutRoles: inferLayoutRoles(instances)
  };
}

function analyzeComponentStyling(node: any): ComponentStyling {
  const hasStates = !!(node.reactions && node.reactions.length > 0);
  const states = hasStates ? ['default', 'hover', 'active', 'disabled'] : ['default'];
  
  return {
    hasStates,
    states,
    responsiveBehavior: inferResponsiveBehavior(node),
    spacing: {
      internal: extractInternalSpacing(node),
      external: extractExternalSpacing(node)
    },
    colorTokens: extractColorTokens(node),
    typographyTokens: extractTypographyTokens(node)
  };
}

function analyzeComponentAccessibility(node: any): ComponentAccessibility {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Basic accessibility checks
  let hasProperLabels = !!(node.name && node.name.trim());
  if (!hasProperLabels) {
    issues.push('Component lacks proper naming');
    recommendations.push('Add descriptive component name');
  }

  // Check for interactive elements
  const keyboardNavigable = node.type === 'FRAME' ? true : false; // Simplified

  // Determine ARIA role
  let role: string | undefined;
  if (node.name?.toLowerCase().includes('button')) {
    role = 'button';
  } else if (node.name?.toLowerCase().includes('input')) {
    role = 'textbox';
  } else if (node.name?.toLowerCase().includes('card')) {
    role = 'article';
  }

  return {
    role,
    hasProperLabels,
    keyboardNavigable,
    issues,
    recommendations
  };
}

function generateCodeHints(node: any, props: ComponentProperty[], styling: ComponentStyling): CodeGenerationHints {
  // Determine appropriate HTML element
  let htmlElement = 'div';
  if (node.name?.toLowerCase().includes('button')) {
    htmlElement = 'button';
  } else if (node.name?.toLowerCase().includes('input')) {
    htmlElement = 'input';
  } else if (node.name?.toLowerCase().includes('link')) {
    htmlElement = 'a';
  }

  // Generate React patterns
  const reactPatterns = [
    'functional-component',
    styling.hasStates ? 'state-management' : 'stateless',
    props.length > 0 ? 'prop-types' : 'no-props'
  ];

  // Props mapping for code generation
  const propsMapping: Record<string, string> = {};
  props.forEach(prop => {
    propsMapping[prop.name] = prop.type === 'boolean' ? 'boolean' : 'string';
  });

  return {
    htmlElement,
    reactPatterns,
    cssApproach: 'css-modules', // Default, could be inferred
    propsMapping,
    stateManagement: styling.hasStates ? ['useState', 'handlers'] : [],
    examples: generateCodeExamples(node, props, htmlElement)
  };
}

function generateCodeExamples(node: any, props: ComponentProperty[], htmlElement: string): string[] {
  const examples: string[] = [];
  
  // Basic usage example
  const propList = props.map(p => `${p.name}="${p.default || 'value'}"`).join(' ');
  examples.push(`<${node.name} ${propList} />`);

  // With children example if applicable
  if (htmlElement !== 'input') {
    examples.push(`<${node.name} ${propList}>Content</${node.name}>`);
  }

  return examples;
}

// Helper functions
function categorizeComponent(node: any, instances: any[]): ComponentDefinition['category'] {
  const name = node.name?.toLowerCase() || '';
  
  // Atoms: basic building blocks
  if (name.includes('button') || name.includes('input') || name.includes('icon') || name.includes('avatar')) {
    return 'atom';
  }
  
  // Molecules: combinations of atoms
  if (name.includes('card') || name.includes('form') || name.includes('search') || instances.length > 5) {
    return 'molecule';
  }
  
  // Organisms: complex combinations
  if (name.includes('header') || name.includes('navigation') || name.includes('sidebar') || instances.length > 20) {
    return 'organism';
  }
  
  // Templates: page-level layouts
  if (name.includes('template') || name.includes('layout') || name.includes('page')) {
    return 'template';
  }
  
  return 'molecule'; // Default
}

function analyzeComponentRelationships(
  component: ComponentDefinition, 
  design: SimplifiedDesign, 
  allComponents: ComponentDefinition[]
): ComponentRelationship {
  return {
    parent: '', // TODO: Implement parent detection
    children: [], // TODO: Implement children detection
    siblings: [], // TODO: Implement sibling detection
    dependsOn: [], // TODO: Implement dependency detection
    usedBy: [] // TODO: Implement usage detection
  };
}

function identifyDesignPatterns(
  components: ComponentDefinition[], 
  relationships: Record<string, ComponentRelationship>
): DesignPattern[] {
  const patterns: DesignPattern[] = [];
  
  // Card pattern
  const cardComponents = components.filter(c => c.name.toLowerCase().includes('card'));
  if (cardComponents.length > 0) {
    patterns.push({
      name: 'Card Pattern',
      description: 'Reusable card components for content display',
      components: cardComponents.map(c => c.name),
      usage: 'Use for displaying grouped content with consistent styling',
      implementation: 'Implement as flexible container with configurable content slots'
    });
  }

  // Button pattern
  const buttonComponents = components.filter(c => c.name.toLowerCase().includes('button'));
  if (buttonComponents.length > 0) {
    patterns.push({
      name: 'Button System',
      description: 'Consistent button variations across the design',
      components: buttonComponents.map(c => c.name),
      usage: 'Use appropriate button variant based on hierarchy and context',
      implementation: 'Implement with variant prop system for different styles'
    });
  }

  return patterns;
}

function categorizeByAtomicDesign(components: ComponentDefinition[]): AtomicHierarchy {
  return {
    atoms: components.filter(c => c.category === 'atom').map(c => c.name),
    molecules: components.filter(c => c.category === 'molecule').map(c => c.name),
    organisms: components.filter(c => c.category === 'organism').map(c => c.name),
    templates: components.filter(c => c.category === 'template').map(c => c.name),
    pages: components.filter(c => c.category === 'page').map(c => c.name)
  };
}

function assessImplementationReadiness(components: ComponentDefinition[]): ImplementationReadiness {
  const readyToImplement = components.filter(c => 
    c.variants.length > 0 && c.props.length > 0 && c.accessibility.issues.length === 0
  );
  
  const needsSpecification = components.filter(c => 
    c.props.length === 0 || c.variants.length <= 1
  );
  
  const hasIssues = components.filter(c => 
    c.accessibility.issues.length > 0
  );

  return {
    readyToImplement,
    needsSpecification,
    hasIssues,
    suggestions: [
      'Add more variant examples for better prop inference',
      'Ensure all interactive components have proper accessibility attributes',
      'Consider breaking down complex organisms into smaller molecules'
    ]
  };
}

function generateAnalysisSummary(
  components: ComponentDefinition[], 
  patterns: DesignPattern[], 
  readiness: ImplementationReadiness
): AnalysisSummary {
  const byCategory = {
    atom: components.filter(c => c.category === 'atom').length,
    molecule: components.filter(c => c.category === 'molecule').length,
    organism: components.filter(c => c.category === 'organism').length,
    template: components.filter(c => c.category === 'template').length,
    page: components.filter(c => c.category === 'page').length
  };

  const complexityScore = Math.min(100, (components.length * 10) + (patterns.length * 5));
  const consistencyScore = Math.min(100, (readiness.readyToImplement.length / components.length) * 100);
  
  let implementationEffort: 'low' | 'medium' | 'high' = 'medium';
  if (components.length < 10) implementationEffort = 'low';
  if (components.length > 30) implementationEffort = 'high';

  return {
    totalComponents: components.length,
    byCategory,
    complexityScore,
    consistencyScore,
    implementationEffort,
    keyRecommendations: [
      `Found ${components.length} components across ${patterns.length} design patterns`,
      `${readiness.readyToImplement.length} components are ready for implementation`,
      `Focus on implementing ${byCategory.atom} atoms first as building blocks`,
      consistencyScore < 70 ? 'Consider standardizing component variants and properties' : 'Component system shows good consistency'
    ]
  };
}

// Additional helper functions (simplified implementations)
function findInstanceContext(instance: any, design: SimplifiedDesign): string | null {
  // TODO: Implement proper parent frame detection
  return 'Page'; // Simplified
}

function findInstanceSiblings(instance: any, design: SimplifiedDesign): string[] {
  // TODO: Implement proper sibling detection
  return []; // Simplified
}

function inferLayoutRoles(instances: any[]): string[] {
  return ['content', 'layout']; // Simplified
}

function inferResponsiveBehavior(node: any): 'fixed' | 'flexible' | 'responsive' {
  return 'flexible'; // Simplified
}

function extractInternalSpacing(node: any): string[] {
  return ['8px', '16px']; // Simplified
}

function extractExternalSpacing(node: any): string[] {
  return ['12px', '24px']; // Simplified
}

function extractColorTokens(node: any): string[] {
  return ['primary-500', 'neutral-100']; // Simplified
}

function extractTypographyTokens(node: any): string[] {
  return ['body-medium', 'heading-small']; // Simplified
} 