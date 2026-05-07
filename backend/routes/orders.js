const express = require('express');
const { getPool, sql } = require('../config/db');
const { auth, adminOnly, managerOnly } = require('../middleware/auth');

const router = express.Router();

function generateOrderId(cnt) {
  return 'DH' + String(cnt).padStart(8, '0');
}

// POST /api/orders - Tạo đơn hàng
router.post('/', auth, async (req, res) => {
  try {
    const { items, note, diaChiGiao, maKhuyenMai } = req.body;
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Tạo mã đơn hàng
      const countResult = await transaction.request().query('SELECT COUNT(*) as cnt FROM DonHang');
      const maDH = generateOrderId(countResult.recordset[0].cnt + 1);

      // Tính tổng tiền
      let tongTien = 0;
      const orderItems = [];

      for (const item of items) {
        const spResult = await transaction.request()
          .input('maSP', sql.Char(10), item.productId)
          .query("SELECT MaSanPham, TenSanPham, GiaBan FROM SanPham WHERE MaSanPham = @maSP AND TrangThaiSanPham = N'Đang bán'");

        if (spResult.recordset.length === 0) {
          throw new Error(`Sản phẩm ${item.productId} không tồn tại`);
        }

        const sp = spResult.recordset[0];
        orderItems.push({
          maSP: sp.MaSanPham.trim(),
          soLuong: item.quantity,
          donGia: sp.GiaBan,
        });
        tongTien += sp.GiaBan * item.quantity;
      }

      // Kiểm tra khuyến mãi
      let discountPercent = 0;
      let validPromoId = null;
      if (maKhuyenMai) {
        const promoResult = await transaction.request()
          .input('maKM', sql.Char(10), maKhuyenMai)
          .query(`SELECT MaKhuyenMai, PhanTramGiam, NgayBatDau, NgayKetThuc 
                  FROM KhuyenMai WHERE MaKhuyenMai = @maKM 
                  AND NgayBatDau <= GETDATE() AND NgayKetThuc >= GETDATE()`);
        if (promoResult.recordset.length > 0) {
          discountPercent = promoResult.recordset[0].PhanTramGiam;
          validPromoId = promoResult.recordset[0].MaKhuyenMai;
        }
      }

      // Áp dụng giảm giá
      const discountAmount = tongTien * (discountPercent / 100);
      const tongTienSauGiam = tongTien - discountAmount;

      // Tạo đơn hàng
      await transaction.request()
        .input('maDH', sql.Char(10), maDH)
        .input('maKH', sql.Char(10), req.user.maKH)
        .input('diaChiGiao', sql.NVarChar, diaChiGiao || null)
        .input('tongTien', sql.Decimal(18, 2), tongTienSauGiam)
        .input('maKM', sql.Char(10), validPromoId || null)
        .query(`INSERT INTO DonHang (MaDonHang, MaKhachHang, DiaChiGiao, TongTien, TrangThaiDon, MaKhuyenMai)
                VALUES (@maDH, @maKH, @diaChiGiao, @tongTien, N'Chờ xác nhận', @maKM)`);

      // Thêm chi tiết
      for (const item of orderItems) {
        await transaction.request()
          .input('maDH', sql.Char(10), maDH)
          .input('maSP', sql.Char(10), item.maSP)
          .input('soLuong', sql.Int, item.soLuong)
          .input('donGia', sql.Decimal(18, 2), item.donGia)
          .input('ghiChu', sql.NVarChar, note || null)
          .query(`INSERT INTO ChiTietDonHang (MaDonHang, MaSanPham, SoLuong, DonGia, GhiChu)
                  VALUES (@maDH, @maSP, @soLuong, @donGia, @ghiChu)`);
      }

      await transaction.commit();
      res.status(201).json({
        id: maDH,
        totalAmount: tongTienSauGiam,
        originalAmount: tongTien,
        discountPercent,
        discountAmount,
        status: 'Chờ xác nhận',
        createdAt: new Date(),
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: err.message || 'Lỗi server' });
  }
});

// GET /api/orders - Đơn hàng của user
router.get('/', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('maKH', sql.Char(10), req.user.maKH)
      .query(`
        SELECT dh.MaDonHang, dh.NgayDat, dh.TrangThaiDon, dh.TongTien, dh.DiaChiGiao,
               (SELECT COUNT(*) FROM ChiTietDonHang WHERE MaDonHang = dh.MaDonHang) as itemCount
        FROM DonHang dh
        WHERE dh.MaKhachHang = @maKH
        ORDER BY dh.NgayDat DESC
      `);

    const orders = result.recordset.map(o => ({
      id: o.MaDonHang?.trim(),
      createdAt: o.NgayDat,
      status: o.TrangThaiDon?.trim(),
      totalAmount: o.TongTien,
      address: o.DiaChiGiao,
      itemCount: o.itemCount,
    }));

    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET /api/orders/all - Tất cả đơn hàng (admin)
router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT dh.*, kh.TenKhachHang, kh.SoDienThoai, kh.Email,
             (SELECT COUNT(*) FROM ChiTietDonHang WHERE MaDonHang = dh.MaDonHang) as itemCount
      FROM DonHang dh
      LEFT JOIN KhachHang kh ON dh.MaKhachHang = kh.MaKhachHang
      ORDER BY dh.NgayDat DESC
    `);

    const orders = result.recordset.map(o => ({
      id: o.MaDonHang?.trim(),
      createdAt: o.NgayDat,
      status: o.TrangThaiDon?.trim(),
      totalAmount: o.TongTien,
      address: o.DiaChiGiao,
      customerName: o.TenKhachHang,
      customerPhone: o.SoDienThoai?.trim(),
      customerEmail: o.Email,
      itemCount: o.itemCount,
    }));

    res.json(orders);
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET /api/orders/:id - Chi tiết đơn hàng
router.get('/:id', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const orderResult = await pool.request()
      .input('maDH', sql.Char(10), req.params.id)
      .query(`
        SELECT dh.*, kh.TenKhachHang, kh.SoDienThoai, kh.Email, kh.DiaChiKhachHang,
               nv.HoTen AS TenNhanVien
        FROM DonHang dh
        LEFT JOIN KhachHang kh ON dh.MaKhachHang = kh.MaKhachHang
        LEFT JOIN NhanVien nv ON dh.MaNhanVienXacNhan = nv.MaNhanVien
        WHERE dh.MaDonHang = @maDH
      `);

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const o = orderResult.recordset[0];

    const detailResult = await pool.request()
      .input('maDH', sql.Char(10), req.params.id)
      .query(`
        SELECT ct.*, sp.TenSanPham, sp.HinhAnh
        FROM ChiTietDonHang ct
        LEFT JOIN SanPham sp ON ct.MaSanPham = sp.MaSanPham
        WHERE ct.MaDonHang = @maDH
      `);

    // Payment method mapping
    const ptttMap = { 1: 'Tiền mặt (COD)', 2: 'Chuyển khoản', 3: 'Thẻ', 4: 'Ví điện tử' };

    res.json({
      id: o.MaDonHang?.trim(),
      createdAt: o.NgayDat,
      status: o.TrangThaiDon?.trim(),
      totalAmount: o.TongTien,
      address: o.DiaChiGiao,
      paymentMethod: ptttMap[o.PTTT] || 'COD',
      customerName: o.TenKhachHang,
      customerPhone: o.SoDienThoai?.trim(),
      customerEmail: o.Email,
      customerAddress: o.DiaChiKhachHang,
      staffName: o.TenNhanVien,
      note: null,
      items: detailResult.recordset.map(i => ({
        id: i.MaSanPham?.trim(),
        productName: i.TenSanPham,
        productImage: i.HinhAnh,
        quantity: i.SoLuong,
        unitPrice: i.DonGia,
        note: i.GhiChu,
      })),
    });
  } catch (err) {
    console.error('Get order detail error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// PUT /api/orders/:id/status (admin)
router.put('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status, note } = req.body;
    const pool = await getPool();

    // Validate status flow
    const validStatuses = ['Chờ xác nhận', 'Đã xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    await pool.request()
      .input('maDH', sql.Char(10), req.params.id)
      .input('trangThai', sql.NVarChar, status)
      .input('maNV', sql.Char(10), req.user.maNV || null)
      .query(`UPDATE DonHang SET TrangThaiDon = @trangThai, 
              MaNhanVienXacNhan = ISNULL(@maNV, MaNhanVienXacNhan) 
              WHERE MaDonHang = @maDH`);

    const result = await pool.request()
      .input('maDH', sql.Char(10), req.params.id)
      .query('SELECT * FROM DonHang WHERE MaDonHang = @maDH');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const o = result.recordset[0];
    res.json({
      id: o.MaDonHang?.trim(),
      status: o.TrangThaiDon?.trim(),
      totalAmount: o.TongTien,
      note: note || null,
    });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET /api/dashboard/stats (admin)
router.get('/dashboard/stats', auth, managerOnly, async (req, res) => {
  try {
    const pool = await getPool();

    const totalOrders = await pool.request().query('SELECT COUNT(*) as count FROM DonHang');
    const totalRevenue = await pool.request().query("SELECT ISNULL(SUM(TongTien), 0) as total FROM DonHang WHERE TrangThaiDon != N'Đã hủy'");
    const totalProducts = await pool.request().query("SELECT COUNT(*) as count FROM SanPham WHERE TrangThaiSanPham = N'Đang bán'");
    const totalCustomers = await pool.request().query('SELECT COUNT(*) as count FROM KhachHang');
    const pendingOrders = await pool.request().query("SELECT COUNT(*) as count FROM DonHang WHERE TrangThaiDon = N'Chờ xác nhận'");

    const recentOrders = await pool.request().query(`
      SELECT TOP 5 dh.MaDonHang, dh.TongTien, dh.TrangThaiDon, dh.NgayDat,
             kh.TenKhachHang
      FROM DonHang dh
      LEFT JOIN KhachHang kh ON dh.MaKhachHang = kh.MaKhachHang
      ORDER BY dh.NgayDat DESC
    `);

    const topProducts = await pool.request().query(`
      SELECT TOP 5 sp.TenSanPham as name, sp.HinhAnh as image,
             SUM(ct.SoLuong) as totalSold, SUM(ct.SoLuong * ct.DonGia) as totalRevenue
      FROM ChiTietDonHang ct
      LEFT JOIN SanPham sp ON ct.MaSanPham = sp.MaSanPham
      GROUP BY sp.TenSanPham, sp.HinhAnh
      ORDER BY totalSold DESC
    `);

    // Doanh thu theo ngày (7 ngày gần nhất)
    const dailyRevenue = await pool.request().query(`
      SELECT TOP 7 
        CONVERT(VARCHAR(10), NgayDat, 120) as ngay,
        COUNT(*) as soDon,
        ISNULL(SUM(CASE WHEN TrangThaiDon != N'Đã hủy' THEN TongTien ELSE 0 END), 0) as doanhThu
      FROM DonHang
      GROUP BY CONVERT(VARCHAR(10), NgayDat, 120)
      ORDER BY ngay DESC
    `);

    // Doanh thu theo tháng (6 tháng gần nhất)
    const monthlyRevenue = await pool.request().query(`
      SELECT TOP 6
        YEAR(NgayDat) as nam,
        MONTH(NgayDat) as thang,
        COUNT(*) as soDon,
        ISNULL(SUM(CASE WHEN TrangThaiDon != N'Đã hủy' THEN TongTien ELSE 0 END), 0) as doanhThu
      FROM DonHang
      GROUP BY YEAR(NgayDat), MONTH(NgayDat)
      ORDER BY nam DESC, thang DESC
    `);

    // Thống kê trạng thái đơn hàng
    const ordersByStatus = await pool.request().query(`
      SELECT TrangThaiDon as status, COUNT(*) as count
      FROM DonHang
      GROUP BY TrangThaiDon
    `);

    res.json({
      totalOrders: totalOrders.recordset[0].count,
      totalRevenue: totalRevenue.recordset[0].total,
      totalProducts: totalProducts.recordset[0].count,
      totalCustomers: totalCustomers.recordset[0].count,
      pendingOrders: pendingOrders.recordset[0].count,
      recentOrders: recentOrders.recordset.map(o => ({
        id: o.MaDonHang?.trim(),
        totalAmount: o.TongTien,
        status: o.TrangThaiDon?.trim(),
        createdAt: o.NgayDat,
        customerName: o.TenKhachHang,
      })),
      topProducts: topProducts.recordset,
      dailyRevenue: dailyRevenue.recordset.map(d => ({
        date: d.ngay,
        orders: d.soDon,
        revenue: d.doanhThu,
      })).reverse(),
      monthlyRevenue: monthlyRevenue.recordset.map(m => ({
        month: `T${m.thang}/${m.nam}`,
        orders: m.soDon,
        revenue: m.doanhThu,
      })).reverse(),
      ordersByStatus: ordersByStatus.recordset.map(s => ({
        status: s.status?.trim(),
        count: s.count,
      })),
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET /api/orders/report - Báo cáo doanh thu theo hóa đơn (admin)
router.get('/report/revenue', auth, managerOnly, async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const pool = await getPool();

    let whereClause = "WHERE dh.TrangThaiDon != N'Đã hủy'";
    const request = pool.request();

    if (fromDate) {
      whereClause += ' AND CAST(dh.NgayDat AS DATE) >= @fromDate';
      request.input('fromDate', sql.Date, fromDate);
    }
    if (toDate) {
      whereClause += ' AND CAST(dh.NgayDat AS DATE) <= @toDate';
      request.input('toDate', sql.Date, toDate);
    }

    const result = await request.query(`
      SELECT dh.MaDonHang, dh.NgayDat, dh.TongTien, dh.TrangThaiDon,
             kh.TenKhachHang, kh.SoDienThoai,
             nv.HoTen AS TenNhanVien
      FROM DonHang dh
      LEFT JOIN KhachHang kh ON dh.MaKhachHang = kh.MaKhachHang
      LEFT JOIN NhanVien nv ON dh.MaNhanVienXacNhan = nv.MaNhanVien
      ${whereClause}
      ORDER BY dh.NgayDat DESC
    `);

    const orders = result.recordset.map(o => ({
      id: o.MaDonHang?.trim(),
      createdAt: o.NgayDat,
      totalAmount: o.TongTien,
      status: o.TrangThaiDon?.trim(),
      customerName: o.TenKhachHang,
      customerPhone: o.SoDienThoai?.trim(),
      staffName: o.TenNhanVien,
    }));

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    res.json({
      orders,
      totalRevenue,
      totalOrders: orders.length,
      fromDate: fromDate || null,
      toDate: toDate || null,
    });
  } catch (err) {
    console.error('Get report error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
