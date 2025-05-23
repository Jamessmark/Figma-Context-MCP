# figma-developer-mcp

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
