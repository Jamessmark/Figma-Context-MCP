# Figma MCP Server by Bao To Codebase Overview

This document provides a comprehensive overview of the `@tothienbao6a0/figma-mcp-server` codebase (a fork and enhancement of the original `figma-developer-mcp`), a Node.js application written in TypeScript. It acts as an advanced Model Context Protocol (MCP) server to provide Figma design data, comprehensive design system analysis, and component intelligence to AI coding agents like Cursor, enabling them to better understand, document, and implement designs.

## 1. Project Purpose & High-Level Architecture

The primary goal of this project is to create a powerful bridge between Figma designs and AI-assisted code generation and design system management. It exposes an MCP server that AI tools can query for:
*   Structured and simplified information about Figma files and nodes.
*   Extracted design tokens in various formats.
*   Figma Variables (for Enterprise users).
*   Automatically generated design system documentation.
*   In-depth component analysis for AI-driven development.
*   Tools for design system validation, comparison, accessibility checking, and code-design synchronization.

**Key functionalities:**

*   **Figma API Interaction:** Fetches raw data from the Figma REST API (file structure, node details, images, variables).
*   **Data Simplification:** Transforms the verbose Figma API response into a more concise, AI-friendly format (`SimplifiedDesign`, `SimplifiedNode`). This involves:
    *   Extracting essential layout, style, and text properties.
    *   De-duplicating common styles (colors, text styles, layouts, effects) by storing them in a `globalVars` object and referencing them by ID from individual nodes. This significantly reduces the token count for AI models.
*   **MCP Server Implementation:** Provides a comprehensive suite of tools for AI agents (detailed in section 3.2).
*   **Advanced Design System Analysis:** Offers tools for token generation, documentation, validation, comparison, and more.
*   **Component Intelligence:** Analyzes Figma components to understand structure, variants, and relationships for smarter code generation.
*   **Communication Protocols:** Supports two modes of operation for the MCP server:
    *   **stdio:** For direct integration with tools like Cursor via standard input/output.
    *   **HTTP/SSE:** For network-based communication, using Express.js to handle HTTP requests and Server-Sent Events (SSE) for streaming responses.

## 2. Project Structure

```
.
├── .changeset/       # Changeset files for versioning and changelogs
├── .github/          # GitHub-specific files (e.g., workflows)
├── docs/             # Documentation files (can also be an output for generated docs)
├── src/              # Source code
│   ├── services/     # Services for interacting with Figma, simplifying data, and implementing tool logic
│   │   ├── figma.ts
│   │   ├── simplify-node-response.ts
│   │   ├── token-generator.ts
│   │   ├── doc-generator.ts
│   │   ├── variable-deduction.ts
│   │   ├── design-system-tools.ts
│   │   └── component-analysis.ts
│   ├── tests/        # Test files
│   ├── transformers/ # Modules for transforming specific Figma properties
│   │   ├── effects.ts
│   │   ├── layout.ts
│   │   └── style.ts
│   ├── utils/        # Utility functions
│   │   ├── common.ts
│   │   ├── identity.ts
│   │   └── logger.ts
│   ├── cli.ts        # Command-line interface handling and server startup logic
│   ├── config.ts     # Configuration management
│   ├── index.ts      # Main export file for the library
│   ├── mcp.ts        # MCP server implementation and tool registration
│   └── server.ts     # HTTP/SSE server setup using Express
├── .eslintignore     # ESLint ignore patterns
├── .eslintrc         # ESLint configuration
├── .gitignore        # Git ignore file
├── .nvmrc            # Node version manager configuration
├── .prettierrc       # Prettier code formatter configuration
├── CHANGELOG.md      # Changelog for the project
├── jest.config.js    # Jest test runner configuration
├── LICENSE           # Project license
├── package.json      # NPM package metadata, scripts, and dependencies
├── pnpm-lock.yaml    # PNPM lock file
├── README.md         # Main README (English)
├── README.ja.md      # Japanese README
├── README.ko.md      # Korean README
├── README.zh.md      # Chinese README
├── tsconfig.json     # TypeScript compiler configuration
└── tsup.config.ts    # tsup bundler configuration (for building the library)
```

## 3. Core Modules and Files

### 3.1. Entry Points & Server Lifecycle

*   **`src/index.ts`**:
    *   Serves as the main module for library consumers if this package were to be used as a direct dependency.
    *   Re-exports key functions and types like `createServer` (from `mcp.ts`), `startServer` (from `cli.ts`), `getServerConfig` (from `config.ts`), and core types like `SimplifiedDesign`.

*   **`src/cli.ts`**:
    *   Handles the command-line execution of the server.
    *   Uses `yargs` to parse command-line arguments (e.g., `--figma-api-key`, `--port`, `--stdio`).
    *   Determines whether to run in `stdio` mode or HTTP mode based on arguments or `NODE_ENV`.
    *   Calls `getServerConfig()` to load configuration.
    *   Calls `createServer()` (from `mcp.ts`) to instantiate the MCP server.
    *   If `stdio` mode, connects the server using `StdioServerTransport`.
    *   If HTTP mode, calls `startHttpServer()` (from `server.ts`).
    *   Automatically starts the server if the script is run directly.

*   **`src/server.ts`**:
    *   Sets up an Express.js HTTP server when the MCP server is run in HTTP mode.
    *   Implements two MCP transport mechanisms over HTTP:
        *   **Streamable HTTP (`/mcp` endpoint - POST):** A modern approach for request/response, supporting session management.
        *   **Server-Sent Events (SSE - `/sse` and `/messages` endpoints):** For streaming server-to-client messages.
    *   Manages MCP transports (`StreamableHTTPServerTransport`, `SSEServerTransport` from the `@modelcontextprotocol/sdk`).
    *   Handles session creation, reuse, and termination for Streamable HTTP.
    *   Includes basic progress notification logic for Streamable HTTP requests.
    *   Includes graceful shutdown logic (`SIGINT` handler) to close active transports.

*   **`src/config.ts`**:
    *   Manages server configuration.
    *   Uses `dotenv` to load environment variables from a `.env` file.
    *   Uses `yargs` to parse CLI arguments (`--figma-api-key`, `--port`).
    *   Prioritizes CLI arguments over environment variables, with defaults for some settings (e.g., port `3333`).
    *   Validates that `FIGMA_API_KEY` is provided.
    *   Logs the configuration sources (CLI, env, default) if not in stdio mode.
    *   Exports `getServerConfig()` which returns a `ServerConfig` object.

### 3.2. MCP Implementation

*   **`src/mcp.ts`**:
    *   Central to the MCP server logic.
    *   Exports `createServer(figmaApiKey, { isHTTP })` which:
        *   Instantiates `McpServer` from `@modelcontextprotocol/sdk`.
        *   Initializes `FigmaService` with the API key.
        *   Calls `registerTools()` to define the tools available to the AI client.
    *   `registerTools()` defines the following tools using `zod` for schema validation:
        1.  **`get_figma_data`**:
            *   **Purpose**: Fetches and simplifies Figma file or node data.
            *   **Parameters**: `fileKey`, `nodeId` (optional), `depth` (optional).
            *   **Logic**: Uses `figmaService` to get data, converts to YAML.
        2.  **`download_figma_images`**:
            *   **Purpose**: Downloads images (SVG, PNG) from Figma.
            *   **Parameters**: `fileKey`, `nodes` (array with `nodeId`, `imageRef`, `fileName`), `localPath`.
            *   **Logic**: Uses `figmaService` to fetch and save images.
        3.  **`get_figma_variables`**:
            *   **Purpose**: Retrieves Figma Variables (primarily for Enterprise plans).
            *   **Parameters**: `fileKey`, `scope` (optional: "local" or "published"), `outputFilePath` (optional).
            *   **Logic**: Calls `figmaService.getVariables()`. Output can be YAML in response or saved to a JSON file.
        4.  **`generate_design_tokens`**:
            *   **Purpose**: Extracts design tokens (colors, typography, etc.).
            *   **Parameters**: `fileKey`, `outputFilePath` (optional), `includeDeducedVariables` (optional boolean).
            *   **Logic**: Uses `figmaService.getFile()` then `generateTokensFromSimplifiedDesign()` (from `token-generator.ts`). Can include deduced variables via `variable-deduction.ts`. Saves to JSON file.
        5.  **`generate_design_system_doc`**:
            *   **Purpose**: Generates comprehensive Markdown design system documentation.
            *   **Parameters**: `fileKey`, `outputDirectoryPath` (optional).
            *   **Logic**: Uses `figmaService.getFile()` then `generateStructuredDesignSystemDocumentation()` (from `doc-generator.ts`). Saves Markdown files to a directory.
        6.  **`compare_design_tokens`**:
            *   **Purpose**: Compares design tokens between two Figma files.
            *   **Parameters**: `fileKey1`, `fileKey2`, `outputFilePath` (optional).
            *   **Logic**: Generates tokens for both files, then uses `compareDesignTokens()` (from `design-system-tools.ts`).
        7.  **`validate_design_system`**:
            *   **Purpose**: Validates design tokens against best practices.
            *   **Parameters**: `fileKey`, `outputFilePath` (optional).
            *   **Logic**: Generates tokens, then uses `validateDesignSystem()` (from `design-system-tools.ts`).
        8.  **`check_accessibility`**:
            *   **Purpose**: Checks design tokens for accessibility compliance (WCAG).
            *   **Parameters**: `fileKey`, `outputFilePath` (optional).
            *   **Logic**: Generates tokens, then uses `checkAccessibility()` (from `design-system-tools.ts`).
        9.  **`migrate_tokens`**:
            *   **Purpose**: Converts design tokens to different formats (Tailwind, CSS Vars, etc.).
            *   **Parameters**: `fileKey`, `targetFormat`, `outputFilePath`.
            *   **Logic**: Generates tokens, then uses `migrateTokens()` (from `design-system-tools.ts`).
        10. **`check_design_code_sync`**:
            *   **Purpose**: Compares Figma design tokens with code tokens.
            *   **Parameters**: `fileKey`, `codeTokensPath`, `outputFilePath` (optional).
            *   **Logic**: Generates Figma tokens, then uses `checkDesignCodeSync()` (from `design-system-tools.ts`).
        11. **`analyze_figma_components`**:
            *   **Purpose**: Analyzes Figma components for structure, variants, props for AI code generation.
            *   **Parameters**: `fileKey`, `outputFilePath` (optional).
            *   **Logic**: Uses `figmaService.getFile()` then `analyzeComponents()` (from `component-analysis.ts`).

### 3.3. Figma Interaction & Data Simplification

*   **`src/services/figma.ts` (`FigmaService` class)**:
    *   Handles all direct communication with the Figma REST API (`https://api.figma.com/v1`).
    *   `constructor(apiKey)`: Stores the Figma API key.
    *   `request<T>(endpoint)`: Private helper for making authenticated GET requests.
    *   `getFile(fileKey, depth?)`: Fetches entire file data.
    *   `getNode(fileKey, nodeId, depth?)`: Fetches specific node data.
        *   Both `getFile` and `getNode` call `parseFigmaResponse()` (from `simplify-node-response.ts`) to simplify the data.
        *   Logs raw and simplified responses in development mode.
    *   `getImageFills(fileKey, nodes, localPath)`: Fetches and downloads image fills.
    *   `getImages(fileKey, nodes, localPath)`: Fetches and downloads rendered images.
    *   `getVariables(fileKey, scope)`: New method to fetch Figma Variables using the Figma API.

*   **`src/services/simplify-node-response.ts`**:
    *   Critical module for transforming raw Figma API data into `SimplifiedDesign` and `SimplifiedNode`.
    *   **`SimplifiedDesign`**: `{ name, lastModified, thumbnailUrl, nodes: SimplifiedNode[], globalVars: GlobalVars }`
    *   **`SimplifiedNode`**: `{ id, name, type, boundingBox?, text?, textStyle? (ID), fills? (ID), strokes? (ID), effects? (ID), opacity?, borderRadius?, layout? (ID), children? }`
    *   **`GlobalVars`**: `{ styles: Record<StyleId, StyleObject> }`. This is key for de-duplication. Styles (text, fills, strokes, effects, layouts) are stored here once, and nodes reference them via a `StyleId` (e.g., `fill_ABC123`).
    *   `parseFigmaResponse(data)`: Main function. Iterates through Figma nodes, filters invisible ones, and calls `parseNode()`.
    *   `parseNode(globalVars, figmaNode, parentNode?)`: Recursively processes each node.
    *   `findOrCreateVar(globalVars, value, prefix)`: De-duplicates styles by storing them in `globalVars.styles`.
    *   The core logic for data simplification remains foundational for many tools.

### 3.4. New Service Modules

Beyond the original `figma.ts` and `simplify-node-response.ts`, several new service modules in `src/services/` implement the core logic for the enhanced tools:

*   **`src/services/token-generator.ts`**:
    *   Responsible for `generateTokensFromSimplifiedDesign()`.
    *   Analyzes the `SimplifiedDesign` object (especially `globalVars` and node styles) to extract and structure design tokens like colors, typography, spacing, effects, etc.
    *   Categorizes tokens and prepares them for various output formats or further analysis.

*   **`src/services/doc-generator.ts`**:
    *   Contains `generateStructuredDesignSystemDocumentation()`.
    *   Takes the `SimplifiedDesign` and generates a comprehensive set of Markdown documents.
    *   This includes overviews, style guides (based on tokens), and component documentation (potentially integrating with `component-analysis.ts` output or its logic).

*   **`src/services/variable-deduction.ts`**:
    *   Implements `deduceVariablesFromTokens()` and `formatAsVariablesResponse()`.
    *   Provides a workaround for non-Enterprise Figma users by analyzing generated design tokens to infer variable-like structures (e.g., finding common color values and grouping them).
    *   Formats these deduced variables in a way that might be compatible with systems expecting Figma Variables API output.

*   **`src/services/design-system-tools.ts`**:
    *   A collection of functions powering several advanced tools:
        *   `compareDesignTokens()`: Compares two sets of generated tokens.
        *   `validateDesignSystem()`: Checks generated tokens against a set of design system best practices and rules.
        *   `checkAccessibility()`: Analyzes generated tokens for WCAG compliance issues (e.g., color contrast).
        *   `migrateTokens()`: Converts generated tokens into different specified formats (e.g., Tailwind config, CSS variables).
        *   `checkDesignCodeSync()`: Compares tokens generated from Figma with tokens extracted from a codebase file.

*   **`src/services/component-analysis.ts`**:
    *   Houses the `analyzeComponents()` function.
    *   Performs a deep analysis of the `SimplifiedDesign` with a focus on components.
    *   Identifies component structures, variants, inferred properties (props), relationships, and applies atomic design classification.
    *   Aims to provide rich, semantic information about components to aid AI in generating more accurate and context-aware code.
    *   Generates reports on implementation readiness and detected design patterns.

### 3.5. Data Transformers

These modules take specific parts of a Figma node's data and convert them into a simplified, often CSS-friendly, format. The results are typically then stored in `globalVars` by `simplify-node-response.ts`.

*   **`src/transformers/layout.ts` (`buildSimplifiedLayout`)**:
    *   Converts Figma's layout system (Auto Layout, constraints) into a Flexbox-like model (`SimplifiedLayout` interface).
    *   Properties: `mode` ("row", "column", "none"), `justifyContent`, `alignItems`, `alignSelf`, `wrap`, `gap`, `padding`, `sizing` (horizontal/vertical: "fixed", "fill", "hug"), `overflowScroll`, `position` ("absolute"), `locationRelativeToParent`, `dimensions`.
    *   Translates Figma enums (e.g., `MIN`, `MAX`, `SPACE_BETWEEN`) to CSS equivalents (e.g., `flex-start`, `flex-end`, `space-between`).
    *   Considers parent layout and child sizing/positioning hints.
    *   Uses `generateCSSShorthand` (from `common.ts`) for padding.

*   **`src/transformers/effects.ts` (`buildSimplifiedEffects`)**:
    *   Converts Figma effects (drop shadows, inner shadows, blurs) into CSS `box-shadow`, `filter`, and `backdrop-filter` strings.
    *   Filters out invisible effects.
    *   Maps `DROP_SHADOW` and `INNER_SHADOW` to `box-shadow` components.
    *   Maps `LAYER_BLUR` to `filter: blur(...)`.
    *   Maps `BACKGROUND_BLUR` to `backdrop-filter: blur(...)`.
    *   Uses `formatRGBAColor` (from `common.ts`).

*   **`src/transformers/style.ts` (`buildSimplifiedStrokes`)**:
    *   Processes Figma stroke properties into a `SimplifiedStroke` object.
    *   Properties: `colors` (array of `SimplifiedFill` from parsed paints), `strokeWeight` (e.g., "1px"), `strokeDashes` (array of numbers), `strokeWeights` (CSS shorthand for individual stroke weights).
    *   Uses `parsePaint` and `generateCSSShorthand` (from `common.ts`).

### 3.6. Utility Modules (`src/utils/`)

*   **`src/utils/common.ts`**:
    *   `downloadFigmaImage(fileName, localPath, imageUrl)`: Downloads an image from a URL and saves it locally using `fetch` and Node.js streams. Creates the directory if it doesn't exist.
    *   `removeEmptyKeys(input)`: Recursively removes keys with empty arrays or empty objects from an object.
    *   `hexToRgba(hex, opacity?)`: Converts hex color string (3 or 6 digit) to `rgba(...)` string.
    *   `convertColor(figmaRGBA, opacity?)`: Converts Figma RGBA object (`{r,g,b,a}` from 0-1) to `{ hex: CSSHexColor, opacity: number }`.
    *   `formatRGBAColor(figmaRGBA, opacity?)`: Converts Figma RGBA object to `rgba(...)` CSS string.
    *   `generateVarId(prefix?)`: Generates a random 6-character alphanumeric ID, prefixed (e.g., `fill_A1B2C3`). Used for `StyleId`.
    *   `generateCSSShorthand(values, options?)`: Creates CSS shorthand strings for properties like padding/margin (e.g., "10px", "10px 20px").
    *   `parsePaint(rawPaint)`: Converts a Figma `Paint` object (SOLID, IMAGE, GRADIENT_*) into a `SimplifiedFill` object or a direct CSS color string. Handles different paint types and uses `convertColor` or `formatRGBAColor`.
    *   `isVisible(element)`: Checks if `element.visible` is true (defaults to true if undefined).

*   **`src/utils/identity.ts`**:
    *   Contains type guards and utility functions for checking the type or properties of objects.
    *   `hasValue(key, obj, typeGuard?)`: Checks if an object has a specific key and optionally if the value matches a type guard.
    *   `isFrame(val)`: Type guard for Figma `HasFramePropertiesTrait`.
    *   `isLayout(val)`: Type guard for Figma `HasLayoutTrait` (checks for `absoluteBoundingBox`).
    *   `isStrokeWeights(val)`: Type guard for Figma `StrokeWeights`.
    *   `isRectangle(key, obj)`: Type guard to check if a property `key` on `obj` is a Figma `Rectangle`.
    *   `isRectangleCornerRadii(val)`: Checks if `val` is an array of 4 numbers (for corner radii).
    *   `isCSSColorValue(val)`: Checks if `val` is a string starting with `#` or `rgba`.
    *   Re-exports `isTruthy` from the `remeda` library.

*   **`src/utils/logger.ts`**:
    *   A simple logger utility.
    *   `Logger.isHTTP` (boolean): Controls output format. If true (HTTP mode), logs to `console.log`. Otherwise (stdio mode), logs to `console.error` to keep stdout clean for MCP messages.
    *   `Logger.log(...args)`: Logs informational messages.
    *   `Logger.error(...args)`: Logs error messages to `console.error`.

## 4. Key Dependencies

*   **`@modelcontextprotocol/sdk`**: For MCP server and transport implementations.
*   **`@figma/rest-api-spec`**: Provides TypeScript types for the Figma API.
*   **`express`**: Web framework for the HTTP server.
*   **`yargs`**: For parsing command-line arguments.
*   **`dotenv`**: For loading environment variables from `.env` files.
*   **`zod`**: For schema declaration and validation of MCP tool parameters.
*   **`js-yaml`**: For converting JavaScript objects to YAML (for `get_figma_data` tool).
*   **`remeda`**: Utility library (specifically `isTruthy` is used).
*   **`tsup`**: For bundling TypeScript into JavaScript.
*   **`typescript`**: For static typing.
*   **`eslint`, `prettier`**: For linting and code formatting.
*   **`jest`**: For testing.

## 5. Configuration

The server requires a Figma API key, which can be provided via:
1.  `--figma-api-key` CLI argument.
2.  `FIGMA_API_KEY` environment variable (e.g., in a `.env` file).

The port for the HTTP server (default `3333`) can be configured via:
1.  `--port` CLI argument.
2.  `PORT` environment variable.

## 6. How to Run

From `package.json` scripts:
*   `dev`: Runs the server in development mode using `tsup` for on-the-fly compilation.
*   `build`: Builds the project using `tsup`.
*   `start`: Starts the server from the built output (expects it to be in `dist/`).

Typically, it would be run using `npx figma-developer-mcp --figma-api-key YOUR_KEY` or configured within an AI tool that supports MCP.

## 7. Potential Areas for Development (from TODOs)

*   Improve layout handling: Further refine the translation from Figma's layout vocabulary to CSS concepts.
*   Extract image fills/vectors to a top-level field in `SimplifiedDesign` for better AI visibility, potentially re-implementing vector parents for more accurate downloads.
*   Explore using the Figma API endpoint for individual style lookups (`/v1/styles/:key`).
*   Implement functionality to parse out and save design tokens to a file (e.g., `.cursor/rules/design-tokens`).
*   Clean up image download code, particularly `getImages` in `FigmaService`.
*   Address potential issue where SSE connections might fail after a StreamableHTTP connection is made to the same Express server.

This document should provide a solid foundation for understanding the `@tothienbao6a0/figma-mcp-server` codebase. 