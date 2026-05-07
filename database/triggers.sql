-- =====================================================
-- HIGHLANDS COFFEE - TRIGGERS
-- Tạo từ sơ đồ lớp (Class Diagram)
-- Chạy file này SAU stored_procedures.sql
-- =====================================================

USE HighlandsCoffeeDB;
GO

-- =====================================================
-- TRIGGER 1: Tự động tính ThanhTien khi thêm/sửa 
--            Chi tiết đơn hàng
-- Liên quan: ChiTietDonHang.ThanhTien = SoLuong * DonGia
-- =====================================================
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_ChiTietDonHang_TinhThanhTien')
    DROP TRIGGER trg_ChiTietDonHang_TinhThanhTien;
GO

CREATE TRIGGER trg_ChiTietDonHang_TinhThanhTien
ON ChiTietDonHang
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Tự động tính ThanhTien = SoLuong * DonGia
    UPDATE ct
    SET ct.ThanhTien = ct.SoLuong * ct.DonGia
    FROM ChiTietDonHang ct
    INNER JOIN inserted i 
        ON ct.MaDonHang = i.MaDonHang 
        AND ct.MaSanPham = i.MaSanPham;
END
GO
PRINT N'✅ Trigger 1: trg_ChiTietDonHang_TinhThanhTien';

-- =====================================================
-- TRIGGER 2: Tự động cập nhật TongTien của DonHang
--            khi ChiTietDonHang thay đổi (INSERT/UPDATE/DELETE)
-- Liên quan: DonHang.TongTien = SUM(ThanhTien)
-- =====================================================
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_ChiTietDonHang_CapNhatTongTien')
    DROP TRIGGER trg_ChiTietDonHang_CapNhatTongTien;
GO

CREATE TRIGGER trg_ChiTietDonHang_CapNhatTongTien
ON ChiTietDonHang
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Lấy danh sách MaDonHang bị ảnh hưởng
    DECLARE @AffectedOrders TABLE (MaDonHang CHAR(10));

    INSERT INTO @AffectedOrders (MaDonHang)
    SELECT DISTINCT MaDonHang FROM inserted
    UNION
    SELECT DISTINCT MaDonHang FROM deleted;

    -- Cập nhật TongTien cho các đơn hàng bị ảnh hưởng
    UPDATE dh
    SET dh.TongTien = ISNULL((
        SELECT SUM(ct.SoLuong * ct.DonGia)
        FROM ChiTietDonHang ct
        WHERE ct.MaDonHang = dh.MaDonHang
    ), 0)
    FROM DonHang dh
    INNER JOIN @AffectedOrders ao ON dh.MaDonHang = ao.MaDonHang;
END
GO
PRINT N'✅ Trigger 2: trg_ChiTietDonHang_CapNhatTongTien';

-- =====================================================
-- TRIGGER 3: Tự động cập nhật TongTienTam của GioHang
--            khi ChiTietGioHang thay đổi
-- Liên quan: GioHang.TongTienTam = SUM(SoLuong * GiaBan)
-- =====================================================
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_ChiTietGioHang_CapNhatTongTien')
    DROP TRIGGER trg_ChiTietGioHang_CapNhatTongTien;
GO

CREATE TRIGGER trg_ChiTietGioHang_CapNhatTongTien
ON ChiTietGioHang
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AffectedCarts TABLE (MaGioHang CHAR(10));

    INSERT INTO @AffectedCarts (MaGioHang)
    SELECT DISTINCT MaGioHang FROM inserted
    UNION
    SELECT DISTINCT MaGioHang FROM deleted;

    -- Cập nhật TongTienTam = SUM(SoLuong * GiaBan sản phẩm)
    UPDATE gh
    SET gh.TongTienTam = ISNULL((
        SELECT SUM(ct.SoLuong * sp.GiaBan)
        FROM ChiTietGioHang ct
        INNER JOIN SanPham sp ON ct.MaSanPham = sp.MaSanPham
        WHERE ct.MaGioHang = gh.MaGioHang
    ), 0)
    FROM GioHang gh
    INNER JOIN @AffectedCarts ac ON gh.MaGioHang = ac.MaGioHang;
END
GO
PRINT N'✅ Trigger 3: trg_ChiTietGioHang_CapNhatTongTien';

-- =====================================================
-- TRIGGER 4: Cập nhật DiemTichLuy cho khách hàng
--            khi đơn hàng chuyển sang "Đã giao"
-- Quy tắc: Mỗi 10,000đ = 1 điểm tích lũy
-- =====================================================
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_DonHang_CapNhatDiemTichLuy')
    DROP TRIGGER trg_DonHang_CapNhatDiemTichLuy;
GO

CREATE TRIGGER trg_DonHang_CapNhatDiemTichLuy
ON DonHang
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Chỉ xử lý khi trạng thái chuyển sang "Đã giao"
    UPDATE kh
    SET kh.DiemTichLuy = kh.DiemTichLuy + FLOOR(i.TongTien / 10000)
    FROM KhachHang kh
    INNER JOIN inserted i ON kh.MaKhachHang = i.MaKhachHang
    INNER JOIN deleted d ON i.MaDonHang = d.MaDonHang
    WHERE i.TrangThaiDon = N'Đã giao'
      AND d.TrangThaiDon != N'Đã giao';
END
GO
PRINT N'✅ Trigger 4: trg_DonHang_CapNhatDiemTichLuy';

-- =====================================================
-- TRIGGER 5: Cập nhật SoLuongTon nguyên vật liệu
--            khi phiếu nhập kho được duyệt ("Đã nhập")
-- Liên quan: NguyenVatLieu.SoLuongTon += ChiTietPhieuNhap.SoLuongNhap
-- =====================================================
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_PhieuNhapKho_CapNhatTonKho')
    DROP TRIGGER trg_PhieuNhapKho_CapNhatTonKho;
GO

CREATE TRIGGER trg_PhieuNhapKho_CapNhatTonKho
ON PhieuNhapKho
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Chỉ xử lý khi trạng thái chuyển sang "Đã nhập"
    IF EXISTS (
        SELECT 1 FROM inserted i
        INNER JOIN deleted d ON i.MaPhieuNhapKho = d.MaPhieuNhapKho
        WHERE i.TrangThaiNhap = N'Đã nhập' AND d.TrangThaiNhap != N'Đã nhập'
    )
    BEGIN
        -- Cộng số lượng nhập vào tồn kho
        UPDATE nvl
        SET nvl.SoLuongTon = nvl.SoLuongTon + ct.SoLuongNhap
        FROM NguyenVatLieu nvl
        INNER JOIN ChiTietPhieuNhap ct ON nvl.MaNguyenVatLieu = ct.MaNguyenVatLieu
        INNER JOIN inserted i ON ct.MaPhieuNhapKho = i.MaPhieuNhapKho
        INNER JOIN deleted d ON i.MaPhieuNhapKho = d.MaPhieuNhapKho
        WHERE i.TrangThaiNhap = N'Đã nhập' AND d.TrangThaiNhap != N'Đã nhập';
    END
END
GO
PRINT N'✅ Trigger 5: trg_PhieuNhapKho_CapNhatTonKho';

-- =====================================================
-- TRIGGER 6: Kiểm tra sản phẩm phải "Đang bán" 
--            trước khi thêm vào giỏ hàng
-- =====================================================
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_ChiTietGioHang_KiemTraSanPham')
    DROP TRIGGER trg_ChiTietGioHang_KiemTraSanPham;
GO

CREATE TRIGGER trg_ChiTietGioHang_KiemTraSanPham
ON ChiTietGioHang
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra sản phẩm có đang bán không
    IF EXISTS (
        SELECT 1 FROM inserted i
        INNER JOIN SanPham sp ON i.MaSanPham = sp.MaSanPham
        WHERE sp.TrangThaiSanPham != N'Đang bán'
    )
    BEGIN
        RAISERROR(N'Không thể thêm sản phẩm đã ngừng bán hoặc hết hàng vào giỏ', 16, 1);
        RETURN;
    END

    -- Nếu hợp lệ, thực hiện INSERT
    INSERT INTO ChiTietGioHang (MaGioHang, MaSanPham, SoLuong)
    SELECT MaGioHang, MaSanPham, SoLuong FROM inserted;
END
GO
PRINT N'✅ Trigger 6: trg_ChiTietGioHang_KiemTraSanPham';

-- =====================================================
-- TRIGGER 7: Không cho phép hủy đơn hàng đã giao
-- =====================================================
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_DonHang_KiemTraHuyDon')
    DROP TRIGGER trg_DonHang_KiemTraHuyDon;
GO

CREATE TRIGGER trg_DonHang_KiemTraHuyDon
ON DonHang
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Không cho hủy đơn đã giao
    IF EXISTS (
        SELECT 1 FROM inserted i
        INNER JOIN deleted d ON i.MaDonHang = d.MaDonHang
        WHERE i.TrangThaiDon = N'Đã hủy'
          AND d.TrangThaiDon = N'Đã giao'
    )
    BEGIN
        RAISERROR(N'Không thể hủy đơn hàng đã giao thành công', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END
GO
PRINT N'✅ Trigger 7: trg_DonHang_KiemTraHuyDon';

-- =====================================================
-- TRIGGER 8: Tự động tính ThanhTien = DonGiaNhap * SoLuongNhap
--            khi thêm/sửa ChiTietPhieuNhap
-- =====================================================
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_ChiTietPhieuNhap_TinhThanhTien')
    DROP TRIGGER trg_ChiTietPhieuNhap_TinhThanhTien;
GO

CREATE TRIGGER trg_ChiTietPhieuNhap_TinhThanhTien
ON ChiTietPhieuNhap
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Tự động tính ThanhTien = DonGiaNhap * SoLuongNhap
    UPDATE ct
    SET ct.ThanhTien = ct.DonGiaNhap * ct.SoLuongNhap
    FROM ChiTietPhieuNhap ct
    INNER JOIN inserted i 
        ON ct.MaPhieuNhapKho = i.MaPhieuNhapKho 
        AND ct.MaNguyenVatLieu = i.MaNguyenVatLieu;
END
GO
PRINT N'✅ Trigger 8: trg_ChiTietPhieuNhap_TinhThanhTien';

-- =====================================================
-- KẾT QUẢ
-- =====================================================
PRINT N'';
PRINT N'==========================================';
PRINT N'  TRIGGERS HOÀN TẤT!';
PRINT N'  Tổng: 8 triggers';
PRINT N'==========================================';
PRINT N'';
PRINT N'  📋 Danh sách triggers:';
PRINT N'  1. trg_ChiTietDonHang_TinhThanhTien     (Tự động tính thành tiền)';
PRINT N'  2. trg_ChiTietDonHang_CapNhatTongTien   (Cập nhật tổng tiền đơn hàng)';
PRINT N'  3. trg_ChiTietGioHang_CapNhatTongTien   (Cập nhật tổng tiền giỏ hàng)';
PRINT N'  4. trg_DonHang_CapNhatDiemTichLuy       (Tích điểm khi giao thành công)';
PRINT N'  5. trg_PhieuNhapKho_CapNhatTonKho       (Cập nhật tồn kho khi nhập)';
PRINT N'  6. trg_ChiTietGioHang_KiemTraSanPham    (Kiểm tra SP trước khi thêm giỏ)';
PRINT N'  7. trg_DonHang_KiemTraHuyDon             (Chặn hủy đơn đã giao)';
PRINT N'  8. trg_ChiTietPhieuNhap_TinhThanhTien   (Tính thành tiền phiếu nhập)';
PRINT N'';

SELECT name AS N'Trigger', 
       OBJECT_NAME(parent_id) AS N'Bảng',
       CASE WHEN is_disabled = 0 THEN N'Hoạt động' ELSE N'Tắt' END AS N'Trạng thái'
FROM sys.triggers 
WHERE type = 'TR'
ORDER BY OBJECT_NAME(parent_id), name;
GO
