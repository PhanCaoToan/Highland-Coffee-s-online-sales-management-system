import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Package, User, MapPin, CreditCard, Mail, Phone,
  Clock, CheckCircle, Truck, XCircle, Loader2, FileText,
  ChevronRight, AlertCircle, Printer, PackageCheck, ShieldCheck
} from 'lucide-react';

const STATUS_FLOW = ['Chờ xác nhận', 'Đã xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao'];

const STATUS_CONFIG = {
  'Chờ xác nhận': {
    color: '#EAB308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.25)',
    icon: Clock, label: 'Chờ xác nhận', step: 0,
  },
  'Đã xác nhận': {
    color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)',
    icon: CheckCircle, label: 'Đã xác nhận', step: 1,
  },
  'Đang xử lý': {
    color: '#A855F7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.25)',
    icon: Package, label: 'Đang xử lý', step: 2,
  },
  'Đang giao': {
    color: '#F97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)',
    icon: Truck, label: 'Đang giao', step: 3,
  },
  'Đã giao': {
    color: '#22C55E', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)',
    icon: CheckCircle, label: 'Đã giao', step: 4,
  },
  'Đã hủy': {
    color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)',
    icon: XCircle, label: 'Đã hủy', step: -1,
  },
};

const NEXT_ACTION_LABELS = {
  'Chờ xác nhận': { label: 'Xác Nhận Đơn Hàng', nextDesc: 'Xác nhận đơn hàng và bắt đầu xử lý' },
  'Đã xác nhận': { label: 'Bắt Đầu Xử Lý', nextDesc: 'Đóng gói và chuẩn bị hàng hóa' },
  'Đang xử lý': { label: '🚚 Giao Cho Shipper', nextDesc: 'Đóng gói xong, bàn giao cho nhân viên giao hàng' },
  'Đang giao': { label: '✅ Xác Nhận Giao Thành Công', nextDesc: 'Khách hàng đã nhận được hàng' },
};

const PROCESS_STEPS = [
  { num: 1, label: 'NV tiếp nhận xác nhận đơn' },
  { num: 2, label: 'NV xử lý đóng gói hàng' },
  { num: 3, label: 'NV giao hàng lấy & giao' },
  { num: 4, label: 'Xác nhận giao thành công' },
];

const TIMELINE_STEPS = [
  { status: 'Chờ xác nhận', label: 'Chờ xác nhận', desc: 'Đơn hàng vừa được tạo' },
  { status: 'Đã xác nhận', label: 'Đã xác nhận', desc: 'Đơn hàng đã được xác nhận' },
  { status: 'Đang xử lý', label: 'Đang xử lý', desc: 'Nhân viên đang xử lý, đóng gói' },
  { status: 'Đang giao', label: 'Đang giao', desc: 'Đơn hàng đang trên đường giao' },
  { status: 'Đã giao', label: 'Đã giao', desc: 'Giao hàng thành công' },
];

export default function StaffOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getById(id);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await orderAPI.updateStatusWithNote(id, newStatus, note);
      setNote('');
      setShowCancelConfirm(false);
      await loadOrder();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    handleUpdateStatus('Đã hủy');
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN').format(price) + ' ₫';

  const formatDate = (date) =>
    new Date(date).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric',
    });

  const formatDateShort = (date) =>
    new Date(date).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric',
    });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 0' }}>
        <Loader2 size={36} style={{ color: '#2D6A4F', animation: 'sodSpin .8s linear infinite' }} />
        <style>{`@keyframes sodSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <AlertCircle size={48} style={{ color: 'rgba(44,26,14,0.2)', marginBottom: 16 }} />
        <p style={{ color: 'rgba(44,26,14,0.4)' }}>Không tìm thấy đơn hàng</p>
        <button onClick={() => navigate('/admin/orders')} style={btnBackStyle}>
          ← Quay lại
        </button>
      </div>
    );
  }

  const currentStatus = STATUS_CONFIG[order.status] || STATUS_CONFIG['Chờ xác nhận'];
  const currentStepIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentStepIndex >= 0 && currentStepIndex < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentStepIndex + 1] : null;
  const nextAction = NEXT_ACTION_LABELS[order.status];
  const isFinished = order.status === 'Đã giao' || order.status === 'Đã hủy';
  const isCancelled = order.status === 'Đã hủy';
  const StatusIcon = currentStatus.icon;

  // Extract order number from ID
  const orderNum = order.id?.replace(/\D/g, '') || order.id;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .sod-wrap {
          font-family: 'Inter', 'Outfit', sans-serif;
          color: #1a2e1a;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Back button */
        .sod-back {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 18px; border-radius: 12px;
          font-size: .85rem; font-weight: 600;
          color: #2D6A4F; background: rgba(45,106,79,0.08);
          border: 1.5px solid rgba(45,106,79,0.15);
          cursor: pointer; transition: all .2s;
          text-decoration: none; margin-bottom: 24px;
        }
        .sod-back:hover {
          background: rgba(45,106,79,0.15); border-color: rgba(45,106,79,0.3);
          transform: translateX(-2px);
        }

        /* Header bar */
        .sod-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px; margin-bottom: 28px;
        }
        .sod-title {
          font-size: 1.75rem; font-weight: 800; color: #1a2e1a; margin: 0;
        }
        .sod-title-sub {
          font-size: .82rem; color: rgba(26,46,26,0.45); margin-top: 4px;
        }
        .sod-header-right {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
        }
        .sod-status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 50px;
          font-size: .82rem; font-weight: 700;
        }
        .sod-price-big {
          font-size: 1.5rem; font-weight: 800; color: #2D6A4F;
        }
        .sod-btn-invoice {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 18px; border-radius: 12px;
          font-size: .82rem; font-weight: 600;
          background: linear-gradient(135deg, #2D6A4F, #1B4332);
          color: #fff; border: none; cursor: pointer;
          box-shadow: 0 4px 14px rgba(45,106,79,0.3);
          transition: all .2s;
        }
        .sod-btn-invoice:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(45,106,79,0.4); }

        /* Main grid */
        .sod-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 960px) {
          .sod-grid { grid-template-columns: 1fr; }
        }

        /* Cards */
        .sod-card {
          background: #fff;
          border-radius: 18px;
          border: 1.5px solid rgba(45,106,79,0.08);
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 2px 12px rgba(26,46,26,0.04);
          transition: box-shadow .2s;
        }
        .sod-card:hover { box-shadow: 0 4px 20px rgba(26,46,26,0.08); }
        .sod-card-title {
          display: flex; align-items: center; gap: 8px;
          font-size: .95rem; font-weight: 700; color: #1a2e1a;
          margin: 0 0 18px;
        }
        .sod-card-title svg { color: #2D6A4F; }

        /* Customer info */
        .sod-info-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        @media (max-width: 600px) { .sod-info-grid { grid-template-columns: 1fr; } }
        .sod-info-label {
          font-size: 11px; font-weight: 600; color: rgba(26,46,26,0.4);
          text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px;
        }
        .sod-info-value {
          font-size: .9rem; font-weight: 600; color: #1a2e1a;
          display: flex; align-items: center; gap: 8px;
        }
        .sod-info-value svg { color: rgba(45,106,79,0.5); flex-shrink: 0; }

        /* Product list */
        .sod-product-count {
          font-size: .82rem; font-weight: 500; color: rgba(26,46,26,0.4);
          margin-left: 4px;
        }
        .sod-product-item {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(45,106,79,0.06);
        }
        .sod-product-item:last-child { border-bottom: none; }
        .sod-product-img {
          width: 56px; height: 56px; border-radius: 14px;
          object-fit: cover; flex-shrink: 0;
          border: 1.5px solid rgba(45,106,79,0.08);
          background: #f0f5f1;
        }
        .sod-product-name { font-size: .9rem; font-weight: 700; color: #1a2e1a; margin-bottom: 2px; }
        .sod-product-meta { font-size: .78rem; color: rgba(26,46,26,0.4); }
        .sod-product-price { font-size: .95rem; font-weight: 700; color: #2D6A4F; white-space: nowrap; margin-left: auto; }

        .sod-total-row {
          display: flex; align-items: center; justify-content: flex-end;
          gap: 10px; padding-top: 16px; margin-top: 8px;
          border-top: 2px solid rgba(45,106,79,0.1);
        }
        .sod-total-label { font-size: .9rem; font-weight: 600; color: rgba(26,46,26,0.5); }
        .sod-total-val { font-size: 1.25rem; font-weight: 800; color: #2D6A4F; font-style: italic; }

        /* Timeline */
        .sod-timeline { position: relative; padding-left: 28px; }
        .sod-timeline-step {
          position: relative; padding-bottom: 24px;
        }
        .sod-timeline-step:last-child { padding-bottom: 0; }
        .sod-timeline-line {
          position: absolute; left: -18px; top: 22px;
          width: 2px; height: calc(100% - 8px);
          transition: background .3s;
        }
        .sod-timeline-dot {
          position: absolute; left: -24px; top: 2px;
          width: 14px; height: 14px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: all .3s;
        }
        .sod-timeline-label {
          font-size: .88rem; font-weight: 600; margin-bottom: 2px;
          transition: color .3s;
        }
        .sod-timeline-desc {
          font-size: .75rem; transition: color .3s;
        }
        .sod-timeline-time {
          font-size: .7rem; color: rgba(45,106,79,0.6);
          margin-top: 2px;
        }

        /* Right panel — Status update */
        .sod-panel {
          position: sticky; top: 100px;
        }
        .sod-panel-card {
          background: #fff;
          border-radius: 18px;
          border: 1.5px solid rgba(45,106,79,0.08);
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 2px 12px rgba(26,46,26,0.04);
        }
        .sod-current-status {
          font-size: 11px; font-weight: 600; color: rgba(26,46,26,0.4);
          text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px;
        }
        .sod-current-val {
          font-size: 1.15rem; font-weight: 800; color: #1a2e1a;
          margin-bottom: 20px;
        }
        .sod-next-box {
          padding: 16px; border-radius: 14px;
          background: rgba(45,106,79,0.05);
          border: 1px solid rgba(45,106,79,0.12);
          margin-bottom: 20px;
        }
        .sod-next-title {
          display: flex; align-items: center; gap: 6px;
          font-size: .82rem; font-weight: 700; color: #2D6A4F;
          margin-bottom: 8px;
        }
        .sod-next-desc {
          font-size: .78rem; color: rgba(26,46,26,0.55); line-height: 1.5;
        }

        /* Note textarea */
        .sod-note-label {
          display: flex; align-items: center; gap: 6px;
          font-size: .82rem; font-weight: 600; color: rgba(26,46,26,0.5);
          margin-bottom: 8px;
        }
        .sod-note-textarea {
          width: 100%; min-height: 90px; padding: 14px;
          border: 1.5px solid rgba(45,106,79,0.12);
          border-radius: 14px; font-family: inherit;
          font-size: .85rem; color: #1a2e1a;
          background: #fafcfa;
          resize: vertical; transition: border-color .2s;
          box-sizing: border-box;
        }
        .sod-note-textarea:focus {
          outline: none; border-color: #2D6A4F;
          box-shadow: 0 0 0 3px rgba(45,106,79,0.1);
        }
        .sod-note-textarea::placeholder { color: rgba(26,46,26,0.3); }

        /* Action buttons */
        .sod-btn-primary {
          width: 100%; padding: 14px 24px; border-radius: 14px;
          font-family: inherit; font-size: .9rem; font-weight: 700;
          background: linear-gradient(135deg, #2D6A4F, #1B4332);
          color: #fff; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 16px rgba(45,106,79,0.35);
          transition: all .25s; margin-top: 16px;
        }
        .sod-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(45,106,79,0.45);
        }
        .sod-btn-primary:disabled { opacity: .6; cursor: not-allowed; }

        .sod-btn-cancel {
          width: 100%; padding: 12px 24px; border-radius: 14px;
          font-family: inherit; font-size: .85rem; font-weight: 600;
          background: transparent;
          color: #DC2626; border: 1.5px solid rgba(220,38,38,0.25);
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
          margin-top: 10px; transition: all .2s;
        }
        .sod-btn-cancel:hover:not(:disabled) {
          background: rgba(220,38,38,0.05); border-color: rgba(220,38,38,0.4);
        }
        .sod-btn-cancel:disabled { opacity: .5; cursor: not-allowed; }

        /* Cancel confirm dialog */
        .sod-cancel-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          animation: sodFadeIn .2s;
        }
        .sod-cancel-dialog {
          background: #fff; border-radius: 20px; padding: 32px;
          max-width: 400px; width: 90%;
          box-shadow: 0 24px 64px rgba(0,0,0,0.2);
          animation: sodSlideUp .3s;
        }
        .sod-cancel-dialog h3 {
          font-size: 1.1rem; font-weight: 700; margin: 0 0 8px;
          display: flex; align-items: center; gap: 8px; color: #DC2626;
        }
        .sod-cancel-dialog p {
          font-size: .85rem; color: rgba(26,46,26,0.6); margin: 0 0 24px; line-height: 1.5;
        }
        .sod-cancel-actions {
          display: flex; gap: 10px;
        }
        .sod-cancel-actions button {
          flex: 1; padding: 12px; border-radius: 12px;
          font-family: inherit; font-size: .85rem; font-weight: 600;
          cursor: pointer; transition: all .2s;
        }
        .sod-cancel-no {
          background: rgba(26,46,26,0.06); color: #1a2e1a; border: none;
        }
        .sod-cancel-no:hover { background: rgba(26,46,26,0.1); }
        .sod-cancel-yes {
          background: #DC2626; color: #fff; border: none;
          box-shadow: 0 4px 12px rgba(220,38,38,0.3);
        }
        .sod-cancel-yes:hover { background: #B91C1C; }
        .sod-cancel-yes:disabled { opacity: .6; cursor: not-allowed; }

        /* Process steps mini */
        .sod-process-steps {
          display: flex; flex-direction: column; gap: 10px;
        }
        .sod-process-step {
          display: flex; align-items: center; gap: 10px;
          font-size: .82rem; color: rgba(26,46,26,0.55);
        }
        .sod-process-num {
          width: 24px; height: 24px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; flex-shrink: 0;
        }

        /* Finished state */
        .sod-finished-card {
          text-align: center; padding: 32px;
        }
        .sod-finished-icon {
          width: 56px; height: 56px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .sod-finished-text {
          font-size: 1rem; font-weight: 700; margin-bottom: 4px;
        }
        .sod-finished-sub {
          font-size: .82rem; color: rgba(26,46,26,0.4);
        }

        /* ── PRINT STYLES ── */
        @media print {
          /* Hide admin layout: sidebar, navbar, mobile toggle */
          .admin-sidebar, .admin-mob-toggle, .admin-overlay,
          .sod-back, .sod-btn-invoice,
          .sod-panel, .sod-cancel-overlay,
          .sod-status-badge, .sod-timeline-card {
            display: none !important;
          }

          /* Hide the fixed top navbar */
          body > div > nav,
          body > div > header,
          [class*="navbar"],
          [class*="Navbar"] {
            display: none !important;
          }

          /* Reset admin layout for print */
          .admin-wrap {
            padding-top: 0 !important;
            display: block !important;
            background: #fff !important;
          }
          .admin-content {
            margin-left: 0 !important;
            padding: 0 !important;
          }

          /* Reset layout to single column for print */
          .sod-grid {
            display: block !important;
          }

          .sod-wrap {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Print header - add store branding */
          .sod-header {
            text-align: center;
            display: block !important;
            border-bottom: 2px solid #2D6A4F;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .sod-header::before {
            content: "HIGHLANDS COFFEE";
            display: block;
            font-size: 1.5rem;
            font-weight: 800;
            color: #2D6A4F;
            letter-spacing: 2px;
            margin-bottom: 4px;
          }
          .sod-header::after {
            content: "HÓA ĐƠN BÁN HÀNG";
            display: block;
            font-size: .9rem;
            font-weight: 600;
            color: #555;
            margin-bottom: 12px;
          }
          .sod-header-right {
            justify-content: center !important;
            margin-top: 8px;
          }
          .sod-price-big {
            font-size: 1.3rem !important;
          }

          /* Clean card styling for print */
          .sod-card {
            border: 1px solid #ddd !important;
            box-shadow: none !important;
            border-radius: 8px !important;
            padding: 16px !important;
            margin-bottom: 12px !important;
            break-inside: avoid;
          }
          .sod-card:hover { box-shadow: none !important; }

          /* Product images smaller for print */
          .sod-product-img {
            width: 40px !important;
            height: 40px !important;
            border-radius: 8px !important;
          }

          /* Total row emphasis */
          .sod-total-row {
            border-top: 2px solid #2D6A4F !important;
            padding-top: 12px !important;
          }

          /* Footer with thank you */
          .sod-wrap::after {
            content: "Cảm ơn quý khách đã mua hàng tại Highlands Coffee!";
            display: block;
            text-align: center;
            font-size: .85rem;
            color: #666;
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px dashed #ccc;
          }

          /* General print cleanup */
          body { background: #fff !important; }
          * { color-adjust: exact; -webkit-print-color-adjust: exact; }
        }

        @keyframes sodFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sodSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sodSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="sod-wrap">
        {/* Back */}
        <button className="sod-back" onClick={() => navigate('/admin/orders')}>
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>

        {/* Header */}
        <div className="sod-header">
          <div>
            <h1 className="sod-title">Đơn Hàng #{orderNum}</h1>
            <p className="sod-title-sub">Đặt lúc {formatDate(order.createdAt)}</p>
          </div>
          <div className="sod-header-right">
            <span className="sod-status-badge" style={{
              color: currentStatus.color,
              background: currentStatus.bg,
              border: `1.5px solid ${currentStatus.border}`,
            }}>
              <StatusIcon size={14} />
              {currentStatus.label}
            </span>
            <span className="sod-price-big">{formatPrice(order.totalAmount)}</span>
            <button className="sod-btn-invoice" onClick={() => window.print()}>
              <Printer size={14} /> In Hóa Đơn
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="sod-grid">
          {/* Left column */}
          <div>
            {/* Customer Info */}
            <div className="sod-card">
              <h3 className="sod-card-title"><User size={18} /> Thông Tin Khách Hàng</h3>
              <div className="sod-info-grid">
                <div>
                  <div className="sod-info-label">Khách hàng</div>
                  <div className="sod-info-value">
                    <User size={14} /> {order.customerName || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="sod-info-label">Email</div>
                  <div className="sod-info-value">
                    <Mail size={14} /> {order.customerEmail || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="sod-info-label">Địa chỉ giao</div>
                  <div className="sod-info-value">
                    <MapPin size={14} /> {order.address || 'Chưa cung cấp'}
                  </div>
                </div>
                <div>
                  <div className="sod-info-label">Thanh toán</div>
                  <div className="sod-info-value">
                    <CreditCard size={14} />
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, background: 'rgba(45,106,79,0.06)', fontSize: '.82rem', fontWeight: 600 }}>
                      💵 {order.paymentMethod || 'COD'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="sod-card">
              <h3 className="sod-card-title">
                <Package size={18} /> Sản Phẩm
                <span className="sod-product-count">({order.items?.length || 0})</span>
              </h3>
              {order.items?.map((item, idx) => (
                <div key={idx} className="sod-product-item">
                  <img
                    className="sod-product-img"
                    src={item.productImage || '/images/placeholder.jpg'}
                    alt={item.productName}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/100x100/f0f5f1/2D6A4F?text=🌿';
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="sod-product-name">{item.productName}</div>
                    <div className="sod-product-meta">
                      {formatPrice(item.unitPrice)} x {item.quantity}
                    </div>
                  </div>
                  <div className="sod-product-price">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
              <div className="sod-total-row">
                <span className="sod-total-label">Tổng:</span>
                <span className="sod-total-val">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="sod-card sod-timeline-card">
              <h3 className="sod-card-title"><Clock size={18} /> Lịch Sử Xử Lý</h3>
              <div className="sod-timeline">
                {TIMELINE_STEPS.map((step, idx) => {
                  const stepIndex = STATUS_FLOW.indexOf(step.status);
                  const isCompleted = currentStepIndex >= stepIndex;
                  const isCurrent = currentStepIndex === stepIndex;
                  const isLast = idx === TIMELINE_STEPS.length - 1;

                  // For cancelled orders, only show first step as completed
                  const isCompletedFinal = isCancelled ? idx === 0 : isCompleted;
                  const isCurrentFinal = isCancelled ? false : isCurrent;

                  return (
                    <div key={step.status} className="sod-timeline-step">
                      {/* Line */}
                      {!isLast && (
                        <div className="sod-timeline-line" style={{
                          background: isCompletedFinal && !isCurrent
                            ? '#2D6A4F'
                            : 'rgba(45,106,79,0.12)',
                        }} />
                      )}
                      {/* Dot */}
                      <div className="sod-timeline-dot" style={{
                        background: isCompletedFinal ? '#2D6A4F' : 'rgba(45,106,79,0.1)',
                        boxShadow: isCurrentFinal ? '0 0 0 4px rgba(45,106,79,0.15)' : 'none',
                      }}>
                        {isCompletedFinal && <CheckCircle size={10} color="#fff" />}
                      </div>
                      {/* Text */}
                      <div>
                        <div className="sod-timeline-label" style={{
                          color: isCompletedFinal ? '#1a2e1a' : 'rgba(26,46,26,0.3)',
                          fontWeight: isCurrentFinal ? 700 : 500,
                        }}>
                          {step.label}
                        </div>
                        <div className="sod-timeline-desc" style={{
                          color: isCompletedFinal ? 'rgba(26,46,26,0.5)' : 'rgba(26,46,26,0.2)',
                        }}>
                          {step.desc}
                        </div>
                        {isCompletedFinal && (
                          <div className="sod-timeline-time">
                            {formatDateShort(order.createdAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Cancelled timeline entry */}
                {isCancelled && (
                  <div className="sod-timeline-step" style={{ paddingBottom: 0 }}>
                    <div className="sod-timeline-dot" style={{
                      background: '#DC2626',
                      boxShadow: '0 0 0 4px rgba(220,38,38,0.15)',
                    }}>
                      <XCircle size={10} color="#fff" />
                    </div>
                    <div>
                      <div className="sod-timeline-label" style={{ color: '#DC2626', fontWeight: 700 }}>
                        Đã hủy
                      </div>
                      <div className="sod-timeline-desc" style={{ color: 'rgba(220,38,38,0.6)' }}>
                        Đơn hàng đã bị hủy
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="sod-panel">
            {!isFinished ? (
              <>
                {/* Status Update Panel */}
                <div className="sod-panel-card">
                  <h3 className="sod-card-title" style={{ marginBottom: 20 }}>
                    <ShieldCheck size={18} /> Cập Nhật Trạng Thái
                  </h3>

                  <div className="sod-current-status">Trạng thái hiện tại</div>
                  <div className="sod-current-val">{currentStatus.label}</div>

                  {/* Next step box */}
                  {nextAction && (
                    <div className="sod-next-box">
                      <div className="sod-next-title">
                        <ChevronRight size={16} />
                        Bước tiếp theo: {nextStatus}
                      </div>
                      <div className="sod-next-desc">{nextAction.nextDesc}</div>
                    </div>
                  )}

                  {/* Note */}
                  <div className="sod-note-label">
                    <FileText size={14} /> Ghi chú xử lý
                  </div>
                  <textarea
                    className="sod-note-textarea"
                    placeholder="Ghi chú cho khách hàng (tùy chọn)..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />

                  {/* Action button */}
                  {nextStatus && (
                    <button
                      className="sod-btn-primary"
                      onClick={() => handleUpdateStatus(nextStatus)}
                      disabled={updating}
                    >
                      {updating ? (
                        <Loader2 size={18} style={{ animation: 'sodSpin .8s linear infinite' }} />
                      ) : (
                        <>
                          <PackageCheck size={18} />
                          {nextAction.label}
                        </>
                      )}
                    </button>
                  )}

                  {/* Cancel button */}
                  <button
                    className="sod-btn-cancel"
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={updating}
                  >
                    <XCircle size={14} /> Hủy đơn hàng
                  </button>
                </div>

                {/* Process Steps */}
                <div className="sod-panel-card">
                  <h3 className="sod-card-title" style={{ marginBottom: 16 }}>
                    <FileText size={18} /> Quy Trình Xử Lý
                  </h3>
                  <div className="sod-process-steps">
                    {PROCESS_STEPS.map((ps) => {
                      const isActive = ps.num - 1 <= currentStepIndex;
                      return (
                        <div key={ps.num} className="sod-process-step" style={{
                          color: isActive ? '#1a2e1a' : 'rgba(26,46,26,0.35)',
                        }}>
                          <span className="sod-process-num" style={{
                            background: isActive ? '#2D6A4F' : 'rgba(45,106,79,0.08)',
                            color: isActive ? '#fff' : 'rgba(26,46,26,0.3)',
                          }}>
                            {ps.num}
                          </span>
                          {ps.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* Finished / Cancelled state */
              <div className="sod-panel-card sod-finished-card">
                <div className="sod-finished-icon" style={{
                  background: isCancelled ? 'rgba(220,38,38,0.1)' : 'rgba(34,197,94,0.1)',
                }}>
                  {isCancelled ? (
                    <XCircle size={28} color="#DC2626" />
                  ) : (
                    <CheckCircle size={28} color="#22C55E" />
                  )}
                </div>
                <div className="sod-finished-text" style={{
                  color: isCancelled ? '#DC2626' : '#22C55E',
                }}>
                  {isCancelled ? 'Đơn hàng đã bị hủy' : 'Giao hàng thành công!'}
                </div>
                <p className="sod-finished-sub">
                  {isCancelled
                    ? 'Đơn hàng này đã được hủy và không thể khôi phục.'
                    : 'Đơn hàng đã được giao thành công đến khách hàng.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cancel confirm dialog */}
        {showCancelConfirm && (
          <div className="sod-cancel-overlay" onClick={() => setShowCancelConfirm(false)}>
            <div className="sod-cancel-dialog" onClick={e => e.stopPropagation()}>
              <h3><AlertCircle size={20} /> Xác nhận hủy đơn</h3>
              <p>
                Bạn có chắc chắn muốn hủy đơn hàng <strong>#{orderNum}</strong>?
                Hành động này không thể hoàn tác.
              </p>
              <div className="sod-cancel-actions">
                <button className="sod-cancel-no" onClick={() => setShowCancelConfirm(false)}>
                  Không, giữ lại
                </button>
                <button className="sod-cancel-yes" onClick={handleCancel} disabled={updating}>
                  {updating ? 'Đang xử lý...' : 'Hủy đơn hàng'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const btnBackStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '10px 20px', borderRadius: 12, marginTop: 16,
  background: 'rgba(45,106,79,0.08)', color: '#2D6A4F',
  border: '1.5px solid rgba(45,106,79,0.15)',
  cursor: 'pointer', fontWeight: 600, fontSize: '.85rem',
};
