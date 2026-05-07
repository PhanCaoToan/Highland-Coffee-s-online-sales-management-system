import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import {
  Package, Calendar, ChevronDown, ChevronUp, ShoppingBag,
  MapPin, CreditCard, Clock, CheckCircle, Truck, XCircle, Loader2
} from 'lucide-react';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await orderAPI.getMyOrders();
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(orderId);
    if (!orderDetails[orderId]) {
      try {
        const res = await orderAPI.getById(orderId);
        setOrderDetails(prev => ({ ...prev, [orderId]: res.data }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price).replace('₫', 'đ');

  const formatDate = (date) =>
    new Date(date).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric',
    });

  // Màu sắc trạng thái theo nhận diện thương hiệu
  const statusConfig = {
    'Chờ xác nhận': {
      color: '#B22830', bg: '#FDF2F2', border: '#F8D7DA',
      icon: <Clock style={{ width: '14px', height: '14px' }} />,
      step: 1,
    },
    'Đã xác nhận': {
      color: '#006241', bg: '#E6F0EC', border: '#C2D6CF',
      icon: <CheckCircle style={{ width: '14px', height: '14px' }} />,
      step: 2,
    },
    'Đang xử lý': {
      color: '#8B572A', bg: '#F8F3EE', border: '#E9DDD0',
      icon: <Package style={{ width: '14px', height: '14px' }} />,
      step: 3,
    },
    'Đang giao': {
      color: '#D4434B', bg: '#FFF5F5', border: '#FFE5E5',
      icon: <Truck style={{ width: '14px', height: '14px' }} />,
      step: 4,
    },
    'Đã giao': {
      color: '#006241', bg: '#E6F0EC', border: '#C2D6CF',
      icon: <CheckCircle style={{ width: '14px', height: '14px' }} />,
      step: 5,
    },
    'Đã hủy': {
      color: '#666', bg: '#F5F5F5', border: '#DDD',
      icon: <XCircle style={{ width: '14px', height: '14px' }} />,
      step: -1,
    },
  };

  const timelineSteps = [
    { label: 'Chờ xác nhận', desc: 'Đơn hàng vừa được tạo', step: 1 },
    { label: 'Đã xác nhận', desc: 'Đơn hàng đã được xác nhận', step: 2 },
    { label: 'Đang xử lý', desc: 'Nhân viên đang xử lý, đóng gói', step: 3 },
    { label: 'Đang giao', desc: 'Đơn hàng đang trên đường giao', step: 4 },
    { label: 'Đã giao', desc: 'Giao hàng thành công', step: 5 },
  ];

  const getStatusInfo = (status) => statusConfig[status] || statusConfig['Chờ xác nhận'];

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', paddingTop: '100px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#F5F2EC', // Màu nền kem Highlands
      }}>
        <Loader2 style={{ width: '36px', height: '36px', color: '#B22830', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '80px',
      background: '#F5F2EC', // Màu nền kem từ ảnh
      fontFamily: "'Inter', sans-serif",
      color: '#333',
    }}>
      {/* Header Banner */}
      <div style={{
        background: '#B22830', // Màu đỏ Highlands
        padding: '48px 24px 40px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '56px', height: '56px', borderRadius: '50%',
            background: '#fff',
            marginBottom: '16px',
          }}>
            <Package style={{ width: '28px', height: '28px', color: '#B22830' }} />
          </div>
          <h1 style={{
            fontSize: '32px', fontWeight: 800, margin: '0 0 8px',
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Đơn Hàng Của Tôi
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            Theo dõi hành trình ly cà phê của bạn
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '32px 24px 64px' }}>

        {orders.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 32px',
            background: '#fff', borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}>
            <ShoppingBag style={{ width: '64px', height: '64px', color: '#E9DDD0', margin: '0 auto 20px', display: 'block' }} />
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#555', margin: '0 0 8px' }}>
              Chưa có đơn hàng
            </h3>
            <p style={{ fontSize: '14px', color: '#888', margin: '0 0 28px' }}>
              Hãy đặt ly cà phê đầu tiên của bạn nhé!
            </p>
            <Link to="/menu" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 32px', borderRadius: '50px',
              background: '#B22830',
              color: '#fff', fontSize: '14px', fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 6px 15px rgba(178,40,48,0.3)',
            }}>
              Xem thực đơn
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => {
              const st = getStatusInfo(order.status);
              const isExpanded = expandedOrder === order.id;
              const detail = orderDetails[order.id];

              return (
                <div key={order.id} style={{
                  background: '#fff',
                  borderRadius: '16px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                  border: '1px solid #E9DDD0',
                  animation: 'fadeInUp 0.5s ease-out forwards',
                }}>
                  {/* Order Header */}
                  <div
                    onClick={() => toggleOrder(order.id)}
                    style={{
                      padding: '20px 24px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: isExpanded ? '#FAF9F6' : '#fff',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#B22830', margin: '0 0 4px' }}>
                        Mã đơn: #{order.id.toString().slice(-6).toUpperCase()}
                      </h3>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '13px', color: '#888',
                      }}>
                        <Calendar style={{ width: '13px', height: '13px' }} />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '6px 14px', borderRadius: '50px',
                        fontSize: '12px', fontWeight: 600,
                        color: st.color,
                        background: st.bg,
                        border: `1px solid ${st.border}`,
                      }}>
                        {st.icon} {order.status}
                      </span>

                      <span style={{ fontSize: '17px', fontWeight: 700, color: '#333' }}>
                        {formatPrice(order.totalAmount)}
                      </span>

                      {isExpanded ? <ChevronUp color="#888" /> : <ChevronDown color="#888" />}
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid #F0EBE3', padding: '24px', background: '#fff' }}>
                      {/* Address & Payment */}
                      <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
                        background: '#FDFBFA', padding: '16px', borderRadius: '12px',
                        border: '1px dashed #E9DDD0', marginBottom: '24px'
                      }}>
                        <div>
                          <p style={{ fontSize: '11px', fontWeight: 700, color: '#8B572A', textTransform: 'uppercase', marginBottom: '8px' }}>Giao đến</p>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <MapPin size={14} color="#B22830" />
                            <p style={{ fontSize: '13px', color: '#444', margin: 0 }}>{detail?.address || 'Tại cửa hàng'}</p>
                          </div>
                        </div>
                        <div>
                          <p style={{ fontSize: '11px', fontWeight: 700, color: '#8B572A', textTransform: 'uppercase', marginBottom: '8px' }}>Thanh toán</p>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <CreditCard size={14} color="#B22830" />
                            <p style={{ fontSize: '13px', color: '#444', margin: 0 }}>Tiền mặt / Ví điện tử</p>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ marginBottom: '24px' }}>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#333', marginBottom: '12px' }}>Sản phẩm đã chọn</p>
                        {detail?.items?.map((item) => (
                          <div key={item.id} style={{
                            display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 0',
                            borderBottom: '1px solid #F0EBE3'
                          }}>
                            <img
                              src={item.productImage}
                              alt=""
                              style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', background: '#f5f5f5' }}
                              onError={(e) => { e.target.src = "https://www.highlandscoffee.com.vn/vnt_upload/product/04_2023/New_product/HLC_New_Logo.png" }}
                            />
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '14px', fontWeight: 600, color: '#333', margin: 0 }}>{item.productName}</p>
                              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{item.quantity} x {formatPrice(item.unitPrice)}</p>
                            </div>
                            <p style={{ fontSize: '14px', fontWeight: 700, color: '#B22830' }}>{formatPrice(item.quantity * item.unitPrice)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Timeline */}
                      {order.status !== 'Đã hủy' && (
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 700, color: '#333', marginBottom: '16px' }}>Trạng thái đơn hàng</p>
                          <div style={{ position: 'relative', paddingLeft: '30px' }}>
                            {timelineSteps.map((ts, idx) => {
                              const isCompleted = ts.step <= st.step;
                              const isCurrent = ts.step === st.step;
                              return (
                                <div key={ts.step} style={{ position: 'relative', paddingBottom: idx < 4 ? '20px' : 0 }}>
                                  {idx < 4 && (
                                    <div style={{
                                      position: 'absolute', left: '-21px', top: '18px', width: '2px', height: '100%',
                                      background: ts.step < st.step ? '#006241' : '#E9DDD0'
                                    }} />
                                  )}
                                  <div style={{
                                    position: 'absolute', left: '-27px', top: '2px', width: '14px', height: '14px',
                                    borderRadius: '50%', background: isCompleted ? '#006241' : '#fff',
                                    border: `2px solid ${isCompleted ? '#006241' : '#E9DDD0'}`,
                                    zIndex: 2
                                  }} />
                                  <p style={{ fontSize: '13px', fontWeight: isCurrent ? 700 : 500, color: isCompleted ? '#333' : '#AAA', margin: 0 }}>{ts.label}</p>
                                  <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>{ts.desc}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}