# Cấu trúc dự án React E-Learning (Biology Focus)

Dưới đây là chi tiết các trang và chức năng của hệ thống học trực tuyến chuyên về Sinh học.

---

## 1. Các Trang Chính (Public Pages)

### 1.1 Trang chủ (Home Page) - `/`
*   **Hero Section**: Giới thiệu dự án "Khám Phá Sinh Học" với nút kêu gọi hành động (CTA).
*   **Lộ trình khám phá**: Hiển thị quy trình học tập (Nghiên cứu -> Sáng tạo -> Tương tác -> Cải tiến).
*   **Danh sách khóa học**: Hiển thị các danh mục khóa học nổi bật (Sinh học tế bào, Di truyền học, Vi sinh vật, Tiến hóa).
*   **Hệ sinh thái số**: Giới thiệu về tài nguyên học liệu số và chuyên gia.
*   **Tin tức & Hoạt động**: Các bài viết mới nhất về đời sống học đường và CLB.
*   **Phản hồi học viên**: Hiển thị đánh giá từ người dùng.

### 1.2 Đăng nhập (Login Page) - `/login`
*   Form đăng nhập với Email và Mật khẩu.

### 1.3 Đăng ký (Signup Page) - `/signup`
*   Form tạo tài khoản mới (Họ tên, Email, Mật khẩu).

---

## 2. Các Phân Hệ Người Dùng (Dashboards)

### 2.1 Quản trị viên (Admin Dashboard) - `/admin`
*   **Thống kê tổng quan**: Xem tổng số người dùng, số lượng khóa học và bài giảng.
*   **Quản lý người dùng**: Danh sách người dùng, chức năng Chỉnh sửa và Xóa.
*   **Quản lý khóa học**: (Sidebar link) Truy cập khu vực quản lý nội dung đào tạo.
*   **Thống kê hệ thống**: (Sidebar link) Xem báo cáo chi tiết.

### 2.2 Giáo viên (Teacher Dashboard) - `/teacher`
*   **Thống kê cá nhân**: Xem số lượng học sinh đang theo học, số bài giảng đã tạo và tỷ lệ hoàn thành.
*   **Quản lý bài giảng**: (Sidebar link) Tạo mới, cập nhật tài liệu học tập.
*   **Quản lý học sinh**: (Sidebar link) Theo dõi danh sách và tiến độ của học sinh.
*   **Thống kê lớp học**: (Sidebar link) Báo cáo hiệu quả giảng dạy.

### 2.3 Học sinh (Student Dashboard) - `/student`
*   **Tiến độ học tập**: Thanh tiến trình hiển thị mức độ hoàn thành khóa học chung (%).
*   **Danh sách bài giảng**: Liệt kê các bài học, trạng thái (Đã hoàn thành/Chưa mở khóa).
*   **Học tập/Xem lại**: Nút truy cập nhanh vào nội dung bài học.
*   **Cài đặt tài khoản**: (Sidebar link) Quản lý thông tin cá nhân.

---

## 3. Chức năng Học tập Chi tiết

### 3.1 Chi tiết bài học (Lesson Detail) - `/lesson/:id`
*   **Thông tin bài học**: Hiển thị tiêu đề và mô tả chi tiết của bài học.
*   **Danh sách tài liệu**: Liệt kê các tệp tin đính kèm (PDF, Video, v.v.).
*   **Trình xem nội dung (Viewer)**:
    *   **Xem PDF**: Tích hợp trình xem tài liệu trực tiếp.
    *   **Xem Video**: Trình phát video (MP4/WebM) hỗ trợ học qua clip.
*   **Điều hướng**: Nút quay lại trang trước đó.

---

## 4. Cấu trúc Kỹ thuật & Thành phần Chung
*   **Header**: Thanh điều hướng chứa Logo và các liên kết chính.
*   **Footer**: Thông tin liên hệ, bản quyền và các liên kết mạng xã hội.
*   **Responsive Design**: Giao diện tương thích với nhiều thiết bị (Mobile, Tablet, Desktop).
*   **Data Management**: Sử dụng `localStorage` (giả lập database) để lưu trữ thông tin khóa học và bài học.
