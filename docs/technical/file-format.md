# Định dạng file

File dự án MushroomLearning dùng phần mở rộng `.mushroomlearning`.

## Định dạng MVP

MVP dùng JSON trong file có phần mở rộng `.mushroomlearning`. Canvas không lưu pixel thô hoặc
đối tượng nội bộ của Konva; file chỉ lưu các đối tượng domain của MushroomLearning như bảng, trang và nét vẽ.

```json
{
  "schemaVersion": 1,
  "app": "MushroomLearning",
  "project": {
    "id": "project-id",
    "title": "Bài học chưa đặt tên",
    "createdAt": "2026-05-28T00:00:00.000Z",
    "updatedAt": "2026-05-28T00:00:00.000Z"
  },
  "board": {
    "id": "board-1",
    "title": "Bảng chưa đặt tên",
    "activePageId": "page-1",
    "pages": [
      {
        "id": "page-1",
        "title": "Trang 1",
        "index": 0,
        "background": {
          "type": "blank",
          "color": "#ffffff"
        },
        "objects": [],
        "createdAt": "2026-05-28T00:00:00.000Z",
        "updatedAt": "2026-05-28T00:00:00.000Z"
      }
    ],
    "createdAt": "2026-05-28T00:00:00.000Z",
    "updatedAt": "2026-05-28T00:00:00.000Z"
  }
}
```

### Đối tượng nét vẽ v0.4

Đối tượng nét vẽ được lưu dưới dạng dữ liệu có cấu trúc:

```json
{
  "id": "stroke-1",
  "pageId": "page-1",
  "kind": "stroke",
  "type": "stroke",
  "tool": "pen",
  "points": [
    {
      "x": 12,
      "y": 24,
      "inputType": "pen",
      "pressure": 0.5
    }
  ],
  "color": "#111827",
  "opacity": 1,
  "width": 4,
  "x": 0,
  "y": 0,
  "rotation": 0,
  "locked": false,
  "createdAt": "2026-05-28T00:00:00.000Z",
  "updatedAt": "2026-05-28T00:00:00.000Z"
}
```

`pressure` là trường không bắt buộc và sẽ được giữ lại khi có trong dữ liệu. Luồng trên trình duyệt ở v0.4 lưu bằng cách tải Blob xuống máy và mở bằng cách tải file lên, nhờ đó quá trình phát triển vẫn chạy được trước khi API hệ thống file của Tauri sẵn sàng.

## Định dạng tương lai

Nếu hình ảnh nhúng và trang PDF đã render khiến một file JSON đơn lẻ trở nên quá lớn, có thể chuyển sang định dạng package nén:

- `project.json`
- `assets/images/*`
- `assets/pdf-pages/*`
- `metadata.json`
