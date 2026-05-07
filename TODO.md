📝 LỘ TRÌNH VÀ CHỨC NĂNG DỰ ÁN ELEARNING SINH HỌC

🚀 I. LỘ TRÌNH PHÁT TRIỂN (ROADMAP)

Giai đoạn 1: Khởi tạo & Kết nối Database ✅

[x] Khởi tạo dự án .NET 8 Web API.

[x] Thiết lập Database PostgreSQL trên Vercel/Neon.

[x] Chuyển đổi Connection String từ định dạng URI sang Key-Value để tương thích với .NET.

[x] Cài đặt các thư viện nền tảng: Npgsql.EntityFrameworkCore.PostgreSQL, Design, Tools.

Giai đoạn 2: Xây dựng cấu trúc dữ liệu (Code-First) ✅

[x] Thiết lập 8 Entity Models độc lập:

User, TeacherStudent, News, Course, Lesson, Test, Enrollment, TestResult.

[x] Cấu hình AppDbContext:

Mapping quan hệ giữa các bảng.

Sử dụng Fluent API để thiết lập khóa chính kép cho bảng trung gian TeacherStudent.

[x] Phân tách Models thành các file riêng biệt để dễ quản lý.

Giai đoạn 3: Migration & Thực thi Database ✅

[x] Chạy Add-Migration InitialCreate để tạo kịch bản cấu trúc.

[x] Chạy Update-Database để đẩy cấu trúc lên Vercel.

[x] Xử lý lỗi xác thực mật khẩu (28P01) bằng cách loại bỏ hậu tố -pooler trong Host.

[x] Khắc phục lỗi quan hệ navigation giữa Teacher và Student.

Giai đoạn 4: Bảo mật & Phân quyền (Auth) 🔄

[x] Cài đặt thư viện: Microsoft.AspNetCore.Authentication.JwtBearer, BCrypt.Net-Next.

[x] Cấu hình JWT trong appsettings.json và Program.cs.

[x] Thiết lập AuthService và AuthController:

Chức năng Đăng ký (Register): Mặc định Role = Student (2).

Chức năng Đăng nhập (Login): Trả về JWT Token chứa ID, Email và Role.

[x] Cấu hình CORS để kết nối với Frontend React (Cổng 5173).

[x] Xử lý triệt để các cảnh báo Nullable Reference Types (CS8618, CS8604) bằng từ khóa required và toán tử ?.

Giai đoạn 5: Xây dựng API Logic nghiệp vụ ⏳

[x] Phân hệ Admin: API Quản lý News, Users, Thay đổi Role.

[x] Phân hệ Teacher: API Quản lý Student, Upload bài giảng (Video/PDF).

[x] Phân hệ Student: API Đăng ký khóa học, Làm bài kiểm tra, Theo dõi tiến độ.

🛠️ II. HỆ THỐNG CHỨC NĂNG THEO PHÂN QUYỀN

🛡️ 1. Admin (Quản trị viên) - Role 0

[x] Quản lý nội dung: CRUD Tin tức (bài báo Sinh học), đăng tải Khóa học/Bài giảng gốc.

[ ] Quản lý người dùng:

CRUD tài khoản Giáo viên và Học sinh.

Thay đổi vai trò (Role) của người dùng (ví dụ: nâng cấp Student lên Teacher).

[ ] Thống kê hệ thống: Xem tổng quan số lượng User, Khóa học, Bài giảng và Tin tức.

🎓 2. Teacher (Giáo viên) - Role 1

[ ] Quản lý học sinh: CRUD và theo dõi danh sách học sinh do mình phụ trách (qua bảng TeacherStudent).

[ ] Quản lý nội dung: Upload/Update bài giảng bao gồm Video URL và tài liệu PDF.

[ ] Theo dõi học thuật:

Xem tiến độ hoàn thành bài học của học sinh.

Xem điểm số và kết quả làm bài trắc nghiệm của học sinh.

[ ] Thống kê riêng: Báo cáo về các khóa học và học sinh thuộc quyền quản lý.

📖 3. Student (Học sinh) - Role 2

[ ] Học tập: Tìm kiếm, tham gia khóa học và xem nội dung bài giảng (Video/PDF).

[ ] Kiểm tra: Thực hiện các bài Quiz để đánh giá năng lực sau bài học.

[ ] Tiến độ: Theo dõi phần trăm hoàn thành khóa học và lịch sử điểm số cá nhân.

📊 III. CẤU TRÚC DỮ LIỆU CỐT LÕI (8 MODELS)

User: Tài khoản & Role (0: Admin, 1: Teacher, 2: Student).

TeacherStudent: Liên kết giáo viên quản lý học sinh.

News: Tin tức Sinh học.

Course: Thông tin khóa học tổng quát.

Lesson: Bài học chi tiết (Video + PDF).

Test: Đề kiểm tra/Quiz.

Enrollment: Theo dõi việc tham gia khóa học & tiến độ (%).

TestResult: Kết quả thi và trạng thái (Pass/Fail).