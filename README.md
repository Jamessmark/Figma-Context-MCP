<div align="center">
  <h1>Figma MCP Server by Bao To</h1>
  <h2>Pull Component, Frames, Design Systems from Figma for Contextual AI-Powered Development</h2>
  <p>
    The most advanced Figma Model Context Protocol (MCP) server for extracting design systems, analyzing components, and maintaining design-code consistency. Built specifically for AI agents and modern design workflows.
  </p>
  <p>
    🌐 Available in:
    <a href="README.md">English</a> |
    <a href="README.ko.md">한국어 (Korean)</a> |
    <a href="README.ja.md">日本語 (Japanese)</a> |
    <a href="README.zh.md">中文 (Chinese)</a> |
    <a href="README.es.md">Español (Spanish)</a> |
    <a href="README.vi.md">Tiếng Việt (Vietnamese)</a> |
    <a href="README.fr.md">Français (French)</a>
  </p>
  <h3>From Figma files to comprehensive design systems and semantic tokens in one command.<br/>Complete with documentation, accessibility compliance, and component intelligence.</h3>
  <a href="https://npmcharts.com/compare/@tothienbao6a0/figma-mcp-server?interval=30">
    <img alt="weekly downloads" src="https://img.shields.io/npm/dm/@tothienbao6a0/figma-mcp-server.svg">
  </a>
  <a href="https://github.com/tothienbao6a0/Figma-Context-MCP/blob/main/LICENSE">
    <img alt="MIT License" src="https://img.shields.io/github/license/tothienbao6a0/Figma-Context-MCP" />
  </a>
  <!-- Link to your Discord or social if you have one, otherwise remove -->
  <!-- <a href="https://framelink.ai/discord">
    <img alt="Discord" src="https://img.shields.io/discord/1352337336913887343?color=7389D8&label&logo=discord&logoColor=ffffff" />
  </a> -->
  <br />
  <!-- Link to your Twitter or social if you have one, otherwise remove -->
  <!-- <a href="https://twitter.com/glipsman">
    <img alt="Twitter" src="https://img.shields.io/twitter/url?url=https%3A%2F%2Fx.com%2Fglipsman&label=%40glipsman" />
  </a> -->
</div>

<br/>

> **Note:** This server is a fork of the original [Framelink Figma MCP server](https://www.npmjs.com/package/figma-developer-mcp), building upon its foundation to offer enhanced capabilities for AI-driven design workflows. We acknowledge and appreciate the foundational work of the original Framelink team.

## **What Makes This Different**

This isn't just another Figma data extractor. It's an **intelligent design system generation, analysis and documentation platform** that provides deep insights into your Figma files:

### **Comprehensive Design System Documentation Generation**
- **Unique End-to-End Solution**: The *only* MCP that automatically generates rich, multi-faceted design system documentation from a Figma link. This includes component deep-dives, interactive overviews, validation reports, accessibility checks, and token specifications, all intelligently integrated.
- **Living Design System Hub**: Transforms static Figma files into a dynamic, explorable, and maintainable design system knowledge base.

### **Component Intelligence**
- **Semantic Understanding**: Analyzes Figma components to understand their structure, variants, and relationships
- **Smart Props Inference**: Automatically detects component properties and maps them to TypeScript interfaces
- **Atomic Design Classification**: Organizes components into atoms, molecules, organisms for scalable architecture
- **Implementation Readiness**: Tells you which components are ready to build vs. need more specification

### **AI-Optimized Workflows & Developer Experience**
- **Perfect for AI Agents**: Cursor, Claude, and other AI tools get semantic component data instead of raw JSON
- **One-Command Setup**: From Figma link to complete design system documentation and tokens
- **Design-Code Sync**: Automated checking to ensure design and implementation stay aligned
- **Accessibility Built-in**: WCAG compliance checking and proper ARIA roles included automatically
- **Streamlined Operations**: From Figma link to a full suite of design system assets – tokens, comprehensive documentation, and validation reports – with minimal effort.

Give [Cursor](https://cursor.sh/) and other AI-powered coding tools access to your Figma files with this [Model Context Protocol](https://modelcontextprotocol.io/introduction) server, **Figma MCP Server by Bao To**.

When Cursor has access to Figma design data, it can be significantly better at implementing designs accurately compared to alternative approaches like pasting screenshots.

## Demo

[Watch a demo of building a UI in Cursor with Figma design data](https://youtu.be/4I4Zs2zg1Oo)

[![Watch the video](https://img.youtube.com/vi/4I4Zs2zg1Oo/maxresdefault.jpg)](https://youtu.be/4I4Zs2zg1Oo)

## How it works

1. Open your IDE's chat (e.g. agent mode in Cursor).
2. Paste a link to a Figma file, frame, or group.
3. Ask your AI agent to do something with the Figma file—e.g. implement the design.
4. The AI agent, configured to use **Figma MCP Server by Bao To**, will fetch the relevant metadata from Figma via this server and use it to write your code.

This MCP server is designed to simplify and translate responses from the [Figma API](https://www.figma.com/developers/api) so that only the most relevant layout and styling information is provided to the AI model.

Reducing the amount of context provided to the model helps make the AI more accurate and the responses more relevant.

## Key Features

### **AI-Driven Development**
- **Component Intelligence**: Understands Figma component structure, variants, and relationships
- **Atomic Design Classification**: Categorizes components into atoms, molecules, organisms
- **Smart Props Inference**: Analyzes component variants to understand component properties
- **Accessibility Integration**: Identifies accessibility requirements and best practices

### **Design Token Extraction**
- **Complete Token Analysis**: Extract colors, typography, spacing, border radius, and effects
- **Smart Categorization**: Automatically groups related tokens (primary colors, text sizes, etc.)
- **Deduced Variables**: Enterprise Variables API workaround for non-Enterprise accounts
- **Multiple Export Formats**: JSON, CSS Variables, Tailwind, Style Dictionary, Figma Tokens

### **Design System Tools**
- **Comprehensive Documentation**: Generate design system docs with component examples
- **Version Comparison**: Track changes between design system versions
- **Validation & Governance**: Check consistency and adherence to best practices
- **WCAG Compliance**: Real accessibility analysis with proper contrast calculations
- **Design-Code Sync**: Ensure design tokens match code implementation

## Available Tools

### **Design Token Extraction**
- `get_figma_data` - Extract complete Figma file structure and design data
- `download_figma_images` - Download images, icons, and graphics from Figma
- `get_figma_variables` - Get Figma Variables (IMPORTANT: Enterprise plans only)
- `generate_design_tokens` - Extract and structure design tokens (colors, typography, spacing, effects)

### **Component Intelligence**
- `analyze_figma_components` - **NEW!** Intelligent component analysis for AI-driven development

### 📚 **Design System Management**  
- `generate_design_system_doc` - Generate comprehensive design system documentation
- `compare_design_tokens` - Compare design tokens between files or versions
- `validate_design_system` - Validate design system consistency and best practices
- `check_accessibility` - Check WCAG accessibility compliance with real contrast calculations
- `migrate_tokens` - Convert tokens to different formats (Tailwind, CSS Variables, Style Dictionary)
- `check_design_code_sync` - Compare design tokens with code implementation

## 🎯 **NEW: Advanced Design System Tools**

*   **Design Token Comparison (`compare_design_tokens`)**:
    *   Compare design tokens between different Figma files or versions
    *   Identifies added, removed, and modified tokens with detailed change tracking
    *   Perfect for design system version control and migration planning
    *   Outputs structured comparison reports for team collaboration

*   **Design System Validation (`validate_design_system`)**:
    *   Validates design tokens against design system best practices and rules
    *   Checks color naming conventions, typography scale consistency, spacing patterns
    *   Identifies potential issues and inconsistencies before they reach production
    *   Provides actionable recommendations for design system improvements

*   **Accessibility Compliance Checker (`check_accessibility`)**:
    *   Analyzes design tokens for accessibility compliance issues
    *   Checks text sizes, color contrasts, touch target sizes
    *   Provides specific suggestions for WCAG compliance improvements
    *   Essential for building inclusive, accessible digital products

*   **Multi-Format Token Migration (`migrate_tokens`)**:
    *   Convert design tokens to popular formats: Tailwind, CSS Variables, Style Dictionary, Figma Tokens
    *   Seamless integration with existing development workflows and tools
    *   Maintains token relationships and semantic meaning across formats
    *   Supports batch conversion for large design systems

*   **Design-Code Sync Checker (`check_design_code_sync`)**:
    *   Compare Figma design tokens with your actual codebase tokens
    *   Identifies discrepancies between design specifications and implementation
    *   Supports JSON, JavaScript, and TypeScript token file formats
    *   Helps maintain perfect alignment between design and development

## Using This Server with Your AI Agent

To leverage the full power of **Figma MCP Server by Bao To**, especially its design system generation tools, you need to guide your AI agent (like Cursor) effectively. Here's how:

1.  **Specify This Server**:
    *   When you start a task, ensure your AI client is configured to use "Figma MCP Server by Bao To" (as shown in the "Getting Started" section).
    *   If your AI agent supports choosing between multiple MCP servers or if you're prompting it more generally, you might need to explicitly state: *"Use the 'Figma MCP Server by Bao To' for Figma tasks."* or refer to its npm package name: *"Use the MCP server `@tothienbao6a0/figma-mcp-server`."*

2.  **Request Specific Tools**:
    *   To get basic Figma data: *"Get the Figma data for [Figma link]."* (The agent will likely use `get_figma_data`).
    *   **To get Figma variables** ⚠️ **Enterprise Only**: *"Get the variables from [Figma link] using the 'Figma MCP Server by Bao To'."* The agent should then call the `get_figma_variables` tool. **Note**: This only works with Figma Enterprise plans.
    *   **To generate design tokens**: *"Generate the design tokens for [Figma link] using the 'Figma MCP Server by Bao To'."* The agent should then call the `generate_design_tokens` tool.
    *   **To generate design tokens with deduced variables**: *"Generate the design tokens for [Figma link] with deduced variables analysis using the 'Figma MCP Server by Bao To'."* The agent should call `generate_design_tokens` with `includeDeducedVariables: true`. This provides a workaround for non-Enterprise users to get variable-like structures.
    *   **To generate design system documentation**: *"Generate the design system documentation for [Figma link] using the 'Figma MCP Server by Bao To'."* The agent should then call the `generate_design_system_doc` tool.

3.  **Provide Necessary Parameters**:
    *   **`fileKey`**: Always provide the Figma file link. The agent and server can extract the `fileKey`.
    *   **`scope` (for `get_figma_variables`)**: ⚠️ **Enterprise Only** - Optional parameter to specify whether to fetch 'local' variables (default, all variables in the file) or 'published' variables (only those published to team library).
    *   **`outputFilePath` (for `get_figma_variables` and `generate_design_tokens`) / `outputDirectoryPath` (for `generate_design_system_doc`)**:
        *   These tools allow you to specify where the generated files should be saved.
        *   If you want the documentation, tokens, or variables to be saved directly into your current project (e.g., in a `/docs` or `/tokens` folder), tell your agent:
            *   *"Get the variables from [Figma link] and save them as `variables.json` in the `src/design-system` folder of my project."*
            *   *"Generate the design system documentation for [Figma link] and save it in the `docs/design_system` folder of my current project."*
            *   *"Generate the design tokens for [Figma link] and save the JSON file as `design-tokens.json` in the `src/style-guide` folder of my project."*
        *   The AI agent should then determine the absolute path to your project's subfolder and provide it as the `outputDirectoryPath` or `outputFilePath` when calling the respective tool.
        *   If you don't specify a path, these tools will save their output to a temporary system directory (as per their documented default behavior), and the agent will be informed of that path. The agent can then help you retrieve the files.

**Example Prompt for an Agent:**

> "Hey AI, please use the Figma MCP Server by Bao To to generate the full design system documentation for `https://www.figma.com/design/yourFileKey/Your-Project-Name`. I want the output to be saved in a new folder called `figma_docs` inside my current project's root directory."

By being specific, you help the AI agent make the correct tool calls with the right parameters to this server, unlocking its advanced features for your development workflow.

## Getting Started

Your AI coding client (like Cursor) can be configured to use this MCP server. Add the following to your client's MCP server configuration file, replacing `YOUR-KEY` with your Figma API key.

> NOTE: You will need to create a Figma access token to use this server. Instructions on how to create a Figma API access token can be found [here](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens).

### MacOS / Linux

```json
{
  "mcpServers": {
    "Figma MCP Server by Bao To": {
      "command": "npx",
      "args": ["-y", "@tothienbao6a0/figma-mcp-server", "--figma-api-key=YOUR-KEY", "--stdio"]
    }
  }
}
```

### Windows

```json
{
  "mcpServers": {
    "Figma MCP Server by Bao To": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@tothienbao6a0/figma-mcp-server", "--figma-api-key=YOUR-KEY", "--stdio"]
    }
  }
}
```

This will use `npx` to download and run the `@tothienbao6a0/figma-mcp-server` package from npm. The `-y` flag automatically agrees to any prompts from `npx`.

Alternatively, you can install the package globally first (though `npx` is often preferred for CLI tools to ensure you're using the latest version without global installs):
```bash
npm install -g @tothienbao6a0/figma-mcp-server
```
And then configure your client to use `@tothienbao6a0/figma-mcp-server` directly as the command.

## Making Generated Design Systems More Readable

When using this MCP server to generate design tokens and documentation, you'll notice that Figma's internal IDs (like `fill-hxq15en`) can make the system hard to maintain. The generated design system documentation is extensive, with internal IDs scattered across multiple files and sections. Here's a workflow to transform ALL instances of these IDs into semantic, readable tokens:

### The Semantic Mapping Workflow

1. **Generate Initial Design System**
   - Use the MCP server to generate your initial design tokens and documentation
   - You'll get multiple files with Figma's internal IDs:
     * Design tokens JSON
     * CSS variables
     * Component documentation
     * Style guides
     * Usage examples

2. **Prepare Your Color System Screenshot**
   - In Figma, navigate to your color styles page
   - Take a clear screenshot showing:
     * All color swatches
     * Color names and values
     * Color grouping/hierarchy
   - Save this screenshot for reference

3. **Use AI to Create Comprehensive Semantic Mapping**
   - In Cursor, share your color system screenshot
   - Ask the AI to perform a comprehensive mapping
   - Example prompt:
     ```
     "I have a screenshot of my Figma color system and the generated design system files. 
     Please help create a semantic mapping for ALL instances of internal IDs across the entire documentation:
     1. First, analyze the color system in the image to understand the semantic meaning of each color
     2. Then, search through all generated files to find every instance of each internal ID
     3. Create a complete mapping between IDs and semantic names
     4. Update ALL occurrences in:
        - Token files
        - CSS variables
        - Component documentation
        - Usage examples
        - Style guides
     5. Ensure consistency across the entire design system
     6. Generate additional documentation including:
        - Usage guidelines for the semantic tokens
        - Examples for different contexts (components, themes)
        - Best practices for implementation
        - Common patterns and combinations
        - Accessibility considerations"
     ```
   - The AI will:
     * Analyze your color system visually
     * Search for ALL instances of each ID
     * Create a comprehensive mapping
     * Update every occurrence in all files
     * Maintain consistency throughout
     * Create supporting documentation

4. **Generated Files**
   The AI will create/update ALL relevant files:
   - `token-mapping.json` - Complete ID to semantic name mapping
   - `design_variables.css` - Updated CSS variables
   - All documentation files with semantic names
   - Component examples with new token names
   - Style guides with semantic references

### Example Comprehensive Transformation

Before (across multiple files):
```css
/* design_variables.css */
--fill-hxq15en: #556AEB;
--stroke-heus4w0: #B9C4FF;

/* component_examples.md */
Use `var(--fill-hxq15en)` for primary actions
Border: 1px solid var(--stroke-heus4w0)

/* style_guide.md */
| fill-hxq15en | Primary blue | #556AEB |
```

After:
```css
/* design_variables.css */
--color-primary-500: #556AEB;
--stroke-primary-light: #B9C4FF;

/* component_examples.md */
Use `var(--color-primary-500)` for primary actions
Border: 1px solid var(--stroke-primary-light)

/* style_guide.md */
| color-primary-500 | Primary blue | #556AEB |
```

### Best Practices

1. **Color System Screenshot**
   - Ensure ALL colors are visible
   - Include complete naming system
   - Show full color hierarchy
   - Capture any usage guidelines

2. **Semantic Naming**
   - Use consistent, purpose-based names
   - Follow a clear naming hierarchy
   - Document relationships between colors
   - Include usage context

3. **Comprehensive Updates**
   - Verify ALL instances are updated
   - Check ALL documentation files
   - Review ALL component examples
   - Validate ALL references

4. **Maintenance**
   - Keep screenshot up to date
   - Re-run complete mapping when needed
   - Verify consistency across ALL files
   - Document any manual overrides

The AI will also generate additional documentation to help developers use the semantic tokens correctly, including usage guidelines and examples for different contexts (components, themes, etc.).

## Contributing

To access these tools in your AI agent, use these prompts:

*   **To extract comprehensive design data**: *"Analyze the design system from [Figma link] using the 'Figma MCP Server by Bao To'."* The agent should then call the `get_figma_data` tool.
*   **To download specific images**: *"Download the icons and images from [Figma link] using the 'Figma MCP Server by Bao To'."* The agent should then call the `download_figma_images` tool.
*   **To extract variables (Enterprise only)**: *"Get the variables from [Figma link] using the 'Figma MCP Server by Bao To'."* The agent should then call the `get_figma_variables` tool.
*   **To generate design tokens**: *"Generate the design tokens for [Figma link] using the 'Figma MCP Server by Bao To'."* The agent should then call the `generate_design_tokens` tool.
*   **To generate design tokens with deduced variables**: *"Generate the design tokens for [Figma link] with deduced variables analysis using the 'Figma MCP Server by Bao To'."* The agent should call `generate_design_tokens` with `includeDeducedVariables: true`. This provides a workaround for non-Enterprise users to get variable-like structures.
*   **To generate comprehensive documentation**: *"Generate design system documentation for [Figma link] using the 'Figma MCP Server by Bao To'."* The agent should then call the `generate_design_system_doc` tool.

## 🎯 **Advanced Design System Tools Usage**

*   **To compare design tokens between versions**: *"Compare the design tokens between [Figma link 1] and [Figma link 2] using the 'Figma MCP Server by Bao To'."* The agent should call the `compare_design_tokens` tool.
*   **To validate design system compliance**: *"Validate the design system compliance for [Figma link] using the 'Figma MCP Server by Bao To'."* The agent should call the `validate_design_system` tool.
*   **To check accessibility compliance**: *"Check the accessibility compliance for [Figma link] using the 'Figma MCP Server by Bao To'."* The agent should call the `check_accessibility` tool.
*   **To migrate tokens to different formats**: *"Convert the design tokens from [Figma link] to Tailwind format using the 'Figma MCP Server by Bao To'."* The agent should call the `migrate_tokens` tool with the desired target format.
*   **To check design-code sync**: *"Check if the design tokens from [Figma link] are in sync with my code tokens file at [file path] using the 'Figma MCP Server by Bao To'."* The agent should call the `check_design_code_sync` tool.

## Plan Limitations

⚠️ **Important Note About Figma Variables API**

The `get_figma_variables` function requires a **Figma Enterprise plan**. This limitation is imposed by Figma, not by this MCP server:

- **Available on ALL plans**: `get_figma_data`, `download_figma_images`, `generate_design_tokens`, `generate_design_system_doc`
- **Enterprise only**: `get_figma_variables` (Variables REST API access)

**Why this limitation exists:**
- Figma restricts Variables API access to Enterprise plans only
- Users on Starter, Professional, or Organization plans will receive `403 Forbidden` errors
- This is a business decision by Figma to drive Enterprise sales

**Alternatives for non-Enterprise users:**
- Use `generate_design_tokens` with `includeDeducedVariables: true` - analyzes design tokens to create variable-like structures (NEW workaround feature)
- Use `generate_design_tokens` (standard) - extracts similar styling information from your designs
- Use Figma's Plugin API (requires building a custom plugin)
- Manually export variables from Figma UI

For more details, see [Figma's official documentation on plan features](https://help.figma.com/hc/en-us/articles/360040328273-Figma-plans-and-features).
