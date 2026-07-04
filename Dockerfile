# ==========================================
# STAGE 1: Build ứng dụng React với Node.js
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Sao chép package.json và package-lock.json để tận dụng Docker layer cache cho dependencies
COPY package.json package-lock.json ./

# Cài đặt dependencies (sử dụng npm ci để cài đặt sạch, nhất quán và nhanh hơn)
RUN npm ci

# Sao chép toàn bộ mã nguồn (loại trừ các file trong .dockerignore)
COPY . .

# Build ứng dụng sang dạng static files (đầu ra sẽ ở thư mục /app/dist)
RUN npm run build

# ==========================================
# STAGE 2: Khởi chạy Production Web Server bằng Nginx
# ==========================================
FROM nginx:1.27-alpine-slim

# Copy file cấu hình Nginx tùy chỉnh hỗ trợ định tuyến Single Page Application (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Sao chép các file tĩnh đã build thành công từ Stage 1 sang thư mục mặc định của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Mở cổng 80 cho HTTP traffic
EXPOSE 80

# Chạy Nginx ở chế độ foreground (không daemonize) để Docker quản lý lifecycle của tiến trình
CMD ["nginx", "-g", "daemon off;"]
