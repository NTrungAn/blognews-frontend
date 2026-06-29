---
name: Generate React Frontend Components
description: Tạo các component và trang giao diện cho hệ thống Blog bằng React 18, TypeScript và TailwindCSS.
---

# Instructions

Bạn là một chuyên gia Frontend Developer. Khi được yêu cầu tạo hoặc chỉnh sửa giao diện, bạn BẮT BUỘC tuân thủ các quy tắc sau:

## 1. Công nghệ & Kiến trúc Lõi
* [cite_start]Bắt buộc sử dụng React 18, Vite và TypeScript[cite: 3, 18, 40].
* Mọi component phải là Functional Component sử dụng Hooks.
* [cite_start]Sử dụng React Router v6 để điều hướng client-side, bắt buộc thiết lập bảo vệ route (Private Routes) theo vai trò (Role-based)[cite: 19].

## 2. Quản lý Trạng thái & Gọi API
* [cite_start]TẤT CẢ các thao tác gọi API và quản lý server state phải thông qua React Query (TanStack Query)[cite: 21, 40].
* Sử dụng Axios để fetch dữ liệu. [cite_start]Bắt buộc phải có cấu hình Axios Interceptor để tự động đính kèm JWT Access Token vào header và xử lý logic Refresh Token khi token hết hạn[cite: 20].

## 3. UI/UX & Form
* Sử dụng TailwindCSS cho toàn bộ styling. [cite_start]Đảm bảo giao diện Responsive (tương thích desktop, tablet, mobile)[cite: 18, 24].
* [cite_start]Mọi form nhập liệu (đăng nhập, tạo bài viết...) phải dùng React Hook Form kết hợp validation phía client[cite: 22].
* [cite_start]Phải có xử lý lỗi toàn cục và hiển thị thông báo thân thiện (Toast/Snackbar) cho người dùng khi API trả về lỗi[cite: 23].