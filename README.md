<div align="center">
  <h1>Figma MCP Server by Bao To</h1>
  <p>
    🌐 Available in:
    <a href="README.ko.md">한국어 (Korean)</a> |
    <a href="README.ja.md">日本語 (Japanese)</a> |
    <a href="README.zh.md">中文 (Chinese)</a>
  </p>
  <h3>Give your coding agent access to your Figma data.<br/>Implement designs in any framework in one-shot.</h3>
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
