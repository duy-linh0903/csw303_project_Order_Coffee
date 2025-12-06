# ☕ Coffee Cabin - Unit Tests

## 📋 Tổng Quan

File này chứa unit tests cho các chức năng chính của hệ thống Coffee Cabin.

## 🧪 Test Suites

### 1. Member Tier Calculation (4 tests)
- Kiểm tra tính toán hạng thẻ thành viên
- Test cases:
  - ✅ Silver tier (>= 500,000₫)
  - ✅ Gold tier (>= 3,000,000₫)
  - ✅ Diamond tier (>= 10,000,000₫)
  - ✅ No tier (< 500,000₫)

### 2. Points Calculation (6 tests)
- Kiểm tra hệ thống tích điểm thưởng
- Test cases:
  - ✅ 1 điểm cho mỗi 10,000₫ chi tiêu
  - ✅ Nhân x1 cho Silver tier (không nhân)
  - ✅ Nhân x1.5 cho Gold tier
  - ✅ Nhân x2 cho Diamond tier
  - ✅ Làm tròn xuống số thập phân
  - ✅ 0 điểm cho chi tiêu < 10,000₫

### 3. Member Discount Calculation (4 tests)
- Kiểm tra giảm giá theo hạng thẻ
- Test cases:
  - ✅ 5% cho Silver
  - ✅ 10% cho Gold
  - ✅ 15% cho Diamond
  - ✅ 0% cho non-members

### 4. Cart Operations (5 tests)
- Kiểm tra các thao tác với giỏ hàng
- Test cases:
  - ✅ Thêm sản phẩm vào giỏ
  - ✅ Cập nhật số lượng
  - ✅ Xóa sản phẩm
  - ✅ Tính tổng giỏ hàng
  - ✅ Xóa toàn bộ giỏ hàng

### 5. Price Calculation with Customizations (4 tests)
- Kiểm tra tính giá với tùy chỉnh
- Test cases:
  - ✅ Thêm 10,000₫ cho size Medium
  - ✅ Thêm 25,000₫ cho size Large
  - ✅ Thêm 15,000₫ cho espresso shot
  - ✅ Tổng hợp tất cả tùy chỉnh

### 6. Tax and Delivery Calculation (5 tests)
- Kiểm tra thuế và phí giao hàng
- Test cases:
  - ✅ Tính thuế 10%
  - ✅ Phí giao hàng 25,000₫ cho Silver
  - ✅ Miễn phí giao hàng cho Gold tier
  - ✅ Miễn phí giao hàng cho Diamond tier
  - ✅ Tổng cuối cùng với thuế và phí ship

### 7. Reward System (6 tests)
- Kiểm tra hệ thống đổi thưởng mới (redesigned)
- Test cases:
  - ✅ Free Coffee (100pts): Tặng item đắt nhất (base+size), tối đa 100,000₫
  - ✅ Free Coffee không vượt quá 100k
  - ✅ Free Upgrade (150pts): Tặng item đắt nhất (full price + customizations)
  - ✅ Free Pastry (75pts): Thêm pastry miễn phí vào giỏ hàng
  - ✅ 10% Off (50pts): Giảm giá phần trăm
  - ✅ Trừ điểm sau khi đổi thưởng

### 8. Order Validation (4 tests)
- Kiểm tra validation đơn hàng
- Test cases:
  - ✅ Giỏ hàng không rỗng
  - ✅ Giỏ hàng rỗng (invalid)
  - ✅ Thông tin khách hàng hợp lệ
  - ✅ Thông tin không hợp lệ

### 9. Order ID Generation (2 tests)
- Kiểm tra tạo mã đơn hàng
- Test cases:
  - ✅ Format ORD + timestamp
  - ✅ ID unique cho mỗi đơn

### 10. LocalStorage Operations (4 tests)
- Kiểm tra thao tác với localStorage
- Test cases:
  - ✅ Lưu user
  - ✅ Lưu cart
  - ✅ Lấy user
  - ✅ Xóa user

### 11. Dynamic Customize Options (5 tests) 🆕
- Kiểm tra hệ thống tùy chỉnh động từ admin
- Test cases:
  - ✅ Size Small nhân x1.0 (không nhân)
  - ✅ Size Medium nhân x1.3
  - ✅ Size Large nhân x1.5
  - ✅ Milk Options: Regular (0₫), Fresh Milk (+12,500₫), Oat Milk (+15,000₫)
  - ✅ Tính tổng với nhiều customizations

### 12. Member Tier Benefits (4 tests) 🆕
- Kiểm tra đầy đủ quyền lợi từng hạng thẻ
- Test cases:
  - ✅ Silver: x1 điểm, 5% giảm giá, có phí ship
  - ✅ Gold: x1.5 điểm, 10% giảm giá, free ship
  - ✅ Diamond: x2 điểm, 15% giảm giá, free ship + VIP
  - ✅ Tích hợp tất cả benefits

### 13. Delivery Time Validation (3 tests) 🆕
- Kiểm tra validation thời gian giao hàng
- Test cases:
  - ✅ Từ chối đơn < 15 phút
  - ✅ Chấp nhận đơn = 15 phút
  - ✅ Chấp nhận đơn > 15 phút

### 14. Compensation Code System (4 tests) 🆕
- Kiểm tra hệ thống mã bồi thường giao hàng trễ
- Test cases:
  - ✅ Tạo mã format SORRYXXXXXX
  - ✅ Giảm giá 10%
  - ✅ Hết hạn sau 30 ngày
  - ✅ Đánh dấu đơn hàng đã bồi thường

## 🚀 Chạy Tests

### Cài đặt dependencies
```bash
npm install
```

### Chạy tất cả tests
```bash
npm test
```

### Chạy tests với watch mode
```bash
npm run test:watch
```

### Chạy tests với coverage report
```bash
npm run test:coverage
```

## 📊 Test Coverage

Target coverage thresholds:
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

## 📝 Test Statistics

- **Total Test Suites**: 14 (↑ từ 10)
- **Total Tests**: 60+ (↑ từ 42)
- **Expected Pass Rate**: 100%
- **Test Files**: `tests/main.test.js`
- **Last Updated**: December 2025

## 🛠️ Testing Framework

- **Framework**: Jest
- **Environment**: jsdom
- **Version**: ^29.5.0

## 📖 Test Coverage Areas

### ✅ Covered
1. Member tier calculation (Silver/Gold/Diamond)
2. Points calculation system (x1, x1.5, x2 multipliers)
3. Member discount calculation (5%, 10%, 15%)
4. Cart CRUD operations
5. Price calculations with customizations
6. Tax and delivery fees (free ship cho Gold/Diamond)
7. **Reward system redesigned**:
   - Free Coffee (base+size only, max 100k)
   - Free Pastry (add to cart)
   - Free Upgrade (full price + customizations)
   - 10% Off percentage discount
8. Order validation
9. Order ID generation
10. LocalStorage operations
11. **Dynamic customize options** (từ admin panel)
12. **Member tier benefits** (tích hợp đầy đủ)
13. **Delivery time validation** (15-min minimum)
14. **Compensation code system** (SORRYXXXXXX codes)

### 🔄 Future Tests
- API integration tests
- E2E user journey tests
- Performance tests (delivery tracker)
- Security tests (authentication)
- UI/UX interaction tests
- Group order system tests
- Payment gateway integration tests

## 🐛 Bug Detection

Tests giúp phát hiện:
- Logic errors trong tính toán điểm và giá
- Edge cases (số thập phân, giá trị âm, null values)
- Data validation issues (delivery time, member tiers)
- State management problems (cart, rewards, localStorage)
- Integration issues (reward redemption, customize options)
- Business logic inconsistencies (point multipliers, discounts)

## 🎯 Recent Updates (December 2025)

### Changed Features
1. **Point Multipliers Reduced**:
   - Gold: x2 → x1.5
   - Diamond: x3 → x2
   - Silver: x1 (unchanged)

2. **Reward System Redesigned**:
   - Free Coffee: Giảm giá item đắt nhất (base+size), tối đa 100k
   - Free Upgrade: Giảm giá item đắt nhất (full price), không giới hạn
   - Free Pastry: Thêm pastry miễn phí vào cart

3. **Dynamic Customize Options**:
   - Admin có thể quản lý size multipliers và milk prices
   - Đồng bộ real-time giữa admin panel và customer view

4. **Delivery Improvements**:
   - 15-minute minimum notice requirement
   - Auto-compensation codes (SORRYXXXXXX) cho đơn trễ
   - Giảm 10%, hết hạn sau 30 ngày

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Note**: Tests được viết theo TDD (Test-Driven Development) principles để đảm bảo code quality và maintainability.
