import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { Package, Eye, CheckCircle, XCircle, Loader2, Calendar, User, Phone, ChevronRight } from 'lucide-react';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await orderAPI.getAllOrders();
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await orderAPI.updateStatus(id, status);
      loadOrders();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const statusConfig = {
    'Chờ xác nhận': { label: 'Chờ duyệt', color: '#EAB308', bg: '#FEFCE8', border: '#FEF08A' },
    'Đã xác nhận': { label: 'Đã xác nhận', color: '#2563EB', bg: '#EFF6FF', border: '#DBEAFE' },
    'Đang xử lý': { label: 'Đang xử lý', color: '#9333EA', bg: '#FAF5FF', border: '#F3E8FF' },
    'Đang giao': { label: 'Đang giao', color: '#EA580C', bg: '#FFF7ED', border: '#FFEDD5' },
    'Đã giao': { label: 'Đã giao', color: '#16A34A', bg: '#F0FDF4', border: '#DCFCE7' },
    'Đã hủy': { label: 'Đã hủy', color: '#DC2626', bg: '#FEF2F2', border: '#FEE2E2' },
  };

  const statusFlow = ['Chờ xác nhận', 'Đã xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao'];
  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: '16px' }}>
        <Loader2 size={40} className="mo-spin" style={{ color: '#B22830' }} />
        <span style={{ color: '#888', fontSize: '14px', fontWeight: 500 }}>Đang tải danh sách đơn hàng...</span>
        <style>{`@keyframes moSpin { to { transform: rotate(360deg); } } .mo-spin { animation: moSpin 1s linear infinite; }`}</style>
      </div>
    );
  }

  return (
    <div className="mo-container" style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .mo-header { margin-bottom: 32px; }
        .mo-title { font-size: 28px; fontWeight: 800; color: #1a1a1a; margin: 0; }
        .mo-title span { color: #B22830; }
        
        /* Filter Styles */
        .mo-filter-bar { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 24px; scrollbar-width: none; }
        .mo-filter-btn {
          padding: 8px 16px; border-radius: 50px; border: 1px solid #e5e7eb;
          background: #fff; color: #6b7280; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
          display: flex; align-items: center; gap: 8px;
        }
        .mo-filter-btn:hover { border-color: #B22830; color: #B22830; }
        .mo-filter-btn.active { background: #B22830; border-color: #B22830; color: #fff; box-shadow: 0 4px 12px rgba(178, 40, 48, 0.2); }
        .mo-count { background: rgba(0,0,0,0.05); padding: 2px 8px; border-radius: 10px; font-size: 11px; }
        .active .mo-count { background: rgba(255,255,255,0.2); }

        /* Order Card */
        .order-card {
          background: #fff; border-radius: 16px; border: 1px solid #f3f4f6;
          padding: 20px; margin-bottom: 16px; transition: all 0.3s ease;
          display: grid; grid-template-columns: 1fr auto; gap: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .order-card:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); border-color: #B2283033; }

        .info-group { display: flex; align-items: flex-start; gap: 12px; }
        .order-icon-box { 
          width: 48px; height: 48px; border-radius: 12px; background: #FFF5F5; 
          display: flex; align-items: center; justify-content: center; color: #B22830;
        }
        .order-main-info h3 { font-size: 16px; font-weight: 700; margin: 0 0 6px 0; color: #111827; }
        .meta-grid { display: grid; grid-template-columns: auto auto; gap: 8px 20px; }
        .meta-item { display: flex; align-items: center; gap: 6px; color: #6b7280; font-size: 13px; }

        .status-badge {
          padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700;
          display: inline-flex; align-items: center; gap: 6px; border: 1px solid;
        }

        .action-area { display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; gap: 12px; }
        .price-tag { font-size: 18px; font-weight: 800; color: #1a1a1a; }
        .btn-group { display: flex; gap: 8px; }

        .btn {
          padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; border: none;
        }
        .btn-view { background: #f3f4f6; color: #374151; }
        .btn-view:hover { background: #e5e7eb; }
        .btn-next { background: #16A34A; color: #fff; }
        .btn-next:hover { background: #15803d; }
        .btn-cancel { background: #fff; color: #dc2626; border: 1px solid #fee2e2; }
        .btn-cancel:hover { background: #fef2f2; }
        
        @media (max-width: 768px) {
          .order-card { grid-template-columns: 1fr; }
          .action-area { align-items: flex-start; }
          .meta-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="mo-header">
        <h1 className="mo-title">Quản Lý <span>Đơn Hàng</span></h1>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>Hệ thống quản lý vận hành Highlands Coffee</p>
      </div>

      <div className="mo-filter-bar">
        {['all', 'Chờ xác nhận', 'Đã xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'].map((key) => {
          const config = statusConfig[key] || { label: 'Tất cả' };
          const count = key === 'all' ? orders.length : orders.filter(o => o.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`mo-filter-btn ${filter === key ? 'active' : ''}`}
            >
              {config.label}
              <span className="mo-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mo-list">
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: '1px dashed #ddd' }}>
            <Package size={48} color="#ccc" style={{ marginBottom: '16px' }} />
            <p style={{ color: '#999' }}>Không tìm thấy đơn hàng nào trong mục này.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const st = statusConfig[order.status] || statusConfig['Chờ xác nhận'];
            const nextStatusIdx = statusFlow.indexOf(order.status) + 1;
            const nextStatus = statusFlow[nextStatusIdx];

            return (
              <div key={order.id} className="order-card">
                <div className="info-group">
                  <div className="order-icon-box">
                    <Package size={24} />
                  </div>
                  <div className="order-main-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3>Đơn hàng #{order.id.toString().slice(-6).toUpperCase()}</h3>
                      <span className="status-badge" style={{ color: st.color, backgroundColor: st.bg, borderColor: st.border }}>
                        {order.status}
                      </span>
                    </div>

                    <div className="meta-grid">
                      <div className="meta-item"><User size={14} /> {order.customerName}</div>
                      <div className="meta-item"><Calendar size={14} /> {formatDate(order.createdAt)}</div>
                      <div className="meta-item"><Phone size={14} /> {order.customerPhone || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <div className="action-area">
                  <div className="price-tag">{formatPrice(order.totalAmount)}</div>
                  <div className="btn-group">
                    <button className="btn btn-view" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                      <Eye size={16} /> Chi tiết
                    </button>

                    {updatingId === order.id ? (
                      <button className="btn" disabled style={{ background: '#f3f4f6' }}>
                        <Loader2 size={16} className="mo-spin" />
                      </button>
                    ) : (
                      <>
                        {nextStatus && order.status !== 'Đã hủy' && (
                          <button className="btn btn-next" onClick={() => updateStatus(order.id, nextStatus)}>
                            <CheckCircle size={16} /> {statusConfig[nextStatus].label}
                          </button>
                        )}
                        {['Chờ xác nhận', 'Đã xác nhận'].includes(order.status) && (
                          <button className="btn btn-cancel" onClick={() => updateStatus(order.id, 'Đã hủy')}>
                            <XCircle size={16} /> Hủy đơn
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}