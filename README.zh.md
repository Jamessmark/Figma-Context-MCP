<a href="https://www.framelink.ai/?utm_source=github&utm_medium=readme&utm_campaign=readme" target="_blank" rel="noopener">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://www.framelink.ai/github/HeaderDark.png" />
    <img alt="Framelink" src="https://www.framelink.ai/github/HeaderLight.png" />
  </picture>
</a>

<div align="center">
  <h1>Bao To 的 Figma MCP 服务器</h1>
  <h2>从 Figma 文件生成完整设计系统，构建符合设计规范的组件</h2>
  <p>
    🎨 从 Figma 文件自动生成设计系统并提取语义化令牌<br/>
    🤖 从完整设计系统或单个框架选择构建组件<br/>
    🎯 实现与 Figma 设计完全匹配的像素级完美实现<br/>
    📚 自动生成全面的设计文档
  </p>
  <p>
    🌐 可用语言:
    <a href="README.md">English</a> |
    <a href="README.ko.md">한국어 (Korean)</a> |
    <a href="README.ja.md">日本語 (Japanese)</a> |
    <a href="README.zh.md">中文</a> |
    <a href="README.es.md">Español (Spanish)</a> |
    <a href="README.vi.md">Tiếng Việt (Vietnamese)</a> |
    <a href="README.fr.md">Français (French)</a>
  </p>
  <h3>为您的 AI 编码代理提供直接 Figma 访问权限。<br/>将设计系统和令牌生成到您的项目中，并一次性实现 UI。</h3>
  <a href="https://npmcharts.com/compare/@tothienbao6a0/figma-mcp-server?interval=30">
    <img alt="每周下载" src="https://img.shields.io/npm/dm/@tothienbao6a0/figma-mcp-server.svg">
  </a>
  <a href="https://github.com/tothienbao6a0/Figma-Context-MCP/blob/main/LICENSE">
    <img alt="MIT 许可证" src="https://img.shields.io/github/license/tothienbao6a0/Figma-Context-MCP" />
  </a>
  <!-- 如果您有 Discord 或社交媒体链接，请在此处添加，否则请删除 -->
  <!-- <a href="https://framelink.ai/discord">
    <img alt="Discord" src="https://img.shields.io/discord/1352337336913887343?color=7389D8&label&logo=discord&logoColor=ffffff" />
  </a> -->
  <br />
  <!-- 如果您有 Twitter 或社交媒体链接，请在此处添加，否则请删除 -->
  <!-- <a href="https://twitter.com/glipsman">
    <img alt="Twitter" src="https://img.shields.io/twitter/url?url=https%3A%2F%2Fx.com%2Fglipsman&label=%40glipsman" />
  </a> -->
</div>

<br/>

> **请注意：** 此服务器是原始 [Framelink Figma MCP 服务器](https://www.npmjs.com/package/figma-developer-mcp)的一个分支，在其基础上构建，为 AI 驱动的设计工作流程提供增强功能。我们承认并感谢原始 Framelink 团队的基础性工作。

通过此 [Model Context Protocol](https://modelcontextprotocol.io/introduction) 服务器 **Bao To 的 Figma MCP 服务器**，为 [Cursor](https://cursor.sh/) 和其他 AI 驱动的编码工具提供 Figma 文件访问权限。

当 Cursor 可以访问 Figma 设计数据时，它比粘贴截图等替代方法**更**能一次性准确实现设计。

<!-- 如果需要，请更新或删除快速入门指南的链接 -->
<!-- <h3><a href="https://www.framelink.ai/docs/quickstart?utm_source=github&utm_medium=readme&utm_campaign=readme">查看快速入门指南 →</a></h3> -->

## 演示

[观看使用 Figma 设计数据在 Cursor 中构建 UI 的演示](https://youtu.be/4I4Zs2zg1Oo)

[![观看视频](https://img.youtube.com/vi/4I4Zs2zg1Oo/maxresdefault.jpg)](https://youtu.be/4I4Zs2zg1Oo)

## 工作原理

1. 打开 IDE 的聊天（例如：Cursor 的代理模式）。
2. 粘贴 Figma 文件、框架或组的链接。
3. 要求您的 AI 代理对 Figma 文件执行某些操作（例如：实现设计）。
4. 配置为使用 **Bao To 的 Figma MCP 服务器** 的 AI 代理将通过此服务器从 Figma 获取相关元数据并使用它来编写代码。

此 MCP 服务器旨在简化和翻译来自 [Figma API](https://www.figma.com/developers/api) 的响应，以便仅向 AI 模型提供最相关的布局和样式信息。

减少提供给模型的上下文数量有助于提高 AI 的准确性并使响应更具相关性。

## 计划限制

⚠️ **关于 Figma Variables API 的重要说明**

`get_figma_variables` 功能需要 **Figma Enterprise 计划**。此限制是由 Figma 而非此 MCP 服务器施加的：

- ✅ **所有计划均可使用**: `get_figma_data`, `download_figma_images`, `generate_design_tokens`, `generate_design_system_doc`
- ❌ **仅限 Enterprise**: `get_figma_variables` (Variables REST API 访问)

**存在此限制的原因:**
- Figma 将 Variables API 访问限制为仅限 Enterprise 计划
- Starter、Professional 或 Organization 计划用户将收到 `403 Forbidden` 错误
- 这是 Figma 推动 Enterprise 销售的商业决策

**非 Enterprise 用户的替代方案:**
- 使用 `generate_design_tokens` - 从您的设计中提取类似的样式信息
- 使用 Figma 的 Plugin API（需要构建自定义插件）
- 从 Figma UI 手动导出变量

更多详细信息，请参阅 [Figma 关于计划功能的官方文档](https://help.figma.com/hc/en-us/articles/360040328273-Figma-plans-and-features)。

## 主要特性与优势

虽然其他 Figma MCP 服务器可以提供基本的节点信息，但 **Bao To 的 Figma MCP 服务器** 在理解和利用您的设计系统方面提供了卓越的功能：

*   **全面的设计数据提取 (`get_figma_data`)**: 获取有关您的 Figma 文件或特定节点的详细信息，将复杂的 Figma 结构简化为 AI 更易于理解的格式。
*   **精确的图像下载 (`download_figma_images`)**: 允许从您的 Figma 文件中选择性下载特定的图像资源（SVG、PNG）。
*   ⭐ **Figma Variables 提取 (`get_figma_variables`)** ⚠️ **需要 Figma Enterprise 计划**:
    *   使用 Figma 的 Variables API 直接从您的 Figma 文件中检索所有变量和变量集合。
    *   **⚠️ 重要**: 此功能仅在 **Figma Enterprise 计划** 下运行。Starter、Professional 或 Organization 计划用户在尝试通过 REST API 访问变量时将收到 403 Forbidden 错误。
    *   Variables 是 Figma 的动态值系统，可以在不同模式/主题下存储颜色、数字、字符串和布尔值。
    *   与设计令牌的区别：Variables 是 Figma 特定功能，用于创建动态、模式感知的值，而设计令牌是从设计中提取的样式值。
    *   支持本地变量（文件中的所有变量）和已发布变量（已发布到团队库的变量）。
    *   输出显示变量集合、模式和每个模式值的结构化数据。
    *   **替代方案**: 对于非 Enterprise 用户，请使用 `generate_design_tokens` 功能，它可在所有 Figma 计划中提取类似的样式信息。
*   ⭐ **自动设计令牌生成 (`generate_design_tokens`)**:
    *   直接从您的 Figma 文件中提取关键的设计令牌（颜色、排版、间距、效果）。
    *   输出结构化的 JSON 文件，可随时集成到您的开发工作流程中或由 AI 用于确保设计一致性。
*   ⭐ **智能设计系统文档 (`generate_design_system_doc`)**:
    *   超越简单的节点数据，为 Figma 中定义的整个设计系统生成全面的多文件 Markdown 文档。
    *   创建一个有组织的结构，包括概述、全局样式（颜色、排版、效果、布局）的详细页面以及每个 Figma 画布的组件/节点信息。
    *   这种丰富且结构化的文档使 AI 代理不仅能够理解单个元素，还能理解设计系统的关系和规则，从而实现更准确、更具上下文感知能力的 UI 实现，并将您从手动设计解释中解放出来。

这些高级功能使该服务器在需要深入理解设计系统的任务中特别强大，例如生成主题组件或在 UI 开发过程中确保遵守品牌指南。

## 与您的 AI 代理一起使用此服务器

要充分发挥 **Bao To 的 Figma MCP 服务器** 的全部功能，尤其是其设计系统生成工具，您需要有效地指导您的 AI 代理（如 Cursor）。方法如下：

1.  **指定此服务器**：
    *   开始任务时，请确保您的 AI 客户端已配置为使用"Bao To 的 Figma MCP 服务器"（如"开始使用"部分所示）。
    *   如果您的 AI 代理支持在多个 MCP 服务器之间进行选择，或者如果您正在更笼统地提示它，则可能需要明确说明：*"对 Figma 任务使用'Bao To 的 Figma MCP 服务器'。"* 或引用其 npm 包名称：*"使用 MCP 服务器 `@tothienbao6a0/figma-mcp-server`。"*

2.  **请求特定工具**：
    *   获取基本的 Figma 数据：*"获取 [Figma 链接] 的 Figma 数据。"*（代理可能会使用 `get_figma_data`）。
    *   **获取 Figma variables** ⚠️ **仅限 Enterprise**: *"使用'Bao To 的 Figma MCP 服务器'从 [Figma 链接] 获取变量。"* 然后代理应调用 `get_figma_variables` 工具。**注意**: 这仅在 Figma Enterprise 计划中有效。
    *   **生成设计令牌**：*"使用'Bao To 的 Figma MCP 服务器'为 [Figma 链接] 生成设计令牌。"* 然后，代理应调用 `generate_design_tokens` 工具。
    *   **生成设计系统文档**：*"使用'Bao To 的 Figma MCP 服务器'为 [Figma 链接] 生成设计系统文档。"* 然后，代理应调用 `generate_design_system_doc` 工具。

3.  **提供必要的参数**：
    *   **`fileKey`**：始终提供 Figma 文件链接。代理和服务器可以提取 `fileKey`。
    *   **`outputDirectoryPath`（用于 `generate_design_system_doc`）/ `outputFilePath`（用于 `generate_design_tokens`）**：
        *   这些工具允许您指定生成文件的保存位置。
        *   如果您希望将文档或令牌直接保存到当前项目中（例如，在 `/docs` 或 `/tokens` 文件夹中），请告诉您的代理：
            *   *"为 [Figma 链接] 生成设计系统文档，并将其保存在我当前项目的 `docs/design_system` 文件夹中。"*
            *   *"为 [Figma 链接] 生成设计令牌，并将 JSON 文件另存为 `design-tokens.json` 到我项目的 `src/style-guide` 文件夹中。"*
        *   然后，AI 代理应确定项目子文件夹的绝对路径，并在调用相应工具时将其作为 `outputDirectoryPath` 或 `outputFilePath` 提供。
        *   如果您未指定路径，这些工具会将其输出保存到系统临时目录（根据其记录的默认行为），并且代理将被告知该路径。然后，代理可以帮助您检索文件。

**给代理的示例提示：**

> "嘿 AI，请使用 Bao To 的 Figma MCP 服务器为 `https://www.figma.com/design/yourFileKey/Your-Project-Name` 生成完整的设计系统文档。我希望将输出保存在我当前项目根目录中一个名为 `figma_docs` 的新文件夹中。"

通过具体说明，您可以帮助 AI 代理使用正确的参数对此服务器进行正确的工具调用，从而为您的开发工作流程解锁其高级功能。

## 开始使用

您的 AI 编码客户端（如 Cursor）可以配置为使用此 MCP 服务器。将以下内容添加到客户端的 MCP 服务器配置文件中，并将 `YOUR-KEY` 替换为您的 Figma API 密钥。

> 注意：您需要创建 Figma 访问令牌才能使用此服务器。有关如何创建 Figma API 访问令牌的说明，请参见[此处](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens)。

### MacOS / Linux

```json
{
  "mcpServers": {
    "Bao To 的 Figma MCP 服务器": {
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
    "Bao To 的 Figma MCP 服务器": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@tothienbao6a0/figma-mcp-server", "--figma-api-key=YOUR-KEY", "--stdio"]
    }
  }
}
```

这将使用 `npx` 从 npm 下载并运行 `@tothienbao6a0/figma-mcp-server` 包。`-y` 标志会自动同意 `npx` 的任何提示。

或者，您可以先全局安装该软件包（尽管对于 CLI 工具，通常首选 `npx` 以确保您使用的是最新版本而无需全局安装）：
```bash
npm install -g @tothienbao6a0/figma-mcp-server
```
然后将您的客户端配置为直接使用 `@tothienbao6a0/figma-mcp-server` 作为命令。

## 让生成的设计系统更易读

在使用此 MCP 服务器生成设计令牌和文档时，您会注意到 Figma 的内部 ID（如 `fill-hxq15en`）会使系统难以维护。生成的设计系统文档非常广泛，内部 ID 分散在多个文件和部分中。以下是将所有这些 ID 转换为有意义的令牌的工作流程：

### 语义映射工作流程

1. **生成初始设计系统**
   - 使用 MCP 服务器生成初始设计令牌和文档
   - 您将获得包含 Figma 内部 ID 的多个文件：
     * 设计令牌 JSON
     * CSS 变量
     * 组件文档
     * 样式指南
     * 使用示例

2. **准备颜色系统截图**
   - 在 Figma 中导航到颜色样式页面
   - 拍摄清晰的截图，显示：
     * 所有颜色样本
     * 颜色名称和值
     * 颜色分组/层次结构
   - 保存截图以供参考

3. **使用 AI 创建全面的语义映射**
   - 在 Cursor 中共享颜色系统截图
   - 要求 AI 执行全面映射
   - 示例提示：
     ```
     "我有 Figma 颜色系统的截图和生成的设计系统文件。
     请帮助为整个文档中的所有内部 ID 实例创建语义映射：
     1. 首先分析图像中的颜色系统，了解每种颜色的语义含义
     2. 然后搜索所有生成的文件，找到每个内部 ID 的所有实例
     3. 创建 ID 和语义名称之间的完整映射
     4. 更新以下所有项目中的所有出现：
        - 令牌文件
        - CSS 变量
        - 组件文档
        - 使用示例
        - 样式指南
     5. 确保整个设计系统的一致性
     6. 生成额外文档，包括：
        - 语义令牌使用指南
        - 不同上下文（组件、主题）的示例
        - 实施最佳实践
        - 常见模式和组合
        - 可访问性考虑"
     ```
   - AI 将：
     * 视觉分析颜色系统
     * 搜索每个 ID 的所有实例
     * 创建全面的映射
     * 更新所有文件中的所有出现
     * 保持整体一致性
     * 生成支持文档

4. **生成的文件**
   AI 将创建/更新所有相关文件：
   - `token-mapping.json` - ID 到语义名称的完整映射
   - `design_variables.css` - 更新的 CSS 变量
   - 包含语义名称的所有文档文件
   - 具有新令牌名称的组件示例
   - 包含语义引用的样式指南

### 全面转换示例

转换前（跨多个文件）：
```css
/* design_variables.css */
--fill-hxq15en: #556AEB;
--stroke-heus4w0: #B9C4FF;

/* component_examples.md */
主要操作使用 `var(--fill-hxq15en)`
边框：1px solid var(--stroke-heus4w0)

/* style_guide.md */
| fill-hxq15en | 主要蓝色 | #556AEB |
```

转换后：
```css
/* design_variables.css */
--color-primary-500: #556AEB;
--stroke-primary-light: #B9C4FF;

/* component_examples.md */
主要操作使用 `var(--color-primary-500)`
边框：1px solid var(--stroke-primary-light)

/* style_guide.md */
| color-primary-500 | 主要蓝色 | #556AEB |
```

### 最佳实践

1. **颜色系统截图**
   - 确保所有颜色可见
   - 包含完整的命名系统
   - 显示完整的颜色层次结构
   - 捕获使用指南

2. **语义命名**
   - 使用一致的、基于目的的名称
   - 遵循清晰的命名层次结构
   - 记录颜色之间的关系
   - 包含使用上下文

3. **全面更新**
   - 验证所有实例都已更新
   - 检查所有文档文件
   - 审查所有组件示例
   - 验证所有引用

4. **维护**
   - 保持截图最新
   - 需要时重新运行完整映射
   - 验证所有文件的一致性
   - 记录任何手动覆盖

AI 还将生成额外的文档，帮助开发人员正确使用语义令牌，包括使用指南和不同上下文（组件、主题等）的示例。

## 贡献
