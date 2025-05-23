<div align="center">
  <h1>Máy chủ Figma MCP của Bao To</h1>
  <h2>Tạo hệ thống thiết kế hoàn chỉnh từ tệp Figma và xây dựng các thành phần tuân thủ đặc tả thiết kế</h2>
  <p>
    🎨 Tự động tạo hệ thống thiết kế và trích xuất token ngữ nghĩa từ tệp Figma<br/>
    🤖 Xây dựng thành phần từ hệ thống thiết kế hoàn chỉnh hoặc lựa chọn khung riêng lẻ<br/>
    🎯 Đạt được triển khai hoàn hảo đến từng pixel khớp chính xác với thiết kế Figma<br/>
    📚 Tự động tạo tài liệu thiết kế toàn diện
  </p>
  <p>
    🌐 Có sẵn bằng các ngôn ngữ:
    <a href="README.md">English</a> |
    <a href="README.ko.md">한국어 (Tiếng Hàn)</a> |
    <a href="README.ja.md">日本語 (Tiếng Nhật)</a> |
    <a href="README.zh.md">中文 (Tiếng Trung)</a> |
    <a href="README.es.md">Español (Tiếng Tây Ban Nha)</a> |
    <a href="README.vi.md">Tiếng Việt</a> |
    <a href="README.fr.md">Français (Tiếng Pháp)</a>
  </p>
  <h3>Trao quyền cho AI agent viết mã của bạn với quyền truy cập Figma trực tiếp.<br/>Tạo hệ thống thiết kế & token vào dự án của bạn, và triển khai UI chỉ trong một lần.</h3>
  <a href="https://npmcharts.com/compare/@tothienbao6a0/figma-mcp-server?interval=30">
    <img alt="lượt tải hàng tuần" src="https://img.shields.io/npm/dm/@tothienbao6a0/figma-mcp-server.svg">
  </a>
  <a href="https://github.com/tothienbao6a0/Figma-Context-MCP/blob/main/LICENSE">
    <img alt="Giấy phép MIT" src="https://img.shields.io/github/license/tothienbao6a0/Figma-Context-MCP" />
  </a>
  <!-- Liên kết đến Discord hoặc mạng xã hội của bạn nếu có, nếu không hãy xóa -->
  <!-- <a href="https://framelink.ai/discord">
    <img alt="Discord" src="https://img.shields.io/discord/1352337336913887343?color=7389D8&label&logo=discord&logoColor=ffffff" />
  </a> -->
  <br />
  <!-- Liên kết đến Twitter hoặc mạng xã hội của bạn nếu có, nếu không hãy xóa -->
  <!-- <a href="https://twitter.com/glipsman">
    <img alt="Twitter" src="https://img.shields.io/twitter/url?url=https%3A%2F%2Fx.com%2Fglipsman&label=%40glipsman" />
  </a> -->
</div>

<br/>

> **Lưu ý:** Máy chủ này là một nhánh của máy chủ [Framelink Figma MCP server](https://www.npmjs.com/package/figma-developer-mcp) gốc, được xây dựng dựa trên nền tảng của nó để cung cấp các khả năng nâng cao cho quy trình làm việc thiết kế do AI điều khiển. Chúng tôi ghi nhận và đánh giá cao công việc nền tảng của nhóm Framelink ban đầu.

Cung cấp cho [Cursor](https://cursor.sh/) và các công cụ mã hóa dựa trên AI khác quyền truy cập vào các tệp Figma của bạn bằng máy chủ [Model Context Protocol](https://modelcontextprotocol.io/introduction) này, **Máy chủ Figma MCP của Bao To**.

Khi Cursor có quyền truy cập vào dữ liệu thiết kế Figma, nó có thể triển khai thiết kế chính xác hơn đáng kể so với các phương pháp thay thế như dán ảnh chụp màn hình.

## Demo

[Xem demo xây dựng giao diện người dùng trong Cursor với dữ liệu thiết kế Figma](https://youtu.be/4I4Zs2zg1Oo)

[![Xem video](https://img.youtube.com/vi/4I4Zs2zg1Oo/maxresdefault.jpg)](https://youtu.be/4I4Zs2zg1Oo)

## Cách hoạt động

1. Mở cuộc trò chuyện IDE của bạn (ví dụ: chế độ агент trong Cursor).
2. Dán liên kết đến tệp, khung hoặc nhóm Figma.
3. Yêu cầu агент AI của bạn làm gì đó với tệp Figma — ví dụ: triển khai thiết kế.
4. Агент AI, được định cấu hình để sử dụng **Máy chủ Figma MCP của Bao To**, sẽ tìm nạp siêu dữ liệu có liên quan từ Figma thông qua máy chủ này và sử dụng nó để viết mã của bạn.

Máy chủ MCP này được thiết kế để đơn giản hóa và dịch các phản hồi từ [API Figma](https://www.figma.com/developers/api) để chỉ cung cấp thông tin bố cục và kiểu dáng phù hợp nhất cho mô hình AI.

Giảm lượng ngữ cảnh cung cấp cho mô hình giúp làm cho AI chính xác hơn và các phản hồi phù hợp hơn.

## Giới hạn của Gói

⚠️ **Lưu ý Quan trọng về API Variables của Figma**

Chức năng `get_figma_variables` yêu cầu **gói Enterprise của Figma**. Giới hạn này được áp đặt bởi Figma, không phải bởi máy chủ MCP này:

- ✅ **Có sẵn trên TẤT CẢ các gói**: `get_figma_data`, `download_figma_images`, `generate_design_tokens`, `generate_design_system_doc`
- ❌ **Chỉ dành cho Enterprise**: `get_figma_variables` (truy cập Variables REST API)

**Tại sao giới hạn này tồn tại:**
- Figma hạn chế truy cập Variables API chỉ cho các gói Enterprise
- Người dùng gói Starter, Professional hoặc Organization sẽ nhận lỗi `403 Forbidden`
- Đây là quyết định kinh doanh của Figma để thúc đẩy doanh số Enterprise

**Thay thế cho người dùng không phải Enterprise:**
- Sử dụng `generate_design_tokens` - trích xuất thông tin styling tương tự từ thiết kế của bạn
- Sử dụng Plugin API của Figma (yêu cầu xây dựng plugin tùy chỉnh)
- Xuất variables thủ công từ UI Figma

Để biết thêm chi tiết, xem [tài liệu chính thức của Figma về tính năng gói](https://help.figma.com/hc/en-us/articles/360040328273-Figma-plans-and-features).

## Tính năng chính & Ưu điểm

Trong khi các máy chủ MCP Figma khác có thể cung cấp thông tin node cơ bản, **Máy chủ MCP Figma của Bao To** cung cấp khả năng vượt trội để hiểu và sử dụng hệ thống thiết kế của bạn:

*   **Trích xuất dữ liệu thiết kế toàn diện (`get_figma_data`)**: Lấy thông tin chi tiết về các tệp Figma hoặc node cụ thể của bạn, đơn giản hóa cấu trúc Figma phức tạp thành định dạng dễ hiểu hơn cho AI.
*   **Tải xuống hình ảnh chính xác (`download_figma_images`)**: Cho phép tải xuống có mục tiêu các tài sản hình ảnh cụ thể (SVG, PNG) từ các tệp Figma của bạn.
*   ⭐ **Trích xuất Variables Figma (`get_figma_variables`)** ⚠️ **Yêu cầu Gói Enterprise Figma**:
    *   Lấy tất cả variables và bộ sưu tập variables trực tiếp từ tệp Figma của bạn bằng API Variables của Figma.
    *   **⚠️ QUAN TRỌNG**: Tính năng này chỉ hoạt động với **các gói Enterprise của Figma**. Người dùng trên các gói Starter, Professional hoặc Organization sẽ nhận lỗi 403 Forbidden khi cố gắng truy cập variables qua REST API.
    *   Variables là hệ thống giá trị động của Figma có thể lưu trữ màu sắc, số, chuỗi và boolean với các chế độ/chủ đề khác nhau.
    *   Khác với design tokens: Variables là tính năng cụ thể của Figma để tạo giá trị động, nhận biết chế độ, trong khi design tokens là các giá trị style được trích xuất từ thiết kế.
    *   Hỗ trợ cả variables cục bộ (tất cả variables trong tệp) và variables đã xuất bản (những cái đã xuất bản cho thư viện team).
    *   Xuất dữ liệu có cấu trúc hiển thị bộ sưu tập variables, chế độ và giá trị cho mỗi chế độ.
    *   **Thay thế**: Đối với người dùng không phải Enterprise, hãy sử dụng chức năng `generate_design_tokens` để trích xuất thông tin styling tương tự và hoạt động trên tất cả các gói Figma.
*   ⭐ **Tạo token thiết kế tự động (`generate_design_tokens`)**:
    *   Trích xuất các token thiết kế quan trọng (màu sắc, kiểu chữ, khoảng cách, hiệu ứng) trực tiếp từ tệp Figma của bạn.
    *   Xuất ra một tệp JSON có cấu trúc, sẵn sàng để tích hợp vào quy trình phát triển của bạn hoặc được AI sử dụng để đảm bảo tính nhất quán của thiết kế.
*   ⭐ **Tài liệu hóa hệ thống thiết kế thông minh (`generate_design_system_doc`)**:
    *   Vượt xa dữ liệu node đơn giản bằng cách tạo tài liệu Markdown đa tệp toàn diện cho toàn bộ hệ thống thiết kế của bạn như được định nghĩa trong Figma.
    *   Tạo một cấu trúc có tổ chức bao gồm tổng quan, các trang chi tiết cho các kiểu toàn cục (màu sắc, kiểu chữ, hiệu ứng, bố cục) và thông tin thành phần/node cho mỗi canvas Figma.
    *   Tài liệu phong phú, có cấu trúc này trao quyền cho các агент AI hiểu không chỉ các yếu tố riêng lẻ mà cả các mối quan hệ và quy tắc của hệ thống thiết kế của bạn, dẫn đến việc triển khai giao diện người dùng chính xác hơn, nhận biết ngữ cảnh hơn và giải phóng bạn khỏi việc diễn giải thiết kế thủ công.

Các tính năng nâng cao này làm cho máy chủ này đặc biệt mạnh mẽ đối với các tác vụ đòi hỏi sự hiểu biết sâu sắc về hệ thống thiết kế, chẳng hạn như tạo các thành phần theo chủ đề hoặc đảm bảo tuân thủ các nguyên tắc thương hiệu trong quá trình phát triển giao diện người dùng.

## Sử dụng Máy chủ này với Агент AI của bạn

Để tận dụng toàn bộ sức mạnh của **Máy chủ Figma MCP của Bao To**, đặc biệt là các công cụ tạo hệ thống thiết kế của nó, bạn cần hướng dẫn агент AI của mình (như Cursor) một cách hiệu quả. Đây là cách thực hiện:

1.  **Chỉ định Máy chủ này**:
    *   Khi bạn bắt đầu một tác vụ, hãy đảm bảo ứng dụng khách AI của bạn được định cấu hình để sử dụng "Máy chủ Figma MCP của Bao To" (như được hiển thị trong phần "Bắt đầu").
    *   Nếu агент AI của bạn hỗ trợ chọn giữa nhiều máy chủ MCP hoặc nếu bạn đang nhắc nó một cách tổng quát hơn, bạn có thể cần phải nêu rõ ràng: *"Sử dụng 'Máy chủ Figma MCP của Bao To' cho các tác vụ Figma."* hoặc tham chiếu đến tên gói npm của nó: *"Sử dụng máy chủ MCP `@tothienbao6a0/figma-mcp-server`."*

2.  **Yêu cầu Công cụ Cụ thể**:
    *   Để lấy dữ liệu Figma cơ bản: *"Lấy dữ liệu Figma cho [liên kết Figma]."* (Agent có thể sẽ sử dụng `get_figma_data`).
    *   **Để lấy variables Figma** ⚠️ **Chỉ dành cho Enterprise**: *"Lấy variables từ [liên kết Figma] bằng 'Máy chủ MCP Figma của Bao To'."* Agent sau đó sẽ gọi công cụ `get_figma_variables`. **Lưu ý**: Điều này chỉ hoạt động với các gói Enterprise của Figma.
    *   **Để tạo design tokens**: *"Tạo design tokens cho [liên kết Figma] bằng 'Máy chủ MCP Figma của Bao To'."* Agent sau đó sẽ gọi công cụ `generate_design_tokens`.
    *   **Để tạo tài liệu hệ thống thiết kế**: *"Tạo tài liệu hệ thống thiết kế cho [liên kết Figma] bằng 'Máy chủ MCP Figma của Bao To'."* Agent sau đó sẽ gọi công cụ `generate_design_system_doc`.

3.  **Cung cấp các tham số cần thiết**:
    *   **`fileKey`**: Luôn cung cấp liên kết tệp Figma. Агент và máy chủ có thể trích xuất `fileKey`.
    *   **`outputDirectoryPath` (cho `generate_design_system_doc`) / `outputFilePath` (cho `generate_design_tokens`)**:
        *   Các công cụ này cho phép bạn chỉ định nơi lưu các tệp được tạo.
        *   Nếu bạn muốn tài liệu hoặc token được lưu trực tiếp vào dự án hiện tại của mình (ví dụ: trong thư mục `/docs` hoặc `/tokens`), hãy yêu cầu агент của bạn:
            *   *"Tạo tài liệu hệ thống thiết kế cho [liên kết Figma] và lưu nó vào thư mục `docs/design_system` của dự án hiện tại của tôi."*
            *   *"Tạo token thiết kế cho [liên kết Figma] và lưu tệp JSON dưới dạng `design-tokens.json` trong thư mục `src/style-guide` của dự án của tôi."*
        *   Sau đó, агент AI sẽ xác định đường dẫn tuyệt đối đến thư mục con của dự án của bạn và cung cấp nó dưới dạng `outputDirectoryPath` hoặc `outputFilePath` khi gọi công cụ tương ứng.
        *   Nếu bạn không chỉ định đường dẫn, các công cụ này sẽ lưu đầu ra của chúng vào một thư mục tạm thời của hệ thống (theo hành vi mặc định được ghi lại của chúng) và агент sẽ được thông báo về đường dẫn đó. Sau đó, агент có thể giúp bạn truy xuất các tệp.

**Ví dụ về Lời nhắc cho Агент:**

> "Này AI, vui lòng sử dụng Máy chủ Figma MCP của Bao To để tạo tài liệu hệ thống thiết kế đầy đủ cho `https://www.figma.com/design/yourFileKey/Your-Project-Name`. Tôi muốn đầu ra được lưu trong một thư mục mới có tên `figma_docs` bên trong thư mục gốc của dự án hiện tại của tôi."

Bằng cách cụ thể, bạn giúp агент AI thực hiện các lệnh gọi công cụ chính xác với các tham số phù hợp đến máy chủ này, mở khóa các tính năng nâng cao của nó cho quy trình phát triển của bạn.

## Bắt đầu

Ứng dụng khách mã hóa AI của bạn (như Cursor) có thể được định cấu hình để sử dụng máy chủ MCP này. Thêm nội dung sau vào tệp cấu hình máy chủ MCP của ứng dụng khách của bạn, thay thế `YOUR-KEY` bằng khóa API Figma của bạn.

> LƯU Ý: Bạn sẽ cần tạo mã thông báo truy cập Figma để sử dụng máy chủ này. Hướng dẫn về cách tạo mã thông báo truy cập API Figma có thể được tìm thấy [tại đây](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens).

### MacOS / Linux

```json
{
  "mcpServers": {
    "Máy chủ Figma MCP của Bao To": {
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
    "Máy chủ Figma MCP của Bao To": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@tothienbao6a0/figma-mcp-server", "--figma-api-key=YOUR-KEY", "--stdio"]
    }
  }
}
```

Điều này sẽ sử dụng `npx` để tải xuống và chạy gói `@tothienbao6a0/figma-mcp-server` từ npm. Cờ `-y` tự động đồng ý với bất kỳ lời nhắc nào từ `npx`.

Ngoài ra, bạn có thể cài đặt gói trên toàn cầu trước (mặc dù `npx` thường được ưu tiên cho các công cụ CLI để đảm bảo bạn đang sử dụng phiên bản mới nhất mà không cần cài đặt toàn cầu):
```bash
npm install -g @tothienbao6a0/figma-mcp-server
```
Và sau đó định cấu hình ứng dụng khách của bạn để sử dụng trực tiếp `@tothienbao6a0/figma-mcp-server` làm lệnh. 

## Làm cho hệ thống thiết kế được tạo ra dễ đọc hơn

Khi sử dụng máy chủ MCP này để tạo token thiết kế và tài liệu, bạn sẽ nhận thấy các ID nội bộ của Figma (như `fill-hxq15en`) có thể làm cho hệ thống khó bảo trì. Tài liệu hệ thống thiết kế được tạo ra rất rộng, với các ID nội bộ phân tán trong nhiều tệp và phần. Dưới đây là quy trình làm việc để chuyển đổi TẤT CẢ các ID này thành các token có ý nghĩa:

### Quy trình ánh xạ ngữ nghĩa

1. **Tạo hệ thống thiết kế ban đầu**
   - Sử dụng máy chủ MCP để tạo token thiết kế và tài liệu ban đầu
   - Bạn sẽ nhận được nhiều tệp với ID nội bộ của Figma:
     * JSON token thiết kế
     * Biến CSS
     * Tài liệu thành phần
     * Hướng dẫn phong cách
     * Ví dụ sử dụng

2. **Chuẩn bị ảnh chụp màn hình hệ thống màu**
   - Trong Figma, điều hướng đến trang kiểu màu
   - Chụp ảnh màn hình rõ ràng hiển thị:
     * Tất cả mẫu màu
     * Tên và giá trị màu
     * Nhóm/phân cấp màu
   - Lưu ảnh chụp để tham khảo

3. **Sử dụng AI để tạo ánh xạ ngữ nghĩa toàn diện**
   - Trong Cursor, chia sẻ ảnh chụp hệ thống màu
   - Yêu cầu AI thực hiện ánh xạ toàn diện
   - Ví dụ prompt:
     ```
     "Tôi có ảnh chụp màn hình hệ thống màu Figma và các tệp hệ thống thiết kế được tạo ra.
     Vui lòng giúp tạo ánh xạ ngữ nghĩa cho TẤT CẢ các phiên bản ID nội bộ trong toàn bộ tài liệu:
     1. Đầu tiên, phân tích hệ thống màu trong hình ảnh để hiểu ý nghĩa ngữ nghĩa của từng màu
     2. Sau đó, tìm kiếm trong tất cả các tệp được tạo ra để tìm mọi phiên bản của từng ID nội bộ
     3. Tạo ánh xạ hoàn chỉnh giữa ID và tên ngữ nghĩa
     4. Cập nhật TẤT CẢ các lần xuất hiện trong:
        - Tệp token
        - Biến CSS
        - Tài liệu thành phần
        - Ví dụ sử dụng
        - Hướng dẫn phong cách
     5. Đảm bảo tính nhất quán trong toàn bộ hệ thống thiết kế
     6. Tạo tài liệu bổ sung bao gồm:
        - Hướng dẫn sử dụng token ngữ nghĩa
        - Ví dụ cho các ngữ cảnh khác nhau (thành phần, chủ đề)
        - Thực hành tốt nhất cho việc triển khai
        - Mẫu và kết hợp phổ biến
        - Cân nhắc về khả năng truy cập"
     ```
   - AI sẽ:
     * Phân tích trực quan hệ thống màu
     * Tìm kiếm TẤT CẢ các phiên bản của mỗi ID
     * Tạo ánh xạ toàn diện
     * Cập nhật mọi lần xuất hiện trong tất cả các tệp
     * Duy trì tính nhất quán tổng thể
     * Tạo tài liệu hỗ trợ

4. **Tệp được tạo ra**
   AI sẽ tạo/cập nhật TẤT CẢ các tệp liên quan:
   - `token-mapping.json` - Ánh xạ hoàn chỉnh từ ID sang tên ngữ nghĩa
   - `design_variables.css` - Biến CSS đã cập nhật
   - Tất cả tệp tài liệu với tên ngữ nghĩa
   - Ví dụ thành phần với tên token mới
   - Hướng dẫn phong cách với tham chiếu ngữ nghĩa

### Ví dụ chuyển đổi toàn diện

Trước (qua nhiều tệp):
```css
/* design_variables.css */
--fill-hxq15en: #556AEB;
--stroke-heus4w0: #B9C4FF;

/* component_examples.md */
Sử dụng `var(--fill-hxq15en)` cho hành động chính
Viền: 1px solid var(--stroke-heus4w0)

/* style_guide.md */
| fill-hxq15en | Màu xanh chính | #556AEB |
```

Sau:
```css
/* design_variables.css */
--color-primary-500: #556AEB;
--stroke-primary-light: #B9C4FF;

/* component_examples.md */
Sử dụng `var(--color-primary-500)` cho hành động chính
Viền: 1px solid var(--stroke-primary-light)

/* style_guide.md */
| color-primary-500 | Màu xanh chính | #556AEB |
```

### Thực hành tốt nhất

1. **Ảnh chụp màn hình hệ thống màu**
   - Đảm bảo TẤT CẢ màu đều hiển thị
   - Bao gồm hệ thống đặt tên đầy đủ
   - Hiển thị phân cấp màu đầy đủ
   - Chụp hướng dẫn sử dụng

2. **Đặt tên ngữ nghĩa**
   - Sử dụng tên nhất quán, dựa trên mục đích
   - Tuân theo phân cấp đặt tên rõ ràng
   - Ghi lại mối quan hệ giữa các màu
   - Bao gồm ngữ cảnh sử dụng

3. **Cập nhật toàn diện**
   - Xác minh TẤT CẢ phiên bản đã được cập nhật
   - Kiểm tra TẤT CẢ tệp tài liệu
   - Xem xét TẤT CẢ ví dụ thành phần
   - Xác thực TẤT CẢ tham chiếu

4. **Bảo trì**
   - Giữ ảnh chụp màn hình cập nhật
   - Chạy lại ánh xạ hoàn chỉnh khi cần
   - Xác minh tính nhất quán trong TẤT CẢ tệp
   - Ghi lại mọi ghi đè thủ công

AI cũng sẽ tạo tài liệu bổ sung để giúp nhà phát triển sử dụng token ngữ nghĩa một cách chính xác, bao gồm hướng dẫn sử dụng và ví dụ cho các ngữ cảnh khác nhau (thành phần, chủ đề, v.v.).

## Đóng góp 