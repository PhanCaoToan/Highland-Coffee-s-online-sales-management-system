-- =====================================================
-- HIGHLANDS COFFEE - STORED PROCEDURES
-- Cập nhật theo schema mới (từ sơ đồ lớp)
-- Chạy file này SAU schema.sql và seed_data.sql
-- =====================================================

USE HighlandsCoffeeDB;
GO

-- =====================================================
-- 1. SP: Lấy sản phẩm theo danh mục
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_LaySanPham' AND type = 'P')
    DROP PROCEDURE sp_LaySanPham;
GO

CREATE PROCEDURE sp_LaySanPham
    @MaDanhMuc CHAR(10) = NULL,
    @TimKiem NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        sp.MaSanPham, sp.TenSanPham, sp.GiaBan, sp.HinhAnh,
        sp.MoTa, sp.TrangThaiSanPham, sp.MaDanhMuc,
        dm.TenDanhMuc
    FROM SanPham sp
    LEFT JOIN DanhMucSanPham dm ON sp.MaDanhMuc = dm.MaDanhMuc
    WHERE sp.TrangThaiSanPham = N'Đang bán'
        AND (@MaDanhMuc IS NULL OR sp.MaDanhMuc = @MaDanhMuc)
        AND (@TimKiem IS NULL OR sp.TenSanPham LIKE '%' + @TimKiem + '%')
    ORDER BY sp.MaDanhMuc, sp.MaSanPham;
END
GO
PRINT N'✅ sp_LaySanPham';

-- =====================================================
-- 2. SP: Chi tiết đơn hàng
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_ChiTietDonHang' AND type = 'P')
    DROP PROCEDURE sp_ChiTietDonHang;
GO

CREATE PROCEDURE sp_ChiTietDonHang
    @MaDonHang CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    -- Thông tin đơn hàng (bao gồm PTTT mới)
    SELECT dh.*, kh.TenKhachHang, kh.SoDienThoai, kh.Email, kh.DiaChiKhachHang,
           nv.HoTen AS TenNhanVien, km.TenKhuyenMai, km.PhanTramGiam
    FROM DonHang dh
    LEFT JOIN KhachHang kh ON dh.MaKhachHang = kh.MaKhachHang
    LEFT JOIN NhanVien nv ON dh.MaNhanVienXacNhan = nv.MaNhanVien
    LEFT JOIN KhuyenMai km ON dh.MaKhuyenMai = km.MaKhuyenMai
    WHERE dh.MaDonHang = @MaDonHang;

    -- Chi tiết sản phẩm (sử dụng ThanhTien từ bảng)
    SELECT ct.MaDonHang, ct.MaSanPham, ct.SoLuong, ct.DonGia, 
           ct.ThanhTien, ct.GhiChu,
           sp.TenSanPham, sp.HinhAnh, sp.MoTa AS MoTaSanPham,
           dm.TenDanhMuc
    FROM ChiTietDonHang ct
    LEFT JOIN SanPham sp ON ct.MaSanPham = sp.MaSanPham
    LEFT JOIN DanhMucSanPham dm ON sp.MaDanhMuc = dm.MaDanhMuc
    WHERE ct.MaDonHang = @MaDonHang;
END
GO
PRINT N'✅ sp_ChiTietDonHang';

-- =====================================================
-- 3. SP: Thống kê Dashboard
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_ThongKe' AND type = 'P')
    DROP PROCEDURE sp_ThongKe;
GO

CREATE PROCEDURE sp_ThongKe
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        (SELECT COUNT(*) FROM DonHang) AS TongDonHang,
        (SELECT ISNULL(SUM(TongTien), 0) FROM DonHang WHERE TrangThaiDon != N'Đã hủy') AS DoanhThu,
        (SELECT COUNT(*) FROM SanPham WHERE TrangThaiSanPham = N'Đang bán') AS TongSanPham,
        (SELECT COUNT(*) FROM KhachHang) AS TongKhachHang,
        (SELECT COUNT(*) FROM DonHang WHERE TrangThaiDon = N'Chờ xác nhận') AS DonChoXacNhan;

    -- Đơn hàng gần đây
    SELECT TOP 5 dh.MaDonHang, dh.TongTien, dh.TrangThaiDon, dh.NgayDat, dh.PTTT,
           kh.TenKhachHang
    FROM DonHang dh
    LEFT JOIN KhachHang kh ON dh.MaKhachHang = kh.MaKhachHang
    ORDER BY dh.NgayDat DESC;

    -- Sản phẩm bán chạy
    SELECT TOP 5 sp.TenSanPham, sp.HinhAnh,
           SUM(ct.SoLuong) AS TongBan,
           SUM(ISNULL(ct.ThanhTien, ct.SoLuong * ct.DonGia)) AS DoanhThu
    FROM ChiTietDonHang ct
    LEFT JOIN SanPham sp ON ct.MaSanPham = sp.MaSanPham
    GROUP BY sp.TenSanPham, sp.HinhAnh
    ORDER BY TongBan DESC;
END
GO
PRINT N'✅ sp_ThongKe';

-- =====================================================
-- 4. SP: Tạo đơn hàng mới
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_TaoDonHang' AND type = 'P')
    DROP PROCEDURE sp_TaoDonHang;
GO

CREATE PROCEDURE sp_TaoDonHang
    @MaDonHang CHAR(10),
    @MaKhachHang CHAR(10),
    @DiaChiGiao NVARCHAR(255) = NULL,
    @PTTT INT = 1,
    @MaKhuyenMai CHAR(10) = NULL,
    @MaGioHang CHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO DonHang (MaDonHang, MaKhachHang, MaGioHang, DiaChiGiao, PTTT, MaKhuyenMai, TrangThaiDon)
    VALUES (@MaDonHang, @MaKhachHang, @MaGioHang, @DiaChiGiao, @PTTT, @MaKhuyenMai, N'Chờ xác nhận');
    
    SELECT * FROM DonHang WHERE MaDonHang = @MaDonHang;
END
GO
PRINT N'✅ sp_TaoDonHang';

-- =====================================================
-- 5. SP: Cập nhật trạng thái đơn hàng
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_CapNhatTrangThai' AND type = 'P')
    DROP PROCEDURE sp_CapNhatTrangThai;
GO

CREATE PROCEDURE sp_CapNhatTrangThai
    @MaDonHang CHAR(10),
    @TrangThaiMoi NVARCHAR(50),
    @MaNhanVien CHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE DonHang 
    SET TrangThaiDon = @TrangThaiMoi,
        MaNhanVienXacNhan = ISNULL(@MaNhanVien, MaNhanVienXacNhan)
    WHERE MaDonHang = @MaDonHang;

    SELECT * FROM DonHang WHERE MaDonHang = @MaDonHang;
END
GO
PRINT N'✅ sp_CapNhatTrangThai';

-- =====================================================
-- 6. SP: Báo cáo doanh thu
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_BaoCaoDoanhThu' AND type = 'P')
    DROP PROCEDURE sp_BaoCaoDoanhThu;
GO

CREATE PROCEDURE sp_BaoCaoDoanhThu
    @NgayBatDau DATE = NULL,
    @NgayKetThuc DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @NgayBatDau IS NULL SET @NgayBatDau = DATEADD(DAY, -30, GETDATE());
    IF @NgayKetThuc IS NULL SET @NgayKetThuc = GETDATE();

    -- Tổng quan
    SELECT COUNT(*) AS TongDon,
           SUM(CASE WHEN TrangThaiDon != N'Đã hủy' THEN TongTien ELSE 0 END) AS DoanhThu,
           SUM(CASE WHEN TrangThaiDon = N'Đã hủy' THEN 1 ELSE 0 END) AS DonHuy
    FROM DonHang
    WHERE NgayDat BETWEEN @NgayBatDau AND @NgayKetThuc;

    -- Theo ngày
    SELECT NgayDat AS Ngay, COUNT(*) AS SoDon,
           SUM(CASE WHEN TrangThaiDon != N'Đã hủy' THEN TongTien ELSE 0 END) AS DoanhThu
    FROM DonHang
    WHERE NgayDat BETWEEN @NgayBatDau AND @NgayKetThuc
    GROUP BY NgayDat
    ORDER BY Ngay;
END
GO
PRINT N'✅ sp_BaoCaoDoanhThu';

-- =====================================================
-- 7. SP: Lấy giỏ hàng của khách hàng
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_LayGioHang' AND type = 'P')
    DROP PROCEDURE sp_LayGioHang;
GO

CREATE PROCEDURE sp_LayGioHang
    @MaKhachHang CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    -- Thông tin giỏ hàng
    SELECT gh.MaGioHang, gh.MaKhachHang, gh.NgayTao, gh.TongTienTam
    FROM GioHang gh
    WHERE gh.MaKhachHang = @MaKhachHang;

    -- Chi tiết sản phẩm trong giỏ
    SELECT ct.MaGioHang, ct.MaSanPham, ct.SoLuong,
           sp.TenSanPham, sp.GiaBan, sp.HinhAnh, sp.MoTa,
           dm.TenDanhMuc,
           (ct.SoLuong * sp.GiaBan) AS ThanhTien
    FROM ChiTietGioHang ct
    INNER JOIN GioHang gh ON ct.MaGioHang = gh.MaGioHang
    LEFT JOIN SanPham sp ON ct.MaSanPham = sp.MaSanPham
    LEFT JOIN DanhMucSanPham dm ON sp.MaDanhMuc = dm.MaDanhMuc
    WHERE gh.MaKhachHang = @MaKhachHang;
END
GO
PRINT N'✅ sp_LayGioHang';

-- =====================================================
-- 8. SP: Thêm sản phẩm vào giỏ hàng
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_ThemVaoGioHang' AND type = 'P')
    DROP PROCEDURE sp_ThemVaoGioHang;
GO

CREATE PROCEDURE sp_ThemVaoGioHang
    @MaKhachHang CHAR(10),
    @MaSanPham CHAR(10),
    @SoLuong INT = 1
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaGioHang CHAR(10);

    -- Tìm hoặc tạo giỏ hàng cho khách
    SELECT @MaGioHang = MaGioHang FROM GioHang WHERE MaKhachHang = @MaKhachHang;
    
    IF @MaGioHang IS NULL
    BEGIN
        SET @MaGioHang = 'GH' + RIGHT('00000000' + CAST((SELECT ISNULL(MAX(CAST(SUBSTRING(MaGioHang, 3, 8) AS INT)), 0) + 1 FROM GioHang) AS VARCHAR), 8);
        INSERT INTO GioHang (MaGioHang, MaKhachHang, NgayTao, TongTienTam)
        VALUES (@MaGioHang, @MaKhachHang, GETDATE(), 0);
    END

    -- Nếu sản phẩm đã có trong giỏ, cộng dồn số lượng
    IF EXISTS (SELECT 1 FROM ChiTietGioHang WHERE MaGioHang = @MaGioHang AND MaSanPham = @MaSanPham)
    BEGIN
        UPDATE ChiTietGioHang
        SET SoLuong = SoLuong + @SoLuong
        WHERE MaGioHang = @MaGioHang AND MaSanPham = @MaSanPham;
    END
    ELSE
    BEGIN
        INSERT INTO ChiTietGioHang (MaGioHang, MaSanPham, SoLuong)
        VALUES (@MaGioHang, @MaSanPham, @SoLuong);
    END

    -- Cập nhật tổng tiền tạm
    UPDATE GioHang
    SET TongTienTam = (
        SELECT ISNULL(SUM(ct.SoLuong * sp.GiaBan), 0)
        FROM ChiTietGioHang ct
        INNER JOIN SanPham sp ON ct.MaSanPham = sp.MaSanPham
        WHERE ct.MaGioHang = @MaGioHang
    )
    WHERE MaGioHang = @MaGioHang;

    SELECT @MaGioHang AS MaGioHang;
END
GO
PRINT N'✅ sp_ThemVaoGioHang';

-- =====================================================
-- 9. SP: Cập nhật số lượng sản phẩm trong giỏ
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_CapNhatSoLuongGio' AND type = 'P')
    DROP PROCEDURE sp_CapNhatSoLuongGio;
GO

CREATE PROCEDURE sp_CapNhatSoLuongGio
    @MaGioHang CHAR(10),
    @MaSanPham CHAR(10),
    @SoLuong INT
AS
BEGIN
    SET NOCOUNT ON;
    IF @SoLuong <= 0
    BEGIN
        DELETE FROM ChiTietGioHang WHERE MaGioHang = @MaGioHang AND MaSanPham = @MaSanPham;
    END
    ELSE
    BEGIN
        UPDATE ChiTietGioHang SET SoLuong = @SoLuong
        WHERE MaGioHang = @MaGioHang AND MaSanPham = @MaSanPham;
    END

    -- Cập nhật tổng tiền tạm
    UPDATE GioHang
    SET TongTienTam = (
        SELECT ISNULL(SUM(ct.SoLuong * sp.GiaBan), 0)
        FROM ChiTietGioHang ct
        INNER JOIN SanPham sp ON ct.MaSanPham = sp.MaSanPham
        WHERE ct.MaGioHang = @MaGioHang
    )
    WHERE MaGioHang = @MaGioHang;

    PRINT N'✅ Đã cập nhật số lượng';
END
GO
PRINT N'✅ sp_CapNhatSoLuongGio';

-- =====================================================
-- 10. SP: Xóa sản phẩm khỏi giỏ hàng
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_XoaKhoiGioHang' AND type = 'P')
    DROP PROCEDURE sp_XoaKhoiGioHang;
GO

CREATE PROCEDURE sp_XoaKhoiGioHang
    @MaGioHang CHAR(10),
    @MaSanPham CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM ChiTietGioHang WHERE MaGioHang = @MaGioHang AND MaSanPham = @MaSanPham;

    -- Cập nhật tổng tiền tạm
    UPDATE GioHang
    SET TongTienTam = (
        SELECT ISNULL(SUM(ct.SoLuong * sp.GiaBan), 0)
        FROM ChiTietGioHang ct
        INNER JOIN SanPham sp ON ct.MaSanPham = sp.MaSanPham
        WHERE ct.MaGioHang = @MaGioHang
    )
    WHERE MaGioHang = @MaGioHang;

    PRINT N'✅ Đã xóa sản phẩm khỏi giỏ';
END
GO
PRINT N'✅ sp_XoaKhoiGioHang';

-- =====================================================
-- 11. SP: Tạo đơn hàng từ giỏ hàng (Checkout)
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_TaoDonHangTuGioHang' AND type = 'P')
    DROP PROCEDURE sp_TaoDonHangTuGioHang;
GO

CREATE PROCEDURE sp_TaoDonHangTuGioHang
    @MaGioHang CHAR(10),
    @DiaChiGiao NVARCHAR(255) = NULL,
    @PTTT INT = 1,
    @MaKhuyenMai CHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @MaKhachHang CHAR(10);
        DECLARE @MaDonHang CHAR(10);
        DECLARE @TongTien DECIMAL(18, 2);

        -- Lấy mã khách hàng từ giỏ hàng
        SELECT @MaKhachHang = MaKhachHang FROM GioHang WHERE MaGioHang = @MaGioHang;

        IF @MaKhachHang IS NULL
        BEGIN
            RAISERROR(N'Giỏ hàng không tồn tại', 16, 1);
            RETURN;
        END

        -- Kiểm tra giỏ hàng có sản phẩm không
        IF NOT EXISTS (SELECT 1 FROM ChiTietGioHang WHERE MaGioHang = @MaGioHang)
        BEGIN
            RAISERROR(N'Giỏ hàng trống', 16, 1);
            RETURN;
        END

        -- Tạo mã đơn hàng mới
        SET @MaDonHang = 'DH' + RIGHT('00000000' + CAST((SELECT ISNULL(MAX(CAST(SUBSTRING(MaDonHang, 3, 8) AS INT)), 0) + 1 FROM DonHang) AS VARCHAR), 8);

        -- Tính tổng tiền
        SELECT @TongTien = ISNULL(SUM(ct.SoLuong * sp.GiaBan), 0)
        FROM ChiTietGioHang ct
        INNER JOIN SanPham sp ON ct.MaSanPham = sp.MaSanPham
        WHERE ct.MaGioHang = @MaGioHang;

        -- Tạo đơn hàng có liên kết với giỏ hàng
        INSERT INTO DonHang (MaDonHang, MaKhachHang, MaGioHang, DiaChiGiao, PTTT, MaKhuyenMai, TrangThaiDon, TongTien)
        VALUES (@MaDonHang, @MaKhachHang, @MaGioHang, @DiaChiGiao, @PTTT, @MaKhuyenMai, N'Chờ xác nhận', @TongTien);

        -- Copy chi tiết giỏ hàng sang chi tiết đơn hàng (bao gồm ThanhTien)
        INSERT INTO ChiTietDonHang (MaDonHang, MaSanPham, SoLuong, DonGia, ThanhTien)
        SELECT @MaDonHang, ct.MaSanPham, ct.SoLuong, sp.GiaBan, (ct.SoLuong * sp.GiaBan)
        FROM ChiTietGioHang ct
        INNER JOIN SanPham sp ON ct.MaSanPham = sp.MaSanPham
        WHERE ct.MaGioHang = @MaGioHang;

        -- Xóa giỏ hàng sau khi checkout
        DELETE FROM ChiTietGioHang WHERE MaGioHang = @MaGioHang;
        DELETE FROM GioHang WHERE MaGioHang = @MaGioHang;

        COMMIT TRANSACTION;
        SELECT @MaDonHang AS MaDonHang, @TongTien AS TongTien, N'Chờ xác nhận' AS TrangThaiDon;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
PRINT N'✅ sp_TaoDonHangTuGioHang';

-- =====================================================
-- 12. SP: Xóa toàn bộ giỏ hàng
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_XoaGioHang' AND type = 'P')
    DROP PROCEDURE sp_XoaGioHang;
GO

CREATE PROCEDURE sp_XoaGioHang
    @MaGioHang CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM ChiTietGioHang WHERE MaGioHang = @MaGioHang;
    DELETE FROM GioHang WHERE MaGioHang = @MaGioHang;
    PRINT N'✅ Đã xóa giỏ hàng';
END
GO
PRINT N'✅ sp_XoaGioHang';

-- =====================================================
-- 13. SP: Tạo hóa đơn từ đơn hàng
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_TaoHoaDon' AND type = 'P')
    DROP PROCEDURE sp_TaoHoaDon;
GO

CREATE PROCEDURE sp_TaoHoaDon
    @MaDonHang CHAR(10),
    @VAT FLOAT = 0.1
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaHoaDon CHAR(10);
    DECLARE @TongTien DECIMAL(18,2);
    DECLARE @DiaChi NVARCHAR(255);

    -- Kiểm tra đơn hàng tồn tại
    IF NOT EXISTS (SELECT 1 FROM DonHang WHERE MaDonHang = @MaDonHang)
    BEGIN
        RAISERROR(N'Đơn hàng không tồn tại', 16, 1);
        RETURN;
    END

    -- Kiểm tra hóa đơn đã tồn tại cho đơn hàng này chưa
    IF EXISTS (SELECT 1 FROM HoaDon WHERE MaDonHang = @MaDonHang)
    BEGIN
        RAISERROR(N'Hóa đơn đã tồn tại cho đơn hàng này', 16, 1);
        RETURN;
    END

    -- Lấy thông tin
    SELECT @TongTien = TongTien, @DiaChi = DiaChiGiao FROM DonHang WHERE MaDonHang = @MaDonHang;

    -- Tính tổng tiền có VAT
    SET @TongTien = @TongTien * (1 + @VAT);

    -- Tạo mã hóa đơn
    SET @MaHoaDon = 'HD' + RIGHT('00000000' + CAST((SELECT ISNULL(MAX(CAST(SUBSTRING(MaHoaDon, 3, 8) AS INT)), 0) + 1 FROM HoaDon) AS VARCHAR), 8);

    -- Tạo hóa đơn
    INSERT INTO HoaDon (MaHoaDon, MaDonHang, DiaChi, NgayTaoHoaDon, TongTien, TrangThai, VAT)
    VALUES (@MaHoaDon, @MaDonHang, @DiaChi, GETDATE(), @TongTien, N'Chưa thanh toán', @VAT);

    SELECT * FROM HoaDon WHERE MaHoaDon = @MaHoaDon;
END
GO
PRINT N'✅ sp_TaoHoaDon';

-- =====================================================
-- 14. SP: Tạo phiếu nhập kho
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_TaoPhieuNhapKho' AND type = 'P')
    DROP PROCEDURE sp_TaoPhieuNhapKho;
GO

CREATE PROCEDURE sp_TaoPhieuNhapKho
    @TenNhaCungCap NVARCHAR(100),
    @GhiChu NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaPhieuNhap CHAR(10);

    -- Tạo mã phiếu nhập
    SET @MaPhieuNhap = 'PN' + RIGHT('00000000' + CAST((SELECT ISNULL(MAX(CAST(SUBSTRING(MaPhieuNhapKho, 3, 8) AS INT)), 0) + 1 FROM PhieuNhapKho) AS VARCHAR), 8);

    INSERT INTO PhieuNhapKho (MaPhieuNhapKho, NgayNhap, TenNhaCungCap, TrangThaiNhap, GhiChuPhieuNhap)
    VALUES (@MaPhieuNhap, GETDATE(), @TenNhaCungCap, N'Chờ duyệt', @GhiChu);

    SELECT * FROM PhieuNhapKho WHERE MaPhieuNhapKho = @MaPhieuNhap;
END
GO
PRINT N'✅ sp_TaoPhieuNhapKho';

-- =====================================================
-- 15. SP: Quản lý khuyến mãi - Lấy khuyến mãi đang hoạt động
-- =====================================================
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_LayKhuyenMaiHoatDong' AND type = 'P')
    DROP PROCEDURE sp_LayKhuyenMaiHoatDong;
GO

CREATE PROCEDURE sp_LayKhuyenMaiHoatDong
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaKhuyenMai, TenKhuyenMai, PhanTramGiam, 
           NgayBatDau, NgayKetThuc,
           DieuKienKhuyenMai
    FROM KhuyenMai
    WHERE GETDATE() BETWEEN NgayBatDau AND NgayKetThuc
    ORDER BY PhanTramGiam DESC;
END
GO
PRINT N'✅ sp_LayKhuyenMaiHoatDong';

-- =====================================================
PRINT N'';
PRINT N'==========================================';
PRINT N'  STORED PROCEDURES HOÀN TẤT!';
PRINT N'  Tổng: 15 stored procedures';
PRINT N'==========================================';

SELECT name AS N'Stored Procedure' FROM sys.procedures ORDER BY name;
GO
