import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FigmaService } from "./services/figma.js";
import type { SimplifiedDesign } from "./services/simplify-node-response.js";
import { generateTokensFromSimplifiedDesign } from "./services/token-generator.js";
import { generateMarkdownFromSimplifiedDesign, generateStructuredDesignSystemDocumentation } from "./services/doc-generator.js";
import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import os from "os";
import { Logger } from "./utils/logger.js";
import url from "url";
import { deduceVariablesFromTokens, formatAsVariablesResponse } from "./services/variable-deduction.js";
import { 
  compareDesignTokens, 
  validateDesignSystem, 
  checkAccessibility, 
  migrateTokens, 
  checkDesignCodeSync 
} from "./services/design-system-tools.js";
import { analyzeComponents } from "./services/component-analysis.js";
import { generateComponentCode } from "./services/code-generation.js";
import fsPromises from "fs/promises";

const serverInfo = {
  name: "Figma MCP Server by Bao To",
  version: "0.6.29",
};

const serverOptions = {
  capabilities: { logging: {}, tools: {} },
};

function createServer(figmaApiKey: string, { isHTTP = false }: { isHTTP?: boolean } = {}) {
  const server = new McpServer(serverInfo);
  const figmaService = new FigmaService(figmaApiKey);
  registerTools(server, figmaService);

  Logger.isHTTP = isHTTP;

  return server;
}

function registerTools(server: McpServer, figmaService: FigmaService): void {
  // Tool to get file information
  server.tool(
    "get_figma_data",
    "When the nodeId cannot be obtained, obtain the layout information about the entire Figma file",
    {
      fileKey: z
        .string()
        .describe(
          "The key of the Figma file to fetch, often found in a provided URL like figma.com/(file|design)/<fileKey>/...",
        ),
      nodeId: z
        .string()
        .optional()
        .describe(
          "The ID of the node to fetch, often found as URL parameter node-id=<nodeId>, always use if provided",
        ),
      depth: z
        .number()
        .optional()
        .describe(
          "How many levels deep to traverse the node tree, only use if explicitly requested by the user",
        ),
    },
    async ({ fileKey, nodeId, depth }) => {
      try {
        Logger.log(
          `Fetching ${
            depth ? `${depth} layers deep` : "all layers"
          } of ${nodeId ? `node ${nodeId} from file` : `full file`} ${fileKey}`,
        );

        let file: SimplifiedDesign;
        if (nodeId) {
          file = await figmaService.getNode(fileKey, nodeId, depth);
        } else {
          file = await figmaService.getFile(fileKey, depth);
        }

        Logger.log(`Successfully fetched file: ${file.name}`);
        const { nodes, globalVars, ...metadata } = file;

        const result = {
          metadata,
          nodes,
          globalVars,
        };

        Logger.log("Generating YAML result from file");
        const yamlResult = yaml.dump(result);

        Logger.log("Sending result to client");
        return {
          content: [{ type: "text", text: yamlResult }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : JSON.stringify(error);
        Logger.error(`Error fetching file ${fileKey}:`, message);
        return {
          isError: true,
          content: [{ type: "text", text: `Error fetching file: ${message}` }],
        };
      }
    },
  );

  // TODO: Clean up all image download related code, particularly getImages in Figma service
  // Tool to download images
  server.tool(
    "download_figma_images",
    "Download SVG and PNG images used in a Figma file based on the IDs of image or icon nodes",
    {
      fileKey: z.string().describe("The key of the Figma file containing the node"),
      nodes: z
        .object({
          nodeId: z
            .string()
            .describe("The ID of the Figma image node to fetch, formatted as 1234:5678"),
          imageRef: z
            .string()
            .optional()
            .describe(
              "If a node has an imageRef fill, you must include this variable. Leave blank when downloading Vector SVG images.",
            ),
          fileName: z.string().describe("The local name for saving the fetched file"),
        })
        .array()
        .describe("The nodes to fetch as images"),
      localPath: z
        .string()
        .describe(
          "The absolute path to the directory where images are stored in the project. If the directory does not exist, it will be created. The format of this path should respect the directory format of the operating system you are running on. Don't use any special character escaping in the path name either.",
        ),
    },
    async ({ fileKey, nodes, localPath }) => {
      try {
        const imageFills = nodes.filter(({ imageRef }) => !!imageRef) as {
          nodeId: string;
          imageRef: string;
          fileName: string;
        }[];
        const fillDownloads = figmaService.getImageFills(fileKey, imageFills, localPath);
        const renderRequests = nodes
          .filter(({ imageRef }) => !imageRef)
          .map(({ nodeId, fileName }) => ({
            nodeId,
            fileName,
            fileType: fileName.endsWith(".svg") ? ("svg" as const) : ("png" as const),
          }));

        const renderDownloads = figmaService.getImages(fileKey, renderRequests, localPath);

        const downloads = await Promise.all([fillDownloads, renderDownloads]).then(([f, r]) => [
          ...f,
          ...r,
        ]);

        // If any download fails, return false
        const saveSuccess = !downloads.find((success) => !success);
        return {
          content: [
            {
              type: "text",
              text: saveSuccess
                ? `Success, ${downloads.length} images downloaded: ${downloads.join(", ")}`
                : "Failed",
            },
          ],
        };
      } catch (error) {
        Logger.error(`Error downloading images from file ${fileKey}:`, error);
        return {
          isError: true,
          content: [{ type: "text", text: `Error downloading images: ${error}` }],
        };
      }
    },
  );

  // New tool to get figma variables
  server.tool(
    "get_figma_variables",
    "Retrieves all variables and variable collections from a Figma file. Variables are different from design tokens - they are Figma's dynamic values system that can store colors, numbers, strings, and booleans with different modes/themes.",
    {
      fileKey: z
        .string()
        .describe(
          "The key of the Figma file to extract variables from, found in the Figma file URL.",
        ),
      scope: z
        .enum(["local", "published"])
        .optional()
        .default("local")
        .describe(
          "Whether to fetch local variables (all variables in the file) or published variables (only those published to team library). Defaults to 'local'.",
        ),
      outputFilePath: z
        .string()
        .optional()
        .describe(
          "Optional full path (including filename) where the output JSON file should be saved. If not provided, variables data will be returned in the response.",
        ),
    },
    async ({ fileKey, scope = "local", outputFilePath }) => {
      try {
        Logger.log(`Getting Figma variables for file: ${fileKey} (scope: ${scope})`);
        const variablesResponse = await figmaService.getVariables(fileKey, scope);
        Logger.log(`Successfully fetched variables from file: ${fileKey}`);

        if (outputFilePath) {
          const dirToEnsure = path.dirname(outputFilePath);
          if (!fs.existsSync(dirToEnsure)) {
            fs.mkdirSync(dirToEnsure, { recursive: true });
            Logger.log(`Created directory: ${dirToEnsure}`);
          }
          
          fs.writeFileSync(outputFilePath, JSON.stringify(variablesResponse, null, 2));
          Logger.log(`Variables successfully saved to: ${outputFilePath}`);

          return {
            content: [
              {
                type: "text",
                text: `Variables successfully retrieved and saved to: ${outputFilePath}`,
              },
            ],
          };
        } else {
          // Return variables data as YAML for better readability
          const yamlResult = yaml.dump(variablesResponse);
          return {
            content: [
              {
                type: "text", 
                text: yamlResult,
              },
            ],
          };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : JSON.stringify(error);
        Logger.error(`Error getting variables for file ${fileKey}:`, message);
        return {
          isError: true,
          content: [{ type: "text", text: `Error getting variables: ${message}` }],
        };
      }
    },
  );

  // New tool to generate design tokens
  server.tool(
    "generate_design_tokens",
    "Extracts design tokens (colors, typography, spacing, effects) from a Figma file and saves them as a JSON file.",
    {
      fileKey: z
        .string()
        .describe(
          "The key of the Figma file to extract tokens from, found in the Figma file URL.",
        ),
      outputFilePath: z
        .string()
        .optional()
        .describe(
          "Optional full path (including filename) where the output JSON file should be saved. If not provided, it will be saved in a temporary directory.",
        ),
      includeDeducedVariables: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "Whether to include deduced variables analysis as a workaround for Enterprise-only Variables API. This analyzes design tokens to create variable-like structures but has limitations compared to real Figma Variables.",
        ),
    },
    async ({ fileKey, outputFilePath, includeDeducedVariables }) => {
      try {
        Logger.log(`Generating design tokens for file: ${fileKey}`);
        const simplifiedDesign = await figmaService.getFile(fileKey);
        Logger.log(`Successfully fetched file: ${simplifiedDesign.name}`);

        const tokens = generateTokensFromSimplifiedDesign(simplifiedDesign);
        Logger.log("Design tokens generated.");

        let output: any = { designTokens: tokens };

        // Optionally include deduced variables analysis
        if (includeDeducedVariables) {
          Logger.log("Analyzing design tokens to deduce variable-like structures...");
          const deducedVariables = deduceVariablesFromTokens(tokens);
          output.deducedVariables = deducedVariables;
          output.variablesApiCompatible = formatAsVariablesResponse(deducedVariables);
          Logger.log(`Deduced ${deducedVariables.metadata.totalVariables} variables from design tokens.`);
        }

        let resolvedOutputFilePath: string;
        const safeFileNameBase = simplifiedDesign.name 
            ? simplifiedDesign.name.replace(/[\/\s<>:"\\|?*]+/g, '_') 
            : 'untitled_figma_design';
        const outputFileName = includeDeducedVariables 
            ? `${safeFileNameBase}_tokens_with_variables.json`
            : `${safeFileNameBase}_tokens.json`;

        if (outputFilePath) {
          resolvedOutputFilePath = outputFilePath;
          const dirToEnsure = path.dirname(resolvedOutputFilePath);
          if (!fs.existsSync(dirToEnsure)) {
            fs.mkdirSync(dirToEnsure, { recursive: true });
            Logger.log(`Created directory: ${dirToEnsure}`);
          }
        } else {
          resolvedOutputFilePath = path.join(os.tmpdir(), outputFileName);
          Logger.log(`outputFilePath not provided, using temporary path: ${resolvedOutputFilePath}`);
        }

        fs.writeFileSync(resolvedOutputFilePath, JSON.stringify(output, null, 2));
        
        let successMessage = `Design tokens successfully generated and saved to: ${resolvedOutputFilePath}`;
        if (includeDeducedVariables) {
          const deducedVars = output.deducedVariables;
          successMessage += `\n\nDeduced Variables Analysis included:`;
          successMessage += `\n- Total variables: ${deducedVars.metadata.totalVariables}`;
          successMessage += `\n- Collections: ${deducedVars.collections.map((c: any) => c.name).join(', ')}`;
          successMessage += `\n- Limitations: This is a workaround analysis with limitations compared to real Figma Variables`;
          successMessage += `\n  - ${deducedVars.metadata.limitations.join('\n  - ')}`;
        }
        
        Logger.log(successMessage);

        return {
          content: [
            {
              type: "text",
              text: successMessage,
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : JSON.stringify(error);
        Logger.error(`Error generating design tokens for file ${fileKey}:`, message);
        return {
          isError: true,
          content: [{ type: "text", text: `Error generating design tokens: ${message}` }],
        };
      }
    },
  );

  // New tool to generate design system documentation
  server.tool(
    "generate_design_system_doc",
    "Generates a comprehensive set of Markdown documents detailing the design system from a Figma file into a specified directory.",
    {
      fileKey: z
        .string()
        .describe(
          "The key of the Figma file to document, found in the Figma file URL.",
        ),
      outputDirectoryPath: z
        .string()
        .optional()
        .describe(
          "Optional full path to the directory where the documentation files should be saved. If not provided, files and folders (e.g., _Overview.md, GlobalStyles/, Components/) will be generated in a new unique directory within the system\'s temporary folder. The full path to this temporary directory will be returned in the response. To save directly into a specific project directory, this path must be provided.",
        ),
    },
    async ({ fileKey, outputDirectoryPath }) => {
      try {
        Logger.log(`Generating structured design system documentation for file: ${fileKey}`);
        const simplifiedDesign = await figmaService.getFile(fileKey);
        Logger.log(`Successfully fetched file: ${simplifiedDesign.name}`);

        let resolvedOutputDirectoryPath: string;
        const safeFileNameBase = simplifiedDesign.name
            ? simplifiedDesign.name.replace(/[/\\s<>:"\|?*]+/g, '_')
            : 'untitled_figma_design';
        
        if (outputDirectoryPath) {
          resolvedOutputDirectoryPath = outputDirectoryPath;
          Logger.log(`Using provided outputDirectoryPath: ${resolvedOutputDirectoryPath}`);
        } else {
          const tempDirName = `${safeFileNameBase}_design_system_docs_${Date.now()}`;
          resolvedOutputDirectoryPath = path.join(os.tmpdir(), tempDirName);
          Logger.log(`outputDirectoryPath not provided, defaulting to temporary directory: ${resolvedOutputDirectoryPath}`);
        }

        // Ensure the output directory exists (especially important if a path was provided or using temp dir)
        if (!fs.existsSync(resolvedOutputDirectoryPath)) {
          fs.mkdirSync(resolvedOutputDirectoryPath, { recursive: true });
          Logger.log(`Created directory: ${resolvedOutputDirectoryPath}`);
        }

        // Call the function to generate multiple Markdown files
        generateStructuredDesignSystemDocumentation(simplifiedDesign, resolvedOutputDirectoryPath);

        Logger.log(`Design system documentation successfully generated into directory: ${resolvedOutputDirectoryPath}`);
        
        return {
          content: [
            {
              type: "text",
              text: `Design system documentation successfully generated into directory: ${resolvedOutputDirectoryPath}`,
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : JSON.stringify(error);
        Logger.error(`Error generating design system documentation for file ${fileKey}:`, message);
        return {
          isError: true,
          content: [{ type: "text", text: `Error generating design system documentation: ${message}` }],
        };
      }
    },
  );

  // Tool 6: Compare design tokens between versions/files
  server.tool(
    "compare_design_tokens",
    "Compare design tokens between two Figma files or token sets to identify changes, additions, and removals.",
    {
      fileKey1: z
        .string()
        .describe("The key of the first Figma file for comparison."),
      fileKey2: z
        .string()
        .describe("The key of the second Figma file for comparison."),
      outputFilePath: z
        .string()
        .optional()
        .describe("Optional path to save the comparison results as JSON."),
    },
    async (request) => {
      const { fileKey1, fileKey2, outputFilePath } = request;

      try {
        // Generate tokens from both files
        const simplifiedData1 = await figmaService.getFile(fileKey1);
        const tokens1 = generateTokensFromSimplifiedDesign(simplifiedData1);
        
        const simplifiedData2 = await figmaService.getFile(fileKey2);
        const tokens2 = generateTokensFromSimplifiedDesign(simplifiedData2);

        // Compare the tokens
        const comparison = await compareDesignTokens(tokens1, tokens2, outputFilePath);

        return {
          content: [
            {
              type: "text",
              text: `Token Comparison Results:
              
📊 **Summary:**
- Added: ${comparison.added.length} tokens
- Removed: ${comparison.removed.length} tokens  
- Modified: ${comparison.modified.length} tokens
- Unchanged: ${comparison.unchanged.length} tokens

${comparison.added.length > 0 ? `\n➕ **Added Tokens:**\n${comparison.added.map(t => `- ${t}`).join('\n')}` : ''}

${comparison.removed.length > 0 ? `\n➖ **Removed Tokens:**\n${comparison.removed.map(t => `- ${t}`).join('\n')}` : ''}

${comparison.modified.length > 0 ? `\n🔄 **Modified Tokens:**\n${comparison.modified.map(t => `- ${t.name}: ${t.changes.join(', ')}`).join('\n')}` : ''}

${outputFilePath ? `\n💾 **Results saved to:** ${outputFilePath}` : ''}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error comparing design tokens: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  // Tool 7: Validate design system compliance
  server.tool(
    "validate_design_system",
    "Validate design tokens against design system best practices and rules.",
    {
      fileKey: z
        .string()
        .describe("The key of the Figma file to validate."),
      outputFilePath: z
        .string()
        .optional()
        .describe("Optional path to save the validation results as JSON."),
    },
    async (request) => {
      const { fileKey, outputFilePath } = request;

      try {
        const simplifiedData = await figmaService.getFile(fileKey);
        const tokens = generateTokensFromSimplifiedDesign(simplifiedData);
        const validation = validateDesignSystem(tokens);

        if (outputFilePath) {
          await fsPromises.writeFile(outputFilePath, JSON.stringify(validation, null, 2), 'utf-8');
        }

        const status = validation.passed ? "✅ PASSED" : "❌ FAILED";
        
        return {
          content: [
            {
              type: "text",
              text: `Design System Validation Results: ${status}

📊 **Summary:**
- Total Checks: ${validation.summary.totalChecks}
- Passed: ${validation.summary.passed}
- Failed: ${validation.summary.failed}  
- Warnings: ${validation.summary.warnings}

${validation.errors.length > 0 ? `\n🚫 **Errors:**\n${validation.errors.map(e => `- [${e.rule}] ${e.component}: ${e.issue}`).join('\n')}` : ''}

${validation.warnings.length > 0 ? `\n⚠️ **Warnings:**\n${validation.warnings.map(w => `- [${w.rule}] ${w.component}: ${w.issue}`).join('\n')}` : ''}

${outputFilePath ? `\n💾 **Results saved to:** ${outputFilePath}` : ''}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error validating design system: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  // Tool 8: Check accessibility compliance
  server.tool(
    "check_accessibility",
    "Check design tokens for accessibility compliance issues (contrast, text sizes, etc.).",
    {
      fileKey: z
        .string()
        .describe("The key of the Figma file to check for accessibility."),
      outputFilePath: z
        .string()
        .optional()
        .describe("Optional path to save the accessibility report as JSON."),
    },
    async (request) => {
      const { fileKey, outputFilePath } = request;

      try {
        const simplifiedData = await figmaService.getFile(fileKey);
        const tokens = generateTokensFromSimplifiedDesign(simplifiedData);
        const issues = checkAccessibility(tokens);

        if (outputFilePath) {
          await fsPromises.writeFile(outputFilePath, JSON.stringify(issues, null, 2), 'utf-8');
        }

        const errorCount = issues.filter(i => i.severity === 'error').length;
        const warningCount = issues.filter(i => i.severity === 'warning').length;
        const status = errorCount === 0 ? "✅ PASSED" : "❌ FAILED";

        return {
          content: [
            {
              type: "text",
              text: `Accessibility Check Results: ${status}

📊 **Summary:**
- Total Issues: ${issues.length}
- Errors: ${errorCount}
- Warnings: ${warningCount}

${issues.length > 0 ? `\n🔍 **Issues Found:**\n${issues.map(issue => `${issue.severity === 'error' ? '🚫' : '⚠️'} [${issue.type}] ${issue.component}: ${issue.issue}\n   💡 ${issue.suggestion}`).join('\n\n')}` : '\n🎉 **No accessibility issues found!**'}

${outputFilePath ? `\n💾 **Report saved to:** ${outputFilePath}` : ''}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error checking accessibility: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  // Tool 9: Migrate tokens to different formats
  server.tool(
    "migrate_tokens",
    "Convert design tokens to different formats (Tailwind, CSS Variables, Style Dictionary, Figma Tokens).",
    {
      fileKey: z
        .string()
        .describe("The key of the Figma file containing the tokens to migrate."),
      targetFormat: z
        .enum(["tailwind", "css-variables", "style-dictionary", "figma-tokens"])
        .describe("The target format to convert tokens to."),
      outputFilePath: z
        .string()
        .describe("The path where the converted tokens should be saved."),
    },
    async (request) => {
      const { fileKey, targetFormat, outputFilePath } = request;

      try {
        const simplifiedData = await figmaService.getFile(fileKey);
        const tokens = generateTokensFromSimplifiedDesign(simplifiedData);
        const result = await migrateTokens(tokens, targetFormat, outputFilePath);

        if (result.success) {
          return {
            content: [
              {
                type: "text",
                text: `✅ Token Migration Successful!

📦 **Details:**
- Format: ${result.format}
- Tokens Processed: ${result.summary.tokensProcessed}
- Output File: ${result.outputPath}

🎉 Your design tokens have been successfully converted to ${targetFormat} format and saved to ${outputFilePath}!`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `❌ Token Migration Failed!

🚫 **Errors:**
${result.summary.errors.map(e => `- ${e}`).join('\n')}`,
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error migrating tokens: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  // Tool 10: Check design-code sync
  server.tool(
    "check_design_code_sync",
    "Compare Figma design tokens with code tokens to identify sync issues between design and implementation.",
    {
      fileKey: z
        .string()
        .describe("The key of the Figma file to compare."),
      codeTokensPath: z
        .string()
        .describe("Path to the code tokens file (JSON, JS, or TS format)."),
      outputFilePath: z
        .string()
        .optional()
        .describe("Optional path to save the sync comparison results."),
    },
    async (request) => {
      const { fileKey, codeTokensPath, outputFilePath } = request;

      try {
        const simplifiedData = await figmaService.getFile(fileKey);
        const figmaTokens = generateTokensFromSimplifiedDesign(simplifiedData);
        const syncResult = await checkDesignCodeSync(figmaTokens, codeTokensPath);

        if (outputFilePath) {
          await fsPromises.writeFile(outputFilePath, JSON.stringify(syncResult, null, 2), 'utf-8');
        }

        const totalChanges = syncResult.added.length + syncResult.removed.length + syncResult.modified.length;
        const status = totalChanges === 0 ? "✅ IN SYNC" : "🔄 OUT OF SYNC";

        return {
          content: [
            {
              type: "text",
              text: `Design-Code Sync Check: ${status}

📊 **Summary:**
- In Sync: ${syncResult.unchanged.length} tokens
- Need Updates: ${totalChanges} tokens

${syncResult.added.length > 0 ? `\n➕ **Missing in Code:**\n${syncResult.added.map(t => `- ${t}`).join('\n')}` : ''}

${syncResult.removed.length > 0 ? `\n➖ **Extra in Code:**\n${syncResult.removed.map(t => `- ${t}`).join('\n')}` : ''}

${syncResult.modified.length > 0 ? `\n🔄 **Value Differences:**\n${syncResult.modified.map(t => `- ${t.name}: ${t.changes.join(', ')}`).join('\n')}` : ''}

${totalChanges === 0 ? '\n🎉 **Perfect sync!** Your design and code tokens are aligned.' : '\n💡 **Action needed:** Update your code tokens to match the design.'}

${outputFilePath ? `\n💾 **Results saved to:** ${outputFilePath}` : ''}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error checking design-code sync: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  // Tool 11: Analyze components for better AI code generation
  server.tool(
    "analyze_figma_components",
    "Analyzes Figma components to understand structure, variants, and relationships for intelligent AI-driven code generation. This tool helps AI agents understand component semantics, props, variants, and implementation patterns.",
    {
      fileKey: z
        .string()
        .describe("The key of the Figma file to analyze for components."),
      outputFilePath: z
        .string()
        .optional()
        .describe("Optional path to save the component analysis results as JSON."),
    },
    async (request) => {
      const { fileKey, outputFilePath } = request;

      try {
        const simplifiedData = await figmaService.getFile(fileKey);
        const analysis = analyzeComponents(simplifiedData);

        if (outputFilePath) {
          await fsPromises.writeFile(outputFilePath, JSON.stringify(analysis, null, 2), 'utf-8');
        }

        const { summary, atomicHierarchy, implementationReadiness, designPatterns } = analysis;

        return {
          content: [
            {
              type: "text",
              text: `Component Analysis Results for "${simplifiedData.name}":

📊 **Summary:**
- Total Components: ${summary.totalComponents}
- Atoms: ${summary.byCategory.atom} | Molecules: ${summary.byCategory.molecule} | Organisms: ${summary.byCategory.organism}
- Complexity Score: ${summary.complexityScore}/100
- Consistency Score: ${summary.consistencyScore}/100
- Implementation Effort: ${summary.implementationEffort.toUpperCase()}

🧱 **Atomic Design Hierarchy:**
- ⚛️  Atoms (${atomicHierarchy.atoms.length}): ${atomicHierarchy.atoms.join(', ') || 'None'}
- 🧬 Molecules (${atomicHierarchy.molecules.length}): ${atomicHierarchy.molecules.join(', ') || 'None'}
- 🦠 Organisms (${atomicHierarchy.organisms.length}): ${atomicHierarchy.organisms.join(', ') || 'None'}
- 📄 Templates (${atomicHierarchy.templates.length}): ${atomicHierarchy.templates.join(', ') || 'None'}

🚀 **Implementation Readiness:**
- ✅ Ready to Implement (${implementationReadiness.readyToImplement.length}): ${implementationReadiness.readyToImplement.map(c => c.name).join(', ') || 'None'}
- ⚠️  Need Specification (${implementationReadiness.needsSpecification.length}): ${implementationReadiness.needsSpecification.map(c => c.name).join(', ') || 'None'}
- 🚫 Have Issues (${implementationReadiness.hasIssues.length}): ${implementationReadiness.hasIssues.map(c => c.name).join(', ') || 'None'}

🎨 **Design Patterns Found (${designPatterns.length}):**
${designPatterns.map(pattern => `- **${pattern.name}**: ${pattern.description}`).join('\n') || 'No patterns detected'}

💡 **Key Recommendations:**
${summary.keyRecommendations.map(rec => `- ${rec}`).join('\n')}

📋 **For AI Code Generation:**
Each component now includes:
- Inferred props and variants
- HTML element suggestions
- React patterns and state management hints
- Accessibility requirements
- Code examples and usage patterns

${outputFilePath ? `\n💾 **Full analysis saved to:** ${outputFilePath}` : ''}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error analyzing components: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );

  // Tool 12: Generate React component code from Figma analysis
  server.tool(
    "generate_react_components",
    "Generates production-ready React component code from Figma component analysis. Creates complete component files with TypeScript, styling, tests, and Storybook stories.",
    {
      fileKey: z
        .string()
        .describe("The key of the Figma file to generate components from."),
      outputDirectory: z
        .string()
        .describe("Directory path where component files should be generated."),
      options: z.object({
        typescript: z.boolean().default(true).describe("Generate TypeScript files"),
        stylingApproach: z.enum(['css-modules', 'styled-components', 'tailwind', 'scss']).default('css-modules').describe("CSS approach to use"),
        includeStorybook: z.boolean().default(true).describe("Generate Storybook stories"),
        includeTests: z.boolean().default(true).describe("Generate test files"),
        useDesignTokens: z.boolean().default(true).describe("Use extracted design tokens"),
        atomicStructure: z.boolean().default(true).describe("Organize components by atomic design hierarchy")
      }).optional()
    },
    async (request) => {
      const { fileKey, outputDirectory, options } = request;

      try {
        // Get Figma data and analyze components
        const simplifiedData = await figmaService.getFile(fileKey);
        const analysis = analyzeComponents(simplifiedData);
        
        // Generate design tokens
        const tokens = generateTokensFromSimplifiedDesign(simplifiedData);

        // Generate component code
        const codeGenOptions = {
          framework: 'react' as const,
          typescript: options?.typescript ?? true,
          stylingApproach: (options?.stylingApproach ?? 'css-modules') as 'css-modules' | 'styled-components' | 'tailwind' | 'scss',
          includeStorybook: options?.includeStorybook ?? true,
          includeTests: options?.includeTests ?? true,
          useDesignTokens: options?.useDesignTokens ?? true,
          atomicStructure: options?.atomicStructure ?? true
        };

        const result = generateComponentCode(analysis, tokens, codeGenOptions);

        // Create output directory structure
        await fsPromises.mkdir(outputDirectory, { recursive: true });

        // Write all generated files
        for (const file of result.files) {
          const filePath = `${outputDirectory}/${file.filename}`;
          const fileDir = filePath.substring(0, filePath.lastIndexOf('/'));
          
          if (fileDir !== outputDirectory) {
            await fsPromises.mkdir(fileDir, { recursive: true });
          }
          
          await fsPromises.writeFile(filePath, file.content, 'utf-8');
        }

        // Write setup instructions
        await fsPromises.writeFile(
          `${outputDirectory}/README.md`, 
          result.setupInstructions.join('\n'), 
          'utf-8'
        );

        // Write implementation notes
        await fsPromises.writeFile(
          `${outputDirectory}/IMPLEMENTATION_NOTES.md`, 
          result.implementationNotes.join('\n'), 
          'utf-8'
        );

        return {
          content: [
            {
              type: "text",
              text: `🚀 **React Components Generated Successfully!**

📁 **Generated Files:** ${result.files.length} files created in \`${outputDirectory}\`

📊 **Component Summary:**
- Total Components: ${analysis.components.length}
- Atoms: ${analysis.atomicHierarchy.atoms.length}
- Molecules: ${analysis.atomicHierarchy.molecules.length}  
- Organisms: ${analysis.atomicHierarchy.organisms.length}

📦 **File Types Generated:**
- Components: ${result.files.filter(f => f.type === 'component').length}
- TypeScript Types: ${result.files.filter(f => f.type === 'types').length}
- Styles: ${result.files.filter(f => f.type === 'style').length}
- Stories: ${result.files.filter(f => f.type === 'story').length}
- Tests: ${result.files.filter(f => f.type === 'test').length}
- Index Files: ${result.files.filter(f => f.type === 'index').length}

🛠 **Technologies Used:**
- Framework: React with ${codeGenOptions.typescript ? 'TypeScript' : 'JavaScript'}
- Styling: ${codeGenOptions.stylingApproach}
- Testing: ${codeGenOptions.includeTests ? 'React Testing Library' : 'None'}
- Documentation: ${codeGenOptions.includeStorybook ? 'Storybook' : 'None'}

📋 **Next Steps:**
1. Install dependencies: \`npm install ${result.packageDependencies.join(' ')}\`
2. Review generated components in \`${outputDirectory}\`
3. Check \`README.md\` for setup instructions
4. Read \`IMPLEMENTATION_NOTES.md\` for important notes

✨ **Ready for Development:** Your Figma design is now production-ready React code!`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error generating React components: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );
}

export { createServer };
