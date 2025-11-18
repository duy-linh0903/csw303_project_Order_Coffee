# CI/CD Configuration for Coffee Cabin

## 🚀 Automated Testing

Dự án đã được cấu hình để tự động chạy tests khi:

### 1. GitHub Actions (Remote)
- **Trigger**: Khi push code lên GitHub hoặc tạo Pull Request
- **Branches**: `main`, `develop`
- **Node versions**: 18.x, 20.x
- **File**: `.github/workflows/test.yml`

**Workflow steps**:
1. ✅ Checkout code
2. ✅ Setup Node.js
3. ✅ Install dependencies (`npm ci`)
4. ✅ Run tests (`npm test`)
5. ✅ Generate coverage report
6. ✅ Upload coverage to Codecov (optional)

### 2. Git Pre-commit Hook (Local)
- **Trigger**: Trước mỗi lần commit
- **File**: `.git/hooks/pre-commit`

**Behavior**:
- Tự động chạy `npm test` trước khi commit
- Nếu tests FAIL → Commit bị hủy
- Nếu tests PASS → Commit tiếp tục

## 📋 Xem Kết Quả

### GitHub Actions
1. Vào repository trên GitHub
2. Click tab **Actions**
3. Xem workflow runs và test results

### Local
```bash
git commit -m "Your message"
# → Tests sẽ chạy tự động
```

## ⚙️ Cấu Hình

### Tắt Pre-commit Hook (nếu cần)
```bash
# Rename file
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled

# Hoặc skip hook khi commit
git commit --no-verify -m "message"
```

### Tùy Chỉnh GitHub Actions
Edit file `.github/workflows/test.yml`:
- Thay đổi Node versions
- Thêm/bớt branches
- Thêm deployment steps
- Customize coverage thresholds

## 🔧 Troubleshooting

### Tests fail trên GitHub nhưng pass ở local
- Kiểm tra Node version khác nhau
- Kiểm tra dependencies trong `package.json`
- Xem logs chi tiết trong Actions tab

### Pre-commit hook không chạy
```bash
# Windows: Kiểm tra permissions
icacls .git\hooks\pre-commit

# Set executable
icacls .git\hooks\pre-commit /grant Everyone:RX
```

## 📊 Badge Status

Thêm badge vào README.md:
```markdown
![Tests](https://github.com/duy-linh0903/csw303_project_Order_Coffee/actions/workflows/test.yml/badge.svg)
```

## 🎯 Best Practices

1. ✅ Luôn chạy tests trước khi push
2. ✅ Fix tests ngay khi fail
3. ✅ Maintain coverage > 50%
4. ✅ Viết tests cho features mới
5. ✅ Review test logs trong GitHub Actions

---

**Auto-testing đã được bật!** 🎉
