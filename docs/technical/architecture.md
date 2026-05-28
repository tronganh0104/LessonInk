# Kiến trúc

LessonInk Desktop là ứng dụng Tauri + React + TypeScript với kiến trúc local-first.

## Các lớp chính

- `src/app`: Khung ứng dụng, providers và định nghĩa route.
- `src/pages`: Ghép các page cấp cao.
- `src/features/board`: Trạng thái domain của bảng và trang.
- `src/features/canvas`: Đối tượng canvas, công cụ, lịch sử thao tác và ranh giới rendering engine.
- `src/features/documents`: Định dạng dự án LessonInk cùng ranh giới import/export.
- `src/features/presenter`: Chế độ trình bày cho chia sẻ màn hình.
- `src/features/timer`: Trạng thái và UI của đồng hồ.
- `src/storage`: Lưu file cục bộ, tự động lưu và file gần đây.
- `src/shared`: Component, hook, utility, constant và type dùng chung.

## Ranh giới

Frontend sở hữu trạng thái UI và mô hình tài liệu. Tauri chỉ nên được dùng cho năng lực desktop như hộp thoại chọn file và truy cập file system cục bộ.

Kiến trúc này không có backend, cơ sở dữ liệu từ xa, triển khai cloud, xác thực, cộng tác thời gian thực, thanh toán hoặc dịch vụ AI.

## Hiện trạng triển khai

Repository hiện có các placeholder và ranh giới type rõ ràng. Bước tiếp theo là triển khai canvas engine và thao tác file cục bộ phía sau các interface hiện có.
