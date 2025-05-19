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

const serverInfo = {
  name: "Figma MCP Server by Bao To",
  version: "0.4.7",
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
    },
    async ({ fileKey, outputFilePath }) => {
      try {
        Logger.log(`Generating design tokens for file: ${fileKey}`);
        const simplifiedDesign = await figmaService.getFile(fileKey);
        Logger.log(`Successfully fetched file: ${simplifiedDesign.name}`);

        const tokens = generateTokensFromSimplifiedDesign(simplifiedDesign);
        Logger.log("Design tokens generated.");

        let resolvedOutputFilePath: string;
        const safeFileNameBase = simplifiedDesign.name 
            ? simplifiedDesign.name.replace(/[\/\s<>:"\\|?*]+/g, '_') 
            : 'untitled_figma_design';
        const outputFileName = `${safeFileNameBase}_tokens.json`;

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

        fs.writeFileSync(resolvedOutputFilePath, JSON.stringify(tokens, null, 2));
        Logger.log(`Design tokens successfully generated and saved to: ${resolvedOutputFilePath}`);

        return {
          content: [
            {
              type: "text",
              text: `Design tokens successfully generated and saved to: ${resolvedOutputFilePath}`,
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
}

export { createServer };
