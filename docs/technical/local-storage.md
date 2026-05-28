# Lưu trữ cục bộ

LessonInk lưu file dự án do giáo viên sở hữu trên chính máy của giáo viên.

## Loại dữ liệu lưu trữ

- File dự án `.lessonink` do giáo viên chọn vị trí lưu.
- Snapshot tự động lưu trên máy.
- Metadata file gần đây.
- Asset được nhập, có thể nhúng vào dự án hoặc tham chiếu tới file cục bộ tùy độ phức tạp của MVP.

## Nguyên tắc

- Không lưu dữ liệu lên server.
- Không yêu cầu tài khoản người dùng.
- Tự động lưu không được làm gián đoạn buổi học trực tiếp.
- Sau crash, luồng khôi phục phải rõ ràng.

## Ghi chú triển khai

Phiên bản đầu có thể dùng định dạng `.lessonink` dựa trên JSON. Khi xây UI lưu/tải, API file system của Tauri nên được bọc trong `src/storage/localFileSystem.ts`.
