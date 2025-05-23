# figma-developer-mcp

## [0.6.22] - 2025-01-24

### Added
- **New Variable Deduction Feature**: Enhanced `generate_design_tokens` with optional variable analysis capability
  - Added new `includeDeducedVariables` parameter to `generate_design_tokens` tool
  - Analyzes design tokens to deduce variable-like structures as a workaround for Enterprise-only Variables API limitation
  - Provides pattern-based variable grouping (e.g., detecting `primary-500`, `primary-400` color scales)
  - Infers variable collections for Colors, Typography, and Spacing
  - Includes usage context analysis (e.g., border-color vs. background-color)
  - Outputs Variables API-compatible format for integration
  - Clear documentation of limitations compared to real Figma Variables

- **5 New Advanced Design System Tools**:
  - **`compare_design_tokens`**: Compare design tokens between different Figma files or versions with detailed change tracking
  - **`validate_design_system`**: Validate design tokens against best practices (naming conventions, typography scale, spacing patterns)
  - **`check_accessibility`**: Analyze design tokens for accessibility compliance (text sizes, color contrast, WCAG guidelines)
  - **`migrate_tokens`**: Convert design tokens to popular formats (Tailwind, CSS Variables, Style Dictionary, Figma Tokens)
  - **`check_design_code_sync`**: Compare Figma design tokens with codebase tokens to identify sync issues

### Enhanced
- **Major Accessibility Checker Improvements**:
  - **Real WCAG contrast ratio calculations** using official luminance formulas
  - **Comprehensive text analysis**: font weight, line height, and size validation
  - **Smart color pair detection**: automatically finds and tests text/background combinations
  - **Touch target validation**: checks spacing tokens for minimum 44px touch targets
  - **Color-only information detection**: warns when status colors lack alternative indicators
  - **Enhanced suggestions**: specific, actionable recommendations for WCAG compliance
  - **Support for hex color formats**: 3-digit and 6-digit hex colors with proper conversion
  - **Large text detection**: applies appropriate contrast thresholds (3:1 vs 4.5:1)
  - **Known problematic color database**: detects commonly problematic color choices

### Technical Changes
- Added new `variable-deduction.ts` service with intelligent pattern analysis
- Added new `design-system-tools.ts` service with 5 comprehensive design system utilities
- Enhanced `generate_design_tokens` with optional variable deduction capability
- **Enhanced accessibility functions**: `calculateContrastRatio()`, `getRelativeLuminance()`, `hexToRgb()`, `isLowContrastColor()`
- Updated all documentation (README.md, international READMEs) with new features and usage instructions
- Fixed TypeScript import/export issues for better modularity
- Added proper error handling and validation for all new tools
- Comprehensive testing and build verification

### Enhanced Capabilities
- Professional design system management and validation
- Multi-format token conversion and migration
- Design-code synchronization checking
- Accessibility compliance verification
- Version control support for design tokens
- Enterprise-level design system tooling

## 0.2.2

### Patch Changes

- fd10a46: - Update HTTP server creation method to no longer subclass McpServer
  - Change logging behavior on HTTP server
- 6e2c8f5: Minor bump, testing fix for hanging CF DOs

## 0.2.2-beta.1

### Patch Changes

- 6e2c8f5: Minor bump, testing fix for hanging CF DOs

## 0.2.2-beta.0

### Patch Changes

- fd10a46: - Update HTTP server creation method to no longer subclass McpServer
  - Change logging behavior on HTTP server

## [0.6.21] - 2025-01-24

### Added
- **New `get_figma_variables` function**: Retrieves all variables and variable collections from Figma files using Figma's Variables API
  - Supports both local variables (all variables in the file) and published variables (those published to team library)
  - Different from design tokens: Variables are Figma's dynamic values system with modes/themes, while design tokens are extracted style values
  - Returns structured data showing variable collections, modes, and values for each mode
  - Can optionally save variables data to a JSON file
  - Added comprehensive documentation in README explaining the difference between variables and design tokens

### Documentation
- **Added clear Enterprise plan warnings** throughout README for Variables API limitations
  - Added dedicated "Plan Limitations" section explaining Figma's Enterprise-only restriction for Variables API
  - Updated Key Features section with Enterprise plan warnings and alternative recommendations
  - Updated usage instructions with clear Enterprise-only indicators
  - Provided alternatives for non-Enterprise users (design tokens, Plugin API, manual export)
  - Added link to Figma's official documentation on plan features

### Technical Changes
- Added `getVariables()` method to `FigmaService` class to call Figma's `/v1/files/:file_key/variables/:scope` endpoint
- Added `get_figma_variables` MCP tool with proper schema validation and error handling
- Supports both 'local' and 'published' variable scopes

## [0.6.20] - Previous version

### Features
- Basic Figma data extraction (`get_figma_data`)
- Image downloads (`download_figma_images`)  
- Design token generation (`generate_design_tokens`)
- Design system documentation (`generate_design_system_doc`)

## [0.7.0] - 2024-12-29

### 🚀 Major New Features

#### **AI-Driven Component Intelligence & Code Generation**
- **NEW: `analyze_figma_components`** - Revolutionary component analysis for AI-driven development:
  - **Component Intelligence**: Deep understanding of Figma component structure, variants, and relationships
  - **Atomic Design Classification**: Automatically categorizes components as atoms, molecules, organisms, templates
  - **Smart Props Inference**: Analyzes component variants to infer React props and TypeScript types
  - **Usage Pattern Analysis**: Detects how components are used and their relationships
  - **Implementation Readiness Assessment**: Identifies which components are ready for development
  - **Code Generation Hints**: Provides HTML element suggestions, React patterns, and accessibility requirements

- **NEW: `generate_react_components`** - Production-ready React component generator:
  - **Complete Component Generation**: Creates React components with TypeScript, props, and proper structure
  - **Multiple Styling Approaches**: CSS Modules, Styled Components, Tailwind CSS, SCSS support
  - **Testing & Documentation**: Generates Jest/RTL tests and Storybook stories automatically
  - **Atomic Structure Organization**: Organizes components by atomic design hierarchy
  - **Design Token Integration**: Uses extracted design tokens in generated components
  - **Accessibility Built-in**: Includes ARIA roles and accessibility best practices
  - **Development Ready**: Generates package.json dependencies and setup instructions

#### **Why These Tools Matter**
These tools bridge the gap between design and development by enabling:
- **AI agents** to understand Figma components semantically for better code generation
- **Developers** to get production-ready React code directly from Figma designs
- **Design systems teams** to maintain consistency between design and code
- **Faster workflows** from design to implementation with intelligent automation

### 🎯 **Real-World Workflows Enabled**
1. **"Build this component from Figma"** → AI now understands component structure and generates proper code
2. **"Convert my design system to React"** → Complete component library with tests and documentation
3. **"Keep design-code in sync"** → Automated detection of inconsistencies and updates

### 📊 **Enhanced Component Analysis**
- Component variant detection and property inference
- Design pattern identification (card systems, button hierarchies)
- Implementation effort estimation and complexity scoring
- Component relationship mapping and dependency analysis

## [0.6.23] - 2024-12-28
