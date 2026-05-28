# MushroomLearning Desktop

MushroomLearning Desktop là ứng dụng bảng trắng trên máy tính ưu tiên ngoại tuyến dành cho giáo viên, gia sư và giảng viên trực tuyến dạy lớp trực tiếp qua Zoom, Google Meet, Microsoft Teams hoặc các công cụ họp tương tự.

Giáo viên mở MushroomLearning, chuẩn bị hoặc nhập tài liệu bài học, viết và chú thích trong lúc dạy, chia sẻ cửa sổ MushroomLearning cho học sinh, sau đó lưu hoặc xuất bài học ngay trên máy.

## Nguyên tắc sản phẩm

- Ưu tiên ngoại tuyến theo mặc định.
- Giáo viên sở hữu file bài học cục bộ của mình.
- MVP không có dịch vụ máy chủ, triển khai đám mây, đăng nhập, cộng tác thời gian thực, đường dẫn cho học sinh tham gia, thanh toán hoặc tính năng AI.
- Luồng sử dụng đầu tiên là giáo viên chia sẻ cửa sổ ứng dụng từ máy tính của mình.
- Độ ổn định và nét viết mượt quan trọng hơn các tính năng cộng tác rộng.

## Phạm vi MVP

- Bảng trắng nhiều trang
- Bút, tẩy, tô sáng, văn bản và hình cơ bản
- Nhập PDF và hình ảnh
- Di chuyển bảng và phóng to/thu nhỏ
- Chế độ trình bày
- Đồng hồ
- Lưu/tải cục bộ bằng file `.mushroomlearning`
- Tự động lưu cục bộ
- File gần đây
- Xuất PDF/PNG

## Không nằm trong phạm vi

- Tính năng LMS
- Tài khoản học sinh
- Lưu trữ hoặc đồng bộ đám mây
- Cộng tác nhiều người theo thời gian thực
- Plugin cho nền tảng họp
- Thanh toán hoặc cấp giấy phép
- Tạo giáo án bằng AI

## Chạy trên máy cục bộ

Cài các gói phụ thuộc:

```bash
npm install
```

Chạy ứng dụng web cục bộ:

```bash
npm run dev
```

Nếu port mặc định `5173` đang bận, Vite sẽ tự thử port kế tiếp. Bạn cũng có thể chạy cố định ở port `5174`:

```bash
npm run dev:5174
```

Build phần giao diện:

```bash
npm run build
```

Chạy kiểm thử đơn vị:

```bash
npm test
```

Kiểm thử đơn vị hiện tại tập trung vào logic canvas cốt lõi: đầu vào con trỏ, tiện ích nét vẽ,
kiểm tra va chạm cho tẩy, lịch sử hoàn tác/làm lại và trạng thái bảng/trang. Repo chưa thêm kiểm thử e2e.

Lưu và mở file bài học cục bộ:

- Vào `Board`.
- Bấm `Save Project` để tải file `.mushroomlearning` về máy.
- Bấm `Open Project` để chọn file `.mushroomlearning` đã lưu và khôi phục trang/nét vẽ.
- Phiên bản hiện tại dùng cơ chế dự phòng tải xuống/tải lên file trên trình duyệt; chưa yêu cầu API hệ thống file của Tauri.

Chế độ trình bày v0.5:

- Ở trang `Board`, bấm `Presenter` để chuyển sang bố cục chia sẻ màn hình gọn hơn.
- Chế độ trình bày ẩn header ứng dụng, thanh thumbnail trang, thanh tiện ích và các nút thao tác file.
- Thanh công cụ trình bày rút gọn vẫn giữ `Pen`, `Eraser`, tùy chỉnh bút, `Undo`, `Redo`, `Clear`, điều hướng trang trước/sau, chỉ báo trang hiện tại và nút `Exit Presenter` rõ ràng.
- Chế độ trình bày không thay đổi định dạng lưu `.mushroomlearning` và không dùng tích hợp Zoom/Google Meet, API toàn màn hình, dịch vụ máy chủ, đồng bộ đám mây, đăng nhập, thanh toán, cộng tác hoặc AI.

Chạy Tauri desktop shell sau khi đã cài Rust và các yêu cầu của Tauri:

```bash
npm run tauri dev
```

## Cấu trúc repository hiện tại

```text
mushroomlearning-desktop/
|-- README.md
|-- overview.md
|-- package.json
|-- tsconfig.json
|-- vite.config.ts
|-- index.html
|-- docs/
|   |-- product/
|   |-- technical/
|   |-- decisions/
|-- public/
|   |-- icons/
|-- src/
|   |-- app/
|   |-- pages/
|   |-- features/
|   |-- shared/
|   |-- storage/
|   |-- styles/
|   |-- main.tsx
|-- src-tauri/
|   |-- Cargo.toml
|   |-- tauri.conf.json
|   |-- build.rs
|   |-- src/
|-- tests/
    |-- unit/
    |-- e2e/
```

## Ghi chú kiến trúc

Ứng dụng được tổ chức theo từng nhóm tính năng sản phẩm. Các khái niệm cốt lõi của việc dạy học nằm trong `src/features`, UI và tiện ích dùng chung nằm trong `src/shared`, còn ranh giới lưu trữ cục bộ nằm trong `src/storage`.

Tài liệu sản phẩm và kỹ thuật nằm trong `docs/`. Nguồn sự thật sản phẩm chính vẫn là `overview.md`.
