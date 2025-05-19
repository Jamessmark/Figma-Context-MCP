<div align="center">
  <h1>Figma MCP Server by Bao To</h1>
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
  <h3>Empower your AI coding agent with direct Figma access.<br/>Generate design systems & tokens into your project, and implement UIs in one shot.</h3>
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

> **Note:** This server is a fork of the original Framelink Figma MCP server, building upon its foundation to offer enhanced capabilities for AI-driven design workflows. We acknowledge and appreciate the foundational work of the original Framelink team.

Give [Cursor](https://cursor.sh/) and other AI-powered coding tools access to your Figma files with this [Model Context Protocol](https://modelcontextprotocol.io/introduction) server, **Figma MCP Server by Bao To**.

When Cursor has access to Figma design data, it can be significantly better at implementing designs accurately compared to alternative approaches like pasting screenshots.

## Demo

[Watch a demo of building a UI in Cursor with Figma design data](https://youtu.be/6G9yb-LrEqg)

[![Watch the video](https://img.youtube.com/vi/6G9yb-LrEqg/maxresdefault.jpg)](https://youtu.be/6G9yb-LrEqg)

## How it works

1. Open your IDE's chat (e.g. agent mode in Cursor).
2. Paste a link to a Figma file, frame, or group.
3. Ask your AI agent to do something with the Figma file—e.g. implement the design.
4. The AI agent, configured to use **Figma MCP Server by Bao To**, will fetch the relevant metadata from Figma via this server and use it to write your code.

This MCP server is designed to simplify and translate responses from the [Figma API](https://www.figma.com/developers/api) so that only the most relevant layout and styling information is provided to the AI model.

Reducing the amount of context provided to the model helps make the AI more accurate and the responses more relevant.

## Key Features & Advantages

While other Figma MCP servers can provide basic node information, **Figma MCP Server by Bao To** offers superior capabilities for understanding and utilizing your design system:

*   **Comprehensive Design Data Extraction (`get_figma_data`)**: Fetches detailed information about your Figma files or specific nodes, simplifying complex Figma structures into a more digestible format for AI.
*   **Precise Image Downloads (`download_figma_images`)**: Allows targeted downloading of specific image assets (SVGs, PNGs) from your Figma files.
*   ⭐ **Automated Design Token Generation (`generate_design_tokens`)**:
    *   Extracts crucial design tokens (colors, typography, spacing, effects) directly from your Figma file.
    *   Outputs a structured JSON file, ready to be integrated into your development workflow or used by AI to ensure design consistency.
*   ⭐ **Intelligent Design System Documentation (`generate_design_system_doc`)**:
    *   Goes beyond simple node data by generating comprehensive, multi-file Markdown documentation for your entire design system as defined in Figma.
    *   Creates an organized structure including an overview, detailed pages for global styles (colors, typography, effects, layout), and component/node information per Figma canvas.
    *   This tool was a key motivation for this fork. By generating this comprehensive design system documentation *directly within your project repository*, it provides AI agents with a deep, contextual understanding of your project's specific design language. This empowers them to understand not just individual elements but the relationships and rules of your design system, leading to more accurate, consistent, and contextually aware UI implementation and freeing you from manual design interpretation.

These advanced features make this server particularly powerful for tasks requiring a deep understanding of the design system, such as generating themed components or ensuring adherence to brand guidelines during UI development.

## Using This Server with Your AI Agent

To leverage the full power of **Figma MCP Server by Bao To**, especially its design system generation tools, you need to guide your AI agent (like Cursor) effectively. Here's how:

1.  **Specify This Server**:
    *   When you start a task, ensure your AI client is configured to use "Figma MCP Server by Bao To" (as shown in the "Getting Started" section).
    *   If your AI agent supports choosing between multiple MCP servers or if you're prompting it more generally, you might need to explicitly state: *"Use the 'Figma MCP Server by Bao To' for Figma tasks."* or refer to its npm package name: *"Use the MCP server `@tothienbao6a0/figma-mcp-server`."*

2.  **Request Specific Tools**:
    *   To get basic Figma data: *"Get the Figma data for [Figma link]."* (The agent will likely use `get_figma_data`).
    *   **To generate design tokens**: *"Generate the design tokens for [Figma link] using the 'Figma MCP Server by Bao To'."* The agent should then call the `generate_design_tokens` tool.
    *   **To generate design system documentation**: *"Generate the design system documentation for [Figma link] using the 'Figma MCP Server by Bao To'."* The agent should then call the `generate_design_system_doc` tool.

3.  **Provide Necessary Parameters**:
    *   **`fileKey`**: Always provide the Figma file link. The agent and server can extract the `fileKey`.
    *   **`outputDirectoryPath` (for `generate_design_system_doc`) / `outputFilePath` (for `generate_design_tokens`)**:
        *   These tools allow you to specify where the generated files should be saved.
        *   If you want the documentation or tokens to be saved directly into your current project (e.g., in a `/docs` or `/tokens` folder), tell your agent:
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
