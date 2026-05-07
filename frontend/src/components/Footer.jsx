import { Link } from 'react-router-dom';
import { Coffee, MapPin, Phone, Mail, Clock, Heart, ChevronRight, Send } from 'lucide-react';

export default function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400&family=Outfit:wght@300;400;500;600&display=swap');

        .footer {
          font-family: 'Outfit', sans-serif;
          background: #1a0d06;
          position: relative;
          overflow: hidden;
        }

        /* ── decorative top border ── */
        .footer-top-line {
          height: 3px;
          background: linear-gradient(90deg, transparent, #c0392b 20%, #c8914a 50%, #c0392b 80%, transparent);
        }

        /* ── background ambiance ── */
        .footer-bg {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 55% 60% at 0% 100%, rgba(192,57,43,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 40% 50% at 100% 0%, rgba(200,145,74,0.09) 0%, transparent 55%);
        }
        .footer-grain {
          position: absolute; inset: 0; pointer-events: none; opacity: .3;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 160px;
        }

        /* ── main grid ── */
        .footer-main {
          position: relative; z-index: 1;
          max-width: 1280px; margin: 0 auto;
          padding: 72px 48px 56px;
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1.4fr;
          gap: 48px;
        }
        @media (max-width: 1024px) {
          .footer-main { grid-template-columns: 1fr 1fr; gap: 40px; padding: 56px 32px 48px; }
        }
        @media (max-width: 640px) {
          .footer-main { grid-template-columns: 1fr; gap: 36px; padding: 48px 24px 40px; }
        }

        /* ── brand column ── */
        .footer-logo {
          display: flex; align-items: center; gap: 12px;
          text-decoration: none; margin-bottom: 20px;
        }
        .footer-logo-icon {
          width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0;
          background: linear-gradient(135deg, #c0392b 0%, #7b1d10 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 20px rgba(192,57,43,0.4);
        }
        .footer-logo-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.15rem; font-weight: 700;
          color: #fff; letter-spacing: .06em; line-height: 1;
        }
        .footer-logo-sub {
          font-size: 9px; font-weight: 500; letter-spacing: .3em;
          color: #c8914a; margin-top: 3px; display: block;
        }

        .footer-tagline {
          font-size: .83rem; font-weight: 300; line-height: 1.7;
          color: rgba(255,255,255,0.38); margin: 0 0 24px; max-width: 260px;
        }

        .footer-emojis { display: flex; gap: 8px; flex-wrap: wrap; }
        .footer-emoji-chip {
          width: 38px; height: 38px; border-radius: 11px; font-size: 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          transition: transform .2s, border-color .2s, background .2s;
          cursor: default;
        }
        .footer-emoji-chip:hover {
          transform: translateY(-3px) scale(1.1);
          border-color: rgba(200,145,74,0.3);
          background: rgba(200,145,74,0.08);
        }

        /* ── column headings ── */
        .footer-col-title {
          font-size: 10px; font-weight: 600;
          letter-spacing: .2em; text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin: 0 0 20px;
          display: flex; align-items: center; gap: 10px;
        }
        .footer-col-title::after {
          content: ''; flex: 1; height: 1px;
          background: linear-gradient(to right, rgba(200,145,74,0.25), transparent);
        }

        /* ── nav links ── */
        .footer-nav { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .footer-nav-link {
          display: flex; align-items: center; gap: 0;
          text-decoration: none;
          font-size: .85rem; font-weight: 400;
          color: rgba(255,255,255,0.38);
          transition: color .2s, gap .2s;
        }
        .footer-nav-link:hover { color: #c8914a; gap: 6px; }
        .footer-nav-link:hover .fnl-arrow { opacity: 1; transform: translateX(0); }
        .fnl-arrow {
          opacity: 0; transform: translateX(-6px);
          transition: opacity .2s, transform .2s;
          color: #c0392b;
        }

        /* ── contact items ── */
        .footer-contacts { display: flex; flex-direction: column; gap: 14px; }
        .footer-contact-item { display: flex; align-items: flex-start; gap: 12px; }
        .footer-contact-icon {
          width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
          background: rgba(192,57,43,0.12);
          border: 1px solid rgba(192,57,43,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #e05c4a;
        }
        .footer-contact-text {
          font-size: .82rem; color: rgba(255,255,255,0.4);
          line-height: 1.55; padding-top: 5px;
        }

        /* ── newsletter ── */
        .footer-nl-desc {
          font-size: .82rem; color: rgba(255,255,255,0.38);
          line-height: 1.6; margin: 0 0 16px; font-weight: 300;
        }
        .footer-nl-form { display: flex; flex-direction: column; gap: 10px; }
        .footer-nl-input {
          width: 100%; padding: 13px 16px;
          border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: #fff; font-family: 'Outfit', sans-serif; font-size: .85rem;
          outline: none; transition: border-color .25s, background .25s, box-shadow .25s;
          box-sizing: border-box;
        }
        .footer-nl-input::placeholder { color: rgba(255,255,255,0.22); }
        .footer-nl-input:focus {
          border-color: rgba(192,57,43,0.45);
          background: rgba(192,57,43,0.06);
          box-shadow: 0 0 0 3px rgba(192,57,43,0.1);
        }
        .footer-nl-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 13px 20px; border-radius: 12px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #c0392b 0%, #96281b 100%);
          color: #fff; font-family: 'Outfit', sans-serif;
          font-size: .85rem; font-weight: 600;
          box-shadow: 0 6px 18px rgba(192,57,43,0.35);
          transition: transform .2s, box-shadow .2s;
        }
        .footer-nl-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(192,57,43,0.45); }

        /* ── divider ── */
        .footer-divider {
          position: relative; z-index: 1;
          height: 1px; margin: 0 48px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.07) 20%, rgba(255,255,255,0.07) 80%, transparent);
        }
        @media (max-width: 640px) { .footer-divider { margin: 0 24px; } }

        /* ── bottom bar ── */
        .footer-bottom {
          position: relative; z-index: 1;
          max-width: 1280px; margin: 0 auto;
          padding: 20px 48px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          flex-wrap: wrap;
        }
        @media (max-width: 640px) { .footer-bottom { padding: 20px 24px; flex-direction: column; text-align: center; } }
        .footer-copy { font-size: .78rem; color: rgba(255,255,255,0.2); }
        .footer-heart {
          font-size: .78rem; color: rgba(255,255,255,0.2);
          display: flex; align-items: center; gap: 5px;
        }
        .footer-heart-icon { color: #c0392b; animation: hbeat 1.4s ease-in-out infinite; }
        @keyframes hbeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.25)} }
      `}</style>

      <footer className="footer">
        <div className="footer-top-line" />
        <div className="footer-bg" />
        <div className="footer-grain" />

        {/* ── Main Grid ── */}
        <div className="footer-main">

          {/* Brand */}
          <div>
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon">
                <Coffee size={20} color="#fff" />
              </div>
              <div>
                <div className="footer-logo-name">HIGHLANDS</div>
                <span className="footer-logo-sub">COFFEE</span>
              </div>
            </Link>
            <p className="footer-tagline">
              Hương vị cao nguyên đích thực. Được chọn lọc từ những hạt cà phê tốt nhất Việt Nam.
            </p>
            <div className="footer-emojis">
              {['☕', '🍵', '🧊', '🥐'].map((e, i) => (
                <span key={i} className="footer-emoji-chip">{e}</span>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <div className="footer-col-title">Khám Phá</div>
            <ul className="footer-nav">
              {[
                { to: '/', label: 'Trang Chủ' },
                { to: '/menu', label: 'Thực Đơn' },
                { to: '/menu?category=DM001', label: 'Cà Phê' },
                { to: '/menu?category=DM002', label: 'Trà' },
                { to: '/menu?category=DM003', label: 'Freeze' },
                { to: '/menu?category=DM004', label: 'Bánh & Snack' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-nav-link">
                    <ChevronRight size={13} className="fnl-arrow" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="footer-col-title">Liên Hệ</div>
            <div className="footer-contacts">
              {[
                { Icon: MapPin, text: '72 Trần Phú, Q. Ba Đình, Hà Nội' },
                { Icon: Phone, text: '1900 1755' },
                { Icon: Mail, text: 'info@highlandscoffee.com.vn' },
                { Icon: Clock, text: '07:00 – 22:00, Hàng ngày' },
              ].map(({ Icon, text }, i) => (
                <div key={i} className="footer-contact-item">
                  <div className="footer-contact-icon"><Icon size={14} /></div>
                  <div className="footer-contact-text">{text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <div className="footer-col-title">Nhận Tin Ưu Đãi</div>
            <p className="footer-nl-desc">
              Đăng ký để nhận khuyến mãi độc quyền và thông tin sản phẩm mới mỗi tuần.
            </p>
            <div className="footer-nl-form">
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                className="footer-nl-input"
              />
              <button className="footer-nl-btn">
                <Send size={14} /> Đăng Ký Ngay
              </button>
            </div>
          </div>

        </div>

        {/* ── Divider ── */}
        <div className="footer-divider" />

        {/* ── Bottom Bar ── */}
        <div className="footer-bottom">
          <p className="footer-copy">© 2024 Highlands Coffee Vietnam. All rights reserved.</p>
          <p className="footer-heart">
            Made with <Heart size={12} className="footer-heart-icon" fill="#c0392b" /> by Highlands Team
          </p>
        </div>
      </footer>
    </>
  );
}
