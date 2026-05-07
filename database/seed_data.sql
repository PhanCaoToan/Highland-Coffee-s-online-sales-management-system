-- =====================================================
-- HIGHLANDS COFFEE - SEED DATA (Dữ liệu mẫu)
-- Tạo từ sơ đồ lớp (Class Diagram)
-- Chạy file này SAU khi đã chạy schema.sql
-- =====================================================
-- Bảng quan trọng (~30 dòng): SanPham, TaiKhoan, KhachHang, DonHang, ChiTietDonHang
-- Bảng phụ (~5 dòng): DanhMucSanPham, NguyenVatLieu, CongThuc, NhanVien,
--   GioHang, ChiTietGioHang, HoaDon, PhieuNhapKho, ChiTietPhieuNhap, KhuyenMai
-- =====================================================

USE HighlandsCoffeeDB;
GO

-- =====================================================
-- 1. DANH MỤC SẢN PHẨM (5 dòng)
-- =====================================================
INSERT INTO DanhMucSanPham (MaDanhMuc, TenDanhMuc, MoTa) VALUES
('DM001', N'Cà Phê',       N'Cà phê truyền thống Việt Nam và espresso từ hạt cà phê vùng cao nguyên'),
('DM002', N'Trà',           N'Trà hoa quả tươi mát từ nguyên liệu tự nhiên'),
('DM003', N'Freeze',        N'Thức uống đá xay thơm ngon, mát lạnh sảng khoái'),
('DM004', N'Bánh & Snack',  N'Bánh ngọt, bánh mì và đồ ăn nhẹ thủ công'),
('DM005', N'Thức uống khác',N'Sinh tố, nước ép và các loại thức uống đặc biệt');
GO
PRINT N'✅ Đã thêm 5 danh mục sản phẩm';

-- =====================================================
-- 2. SẢN PHẨM (30 dòng)
-- =====================================================
INSERT INTO SanPham (MaSanPham, TenSanPham, GiaBan, HinhAnh, MoTa, TrangThaiSanPham, MaDanhMuc) VALUES
-- Cà Phê (8 sản phẩm)
('SP001', N'Phin Sữa Đá',          39000, '/images/phin-sua-da.jpg',          N'Cà phê phin truyền thống pha với sữa đặc, thêm đá mát lạnh',    N'Đang bán', 'DM001'),
('SP002', N'Phin Đen Đá',           35000, '/images/phin-den-da.jpg',          N'Cà phê phin đen nguyên chất pha đá, đậm đà hương vị',            N'Đang bán', 'DM001'),
('SP003', N'Phin Sữa Nóng',         39000, '/images/phin-sua-nong.jpg',        N'Cà phê phin nóng hòa quyện cùng sữa đặc béo ngậy',              N'Đang bán', 'DM001'),
('SP004', N'Phin Đen Nóng',          35000, '/images/phin-den-nong.jpg',        N'Cà phê phin đen nóng, giữ trọn hương thơm tự nhiên',             N'Đang bán', 'DM001'),
('SP005', N'Americano',              45000, '/images/americano.jpg',            N'Espresso pha loãng với nước nóng, thanh nhẹ tinh tế',             N'Đang bán', 'DM001'),
('SP006', N'Latte',                  55000, '/images/latte.jpg',               N'Espresso kết hợp sữa tươi nóng, tạo lớp foam mịn',              N'Đang bán', 'DM001'),
('SP007', N'Cappuccino',             55000, '/images/cappuccino.jpg',           N'Espresso, sữa nóng và foam sữa mịn xốp, rắc bột cacao',         N'Đang bán', 'DM001'),
('SP008', N'Espresso Đá',            40000, '/images/espresso-da.jpg',          N'Espresso đậm đặc pha đá, thức tỉnh mọi giác quan',              N'Đang bán', 'DM001'),

-- Trà (7 sản phẩm)
('SP009', N'Trà Sen Vàng',           45000, '/images/tra-sen-vang.jpg',         N'Trà ướp hương sen thanh nhã, vị ngọt tự nhiên',                  N'Đang bán', 'DM002'),
('SP010', N'Trà Thạch Đào',          49000, '/images/tra-thach-dao.jpg',        N'Trà đào tươi mát kết hợp thạch giòn dai',                        N'Đang bán', 'DM002'),
('SP011', N'Trà Thạch Vải',          49000, '/images/tra-thach-vai.jpg',        N'Trà vải thơm ngọt, thạch mềm mịn tan trong miệng',              N'Đang bán', 'DM002'),
('SP012', N'Trà Xanh Đậu Đỏ',       49000, '/images/tra-xanh-dau-do.jpg',     N'Trà xanh matcha hòa cùng đậu đỏ bùi béo',                       N'Đang bán', 'DM002'),
('SP013', N'Trà Thanh Đào',          45000, '/images/tra-thanh-dao.jpg',        N'Trà đào thanh mát, vị chua nhẹ tự nhiên',                        N'Đang bán', 'DM002'),
('SP014', N'Trà Oolong Sữa',         50000, '/images/tra-oolong-sua.jpg',       N'Trà oolong rang nhẹ kết hợp sữa tươi béo ngậy',                 N'Đang bán', 'DM002'),
('SP015', N'Trà Hoa Hồng',           48000, '/images/tra-hoa-hong.jpg',         N'Trà hoa hồng thơm ngát, giúp thư giãn tinh thần',               N'Đang bán', 'DM002'),

-- Freeze (6 sản phẩm)
('SP016', N'Freeze Trà Xanh',        55000, '/images/freeze-tra-xanh.jpg',      N'Đá xay trà xanh matcha Nhật Bản, phủ whipped cream',            N'Đang bán', 'DM003'),
('SP017', N'Freeze Caramel Phin',     55000, '/images/freeze-caramel-phin.jpg',  N'Cà phê phin xay cùng đá và caramel thơm lừng',                  N'Đang bán', 'DM003'),
('SP018', N'Freeze Cookies & Cream',  55000, '/images/freeze-cookies-cream.jpg', N'Đá xay cookies vụn, sữa tươi và whipped cream',                 N'Đang bán', 'DM003'),
('SP019', N'Freeze Chocolate',        55000, '/images/freeze-chocolate.jpg',     N'Đá xay chocolate đậm đà, phủ kem tươi mịn',                     N'Đang bán', 'DM003'),
('SP020', N'Freeze Trà Vải',          55000, '/images/freeze-tra-vai.jpg',       N'Đá xay trà vải tươi mát, vị ngọt thanh tự nhiên',               N'Đang bán', 'DM003'),
('SP021', N'Freeze Dâu',              55000, '/images/freeze-dau.jpg',           N'Đá xay dâu tây tươi, chua ngọt hài hòa',                        N'Đang bán', 'DM003'),

-- Bánh & Snack (5 sản phẩm)
('SP022', N'Bánh Mì Que Pate',       15000, '/images/banh-mi-que.jpg',          N'Bánh mì que giòn rụm, nhân pate béo thơm',                      N'Đang bán', 'DM004'),
('SP023', N'Croissant Bơ',           35000, '/images/croissant.jpg',            N'Croissant nhiều lớp bơ Pháp, giòn xốp thơm lừng',               N'Đang bán', 'DM004'),
('SP024', N'Mousse Tiramisu',        45000, '/images/mousse-tiramisu.jpg',      N'Mousse tiramisu kem mịn, thoang hương cà phê',                   N'Đang bán', 'DM004'),
('SP025', N'Mousse Chocolate',       45000, '/images/mousse-chocolate.jpg',     N'Mousse chocolate Bỉ đậm đà, tan chảy ngọt ngào',                N'Đang bán', 'DM004'),
('SP026', N'Bánh Mì Thịt Nguội',    35000, '/images/banh-mi-thit-nguoi.jpg',  N'Bánh mì giòn nhân thịt nguội, rau tươi và sốt mayonnaise',       N'Đang bán', 'DM004'),

-- Thức uống khác (4 sản phẩm)
('SP027', N'Sinh Tố Bơ',            50000, '/images/sinh-to-bo.jpg',           N'Sinh tố bơ sáp béo ngậy, thêm sữa đặc',                        N'Đang bán', 'DM005'),
('SP028', N'Sinh Tố Xoài',          48000, '/images/sinh-to-xoai.jpg',        N'Sinh tố xoài chín ngọt tự nhiên, thêm đá mát',                  N'Đang bán', 'DM005'),
('SP029', N'Nước Ép Cam',           40000, '/images/nuoc-ep-cam.jpg',         N'Nước ép cam tươi nguyên chất, giàu vitamin C',                   N'Đang bán', 'DM005'),
('SP030', N'Soda Chanh Dây',        42000, '/images/soda-chanh-day.jpg',      N'Soda sủi bọt kết hợp chanh dây chua ngọt sảng khoái',           N'Đang bán', 'DM005');
GO
PRINT N'✅ Đã thêm 30 sản phẩm';

-- =====================================================
-- 3. NGUYÊN VẬT LIỆU (5 dòng)
-- =====================================================
INSERT INTO NguyenVatLieu (MaNguyenVatLieu, TenNguyenVatLieu, SoLuongTon, DonViTinh) VALUES
('NVL001', N'Cà phê Robusta',    50000, N'gram'),
('NVL002', N'Cà phê Arabica',    30000, N'gram'),
('NVL003', N'Sữa đặc',          100,   N'lon'),
('NVL004', N'Sữa tươi',         200,   N'lít'),
('NVL005', N'Đường',             50000, N'gram');
GO
PRINT N'✅ Đã thêm 5 nguyên vật liệu';

-- =====================================================
-- 4. CÔNG THỨC (5 dòng)
-- =====================================================
INSERT INTO CongThuc (MaSanPham, MaNguyenVatLieu, HamLuongNguyenVatLieu, NgayCapNhat) VALUES
('SP001', 'NVL001', 25,    '2026-01-15'),   -- Phin Sữa Đá: 25g cà phê Robusta
('SP001', 'NVL003', 0.03,  '2026-01-15'),   -- Phin Sữa Đá: 30ml sữa đặc
('SP002', 'NVL001', 25,    '2026-01-15'),   -- Phin Đen Đá: 25g cà phê Robusta
('SP006', 'NVL002', 18,    '2026-02-01'),   -- Latte: 18g cà phê Arabica
('SP006', 'NVL004', 0.2,   '2026-02-01');   -- Latte: 200ml sữa tươi
GO
PRINT N'✅ Đã thêm 5 công thức';

-- =====================================================
-- 5. TÀI KHOẢN (35 dòng: 5 nhân viên + 30 khách hàng)
-- Password hash cho bcrypt (chạy npm run seed để hash đúng)
-- Password mặc định: "password123"
-- =====================================================
DECLARE @DefaultPassword VARCHAR(255) = '$2a$10$Jz1BSCiZs.cUXCxjbno6.eEB04sEzT79l88ICwCQye270IEay2MMW';

INSERT INTO TaiKhoan (MaTaiKhoan, TenDangNhap, MatKhau, VaiTro) VALUES
-- Tài khoản nhân viên (5) - Tên đăng nhập theo chức vụ
('TK001', 'admin@highlands.com',      @DefaultPassword, 'admin'),     -- Quản lý
('TK002', 'banhang@highlands.com',    @DefaultPassword, 'staff'),     -- Nhân viên bán hàng
('TK003', 'cskh@highlands.com',       @DefaultPassword, 'staff'),     -- Nhân viên chăm sóc khách hàng
('TK004', 'giaohang@highlands.com',   @DefaultPassword, 'staff'),     -- Nhân viên giao hàng
('TK005', 'phache@highlands.com',     @DefaultPassword, 'staff'),     -- Pha chế

-- Tài khoản khách hàng (30)
('TK006', 'nguyenvana@gmail.com',      @DefaultPassword, 'customer'),
('TK007', 'tranthib@gmail.com',        @DefaultPassword, 'customer'),
('TK008', 'levanc@gmail.com',          @DefaultPassword, 'customer'),
('TK009', 'phamthid@gmail.com',        @DefaultPassword, 'customer'),
('TK010', 'hoangvane@gmail.com',       @DefaultPassword, 'customer'),
('TK011', 'vuthif@gmail.com',          @DefaultPassword, 'customer'),
('TK012', 'dangvang@gmail.com',        @DefaultPassword, 'customer'),
('TK013', 'buithih@gmail.com',         @DefaultPassword, 'customer'),
('TK014', 'dovanh@gmail.com',          @DefaultPassword, 'customer'),
('TK015', 'ngothik@gmail.com',         @DefaultPassword, 'customer'),
('TK016', 'duongvanl@gmail.com',       @DefaultPassword, 'customer'),
('TK017', 'lythim@gmail.com',          @DefaultPassword, 'customer'),
('TK018', 'trinhvann@gmail.com',       @DefaultPassword, 'customer'),
('TK019', 'maithio@gmail.com',         @DefaultPassword, 'customer'),
('TK020', 'caovanp@gmail.com',         @DefaultPassword, 'customer'),
('TK021', 'lamthiq@gmail.com',         @DefaultPassword, 'customer'),
('TK022', 'truongvanr@gmail.com',      @DefaultPassword, 'customer'),
('TK023', 'phanthis@gmail.com',        @DefaultPassword, 'customer'),
('TK024', 'hathit@gmail.com',          @DefaultPassword, 'customer'),
('TK025', 'sonvanu@gmail.com',         @DefaultPassword, 'customer'),
('TK026', 'dinhtiv@gmail.com',         @DefaultPassword, 'customer'),
('TK027', 'tavanw@gmail.com',          @DefaultPassword, 'customer'),
('TK028', 'luuthix@gmail.com',         @DefaultPassword, 'customer'),
('TK029', 'vuvanb@gmail.com',          @DefaultPassword, 'customer'),
('TK030', 'chuthiz@gmail.com',         @DefaultPassword, 'customer'),
('TK031', 'nghiemvana1@gmail.com',     @DefaultPassword, 'customer'),
('TK032', 'kimthib1@gmail.com',        @DefaultPassword, 'customer'),
('TK033', 'laivanc1@gmail.com',        @DefaultPassword, 'customer'),
('TK034', 'giangthid1@gmail.com',      @DefaultPassword, 'customer'),
('TK035', 'quachvane1@gmail.com',      @DefaultPassword, 'customer');
GO
PRINT N'✅ Đã thêm 35 tài khoản (5 NV + 30 KH)';

-- =====================================================
-- 6. NHÂN VIÊN (5 dòng)
-- Chức vụ theo sơ đồ lớp: Quản lý, Bán hàng, CSKH, Giao hàng, Pha chế
-- =====================================================
INSERT INTO NhanVien (MaNhanVien, HoTen, NgayVaoLam, SoDienThoai, TrangThaiLamViec, ChucVu, MaTaiKhoan) VALUES
('NV001', N'Nguyễn Cao Toàn',       '2020-01-15', '0901234567', N'Đang làm', N'Quản lý',                          'TK001'),
('NV002', N'Trần Minh Tuấn',        '2022-06-01', '0907654321', N'Đang làm', N'Nhân viên bán hàng',               'TK002'),
('NV003', N'Lê Thị Hồng Nhung',     '2023-03-10', '0912345670', N'Đang làm', N'Nhân viên chăm sóc khách hàng',    'TK003'),
('NV004', N'Phạm Văn Thành',        '2023-08-20', '0918765432', N'Đang làm', N'Nhân viên giao hàng',              'TK004'),
('NV005', N'Hoàng Thị Mai Linh',    '2024-01-05', '0923456789', N'Đang làm', N'Pha chế',                          'TK005');
GO
PRINT N'✅ Đã thêm 5 nhân viên';

-- =====================================================
-- 7. KHÁCH HÀNG (30 dòng)
-- =====================================================
INSERT INTO KhachHang (MaKhachHang, TenKhachHang, SoDienThoai, Email, DiaChiKhachHang, DiemTichLuy, MaTaiKhoan) VALUES
('KH001', N'Nguyễn Văn An',        '0912345678', 'nguyenvana@gmail.com',     N'123 Nguyễn Huệ, Q.1, TP.HCM',               150,  'TK006'),
('KH002', N'Trần Thị Bích',        '0923456789', 'tranthib@gmail.com',       N'456 Lê Lợi, Q.1, TP.HCM',                   200,  'TK007'),
('KH003', N'Lê Văn Cường',         '0934567890', 'levanc@gmail.com',         N'789 Hai Bà Trưng, Q.3, TP.HCM',             80,   'TK008'),
('KH004', N'Phạm Thị Dung',        '0945678901', 'phamthid@gmail.com',       N'12 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',    320,  'TK009'),
('KH005', N'Hoàng Văn Em',         '0956789012', 'hoangvane@gmail.com',      N'34 Cách Mạng Tháng 8, Q.3, TP.HCM',         50,   'TK010'),
('KH006', N'Vũ Thị Phương',        '0967890123', 'vuthif@gmail.com',         N'56 Trần Hưng Đạo, Q.5, TP.HCM',             180,  'TK011'),
('KH007', N'Đặng Văn Giang',       '0978901234', 'dangvang@gmail.com',       N'78 Võ Văn Tần, Q.3, TP.HCM',                90,   'TK012'),
('KH008', N'Bùi Thị Hạnh',         '0989012345', 'buithih@gmail.com',        N'90 Nguyễn Trãi, Q.5, TP.HCM',               250,  'TK013'),
('KH009', N'Đỗ Văn Hùng',          '0990123456', 'dovanh@gmail.com',         N'102 Lý Tự Trọng, Q.1, TP.HCM',              400,  'TK014'),
('KH010', N'Ngô Thị Kim',          '0901234560', 'ngothik@gmail.com',        N'114 Pasteur, Q.1, TP.HCM',                   60,   'TK015'),
('KH011', N'Dương Văn Long',       '0912345671', 'duongvanl@gmail.com',      N'25 Nguyễn Đình Chiểu, Q.3, TP.HCM',         110,  'TK016'),
('KH012', N'Lý Thị Mai',           '0923456780', 'lythim@gmail.com',         N'37 Lê Duẩn, Q.1, TP.HCM',                   75,   'TK017'),
('KH013', N'Trịnh Văn Nam',        '0934567891', 'trinhvann@gmail.com',      N'49 Tôn Đức Thắng, Q.1, TP.HCM',             300,  'TK018'),
('KH014', N'Mai Thị Oanh',         '0945678902', 'maithio@gmail.com',        N'61 Bùi Viện, Q.1, TP.HCM',                  45,   'TK019'),
('KH015', N'Cao Văn Phát',         '0956789013', 'caovanp@gmail.com',        N'73 Phạm Ngũ Lão, Q.1, TP.HCM',              190,  'TK020'),
('KH016', N'Lâm Thị Quỳnh',       '0967890124', 'lamthiq@gmail.com',        N'85 Trường Chinh, Q.Tân Bình, TP.HCM',       130,  'TK021'),
('KH017', N'Trương Văn Rạng',      '0978901235', 'truongvanr@gmail.com',     N'97 Cộng Hòa, Q.Tân Bình, TP.HCM',           220,  'TK022'),
('KH018', N'Phan Thị Sen',         '0989012346', 'phanthis@gmail.com',       N'109 Nguyễn Văn Cừ, Q.5, TP.HCM',            350,  'TK023'),
('KH019', N'Hà Thị Thanh',         '0990123457', 'hathit@gmail.com',         N'121 Lạc Long Quân, Q.Tân Bình, TP.HCM',     15,   'TK024'),
('KH020', N'Sơn Văn Uy',           '0901234561', 'sonvanu@gmail.com',        N'133 Hoàng Văn Thụ, Q.Phú Nhuận, TP.HCM',    270,  'TK025'),
('KH021', N'Đinh Thị Vân',         '0912345672', 'dinhtiv@gmail.com',        N'145 Phan Xích Long, Q.Phú Nhuận, TP.HCM',   95,   'TK026'),
('KH022', N'Tạ Văn Vinh',          '0923456781', 'tavanw@gmail.com',         N'157 Nguyễn Kiệm, Q.Gò Vấp, TP.HCM',         40,   'TK027'),
('KH023', N'Lưu Thị Xuân',         '0934567892', 'luuthix@gmail.com',        N'169 Quang Trung, Q.Gò Vấp, TP.HCM',         160,  'TK028'),
('KH024', N'Vương Văn Bảo',        '0945678903', 'vuvanb@gmail.com',         N'181 Phan Văn Trị, Q.Gò Vấp, TP.HCM',        500,  'TK029'),
('KH025', N'Chu Thị Zara',         '0956789014', 'chuthiz@gmail.com',        N'193 Lê Quang Định, Q.Bình Thạnh, TP.HCM',   85,   'TK030'),
('KH026', N'Nghiêm Văn An',        '0967890125', 'nghiemvana1@gmail.com',    N'205 Xô Viết Nghệ Tĩnh, Q.Bình Thạnh, HCM', 120,  'TK031'),
('KH027', N'Kim Thị Bảo',          '0978901236', 'kimthib1@gmail.com',       N'217 Nơ Trang Long, Q.Bình Thạnh, TP.HCM',   210,  'TK032'),
('KH028', N'Lại Văn Công',         '0989012347', 'laivanc1@gmail.com',       N'229 Đinh Bộ Lĩnh, Q.Bình Thạnh, TP.HCM',   30,   'TK033'),
('KH029', N'Giang Thị Diệu',      '0990123458', 'giangthid1@gmail.com',     N'241 Ung Văn Khiêm, Q.Bình Thạnh, TP.HCM',  175,  'TK034'),
('KH030', N'Quách Văn Đức',        '0901234562', 'quachvane1@gmail.com',     N'253 D2, Q.Bình Thạnh, TP.HCM',              280,  'TK035');
GO
PRINT N'✅ Đã thêm 30 khách hàng';

-- =====================================================
-- 8. KHUYẾN MÃI (5 dòng)
-- =====================================================
INSERT INTO KhuyenMai (MaKhuyenMai, TenKhuyenMai, PhanTramGiam, NgayBatDau, NgayKetThuc, DieuKienKhuyenMai) VALUES
('KM001', N'Khách hàng mới',       10.00, '2026-01-01', '2026-12-31', N'Áp dụng cho khách hàng đặt lần đầu'),
('KM002', N'Mùa hè sôi động',      15.00, '2026-04-01', '2026-06-30', N'Giảm 15% cho tất cả đơn hàng'),
('KM003', N'Flash Sale tháng 4',    20.00, '2026-04-10', '2026-04-20', N'Giảm 20% đơn từ 200.000đ'),
('KM004', N'Tri ân khách hàng',     5.00,  '2026-01-01', '2026-12-31', N'Giảm 5% cho mọi đơn hàng'),
('KM005', N'Sinh nhật Highlands',  25.00, '2026-11-01', '2026-11-30', N'Giảm 25% nhân dịp sinh nhật Highlands Coffee');
GO
PRINT N'✅ Đã thêm 5 khuyến mãi';

-- =====================================================
-- 9. GIỎ HÀNG (5 dòng)
-- =====================================================
INSERT INTO GioHang (MaGioHang, MaKhachHang, NgayTao, TongTienTam) VALUES
('GH001', 'KH001', '2026-04-15', 133000),
('GH002', 'KH002', '2026-04-15', 94000),
('GH003', 'KH005', '2026-04-14', 55000),
('GH004', 'KH010', '2026-04-15', 150000),
('GH005', 'KH015', '2026-04-13', 80000);
GO
PRINT N'✅ Đã thêm 5 giỏ hàng';

-- =====================================================
-- 10. CHI TIẾT GIỎ HÀNG (5 dòng)
-- =====================================================
INSERT INTO ChiTietGioHang (MaGioHang, MaSanPham, SoLuong) VALUES
('GH001', 'SP001', 2),   -- 2 Phin Sữa Đá = 78,000
('GH001', 'SP006', 1),   -- 1 Latte = 55,000
('GH002', 'SP009', 1),   -- 1 Trà Sen Vàng = 45,000
('GH002', 'SP010', 1),   -- 1 Trà Thạch Đào = 49,000
('GH003', 'SP016', 1);   -- 1 Freeze Trà Xanh = 55,000
GO
PRINT N'✅ Đã thêm 5 chi tiết giỏ hàng';

-- =====================================================
-- 11. ĐƠN HÀNG (30 dòng)
-- PTTT: 1=Tiền mặt, 2=Chuyển khoản, 3=Thẻ, 4=Ví điện tử
-- =====================================================
INSERT INTO DonHang (MaDonHang, NgayDat, DiaChiGiao, PTTT, TongTien, TrangThaiDon, MaKhachHang, MaNhanVienXacNhan, MaKhuyenMai) VALUES
('DH001', '2026-03-01', N'123 Nguyễn Huệ, Q.1, TP.HCM',               1, 133000,  N'Đã giao',        'KH001', 'NV002', NULL),
('DH002', '2026-03-02', N'456 Lê Lợi, Q.1, TP.HCM',                   2, 94000,   N'Đã giao',        'KH002', 'NV002', NULL),
('DH003', '2026-03-03', N'789 Hai Bà Trưng, Q.3, TP.HCM',             1, 55000,   N'Đã giao',        'KH003', 'NV002', NULL),
('DH004', '2026-03-05', N'12 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',    3, 189000,  N'Đã giao',        'KH004', 'NV002', 'KM001'),
('DH005', '2026-03-07', N'34 Cách Mạng Tháng 8, Q.3, TP.HCM',         1, 78000,   N'Đã giao',        'KH005', 'NV002', NULL),
('DH006', '2026-03-10', N'56 Trần Hưng Đạo, Q.5, TP.HCM',             4, 165000,  N'Đã giao',        'KH006', 'NV002', NULL),
('DH007', '2026-03-12', N'78 Võ Văn Tần, Q.3, TP.HCM',                2, 110000,  N'Đã giao',        'KH007', 'NV002', NULL),
('DH008', '2026-03-14', N'90 Nguyễn Trãi, Q.5, TP.HCM',               1, 230000,  N'Đã giao',        'KH008', 'NV002', 'KM004'),
('DH009', '2026-03-16', N'102 Lý Tự Trọng, Q.1, TP.HCM',              3, 145000,  N'Đã giao',        'KH009', 'NV002', NULL),
('DH010', '2026-03-18', N'114 Pasteur, Q.1, TP.HCM',                   1, 90000,   N'Đã giao',        'KH010', 'NV002', NULL),
('DH011', '2026-03-20', N'25 Nguyễn Đình Chiểu, Q.3, TP.HCM',         2, 175000,  N'Đã giao',        'KH011', 'NV002', NULL),
('DH012', '2026-03-22', N'37 Lê Duẩn, Q.1, TP.HCM',                   1, 49000,   N'Đã hủy',         'KH012', NULL,    NULL),
('DH013', '2026-03-25', N'49 Tôn Đức Thắng, Q.1, TP.HCM',             4, 220000,  N'Đã giao',        'KH013', 'NV002', 'KM001'),
('DH014', '2026-03-27', N'61 Bùi Viện, Q.1, TP.HCM',                  1, 85000,   N'Đã giao',        'KH014', 'NV002', NULL),
('DH015', '2026-03-30', N'73 Phạm Ngũ Lão, Q.1, TP.HCM',              2, 310000,  N'Đã giao',        'KH015', 'NV002', 'KM004'),
('DH016', '2026-04-01', N'85 Trường Chinh, Q.Tân Bình, TP.HCM',       1, 133000,  N'Đã giao',        'KH016', 'NV002', NULL),
('DH017', '2026-04-03', N'97 Cộng Hòa, Q.Tân Bình, TP.HCM',           3, 200000,  N'Đã giao',        'KH017', 'NV002', 'KM002'),
('DH018', '2026-04-05', N'109 Nguyễn Văn Cừ, Q.5, TP.HCM',            1, 160000,  N'Đã giao',        'KH018', 'NV002', NULL),
('DH019', '2026-04-07', N'121 Lạc Long Quân, Q.Tân Bình, TP.HCM',     4, 95000,   N'Đã giao',        'KH019', 'NV002', NULL),
('DH020', '2026-04-08', N'133 Hoàng Văn Thụ, Q.Phú Nhuận, TP.HCM',    2, 275000,  N'Đã giao',        'KH020', 'NV002', 'KM002'),
('DH021', '2026-04-09', N'145 Phan Xích Long, Q.Phú Nhuận, TP.HCM',   1, 55000,   N'Đã giao',        'KH021', 'NV002', NULL),
('DH022', '2026-04-10', N'157 Nguyễn Kiệm, Q.Gò Vấp, TP.HCM',        1, 188000,  N'Đã xác nhận',    'KH022', 'NV002', 'KM003'),
('DH023', '2026-04-11', N'169 Quang Trung, Q.Gò Vấp, TP.HCM',         3, 135000,  N'Đang xử lý',    'KH023', 'NV002', NULL),
('DH024', '2026-04-12', N'181 Phan Văn Trị, Q.Gò Vấp, TP.HCM',        2, 245000,  N'Đang giao',      'KH024', 'NV002', 'KM002'),
('DH025', '2026-04-13', N'193 Lê Quang Định, Q.Bình Thạnh, TP.HCM',   1, 78000,   N'Đang giao',      'KH025', 'NV004', NULL),
('DH026', '2026-04-13', N'205 Xô Viết Nghệ Tĩnh, Q.Bình Thạnh, HCM', 4, 165000,  N'Đã xác nhận',    'KH026', 'NV002', NULL),
('DH027', '2026-04-14', N'217 Nơ Trang Long, Q.Bình Thạnh, TP.HCM',   1, 210000,  N'Chờ xác nhận',   'KH027', NULL,    'KM002'),
('DH028', '2026-04-14', N'229 Đinh Bộ Lĩnh, Q.Bình Thạnh, TP.HCM',   2, 94000,   N'Chờ xác nhận',   'KH028', NULL,    NULL),
('DH029', '2026-04-15', N'241 Ung Văn Khiêm, Q.Bình Thạnh, TP.HCM',   3, 330000,  N'Chờ xác nhận',   'KH029', NULL,    'KM003'),
('DH030', '2026-04-15', N'253 D2, Q.Bình Thạnh, TP.HCM',              1, 155000,  N'Chờ xác nhận',   'KH030', NULL,    NULL);
GO
PRINT N'✅ Đã thêm 30 đơn hàng';

-- =====================================================
-- 12. CHI TIẾT ĐƠN HÀNG (30+ dòng)
-- ThanhTien = SoLuong * DonGia
-- =====================================================
INSERT INTO ChiTietDonHang (MaDonHang, MaSanPham, SoLuong, DonGia, ThanhTien, GhiChu) VALUES
-- DH001: 2 Phin Sữa Đá + 1 Latte = 133,000
('DH001', 'SP001', 2, 39000, 78000,  N'Ít đường'),
('DH001', 'SP006', 1, 55000, 55000,  NULL),

-- DH002: 1 Trà Sen Vàng + 1 Trà Thạch Đào = 94,000
('DH002', 'SP009', 1, 45000, 45000,  NULL),
('DH002', 'SP010', 1, 49000, 49000,  N'Thêm đá'),

-- DH003: 1 Latte = 55,000
('DH003', 'SP006', 1, 55000, 55000,  NULL),

-- DH004: 1 Americano + 1 Latte + 1 Cappuccino + 1 Croissant = 190,000 (giảm KM001)
('DH004', 'SP005', 1, 45000, 45000,  NULL),
('DH004', 'SP006', 1, 55000, 55000,  NULL),
('DH004', 'SP007', 1, 55000, 55000,  N'Nhiều foam'),
('DH004', 'SP023', 1, 35000, 35000,  NULL),

-- DH005: 2 Phin Sữa Đá = 78,000
('DH005', 'SP001', 2, 39000, 78000,  NULL),

-- DH006: 1 Freeze Trà Xanh + 1 Freeze Chocolate + 1 Freeze Cookies = 165,000
('DH006', 'SP016', 1, 55000, 55000,  NULL),
('DH006', 'SP019', 1, 55000, 55000,  N'Thêm kem'),
('DH006', 'SP018', 1, 55000, 55000,  NULL),

-- DH007: 2 Latte = 110,000
('DH007', 'SP006', 2, 55000, 110000, NULL),

-- DH008: 2 Trà Thạch Đào + 2 Cappuccino + 1 Mousse Tiramisu = 253,000 (giảm KM)
('DH008', 'SP010', 2, 49000, 98000,  NULL),
('DH008', 'SP007', 2, 55000, 110000, NULL),
('DH008', 'SP024', 1, 45000, 45000,  NULL),

-- DH009: 1 Espresso Đá + 1 Americano + 1 Trà Oolong Sữa = 135,000
('DH009', 'SP008', 1, 40000, 40000,  NULL),
('DH009', 'SP005', 1, 45000, 45000,  N'Double shot'),
('DH009', 'SP014', 1, 50000, 50000,  NULL),

-- DH010: 2 Trà Sen Vàng = 90,000
('DH010', 'SP009', 2, 45000, 90000,  NULL),

-- DH011: 1 Freeze Caramel + 1 Freeze Dâu + 1 Sinh Tố Bơ + 1 Bánh Mì Que = 175,000
('DH011', 'SP017', 1, 55000, 55000,  NULL),
('DH011', 'SP021', 1, 55000, 55000,  NULL),
('DH011', 'SP027', 1, 50000, 50000,  NULL),
('DH011', 'SP022', 1, 15000, 15000,  NULL),

-- DH012: 1 Trà Thạch Vải = 49,000 (Đã hủy)
('DH012', 'SP011', 1, 49000, 49000,  N'Đơn bị hủy'),

-- DH013 - DH030: mỗi đơn 1-2 sản phẩm
('DH013', 'SP001', 3, 39000, 117000, NULL),
('DH013', 'SP007', 2, 55000, 110000, NULL),

('DH014', 'SP002', 1, 35000, 35000,  NULL),
('DH014', 'SP027', 1, 50000, 50000,  NULL),

('DH015', 'SP006', 3, 55000, 165000, N'Ít đường'),
('DH015', 'SP016', 2, 55000, 110000, NULL),
('DH015', 'SP023', 1, 35000, 35000,  NULL),

('DH016', 'SP001', 2, 39000, 78000,  NULL),
('DH016', 'SP006', 1, 55000, 55000,  NULL),

('DH017', 'SP010', 2, 49000, 98000,  NULL),
('DH017', 'SP014', 2, 50000, 100000, NULL),

('DH018', 'SP017', 2, 55000, 110000, N'Thêm whipped cream'),
('DH018', 'SP027', 1, 50000, 50000,  NULL),

('DH019', 'SP009', 1, 45000, 45000,  NULL),
('DH019', 'SP014', 1, 50000, 50000,  NULL),

('DH020', 'SP006', 3, 55000, 165000, NULL),
('DH020', 'SP007', 2, 55000, 110000, NULL),

('DH021', 'SP016', 1, 55000, 55000,  NULL),

('DH022', 'SP001', 2, 39000, 78000,  NULL),
('DH022', 'SP006', 2, 55000, 110000, NULL),

('DH023', 'SP009', 1, 45000, 45000,  NULL),
('DH023', 'SP010', 1, 49000, 49000,  NULL),
('DH023', 'SP022', 1, 15000, 15000,  N'Thêm pate'),

-- Đơn gần đây (DH024-DH030)
('DH024', 'SP006', 2, 55000, 110000, NULL),
('DH024', 'SP017', 1, 55000, 55000,  NULL),
('DH024', 'SP024', 1, 45000, 45000,  NULL),
('DH024', 'SP023', 1, 35000, 35000,  NULL),

('DH025', 'SP001', 2, 39000, 78000,  N'Đá nhiều'),

('DH026', 'SP016', 1, 55000, 55000,  NULL),
('DH026', 'SP019', 1, 55000, 55000,  NULL),
('DH026', 'SP021', 1, 55000, 55000,  NULL),

('DH027', 'SP006', 2, 55000, 110000, NULL),
('DH027', 'SP014', 2, 50000, 100000, NULL),

('DH028', 'SP009', 1, 45000, 45000,  NULL),
('DH028', 'SP010', 1, 49000, 49000,  NULL),

('DH029', 'SP006', 3, 55000, 165000, N'Ít đá'),
('DH029', 'SP017', 2, 55000, 110000, NULL),
('DH029', 'SP016', 1, 55000, 55000,  NULL),

('DH030', 'SP001', 2, 39000, 78000,  NULL),
('DH030', 'SP002', 1, 35000, 35000,  NULL),
('DH030', 'SP029', 1, 40000, 40000,  N'Không đá');
GO
PRINT N'✅ Đã thêm chi tiết đơn hàng';

-- =====================================================
-- 13. HÓA ĐƠN (5 dòng)
-- =====================================================
INSERT INTO HoaDon (MaHoaDon, MaDonHang, DiaChi, NgayTaoHoaDon, TongTien, TrangThai, VAT) VALUES
('HD001', 'DH001', N'123 Nguyễn Huệ, Q.1, TP.HCM',               '2026-03-01', 146300,  N'Đã thanh toán', 0.1),
('HD002', 'DH002', N'456 Lê Lợi, Q.1, TP.HCM',                   '2026-03-02', 103400,  N'Đã thanh toán', 0.1),
('HD003', 'DH004', N'12 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',    '2026-03-05', 207900,  N'Đã thanh toán', 0.1),
('HD004', 'DH008', N'90 Nguyễn Trãi, Q.5, TP.HCM',               '2026-03-14', 253000,  N'Đã thanh toán', 0.1),
('HD005', 'DH015', N'73 Phạm Ngũ Lão, Q.1, TP.HCM',              '2026-03-30', 341000,  N'Đã thanh toán', 0.1);
GO
PRINT N'✅ Đã thêm 5 hóa đơn';

-- =====================================================
-- 14. PHIẾU NHẬP KHO (5 dòng)
-- =====================================================
INSERT INTO PhieuNhapKho (MaPhieuNhapKho, NgayNhap, TenNhaCungCap, TrangThaiNhap, GhiChuPhieuNhap) VALUES
('PN001', '2026-01-10', N'Công ty Cà Phê Trung Nguyên',    N'Đã nhập',    N'Nhập cà phê Robusta đợt 1'),
('PN002', '2026-02-05', N'Công ty Cà Phê Tây Nguyên',      N'Đã nhập',    N'Nhập cà phê Arabica đặc biệt'),
('PN003', '2026-02-20', N'Công ty Sữa Vinamilk',           N'Đã nhập',    N'Nhập sữa đặc và sữa tươi'),
('PN004', '2026-03-15', N'Công ty Đường Biên Hòa',         N'Đã nhập',    N'Nhập đường trắng'),
('PN005', '2026-04-10', N'Công ty Cà Phê Trung Nguyên',    N'Chờ duyệt',  N'Nhập bổ sung cà phê Robusta');
GO
PRINT N'✅ Đã thêm 5 phiếu nhập kho';

-- =====================================================
-- 15. CHI TIẾT PHIẾU NHẬP (5 dòng)
-- DonGiaNhap: giá nhập mỗi đơn vị, ThanhTien = DonGiaNhap * SoLuongNhap
-- =====================================================
INSERT INTO ChiTietPhieuNhap (MaPhieuNhapKho, MaNguyenVatLieu, DonGiaNhap, SoLuongNhap, ThanhTien) VALUES
('PN001', 'NVL001', 120.00, 50000, 6000000.00),     -- 50kg cà phê Robusta x 120đ/g
('PN002', 'NVL002', 200.00, 30000, 6000000.00),     -- 30kg cà phê Arabica x 200đ/g
('PN003', 'NVL003', 25000.00, 100, 2500000.00),     -- 100 lon sữa đặc x 25.000đ/lon
('PN003', 'NVL004', 30000.00, 200, 6000000.00),     -- 200 lít sữa tươi x 30.000đ/lít
('PN004', 'NVL005', 20.00, 50000, 1000000.00);      -- 50kg đường x 20đ/g
GO
PRINT N'✅ Đã thêm 5 chi tiết phiếu nhập';

-- =====================================================
-- KẾT QUẢ
-- =====================================================
PRINT N'';
PRINT N'==========================================';
PRINT N'  SEED DATA HOÀN TẤT!';
PRINT N'==========================================';
PRINT N'';

SELECT N'DanhMucSanPham'    AS [Bảng], COUNT(*) AS [Số bản ghi] FROM DanhMucSanPham
UNION ALL SELECT N'SanPham',              COUNT(*) FROM SanPham
UNION ALL SELECT N'NguyenVatLieu',        COUNT(*) FROM NguyenVatLieu
UNION ALL SELECT N'CongThuc',             COUNT(*) FROM CongThuc
UNION ALL SELECT N'TaiKhoan',             COUNT(*) FROM TaiKhoan
UNION ALL SELECT N'NhanVien',             COUNT(*) FROM NhanVien
UNION ALL SELECT N'KhachHang',            COUNT(*) FROM KhachHang
UNION ALL SELECT N'KhuyenMai',            COUNT(*) FROM KhuyenMai
UNION ALL SELECT N'GioHang',              COUNT(*) FROM GioHang
UNION ALL SELECT N'ChiTietGioHang',       COUNT(*) FROM ChiTietGioHang
UNION ALL SELECT N'DonHang',              COUNT(*) FROM DonHang
UNION ALL SELECT N'ChiTietDonHang',       COUNT(*) FROM ChiTietDonHang
UNION ALL SELECT N'HoaDon',               COUNT(*) FROM HoaDon
UNION ALL SELECT N'PhieuNhapKho',         COUNT(*) FROM PhieuNhapKho
UNION ALL SELECT N'ChiTietPhieuNhap',     COUNT(*) FROM ChiTietPhieuNhap;
GO

PRINT N'';
PRINT N'📋 Tài khoản demo (chạy npm run seed để hash password):';
PRINT N'   👑 Admin:       admin@highlands.com / password123';
PRINT N'   👤 Bán hàng:    banhang@highlands.com / password123';
PRINT N'   📞 CSKH:        cskh@highlands.com / password123';
PRINT N'   🚚 Giao hàng:   giaohang@highlands.com / password123';
PRINT N'   ☕ Pha chế:     phache@highlands.com / password123';
PRINT N'   🛒 Khách hàng:  nguyenvana@gmail.com / password123';
PRINT N'';
PRINT N'📊 Tổng kết dữ liệu mẫu:';
PRINT N'   • 5  Danh mục sản phẩm';
PRINT N'   • 30 Sản phẩm';
PRINT N'   • 5  Nguyên vật liệu';
PRINT N'   • 5  Công thức';
PRINT N'   • 35 Tài khoản (5 NV + 30 KH)';
PRINT N'   • 5  Nhân viên';
PRINT N'   • 30 Khách hàng';
PRINT N'   • 5  Khuyến mãi';
PRINT N'   • 5  Giỏ hàng + 5 Chi tiết';
PRINT N'   • 30 Đơn hàng + 60+ Chi tiết';
PRINT N'   • 5  Hóa đơn';
PRINT N'   • 5  Phiếu nhập kho + 5 Chi tiết';
GO
