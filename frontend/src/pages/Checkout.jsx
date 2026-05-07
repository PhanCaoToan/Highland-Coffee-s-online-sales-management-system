import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, promotionAPI } from '../services/api';
import {
  ArrowLeft, ArrowRight, CheckCircle, Loader2,
  MapPin, CreditCard, ShoppingBag, Package, Truck, Shield, Tag, X, Percent
} from 'lucide-react';

export default function Checkout() {
  const { items, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [error, setError] = useState('');

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [availablePromos, setAvailablePromos] = useState([]);
  const [promosLoading, setPromosLoading] = useState(true);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const shippingFee = totalPrice >= 200000 ? 0 : 30000;
  const discountAmount = appliedPromo ? Math.round(totalPrice * (appliedPromo.discount / 100)) : 0;
  const grandTotal = totalPrice + shippingFee - discountAmount;

  if (!user) { navigate('/login'); return null; }
  if (items.length === 0 && !success) { navigate('/cart'); return null; }

  useEffect(() => {
    const loadPromos = async () => {
      try {
        const res = await promotionAPI.getActive();
        setAvailablePromos(res.data);
      } catch (err) {
        console.error('Failed to load promotions:', err);
      } finally {
        setPromosLoading(false);
      }
    };
    loadPromos();
  }, []);

  const handleConfirmOrder = async () => {
    if (!address.trim()) { setError('Vui lòng nhập địa chỉ giao hàng'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await orderAPI.create({
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        note, diaChiGiao: address, maKhuyenMai: appliedPromo?.id || null,
      });
      setCreatedOrder(res.data); setSuccess(true); clearCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally { setSubmitting(false); }
  };

  const paymentMethods = [
    { id: 'cod', label: 'Thanh toán khi nhận hàng', icon: '💵', desc: 'Thanh toán bằng tiền mặt khi nhận hàng' },
    { id: 'banking', label: 'Chuyển khoản ngân hàng', icon: '🏦', desc: 'Chuyển khoản qua ngân hàng nội địa' },
    { id: 'momo', label: 'Ví MoMo', icon: '📱', desc: 'Thanh toán qua ví điện tử MoMo' },
  ];

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) { setPromoError('Vui lòng nhập mã khuyến mãi'); return; }
    setPromoLoading(true); setPromoError(''); setPromoSuccess('');
    try {
      const res = await promotionAPI.validate(promoCode.trim());
      setAppliedPromo(res.data);
      setPromoSuccess(`Áp dụng thành công! Giảm ${res.data.discount}%`);
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Mã khuyến mãi không hợp lệ');
      setAppliedPromo(null);
    } finally { setPromoLoading(false); }
  };

  const handleSelectPromo = (promo) => {
    setAppliedPromo(promo); setPromoCode(promo.id);
    setPromoSuccess(`Áp dụng thành công! Giảm ${promo.discount}%`); setPromoError('');
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null); setPromoCode(''); setPromoSuccess(''); setPromoError('');
  };

  /* ─── Tokens ─── */
  const C = {
    bg: '#F7F3EE',
    surface: '#FFFFFF',
    border: '#E8E0D5',
    borderLight: '#EDE6DC',
    red: '#C8102E',
    redDark: '#A50D25',
    redBg: 'rgba(200,16,46,0.07)',
    text: '#1A1A1A',
    textMid: '#6B5F54',
    textLight: '#9A8F83',
    textFaint: '#B0A090',
    gold: '#B5862A',
    green: '#16A34A',
    greenBg: 'rgba(22,163,74,0.08)',
    greenBorder: 'rgba(22,163,74,0.22)',
    serif: 'Georgia, "Times New Roman", serif',
    sans: "'Helvetica Neue', Arial, sans-serif",
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <div style={{
        minHeight: '100vh', paddingTop: '100px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: C.bg, fontFamily: C.sans,
      }}>
        <div style={{
          textAlign: 'center', maxWidth: '480px', padding: '56px 40px',
          background: C.surface, borderRadius: '24px',
          border: `1px solid ${C.border}`,
          boxShadow: '0 12px 48px rgba(0,0,0,0.08)',
        }}>
          <div style={{
            width: '88px', height: '88px', borderRadius: '50%', margin: '0 auto 28px',
            background: C.green,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 28px rgba(22,163,74,0.25)',
          }}>
            <CheckCircle style={{ width: '44px', height: '44px', color: '#fff' }} />
          </div>
          <h2 style={{
            fontSize: '28px', fontWeight: 700, color: C.text,
            fontFamily: C.serif, margin: '0 0 10px',
          }}>
            Đặt Hàng Thành Công!
          </h2>
          {createdOrder && (
            <p style={{ fontSize: '14px', color: C.textLight, margin: '0 0 6px' }}>
              Mã đơn hàng: <span style={{ color: C.red, fontWeight: 700 }}>{createdOrder.id}</span>
            </p>
          )}
          <p style={{ fontSize: '14px', color: C.textFaint, margin: '0 0 40px' }}>
            Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được chuẩn bị.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/orders" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 28px', borderRadius: '14px',
              background: C.red, color: '#fff',
              fontSize: '14px', fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(200,16,46,0.25)',
            }}>
              Xem đơn hàng <ArrowRight style={{ width: '16px', height: '16px' }} />
            </Link>
            <Link to="/menu" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 28px', borderRadius: '14px',
              border: `1.5px solid ${C.border}`, color: C.textMid,
              fontSize: '14px', fontWeight: 600, textDecoration: 'none',
              background: C.surface,
            }}>
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Checkout ── */
  return (
    <div style={{
      minHeight: '100vh', paddingTop: '80px',
      background: C.bg, fontFamily: C.sans, color: C.text,
    }}>
      {/* Header Banner */}
      <div style={{
        background: C.red,
        padding: '40px 24px 36px', textAlign: 'center',
        borderBottom: `1px solid ${C.redDark}`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 30% 60%, rgba(255,255,255,0.08) 0%, transparent 50%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '30px', height: '30px', borderRadius: '14px',
            background: 'rgba(105, 80, 80, 0.18)', marginBottom: '14px',
          }}>
            <Package style={{ width: '26px', height: '26px', color: '#fff' }} />
          </div>
          <h1 style={{
            fontSize: '30px', fontWeight: 700, margin: '0 0 6px',
            fontFamily: C.serif, color: '#fff',
          }}>
            Xác Nhận Đơn Hàng
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
            Kiểm tra thông tin và xác nhận đặt hàng
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Breadcrumb */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '13px', color: C.textFaint, marginBottom: '28px',
        }}>
          <Link to="/" style={{ color: C.textFaint, textDecoration: 'none' }}>Trang chủ</Link>
          <span>/</span>
          <Link to="/cart" style={{ color: C.textFaint, textDecoration: 'none' }}>Giỏ hàng</Link>
          <span>/</span>
          <span style={{ color: C.red, fontWeight: 600 }}>Thanh toán</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px', alignItems: 'start' }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Delivery Address */}
            <Section icon={<MapPin style={{ width: '20px', height: '20px', color: C.red }} />}
              iconBg={C.redBg} title="Địa Chỉ Giao Hàng" C={C}>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nhập địa chỉ giao hàng..."
                style={inputStyle(C)}
                onFocus={e => { e.target.style.borderColor = C.red; e.target.style.boxShadow = `0 0 0 3px ${C.redBg}`; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
              <p style={{ fontSize: '12px', color: C.textFaint, marginTop: '8px' }}>
                Hãy nhập chính xác địa chỉ để shipper giao hàng nhanh nhất
              </p>
            </Section>

            {/* Payment Method */}
            <Section icon={<CreditCard style={{ width: '20px', height: '20px', color: C.gold }} />}
              iconBg="rgba(181,134,42,0.10)" title="Phương Thức Thanh Toán" C={C}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {paymentMethods.map(pm => (
                  <label key={pm.id} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 16px', borderRadius: '14px', cursor: 'pointer',
                    border: paymentMethod === pm.id ? `2px solid ${C.red}` : `1.5px solid ${C.border}`,
                    background: paymentMethod === pm.id ? C.redBg : C.bg,
                    transition: 'all 0.18s',
                  }}>
                    <input type="radio" name="payment" value={pm.id}
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id)}
                      style={{ display: 'none' }} />
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                      border: paymentMethod === pm.id ? `2px solid ${C.red}` : `2px solid ${C.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {paymentMethod === pm.id && (
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: C.red }} />
                      )}
                    </div>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>{pm.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: C.text, margin: '0 0 2px' }}>{pm.label}</p>
                      <p style={{ fontSize: '12px', color: C.textLight, margin: 0 }}>{pm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Section>

            {/* Promotion */}
            <Section icon={<Tag style={{ width: '20px', height: '20px', color: C.green }} />}
              iconBg={C.greenBg} title="Chương Trình Khuyến Mãi" C={C}>

              {appliedPromo && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: '12px', marginBottom: '16px',
                  background: C.greenBg, border: `1.5px solid ${C.greenBorder}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: C.green,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Percent style={{ width: '18px', height: '18px', color: '#fff' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: C.green, margin: '0 0 2px' }}>
                        {appliedPromo.name}
                      </p>
                      <p style={{ fontSize: '12px', color: C.textLight, margin: 0 }}>
                        Giảm {appliedPromo.discount}% đơn hàng
                      </p>
                    </div>
                  </div>
                  <button onClick={handleRemovePromo} style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: 'rgba(200,16,46,0.08)', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}>
                    <X style={{ width: '14px', height: '14px', color: C.red }} />
                  </button>
                </div>
              )}

              {!appliedPromo && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                    placeholder="Nhập mã khuyến mãi..."
                    onKeyDown={e => { if (e.key === 'Enter') handleApplyPromo(); }}
                    style={{
                      ...inputStyle(C),
                      fontWeight: 600, letterSpacing: '0.05em',
                      borderColor: promoError ? '#EF4444' : C.border,
                    }}
                    onFocus={e => { if (!promoError) { e.target.style.borderColor = C.green; e.target.style.boxShadow = `0 0 0 3px ${C.greenBg}`; } }}
                    onBlur={e => { e.target.style.borderColor = promoError ? '#EF4444' : C.border; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoCode.trim()}
                    style={{
                      padding: '12px 20px', borderRadius: '12px', whiteSpace: 'nowrap',
                      background: promoLoading || !promoCode.trim() ? C.border : C.green,
                      color: promoLoading || !promoCode.trim() ? C.textFaint : '#fff',
                      fontSize: '13px', fontWeight: 700, border: 'none',
                      cursor: promoLoading || !promoCode.trim() ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.18s',
                    }}
                  >
                    {promoLoading
                      ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                      : 'Áp dụng'}
                  </button>
                </div>
              )}

              {promoError && (
                <div style={{
                  padding: '10px 14px', borderRadius: '10px', marginBottom: '12px',
                  background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)',
                  color: '#DC2626', fontSize: '13px',
                }}>
                  ⚠️ {promoError}
                </div>
              )}

              {!appliedPromo && (
                <div>
                  <p style={{
                    fontSize: '11px', fontWeight: 700, color: C.textFaint,
                    margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.6px',
                  }}>
                    Khuyến mãi hiện có
                  </p>
                  {promosLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
                      <Loader2 style={{ width: '14px', height: '14px', color: C.green, animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: '13px', color: C.textLight }}>Đang tải...</span>
                    </div>
                  ) : availablePromos.length === 0 ? (
                    <div style={{
                      padding: '16px', borderRadius: '12px', textAlign: 'center',
                      background: C.bg, border: `1px dashed ${C.border}`,
                    }}>
                      <p style={{ fontSize: '13px', color: C.textFaint, margin: 0 }}>
                        Hiện tại chưa có chương trình khuyến mãi nào
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {availablePromos.map(promo => (
                        <div key={promo.id} onClick={() => handleSelectPromo(promo)} style={{
                          display: 'flex', alignItems: 'center', gap: '14px',
                          padding: '14px 16px', borderRadius: '14px', cursor: 'pointer',
                          border: `1.5px solid ${C.border}`, background: C.bg,
                          transition: 'all 0.18s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.background = C.greenBg; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg; }}
                        >
                          <div style={{
                            width: '48px', height: '48px', borderRadius: '12px',
                            background: C.greenBg, border: `1px solid ${C.greenBorder}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <span style={{ fontSize: '15px', fontWeight: 800, color: C.green, fontFamily: C.serif }}>
                              {promo.discount}%
                            </span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: C.text, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {promo.name}
                            </p>
                            <p style={{ fontSize: '11px', color: C.textLight, margin: '0 0 2px' }}>
                              Mã: <span style={{ color: C.gold, fontWeight: 700, letterSpacing: '0.05em' }}>{promo.id}</span>
                            </p>
                            {promo.condition && (
                              <p style={{ fontSize: '11px', color: C.textFaint, margin: 0 }}>{promo.condition}</p>
                            )}
                          </div>
                          <div style={{
                            padding: '6px 12px', borderRadius: '8px',
                            background: C.greenBg, border: `1px solid ${C.greenBorder}`,
                            fontSize: '11px', fontWeight: 700, color: C.green, whiteSpace: 'nowrap',
                          }}>
                            Áp dụng
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Section>

            {/* Note */}
            <Section icon={<span style={{ fontSize: '18px' }}>📝</span>}
              iconBg="#F0EBE3" title="Ghi Chú" C={C}>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú cho đơn hàng (tùy chọn)..."
                rows={3}
                style={{
                  ...inputStyle(C), resize: 'none',
                  fontFamily: C.sans, lineHeight: 1.6,
                }}
                onFocus={e => { e.target.style.borderColor = C.red; e.target.style.boxShadow = `0 0 0 3px ${C.redBg}`; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
            </Section>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div style={{
              background: C.surface, borderRadius: '20px',
              border: `1px solid ${C.border}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                padding: '20px 24px', borderBottom: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', gap: '12px',
                background: C.redBg,
              }}>
                <ShoppingBag style={{ width: '20px', height: '20px', color: C.red }} />
                <h3 style={{
                  fontSize: '16px', fontWeight: 700, color: C.text, margin: 0,
                  fontFamily: C.serif,
                }}>
                  Đơn Hàng ({totalQty} sản phẩm)
                </h3>
              </div>

              {/* Product list */}
              <div style={{ padding: '16px 24px', maxHeight: '320px', overflowY: 'auto' }}>
                {items.map((item, i) => (
                  <div key={item.id} style={{
                    display: 'flex', gap: '14px', alignItems: 'center', padding: '12px 0',
                    borderBottom: i < items.length - 1 ? `1px solid ${C.borderLight}` : 'none',
                  }}>
                    <img
                      src={item.image || '/images/placeholder.jpg'}
                      alt={item.name}
                      style={{
                        width: '56px', height: '56px', borderRadius: '12px',
                        objectFit: 'cover', flexShrink: 0, border: `1px solid ${C.border}`,
                      }}
                      onError={(e) => {
                        e.target.src = `https://placehold.co/100x100/3D1A0A/C8102E?text=${encodeURIComponent(item.name)}`;
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{
                        fontSize: '13px', fontWeight: 600, color: C.text,
                        margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {item.name}
                      </h4>
                      <p style={{ fontSize: '12px', color: C.textLight, margin: 0 }}>
                        {formatPrice(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: C.red, flexShrink: 0 }}>
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div style={{
                padding: '20px 24px', borderTop: `1px solid ${C.border}`,
                background: C.bg,
              }}>
                <Row label="Tạm tính" value={formatPrice(totalPrice)} C={C} />
                <Row
                  label="Phí vận chuyển"
                  value={shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                  valueColor={shippingFee === 0 ? C.green : '#DC2626'}
                  C={C}
                />
                {appliedPromo && (
                  <Row
                    label={`Giảm giá (${appliedPromo.discount}%)`}
                    value={`-${formatPrice(discountAmount)}`}
                    valueColor={C.green} C={C}
                  />
                )}

                <div style={{
                  height: '1px', background: C.border, margin: '16px 0',
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: C.text }}>Tổng cộng</span>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: C.red, fontFamily: C.serif }}>
                    {formatPrice(grandTotal)}
                  </span>
                </div>

                {/* Trust badges */}
                <div style={{ display: 'flex', gap: '20px', margin: '16px 0', justifyContent: 'center' }}>
                  {[
                    { icon: <Truck style={{ width: '13px', height: '13px' }} />, text: 'Giao nhanh' },
                    { icon: <Shield style={{ width: '13px', height: '13px' }} />, text: 'An toàn' },
                  ].map((b, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      fontSize: '11px', color: C.textFaint,
                    }}>
                      {b.icon} {b.text}
                    </div>
                  ))}
                </div>

                {error && (
                  <div style={{
                    padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
                    background: 'rgba(200,16,46,0.06)', border: `1px solid rgba(200,16,46,0.18)`,
                    color: C.red, fontSize: '13px',
                  }}>
                    ⚠️ {error}
                  </div>
                )}

                <button
                  onClick={handleConfirmOrder}
                  disabled={submitting}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '14px',
                    background: submitting ? C.border : C.red,
                    color: submitting ? C.textFaint : '#fff',
                    fontSize: '15px', fontWeight: 700, border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    letterSpacing: '0.02em', transition: 'all 0.2s',
                    boxShadow: submitting ? 'none' : '0 4px 20px rgba(200,16,46,0.25)',
                  }}
                  onMouseEnter={e => { if (!submitting) { e.currentTarget.style.background = C.redDark; } }}
                  onMouseLeave={e => { if (!submitting) { e.currentTarget.style.background = C.red; } }}
                >
                  {submitting ? (
                    <>
                      <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Xác Nhận Đặt Hàng
                      <CheckCircle style={{ width: '18px', height: '18px' }} />
                    </>
                  )}
                </button>

                <Link to="/cart" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  marginTop: '12px', padding: '10px',
                  color: C.textLight, fontSize: '13px', fontWeight: 500,
                  textDecoration: 'none', transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = C.red}
                  onMouseLeave={e => e.currentTarget.style.color = C.textLight}
                >
                  <ArrowLeft style={{ width: '14px', height: '14px' }} />
                  Quay lại giỏ hàng
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @media (max-width: 768px) {
          div[style*="1fr 380px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Helper components ── */
function Section({ icon, iconBg, title, children, C }) {
  return (
    <div style={{
      background: '#FFFFFF', borderRadius: '20px',
      border: `1px solid ${C.border}`,
      boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '18px 24px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '11px',
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <h3 style={{
          fontSize: '16px', fontWeight: 700, color: C.text, margin: 0,
          fontFamily: C.serif,
        }}>
          {title}
        </h3>
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </div>
  );
}

function Row({ label, value, valueColor, C }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
      <span style={{ fontSize: '14px', color: C.textLight }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 600, color: valueColor || C.text }}>{value}</span>
    </div>
  );
}

function inputStyle(C) {
  return {
    width: '100%', padding: '13px 16px', borderRadius: '12px',
    border: `1.5px solid ${C.border}`,
    background: C.bg,
    fontSize: '14px', color: C.text, outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
}
