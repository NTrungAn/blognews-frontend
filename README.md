# 💻 Blog News - Frontend (React + TypeScript + Vite)

Đây là mã nguồn phần **Frontend** của ứng dụng tin tức và blog **Blog News**. Dự án được xây dựng dựa trên React, TypeScript và Vite, mang lại trải nghiệm giao diện mượt mà, phản hồi nhanh và hiện đại.

Để hệ thống hoạt động đầy đủ, bạn cần chạy ứng dụng này song song với phần **Backend**.

🔗 **Link Repository Backend:** [Link Repo Backend](https://github.com/your-username/your-backend-repo-name) *(Vui lòng thay thế bằng link thực tế của bạn)*

---

## 🛠️ Yêu Cầu Hệ Thống (Prerequisites)
Đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
*   **Node.js (LTS)** phiên bản 18.x hoặc 20.x trở lên.
*   **npm** (thường đi kèm khi cài đặt Node.js).

---

## 🔑 Cấu Hình Biến Môi Trường (Environment Variables)

Frontend sử dụng công cụ Vite để quản lý các biến môi trường. Bạn cần định nghĩa URL của API Backend để Frontend có thể gửi các yêu cầu HTTP.

1. Di chuyển vào thư mục dự án:
   ```bash
   cd blog-frontend
   ```
2. Tạo bản sao từ file ví dụ cấu hình môi trường:
   *   **Windows (PowerShell):**
       ```powershell
       Copy-Item .env.example .env.local
       ```
   *   **Linux / macOS / Git Bash:**
       ```bash
       cp .env.example .env.local
       ```
3. Mở file [.env.local](file:///d:/blognews/blog-frontend/.env.local) vừa tạo và thiết lập đường dẫn đến Backend API:
   ```env
   # URL gốc của Spring Boot backend API
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

---

## 🚀 Hướng Dẫn Khởi Chạy

### Cách 1: Chạy trực tiếp trên máy Host (Local Development)

1. Cài đặt các thư viện phụ thuộc (dependencies):
   ```bash
   npm install
   ```
2. Khởi chạy máy chủ phát triển (Dev Server):
   ```bash
   npm run dev
   ```
3. Sau khi chạy lệnh, Vite sẽ hiển thị URL truy cập cục bộ (thường là `http://localhost:5173`). Hãy mở trình duyệt và truy cập vào địa chỉ này.

### Cách 2: Đóng gói và chạy bằng Docker độc lập

Nếu bạn muốn chạy Frontend bằng Docker mà không cần cài đặt Node.js:

1. Build image Docker cho Frontend:
   ```bash
   docker build -t blog-frontend .
   ```
2. Khởi chạy container trên cổng `3000` (được phục vụ bởi Nginx bên trong container):
   ```bash
   docker run -d -p 3000:80 --name blog-frontend-app blog-frontend
   ```
3. Truy cập trang web qua địa chỉ: `http://localhost:3000`.

---

## 📦 Xây Dựng Bản Production (Build)
Để biên dịch dự án thành các file HTML/JS/CSS tĩnh tối ưu cho việc deploy lên môi trường production (như Netlify, Vercel, Hostinger...):
```bash
npm run build
```
Thư mục kết quả sau khi build sẽ là `/dist`.

---

## 🛡️ Lưu ý Bảo mật
*   File `.env.local` chứa cấu hình môi trường chạy cục bộ của bạn và đã được đưa vào `.gitignore`. **Tuyệt đối không** commit và push file này lên GitHub để đảm bảo an toàn thông tin.
