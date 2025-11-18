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

### 2. Points Calculation (5 tests)
- Kiểm tra hệ thống tính điểm thưởng
- Test cases:
  - ✅ 1 điểm cho mỗi 10,000₫ chi tiêu
  - ✅ Nhân x2 cho Gold tier
  - ✅ Nhân x3 cho Diamond tier
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
  - ✅ Phí giao hàng 25,000₫
  - ✅ Miễn phí giao cho Gold
  - ✅ Miễn phí giao cho Diamond
  - ✅ Tổng cuối cùng

### 7. Reward System (5 tests)
- Kiểm tra hệ thống đổi thưởng
- Test cases:
  - ✅ Đổi thưởng với đủ điểm
  - ✅ Không đổi được khi thiếu điểm
  - ✅ Áp dụng giảm giá %
  - ✅ Áp dụng giảm giá cố định
  - ✅ Trừ điểm sau khi đổi

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

- **Total Test Suites**: 10
- **Total Tests**: 42
- **Expected Pass Rate**: 100%
- **Test Files**: `tests/main.test.js`

## 🛠️ Testing Framework

- **Framework**: Jest
- **Environment**: jsdom
- **Version**: ^29.5.0

## 📖 Test Coverage Areas

### ✅ Covered
1. Member tier calculation
2. Points calculation system
3. Discount calculation
4. Cart CRUD operations
5. Price calculations
6. Tax and delivery fees
7. Reward system logic
8. Order validation
9. Order ID generation
10. LocalStorage operations

### 🔄 Future Tests
- API integration tests
- E2E tests
- Performance tests
- Security tests
- UI/UX tests

## 🐛 Bug Detection

Tests giúp phát hiện:
- Logic errors trong tính toán
- Edge cases
- Data validation issues
- State management problems
- Integration issues

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Note**: Tests được viết theo TDD (Test-Driven Development) principles để đảm bảo code quality và maintainability.
