## Họ và tên: Ngô Bá Duy
## MSSV: 24520382

## 1. Cấu trúc project bao gồm

- `app/`: Thư mục chính của ứng dụng (backend + frontend)
  * Bao gồm:

---

- `static/`: Frontend (tài nguyên tĩnh)
  * Bao gồm:
  - `app.js`: Xử lý logic phía client (gửi API, render dữ liệu, visualize B-Tree)
  - `style.css`: Thiết kế giao diện (UI/UX, dark mode, layout)

---

- `templates/`: Giao diện HTML
  * Bao gồm:
  - `index.html`: Trang chính của ứng dụng (form nhập liệu, bảng dữ liệu, visualize B-Tree)

---

- `__init__.py`: Khởi tạo ứng dụng Flask
  * Bao gồm:
  - Tạo app Flask
  - Đăng ký blueprint (routes)


- `btree.py`: Cấu trúc dữ liệu B-Tree
  * Bao gồm:
  - Cài đặt B-Tree bậc 3
  - Các thao tác: insert, search
  - Trace phục vụ visualize tìm kiếm


- `main.py`: Controller / API
  * Bao gồm:
  - Định nghĩa các endpoint (`/add`, `/delete`, `/find`, `/trace`)
  - Nhận request từ frontend
  - Gọi service xử lý và trả response


- `models.py`: Data model
  * Bao gồm:
  - Định nghĩa cấu trúc sinh viên (MSSV, họ tên, giới tính, ngày sinh, quê quán, khoa)


- `repository.py`: Data access layer
  * Bao gồm:
  - Thao tác với database (Supabase)
  - Insert, delete, query sinh viên


- `service.py`: Business logic
  * Bao gồm:
  - Xử lý logic chính của hệ thống
  - Kết nối giữa controller và repository
  - Cập nhật và rebuild B-Tree

##  Các file cấu hình và ứng dụng:

- `run.py`: Entry point của ứng dụng
  * Bao gồm:
  - Khởi chạy Flask server
  - Gọi hàm tạo app (`create_app()`)

- `requirements.txt`: Danh sách các thư viện cần để cài đặt
  * Cài đặt:
```bash
    pip install -r requirements.txt
```

- `.env`: File cấu hình môi trường
  * Bao gồm:
  - SUPABASE_URL
  - SUPABASE_KEY
  - Dùng để kết nối database và bảo mật thông tin

- `schema.sql`: Cấu trúc database dùng để khởi tạo database ban đầu 


## 2. Chức năng có sẵn

- Thêm sinh viên
- Xóa sinh viên theo MSSV
- Tìm theo MSSV
- Tìm theo họ tên

- Hiển thị:
  - bảng dữ liệu gốc
  - B-Tree theo MSSV
  - B-Tree theo họ tên

- Visualize tìm kiếm mssv và họ tên trên B-Tree



## 3. Ý tưởng thiết kế

### Database
Database là nơi lưu dữ liệu thật.

### B-Tree
B-Tree đóng vai trò:
- minh họa chỉ mục
- trực quan hóa thao tác tìm kiếm/chèn/xó

## 7. Luồng hoạt động của hệ thống

Hệ thống hoạt động theo mô hình **Client – Server**, trong đó:

- **Frontend (HTML/CSS/JavaScript)**: xử lý giao diện và tương tác người dùng  
- **Backend (Flask)**: xử lý logic và API  
- **Database (Supabase)**: lưu trữ dữ liệu  
- **B-Tree**: chỉ mục trong bộ nhớ giúp tăng tốc tìm kiếm  

---

### Tổng quan luồng dữ liệu

Luồng xử lý chung của hệ thống:

1. Người dùng thao tác trên giao diện (Frontend)
2. Frontend gửi request đến Backend thông qua API
3. Backend xử lý logic và tương tác với Database
4. Backend cập nhật lại B-Tree (index)
5. Backend trả về trạng thái mới (state)
6. Frontend render lại bảng dữ liệu và cây B-Tree

## Luồng thêm sinh viên

1. Người dùng nhập thông tin sinh viên và nhấn **"Thêm sinh viên"**

2. Frontend gửi request:

```bash
POST /add
```
3. Backend thực hiện:
Validate dữ liệu
Ghi dữ liệu vào database

4. Backend cập nhật index:
Insert MSSV vào B-Tree MSSV
Insert họ tên vào B-Tree họ tên

5. Backend trả về:
Danh sách sinh viên mới
Cấu trúc B-Tree mới

6. Frontend:
Cập nhật bảng dữ liệu
Render lại cây B-Tree

## Luồng xoá sinh viên
1. Người dùng nhập MSSV và nhấn "Xóa"

2. Frontend gửi request:
```bash
DELETE /delete/{mssv}
```

3. Backend:
Xóa sinh viên khỏi database

4. Backend cập nhật index:
Rebuild lại toàn bộ B-Tree từ database

5.Backend trả về trạng thái mới

6.Frontend:
Cập nhật bảng dữ liệu
Render lại cây B-Tree


## Luồng tìm kiếm theo MSSV

1. Người dùng nhập MSSV

2. Frontend gửi request:
```bash
GET /find/mssv/{mssv}
```

3. Backend:
Tìm kiếm MSSV trên B-Tree
Nếu tìm thấy → truy vấn database để lấy thông tin chi tiết

4. Backend trả về:
Kết quả tìm kiếm
Trạng thái cây B-Tree

5. Frontend hiển thị kết quả

## Luồng tìm kiếm theo họ tên

1. Người dùng nhập họ tên

2. Frontend gửi request:
```bash
GET /find/name/{name}
```
3. Backend:
Chuẩn hóa họ tên
Tìm kiếm trên B-Tree họ tên
Lấy danh sách MSSV tương ứng
Truy vấn database để lấy thông tin chi tiết

4. Backend trả về danh sách sinh viên
5. Frontend hiển thị kết quả

## Luồng mô phỏng tìm kiếm (Visualization)

1. Người dùng nhập giá trị và nhấn "Visualize search"

2. Frontend gửi request:
```bash
GET /trace/{type}/{value}
```
3. Backend:
Thực hiện tìm kiếm trên B-Tree
Ghi lại đường đi (trace)
Trả về danh sách các bước tìm kiếm

4. Frontend:
Duyệt từng bước trong trace
Highlight node tương ứng
Hiển thị quá trình tìm kiếm theo thời gian thực

