-- =====================================================
-- HIGHLANDS COFFEE - DỮ LIỆU KHUYẾN MÃI BỔ SUNG
-- Chạy file này SAU seed_data.sql (nếu cần thêm KM)
-- Cập nhật theo schema mới (không có trường NgayKhuyenMai)
-- =====================================================

USE HighlandsCoffeeDB;
GO

-- Thêm khuyến mãi bổ sung (nếu chưa có)
IF NOT EXISTS (SELECT 1 FROM KhuyenMai WHERE MaKhuyenMai = 'KM006')
INSERT INTO KhuyenMai (MaKhuyenMai, TenKhuyenMai, PhanTramGiam, NgayBatDau, NgayKetThuc, DieuKienKhuyenMai)
VALUES ('KM006', N'Weekend Sale', 12.00, '2026-04-01', '2026-06-30', N'Giảm 12% cho đơn hàng cuối tuần');

IF NOT EXISTS (SELECT 1 FROM KhuyenMai WHERE MaKhuyenMai = 'KM007')
INSERT INTO KhuyenMai (MaKhuyenMai, TenKhuyenMai, PhanTramGiam, NgayBatDau, NgayKetThuc, DieuKienKhuyenMai)
VALUES ('KM007', N'Happy Hour', 8.00, '2026-01-01', '2026-12-31', N'Giảm 8% từ 14h-16h mỗi ngày');

IF NOT EXISTS (SELECT 1 FROM KhuyenMai WHERE MaKhuyenMai = 'KM008')
INSERT INTO KhuyenMai (MaKhuyenMai, TenKhuyenMai, PhanTramGiam, NgayBatDau, NgayKetThuc, DieuKienKhuyenMai)
VALUES ('KM008', N'Combo Freeze', 18.00, '2026-05-01', '2026-08-31', N'Giảm 18% khi mua 2 Freeze trở lên');

PRINT N'✅ Đã thêm khuyến mãi bổ sung';
GO

-- Kiểm tra kết quả
SELECT MaKhuyenMai, TenKhuyenMai, PhanTramGiam, 
       FORMAT(NgayBatDau, 'dd/MM/yyyy') AS N'Bắt đầu',
       FORMAT(NgayKetThuc, 'dd/MM/yyyy') AS N'Kết thúc',
       DieuKienKhuyenMai
FROM KhuyenMai
ORDER BY MaKhuyenMai;
GO
