import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { DollarSign, Package, Users, ShoppingCart, TrendingUp, ArrowRight, Clock, BarChart3, Activity, FileDown } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart,
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await orderAPI.getStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatShortPrice = (price) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `${(price / 1000).toFixed(0)}K`;
    return price;
  };

  // ── Export Report ──
  const exportReport = () => {
    if (!stats) return;
    setExporting(true);

    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString('vi-VN');
      const timeStr = now.toLocaleTimeString('vi-VN');
      const fileDate = now.toISOString().slice(0, 10);

      let csv = '\uFEFF'; // BOM for Excel UTF-8

      // ── Header ──
      csv += '"BÁO CÁO THỐNG KÊ HIGHLANDS COFFEE"\n';
      csv += `"Ngày xuất: ${dateStr} ${timeStr}"\n`;
      csv += '\n';

      // ── 1. Tổng quan ──
      csv += '"═══ TỔNG QUAN HỆ THỐNG ═══"\n';
      csv += '"Chỉ số","Giá trị"\n';
      csv += `"Tổng đơn hàng","${stats.totalOrders || 0}"\n`;
      csv += `"Tổng doanh thu","${new Intl.NumberFormat('vi-VN').format(stats.totalRevenue || 0)} ₫"\n`;
      csv += `"Tổng sản phẩm đang bán","${stats.totalProducts || 0}"\n`;
      csv += `"Tổng khách hàng","${stats.totalCustomers || 0}"\n`;
      csv += `"Đơn chờ xác nhận","${stats.pendingOrders || 0}"\n`;
      csv += '\n';

      // ── 2. Doanh thu theo ngày  ──
      csv += '"═══ DOANH THU THEO NGÀY (7 ngày gần nhất) ═══"\n';
      csv += '"Ngày","Số đơn hàng","Doanh thu"\n';
      (stats.dailyRevenue || []).forEach(d => {
        csv += `"${d.date}","${d.orders}","${new Intl.NumberFormat('vi-VN').format(d.revenue)} ₫"\n`;
      });
      const totalDailyRev = (stats.dailyRevenue || []).reduce((s, d) => s + d.revenue, 0);
      const totalDailyOrders = (stats.dailyRevenue || []).reduce((s, d) => s + d.orders, 0);
      csv += `"TỔNG","${totalDailyOrders}","${new Intl.NumberFormat('vi-VN').format(totalDailyRev)} ₫"\n`;
      csv += '\n';

      // ── 3. Doanh thu theo tháng ──
      csv += '"═══ DOANH THU THEO THÁNG ═══"\n';
      csv += '"Tháng","Số đơn hàng","Doanh thu"\n';
      (stats.monthlyRevenue || []).forEach(m => {
        csv += `"${m.month}","${m.orders}","${new Intl.NumberFormat('vi-VN').format(m.revenue)} ₫"\n`;
      });
      const totalMonthlyRev = (stats.monthlyRevenue || []).reduce((s, m) => s + m.revenue, 0);
      const totalMonthlyOrders = (stats.monthlyRevenue || []).reduce((s, m) => s + m.orders, 0);
      csv += `"TỔNG","${totalMonthlyOrders}","${new Intl.NumberFormat('vi-VN').format(totalMonthlyRev)} ₫"\n`;
      csv += '\n';

      // ── 4. Top sản phẩm ──
      csv += '"═══ TOP SẢN PHẨM BÁN CHẠY ═══"\n';
      csv += '"Hạng","Tên sản phẩm","Số lượng bán","Doanh thu"\n';
      (stats.topProducts || []).forEach((p, i) => {
        csv += `"${i + 1}","${p.name}","${p.totalSold}","${new Intl.NumberFormat('vi-VN').format(p.totalRevenue)} ₫"\n`;
      });
      csv += '\n';

      // ── 5. Trạng thái đơn hàng ──
      csv += '"═══ PHÂN BỐ TRẠNG THÁI ĐƠN HÀNG ═══"\n';
      csv += '"Trạng thái","Số lượng","Tỷ lệ"\n';
      const totalStatusOrders = (stats.ordersByStatus || []).reduce((s, st) => s + st.count, 0);
      (stats.ordersByStatus || []).forEach(s => {
        const pct = totalStatusOrders > 0 ? ((s.count / totalStatusOrders) * 100).toFixed(1) : '0';
        csv += `"${s.status}","${s.count}","${pct}%"\n`;
      });
      csv += '\n';

      // ── 6. Đơn hàng gần đây ──
      csv += '"═══ ĐƠN HÀNG GẦN ĐÂY ═══"\n';
      csv += '"Mã đơn","Khách hàng","Tổng tiền","Trạng thái","Ngày đặt"\n';
      (stats.recentOrders || []).forEach(o => {
        const orderDate = new Date(o.createdAt).toLocaleDateString('vi-VN');
        csv += `"${o.id}","${o.customerName || ''}","${new Intl.NumberFormat('vi-VN').format(o.totalAmount)} ₫","${o.status}","${orderDate}"\n`;
      });

      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BaoCao_HighlandsCoffee_${fileDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setTimeout(() => setExporting(false), 1200);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  };

  const formatChartDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const statusLabels = {
    'Chờ xác nhận': 'Chờ xác nhận',
    'Đã xác nhận': 'Đã xác nhận',
    'Đang pha chế': 'Đang pha chế',
    'Đang giao': 'Đang giao',
    'Đã giao': 'Đã giao',
    'Hoàn thành': 'Hoàn thành',
    'Đã hủy': 'Đã hủy',
  };

  const statusColors = {
    'Chờ xác nhận': '#eab308',
    'Đã xác nhận': '#3b82f6',
    'Đang pha chế': '#8b5cf6',
    'Đang giao': '#f97316',
    'Đã giao': '#22c55e',
    'Hoàn thành': '#22c55e',
    'Đã hủy': '#ef4444',
  };

  const statusClass = {
    'Chờ xác nhận': 'db-badge-pending',
    'Đã xác nhận': 'db-badge-confirmed',
    'Đang pha chế': 'db-badge-preparing',
    'Đang giao': 'db-badge-shipping',
    'Đã giao': 'db-badge-completed',
    'Hoàn thành': 'db-badge-completed',
    'Đã hủy': 'db-badge-cancelled',
  };

  const PIE_COLORS = ['#eab308', '#3b82f6', '#8b5cf6', '#f97316', '#22c55e', '#ef4444'];

  // Custom tooltip for bar chart
  const BarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="db-tooltip">
          <p className="db-tooltip-label">{label}</p>
          <p className="db-tooltip-value">{formatPrice(payload[0].value)}</p>
          <p className="db-tooltip-sub">{payload[1]?.value || 0} đơn hàng</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for line chart
  const LineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="db-tooltip">
          <p className="db-tooltip-label">{label}</p>
          <p className="db-tooltip-value">{formatPrice(payload[0].value)}</p>
          <p className="db-tooltip-sub">{payload[1]?.value || 0} đơn hàng</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '2.5px solid rgba(192,57,43,0.15)',
          borderTopColor: '#c0392b',
          animation: 'dbSpin .8s linear infinite',
        }} />
        <style>{`@keyframes dbSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const statCards = [
    {
      icon: ShoppingCart,
      label: 'Tổng Đơn Hàng',
      value: stats?.totalOrders || 0,
      gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      iconBg: 'rgba(255,107,107,0.2)',
    },
    {
      icon: DollarSign,
      label: 'Doanh Thu',
      value: formatPrice(stats?.totalRevenue || 0),
      gradient: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
      iconBg: 'rgba(162,155,254,0.2)',
    },
    {
      icon: Package,
      label: 'Sản Phẩm',
      value: stats?.totalProducts || 0,
      gradient: 'linear-gradient(135deg, #55efc4 0%, #00b894 100%)',
      iconBg: 'rgba(85,239,196,0.2)',
    },
    {
      icon: Users,
      label: 'Khách Hàng',
      value: stats?.totalCustomers || 0,
      gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      iconBg: 'rgba(116,185,255,0.2)',
    },
  ];

  const dailyData = (stats?.dailyRevenue || []).map(d => ({
    ...d,
    label: formatChartDate(d.date),
  }));

  const monthlyData = stats?.monthlyRevenue || [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        .db-wrap { font-family: 'Outfit', sans-serif; color: #2c1a0e; }

        /* ── HEADER ── */
        .db-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
        .db-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem; font-weight: 700; color: #2c1a0e;
          margin: 0 0 4px; letter-spacing: -.01em;
        }
        .db-title span {
          background: linear-gradient(120deg, #c0392b, #e74c3c);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .db-subtitle { font-size: .85rem; color: rgba(44,26,14,0.4); }
        .db-pending-link {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 16px; border-radius: 12px;
          font-size: .82rem; font-weight: 600;
          background: rgba(234,179,8,0.08);
          border: 1.5px solid rgba(234,179,8,0.25);
          color: #a16207; text-decoration: none;
          transition: background .2s;
          white-space: nowrap;
        }
        .db-pending-link:hover { background: rgba(234,179,8,0.14); }

        .db-export-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 12px;
          font-size: .82rem; font-weight: 600;
          background: linear-gradient(135deg, #2d8a4e 0%, #1a6b38 100%);
          border: none; color: #fff;
          cursor: pointer; transition: all .25s;
          box-shadow: 0 3px 12px rgba(45,138,78,0.25);
          white-space: nowrap;
          font-family: 'Outfit', sans-serif;
        }
        .db-export-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(45,138,78,0.35); }
        .db-export-btn:active { transform: translateY(0); }
        .db-export-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .db-export-btn svg { transition: transform .2s; }
        .db-export-btn:not(:disabled):hover svg { transform: translateY(1px); }

        @keyframes exportPulse {
          0% { box-shadow: 0 0 0 0 rgba(45,138,78,0.4); }
          70% { box-shadow: 0 0 0 8px rgba(45,138,78,0); }
          100% { box-shadow: 0 0 0 0 rgba(45,138,78,0); }
        }

        /* ── STAT CARDS (Colorful style) ── */
        .db-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }
        @media (max-width: 1024px) { .db-stats { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 480px)  { .db-stats { grid-template-columns: 1fr; } }

        .db-stat-card {
          border-radius: 18px; padding: 22px 20px;
          display: flex; align-items: center; justify-content: space-between;
          color: #fff; position: relative; overflow: hidden;
          transition: transform .2s, box-shadow .2s;
          animation: dbFadeUp .4s both;
          min-height: 100px;
        }
        .db-stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.15); }
        .db-stat-card::before {
          content:''; position: absolute; right: -20px; top: -20px;
          width: 100px; height: 100px; border-radius: 50%;
          background: rgba(255,255,255,0.1);
        }
        .db-stat-card::after {
          content:''; position: absolute; right: 20px; bottom: -30px;
          width: 70px; height: 70px; border-radius: 50%;
          background: rgba(255,255,255,0.06);
        }
        .db-stat-info { position: relative; z-index: 1; }
        .db-stat-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.65rem; font-weight: 700; line-height: 1.1;
          color: #fff; margin-bottom: 4px;
        }
        .db-stat-label { font-size: .78rem; font-weight: 400; color: rgba(255,255,255,0.8); }
        .db-stat-icon-wrap {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          position: relative; z-index: 1;
        }

        @keyframes dbFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        /* ── CHART GRID ── */
        .db-chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        @media (max-width: 900px) { .db-chart-grid { grid-template-columns: 1fr; } }

        /* ── PANEL ── */
        .db-panel {
          background: #fff;
          border: 1.5px solid rgba(44,26,14,0.07);
          border-radius: 18px; padding: 22px 22px;
        }
        .db-panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .db-panel-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.15rem; font-weight: 700; color: #2c1a0e;
          display: flex; align-items: center; gap: 8px;
        }
        .db-panel-title svg { color: rgba(44,26,14,0.3); }
        .db-panel-link {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: .78rem; font-weight: 600; color: #c0392b;
          text-decoration: none; padding: 6px 12px; border-radius: 100px;
          border: 1px solid rgba(192,57,43,0.18);
          transition: background .2s;
        }
        .db-panel-link:hover { background: rgba(192,57,43,0.06); }
        .db-panel-link svg { transition: transform .2s; }
        .db-panel-link:hover svg { transform: translateX(3px); }

        /* ── Chart Summary Stats ── */
        .db-chart-summary {
          display: flex; gap: 0; margin-top: 16px;
          border-top: 1px solid rgba(44,26,14,0.06); padding-top: 14px;
        }
        .db-chart-stat {
          flex: 1; text-align: center; padding: 0 8px;
          border-right: 1px solid rgba(44,26,14,0.06);
        }
        .db-chart-stat:last-child { border-right: none; }
        .db-chart-stat-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem; font-weight: 700; color: #2c1a0e;
        }
        .db-chart-stat-label { font-size: .68rem; color: rgba(44,26,14,0.4); margin-top: 2px; }

        /* ── Tooltip ── */
        .db-tooltip {
          background: rgba(44,26,14,0.92); backdrop-filter: blur(8px);
          border-radius: 10px; padding: 10px 14px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .db-tooltip-label { font-size: .72rem; color: rgba(255,255,255,0.6); margin-bottom: 4px; }
        .db-tooltip-value { font-size: .88rem; font-weight: 700; color: #fff; }
        .db-tooltip-sub { font-size: .72rem; color: rgba(255,255,255,0.5); margin-top: 2px; }

        /* ── BOTTOM GRID ── */
        .db-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        @media (max-width: 900px) { .db-bottom { grid-template-columns: 1fr; } }

        /* ── THREE COL GRID ── */
        .db-three-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
        @media (max-width: 1100px) { .db-three-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 700px)  { .db-three-grid { grid-template-columns: 1fr; } }

        /* ── ORDER ROW ── */
        .db-order-list { display: flex; flex-direction: column; gap: 8px; }
        .db-order-row {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          padding: 12px 14px; border-radius: 12px;
          background: #faf6f0;
          border: 1px solid rgba(44,26,14,0.05);
          transition: background .15s;
        }
        .db-order-row:hover { background: #f3ede3; }
        .db-order-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .db-order-num {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: rgba(192,57,43,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #c0392b;
        }
        .db-order-name { font-size: .85rem; font-weight: 600; color: #2c1a0e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .db-order-date { font-size: .72rem; color: rgba(44,26,14,0.35); margin-top: 1px; }
        .db-order-right { text-align: right; flex-shrink: 0; }
        .db-order-amount { font-size: .85rem; font-weight: 700; color: #c8914a; white-space: nowrap; }

        /* ── TOP PRODUCTS ── */
        .db-product-list { display: flex; flex-direction: column; gap: 8px; }
        .db-product-row {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          padding: 12px 14px; border-radius: 12px;
          background: #faf6f0;
          border: 1px solid rgba(44,26,14,0.05);
          transition: background .15s;
        }
        .db-product-row:hover { background: #f3ede3; }
        .db-product-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .db-product-rank {
          width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700;
        }
        .rank-1 { background: rgba(200,145,74,0.15); color: #a06a20; }
        .rank-2 { background: rgba(44,26,14,0.07); color: rgba(44,26,14,0.5); }
        .rank-3 { background: rgba(44,26,14,0.07); color: rgba(44,26,14,0.5); }
        .rank-n { background: rgba(44,26,14,0.04); color: rgba(44,26,14,0.35); }
        .db-product-name { font-size: .85rem; font-weight: 600; color: #2c1a0e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .db-product-sold { font-size: .72rem; color: rgba(44,26,14,0.35); margin-top: 1px; }
        .db-product-rev { font-size: .85rem; font-weight: 700; color: #c8914a; white-space: nowrap; }

        /* ── PIE LEGEND ── */
        .db-pie-legend { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
        .db-pie-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 6px 10px; border-radius: 8px;
          background: #faf6f0; border: 1px solid rgba(44,26,14,0.05);
        }
        .db-pie-left { display: flex; align-items: center; gap: 8px; }
        .db-pie-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
        .db-pie-name { font-size: .78rem; font-weight: 500; color: #2c1a0e; }
        .db-pie-count { font-size: .82rem; font-weight: 700; color: rgba(44,26,14,0.6); }

        /* ── STATUS BADGES ── */
        .db-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 9px; border-radius: 100px; font-size: 10px; font-weight: 600; margin-top: 3px;
        }
        .db-badge::before { content:''; width:5px; height:5px; border-radius:50%; }
        .db-badge-pending   { background:rgba(234,179,8,0.1);  color:#a16207; }
        .db-badge-pending::before   { background:#ca8a04; }
        .db-badge-confirmed { background:rgba(59,130,246,0.1); color:#1d4ed8; }
        .db-badge-confirmed::before { background:#3b82f6; }
        .db-badge-preparing { background:rgba(139,92,246,0.1); color:#6d28d9; }
        .db-badge-preparing::before { background:#8b5cf6; }
        .db-badge-shipping  { background:rgba(249,115,22,0.1); color:#c2410c; }
        .db-badge-shipping::before  { background:#f97316; }
        .db-badge-completed { background:rgba(34,197,94,0.1);  color:#15803d; }
        .db-badge-completed::before { background:#22c55e; }
        .db-badge-cancelled { background:rgba(192,57,43,0.08); color:#c0392b; }
        .db-badge-cancelled::before { background:#c0392b; }

        /* ── EMPTY ── */
        .db-empty { text-align: center; padding: 32px 0; font-size: .85rem; color: rgba(44,26,14,0.3); }

        /* ── recharts overrides ── */
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line {
          stroke: rgba(44,26,14,0.06);
        }
        .recharts-text { fill: rgba(44,26,14,0.4); font-size: 11px; font-family: 'Outfit', sans-serif; }
      `}</style>

      <div className="db-wrap">

        {/* Header */}
        <div className="db-header">
          <div>
            <h1 className="db-title"><span>Dashboard</span></h1>
            <p className="db-subtitle">Tổng quan hệ thống Highlands Coffee</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {stats?.pendingOrders > 0 && (
              <Link to="/admin/orders" className="db-pending-link">
                <Clock size={14} />
                {stats.pendingOrders} đơn chờ duyệt
              </Link>
            )}
            <Link to="/admin/report" className="db-export-btn" style={{ textDecoration: 'none' }}>
              <FileDown size={15} />
              Xuất Báo Cáo
            </Link>
          </div>
        </div>

        {/* Colorful Stat Cards */}
        <div className="db-stats">
          {statCards.map((card, i) => (
            <div
              key={i}
              className="db-stat-card"
              style={{
                background: card.gradient,
                animationDelay: `${i * 0.08}s`,
              }}
            >
              <div className="db-stat-info">
                <div className="db-stat-value">{card.value}</div>
                <div className="db-stat-label">{card.label}</div>
              </div>
              <div className="db-stat-icon-wrap" style={{ background: card.iconBg }}>
                <card.icon size={24} style={{ color: '#fff' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="db-chart-grid">

          {/* Weekly Revenue Bar Chart */}
          <div className="db-panel" style={{ animation: 'dbFadeUp .5s both', animationDelay: '.35s' }}>
            <div className="db-panel-header">
              <h2 className="db-panel-title">
                <BarChart3 size={18} />
                Doanh Thu Theo Ngày
              </h2>
            </div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={formatShortPrice} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(192,57,43,0.04)' }} />
                  <Bar dataKey="revenue" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="orders" fill="url(#barGradient2)" radius={[6, 6, 0, 0]} maxBarSize={36} hide />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6b6b" />
                      <stop offset="100%" stopColor="#ee5a24" />
                    </linearGradient>
                    <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a29bfe" />
                      <stop offset="100%" stopColor="#6c5ce7" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="db-chart-summary">
              <div className="db-chart-stat">
                <div className="db-chart-stat-value">{formatPrice(dailyData.reduce((s, d) => s + d.revenue, 0))}</div>
                <div className="db-chart-stat-label">Tổng 7 ngày</div>
              </div>
              <div className="db-chart-stat">
                <div className="db-chart-stat-value">{dailyData.reduce((s, d) => s + d.orders, 0)}</div>
                <div className="db-chart-stat-label">Số đơn hàng</div>
              </div>
              <div className="db-chart-stat">
                <div className="db-chart-stat-value">
                  {dailyData.length > 0
                    ? formatPrice(dailyData.reduce((s, d) => s + d.revenue, 0) / dailyData.length)
                    : '0 ₫'}
                </div>
                <div className="db-chart-stat-label">TB mỗi ngày</div>
              </div>
            </div>
          </div>

          {/* Monthly Revenue Area Chart */}
          <div className="db-panel" style={{ animation: 'dbFadeUp .5s both', animationDelay: '.42s' }}>
            <div className="db-panel-header">
              <h2 className="db-panel-title">
                <Activity size={18} />
                Doanh Thu Theo Tháng
              </h2>
            </div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6c5ce7" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#6c5ce7" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={formatShortPrice} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
                  <Tooltip content={<LineTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#6c5ce7" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ r: 4, fill: '#6c5ce7', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="orders" stroke="#00b894" strokeWidth={2} dot={{ r: 3 }} hide />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="db-chart-summary">
              <div className="db-chart-stat">
                <div className="db-chart-stat-value">{formatPrice(monthlyData.reduce((s, d) => s + d.revenue, 0))}</div>
                <div className="db-chart-stat-label">Tổng doanh thu</div>
              </div>
              <div className="db-chart-stat">
                <div className="db-chart-stat-value">{monthlyData.reduce((s, d) => s + d.orders, 0)}</div>
                <div className="db-chart-stat-label">Tổng đơn hàng</div>
              </div>
              <div className="db-chart-stat">
                <div className="db-chart-stat-value">
                  {monthlyData.length > 0
                    ? formatPrice(monthlyData.reduce((s, d) => s + d.revenue, 0) / monthlyData.length)
                    : '0 ₫'}
                </div>
                <div className="db-chart-stat-label">TB mỗi tháng</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom panels row */}
        <div className="db-three-grid">

          {/* Recent Orders */}
          <div className="db-panel" style={{ animation: 'dbFadeUp .5s both', animationDelay: '.5s' }}>
            <div className="db-panel-header">
              <h2 className="db-panel-title">Đơn Hàng Gần Đây</h2>
              <Link to="/admin/orders" className="db-panel-link">
                Xem tất cả <ArrowRight size={13} />
              </Link>
            </div>
            <div className="db-order-list">
              {stats?.recentOrders?.length > 0 ? stats.recentOrders.map((order) => (
                <div key={order.id} className="db-order-row">
                  <div className="db-order-left">
                    <div className="db-order-num">#{order.id}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="db-order-name">{order.customerName}</div>
                      <div className="db-order-date">{formatDate(order.createdAt)}</div>
                    </div>
                  </div>
                  <div className="db-order-right">
                    <div className="db-order-amount">{formatPrice(order.totalAmount)}</div>
                    <span className={`db-badge ${statusClass[order.status] || 'db-badge-pending'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="db-empty">Chưa có đơn hàng</div>
              )}
            </div>
          </div>

          {/* Top Products - Horizontal Bar Chart */}
          <div className="db-panel" style={{ animation: 'dbFadeUp .5s both', animationDelay: '.55s' }}>
            <div className="db-panel-header">
              <h2 className="db-panel-title">
                <BarChart3 size={18} />
                Top Sản Phẩm Bán Chạy
              </h2>
              <Link to="/admin/products" className="db-panel-link">
                Quản lý <ArrowRight size={13} />
              </Link>
            </div>
            {stats?.topProducts?.length > 0 ? (
              <>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.topProducts.map((p, i) => ({
                        name: p.name?.length > 14 ? p.name.substring(0, 14) + '…' : p.name,
                        fullName: p.name,
                        sold: p.totalSold,
                        revenue: p.totalRevenue,
                        rank: i + 1,
                      }))}
                      layout="vertical"
                      margin={{ top: 4, right: 30, left: 10, bottom: 4 }}
                      barCategoryGap="24%"
                    >
                      <defs>
                        <linearGradient id="topBarGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#c0392b" />
                          <stop offset="100%" stopColor="#e74c3c" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={110}
                        tick={{ fontSize: 11, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="db-tooltip">
                              <p className="db-tooltip-label">{d.fullName}</p>
                              <p className="db-tooltip-value">{d.sold} sản phẩm đã bán</p>
                              <p className="db-tooltip-sub">Doanh thu: {formatPrice(d.revenue)}</p>
                            </div>
                          );
                        }
                        return null;
                      }} cursor={{ fill: 'rgba(192,57,43,0.04)' }} />
                      <Bar dataKey="sold" fill="url(#topBarGrad)" radius={[0, 6, 6, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="db-chart-summary">
                  <div className="db-chart-stat">
                    <div className="db-chart-stat-value">{stats.topProducts.reduce((s, p) => s + p.totalSold, 0)}</div>
                    <div className="db-chart-stat-label">Tổng đã bán</div>
                  </div>
                  <div className="db-chart-stat">
                    <div className="db-chart-stat-value">{formatPrice(stats.topProducts.reduce((s, p) => s + p.totalRevenue, 0))}</div>
                    <div className="db-chart-stat-label">Tổng doanh thu</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="db-empty">Chưa có dữ liệu</div>
            )}
          </div>

          {/* Order Status Pie Chart */}
          <div className="db-panel" style={{ animation: 'dbFadeUp .5s both', animationDelay: '.6s' }}>
            <div className="db-panel-header">
              <h2 className="db-panel-title">Trạng Thái Đơn Hàng</h2>
            </div>
            {stats?.ordersByStatus?.length > 0 ? (
              <>
                <div style={{ width: '100%', height: 170, display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width={170} height={170}>
                    <PieChart>
                      <Pie
                        data={stats.ordersByStatus}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={72}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {stats.ordersByStatus.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={statusColors[entry.status] || PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(44,26,14,0.92)',
                          border: 'none',
                          borderRadius: 10,
                          color: '#fff',
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="db-pie-legend">
                  {stats.ordersByStatus.map((item, i) => (
                    <div key={i} className="db-pie-item">
                      <div className="db-pie-left">
                        <div
                          className="db-pie-dot"
                          style={{ background: statusColors[item.status] || PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="db-pie-name">{statusLabels[item.status] || item.status}</span>
                      </div>
                      <span className="db-pie-count">{item.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="db-empty">Chưa có dữ liệu</div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
