<div align="center">
  <h1>Bao To의 Figma MCP 서버</h1>
  <p>
    🌐 다른 언어:
    <a href="README.md">English</a> |
    <a href="README.ko.md">한국어</a> |
    <a href="README.ja.md">日本語 (Japanese)</a> |
    <a href="README.zh.md">中文 (Chinese)</a> |
    <a href="README.es.md">Español (Spanish)</a> |
    <a href="README.vi.md">Tiếng Việt (Vietnamese)</a> |
    <a href="README.fr.md">Français (French)</a>
  </p>
  <h3>AI 코딩 에이전트에게 직접적인 Figma 액세스 권한을 부여하세요.<br/>프로젝트에 디자인 시스템 및 토큰을 생성하고, UI를 한 번에 구현하세요.</h3>
  <a href="https://npmcharts.com/compare/@tothienbao6a0/figma-mcp-server?interval=30">
    <img alt="주간 다운로드" src="https://img.shields.io/npm/dm/@tothienbao6a0/figma-mcp-server.svg">
  </a>
  <a href="https://github.com/tothienbao6a0/Figma-Context-MCP/blob/main/LICENSE">
    <img alt="MIT 라이선스" src="https://img.shields.io/github/license/tothienbao6a0/Figma-Context-MCP" />
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

> **참고:** 이 서버는 원래 Framelink Figma MCP 서버의 포크이며, AI 기반 디자인 워크플로우를 위한 향상된 기능을 제공하기 위해 해당 기반 위에 구축되었습니다. 저희는 원래 Framelink 팀의 기초 작업에 대해 인정하고 감사드립니다.

[Cursor](https://cursor.sh/) 및 기타 AI 기반 코딩 도구에 이 [Model Context Protocol](https://modelcontextprotocol.io/introduction) 서버인 **Bao To의 Figma MCP 서버**를 통해 Figma 파일에 대한 접근 권한을 부여하세요.

Cursor가 Figma 디자인 데이터에 접근할 수 있을 때, 스크린샷을 붙여넣는 것과 같은 대안적인 접근 방식보다 훨씬 더 정확하게 디자인을 구현할 수 있습니다.

## 데모

[Figma 디자인 데이터로 Cursor에서 UI를 구축하는 데모 시청](https://youtu.be/q4eN7CPo_gE)

[![비디오 시청](https://img.youtube.com/vi/q4eN7CPo_gE/maxresdefault.jpg)](https://youtu.be/q4eN7CPo_gE)

## 작동 방식

1. IDE의 채팅을 엽니다 (예: Cursor의 에이전트 모드).
2. Figma 파일, 프레임 또는 그룹에 대한 링크를 붙여넣습니다.
3. AI 에이전트에게 Figma 파일로 무언가를 하도록 요청합니다 (예: 디자인 구현).
4. **Bao To의 Figma MCP 서버**를 사용하도록 구성된 AI 에이전트는 이 서버를 통해 Figma에서 관련 메타데이터를 가져와 코드를 작성하는 데 사용합니다.

이 MCP 서버는 [Figma API](https://www.figma.com/developers/api)의 응답을 단순화하고 변환하여 모델에 가장 관련성이 높은 레이아웃 및 스타일링 정보만 제공하도록 설계되었습니다.

모델에 제공되는 컨텍스트의 양을 줄이면 AI의 정확도를 높이고 응답을 더 관련성 있게 만드는 데 도움이 됩니다.

## 주요 기능 및 장점

다른 Figma MCP 서버는 기본적인 노드 정보를 제공할 수 있지만, **Bao To의 Figma MCP 서버**는 디자인 시스템을 이해하고 활용하는 데 있어 뛰어난 기능을 제공합니다:

*   **포괄적인 디자인 데이터 추출 (`get_figma_data`)**: Figma 파일 또는 특정 노드에 대한 자세한 정보를 가져와 복잡한 Figma 구조를 AI가 이해하기 쉬운 형식으로 단순화합니다.
*   **정확한 이미지 다운로드 (`download_figma_images`)**: Figma 파일에서 특정 이미지 에셋(SVG, PNG)을 선택적으로 다운로드할 수 있습니다.
*   ⭐ **자동화된 디자인 토큰 생성 (`generate_design_tokens`)**:
    *   Figma 파일에서 직접 중요한 디자인 토큰(색상, 타이포그래피, 간격, 효과)을 추출합니다.
    *   구조화된 JSON 파일을 출력하여 개발 워크플로우에 통합하거나 AI가 디자인 일관성을 보장하는 데 사용할 수 있도록 합니다.
*   ⭐ **지능형 디자인 시스템 문서화 (`generate_design_system_doc`)**:
    *   단순한 노드 데이터를 넘어 Figma에 정의된 전체 디자인 시스템에 대한 포괄적인 다중 파일 Markdown 문서를 생성합니다.
    *   개요, 글로벌 스타일(색상, 타이포그래피, 효과, 레이아웃)에 대한 상세 페이지, Figma 캔버스별 컴포넌트/노드 정보를 포함하는 체계적인 구조를 만듭니다.
    *   이 도구는 이 포크의 핵심 동기였습니다. 이 포괄적인 디자인 시스템 문서를 *프로젝트 저장소 내에 직접* 생성함으로써 AI 에이전트에게 프로젝트의 특정 디자인 언어에 대한 깊이 있는 문맥적 이해를 제공합니다. 이를 통해 AI 에이전트는 개별 요소뿐만 아니라 디자인 시스템의 관계와 규칙을 이해하여 더 정확하고 일관되며 문맥을 고려한 UI 구현을 가능하게 하고 수동적인 디자인 해석으로부터 자유롭게 해줍니다.

이러한 고급 기능은 테마 컴포넌트 생성 또는 UI 개발 중 브랜드 가이드라인 준수 보장과 같이 디자인 시스템에 대한 깊은 이해가 필요한 작업에 이 서버를 특히 강력하게 만듭니다.

## AI 에이전트와 함께 이 서버 사용하기

**Bao To의 Figma MCP 서버**의 모든 기능, 특히 디자인 시스템 생성 도구를 활용하려면 AI 에이전트(예: Cursor)를 효과적으로 안내해야 합니다. 방법은 다음과 같습니다:

1.  **이 서버 지정**:
    *   작업을 시작할 때 AI 클라이언트가 "Bao To의 Figma MCP 서버"를 사용하도록 구성되어 있는지 확인하십시오("시작하기" 섹션 참조).
    *   AI 에이전트가 여러 MCP 서버 중에서 선택할 수 있거나 더 일반적으로 프롬프트를 표시하는 경우, 명시적으로 다음과 같이 말해야 할 수 있습니다: *"Figma 작업에는 'Bao To의 Figma MCP 서버'를 사용하십시오."* 또는 npm 패키지 이름을 참조하십시오: *"MCP 서버 `@tothienbao6a0/figma-mcp-server`를 사용하십시오."*

2.  **특정 도구 요청**:
    *   기본 Figma 데이터를 얻으려면: *"[Figma 링크]에 대한 Figma 데이터를 가져오십시오."* (에이전트는 `get_figma_data`를 사용할 가능성이 높습니다).
    *   **디자인 토큰을 생성하려면**: *"'Bao To의 Figma MCP 서버'를 사용하여 [Figma 링크]에 대한 디자인 토큰을 생성하십시오."* 그러면 에이전트가 `generate_design_tokens` 도구를 호출해야 합니다.
    *   **디자인 시스템 문서를 생성하려면**: *"'Bao To의 Figma MCP 서버'를 사용하여 [Figma 링크]에 대한 디자인 시스템 문서를 생성하십시오."* 그러면 에이전트가 `