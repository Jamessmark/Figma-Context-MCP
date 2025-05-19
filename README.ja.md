<div align="center">
  <h1>Bao ToによるFigma MCPサーバー</h1>
  <p>
    🌐 他の言語で利用可能:
    <a href="README.md">English</a> |
    <a href="README.ko.md">한국어 (Korean)</a> |
    <a href="README.ja.md">日本語</a> |
    <a href="README.zh.md">中文 (Chinese)</a> |
    <a href="README.es.md">Español (Spanish)</a> |
    <a href="README.vi.md">Tiếng Việt (Vietnamese)</a> |
    <a href="README.fr.md">Français (French)</a>
  </p>
  <h3>AIコーディングエージェントに直接Figmaアクセスを。<br/>プロジェクトにデザインシステムとトークンを生成し、UIを一度に実装します。</h3>
  <a href="https://npmcharts.com/compare/@tothienbao6a0/figma-mcp-server?interval=30">
    <img alt="週間ダウンロード数" src="https://img.shields.io/npm/dm/@tothienbao6a0/figma-mcp-server.svg">
  </a>
  <a href="https://github.com/tothienbao6a0/Figma-Context-MCP/blob/main/LICENSE">
    <img alt="MITライセンス" src="https://img.shields.io/github/license/tothienbao6a0/Figma-Context-MCP" />
  </a>
  <!-- Discordやソーシャルメディアのリンクがあれば追加、なければ削除 -->
  <!-- <a href="https://framelink.ai/discord">
    <img alt="Discord" src="https://img.shields.io/discord/1352337336913887343?color=7389D8&label&logo=discord&logoColor=ffffff" />
  </a> -->
  <br />
  <!-- Twitterやソーシャルメディアのリンクがあれば追加、なければ削除 -->
  <!-- <a href="https://twitter.com/glipsman">
    <img alt="Twitter" src="https://img.shields.io/twitter/url?url=https%3A%2F%2Fx.com%2Fglipsman&label=%40glipsman" />
  </a> -->
</div>

<br/>

> **注:** このサーバーは、元のFramelink Figma MCPサーバーのフォークであり、AI駆動の設計ワークフローのための強化された機能を提供するためにその基盤の上に構築されています。元のFramelinkチームの基礎的な作業に感謝し、敬意を表します。

[Cursor](https://cursor.sh/)などのAI搭載コーディングツールに、この[Model Context Protocol](https://modelcontextprotocol.io/introduction)サーバーである**Bao ToによるFigma MCPサーバー**を通じてFigmaファイルへのアクセスを提供します。

CursorがFigmaデザインデータにアクセスできる場合、スクリーンショットを貼り付けるなどの代替アプローチよりも**はるかに**正確にワンショットでデザインを実装できます。

<!-- クイックスタートガイドへのリンクは、必要に応じて更新または削除してください -->
<!-- <h3><a href="https://www.framelink.ai/docs/quickstart?utm_source=github&utm_medium=readme&utm_campaign=readme">クイックスタートガイドを見る →</a></h3> -->

## デモ

[FigmaデザインデータでCursorでUIを構築するデモを見る](https://youtu.be/q4eN7CPo_gE)

[![ビデオを見る](https://img.youtube.com/vi/q4eN7CPo_gE/maxresdefault.jpg)](https://youtu.be/q4eN7CPo_gE)

## 仕組み

1. IDEのチャットを開きます（例：Cursorのエージェントモード）。
2. Figmaファイル、フレーム、またはグループへのリンクを貼り付けます。
3. AIエージェントにFigmaファイルで何かをするように依頼します（例：デザインの実装）。
4. **Bao ToによるFigma MCPサーバー**を使用するように設定されたAIエージェントは、このサーバーを介してFigmaから関連するメタデータを取得し、コードを書くために使用します。

このMCPサーバーは、[Figma API](https://www.figma.com/developers/api)からの応答を簡素化および変換して、モデルに最も関連性の高いレイアウトおよびスタイル情報のみが提供されるように設計されています。

モデルに提供されるコンテキストの量を減らすことは、AIの精度を高め、応答をより関連性の高いものにするのに役立ちます。

## 主な機能と利点

他のFigma MCPサーバーは基本的なノード情報を提供できますが、**Bao ToによるFigma MCPサーバー**はデザインシステムを理解し活用するための優れた機能を提供します。

*   **包括的なデザインデータ抽出 (`get_figma_data`)**: Figmaファイルまたは特定のノードに関する詳細情報を取得し、複雑なFigma構造をAIにとってより理解しやすい形式に簡素化します。
*   **正確な画像ダウンロード (`download_figma_images`)**: Figmaファイルから特定の画像アセット（SVG、PNG）を選択的にダウンロードできます。
*   ⭐ **自動デザイン-トークン生成 (`generate_design_tokens`)**:
    *   Figmaファイルから直接、重要なデザイン-トークン（色、タイポグラフィ、スペーシング、エフェクト）を抽出します。
    *   構造化されたJSONファイルを出力し、開発ワークフローに統合したり、AIがデザインの一貫性を確保するために使用したりできます。
*   ⭐ **インテリジェントなデザインシステムドキュментация (`generate_design_system_doc`)**:
    *   単純なノードデータを越えて、Figmaで定義されたデザインシステム全体のための包括的な複数ファイルのMarkdownドキュментацияを生成します。
    *   概要、グローバルスタイル（色、タイポグラフィ、エフェクト、レイアウト）の詳細ページ、およびFigmaキャンバスごとのコンポーネント/ノード情報を含む整理された構造を作成します。
    *   このツールは、このフォークの主要な動機でした。この包括的なデザインシステムドキュментацияを*プロジェクトリポジトリ内に直接*生成することにより、AIエージェントにプロジェクト固有のデザイン言語に関する深い文脈的理解を提供します。これにより、AIエージェントは個々の要素だけでなく、デザインシステムの関連性やルールを理解し、より正確で一貫性のある、文脈を意識したUI実装を可能にし、手動でのデザイン解釈から解放されます。

これらの高度な機能により、このサーバーは、テーマコンポーネントの生成やUI開発中のブランドガイドラインへの準拠の確保など、デザインシステムの深い理解を必要とするタスクに特に強力です。

## このサーバーをAIエージェントで使用する

**Bao ToによるFigma MCPサーバー**の全機能、特にデザインシステム生成ツールを活用するには、AIエージェント（Cursorなど）を効果的にガイドする必要があります。方法は次のとおりです。

1.  **このサーバーを指定する**:
    *   タスクを開始するときは、AIクライアントが「Bao ToによるFigma MCPサーバー」を使用するように設定されていることを確認してください（「はじめに」セクションを参照）。
    *   AIエージェントが複数のMCPサーバーから選択できる場合や、より一般的にプロンプトを表示する場合は、明示的に次のように述べる必要がある場合があります：*「Figmaタスクには 'Bao ToによるFigma MCPサーバー' を使用してください。」* または、npmパッケージ名を参照してください：*「MCPサーバー `@tothienbao6a0/figma-mcp-server` を使用してください。」*

2.  **特定のツールを要求する**:
    *   基本的なFigmaデータを取得するには：*「[Figmaリンク]のFigmaデータを取得してください。」*（エージェントは `get_figma_data` を使用する可能性が高いです）。
    *   **デザイン-トークンを生成するには**: *「'Bao ToによるFigma MCPサーバー' を使用して [Figmaリンク] のデザイン-トークンを生成してください。」* これにより、エージェントは `generate_design_tokens` ツールを呼び出す必要があります。
    *   **デザインシステムドキュментацияを生成するには**: *「'Bao ToによるFigma MCPサーバー' を使用して [Figmaリンク] のデザインシステムドキュментацияを生成してください。」* これにより、エージェントは `generate_design_system_doc` ツールを呼び出す必要があります。

3.  **必要なパラメータを提供する**:
    *   **`fileKey`**: 常にFigmaファイルリンクを提供してください。エージェントとサーバーは `fileKey` を抽出できます。
    *   **`outputDirectoryPath` (`generate_design_system_doc` の場合) / `outputFilePath` (`generate_design_tokens` の場合)**:
        *   これらのツールを使用すると、生成されたファイルを保存する場所を指定できます。
        *   ドキュментацияやトークンを現在のプロジェクトに直接保存する場合（例：`/docs` または `/tokens` フォルダ）、エージェントに次のように指示します：
            *   *「[Figmaリンク] のデザインシステムドキュментацияを生成し、現在のプロジェクトの `docs/design_system` フォルダに保存してください。」*
            *   *「[Figmaリンク] のデザイン-トークンを生成し、JSONファイルを現在のプロジェクトの `src/style-guide` フォルダに `design-tokens.json` として保存してください。」*
        *   その後、AIエージェントはプロジェクトのサブフォルダへの絶対パスを決定し、それぞれのツールを呼び出すときに `outputDirectoryPath` または `outputFilePath` として提供する必要があります。
        *   パスを指定しない場合、これらのツールは出力をシステムの一時ディレクトリに保存し（ドキュメント化されたデフォルトの動作に従って）、エージェントにそのパスを通知します。その後、エージェントはファイルの取得を支援できます。

**エージェントへのプロンプト例:**

> 「AIさん、Bao ToによるFigma MCPサーバーを使用して `https://www.figma.com/design/yourFileKey/Your-Project-Name` の完全なデザインシステムドキュментацияを生成してください。出力は、現在のプロジェクトのルートディレクトリ内に `figma_docs` という名前の新しいフォルダに保存したいです。」

具体的に指示することで、AIエージェントがこのサーバーに対して正しいパラメータで正しいツールコールを行うのを助け、開発ワークフローの高度な機能を活用できます。

## はじめに

多くのコードエディタやその他のAIクライアントは、MCPサーバーを管理するために設定ファイルを使用します。

`@tothienbao6a0/figma-mcp-server`サーバーは、以下を設定ファイルに追加することで設定できます。

> 注：このサーバーを使用するには、Figmaアクセストークンを作成する必要があります。Figma APIアクセストークンの作成方法については[こちら](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens)をご覧ください。

### MacOS / Linux

```json
{
  "mcpServers": {
    "Bao ToによるFigma MCPサーバー": {
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
    "Bao ToによるFigma MCPサーバー": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@tothienbao6a0/figma-mcp-server", "--figma-api-key=YOUR-KEY", "--stdio"]
    }
  }
}
```

これにより、`npx` を使用してnpmから `@tothienbao6a0/figma-mcp-server` パッケージがダウンロードおよび実行されます。`-y` フラグは `npx` からのすべてのプロンプトに自動的に同意します。

あるいは、最初にパッケージをグローバルにインストールすることもできます（ただし、CLIツールでは、グローバルインストールなしで最新バージョンを使用するために `npx` が推奨されることがよくあります）。
```bash
npm install -g @tothienbao6a0/figma-mcp-server
```
そして、クライアントが `@tothienbao6a0/figma-mcp-server` を直接コマンドとして使用するように設定します。
