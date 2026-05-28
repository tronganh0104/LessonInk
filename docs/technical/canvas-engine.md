# Canvas engine

Canvas engine là bề mặt dạy học cốt lõi của LessonInk.

## Trách nhiệm

- Render trang và các đối tượng canvas.
- Theo dõi đối tượng bút, tẩy, highlight, văn bản, hình vẽ, hình ảnh và trang PDF.
- Hỗ trợ pan và zoom.
- Duy trì lịch sử thao tác cho hoàn tác/làm lại.
- Giữ nét viết phản hồi nhanh trong buổi học dài.

## Ranh giới hiện tại

`src/features/canvas/engine/canvasEngine.ts` đang chứa interface placeholder cho renderer. Việc triển khai nên bắt đầu bằng một spike nhỏ với thư viện canvas đã được chứng minh như Konva.js hoặc Fabric.js.

## Mục tiêu hiệu năng

- Nét bút có độ trễ thấp.
- Bộ nhớ ổn định trong buổi học 45-90 phút.
- Chuyển trang nhanh.
- Đường xuất file hiệu quả cho PDF/PNG.
