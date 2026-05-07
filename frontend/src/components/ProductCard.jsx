import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Plus, Eye } from 'lucide-react';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // Beautiful gradient backgrounds based on category
  const gradients = {
    'DM001': 'from-amber-900/40 to-amber-950/60',   // Cà phê
    'DM002': 'from-emerald-900/40 to-emerald-950/60', // Trà
    'DM003': 'from-sky-900/40 to-sky-950/60',         // Freeze
    'DM004': 'from-orange-900/40 to-orange-950/60',   // Bánh
  };

  const emojis = {
    'DM001': '☕', 'DM002': '🍵', 'DM003': '🧊', 'DM004': '🥐',
  };

  const gradient = gradients[product.categoryId] || 'from-primary-900/40 to-dark-surface';
  const emoji = emojis[product.categoryId] || '☕';

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative rounded-2xl bg-dark-surface border border-dark-border overflow-hidden card-hover">
        {/* Image / Placeholder */}
        <div className={`relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
          {product.image && !imgError ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="text-center">
              <span className="text-6xl block mb-1 group-hover:scale-125 transition-transform duration-300">{emoji}</span>
              <span className="text-white/20 text-xs font-medium tracking-wider uppercase">{product.categoryName}</span>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <span className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </span>
            </div>
          </div>

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-lg bg-dark/60 backdrop-blur-md text-[10px] font-semibold text-white/70 uppercase tracking-wider">
              {product.categoryName}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-sm group-hover:text-gold transition-colors mb-1 line-clamp-1">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-3">
            <span className="text-gold font-bold text-lg">{formatPrice(product.price)}</span>
            <button
              onClick={handleAdd}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                added
                  ? 'bg-green-500/20 text-green-400 scale-110'
                  : 'bg-primary/10 text-primary-light hover:bg-primary hover:text-white hover:scale-110'
              }`}
            >
              {added ? '✓' : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
