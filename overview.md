# Report Overview - MushroomLearning Desktop

**Ngày cập nhật:** 28/05/2026  
**Phiên bản dự án:** v0.1.0  
**Repository:** `mushroomlearning-desktop`  
**Trạng thái tổng quan:** Đã có nền tảng ứng dụng desktop/web cục bộ và prototype bảng trắng tương tác; đang trong giai đoạn hoàn thiện MVP.

## 1. Executive Summary

MushroomLearning Desktop là ứng dụng bảng trắng desktop ưu tiên ngoại tuyến dành cho giáo viên, gia sư và giảng viên dạy trực tuyến qua Zoom, Google Meet, Microsoft Teams hoặc các công cụ họp tương tự.

Mục tiêu MVP là kiểm chứng việc giáo viên có thể dùng MushroomLearning để dạy một buổi học thật bằng cách chia sẻ cửa sổ ứng dụng, viết/chú thích trên bảng, quản lý nhiều trang, lưu bài học cục bộ và xuất nội dung sau buổi học mà không cần tài khoản, cloud hay tích hợp nền tảng họp.

Dự án hiện đã có kiến trúc Tauri + React + TypeScript, canvas bằng Konva, các module domain chính, bộ test unit cho logic cốt lõi và một prototype bảng trắng có thể thao tác được. Các tính năng trọng tâm đã có gồm bút, tẩy, pan/zoom, nhiều trang, undo/redo, lưu/mở file `.mushroomlearning`, import ảnh, export PNG, presenter mode và timer.

## 2. Định Vị Sản Phẩm

MushroomLearning được định vị là bảng dạy học desktop gọn nhẹ cho lớp học trực tuyến trực tiếp:

- Giáo viên mở ứng dụng.
- Tạo bảng mới hoặc mở file bài học cục bộ.
- Nhập tài liệu hoặc bắt đầu từ bảng trắng.
- Viết, vẽ, tô chú thích trong lúc dạy.
- Chia sẻ cửa sổ qua Zoom/Google Meet.
- Lưu hoặc xuất bài học sau buổi học.

Sản phẩm không định hướng trở thành LMS, Miro clone, nền tảng cộng tác cloud, plugin Zoom/Google Meet hay công cụ AI trong giai đoạn MVP.

## 3. Người Dùng Mục Tiêu

Người dùng chính:

- Gia sư trực tuyến dạy 1-1 hoặc nhóm nhỏ.
- Giáo viên luyện thi cần chú thích bài tập, đề thi, PDF.
- Giáo viên tự do hoặc trung tâm nhỏ cần công cụ dạy học đơn giản, không yêu cầu thiết lập phức tạp.

Người dùng phụ:

- Giáo viên dạy hybrid.
- Giảng viên đào tạo nội bộ.
- Học sinh, sinh viên hoặc trợ giảng cần trình bày lời giải.

## 4. Vấn Đề Cần Giải Quyết

Giáo viên dạy online thường phải chuyển qua lại giữa nhiều công cụ: Zoom/Meet, PowerPoint, PDF viewer, trình duyệt và bảng trắng. Điều này gây gián đoạn trong buổi học trực tiếp.

Các pain point chính:

- Viết trực tiếp lên tài liệu dạy học chưa đủ mượt.
- Chuyển qua lại giữa PDF, slide và bảng trắng mất thời gian.
- Bảng trắng tích hợp trong công cụ họp không tối ưu cho lớp học dài.
- Công cụ cộng tác đa năng thường quá phức tạp so với nhu cầu dạy trực tiếp.
- Giáo viên cần lưu và gửi lại ghi chú sau buổi học.
- Một nhóm giáo viên không muốn dùng công cụ bắt học sinh đăng nhập hoặc lưu dữ liệu lên cloud.

## 5. Phạm Vi MVP

MVP cần chứng minh một giả thuyết chính:

> Giáo viên có thể dạy một buổi học trực tuyến thật bằng MushroomLearning qua chia sẻ màn hình mà không cần dùng thêm công cụ bảng trắng khác.

Trong phạm vi MVP:

- Bảng trắng nhiều trang.
- Bút, tẩy, tô sáng, văn bản và hình cơ bản.
- Nhập PDF và hình ảnh.
- Di chuyển bảng, phóng to/thu nhỏ.
- Chế độ trình bày để chia sẻ màn hình sạch hơn.
- Đồng hồ cho bài tập.
- Lưu/tải cục bộ bằng file `.mushroomlearning`.
- Tự động lưu cục bộ.
- File gần đây.
- Xuất PDF/PNG.
- Undo/redo.

Ngoài phạm vi MVP:

- Đăng nhập, tài khoản học sinh, phân quyền.
- Cloud sync hoặc cloud storage.
- Cộng tác thời gian thực.
- Link cho học sinh tham gia.
- Tích hợp Zoom SDK hoặc Google Meet add-on.
- Thanh toán, license, marketplace.
- Tính năng AI.

## 6. Hiện Trạng Dự Án Đã Có

### 6.1 Nền tảng kỹ thuật

Đã có:

- Project React + TypeScript + Vite.
- Tauri desktop shell cơ bản trong `src-tauri`.
- Konva/react-konva cho canvas.
- Cấu trúc source theo feature: `board`, `canvas`, `documents`, `presenter`, `timer`, `settings`, `storage`.
- Scripts phát triển: `npm run dev`, `npm run build`, `npm test`, `npm run tauri dev`.
- Bộ tài liệu sản phẩm/kỹ thuật trong `docs/`.

### 6.2 Tài liệu sản phẩm và kỹ thuật

Đã có các tài liệu chính:

- `docs/product/mvp-scope.md`: phạm vi MVP.
- `docs/product/user-flow.md`: luồng trước, trong và sau buổi học.
- `docs/product/roadmap.md`: roadmap theo giai đoạn.
- `docs/product/feature-list.md`: danh sách tính năng P0/P1/trì hoãn.
- `docs/technical/architecture.md`: kiến trúc ứng dụng.
- `docs/technical/canvas-engine.md`: định hướng engine canvas.
- `docs/technical/file-format.md`: định dạng file `.mushroomlearning`.
- `docs/technical/local-storage.md`: nguyên tắc lưu trữ cục bộ.
- `docs/decisions/adr-001-offline-first.md`: quyết định offline-first.

### 6.3 Tính năng sản phẩm đã triển khai ở prototype

Đã có:

- Màn hình Home, Board, Settings.
- Canvas trắng bằng Konva.
- Công cụ bút vẽ nét tự do.
- Tùy chỉnh màu bút và độ dày bút.
- Công cụ tẩy theo nét.
- Pan canvas.
- Zoom in, zoom out, reset viewport.
- Undo/redo cho thao tác canvas.
- Clear canvas.
- Bảng nhiều trang: thêm trang, chuyển trang trước/sau.
- Lưu project thành file `.mushroomlearning` dạng JSON.
- Mở lại file `.mushroomlearning` từ máy.
- Import ảnh vào trang hiện tại.
- Export trang hiện tại thành PNG.
- Presenter mode: ẩn bớt UI, giữ thanh công cụ rút gọn để chia sẻ màn hình.
- Timer với start/pause/reset và chỉnh thời lượng.
- Save status cơ bản: saved/saving/unsaved changes.

### 6.4 Định dạng file

Đã có serializer/validator cho file `.mushroomlearning`.

File hiện lưu các dữ liệu domain chính:

- Metadata project.
- Board.
- Danh sách page.
- Active page.
- Background trang.
- Objects trên canvas.
- Stroke data gồm điểm vẽ, màu, độ dày, opacity, tool và metadata.

Hiện tại lưu/mở đang dùng cơ chế browser download/upload file. Đây là hướng phù hợp cho prototype web; khi đóng gói desktop cần nối sâu hơn với file system API của Tauri.

### 6.5 Test và chất lượng

Đã có test unit cho các phần logic cốt lõi:

- Board store.
- Canvas history.
- Coordinate transform.
- Pointer input.
- Stroke utilities.
- Hit testing.
- Serializer/validator file `.mushroomlearning`.
- PNG exporter.
- Presenter store.
- Timer store.

Chưa thấy test e2e cho luồng dạy học đầy đủ.

## 7. Các Hạng Mục Chưa Hoàn Thiện So Với MVP

Các phần còn thiếu hoặc mới ở mức placeholder/interface:

- Import PDF bằng PDF.js.
- Export PDF.
- Công cụ tô sáng.
- Công cụ text.
- Hình cơ bản: line, arrow, rectangle, circle.
- Chọn/di chuyển object.
- Thumbnail trang.
- File gần đây nối UI đầy đủ.
- Autosave nối vào luồng board thực tế và cơ chế khôi phục sau crash.
- Lưu/mở file bằng Tauri filesystem thay vì browser download/upload.
- Package desktop installer cho Windows.
- Kiểm thử hiệu năng với buổi học 45-90 phút.
- Kiểm thử với bảng vẽ/stylus thật.
- Test e2e cho luồng: mở app, viết, thêm trang, import tài liệu, lưu, mở lại, export, presenter mode.

## 8. Roadmap Đề Xuất

### Giai đoạn hiện tại: Prototype bảng trắng cục bộ

Mục tiêu: biến prototype hiện có thành bản nội bộ đủ ổn định để demo và test với giáo viên.

Ưu tiên:

- Hoàn thiện nét viết, tẩy, pan/zoom và undo/redo.
- Củng cố lưu/mở file `.mushroomlearning`.
- Kiểm thử kỹ luồng nhiều trang.
- Tối ưu canvas để không lag khi có nhiều nét.

### Giai đoạn tiếp theo: Hỗ trợ tài liệu dạy học

Mục tiêu: giáo viên có thể dùng tài liệu thật.

Ưu tiên:

- Import PDF.
- Import ảnh ổn định hơn.
- Tô sáng.
- Text annotation.
- Export PDF.
- Export PNG nhiều trang hoặc lựa chọn trang.

### Giai đoạn sau: Trải nghiệm dạy live

Mục tiêu: dùng được trong một buổi Zoom/Meet thật.

Ưu tiên:

- Presenter mode hoàn chỉnh.
- Autosave và khôi phục.
- Thumbnail trang.
- File gần đây.
- Timer polish.
- Bộ cài Windows.

### Giai đoạn beta

Mục tiêu: thử nghiệm với 20-50 giáo viên.

Ưu tiên:

- Thu thập feedback từ lớp học thật.
- Theo dõi crash/lag/mất dữ liệu.
- Đo tỷ lệ giáo viên dùng lại.
- Xác nhận khả năng sẵn sàng trả tiền.

## 9. Rủi Ro Chính

| Rủi ro | Tác động | Hướng giảm thiểu |
|---|---:|---|
| Nét viết lag khi lớp học dài | Rất cao | Test sớm với nhiều stroke và thiết bị stylus |
| Import PDF chậm hoặc lỗi font/render | Cao | Dùng PDF.js, test với tài liệu dạy học thật |
| Mất dữ liệu khi app crash | Rất cao | Ưu tiên autosave và recovery flow |
| Lưu/mở file chưa native desktop | Trung bình | Nối Tauri filesystem trước beta |
| Presenter mode chưa đủ sạch khi share màn hình | Trung bình | Test thực tế qua Zoom/Meet |
| Scope creep sang cloud/AI/collaboration quá sớm | Cao | Giữ MVP offline-first đến khi validate xong |

## 10. Chỉ Số Thành Công Cho MVP/Beta

Chỉ số định lượng đề xuất:

- 20-50 giáo viên thử bản beta.
- 30+ buổi học thật được dạy bằng ứng dụng.
- 40%+ giáo viên dùng hơn một lần.
- Hỗ trợ buổi học 45-90 phút không crash.
- 30%+ phiên học có thao tác export sau buổi học.

Tín hiệu định tính:

- Giáo viên thấy workflow đơn giản hơn cách hiện tại.
- Giáo viên dùng trong lớp thật, không chỉ demo.
- Giáo viên yêu cầu cải tiến cụ thể thay vì bỏ dùng.
- Có tín hiệu sẵn sàng trả tiền nếu bản ổn định.

## 11. Đề Xuất Cho PM

Khuyến nghị tiếp tục đi theo hướng desktop offline-first và chưa mở rộng sang cloud, đăng nhập, cộng tác hay AI trong MVP.

Thứ tự ưu tiên nên là:

1. Làm chắc core canvas: viết mượt, tẩy tốt, undo/redo ổn định.
2. Hoàn thiện tài liệu dạy học: import PDF/ảnh, chú thích, export.
3. Làm chắc lưu trữ cục bộ: file `.mushroomlearning`, autosave, mở lại bài học.
4. Cải thiện trải nghiệm dạy live: presenter mode, timer, navigation, UI sạch khi share màn hình.
5. Đóng gói Windows và chạy beta với giáo viên thật.

Kết luận: dự án đã có nền tảng kỹ thuật và prototype đủ rõ để tiếp tục phát triển MVP. Trọng tâm tiếp theo không nên là thêm nhiều module mới, mà là hoàn thiện các luồng cốt lõi để một giáo viên có thể dùng sản phẩm trong một buổi học thật từ đầu đến cuối.
