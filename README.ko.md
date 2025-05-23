<div align="center">
  <h1>Bao To의 Figma MCP 서버</h1>
  <h2>Figma 파일에서 완벽한 디자인 시스템을 생성하고 디자인 규격을 준수하는 컴포넌트를 구축하세요</h2>
  <p>
    🎨 Figma 파일에서 자동으로 디자인 시스템을 생성하고 시맨틱 토큰을 추출합니다<br/>
    🤖 완전한 디자인 시스템 또는 개별 프레임 선택에서 컴포넌트를 구축합니다<br/>
    🎯 Figma 디자인과 정확히 일치하는 픽셀 퍼펙트 구현을 얻으세요<br/>
    📚 포괄적인 디자인 문서를 자동으로 생성합니다
  </p>
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

> **참고:** 이 서버는 원래 [Framelink Figma MCP 서버](https://www.npmjs.com/package/figma-developer-mcp)의 포크이며, AI 기반 디자인 워크플로우를 위한 향상된 기능을 제공하기 위해 해당 기반 위에 구축되었습니다. 저희는 원래 Framelink 팀의 기초 작업에 대해 인정하고 감사드립니다.

[Cursor](https://cursor.sh/) 및 기타 AI 기반 코딩 도구에 이 [Model Context Protocol](https://modelcontextprotocol.io/introduction) 서버인 **Bao To의 Figma MCP 서버**를 통해 Figma 파일에 대한 접근 권한을 부여하세요.

Cursor가 Figma 디자인 데이터에 접근할 수 있을 때, 스크린샷을 붙여넣는 것과 같은 대안적인 접근 방식보다 훨씬 더 정확하게 디자인을 구현할 수 있습니다.

## 데모

[Figma 디자인 데이터로 Cursor에서 UI를 구축하는 데모 시청](https://youtu.be/4I4Zs2zg1Oo)

[![비디오 시청](https://img.youtube.com/vi/4I4Zs2zg1Oo/maxresdefault.jpg)](https://youtu.be/4I4Zs2zg1Oo)

## 작동 방식

1. IDE의 채팅을 엽니다 (예: Cursor의 에이전트 모드).
2. Figma 파일, 프레임 또는 그룹에 대한 링크를 붙여넣습니다.
3. AI 에이전트에게 Figma 파일로 무언가를 하도록 요청합니다 (예: 디자인 구현).
4. **Bao To의 Figma MCP 서버**를 사용하도록 구성된 AI 에이전트는 이 서버를 통해 Figma에서 관련 메타데이터를 가져와 코드를 작성하는 데 사용합니다.

이 MCP 서버는 [Figma API](https://www.figma.com/developers/api)의 응답을 단순화하고 변환하여 모델에 가장 관련성이 높은 레이아웃 및 스타일링 정보만 제공하도록 설계되었습니다.

모델에 제공되는 컨텍스트의 양을 줄이면 AI의 정확도를 높이고 응답을 더 관련성 있게 만드는 데 도움이 됩니다.

## 플랜 제한사항

⚠️ **Figma Variables API에 대한 중요 안내**

`get_figma_variables` 기능은 **Figma Enterprise 플랜**이 필요합니다. 이 제한은 이 MCP 서버가 아닌 Figma에서 부과한 것입니다:

- ✅ **모든 플랜에서 사용 가능**: `get_figma_data`, `download_figma_images`, `generate_design_tokens`, `generate_design_system_doc`
- ❌ **Enterprise 전용**: `get_figma_variables` (Variables REST API 접근)

**이 제한이 존재하는 이유:**
- Figma는 Variables API 접근을 Enterprise 플랜에서만 제한합니다
- Starter, Professional, 또는 Organization 플랜 사용자는 `403 Forbidden` 오류를 받게 됩니다
- 이는 Enterprise 매출을 촉진하기 위한 Figma의 비즈니스 결정입니다

**비 Enterprise 사용자를 위한 대안:**
- `generate_design_tokens` 사용 - 디자인에서 유사한 스타일링 정보를 추출합니다
- Figma의 Plugin API 사용 (커스텀 플러그인 개발 필요)
- Figma UI에서 수동으로 변수 내보내기

자세한 내용은 [플랜 기능에 대한 Figma 공식 문서](https://help.figma.com/hc/en-us/articles/360040328273-Figma-plans-and-features)를 참조하세요.

## 주요 기능 및 장점

다른 Figma MCP 서버는 기본적인 노드 정보를 제공할 수 있지만, **Bao To의 Figma MCP 서버**는 디자인 시스템을 이해하고 활용하는 데 있어 뛰어난 기능을 제공합니다:

*   **포괄적인 디자인 데이터 추출 (`get_figma_data`)**: Figma 파일 또는 특정 노드에 대한 자세한 정보를 가져와 복잡한 Figma 구조를 AI가 이해하기 쉬운 형식으로 단순화합니다.
*   **정확한 이미지 다운로드 (`download_figma_images`)**: Figma 파일에서 특정 이미지 에셋(SVG, PNG)을 선택적으로 다운로드할 수 있습니다.
*   ⭐ **Figma Variables 추출 (`get_figma_variables`)** ⚠️ **Figma Enterprise 플랜 필요**:
    *   Figma의 Variables API를 사용하여 Figma 파일에서 모든 변수와 변수 컬렉션을 직접 검색합니다.
    *   **⚠️ 중요**: 이 기능은 **Figma Enterprise 플랜**에서만 작동합니다. Starter, Professional, 또는 Organization 플랜 사용자는 REST API를 통해 변수에 접근하려고 할 때 403 Forbidden 오류를 받게 됩니다.
    *   Variables는 다양한 모드/테마로 색상, 숫자, 문자열, 불린을 저장할 수 있는 Figma의 동적 값 시스템입니다.
    *   디자인 토큰과의 차이: Variables는 동적이고 모드 인식 값을 생성하기 위한 특정 Figma 기능이며, 디자인 토큰은 디자인에서 추출된 스타일 값입니다.
    *   로컬 변수(파일의 모든 변수)와 게시된 변수(팀 라이브러리에 게시된 변수) 모두 지원합니다.
    *   변수 컬렉션, 모드, 각 모드의 값을 보여주는 구조화된 데이터를 출력합니다.
    *   **대안**: 비 Enterprise 사용자의 경우 모든 Figma 플랜에서 작동하는 유사한 스타일링 정보를 추출하는 `generate_design_tokens` 기능을 사용하세요.
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
    *   **Figma variables를 얻으려면** ⚠️ **Enterprise 전용**: *"'Bao To의 Figma MCP 서버'를 사용하여 [Figma 링크]에서 변수를 가져오십시오."* 그러면 에이전트가 `get_figma_variables` 도구를 호출해야 합니다. **참고**: 이는 Figma Enterprise 플랜에서만 작동합니다.
    *   **디자인 토큰을 생성하려면**: *"'Bao To의 Figma MCP 서버'를 사용하여 [Figma 링크]에 대한 디자인 토큰을 생성하십시오."* 그러면 에이전트가 `generate_design_tokens` 도구를 호출해야 합니다.
    *   **디자인 시스템 문서를 생성하려면**: *"'Bao To의 Figma MCP 서버'를 사용하여 [Figma 링크]에 대한 디자인 시스템 문서를 생성하십시오."* 그러면 에이전트가 `generate_design_system_doc` 도구를 호출해야 합니다.

## 생성된 디자인 시스템을 더 읽기 쉽게 만들기

이 MCP 서버를 사용하여 디자인 토큰과 문서를 생성할 때, Figma의 내부 ID(예: `fill-hxq15en`)가 시스템을 유지 관리하기 어렵게 만들 수 있습니다. 생성된 디자인 시스템 문서는 광범위하며, 내부 ID가 여러 파일과 섹션에 걸쳐 있습니다. 다음은 이러한 ID를 모두 의미 있는 토큰으로 변환하는 워크플로우입니다:

### 의미론적 매핑 워크플로우

1. **초기 디자인 시스템 생성**
   - MCP 서버를 사용하여 초기 디자인 토큰과 문서를 생성
   - Figma의 내부 ID가 포함된 여러 파일을 얻게 됩니다:
     * 디자인 토큰 JSON
     * CSS 변수
     * 컴포넌트 문서
     * 스타일 가이드
     * 사용 예시

2. **컬러 시스템 스크린샷 준비**
   - Figma에서 컬러 스타일 페이지로 이동
   - 다음을 보여주는 명확한 스크린샷을 찍습니다:
     * 모든 컬러 견본
     * 컬러 이름과 값
     * 컬러 그룹화/계층 구조
   - 참조용으로 스크린샷 저장

3. **AI를 사용하여 포괄적인 의미론적 매핑 생성**
   - Cursor에서 컬러 시스템 스크린샷 공유
   - AI에게 포괄적인 매핑 수행 요청
   - 예시 프롬프트:
     ```
     "Figma 컬러 시스템 스크린샷과 생성된 디자인 시스템 파일이 있습니다.
     전체 문서에서 내부 ID의 모든 인스턴스에 대한 의미론적 매핑을 만들어주세요:
     1. 먼저 이미지의 컬러 시스템을 분석하여 각 컬러의 의미론적 의미를 이해
     2. 모든 생성된 파일을 검색하여 각 내부 ID의 모든 인스턴스 찾기
     3. ID와 의미론적 이름 간의 완전한 매핑 생성
     4. 다음의 모든 항목에서 모든 발생 업데이트:
        - 토큰 파일
        - CSS 변수
        - 컴포넌트 문서
        - 사용 예시
        - 스타일 가이드
     5. 전체 디자인 시스템에서 일관성 보장
     6. 다음을 포함한 추가 문서 생성:
        - 의미론적 토큰 사용 가이드라인
        - 다양한 컨텍스트(컴포넌트, 테마)에 대한 예시
        - 구현을 위한 모범 사례
        - 일반적인 패턴과 조합
        - 접근성 고려사항"
     ```
   - AI는 다음을 수행합니다:
     * 컬러 시스템을 시각적으로 분석
     * 각 ID의 모든 인스턴스 검색
     * 포괄적인 매핑 생성
     * 모든 파일의 모든 발생 업데이트
     * 전체적인 일관성 유지
     * 지원 문서 생성

4. **생성된 파일**
   AI는 모든 관련 파일을 생성/업데이트합니다:
   - `token-mapping.json` - ID에서 의미론적 이름으로의 완전한 매핑
   - `design_variables.css` - 업데이트된 CSS 변수
   - 의미론적 이름이 포함된 모든 문서 파일
   - 새로운 토큰 이름이 있는 컴포넌트 예시
   - 의미론적 참조가 있는 스타일 가이드

### 포괄적인 변환 예시

변환 전 (여러 파일에 걸쳐):
```css
/* design_variables.css */
--fill-hxq15en: #556AEB;
--stroke-heus4w0: #B9C4FF;

/* component_examples.md */
기본 작업에 `var(--fill-hxq15en)` 사용
테두리: 1px solid var(--stroke-heus4w0)

/* style_guide.md */
| fill-hxq15en | 기본 파란색 | #556AEB |
```

변환 후:
```css
/* design_variables.css */
--color-primary-500: #556AEB;
--stroke-primary-light: #B9C4FF;

/* component_examples.md */
기본 작업에 `var(--color-primary-500)` 사용
테두리: 1px solid var(--stroke-primary-light)

/* style_guide.md */
| color-primary-500 | 기본 파란색 | #556AEB |
```

### 모범 사례

1. **컬러 시스템 스크린샷**
   - 모든 컬러가 보이도록 확인
   - 완전한 명명 체계 포함
   - 전체 컬러 계층 구조 표시
   - 사용 가이드라인 캡처

2. **의미론적 명명**
   - 일관된, 목적 기반 이름 사용
   - 명확한 명명 계층 구조 따르기
   - 컬러 간의 관계 문서화
   - 사용 컨텍스트 포함

3. **포괄적인 업데이트**
   - 모든 인스턴스가 업데이트되었는지 확인
   - 모든 문서 파일 확인
   - 모든 컴포넌트 예시 검토
   - 모든 참조 검증

4. **유지 관리**
   - 스크린샷 최신 상태 유지
   - 필요할 때 완전한 매핑 다시 실행
   - 모든 파일에서 일관성 확인
   - 수동 오버라이드 문서화

AI는 또한 개발자가 의미론적 토큰을 올바르게 사용할 수 있도록 사용 가이드라인과 다양한 컨텍스트(컴포넌트, 테마 등)에 대한 예시를 포함한 추가 문서를 생성합니다.

## 기여하기