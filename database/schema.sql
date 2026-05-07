-- =====================================================
-- HIGHLANDS COFFEE - DATABASE SCHEMA
-- Tạo lại từ sơ đồ lớp (Class Diagram)
-- Server: CAOTOAN | Windows Authentication
-- Chạy file này trong SQL Server Management Studio
-- =====================================================

-- 1. Tạo Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'HighlandsCoffeeDB')
BEGIN
    CREATE DATABASE HighlandsCoffeeDB;
    PRINT N'✅ Đã tạo database HighlandsCoffeeDB';
END
ELSE
    PRINT N'⚠️ Database HighlandsCoffeeDB đã tồn tại';
GO

USE HighlandsCoffeeDB;
GO

-- =====================================================
-- XÓA CÁC BẢNG CŨ (theo thứ tự phụ thuộc ngược)
-- =====================================================
IF OBJECT_ID('ChiTietPhieuNhap', 'U') IS NOT NULL DROP TABLE ChiTietPhieuNhap;
IF OBJECT_ID('PhieuNhapKho', 'U') IS NOT NULL DROP TABLE PhieuNhapKho;
IF OBJECT_ID('HoaDon', 'U') IS NOT NULL DROP TABLE HoaDon;
IF OBJECT_ID('ChiTietDonHang', 'U') IS NOT NULL DROP TABLE ChiTietDonHang;
IF OBJECT_ID('DonHang', 'U') IS NOT NULL DROP TABLE DonHang;
IF OBJECT_ID('ChiTietGioHang', 'U') IS NOT NULL DROP TABLE ChiTietGioHang;
IF OBJECT_ID('GioHang', 'U') IS NOT NULL DROP TABLE GioHang;
IF OBJECT_ID('KhuyenMai', 'U') IS NOT NULL DROP TABLE KhuyenMai;
IF OBJECT_ID('CongThuc', 'U') IS NOT NULL DROP TABLE CongThuc;
IF OBJECT_ID('KhachHang', 'U') IS NOT NULL DROP TABLE KhachHang;
IF OBJECT_ID('NhanVien', 'U') IS NOT NULL DROP TABLE NhanVien;
IF OBJECT_ID('TaiKhoan', 'U') IS NOT NULL DROP TABLE TaiKhoan;
IF OBJECT_ID('NguyenVatLieu', 'U') IS NOT NULL DROP TABLE NguyenVatLieu;
IF OBJECT_ID('SanPham', 'U') IS NOT NULL DROP TABLE SanPham;
IF OBJECT_ID('DanhMucSanPham', 'U') IS NOT NULL DROP TABLE DanhMucSanPham;
GO

PRINT N'✅ Đã xóa các bảng cũ (nếu có)';
GO

-- =====================================================
-- TẠO CÁC BẢNG (15 bảng theo sơ đồ lớp)
-- =====================================================

-- =====================================================
-- 1. Bảng DANH MỤC SẢN PHẨM
-- Lưu trữ các danh mục phân loại sản phẩm
-- =====================================================
CREATE TABLE DanhMucSanPham (
    MaDanhMuc       CHAR(10)        NOT NULL,
    TenDanhMuc      NVARCHAR(100)   NOT NULL,
    MoTa            NVARCHAR(255)   NULL,

    -- Ràng buộc khóa chính
    CONSTRAINT PK_DanhMucSanPham PRIMARY KEY (MaDanhMuc),

    -- Ràng buộc duy nhất: tên danh mục không trùng
    CONSTRAINT UQ_DanhMucSanPham_TenDanhMuc UNIQUE (TenDanhMuc)
);
GO
PRINT N'✅ Bảng DanhMucSanPham';

-- =====================================================
-- 2. Bảng SẢN PHẨM
-- Lưu trữ thông tin chi tiết các sản phẩm
-- =====================================================
CREATE TABLE SanPham (
    MaSanPham           CHAR(10)        NOT NULL,
    TenSanPham          NVARCHAR(100)   NOT NULL,
    GiaBan              DECIMAL(18,2)   NOT NULL    CONSTRAINT DF_SanPham_GiaBan DEFAULT 0,
    HinhAnh             NVARCHAR(500)   NULL,
    MoTa                NVARCHAR(500)   NULL,
    TrangThaiSanPham    NVARCHAR(50)    NOT NULL    CONSTRAINT DF_SanPham_TrangThai DEFAULT N'Đang bán',
    MaDanhMuc           CHAR(10)        NOT NULL,

    -- Ràng buộc khóa chính
    CONSTRAINT PK_SanPham PRIMARY KEY (MaSanPham),

    -- Ràng buộc khóa ngoại
    CONSTRAINT FK_SanPham_DanhMucSanPham FOREIGN KEY (MaDanhMuc)
        REFERENCES DanhMucSanPham(MaDanhMuc)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,

    -- Ràng buộc CHECK
    CONSTRAINT CK_SanPham_GiaBan CHECK (GiaBan >= 0),
    CONSTRAINT CK_SanPham_TrangThai CHECK (TrangThaiSanPham IN (N'Đang bán', N'Ngừng bán', N'Hết hàng'))
);
GO
PRINT N'✅ Bảng SanPham';

-- =====================================================
-- 3. Bảng NGUYÊN VẬT LIỆU
-- Lưu trữ thông tin nguyên vật liệu cho sản xuất
-- =====================================================
CREATE TABLE NguyenVatLieu (
    MaNguyenVatLieu     CHAR(10)        NOT NULL,
    TenNguyenVatLieu    NVARCHAR(100)   NOT NULL,
    SoLuongTon          FLOAT           NOT NULL    CONSTRAINT DF_NguyenVatLieu_SoLuongTon DEFAULT 0,
    DonViTinh           NVARCHAR(20)    NOT NULL,

    -- Ràng buộc khóa chính
    CONSTRAINT PK_NguyenVatLieu PRIMARY KEY (MaNguyenVatLieu),

    -- Ràng buộc CHECK
    CONSTRAINT CK_NguyenVatLieu_SoLuongTon CHECK (SoLuongTon >= 0)
);
GO
PRINT N'✅ Bảng NguyenVatLieu';

-- =====================================================
-- 4. Bảng CÔNG THỨC
-- Liên kết giữa Sản phẩm và Nguyên vật liệu
-- =====================================================
CREATE TABLE CongThuc (
    MaSanPham               CHAR(10)    NOT NULL,
    MaNguyenVatLieu         CHAR(10)    NOT NULL,
    HamLuongNguyenVatLieu   FLOAT       NOT NULL,
    NgayCapNhat             DATE        CONSTRAINT DF_CongThuc_NgayCapNhat DEFAULT GETDATE(),

    -- Ràng buộc khóa chính (composite key)
    CONSTRAINT PK_CongThuc PRIMARY KEY (MaSanPham, MaNguyenVatLieu),

    -- Ràng buộc khóa ngoại
    CONSTRAINT FK_CongThuc_SanPham FOREIGN KEY (MaSanPham)
        REFERENCES SanPham(MaSanPham)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_CongThuc_NguyenVatLieu FOREIGN KEY (MaNguyenVatLieu)
        REFERENCES NguyenVatLieu(MaNguyenVatLieu)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- Ràng buộc CHECK
    CONSTRAINT CK_CongThuc_HamLuong CHECK (HamLuongNguyenVatLieu > 0)
);
GO
PRINT N'✅ Bảng CongThuc';

-- =====================================================
-- 5. Bảng TÀI KHOẢN
-- Lưu trữ thông tin đăng nhập của người dùng
-- =====================================================
CREATE TABLE TaiKhoan (
    MaTaiKhoan      CHAR(10)        NOT NULL,
    TenDangNhap     NVARCHAR(50)    NOT NULL,
    MatKhau         VARCHAR(255)    NOT NULL,
    VaiTro          NVARCHAR(20)    NOT NULL    CONSTRAINT DF_TaiKhoan_VaiTro DEFAULT 'customer',

    -- Ràng buộc khóa chính
    CONSTRAINT PK_TaiKhoan PRIMARY KEY (MaTaiKhoan),

    -- Ràng buộc duy nhất
    CONSTRAINT UQ_TaiKhoan_TenDangNhap UNIQUE (TenDangNhap),

    -- Ràng buộc CHECK: vai trò hợp lệ
    CONSTRAINT CK_TaiKhoan_VaiTro CHECK (VaiTro IN ('admin', 'staff', 'customer'))
);
GO
PRINT N'✅ Bảng TaiKhoan';

-- =====================================================
-- 6. Bảng NHÂN VIÊN
-- Lưu trữ thông tin nhân viên (bao gồm các loại:
-- Nhân viên bán hàng, Chăm sóc KH, Giao hàng, Quản lý)
-- =====================================================
CREATE TABLE NhanVien (
    MaNhanVien          CHAR(10)        NOT NULL,
    HoTen               NVARCHAR(100)   NOT NULL,
    NgayVaoLam          DATE            NOT NULL,
    SoDienThoai         CHAR(10)        NULL,
    TrangThaiLamViec    NVARCHAR(50)    NOT NULL    CONSTRAINT DF_NhanVien_TrangThai DEFAULT N'Đang làm',
    ChucVu              NVARCHAR(50)    NULL,
    MaTaiKhoan          CHAR(10)        NULL,

    -- Ràng buộc khóa chính
    CONSTRAINT PK_NhanVien PRIMARY KEY (MaNhanVien),

    -- Ràng buộc khóa ngoại
    CONSTRAINT FK_NhanVien_TaiKhoan FOREIGN KEY (MaTaiKhoan)
        REFERENCES TaiKhoan(MaTaiKhoan)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    -- Ràng buộc CHECK
    CONSTRAINT CK_NhanVien_SoDienThoai CHECK (SoDienThoai LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),
    CONSTRAINT CK_NhanVien_TrangThai CHECK (TrangThaiLamViec IN (N'Đang làm', N'Nghỉ việc', N'Tạm nghỉ')),
    CONSTRAINT CK_NhanVien_ChucVu CHECK (ChucVu IN (N'Quản lý', N'Nhân viên bán hàng', N'Nhân viên chăm sóc khách hàng', N'Nhân viên giao hàng', N'Pha chế'))
);
GO
PRINT N'✅ Bảng NhanVien';

-- =====================================================
-- 7. Bảng KHÁCH HÀNG
-- Lưu trữ thông tin khách hàng
-- =====================================================
CREATE TABLE KhachHang (
    MaKhachHang         CHAR(10)        NOT NULL,
    TenKhachHang        NVARCHAR(100)   NOT NULL,
    SoDienThoai         CHAR(10)        NULL,
    Email               VARCHAR(100)    NULL,
    DiaChiKhachHang     NVARCHAR(255)   NULL,
    DiemTichLuy         FLOAT           CONSTRAINT DF_KhachHang_DiemTichLuy DEFAULT 0,
    MaTaiKhoan          CHAR(10)        NULL,

    -- Ràng buộc khóa chính
    CONSTRAINT PK_KhachHang PRIMARY KEY (MaKhachHang),

    -- Ràng buộc khóa ngoại
    CONSTRAINT FK_KhachHang_TaiKhoan FOREIGN KEY (MaTaiKhoan)
        REFERENCES TaiKhoan(MaTaiKhoan)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    -- Ràng buộc duy nhất
    CONSTRAINT UQ_KhachHang_Email UNIQUE (Email),

    -- Ràng buộc CHECK
    CONSTRAINT CK_KhachHang_DiemTichLuy CHECK (DiemTichLuy >= 0),
    CONSTRAINT CK_KhachHang_SoDienThoai CHECK (SoDienThoai LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),
    CONSTRAINT CK_KhachHang_Email CHECK (Email LIKE '%_@_%._%')
);
GO
PRINT N'✅ Bảng KhachHang';

-- =====================================================
-- 8. Bảng KHUYẾN MÃI
-- Lưu trữ các chương trình khuyến mãi
-- =====================================================
CREATE TABLE KhuyenMai (
    MaKhuyenMai         CHAR(10)        NOT NULL,
    TenKhuyenMai        NVARCHAR(100)   NOT NULL,
    PhanTramGiam        DECIMAL(5,2)    NOT NULL,
    NgayBatDau          DATE            NOT NULL,
    NgayKetThuc         DATE            NOT NULL,
    DieuKienKhuyenMai   NVARCHAR(255)   NULL,

    -- Ràng buộc khóa chính
    CONSTRAINT PK_KhuyenMai PRIMARY KEY (MaKhuyenMai),

    -- Ràng buộc CHECK
    CONSTRAINT CK_KhuyenMai_PhanTramGiam CHECK (PhanTramGiam > 0 AND PhanTramGiam <= 100),
    CONSTRAINT CK_KhuyenMai_NgayKetThuc CHECK (NgayKetThuc >= NgayBatDau)
);
GO
PRINT N'✅ Bảng KhuyenMai';

-- =====================================================
-- 9. Bảng GIỎ HÀNG
-- Lưu trữ giỏ hàng của từng khách hàng
-- =====================================================
CREATE TABLE GioHang (
    MaGioHang       CHAR(10)    NOT NULL,
    MaKhachHang     CHAR(10)    NOT NULL,
    NgayTao         DATE        CONSTRAINT DF_GioHang_NgayTao DEFAULT GETDATE(),
    TongTienTam     FLOAT       CONSTRAINT DF_GioHang_TongTienTam DEFAULT 0,

    -- Ràng buộc khóa chính
    CONSTRAINT PK_GioHang PRIMARY KEY (MaGioHang),

    -- Ràng buộc khóa ngoại
    CONSTRAINT FK_GioHang_KhachHang FOREIGN KEY (MaKhachHang)
        REFERENCES KhachHang(MaKhachHang)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- Ràng buộc CHECK
    CONSTRAINT CK_GioHang_TongTienTam CHECK (TongTienTam >= 0)
);
GO
PRINT N'✅ Bảng GioHang';

-- =====================================================
-- 10. Bảng CHI TIẾT GIỎ HÀNG
-- Lưu trữ sản phẩm trong từng giỏ hàng
-- =====================================================
CREATE TABLE ChiTietGioHang (
    MaGioHang       CHAR(10)    NOT NULL,
    MaSanPham       CHAR(10)    NOT NULL,
    SoLuong         INT         NOT NULL,

    -- Ràng buộc khóa chính (composite key)
    CONSTRAINT PK_ChiTietGioHang PRIMARY KEY (MaGioHang, MaSanPham),

    -- Ràng buộc khóa ngoại
    CONSTRAINT FK_ChiTietGioHang_GioHang FOREIGN KEY (MaGioHang)
        REFERENCES GioHang(MaGioHang)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_ChiTietGioHang_SanPham FOREIGN KEY (MaSanPham)
        REFERENCES SanPham(MaSanPham)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- Ràng buộc CHECK
    CONSTRAINT CK_ChiTietGioHang_SoLuong CHECK (SoLuong > 0)
);
GO
PRINT N'✅ Bảng ChiTietGioHang';

-- =====================================================
-- 11. Bảng ĐƠN HÀNG
-- Lưu trữ thông tin đơn đặt hàng
-- =====================================================
CREATE TABLE DonHang (
    MaDonHang           CHAR(10)        NOT NULL,
    NgayDat             DATE            CONSTRAINT DF_DonHang_NgayDat DEFAULT GETDATE(),
    DiaChiGiao          NVARCHAR(255)   NULL,
    PTTT                INT             CONSTRAINT DF_DonHang_PTTT DEFAULT 1,
    TongTien            DECIMAL(18,2)   CONSTRAINT DF_DonHang_TongTien DEFAULT 0,
    TrangThaiDon        NVARCHAR(50)    NOT NULL    CONSTRAINT DF_DonHang_TrangThai DEFAULT N'Chờ xác nhận',
    MaKhachHang         CHAR(10)        NULL,
    MaNhanVienXacNhan   CHAR(10)        NULL,
    MaKhuyenMai         CHAR(10)        NULL,
    MaGioHang           CHAR(10)        NULL,

    -- Ràng buộc khóa chính
    CONSTRAINT PK_DonHang PRIMARY KEY (MaDonHang),

    -- Ràng buộc khóa ngoại
    CONSTRAINT FK_DonHang_KhachHang FOREIGN KEY (MaKhachHang)
        REFERENCES KhachHang(MaKhachHang)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT FK_DonHang_NhanVien FOREIGN KEY (MaNhanVienXacNhan)
        REFERENCES NhanVien(MaNhanVien)
        ON UPDATE NO ACTION
        ON DELETE SET NULL,

    CONSTRAINT FK_DonHang_KhuyenMai FOREIGN KEY (MaKhuyenMai)
        REFERENCES KhuyenMai(MaKhuyenMai)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    -- Ràng buộc CHECK
    CONSTRAINT CK_DonHang_TongTien CHECK (TongTien >= 0),
    CONSTRAINT CK_DonHang_PTTT CHECK (PTTT IN (1, 2, 3, 4)),
    -- PTTT: 1=Tiền mặt, 2=Chuyển khoản, 3=Thẻ, 4=Ví điện tử
    CONSTRAINT CK_DonHang_TrangThai CHECK (TrangThaiDon IN (
        N'Chờ xác nhận', N'Đã xác nhận', N'Đang xử lý',
        N'Đang giao', N'Đã giao', N'Đã hủy'
    ))
);
GO
PRINT N'✅ Bảng DonHang';

-- =====================================================
-- 12. Bảng CHI TIẾT ĐƠN HÀNG
-- Lưu trữ từng sản phẩm trong đơn hàng
-- =====================================================
CREATE TABLE ChiTietDonHang (
    MaDonHang       CHAR(10)        NOT NULL,
    MaSanPham       CHAR(10)        NOT NULL,
    SoLuong         INT             NOT NULL,
    DonGia          DECIMAL(18,2)   NOT NULL,
    ThanhTien       DECIMAL(18,2)   NULL,
    GhiChu          NVARCHAR(255)   NULL,

    -- Ràng buộc khóa chính (composite key)
    CONSTRAINT PK_ChiTietDonHang PRIMARY KEY (MaDonHang, MaSanPham),

    -- Ràng buộc khóa ngoại
    CONSTRAINT FK_ChiTietDonHang_DonHang FOREIGN KEY (MaDonHang)
        REFERENCES DonHang(MaDonHang)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_ChiTietDonHang_SanPham FOREIGN KEY (MaSanPham)
        REFERENCES SanPham(MaSanPham)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,

    -- Ràng buộc CHECK
    CONSTRAINT CK_ChiTietDonHang_SoLuong CHECK (SoLuong > 0),
    CONSTRAINT CK_ChiTietDonHang_DonGia CHECK (DonGia >= 0),
    CONSTRAINT CK_ChiTietDonHang_ThanhTien CHECK (ThanhTien >= 0)
);
GO
PRINT N'✅ Bảng ChiTietDonHang';

-- =====================================================
-- 13. Bảng HÓA ĐƠN
-- Lưu trữ hóa đơn thanh toán
-- =====================================================
CREATE TABLE HoaDon (
    MaHoaDon        CHAR(10)        NOT NULL,
    MaDonHang       CHAR(10)        NOT NULL,
    DiaChi          NVARCHAR(255)   NULL,
    NgayTaoHoaDon   DATE            CONSTRAINT DF_HoaDon_NgayTao DEFAULT GETDATE(),
    TongTien        DECIMAL(18,2)   NOT NULL,
    TrangThai       NVARCHAR(50)    NOT NULL    CONSTRAINT DF_HoaDon_TrangThai DEFAULT N'Chưa thanh toán',
    VAT             FLOAT           CONSTRAINT DF_HoaDon_VAT DEFAULT 0.1,

    -- Ràng buộc khóa chính
    CONSTRAINT PK_HoaDon PRIMARY KEY (MaHoaDon),

    -- Ràng buộc khóa ngoại
    CONSTRAINT FK_HoaDon_DonHang FOREIGN KEY (MaDonHang)
        REFERENCES DonHang(MaDonHang)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- Ràng buộc CHECK
    CONSTRAINT CK_HoaDon_TongTien CHECK (TongTien >= 0),
    CONSTRAINT CK_HoaDon_VAT CHECK (VAT >= 0 AND VAT <= 1),
    CONSTRAINT CK_HoaDon_TrangThai CHECK (TrangThai IN (N'Chưa thanh toán', N'Đã thanh toán', N'Đã hủy'))
);
GO
PRINT N'✅ Bảng HoaDon';

-- =====================================================
-- 14. Bảng PHIẾU NHẬP KHO
-- Lưu trữ thông tin phiếu nhập kho nguyên vật liệu
-- =====================================================
CREATE TABLE PhieuNhapKho (
    MaPhieuNhapKho      CHAR(10)        NOT NULL,
    NgayNhap            DATE            CONSTRAINT DF_PhieuNhapKho_NgayNhap DEFAULT GETDATE(),
    TenNhaCungCap       NVARCHAR(100)   NULL,
    NguoiLapPhieu       NVARCHAR(100)   NULL,
    TrangThaiNhap       NVARCHAR(50)    CONSTRAINT DF_PhieuNhapKho_TrangThai DEFAULT N'Chờ duyệt',
    GhiChuPhieuNhap     NVARCHAR(255)   NULL,

    -- Ràng buộc khóa chính
    CONSTRAINT PK_PhieuNhapKho PRIMARY KEY (MaPhieuNhapKho),

    -- Ràng buộc CHECK
    CONSTRAINT CK_PhieuNhapKho_TrangThai CHECK (TrangThaiNhap IN (N'Chờ duyệt', N'Đã duyệt', N'Đã nhập', N'Đã hủy'))
);
GO
PRINT N'✅ Bảng PhieuNhapKho';

-- =====================================================
-- 15. Bảng CHI TIẾT PHIẾU NHẬP
-- Lưu trữ chi tiết nguyên vật liệu trong phiếu nhập
-- =====================================================
CREATE TABLE ChiTietPhieuNhap (
    MaPhieuNhapKho      CHAR(10)        NOT NULL,
    MaNguyenVatLieu     CHAR(10)        NOT NULL,
    DonGiaNhap          DECIMAL(18,2)   NOT NULL    CONSTRAINT DF_ChiTietPhieuNhap_DonGia DEFAULT 0,
    SoLuongNhap         FLOAT           NOT NULL,
    ThanhTien           DECIMAL(18,2)   NULL,

    -- Ràng buộc khóa chính (composite key)
    CONSTRAINT PK_ChiTietPhieuNhap PRIMARY KEY (MaPhieuNhapKho, MaNguyenVatLieu),

    -- Ràng buộc khóa ngoại
    CONSTRAINT FK_ChiTietPhieuNhap_PhieuNhapKho FOREIGN KEY (MaPhieuNhapKho)
        REFERENCES PhieuNhapKho(MaPhieuNhapKho)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_ChiTietPhieuNhap_NguyenVatLieu FOREIGN KEY (MaNguyenVatLieu)
        REFERENCES NguyenVatLieu(MaNguyenVatLieu)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- Ràng buộc CHECK
    CONSTRAINT CK_ChiTietPhieuNhap_DonGiaNhap CHECK (DonGiaNhap >= 0),
    CONSTRAINT CK_ChiTietPhieuNhap_SoLuongNhap CHECK (SoLuongNhap > 0),
    CONSTRAINT CK_ChiTietPhieuNhap_ThanhTien CHECK (ThanhTien >= 0)
);
GO
PRINT N'✅ Bảng ChiTietPhieuNhap';

-- =====================================================
-- TẠO INDEXES (tối ưu truy vấn)
-- =====================================================

-- Index cho bảng SanPham
CREATE INDEX IX_SanPham_MaDanhMuc ON SanPham(MaDanhMuc);
CREATE INDEX IX_SanPham_TrangThai ON SanPham(TrangThaiSanPham);
CREATE INDEX IX_SanPham_GiaBan ON SanPham(GiaBan);

-- Index cho bảng NhanVien
CREATE INDEX IX_NhanVien_MaTaiKhoan ON NhanVien(MaTaiKhoan);
CREATE INDEX IX_NhanVien_ChucVu ON NhanVien(ChucVu);

-- Index cho bảng KhachHang
CREATE INDEX IX_KhachHang_MaTaiKhoan ON KhachHang(MaTaiKhoan);
CREATE INDEX IX_KhachHang_Email ON KhachHang(Email);

-- Index cho bảng DonHang
CREATE INDEX IX_DonHang_MaKhachHang ON DonHang(MaKhachHang);
CREATE INDEX IX_DonHang_TrangThai ON DonHang(TrangThaiDon);
CREATE INDEX IX_DonHang_NgayDat ON DonHang(NgayDat);
CREATE INDEX IX_DonHang_MaNhanVien ON DonHang(MaNhanVienXacNhan);

-- Index cho bảng GioHang
CREATE INDEX IX_GioHang_MaKhachHang ON GioHang(MaKhachHang);

-- Index cho bảng ChiTietGioHang
CREATE INDEX IX_ChiTietGioHang_MaSanPham ON ChiTietGioHang(MaSanPham);

-- Index cho bảng HoaDon
CREATE INDEX IX_HoaDon_MaDonHang ON HoaDon(MaDonHang);
CREATE INDEX IX_HoaDon_TrangThai ON HoaDon(TrangThai);

-- Index cho bảng PhieuNhapKho
CREATE INDEX IX_PhieuNhapKho_NgayNhap ON PhieuNhapKho(NgayNhap);

-- Index cho bảng KhuyenMai
CREATE INDEX IX_KhuyenMai_NgayBatDau ON KhuyenMai(NgayBatDau);
CREATE INDEX IX_KhuyenMai_NgayKetThuc ON KhuyenMai(NgayKetThuc);
GO

PRINT N'✅ Đã tạo indexes';
GO

-- =====================================================
-- KIỂM TRA KẾT QUẢ
-- =====================================================
PRINT N'';
PRINT N'==========================================';
PRINT N'  HIGHLANDS COFFEE - SCHEMA HOÀN TẤT';
PRINT N'  Tổng: 15 bảng';
PRINT N'==========================================';
PRINT N'';
PRINT N'  📋 Danh sách bảng:';
PRINT N'  1.  DanhMucSanPham       (Danh mục sản phẩm)';
PRINT N'  2.  SanPham              (Sản phẩm)';
PRINT N'  3.  NguyenVatLieu        (Nguyên vật liệu)';
PRINT N'  4.  CongThuc             (Công thức)';
PRINT N'  5.  TaiKhoan             (Tài khoản)';
PRINT N'  6.  NhanVien             (Nhân viên)';
PRINT N'  7.  KhachHang            (Khách hàng)';
PRINT N'  8.  KhuyenMai            (Khuyến mãi)';
PRINT N'  9.  GioHang              (Giỏ hàng)';
PRINT N'  10. ChiTietGioHang       (Chi tiết giỏ hàng)';
PRINT N'  11. DonHang              (Đơn hàng)';
PRINT N'  12. ChiTietDonHang       (Chi tiết đơn hàng)';
PRINT N'  13. HoaDon               (Hóa đơn)';
PRINT N'  14. PhieuNhapKho         (Phiếu nhập kho)';
PRINT N'  15. ChiTietPhieuNhap     (Chi tiết phiếu nhập)';
PRINT N'';

SELECT TABLE_NAME AS N'Tên bảng', 
       (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS c WHERE c.TABLE_NAME = t.TABLE_NAME) AS N'Số cột'
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO
