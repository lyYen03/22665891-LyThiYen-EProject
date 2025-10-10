# EProject Phase 1 – Microservices E-Commerce System

## 1. Giới thiệu

Dự án triển khai mô hình **E-Commerce** theo kiến trúc **Microservices** gồm 4 dịch vụ chính:

| Service | Port | Chức năng chính |
|----------|------|------------------|
| **Auth Service** | 3000 | Xử lý đăng ký, đăng nhập, xác thực bằng JWT |
| **Product Service** | 3001 | Quản lý sản phẩm, mua hàng |
| **Order Service** | 3002 | Nhận và lưu đơn hàng từ RabbitMQ |
| **API Gateway** | 3003 | Trung gian định tuyến các request giữa các service |

Mỗi service được phát triển, chạy độc lập, giao tiếp qua HTTP hoặc RabbitMQ.

---

## 2. Cấu trúc dự án

```
EProject-Phase-1/
│
├── api-gateway/        # Điều hướng request
│   ├── index.js
│   └── README.md
│
├── auth/               # Đăng ký, đăng nhập, xác thực
│   ├── src/
│   └── README.md
│
├── product/            # Quản lý sản phẩm, gửi đơn hàng
│   ├── src/
│   └── README.md
│
├── order/              # Nhận và lưu đơn hàng
│   ├── src/
│   └── README.md
│
└── README.md           # File mô tả tổng thể
```

---

## 3. Cách cài đặt và khởi chạy

### Bước 1. Chuẩn bị môi trường
Cài đặt:
- **Node.js**
- **MongoDB**
- **Docker** (để chạy RabbitMQ)

Chạy RabbitMQ bằng Docker:
```bash
docker run -d --hostname my-rabbit --name rabbitmq   -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

RabbitMQ Management UI: [http://localhost:15672](http://localhost:15672)  
Đăng nhập: `guest / guest`

---

### Bước 2. Cài đặt thư viện cho từng service
Mở 4 terminal riêng và chạy trong từng thư mục:

```bash
npm install
node index.js
```

Kết quả mong đợi:
```
MongoDB connected
RabbitMQ connected
Server started on port [3000 / 3001 / 3002 / 3003]
```

---

## 4. Cách kiểm thử các service

### Auth Service (port 3000)
- `POST /register` → đăng ký tài khoản
- `POST /login` → đăng nhập, nhận JWT
- `GET /dashboard` → xác thực token

### Product Service (port 3001)
- `POST /api/products` → thêm sản phẩm
- `GET /api/products` → lấy danh sách sản phẩm
- `POST /api/products/buy` → gửi đơn hàng sang RabbitMQ

### Order Service (port 3002)
- Tự động nhận đơn hàng từ hàng đợi `orders`
- Lưu vào MongoDB
- Gửi phản hồi lại hàng đợi `products`

### API Gateway (port 3003)
Định tuyến request:
```
/auth     → http://localhost:3000
/products → http://localhost:3001/api/products
/orders   → http://localhost:3002/api/orders
```

---

## 5. Tổng kết trạng thái hệ thống

| Service | Port | Trạng thái | Mô tả |
|----------|------|-------------|--------|
| Auth Service | 3000 |  Hoạt động | Đăng ký & đăng nhập |
| Product Service | 3001 |  Hoạt động | CRUD sản phẩm & gửi order |
| Order Service | 3002 |  Hoạt động | Lưu order qua RabbitMQ |
| API Gateway | 3003 |  Hoạt động | Kết nối & định tuyến các service |

---

## 6. Kết luận

- Hệ thống hoạt động theo mô hình **Microservices hoàn chỉnh**.  
- Kết nối thành công giữa **MongoDB**, **RabbitMQ**, và **API Gateway**.  
- Các chức năng chính được kiểm thử đầy đủ bằng **Postman**.  
- Dự án đáp ứng đúng yêu cầu của **EProject Phase 1**.
