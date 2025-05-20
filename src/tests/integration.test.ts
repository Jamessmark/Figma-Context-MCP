import { createServer } from "../mcp.js";
import { config } from "dotenv";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import yaml from "js-yaml";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

config();

describe("Figma MCP Server Tests", () => {
  let server: McpServer;
  let client: Client;
  let figmaApiKey: string;
  let figmaFileKey: string;

  beforeAll(async () => {
    figmaApiKey = process.env.FIGMA_API_KEY || "";
    if (!figmaApiKey) {
      throw new Error("FIGMA_API_KEY is not set in environment variables");
    }

    figmaFileKey = process.env.FIGMA_FILE_KEY || "";
    if (!figmaFileKey) {
      throw new Error("FIGMA_FILE_KEY is not set in environment variables");
    }

    server = createServer(figmaApiKey);

    client = new Client(
      {
        name: "figma-test-client",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  });

  afterAll(async () => {
    await client.close();
  });

  describe("Get Figma Data", () => {
    it("should be able to get Figma file data", async () => {
      const args: any = {
        fileKey: figmaFileKey,
      };

      const result = await client.request(
        {
          method: "tools/call",
          params: {
            name: "get_figma_data",
            arguments: args,
          },
        },
        CallToolResultSchema,
      );

      expect(result.content).toBeDefined();
      expect(result.content?.length).toBeGreaterThan(0);
      expect(result.content?.[0].type).toBe('text');

      const textContent = result.content?.[0]?.text;
      expect(textContent).toBeDefined();

      const content = textContent as string;
      const parsed = yaml.load(content);

      expect(parsed).toBeDefined();
    }, 60000);
  });
});
