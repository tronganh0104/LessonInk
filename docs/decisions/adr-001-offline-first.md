# ADR 001: Ứng dụng desktop ưu tiên ngoại tuyến

## Trạng thái

Đã chấp nhận

## Bối cảnh

MushroomLearning dành cho giáo viên đã dạy qua Zoom, Google Meet hoặc các công cụ tương tự. MVP chưa cần tài khoản học sinh, cộng tác đám mây hoặc tích hợp nền tảng họp.

## Quyết định

Xây dựng MushroomLearning Desktop như một ứng dụng Tauri ưu tiên ngoại tuyến. Dự án được lưu cục bộ, không dùng dịch vụ máy chủ, và luồng chia sẻ màn hình từ máy giáo viên là luồng sử dụng đầu tiên.

## Hệ quả

- Giảm chi phí hạ tầng và độ phức tạp vận hành.
- Giáo viên giữ quyền sở hữu file bài học.
- MVP có thể tập trung vào chất lượng nét viết, chú thích PDF/hình ảnh, xuất file và chế độ trình bày.
- Đồng bộ đám mây, cộng tác, xác thực, thanh toán và AI vẫn là lựa chọn tương lai sau khi sản phẩm chứng minh được nhu cầu sử dụng thật.
