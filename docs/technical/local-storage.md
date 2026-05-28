# Lưu trữ cục bộ

MushroomLearning lưu file dự án do giáo viên sở hữu trên chính máy của giáo viên.

## Loại dữ liệu lưu trữ

- File dự án `.mushroomlearning` do giáo viên chọn vị trí lưu.
- Snapshot tự động lưu trên máy.
- Siêu dữ liệu file gần đây.
- Tài nguyên được nhập, có thể nhúng vào dự án hoặc tham chiếu tới file cục bộ tùy độ phức tạp của MVP.

## Nguyên tắc

- Không lưu dữ liệu lên máy chủ.
- Không yêu cầu tài khoản người dùng.
- Tự động lưu không được làm gián đoạn buổi học trực tiếp.
- Sau khi ứng dụng bị crash, luồng khôi phục phải rõ ràng.

## Ghi chú triển khai

Phiên bản đầu có thể dùng định dạng `.mushroomlearning` dựa trên JSON. Khi xây UI lưu/tải, API hệ thống file của Tauri nên được bọc trong `src/storage/localFileSystem.ts`.
