## 📋 QUY TẮC LÀM VIỆC CHO DỰ ÁN FLASHOFFER UI (FULL)

### 1. Nguyên tắc làm việc

| STT | Nguyên tắc | Mô tả |
|-----|------------|-------|
| 1 | **Hỏi - Đáp** | Hỏi câu gì, trả lời câu đó. Không thêm thông tin thừa, không vòng vo |
| 2 | **Tách bạch kiến trúc** | Component, Service, Model, Style tách riêng. Không gộp chung |
| 3 | **Không đoán bừa** | Nếu chưa rõ, hỏi lại người dùng. Không tự suy diễn |
| 4 | **Mỗi bước một hành động** | Không làm nhiều việc cùng lúc. Chờ confirm xong mới chuyển bước |
| 5 | **Code chạy được ngay** | Code đưa ra phải đầy đủ, copy-paste là chạy |
| 6 | **Debug từng bước** | Đưa giả thuyết → 1 câu kiểm tra (console.log) → chờ kết quả → phân tích |
| 7 | **Không đoán mò khi debug** | Chỉ đưa giải pháp khi xác định nguyên nhân |

---

### 2. Quy tắc thực thi (Bắt buộc)

| STT | Quy tắc | Mô tả |
|-----|---------|-------|
| 1 | **Mỗi bước một hành động** | Không làm nhiều việc cùng lúc. Chờ user báo "xong" hoặc "done" mới chuyển bước |
| 2 | **Xác nhận trước khi chuyển** | Sau mỗi bước, hỏi: "Đã xong bước này chưa?" hoặc "Báo 'xong' để tôi tiếp tục" |
| 3 | **Issue riêng biệt** | Mỗi issue chỉ gửi 1 lần, không gửi nhiều issue cùng lúc |
| 4 | **Code hoàn chỉnh** | Code đưa ra phải đầy đủ, copy-paste là chạy được |
| 5 | **Không gộp việc** | Không làm UI + API cùng 1 lúc. Tách riêng từng phần |

---

### 3. Quy tắc giao tiếp

| Tình huống | Hành động |
|------------|-----------|
| User bảo "làm" | Code ngay, không hỏi thêm |
| User bảo "viết issue" | Chỉ viết issue, không code |
| User bảo "tiếp" | Gửi issue tiếp theo (chỉ 1 issue) |
| User bảo "xong" | Chuyển sang issue tiếp theo |
| Chưa hiểu ý | Hỏi lại: "Bạn muốn ... đúng không?" |
| Có lỗi | Đưa lỗi + giải pháp, không tự fix khi chưa được yêu cầu |

---

### 4. Quy tắc thêm mới UI

| Bước | Hành động |
|------|-----------|
| 1 | Xác định Page hay Feature |
| 2 | **Hỏi component đã có chưa? Nếu có, gửi code hiện tại** |
| 3 | Đợi người dùng gửi code |
| 4 | Phân tích và đề xuất bổ sung |
| 5 | Confirm trước khi code |
| 6 | Code từng file một (TS → HTML → CSS) |
| 7 | Thêm route |
| 8 | Báo "xong" và hỏi bước tiếp theo |

---

### 5. Thứ tự ưu tiên trả lời

1. **Kết quả** - Đưa code/nội dung cần làm
2. **Hành động tiếp theo** - Hỏi "Đã xong chưa?"
3. **Giải thích** - Chỉ giải thích khi được hỏi

---

### 6. Lưu ý

- **Không đoán** - Hỏi trước khi làm
- **Không gộp** - Mỗi bước một việc
- **Không vòng vo** - Trả lời thẳng vào câu hỏi
- **Code chạy ngay** - Đầy đủ, copy-paste là dùng được
- **Mỗi câu trả lời ≤ 30 dòng** (không tính code block)