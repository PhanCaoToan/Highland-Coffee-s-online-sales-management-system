import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Coffee, ShoppingCart, User, LogOut, Menu, X, LayoutDashboard, Package, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navTo = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/', label: 'Trang Chủ' },
    { to: '/menu', label: 'Menu' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: '#C8171D',
        borderBottom: '1px solid rgba(0,0,0,0.18)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              <Coffee style={{ width: '20px', height: '20px', color: '#fff' }} />
            </div>
            <div style={{ lineHeight: 1 }}>
              <div style={{
                fontWeight: 800,
                fontSize: '15px',
                letterSpacing: '0.14em',
                color: '#fff',
                fontFamily: 'var(--font-serif, Georgia, serif)',
              }}>
                HIGHLANDS
              </div>
              <div style={{
                fontSize: '9px',
                letterSpacing: '0.3em',
                color: 'rgba(255,255,255,0.75)',
                fontWeight: 600,
                marginTop: '3px',
              }}>
                COFFEE
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} className="hidden-mobile">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: isActive(link.to) ? 600 : 500,
                  letterSpacing: '0.02em',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  color: '#fff',
                  background: isActive(link.to) ? 'rgba(0,0,0,0.2)' : 'transparent',
                  borderBottom: isActive(link.to) ? '2px solid rgba(255,255,255,0.8)' : '2px solid transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* Cart Button */}
            <button
              onClick={() => navTo('/cart')}
              style={{
                position: 'relative',
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: '#fff',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.28)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.15)'; }}
            >
              <ShoppingCart style={{ width: '18px', height: '18px' }} />
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '9px',
                  background: '#fff',
                  color: '#C8171D',
                  fontSize: '10px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}>
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Section */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 10px 6px 6px',
                    borderRadius: '10px',
                    background: userMenuOpen ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.15)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#fff',
                    flexShrink: 0,
                  }}>
                    {user.fullName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#fff',
                    maxWidth: '90px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }} className="hidden-sm">
                    {user.fullName}
                  </span>
                  <ChevronDown style={{
                    width: '14px',
                    height: '14px',
                    color: 'rgba(255,255,255,0.6)',
                    transition: 'transform 0.2s',
                    transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }} />
                </button>

                {userMenuOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setUserMenuOpen(false)} />
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 10px)',
                      width: '230px',
                      borderRadius: '16px',
                      background: '#1a1a1a',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                      overflow: 'hidden',
                      zIndex: 50,
                      animation: 'fadeSlideDown 0.18s ease',
                    }}>
                      <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: '#C8171D',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '15px',
                            fontWeight: 800,
                            color: '#fff',
                            flexShrink: 0,
                          }}>
                            {user.fullName?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontWeight: 600, fontSize: '13px', color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {user.fullName}
                            </p>
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <span style={{
                          display: 'inline-block',
                          marginTop: '10px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(200,23,29,0.2)',
                          color: '#ff6b6e',
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          border: '1px solid rgba(200,23,29,0.35)',
                        }}>
                          {user.role}
                        </span>
                      </div>

                      <div style={{ padding: '8px' }}>
                        {(user.role === 'admin' || user.role === 'staff') && (
                          <Link
                            to="/admin"
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                          >
                            <LayoutDashboard style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                            Admin Dashboard
                          </Link>
                        )}
                        <Link
                          to="/orders"
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                        >
                          <Package style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                          Đơn Hàng
                        </Link>
                        <Link
                          to="/profile"
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                        >
                          <User style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                          Thông Tin Tài Khoản
                        </Link>

                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />

                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', color: 'rgba(239,68,68,0.7)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.color = 'rgb(239,68,68)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(239,68,68,0.7)'; }}
                        >
                          <LogOut style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                          Đăng Xuất
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                style={{
                  display: 'none',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  background: '#fff',
                  color: '#C8171D',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s',
                }}
                className="login-btn"
                onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'none'; }}
              >
                <User style={{ width: '14px', height: '14px' }} />
                Đăng Nhập
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-toggle"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff',
              }}
            >
              {mobileOpen ? <X style={{ width: '18px', height: '18px' }} /> : <Menu style={{ width: '18px', height: '18px' }} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div style={{
          background: '#a81217',
          borderTop: '1px solid rgba(0,0,0,0.15)',
          animation: 'fadeSlideDown 0.2s ease',
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px 24px 16px' }}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: isActive(link.to) ? 600 : 500,
                  color: '#fff',
                  background: isActive(link.to) ? 'rgba(0,0,0,0.2)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  marginBottom: '2px',
                }}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link
                to="/login"
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.85)',
                  textDecoration: 'none',
                  marginBottom: '2px',
                }}
              >
                Đăng Nhập
              </Link>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 768px) {
          .hidden-mobile { display: flex !important; }
          .mobile-toggle { display: none !important; }
          .login-btn { display: flex !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
        @media (min-width: 1024px) {
          .hidden-sm { display: block !important; }
        }
        @media (max-width: 1023px) {
          .hidden-sm { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
