<div align="center">
  <h1>Bao ToによるFigma MCPサーバー</h1>
  <h2>Figmaファイルから完全なデザインシステムを生成し、デザイン仕様に準拠したコンポーネントを構築</h2>
  <p>
    - Figmaファイルから自動的にデザインシステムを生成し、セマンティックトークンを抽出<br/>
    - 完全なデザインシステムまたは個別フレーム選択からコンポーネントを構築<br/>
    - Figmaデザインと完全に一致するピクセルパーフェクトな実装を実現<br/>
    - 包括的なデザインドキュメントを自動生成
  </p>
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

> **注:** このサーバーは、元の[Framelink Figma MCPサーバー](https://www.npmjs.com/package/figma-developer-mcp)のフォークであり、AI駆動の設計ワークフローのための強化された機能を提供するためにその基盤の上に構築されています。元のFramelinkチームの基礎的な作業に感謝し、敬意を表します。

[Cursor](https://cursor.sh/)などのAI搭載コーディングツールに、この[Model Context Protocol](https://modelcontextprotocol.io/introduction)サーバーである**Bao ToによるFigma MCPサーバー**を通じてFigmaファイルへのアクセスを提供します。

CursorがFigmaデザインデータにアクセスできる場合、スクリーンショットを貼り付けるなどの代替アプローチよりも**はるかに**正確にワンショットでデザインを実装できます。

<!-- クイックスタートガイドへのリンクは、必要に応じて更新または削除してください -->
<!-- <h3><a href="https://www.framelink.ai/docs/quickstart?utm_source=github&utm_medium=readme&utm_campaign=readme">クイックスタートガイドを見る →</a></h3> -->

## デモ

[FigmaデザインデータでCursorでUIを構築するデモを見る](https://youtu.be/4I4Zs2zg1Oo)

[![ビデオを見る](https://img.youtube.com/vi/4I4Zs2zg1Oo/maxresdefault.jpg)](https://youtu.be/4I4Zs2zg1Oo)

## 仕組み

1. IDEのチャットを開きます（例：Cursorのエージェントモード）。
2. Figmaファイル、フレーム、またはグループへのリンクを貼り付けます。
3. AIエージェントにFigmaファイルで何かをするように依頼します（例：デザインの実装）。
4. **Bao ToによるFigma MCPサーバー**を使用するように設定されたAIエージェントは、このサーバーを介してFigmaから関連するメタデータを取得し、コードを書くために使用します。

このMCPサーバーは、[Figma API](https://www.figma.com/developers/api)からの応答を簡素化および変換して、モデルに最も関連性の高いレイアウトおよびスタイル情報のみが提供されるように設計されています。

モデルに提供されるコンテキストの量を減らすことは、AIの精度を高め、応答をより関連性の高いものにするのに役立ちます。

## プラン制限

⚠️ **Figma Variables APIに関する重要な注意事項**

`get_figma_variables` 機能は **Figma Enterprise プラン** が必要です。この制限は、このMCPサーバーではなく、Figmaによって課されています：

- ✅ **すべてのプランで利用可能**: `get_figma_data`, `download_figma_images`, `generate_design_tokens`, `generate_design_system_doc`
- ❌ **Enterprise専用**: `get_figma_variables` (Variables REST API アクセス)

**この制限が存在する理由:**
- FigmaはVariables APIアクセスをEnterpriseプランのみに制限しています
- Starter、Professional、またはOrganizationプランのユーザーは `403 Forbidden` エラーを受け取ります
- これはEnterpriseの売上を促進するためのFigmaのビジネス判断です

**非Enterpriseユーザーのための代替案:**
- `generate_design_tokens` を使用 - デザインから類似のスタイリング情報を抽出します
- FigmaのPlugin APIを使用（カスタムプラグインの構築が必要）
- Figma UIから手動で変数をエクスポート

詳細については、[プラン機能に関するFigmaの公式ドキュメント](https://help.figma.com/hc/en-us/articles/360040328273-Figma-plans-and-features)をご覧ください。

## 主な機能と利点

他のFigma MCPサーバーは基本的なノード情報を提供できますが、**Bao ToによるFigma MCPサーバー**はデザインシステムを理解し活用するための優れた機能を提供します。

*   **包括的なデザインデータ抽出 (`get_figma_data`)**: Figmaファイルまたは特定のノードに関する詳細情報を取得し、複雑なFigma構造をAIにとってより理解しやすい形式に簡素化します。
*   **正確な画像ダウンロード (`download_figma_images`)**: Figmaファイルから特定の画像アセット（SVG、PNG）を選択的にダウンロードできます。
*   ⭐ **Figma Variables抽出 (`get_figma_variables`)** ⚠️ **Figma Enterprise プラン必須**:
    *   FigmaのVariables APIを使用して、Figmaファイルからすべての変数と変数コレクションを直接取得します。
    *   **⚠️ 重要**: この機能は **Figma Enterprise プラン** でのみ動作します。Starter、Professional、またはOrganizationプランのユーザーは、REST APIを介して変数にアクセスしようとすると403 Forbiddenエラーを受け取ります。
    *   Variablesは、異なるモード/テーマで色、数値、文字列、ブール値を格納できるFigmaの動的値システムです。
    *   デザイントークンとの違い: Variablesは動的でモード認識値を作成するための特定のFigma機能であり、デザイントークンはデザインから抽出されたスタイル値です。
    *   ローカル変数（ファイル内のすべての変数）と公開変数（チームライブラリに公開された変数）の両方をサポートします。
    *   変数コレクション、モード、各モードの値を示す構造化データを出力します。
    *   **代替案**: 非Enterpriseユーザーの場合、すべてのFigmaプランで動作する類似のスタイリング情報を抽出する `generate_design_tokens` 機能を使用してください。
*   ⭐ **自動デザイン-トークン生成 (`generate_design_tokens`)**:
    *   Figmaファイルから直接、重要なデザイン-トークン（色、タイポグラフィ、スペーシング、エフェクト）を抽出します。
    *   構造化されたJSONファイルを出力し、開発ワークフローに統合したり、AIがデザインの一貫性を確保するために使用したりできます。
*   ⭐ **インテリジェントなデザインシステムドキュメント生成 (`generate_design_system_doc`)**:
    *   単純なノードデータを越えて、Figmaで定義されたデザインシステム全体のための包括的な複数ファイルのMarkdownドキュメントを生成します。
    *   概要、グローバルスタイル（色、タイポグラフィ、エフェクト、レイアウト）の詳細ページ、およびFigmaキャンバスごとのコンポーネント/ノード情報を含む整理された構造を作成します。
    *   このツールは、このフォークの主要な動機でした。この包括的なデザインシステムドキュメントを*プロジェクトリポジトリ内に直接*生成することにより、AIエージェントにプロジェクト固有のデザイン言語に関する深い文脈的理解を提供します。これにより、AIエージェントは個々の要素だけでなく、デザインシステムの関連性やルールを理解し、より正確で一貫性のある、文脈を意識したUI実装を可能にし、手動でのデザイン解釈から解放されます。

これらの高度な機能により、このサーバーは、テーマコンポーネントの生成やUI開発中のブランドガイドラインへの準拠の確保など、デザインシステムの深い理解を必要とするタスクに特に強力です。

## このサーバーをAIエージェントで使用する

**Bao ToによるFigma MCPサーバー**の全機能、特にデザインシステム生成ツールを活用するには、AIエージェント（Cursorなど）を効果的にガイドする必要があります。方法は次のとおりです。

1.  **このサーバーを指定する**:
    *   タスクを開始するときは、AIクライアントが「Bao ToによるFigma MCPサーバー」を使用するように設定されていることを確認してください（「はじめに」セクションを参照）。
    *   AIエージェントが複数のMCPサーバーから選択できる場合や、より一般的にプロンプトを表示する場合は、明示的に次のように述べる必要がある場合があります：*「Figmaタスクには 'Bao ToによるFigma MCPサーバー' を使用してください。」* または、npmパッケージ名を参照してください：*「MCPサーバー `@tothienbao6a0/figma-mcp-server` を使用してください。」*

2.  **特定のツールを要求する**:
    *   基本的なFigmaデータを取得するには：*「[Figmaリンク]のFigmaデータを取得してください。」*（エージェントは `get_figma_data` を使用する可能性が高いです）。
    *   **Figma variablesを取得するには** ⚠️ **Enterprise専用**: *「'Bao ToによるFigma MCPサーバー' を使用して [Figmaリンク] から変数を取得してください。」* これによりエージェントは `get_figma_variables` ツールを呼び出す必要があります。**注**: これはFigma Enterpriseプランでのみ動作します。
    *   **デザイン-トークンを生成するには**: *「'Bao ToによるFigma MCPサーバー' を使用して [Figmaリンク] のデザイン-トークンを生成してください。」* これにより、エージェントは `generate_design_tokens` ツールを呼び出す必要があります。
    *   **デザインシステムドキュメントを生成するには**: *「'Bao ToによるFigma MCPサーバー' を使用して [Figmaリンク] のデザインシステムドキュメントを生成してください。」* これにより、エージェントは `generate_design_system_doc` ツールを呼び出す必要があります.

3.  **必要なパラメータを提供する**:
    *   **`fileKey`**: 常にFigmaファイルリンクを提供してください。エージェントとサーバーは `fileKey` を抽出できます。
    *   **`outputDirectoryPath` (`generate_design_system_doc` の場合) / `outputFilePath` (`generate_design_tokens` の場合)**:
        *   これらのツールを使用すると、生成されたファイルを保存する場所を指定できます。
        *   ドキュメントやトークンを現在のプロジェクトに直接保存する場合（例：`/docs` または `/tokens` フォルダ）、エージェントに次のように指示します：
            *   *「[Figmaリンク] のデザインシステムドキュメントを生成し、現在のプロジェクトの `docs/design_system` フォルダに保存してください。」*
            *   *「[Figmaリンク] のデザイン-トークンを生成し、JSONファイルを現在のプロジェクトの `src/style-guide` フォルダに `design-tokens.json` として保存してください。」*
        *   その後、AIエージェントはプロジェクトのサブフォルダへの絶対パスを決定し、それぞれのツールを呼び出すときに `outputDirectoryPath` または `outputFilePath` として提供する必要があります。
        *   パスを指定しない場合、これらのツールは出力をシステムの一時ディレクトリに保存し（ドキュメント化されたデフォルトの動作に従って）、エージェントにそのパスを通知します。その後、エージェントはファイルの取得を支援できます。

**エージェントへのプロンプト例:**

> 「AIさん、Bao ToによるFigma MCPサーバーを使用して `https://www.figma.com/design/yourFileKey/Your-Project-Name` の完全なデザインシステムドキュメントを生成してください。出力は、現在のプロジェクトのルートディレクトリ内に `figma_docs` という名前の新しいフォルダに保存したいです。」

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

## 生成されたデザインシステムをより読みやすくする

このMCPサーバーを使用してデザイントークンとドキュメントを生成する際、Figmaの内部ID（例：`fill-hxq15en`）がシステムの保守を困難にする可能性があります。生成されたデザインシステムのドキュメントは広範で、内部IDが複数のファイルとセクションにまたがっています。以下は、これらのIDをすべて意味のあるトークンに変換するワークフローです：

### セマンティックマッピングワークフロー

1. **初期デザインシステムの生成**
   - MCPサーバーを使用して初期デザイントークンとドキュメントを生成
   - Figmaの内部IDを含む複数のファイルが得られます：
     * デザイントークンJSON
     * CSS変数
     * コンポーネントドキュメント
     * スタイルガイド
     * 使用例

2. **カラーシステムのスクリーンショット準備**
   - Figmaでカラースタイルページに移動
   - 以下を示す明確なスクリーンショットを撮ります：
     * すべてのカラースウォッチ
     * カラー名と値
     * カラーのグループ化/階層
   - 参照用にスクリーンショットを保存

3. **AIを使用した包括的なセマンティックマッピングの生成**
   - Cursorでカラーシステムのスクリーンショットを共有
   - AIに包括的なマッピングの実行を依頼
   - プロンプト例：
     ```
     "Figmaカラーシステムのスクリーンショットと生成されたデザインシステムファイルがあります。
     ドキュメント全体の内部IDのすべてのインスタンスに対するセマンティックマッピングを作成してください：
     1. まず、画像のカラーシステムを分析して各カラーのセマンティックな意味を理解
     2. 生成されたすべてのファイルを検索して各内部IDのすべてのインスタンスを見つける
     3. IDとセマンティック名の間の完全なマッピングを作成
     4. 以下のすべての項目でのすべての出現を更新：
        - トークンファイル
        - CSS変数
        - コンポーネントドキュメント
        - 使用例
        - スタイルガイド
     5. デザインシステム全体での一貫性を確保
     6. 以下を含む追加ドキュメントを生成：
        - セマンティックトークンの使用ガイドライン
        - 異なるコンテキスト（コンポーネント、テーマ）の例
        - 実装のベストプラクティス
        - 一般的なパターンと組み合わせ
        - アクセシビリティの考慮事項"
     ```
   - AIは以下を実行します：
     * カラーシステムを視覚的に分析
     * 各IDのすべてのインスタンスを検索
     * 包括的なマッピングを作成
     * すべてのファイルのすべての出現を更新
     * 全体的な一貫性を維持
     * サポートドキュメントを生成

4. **生成されるファイル**
   AIはすべての関連ファイルを生成/更新します：
   - `token-mapping.json` - IDからセマンティック名への完全なマッピング
   - `design_variables.css` - 更新されたCSS変数
   - セマンティック名を含むすべてのドキュメントファイル
   - 新しいトークン名を持つコンポーネント例
   - セマンティック参照を含むスタイルガイド

### 包括的な変換例

変換前（複数のファイルにまたがる）：
```css
/* design_variables.css */
--fill-hxq15en: #556AEB;
--stroke-heus4w0: #B9C4FF;

/* component_examples.md */
プライマリアクションには `var(--fill-hxq15en)` を使用
ボーダー: 1px solid var(--stroke-heus4w0)

/* style_guide.md */
| fill-hxq15en | プライマリブルー | #556AEB |
```
変換後：
```css
/* design_variables.css */
--color-primary-500: #556AEB;
--stroke-primary-light: #B9C4FF;

/* component_examples.md */
プライマリアクションには `var(--color-primary-500)` を使用
ボーダー: 1px solid var(--stroke-primary-light)

/* style_guide.md */
| color-primary-500 | プライマリブルー | #556AEB |
```

### ベストプラクティス

1. **カラーシステムのスクリーンショット**
   - すべてのカラーが表示されていることを確認
   - 完全な命名体系を含める
   - カラーの階層全体を表示
   - 使用ガイドラインをキャプチャ

2. **セマンティックな命名**
   - 一貫した、目的ベースの名前を使用
   - 明確な命名階層に従う
   - カラー間の関係を文書化
   - 使用コンテキストを含める

3. **包括的な更新**
   - すべてのインスタンスが更新されていることを確認
   - すべてのドキュメントファイルを確認
   - すべてのコンポーネント例をレビュー
   - すべての参照を検証

4. **メンテナンス**
   - スクリーンショットを最新の状態に保つ
   - 必要に応じて完全なマッピングを再実行
   - すべてのファイルでの一貫性を確認
   - 手動オーバーライドを文書化

AIは、開発者がセマンティックトークンを正しく使用できるように、使用ガイドラインと様々なコンテキスト（コンポーネント、テーマなど）の例を含む追加ドキュメントも生成します。

## 貢献

