# Frontend — MXH Web (React + Vite)

Giao diện ứng dụng mạng xã hội, xây dựng bằng **React 19** + **Vite 8** + **TypeScript**, điều hướng bằng **React Router 7**.

- Cổng mặc định: **`5173`**
- Gọi API qua proxy `/api` → `http://localhost:3456`
- Repo gốc & tài liệu chung: [`../README.md`](../README.md)

---

## 1. Yêu cầu hệ thống

| Phần mềm | Phiên bản |
| -------- | --------- |
| Node.js  | `>= 20` (kiểm chứng với v22) |
| npm      | `>= 10`   |

> Cần chạy backend trước (xem [`../backend/README.md`](../backend/README.md)) nếu muốn trang đăng nhập/bài viết hoạt động.

---

## 2. Cài đặt

```bash
cd frontend
npm install
```

Tạo file cấu hình môi trường (tuỳ chọn):

```bash
cp .env.example .env           # macOS / Linux
Copy-Item .env.example .env    # Windows PowerShell
```

---

## 3. Cấu hình biến môi trường (`.env`)

Sao chép từ `frontend/.env.example`:

```dotenv
# Base URL của API.
# Để mặc định "/api" nếu dùng proxy Vite (vite.config.ts → http://localhost:3456).
VITE_API_BASE_URL=/api
```

| Biến | Mặc định | Mô tả |
| ---- | -------- | ----- |
| `VITE_API_BASE_URL` | `/api` | Nơi `src/api/client.ts` gửi request. Để `/api` nếu dùng proxy Vite; đổi sang URL đầy đủ (ví dụ `https://api.example.com`) khi backend ở origin khác |

- Biến bắt đầu bằng `VITE_` mới được Vite nhúng vào bundle (`import.meta.env.VITE_*`).
- Không đặt secret (JWT, password) vào biến `VITE_*` — tất cả đều nằm công khai trong bundle.
- File `.env` đã nằm trong `.gitignore` — chỉ commit `.env.example`.

---

## 4. Chạy project

```bash
cd frontend
npm run dev        # dev server + HMR → http://localhost:5173
```

Các lệnh khác:

```bash
npm run build      # tsc -b (kiểm tra types) rồi vite build → dist/
npm run preview    # xem trước bản build production
npm run lint       # Oxlint
```

**Chạy đồng thời với backend** (2 terminal):

```bash
# Terminal 1
cd backend  && npm run start:dev     # → http://localhost:3456

# Terminal 2
cd frontend && npm run dev           # → http://localhost:5173
```

Mở **http://localhost:5173**.

---

## 5. Bảng lệnh (`package.json`)

| Lệnh | Mô tả |
| ---- | ----- |
| `npm run dev` | Vite dev server + HMR (port `5173`) |
| `npm run build` | `tsc -b && vite build` → `dist/` |
| `npm run preview` | Xem trước bản build production |
| `npm run lint` | Oxlint |

---

## 6. Cấu hình proxy API — `vite.config.ts`

```ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3456',   // đổi nếu PORT backend khác
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),  // /api/posts → /posts
    },
  },
},
```

- Request tới `/api/*` được chuyển tiếp sang backend và **bỏ tiền tố `/api`**.
- Nếu đổi `PORT` ở backend, phải đổi `target` tương ứng.

---

## 7. Cấu trúc thư mục

```
frontend/
├── .env.example
├── index.html
├── vite.config.ts            # proxy /api → localhost:3456
├── package.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
└── src/
    ├── main.tsx              # entry point
    ├── App.tsx               # Routes
    ├── index.css
    ├── types.ts
    ├── api/
    │   ├── client.ts         # HTTP client, đọc VITE_API_BASE_URL
    │   └── social.ts         # hàm gọi API bài viết/bình luận...
    ├── context/
    │   └── AuthContext.tsx    # trạng thái đăng nhập (JWT)
    ├── components/
    │   ├── Navbar.tsx
    │   ├── PostCard.tsx
    │   ├── PostForm.tsx
    │   ├── CommentSection.tsx
    │   ├── Avatar.tsx
    │   ├── Pagination.tsx
    │   ├── Feedback.tsx
    │   └── ProtectedRoute.tsx  # chặn trang khi chưa đăng nhập
    ├── pages/
    │   ├── LoginPage.tsx
    │   ├── RegisterPage.tsx
    │   ├── FeedPage.tsx
    │   ├── PostDetailPage.tsx
    │   ├── ProfilePage.tsx
    │   └── NotFoundPage.tsx
    └── utils/
        └── format.ts         # helper định dạng
```

---

## 8. Xử lý sự cố

| Lỗi / hiện tượng | Cách sửa |
| ----------------- | -------- |
| `Failed to proxy /api/...` | Backend chưa chạy, hoặc `PORT` khác `3456` → sửa `target` trong `vite.config.ts` |
| 401 Unauthorized | Token hết hạn hoặc `JWT_SECRET` đổi → đăng nhập lại |
| Lệnh gọi API sai đường dẫn | Kiểm tra `VITE_API_BASE_URL` trong `.env` |
| Port `5173` đã bị chiếm | `npm run dev -- --port 5174` |
| Lỗi type khi build | `npm run build` (đã chạy `tsc -b`) và sửa lỗi hiển thị |
