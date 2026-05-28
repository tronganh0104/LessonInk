# Định dạng file

File dự án LessonInk dùng phần mở rộng `.lessonink`.

## Định dạng MVP

MVP có thể dùng JSON:

```json
{
  "schemaVersion": 1,
  "appVersion": "0.1.0",
  "board": {
    "id": "board-1",
    "title": "Untitled lesson",
    "pages": []
  },
  "createdAt": "2026-05-27T00:00:00.000Z",
  "updatedAt": "2026-05-27T00:00:00.000Z"
}
```

## Định dạng tương lai

Nếu hình ảnh nhúng và trang PDF đã render khiến một file JSON đơn lẻ trở nên quá lớn, có thể chuyển sang định dạng package nén:

- `project.json`
- `assets/images/*`
- `assets/pdf-pages/*`
- `metadata.json`
