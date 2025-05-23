import type { ComponentDefinition, ComponentAnalysisResult } from './component-analysis.js';
import type { DesignTokens } from './token-generator.js';

export interface CodeGenerationOptions {
  framework: 'react' | 'vue' | 'angular' | 'html';
  typescript: boolean;
  stylingApproach: 'css-modules' | 'styled-components' | 'tailwind' | 'css-in-js' | 'scss';
  includeStorybook: boolean;
  includeTests: boolean;
  useDesignTokens: boolean;
  atomicStructure: boolean;
}

export interface GeneratedFile {
  filename: string;
  content: string;
  type: 'component' | 'style' | 'story' | 'test' | 'types' | 'index';
}

export interface CodeGenerationResult {
  files: GeneratedFile[];
  packageDependencies: string[];
  setupInstructions: string[];
  implementationNotes: string[];
}

/**
 * Generates production-ready component code from Figma component analysis
 */
export function generateComponentCode(
  analysis: ComponentAnalysisResult,
  tokens: DesignTokens,
  options: CodeGenerationOptions
): CodeGenerationResult {
  const files: GeneratedFile[] = [];
  const dependencies = new Set<string>();
  const setupInstructions: string[] = [];
  const implementationNotes: string[] = [];

  // Sort components by atomic hierarchy for proper generation order
  const sortedComponents = sortComponentsByHierarchy(analysis.components, analysis.atomicHierarchy);

  // Generate component files
  sortedComponents.forEach(component => {
    const componentFiles = generateComponentFiles(component, tokens, options);
    files.push(...componentFiles);

    // Track dependencies
    componentFiles.forEach(file => {
      extractDependencies(file.content).forEach(dep => dependencies.add(dep));
    });
  });

  // Generate index files for atomic structure
  if (options.atomicStructure) {
    const indexFiles = generateAtomicIndexFiles(analysis.atomicHierarchy, options);
    files.push(...indexFiles);
  }

  // Generate global files
  const globalFiles = generateGlobalFiles(tokens, options);
  files.push(...globalFiles);

  // Generate setup instructions
  setupInstructions.push(...generateSetupInstructions(options, dependencies));

  // Generate implementation notes
  implementationNotes.push(...generateImplementationNotes(analysis, options));

  return {
    files,
    packageDependencies: Array.from(dependencies),
    setupInstructions,
    implementationNotes
  };
}

function sortComponentsByHierarchy(
  components: ComponentDefinition[], 
  hierarchy: any
): ComponentDefinition[] {
  const order = ['atom', 'molecule', 'organism', 'template', 'page'];
  return components.sort((a, b) => {
    const aIndex = order.indexOf(a.category);
    const bIndex = order.indexOf(b.category);
    return aIndex - bIndex;
  });
}

function generateComponentFiles(
  component: ComponentDefinition,
  tokens: DesignTokens,
  options: CodeGenerationOptions
): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  if (options.framework === 'react') {
    // React component file
    files.push({
      filename: `${component.name}.${options.typescript ? 'tsx' : 'jsx'}`,
      content: generateReactComponent(component, tokens, options),
      type: 'component'
    });

    // TypeScript types file
    if (options.typescript) {
      files.push({
        filename: `${component.name}.types.ts`,
        content: generateTypeDefinitions(component),
        type: 'types'
      });
    }

    // Styles file
    if (options.stylingApproach !== 'styled-components') {
      files.push({
        filename: `${component.name}.${getStyleExtension(options.stylingApproach)}`,
        content: generateStyles(component, tokens, options),
        type: 'style'
      });
    }

    // Storybook story
    if (options.includeStorybook) {
      files.push({
        filename: `${component.name}.stories.${options.typescript ? 'tsx' : 'jsx'}`,
        content: generateStorybookStory(component, options),
        type: 'story'
      });
    }

    // Test file
    if (options.includeTests) {
      files.push({
        filename: `${component.name}.test.${options.typescript ? 'tsx' : 'jsx'}`,
        content: generateTestFile(component, options),
        type: 'test'
      });
    }
  }

  return files;
}

function generateReactComponent(
  component: ComponentDefinition,
  tokens: DesignTokens,
  options: CodeGenerationOptions
): string {
  const { typescript, stylingApproach, useDesignTokens } = options;
  const hasProps = component.props.length > 0;
  const hasVariants = component.variants.length > 1;

  // Imports
  const imports = [`import React${component.styling.hasStates ? ', { useState }' : ''} from 'react';`];
  
  if (typescript && hasProps) {
    imports.push(`import type { ${component.name}Props } from './${component.name}.types';`);
  }

  if (stylingApproach === 'css-modules') {
    imports.push(`import styles from './${component.name}.module.css';`);
  } else if (stylingApproach === 'styled-components') {
    imports.push(`import styled from 'styled-components';`);
  }

  if (useDesignTokens) {
    imports.push(`import { tokens } from '../tokens';`);
  }

  // Props interface (inline if not typescript)
  let propsInterface = '';
  if (hasProps && !typescript) {
    propsInterface = `\n// Props: ${component.props.map(p => `${p.name}${p.required ? '' : '?'}: ${p.type}`).join(', ')}\n`;
  }

  // Component implementation
  const propsList = hasProps ? 
    (typescript ? `props: ${component.name}Props` : 'props') : 
    '';

  const componentBody = generateComponentBody(component, tokens, options);

  // Styled components definition
  let styledComponents = '';
  if (stylingApproach === 'styled-components') {
    styledComponents = generateStyledComponents(component, tokens) + '\n\n';
  }

  return `${imports.join('\n')}
${propsInterface}
${styledComponents}/**
 * ${component.description || component.name}
 * 
 * @category ${component.category}
 * ${component.accessibility.role ? `@role ${component.accessibility.role}` : ''}
 */
export const ${component.name} = (${propsList}) => {
${componentBody}
};

export default ${component.name};`;
}

function generateComponentBody(
  component: ComponentDefinition,
  tokens: DesignTokens,
  options: CodeGenerationOptions
): string {
  const { stylingApproach } = options;
  const hasProps = component.props.length > 0;
  const hasStates = component.styling.hasStates;

  // State management
  let stateCode = '';
  if (hasStates) {
    stateCode = '  const [isHovered, setIsHovered] = useState(false);\n  const [isActive, setIsActive] = useState(false);\n\n';
  }

  // Props destructuring
  let propsCode = '';
  if (hasProps) {
    const propNames = component.props.map(p => p.name);
    propsCode = `  const { ${propNames.join(', ')}, children, className, ...rest } = props;\n\n`;
  }

  // Class name generation
  let classNameCode = '';
  if (stylingApproach === 'css-modules') {
    classNameCode = `  const baseClassName = styles.${component.name.toLowerCase()};\n`;
    classNameCode += `  const className = [baseClassName, className].filter(Boolean).join(' ');\n\n`;
  } else if (stylingApproach === 'tailwind') {
    classNameCode = `  const className = [${generateTailwindClasses(component)}, className].filter(Boolean).join(' ');\n\n`;
  }

  // Event handlers
  let eventHandlers = '';
  if (hasStates) {
    eventHandlers = `  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const handleMouseDown = () => setIsActive(true);
  const handleMouseUp = () => setIsActive(false);

`;
  }

  // JSX element
  const elementTag = component.codeHints.htmlElement;
  const jsxProps = generateJSXProps(component, options);

  return `${stateCode}${propsCode}${classNameCode}${eventHandlers}  return (
    <${elementTag}${jsxProps}>
      {children}
    </${elementTag}>
  );`;
}

function generateJSXProps(component: ComponentDefinition, options: CodeGenerationOptions): string {
  const props: string[] = [];

  // Accessibility props
  if (component.accessibility.role) {
    props.push(`role="${component.accessibility.role}"`);
  }

  // Styling props
  if (options.stylingApproach === 'css-modules' || options.stylingApproach === 'tailwind') {
    props.push('className={className}');
  } else if (options.stylingApproach === 'styled-components') {
    // Add variant props for styled-components
    component.props.forEach(prop => {
      if (prop.type === 'boolean') {
        props.push(`$${prop.name}={${prop.name}}`);
      }
    });
  }

  // Event handlers
  if (component.styling.hasStates) {
    props.push('onMouseEnter={handleMouseEnter}');
    props.push('onMouseLeave={handleMouseLeave}');
    props.push('onMouseDown={handleMouseDown}');
    props.push('onMouseUp={handleMouseUp}');
  }

  // Spread rest props
  props.push('{...rest}');

  return props.length > 0 ? `\n      ${props.join('\n      ')}\n    ` : '';
}

function generateTypeDefinitions(component: ComponentDefinition): string {
  const baseProps = `export interface ${component.name}Props {`;
  
  const propLines = component.props.map(prop => {
    const optional = prop.required ? '' : '?';
    let typeString: string = prop.type;
    
    if (prop.type === 'enum' && prop.values) {
      typeString = prop.values.map(v => `'${v}'`).join(' | ');
    }
    
    return `  /** ${prop.description || prop.name} */
  ${prop.name}${optional}: ${typeString};`;
  });

  // Add standard React props
  const standardProps = [
    '  /** Additional CSS classes */',
    '  className?: string;',
    '  /** Child elements */',
    '  children?: React.ReactNode;'
  ];

  return `import type { ReactNode } from 'react';

${baseProps}
${propLines.join('\n')}
${standardProps.join('\n')}
}`;
}

function generateStyles(
  component: ComponentDefinition,
  tokens: DesignTokens,
  options: CodeGenerationOptions
): string {
  const { stylingApproach } = options;

  if (stylingApproach === 'css-modules') {
    return generateCSSModules(component, tokens);
  } else if (stylingApproach === 'scss') {
    return generateSCSS(component, tokens);
  } else if (stylingApproach === 'tailwind') {
    return generateTailwindUtilities(component, tokens);
  }

  return '';
}

function generateCSSModules(component: ComponentDefinition, tokens: DesignTokens): string {
  const baseClass = component.name.toLowerCase();
  
  return `.${baseClass} {
  /* Base styles */
  display: flex;
  align-items: center;
  
  /* Design tokens */
  ${component.styling.colorTokens.map(token => `  color: var(--${token});`).join('\n')}
  ${component.styling.typographyTokens.map(token => `  font: var(--${token});`).join('\n')}
  
  /* States */
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}`;
}

function generateSCSS(component: ComponentDefinition, tokens: DesignTokens): string {
  // Similar to CSS modules but with SCSS syntax
  return generateCSSModules(component, tokens);
}

function generateTailwindUtilities(component: ComponentDefinition, tokens: DesignTokens): string {
  return `/* Custom Tailwind utilities for ${component.name} */
@layer components {
  .${component.name.toLowerCase()} {
    @apply flex items-center px-4 py-2 rounded-md transition-all;
  }
}`;
}

function generateTailwindClasses(component: ComponentDefinition): string {
  const classes = ['flex', 'items-center'];
  
  // Add classes based on component type
  if (component.name.toLowerCase().includes('button')) {
    classes.push('px-4', 'py-2', 'rounded-md', 'transition-all', 'hover:shadow-md');
  }
  
  return `'${classes.join(' ')}'`;
}

function generateStyledComponents(component: ComponentDefinition, tokens: DesignTokens): string {
  const elementType = component.codeHints.htmlElement;
  
  return `const Styled${component.name} = styled.${elementType}\`
  display: flex;
  align-items: center;
  
  \${props => props.$variant === 'primary' && \`
    background-color: var(--color-primary-500);
    color: white;
  \`}
  
  \${props => props.$size === 'small' && \`
    padding: 8px 12px;
    font-size: 14px;
  \`}
  
  &:hover {
    transform: translateY(-1px);
  }
\`;`;
}

function generateStorybookStory(component: ComponentDefinition, options: CodeGenerationOptions): string {
  const ext = options.typescript ? 'tsx' : 'jsx';
  
  return `import type { Meta, StoryObj } from '@storybook/react';
import { ${component.name} } from './${component.name}';

const meta: Meta<typeof ${component.name}> = {
  title: '${component.category}/${component.name}',
  component: ${component.name},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
${component.props.map(prop => `    ${prop.name}: {
      description: '${prop.description}',
      control: '${getStorybookControl(prop)}',
    },`).join('\n')}
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
${component.props.map(prop => `    ${prop.name}: ${getDefaultValue(prop)},`).join('\n')}
  },
};

${component.variants.slice(1).map(variant => `
export const ${variant.name.replace(/[^a-zA-Z0-9]/g, '')}: Story = {
  args: {
${Object.entries(variant.properties).map(([key, value]) => `    ${key}: ${JSON.stringify(value)},`).join('\n')}
  },
};`).join('')}`;
}

function generateTestFile(component: ComponentDefinition, options: CodeGenerationOptions): string {
  return `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ${component.name} } from './${component.name}';

describe('${component.name}', () => {
  it('renders correctly', () => {
    render(<${component.name}>Test content</${component.name}>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  ${component.accessibility.role ? `it('has correct accessibility role', () => {
    render(<${component.name}>Test</${component.name}>);
    expect(screen.getByRole('${component.accessibility.role}')).toBeInTheDocument();
  });` : ''}

  ${component.styling.hasStates ? `it('handles hover state', async () => {
    const user = userEvent.setup();
    render(<${component.name}>Test</${component.name}>);
    
    const element = screen.getByText('Test');
    await user.hover(element);
    
    // Add assertions for hover state
  });` : ''}

  ${component.props.map(prop => `it('handles ${prop.name} prop', () => {
    render(<${component.name} ${prop.name}={${getTestValue(prop)}}>Test</${component.name}>);
    // Add specific assertions for this prop
  });`).join('\n\n  ')}
});`;
}

function generateAtomicIndexFiles(hierarchy: any, options: CodeGenerationOptions): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const ext = options.typescript ? 'ts' : 'js';

  Object.entries(hierarchy).forEach(([category, components]: [string, any]) => {
    if (components.length > 0) {
      files.push({
        filename: `${category}/index.${ext}`,
        content: components.map((comp: string) => `export { ${comp} } from './${comp}';`).join('\n'),
        type: 'index'
      });
    }
  });

  return files;
}

function generateGlobalFiles(tokens: DesignTokens, options: CodeGenerationOptions): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  if (options.useDesignTokens) {
    files.push({
      filename: 'tokens/index.ts',
      content: generateTokensFile(tokens),
      type: 'types'
    });
  }

  return files;
}

function generateTokensFile(tokens: DesignTokens): string {
  return `// Design tokens generated from Figma
export const tokens = {
  colors: {
${Object.entries(tokens.colors).map(([name, token]) => {
  const value = typeof token === 'string' ? token : token.value;
  const description = typeof token === 'object' && 'description' in token ? token.description : '';
  return `    '${name}': '${value}', // ${description || ''}`;
}).join('\n')}
  },
  
  typography: {
${Object.entries(tokens.typography).map(([name, token]) => {
  const value = token.value;
  if (typeof value === 'object' && value !== null) {
    return `    '${name}': {
      fontSize: '${(value as any).fontSize || ''}',
      fontWeight: '${(value as any).fontWeight || ''}',
      lineHeight: '${(value as any).lineHeight || ''}',
    },`;
  }
  return `    '${name}': '${value}',`;
}).join('\n')}
  },
  
  spacing: {
${Object.entries(tokens.spacing).map(([name, token]) => 
  `    '${name}': '${token.value}',`
).join('\n')}
  },
};`;
}

// Helper functions
function getStyleExtension(approach: string): string {
  switch (approach) {
    case 'css-modules': return 'module.css';
    case 'scss': return 'scss';
    default: return 'css';
  }
}

function extractDependencies(content: string): string[] {
  const deps: string[] = [];
  
  if (content.includes('styled-components')) deps.push('styled-components');
  if (content.includes('@storybook/react')) deps.push('@storybook/react', '@storybook/addon-essentials');
  if (content.includes('@testing-library')) deps.push('@testing-library/react', '@testing-library/user-event');
  if (content.includes('useState')) deps.push('react');
  
  return deps;
}

function generateSetupInstructions(options: CodeGenerationOptions, dependencies: Set<string>): string[] {
  const instructions: string[] = [];
  
  instructions.push('# Component Setup Instructions');
  instructions.push('');
  instructions.push('## Install Dependencies');
  instructions.push(`npm install ${Array.from(dependencies).join(' ')}`);
  
  if (options.stylingApproach === 'tailwind') {
    instructions.push('');
    instructions.push('## Tailwind CSS Setup');
    instructions.push('Make sure Tailwind CSS is configured in your project');
  }
  
  if (options.includeStorybook) {
    instructions.push('');
    instructions.push('## Storybook Setup');
    instructions.push('npx storybook@latest init');
  }
  
  return instructions;
}

function generateImplementationNotes(analysis: ComponentAnalysisResult, options: CodeGenerationOptions): string[] {
  const notes: string[] = [];
  
  notes.push('# Implementation Notes');
  notes.push('');
  notes.push(`Generated ${analysis.components.length} components using ${options.framework} with ${options.stylingApproach}`);
  
  if (analysis.implementationReadiness.hasIssues.length > 0) {
    notes.push('');
    notes.push('## Components with Issues:');
    analysis.implementationReadiness.hasIssues.forEach(comp => {
      notes.push(`- ${comp.name}: ${comp.accessibility.issues.join(', ')}`);
    });
  }
  
  notes.push('');
  notes.push('## Recommendations:');
  analysis.summary.keyRecommendations.forEach(rec => {
    notes.push(`- ${rec}`);
  });
  
  return notes;
}

function getStorybookControl(prop: any): string {
  switch (prop.type) {
    case 'boolean': return 'boolean';
    case 'number': return 'number';
    case 'enum': return 'select';
    default: return 'text';
  }
}

function getDefaultValue(prop: any): string {
  if (prop.type === 'boolean') return 'false';
  if (prop.type === 'number') return '0';
  if (prop.default) return `'${prop.default}'`;
  return "''";
}

function getTestValue(prop: any): string {
  if (prop.type === 'boolean') return 'true';
  if (prop.type === 'number') return '42';
  return "'test-value'";
} 