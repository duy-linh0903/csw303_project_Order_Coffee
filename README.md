# ☕ Coffee Cabin - Hệ Thống Order Coffee Online

![Coffee Cabin](https://img.shields.io/badge/Coffee-Cabin-brown?style=for-the-badge&logo=coffee)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

Hệ thống đặt hàng coffee trực tuyến với giao diện hiện đại, tích hợp hệ thống thẻ thành viên đa cấp và quản lý đơn hàng thông minh.

## 📋 Mục Lục

- [Tính Năng Chính](#-tính-năng-chính)
- [Hệ Thống Thẻ Thành Viên](#-hệ-thống-thẻ-thành-viên)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Cài Đặt](#-cài-đặt)
- [Hướng Dẫn Sử Dụng](#-hướng-dẫn-sử-dụng)
- [Trang Quản Trị](#-trang-quản-trị)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Demo Screenshots](#-demo-screenshots)

## ✨ Tính Năng Chính

### 🛒 Đặt Hàng & Giỏ Hàng
- **Menu đa dạng**: Hiển thị các loại coffee với hình ảnh, giá cả và mô tả chi tiết
- **Tùy chỉnh đồ uống**: 
  - Chọn size (Small, Medium, Large)
  - Điều chỉnh lượng đường (0%, 25%, 50%, 75%, 100%)
  - Chọn mức đá (No Ice, Less Ice, Normal Ice)
  - Tùy chọn loại sữa (No Milk, Regular Milk, Soy Milk, Almond Milk, Oat Milk)
  - Thêm espresso shot
  - Ghi chú đặc biệt
- **Giỏ hàng thông minh**: 
  - Thêm/xóa/cập nhật số lượng
  - Tính toán tự động: giá, thuế (10%), phí giao hàng
  - Áp dụng ưu đãi thành viên tự động
  - Hiển thị tổng chi tiết

### 💳 Hệ Thống Thanh Toán
- **Đa phương thức thanh toán**:
  - Tiền mặt (Cash)
  - Thẻ tín dụng (Credit Card)
  - PayPal
- **Tích hợp ưu đãi**:
  - Áp dụng giảm giá thẻ thành viên tự động
  - Miễn phí giao hàng cho thẻ Vàng & Kim Cương
  - Tích điểm thưởng theo hạng thẻ
- **Xác nhận đơn hàng**: Thông báo chi tiết sau khi đặt hàng thành công

### 🎁 Hệ Thống Điểm Thưởng
- **Tích điểm**: 
  - 1 điểm cho mỗi 10.000₫ chi tiêu (cập nhật mới)
  - Nhân điểm theo hạng thẻ (x2 cho Vàng, x3 cho Kim Cương)
- **Đổi thưởng**:
  - 10% Off (100 điểm)
  - 15% Off (150 điểm)
  - Free Coffee (75 điểm)
  - 50.000₫ Off (50 điểm)
- **Quản lý điểm**: Theo dõi điểm tích lũy trong profile

### 📊 Quản Lý Đơn Hàng
- **Lịch sử đơn hàng**: Xem tất cả đơn hàng đã đặt
- **Chi tiết đơn hàng**: 
  - Thông tin sản phẩm, số lượng, giá
  - Tùy chỉnh từng món
  - Phương thức thanh toán
  - Trạng thái đơn hàng
- **Sắp xếp**: Đơn hàng mới nhất hiển thị trước
- **Tìm kiếm & Lọc**: Theo trạng thái, ngày, tổng tiền

## 🏆 Hệ Thống Thẻ Thành Viên

### Hạng Thẻ & Yêu Cầu

#### 🥈 Thẻ Bạc (Silver)
- **Điều kiện**: Tổng chi tiêu ≥ 500.000₫
- **Ưu đãi**:
  - ✅ Giảm 5% tất cả đơn hàng
  - ✅ Sinh nhật tặng 50 điểm
  - ✅ Ưu tiên hỗ trợ

#### 👑 Thẻ Vàng (Gold)
- **Điều kiện**: Tổng chi tiêu ≥ 3.000.000₫
- **Ưu đãi**:
  - ✅ Giảm 10% tất cả đơn hàng
  - ✅ Tích điểm x2
  - ✅ Sinh nhật tặng 100 điểm
  - ✅ **Miễn phí giao hàng**
  - ✅ Ưu tiên đặt trước

#### 💎 Thẻ Kim Cương (Diamond)
- **Điều kiện**: Tổng chi tiêu ≥ 10.000.000₫
- **Ưu đãi**:
  - ✅ Giảm 15% tất cả đơn hàng
  - ✅ Tích điểm x3
  - ✅ Sinh nhật tặng 200 điểm
  - ✅ **Miễn phí giao hàng**
  - ✅ Sự kiện VIP độc quyền
  - ✅ Menu đặc biệt
  - ✅ Hỗ trợ ưu tiên cao cấp

### Thiết Kế Thẻ
- **Card 3D**: Hiệu ứng hover động, gradient theo hạng thẻ
- **Avatar theo cấp bậc**:
  - 👤 Guest: User circle icon
  - 🥈 Silver: Medal icon
  - 👑 Gold: Crown icon
  - 💎 Diamond: Gem icon
- **Progress bar**: Theo dõi tiến độ lên hạng
- **Real-time update**: Tự động cập nhật sau mỗi đơn hàng

## 📁 Cấu Trúc Dự Án

```
Order_Coffee/
│
├── index.html                    # Trang chủ - Landing page
│
├── assets/                       # Tài nguyên tĩnh
│   ├── css/
│   │   ├── main.css             # CSS chính (3600+ dòng)
│   │   └── admin.css            # CSS admin panel
│   ├── js/
│   │   ├── main.js              # JavaScript chính
│   │   ├── orders.js            # Logic quản lý đơn hàng
│   │   ├── membercard.js        # Logic thẻ thành viên
│   │   └── admin.js             # Logic admin panel
│   └── images/                  # Hình ảnh, icons
│
├── pages/                        # Các trang phụ
│   ├── orders.html              # Lịch sử đơn hàng
│   ├── membercard.html          # Thẻ thành viên
│   └── profile.html             # Trang profile người dùng
│
├── admin/                        # Trang quản trị
│   ├── index.html               # Admin dashboard
│   └── login.html               # Đăng nhập admin
│
├── .gitignore                    # Git ignore file
├── package.json                  # NPM configuration
├── LICENSE                       # MIT License
└── README.md                     # Documentation (file duy nhất)
```

## 🚀 Cài Đặt

### Yêu Cầu
- Trình duyệt hiện đại (Chrome, Firefox, Edge, Safari)
- VS Code (khuyến nghị) với Live Server extension

### Các Bước Cài Đặt

1. **Clone hoặc Download dự án**
```bash
git clone https://github.com/duy-linh0903/csw303_project_Order_Coffee.git
cd Order_Coffee
```

2. **Mở bằng VS Code**
```bash
code .
```

3. **Chạy Live Server**
- Cách 1: Click phải vào `index.html` → "Open with Live Server"
- Cách 2: Click nút "Go Live" ở góc dưới phải
- Cách 3: `Ctrl+Shift+P` → "Live Server: Open with Live Server"

4. **Truy cập**
```
http://127.0.0.1:5500
```

## 📖 Hướng Dẫn Sử Dụng

### Cho Khách Hàng

#### 1. Đăng Ký/Đăng Nhập
- Click nút "Sign In" trên navbar
- Nhập thông tin hoặc đăng ký tài khoản mới
- Hệ thống tự động lưu phiên đăng nhập

#### 2. Đặt Hàng
1. Chọn món từ menu
2. Click "Customize" để tùy chỉnh
3. Điều chỉnh options (size, đường, đá, sữa...)
4. Click "Add to Cart"
5. Kiểm tra giỏ hàng (icon giỏ hàng phía trên)
6. Click "Checkout" để thanh toán

#### 3. Áp Dụng Ưu Đãi
- Ưu đãi thẻ thành viên **tự động áp dụng**
- Đổi điểm thưởng tại mục "Available Rewards"
- Chọn phương thức giao hàng (Pickup/Delivery)

#### 4. Theo Dõi Đơn Hàng
- Truy cập "Order History" trên navbar
- Xem chi tiết từng đơn hàng
- Theo dõi trạng thái: Pending → Completed

#### 5. Quản Lý Profile
- Click avatar/tên người dùng
- Chọn "Profile"
- Cập nhật thông tin cá nhân
- Xem điểm thưởng & thẻ thành viên

### Cho Admin

#### Đăng Nhập Admin
- URL: `/admin/login.html`
- Credentials mặc định:
  - Email: `admin@coffeecabin.com`
  - Password: `admin123`

#### Dashboard
- **Thống kê tổng quan**:
  - Tổng doanh thu
  - Số đơn hàng
  - Số khách hàng
  - Tổng sản phẩm
- **Biểu đồ**: Doanh thu theo tháng
- **Top sản phẩm**: Best sellers

#### Quản Lý Đơn Hàng
- Xem tất cả đơn hàng
- Cập nhật trạng thái (Pending/Completed/Cancelled)
- Tìm kiếm theo Order ID
- Xem chi tiết đơn hàng

#### Quản Lý Sản Phẩm
- Thêm sản phẩm mới
- Sửa thông tin sản phẩm
- Xóa sản phẩm
- Upload hình ảnh

#### Quản Lý Khách Hàng
- Danh sách khách hàng
- Xem lịch sử mua hàng
- Thống kê chi tiêu
- Quản lý hạng thẻ

## 🔐 Trang Quản Trị

### Tính Năng Admin
- ✅ Dashboard tổng quan
- ✅ Quản lý đơn hàng (CRUD)
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý khách hàng
- ✅ Báo cáo doanh thu
- ✅ Biểu đồ thống kê
- ✅ Tìm kiếm & Lọc dữ liệu

### Bảo Mật
- Session management với localStorage
- Password validation
- Admin authentication required
- Auto logout confirmation

## 💻 Công Nghệ Sử Dụng

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: 
  - Flexbox & Grid Layout
  - Animations & Transitions
  - Responsive Design
  - Custom Properties (CSS Variables)
  - Gradient & Glassmorphism
- **JavaScript (Vanilla)**:
  - ES6+ Features
  - LocalStorage API
  - DOM Manipulation
  - Event Handling
  - Async/Await

### Libraries & Icons
- **Font Awesome 6.0**: Icons
- **Google Fonts**: Typography

### Data Storage
- **LocalStorage**:
  - User sessions
  - Cart data
  - Order history
  - Member card data
  - Admin data

## 🎨 Demo Screenshots

### 🏠 Trang Chủ
- Hero section với call-to-action
- Menu grid với hình ảnh sản phẩm
- Member card preview
- Rewards section

### 🛒 Giỏ Hàng & Checkout
- Cart sidebar với item details
- Order summary với discounts
- Payment method selection
- Order confirmation

### 💳 Thẻ Thành Viên
- 3 tier cards (Silver, Gold, Diamond)
- Current member status card
- Progress bar to next tier
- Benefits breakdown

### 📱 Profile Page
- Personal information management
- Points & Rewards display
- Member card with avatar
- Order history timeline

### 👨‍💼 Admin Dashboard
- Statistics cards
- Revenue charts
- Order management table
- Customer list

## 🎯 Tính Năng Đặc Biệt

### 1. Smart Checkout
- Tự động áp dụng ưu đãi tốt nhất
- Tính toán thuế & phí giao hàng
- Validation đầu vào
- Guest checkout warning

### 2. Real-time Updates
- Cart count update
- Points calculation
- Member tier progression
- Notification system

### 3. Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop layout
- Touch-friendly UI

### 4. User Experience
- Smooth animations
- Loading states
- Success/Error notifications
- Modal confirmations
- Hover effects

### 5. Data Persistence
- Order history saved
- User preferences remembered
- Cart persists across sessions
- Member data tracked

## 🐛 Bug Fixes & Updates

### Latest Updates
- ✅ Logout confirmation modal với design đẹp
- ✅ Order history sắp xếp theo mới nhất
- ✅ Member card avatars theo tier
- ✅ Profile page với member card display
- ✅ Notification system cho logout

### Known Issues
- None currently

## 📝 To-Do List

- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Order tracking real-time
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Mobile app version

## 👨‍💻 Developer

**Duy Linh**
- GitHub: [@duy-linh0903](https://github.com/duy-linh0903)
- Repository: [csw303_project_Order_Coffee](https://github.com/duy-linh0903/csw303_project_Order_Coffee)

## 📄 License

This project is part of CSW303 course assignment.

## 🙏 Acknowledgments

- Font Awesome cho icons
- Google Fonts cho typography
- Inspiration từ các coffee shop apps hiện đại

---

**Coffee Cabin** - *Nơi mang đến trải nghiệm coffee tuyệt vời!* ☕✨
