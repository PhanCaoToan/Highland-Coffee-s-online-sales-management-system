import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error] = useState('');

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const shippingFee = totalPrice >= 200000 ? 0 : 30000;
  const grandTotal = totalPrice + shippingFee;
  const freeShipRemain = 200000 - totalPrice;

  const handleCheckout = () => {
    if (!user) { navigate('/login'); return; }
    if (items.length === 0) return;
    navigate('/checkout');
  };

  /* ── Main Cart ── */
  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '80px',
      background: 'radial-gradient(ellipse at top right, #f5e8e0 0%, #f0e8e0 30%, #ede8e3 60%, #e8e3de 100%)',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Breadcrumb */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '13px', color: '#b5a090', marginBottom: '28px',
        }}>
          <Link to="/" style={{ color: '#b5a090', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = '#9b2c2c'}
            onMouseLeave={e => e.currentTarget.style.color = '#b5a090'}
          >Trang chủ</Link>
          <span>/</span>
          <span style={{ color: '#5a4a40', fontWeight: 600 }}>Giỏ hàng</span>
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px',
        }}>
          <ShoppingBag style={{ width: '26px', height: '26px', color: '#1e1410' }} />
          <h1 style={{
            fontSize: '28px', fontWeight: 700, color: '#1e1410', margin: 0,
            fontFamily: "'Playfair Display', serif",
          }}>
            Giỏ Hàng
            {items.length > 0 && (
              <span style={{ fontWeight: 400, fontSize: '18px', color: '#9e8e82' }}>
                {' '}({totalQty} sản phẩm)
              </span>
            )}
          </h1>
        </div>

        {items.length === 0 ? (
          /* Empty state */
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '64px 32px',
            textAlign: 'center', border: '1px solid #ede4d8',
          }}>
            <ShoppingBag style={{ width: '56px', height: '56px', color: '#d4c4b0', margin: '0 auto 16px' }} />
            <h3 style={{
              fontSize: '20px', fontWeight: 700, color: '#1e1410', margin: '0 0 8px',
              fontFamily: "'Playfair Display', serif",
            }}>Giỏ hàng trống</h3>
            <p style={{ fontSize: '14px', color: '#b5a090', margin: '0 0 24px' }}>
              Hãy khám phá thực đơn và thêm sản phẩm yêu thích
            </p>
            <Link to="/menu" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '12px 28px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #a82020 0%, #8b1a1a 100%)',
              color: '#fff', fontSize: '14px', fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(139,26,26,0.25)',
            }}>
              Xem thực đơn <ArrowRight style={{ width: '16px', height: '16px' }} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '28px', alignItems: 'start' }}>

            {/* ── LEFT: Product list ── */}
            <div>
              {/* Items */}
              <div style={{
                background: '#fff', borderRadius: '16px', overflow: 'hidden',
                border: '1px solid #ede4d8',
              }}>
                {items.map((item, i) => (
                  <div key={item.id} style={{
                    display: 'flex', gap: '16px', padding: '20px 24px',
                    borderBottom: i < items.length - 1 ? '1px solid #f0e8e0' : 'none',
                    alignItems: 'center',
                  }}>
                    {/* Image */}
                    <img
                      src={item.image || '/images/placeholder.jpg'}
                      alt={item.name}
                      style={{
                        width: '88px', height: '88px', borderRadius: '12px',
                        objectFit: 'cover', flexShrink: 0,
                        border: '1px solid #f0e8e0',
                      }}
                      onError={(e) => {
                        e.target.src = `https://placehold.co/200x200/f5e8e0/9b2c2c?text=${encodeURIComponent(item.name)}`;
                      }}
                    />

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: '15px', fontWeight: 600, color: '#1e1410',
                        margin: '0 0 4px', lineHeight: 1.3,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {item.name}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#9b2c2c', fontWeight: 600, margin: '0 0 14px' }}>
                        {formatPrice(item.price)}
                      </p>

                      {/* Quantity controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: '1.5px solid #e2d9cc', background: '#fdf9f6',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#7a6a60', transition: 'all 0.15s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#9b2c2c'; e.currentTarget.style.color = '#9b2c2c'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2d9cc'; e.currentTarget.style.color = '#7a6a60'; }}
                        >
                          <Minus style={{ width: '14px', height: '14px' }} />
                        </button>
                        <span style={{
                          width: '40px', textAlign: 'center', fontSize: '15px',
                          fontWeight: 700, color: '#1e1410',
                        }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: '1.5px solid #e2d9cc', background: '#fdf9f6',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#7a6a60', transition: 'all 0.15s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#9b2c2c'; e.currentTarget.style.color = '#9b2c2c'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2d9cc'; e.currentTarget.style.color = '#7a6a60'; }}
                        >
                          <Plus style={{ width: '14px', height: '14px' }} />
                        </button>
                      </div>
                    </div>

                    {/* Right: subtotal + delete */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{
                        fontSize: '16px', fontWeight: 700, color: '#1e1410', margin: '0 0 8px',
                      }}>
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <button onClick={() => removeFromCart(item.id)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#c0392b', fontSize: '13px', fontWeight: 500,
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        transition: 'opacity 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        <Trash2 style={{ width: '13px', height: '13px' }} />
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue shopping */}
              <Link to="/menu" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                marginTop: '20px', padding: '10px 20px', borderRadius: '10px',
                border: '1.5px solid #d4c4b0', background: '#fff',
                color: '#5a4a40', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#9b2c2c'; e.currentTarget.style.color = '#9b2c2c'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#d4c4b0'; e.currentTarget.style.color = '#5a4a40'; }}
              >
                <ArrowLeft style={{ width: '14px', height: '14px' }} />
                Tiếp tục mua sắm
              </Link>
            </div>

            {/* ── RIGHT: Order summary ── */}
            <div style={{ position: 'sticky', top: '100px' }}>
              <div style={{
                background: '#fff', borderRadius: '16px',
                border: '1px solid #ede4d8', overflow: 'hidden',
              }}>
                {/* Header */}
                <div style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #f0e8e0',
                }}>
                  <h3 style={{
                    fontSize: '17px', fontWeight: 700, color: '#1e1410', margin: 0,
                    fontFamily: "'Playfair Display', serif",
                  }}>
                    Tóm Tắt Đơn Hàng
                  </h3>
                </div>

                <div style={{ padding: '20px 24px' }}>
                  {/* Rows */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '14px', color: '#7a6a60' }}>Tạm tính</span>
                    <span style={{ fontSize: '14px', color: '#1e1410', fontWeight: 500 }}>
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '14px', color: '#7a6a60' }}>Phí vận chuyển</span>
                    <span style={{
                      fontSize: '14px', fontWeight: 600,
                      color: shippingFee === 0 ? '#16a34a' : '#c0392b',
                    }}>
                      {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                    </span>
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', background: '#f0e8e0', margin: '0 0 16px' }} />

                  {/* Total */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e1410' }}>Tổng cộng</span>
                    <span style={{
                      fontSize: '20px', fontWeight: 700, color: '#9b2c2c',
                      fontFamily: "'Playfair Display', serif",
                    }}>
                      {formatPrice(grandTotal)}
                    </span>
                  </div>

                  {/* Free shipping note */}
                  {freeShipRemain > 0 && (
                    <div style={{
                      padding: '10px 14px', borderRadius: '10px',
                      background: '#fdf5f0', border: '1px solid #f5ddd3',
                      fontSize: '12px', color: '#9b2c2c', marginBottom: '16px',
                      lineHeight: 1.5,
                    }}>
                      Mua thêm <strong>{formatPrice(freeShipRemain)}</strong> để miễn phí vận chuyển!
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div style={{
                      padding: '10px 14px', borderRadius: '10px', marginBottom: '16px',
                      background: '#fff5f5', border: '1px solid #fcd5d5', color: '#c0392b',
                      fontSize: '13px',
                    }}>
                      ⚠️ {error}
                    </div>
                  )}

                  {/* Checkout button */}
                  <button
                    onClick={handleCheckout}
                    style={{
                      width: '100%', padding: '15px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #1e1410 0%, #2c1a0e 100%)',
                      color: '#fff', fontSize: '15px', fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      letterSpacing: '0.02em', transition: 'opacity 0.2s, transform 0.15s',
                      boxShadow: '0 4px 16px rgba(30,20,16,0.25)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.988)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    Tiến Hành Thanh Toán
                    <ArrowRight style={{ width: '18px', height: '18px' }} />
                  </button>

                  {/* Login reminder */}
                  {!user && (
                    <p style={{ textAlign: 'center', fontSize: '12px', color: '#b5a090', marginTop: '12px' }}>
                      Bạn cần{' '}
                      <Link to="/login" style={{ color: '#9b2c2c', fontWeight: 600, textDecoration: 'none' }}>
                        đăng nhập
                      </Link>{' '}
                      để đặt hàng
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 360px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
