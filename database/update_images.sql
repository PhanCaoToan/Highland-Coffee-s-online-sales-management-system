-- =====================================================
-- CẬP NHẬT HÌNH ẢNH SẢN PHẨM - Sử dụng ảnh từ Unsplash
-- Chạy file này trong SSMS sau khi đã chạy seed_data.sql
-- =====================================================
USE HighlandsCoffeeDB;
GO

-- Cà Phê
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP001'; -- Phin Sữa Đá
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP002'; -- Phin Đen Đá
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP003'; -- Phin Sữa Nóng
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1497515114889-2e3e03f766fd?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP004'; -- Phin Đen Nóng
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1521302080334-4bebac2763a6?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP005'; -- Americano
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP006'; -- Latte
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP007'; -- Cappuccino

-- Trà
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP008'; -- Trà Sen Vàng
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP009'; -- Trà Thạch Đào
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP010'; -- Trà Thạch Vải
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP011'; -- Trà Xanh Đậu Đỏ
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP012'; -- Trà Thanh Đào

-- Freeze
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1525385133512-2f3bdd585a7b?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP013'; -- Freeze Trà Xanh
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP014'; -- Freeze Caramel Phin
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP015'; -- Freeze Cookies & Cream
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP016'; -- Freeze Chocolate
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP017'; -- Freeze Trà Vải

-- Bánh & Snack
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP018'; -- Bánh Mì Que Pate
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP019'; -- Croissant Bơ
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP020'; -- Mousse Tiramisu
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP021'; -- Mousse Chocolate
UPDATE SanPham SET HinhAnh = 'https://images.unsplash.com/photo-1553507135-2e02e3e5c9bd?w=500&h=500&fit=crop' WHERE MaSanPham = 'SP022'; -- Bánh Mì Thịt Nguội

PRINT N'✅ Đã cập nhật hình ảnh cho 22 sản phẩm';
GO

-- Kiểm tra
SELECT MaSanPham, TenSanPham, HinhAnh FROM SanPham ORDER BY MaSanPham;
GO
