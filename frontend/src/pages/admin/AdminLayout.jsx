import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, ArrowLeft, Coffee, Menu, X, Warehouse, FileText } from 'lucide-react';

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isManager = user?.role === 'admin';

  const allMenuItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true, adminOnly: true },
    { to: '/admin/products', icon: Package, label: 'Sản Phẩm' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Đơn Hàng' },
    { to: '/admin/warehouse', icon: Warehouse, label: 'Nhập Kho' },
    { to: '/admin/report', icon: FileText, label: 'Báo Cáo', adminOnly: true },
  ];

  const menuItems = allMenuItems.filter(item => !item.adminOnly || isManager);

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        .admin-wrap {
          min-height: 100vh;
          padding-top: 80px;
          display: flex;
          font-family: 'Outfit', sans-serif;
          background: #f5f0ea;
        }

        /* ── MOBILE TOGGLE ── */
        .admin-mob-toggle {
          display: none;
          position: fixed;
          bottom: 24px; right: 24px;
          z-index: 50;
          width: 52px; height: 52px;
          border-radius: 16px;
          border: none; cursor: pointer;
          background: linear-gradient(135deg, #c0392b, #96281b);
          color: #fff;
          align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(192,57,43,0.4);
          transition: transform .2s;
        }
        .admin-mob-toggle:hover { transform: scale(1.06); }
        @media (max-width: 1023px) { .admin-mob-toggle { display: flex; } }

        /* ── OVERLAY ── */
        .admin-overlay {
          display: none;
          position: fixed; inset: 0; z-index: 40;
          background: rgba(26,13,6,0.55);
          backdrop-filter: blur(4px);
        }
        @media (max-width: 1023px) { .admin-overlay { display: block; } }

        /* ── SIDEBAR ── */
        .admin-sidebar {
          position: fixed;
          top: 80px; left: 0; z-index: 40;
          width: 268px;
          height: calc(100vh - 80px);
          background: #1a0d06;
          display: flex; flex-direction: column;
          transition: transform .3s cubic-bezier(.4,0,.2,1);
          border-right: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
        }
        @media (min-width: 1024px) {
          .admin-sidebar { position: sticky; transform: translateX(0) !important; flex-shrink: 0; }
        }

        /* sidebar ambient */
        .admin-sidebar::before {
          content: '';
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 80% 40% at 50% 0%, rgba(192,57,43,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 0% 100%, rgba(200,145,74,0.1) 0%, transparent 55%);
        }

        /* ── SIDEBAR TOP ── */
        .sb-brand {
          position: relative; z-index: 1;
          padding: 20px 20px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; gap: 11px;
        }
        .sb-brand-icon {
          width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
          background: linear-gradient(135deg, #c0392b, #7b1d10);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(192,57,43,0.4);
        }
        .sb-brand-name { font-family: 'Cormorant Garamond', serif; font-size: .95rem; font-weight: 700; color: #fff; letter-spacing: .07em; }
        .sb-brand-sub { font-size: 8px; letter-spacing: .28em; color: #c8914a; margin-top: 1px; display: block; }

        /* ── USER INFO ── */
        .sb-user {
          position: relative; z-index: 1;
          margin: 16px 16px 8px;
          padding: 14px 16px;
          border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; gap: 12px;
        }
        .sb-avatar {
          width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
          background: linear-gradient(135deg, #c0392b, #c8914a);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: .95rem; color: #fff;
          box-shadow: 0 3px 10px rgba(192,57,43,0.3);
        }
        .sb-user-name { font-size: .85rem; font-weight: 600; color: #fff; line-height: 1.2; }
        .sb-user-role { font-size: 11px; color: #c8914a; margin-top: 2px; }

        /* ── NAV ── */
        .sb-nav {
          position: relative; z-index: 1;
          flex: 1;
          padding: 8px 12px;
          display: flex; flex-direction: column; gap: 4px;
        }
        .sb-nav-label {
          font-size: 10px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase;
          color: rgba(255,255,255,0.2); padding: 10px 8px 6px;
        }
        .sb-nav-link {
          display: flex; align-items: center; gap: 11px;
          padding: 11px 14px; border-radius: 12px;
          font-size: .875rem; font-weight: 500;
          text-decoration: none;
          color: rgba(255,255,255,0.42);
          transition: all .2s;
          position: relative; overflow: hidden;
        }
        .sb-nav-link:hover {
          color: rgba(255,255,255,0.85);
          background: rgba(255,255,255,0.05);
        }
        .sb-nav-link.active {
          color: #fff;
          background: rgba(192,57,43,0.18);
          border: 1px solid rgba(192,57,43,0.25);
        }
        .sb-nav-link.active::before {
          content: '';
          position: absolute; left: 0; top: 20%; bottom: 20%;
          width: 3px; border-radius: 0 3px 3px 0;
          background: #c0392b;
        }
        .sb-nav-icon { width: 18px; height: 18px; flex-shrink: 0; }
        .sb-nav-link.active .sb-nav-icon { color: #e05c4a; }

        /* ── SIDEBAR BOTTOM ── */
        .sb-bottom {
          position: relative; z-index: 1;
          padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .sb-back-link {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; border-radius: 12px;
          font-size: .82rem; font-weight: 500;
          color: rgba(255,255,255,0.28);
          text-decoration: none;
          transition: all .2s;
        }
        .sb-back-link:hover {
          color: rgba(255,255,255,0.7);
          background: rgba(255,255,255,0.05);
        }

        /* ── MAIN CONTENT ── */
        .admin-main {
          flex: 1;
          padding: 32px 36px;
          min-height: calc(100vh - 80px);
          background: #f5f0ea;
        }
        @media (max-width: 768px) { .admin-main { padding: 20px 18px; } }
        @media (min-width: 769px) and (max-width: 1023px) { .admin-main { padding: 28px 28px; } }
      `}</style>

      <div className="admin-wrap">

        {/* Mobile toggle — logic giữ nguyên */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="admin-mob-toggle"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Overlay — logic giữ nguyên */}
        {sidebarOpen && (
          <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside
          className="admin-sidebar"
          style={{ transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}
        >
          {/* Brand */}
          <div className="sb-brand">
            <div className="sb-brand-icon"><Coffee size={18} color="#fff" /></div>
            <div>
              <div className="sb-brand-name">HIGHLANDS</div>
              <span className="sb-brand-sub">ADMIN PANEL</span>
            </div>
          </div>

          {/* User info — logic giữ nguyên */}
          <div className="sb-user">
            <div className="sb-avatar">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="sb-user-name">{user?.fullName}</div>
              <div className="sb-user-role">
                {user?.role === 'admin' ? '👑 Admin' : '👤 Staff'}
              </div>
            </div>
          </div>

          {/* Nav — logic giữ nguyên */}
          <nav className="sb-nav">
            <div className="sb-nav-label">Quản Lý</div>
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`sb-nav-link${isActive(item) ? ' active' : ''}`}
              >
                <item.icon className="sb-nav-icon" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Back to site — logic giữ nguyên */}
          <div className="sb-bottom">
            <Link to="/" className="sb-back-link">
              <ArrowLeft size={16} />
              Quay lại trang chính
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
