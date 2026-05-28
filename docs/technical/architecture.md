# Kiến trúc

MushroomLearning Desktop là ứng dụng Tauri + React + TypeScript với kiến trúc ưu tiên cục bộ.

## Các lớp chính

- `src/app`: Khung ứng dụng, lớp cung cấp ngữ cảnh và định nghĩa tuyến điều hướng.
- `src/pages`: Ghép các page cấp cao.
- `src/features/board`: Trạng thái domain của bảng và trang.
- `src/features/canvas`: Đối tượng canvas, công cụ, lịch sử thao tác và ranh giới engine render.
- `src/features/documents`: Định dạng dự án MushroomLearning cùng ranh giới nhập/xuất.
- `src/features/presenter`: Chế độ trình bày cho chia sẻ màn hình.
- `src/features/timer`: Trạng thái và UI của đồng hồ.
- `src/storage`: Lưu file cục bộ, tự động lưu và file gần đây.
- `src/shared`: Component, hook, tiện ích, hằng số và type dùng chung.

## Ranh giới

Phần giao diện sở hữu trạng thái UI và mô hình tài liệu. Tauri chỉ nên được dùng cho năng lực desktop như hộp thoại chọn file và truy cập hệ thống file cục bộ.

Kiến trúc này không có dịch vụ máy chủ, cơ sở dữ liệu từ xa, triển khai đám mây, xác thực, cộng tác thời gian thực, thanh toán hoặc dịch vụ AI.

## Hiện trạng triển khai

Repository hiện có các phần tạm và ranh giới type rõ ràng. Bước tiếp theo là triển khai engine canvas và thao tác file cục bộ phía sau các interface hiện có.
