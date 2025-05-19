<div align="center">
  <h1>Máy chủ Figma MCP của Bao To</h1>
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

> **Lưu ý:** Máy chủ này là một nhánh của máy chủ Framelink Figma MCP gốc, được xây dựng dựa trên nền tảng của nó để cung cấp các khả năng nâng cao cho quy trình làm việc thiết kế do AI điều khiển. Chúng tôi ghi nhận và đánh giá cao công việc nền tảng của nhóm Framelink ban đầu.

Cung cấp cho [Cursor](https://cursor.sh/) và các công cụ mã hóa dựa trên AI khác quyền truy cập vào các tệp Figma của bạn bằng máy chủ [Model Context Protocol](https://modelcontextprotocol.io/introduction) này, **Máy chủ Figma MCP của Bao To**.

Khi Cursor có quyền truy cập vào dữ liệu thiết kế Figma, nó có thể triển khai thiết kế chính xác hơn đáng kể so với các phương pháp thay thế như dán ảnh chụp màn hình.

## Demo

[Xem demo xây dựng giao diện người dùng trong Cursor với dữ liệu thiết kế Figma](https://youtu.be/q4eN7CPo_gE)

[![Xem video](https://img.youtube.com/vi/q4eN7CPo_gE/maxresdefault.jpg)](https://youtu.be/q4eN7CPo_gE)

## Cách hoạt động

1. Mở cuộc trò chuyện IDE của bạn (ví dụ: chế độ агент trong Cursor).
2. Dán liên kết đến tệp, khung hoặc nhóm Figma.
3. Yêu cầu агент AI của bạn làm gì đó với tệp Figma — ví dụ: triển khai thiết kế.
4. Агент AI, được định cấu hình để sử dụng **Máy chủ Figma MCP của Bao To**, sẽ tìm nạp siêu dữ liệu có liên quan từ Figma thông qua máy chủ này và sử dụng nó để viết mã của bạn.

Máy chủ MCP này được thiết kế để đơn giản hóa và dịch các phản hồi từ [API Figma](https://www.figma.com/developers/api) để chỉ cung cấp thông tin bố cục và kiểu dáng phù hợp nhất cho mô hình AI.

Việc giảm lượng ngữ cảnh cung cấp cho mô hình giúp AI chính xác hơn và các phản hồi phù hợp hơn.

## Các tính năng và lợi thế chính

Trong khi các máy chủ Figma MCP khác có thể cung cấp thông tin node cơ bản, **Máy chủ Figma MCP của Bao To** cung cấp các khả năng vượt trội để hiểu và sử dụng hệ thống thiết kế của bạn:

*   **Trích xuất dữ liệu thiết kế toàn diện (`get_figma_data`)**: Tìm nạp thông tin chi tiết về các tệp Figma của bạn hoặc các node cụ thể, đơn giản hóa các cấu trúc Figma phức tạp thành một định dạng dễ hiểu hơn cho AI.
*   **Tải xuống hình ảnh chính xác (`download_figma_images`)**: Cho phép tải xuống có mục tiêu các tài sản hình ảnh cụ thể (SVG, PNG) từ các tệp Figma của bạn.
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
    *   Để nhận dữ liệu Figma cơ bản: *"Nhận dữ liệu Figma cho [liên kết Figma]."* (Агент có khả năng sẽ sử dụng `get_figma_data`).
    *   **Để tạo token thiết kế**: *"Tạo token thiết kế cho [liên kết Figma] bằng 'Máy chủ Figma MCP của Bao To'."* Sau đó, агент sẽ gọi công cụ `generate_design_tokens`.
    *   **Để tạo tài liệu hệ thống thiết kế**: *"Tạo tài liệu hệ thống thiết kế cho [liên kết Figma] bằng 'Máy chủ Figma MCP của Bao To'."* Sau đó, агент sẽ gọi công cụ `generate_design_system_doc`.

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