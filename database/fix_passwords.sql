-- =====================================================
-- CẬP NHẬT MẬT KHẨU CHO TẤT CẢ TÀI KHOẢN SEED
-- Chạy file này trong SSMS để fix lỗi đăng nhập
-- Mật khẩu: password123 (bcrypt hash)
-- =====================================================

USE HighlandsCoffeeDB;
GO

-- Hash đúng cho "password123" (đã xác nhận bằng bcrypt.hash)
DECLARE @CorrectHash VARCHAR(255) = '$2a$10$Jz1BSCiZs.cUXCxjbno6.eEB04sEzT79l88ICwCQye270IEay2MMW';

-- Cập nhật tất cả tài khoản seed (TK001 - TK060)
UPDATE TaiKhoan 
SET MatKhau = @CorrectHash
WHERE MaTaiKhoan LIKE 'TK%';

PRINT N'✅ Đã cập nhật mật khẩu cho tất cả tài khoản';
PRINT N'   Mật khẩu mới: password123';
PRINT N'';

-- Hiển thị danh sách tài khoản
SELECT MaTaiKhoan, TenDangNhap, VaiTro,
       LEFT(MatKhau, 30) + '...' AS MatKhau_Preview
FROM TaiKhoan 
ORDER BY MaTaiKhoan;
GO
