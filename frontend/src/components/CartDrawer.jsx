import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleCheckout = () => {
    setIsOpen(false);
    if (!user) {
      navigate('/login');
    } else {
      navigate('/cart');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        className="absolute top-0 right-0 w-full max-w-md h-full flex flex-col animate-slideInRight"
        style={{
          background: '#FAFAF8',
          borderLeft: '1px solid #E8E0D5',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid #E8E0D5' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#C8102E1A' }}
            >
              <ShoppingBag className="w-5 h-5" style={{ color: '#C8102E' }} />
            </div>
            <div>
              <h3 className="font-bold text-lg" style={{ color: '#1A1A1A', fontFamily: 'Georgia, serif' }}>
                Giỏ Hàng
              </h3>
              <p className="text-xs" style={{ color: '#9A8F83' }}>{totalItems} sản phẩm</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: '#9A8F83' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F0EBE3'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 mb-4" style={{ color: '#D4C9BC' }} />
              <p className="text-lg font-medium mb-2" style={{ color: '#6B5F54', fontFamily: 'Georgia, serif' }}>
                Giỏ hàng trống
              </p>
              <p className="text-sm mb-6" style={{ color: '#B0A090' }}>
                Hãy thêm sản phẩm yêu thích của bạn
              </p>
              <button
                onClick={() => { setIsOpen(false); navigate('/menu'); }}
                className="px-6 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: '#C8102E', color: '#fff', border: 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = '#A50D25'}
                onMouseLeave={e => e.currentTarget.style.background = '#C8102E'}
              >
                Xem thực đơn
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-2xl animate-fadeIn"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #EDE6DC',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <img
                  src={item.image || '/images/placeholder.jpg'}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover"
                  style={{ border: '1px solid #EDE6DC' }}
                  onError={(e) => {
                    e.target.src = `https://placehold.co/200x200/3D1A0A/C8102E?text=${encodeURIComponent(item.name)}`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4
                    className="font-semibold text-sm line-clamp-1 mb-1"
                    style={{ color: '#1A1A1A', fontFamily: 'Georgia, serif' }}
                  >
                    {item.name}
                  </h4>
                  <p className="text-sm font-bold mb-3" style={{ color: '#C8102E' }}>
                    {formatPrice(item.price)}
                  </p>
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-1 rounded-xl overflow-hidden"
                      style={{ border: '1px solid #E8E0D5', background: '#F7F3EE' }}
                    >
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center transition-colors"
                        style={{ color: '#6B5F54' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#EDE6DC'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span
                        className="w-8 text-center text-sm font-bold"
                        style={{ color: '#1A1A1A' }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center transition-colors"
                        style={{ color: '#6B5F54' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#EDE6DC'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                      style={{ color: '#C4B5A5' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#FEE2E2';
                        e.currentTarget.style.color = '#C8102E';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#C4B5A5';
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 space-y-4" style={{ borderTop: '1px solid #E8E0D5', background: '#FAFAF8' }}>
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm" style={{ color: '#9A8F83' }}>Tổng cộng</span>
              <span className="font-bold text-xl" style={{ color: '#C8102E', fontFamily: 'Georgia, serif' }}>
                {formatPrice(totalPrice)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base transition-all"
              style={{ background: '#C8102E', color: '#FFFFFF', border: 'none', letterSpacing: '0.01em' }}
              onMouseEnter={e => e.currentTarget.style.background = '#A50D25'}
              onMouseLeave={e => e.currentTarget.style.background = '#C8102E'}
            >
              <ShoppingBag className="w-5 h-5" />
              Đặt hàng
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={clearCart}
              className="w-full text-center text-sm py-1 transition-colors"
              style={{ color: '#C4B5A5', background: 'none', border: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#C8102E'}
              onMouseLeave={e => e.currentTarget.style.color = '#C4B5A5'}
            >
              Xóa tất cả
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
