-- =====================================================
-- MIGRATION: Cập nhật trạng thái đơn hàng
-- Đổi 'Đang pha chế' → 'Đang xử lý' 
-- Chạy file này trong SQL Server Management Studio
-- =====================================================

USE HighlandsCoffeeDB;
GO

-- 1. Xóa constraint cũ
ALTER TABLE DonHang DROP CONSTRAINT CK_DonHang_TrangThai;
GO
PRINT N'✅ Đã xóa constraint cũ';

-- 2. Cập nhật dữ liệu: Đổi 'Đang pha chế' thành 'Đang xử lý'
UPDATE DonHang SET TrangThaiDon = N'Đang xử lý' WHERE TrangThaiDon = N'Đang pha chế';
GO
PRINT N'✅ Đã cập nhật dữ liệu đơn hàng';

-- 3. Cập nhật 'Hoàn thành' thành 'Đã giao' (nếu có)
UPDATE DonHang SET TrangThaiDon = N'Đã giao' WHERE TrangThaiDon = N'Hoàn thành';
GO

-- 4. Tạo constraint mới với trạng thái mới
ALTER TABLE DonHang ADD CONSTRAINT CK_DonHang_TrangThai CHECK (TrangThaiDon IN (
    N'Chờ xác nhận', N'Đã xác nhận', N'Đang xử lý',
    N'Đang giao', N'Đã giao', N'Đã hủy'
));
GO
PRINT N'✅ Đã tạo constraint mới';

-- 5. Kiểm tra kết quả
SELECT TrangThaiDon, COUNT(*) as SoLuong 
FROM DonHang 
GROUP BY TrangThaiDon 
ORDER BY TrangThaiDon;
GO

PRINT N'';
PRINT N'========================================';
PRINT N'  MIGRATION HOÀN TẤT!';
PRINT N'  Trạng thái mới: Chờ xác nhận → Đã xác nhận → Đang xử lý → Đang giao → Đã giao';
PRINT N'========================================';
GO
