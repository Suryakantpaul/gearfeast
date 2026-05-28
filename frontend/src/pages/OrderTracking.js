import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000');

const STATUS_STEPS = [
  { key: 'PENDING',          label: 'Order placed',     icon: '📋', lottie: '📋', desc: 'We received your order' },
  { key: 'ACCEPTED',         label: 'Accepted',         icon: '✅', lottie: '✅', desc: 'Restaurant confirmed your order' },
  { key: 'ORDER_PREPARING',  label: 'Preparing',        icon: '👨‍🍳', lottie: '👨‍🍳', desc: 'Your food is being prepared' },
  { key: 'COURIER_ASSIGNED', label: 'Rider assigned',   icon: '🚴', lottie: '🚴', desc: 'Delivery partner is on the way' },
  { key: 'IN_TRANSIT',       label: 'Out for delivery', icon: '🛵', lottie: '🛵', desc: 'Almost there!' },
  { key: 'DELIVERED',        label: 'Delivered',        icon: '🎉', lottie: '🎉', desc: 'Enjoy your meal!' },
];

const MOCK_COURIER = { name: 'Rahul S.', rating: '4.8', vehicle: 'Honda Activa', phone: '+91 9876543210', avatar: 'RS' };

/* ─── tiny hook: animated counter ─── */
function useCountUp(target, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return val;
}

/* ─── ETA countdown ─── */
function ETATimer({ delivered }) {
  const [secs, setSecs] = useState(27 * 60);
  useEffect(() => {
    if (delivered) return;
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [delivered]);
  if (delivered) return null;
  const m = Math.floor(secs / 60), s = secs % 60;
  return (
    <span style={st.etaTime}>
      {m}:{String(s).padStart(2, '0')}
    </span>
  );
}

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState(false);
  const prevStatus = useRef(null);

  useEffect(() => {
    fetchOrder();
    socket.emit('joinOrder', id);
    socket.on('orderStatusUpdated', ({ orderId, status }) => {
      if (orderId === id) {
        setOrder(prev => ({ ...prev, status }));
        if (status === 'DELIVERED') setConfetti(true);
      }
    });
    return () => { socket.off('orderStatusUpdated'); };
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await axiosInstance.get(`/orders/${id}`);
      setOrder(res.data);
      if (res.data.status === 'DELIVERED') setConfetti(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? STATUS_STEPS.findIndex(s => s.key === order.status) : 0;
  const currentStatus = STATUS_STEPS[currentStep] ?? STATUS_STEPS[0];
  const isDelivered = order?.status === 'DELIVERED';
  const showCourier = currentStep >= 3;
  const totalAnim = useCountUp(order?.totalAmount ?? 0);

  if (loading) return (
    <div style={st.loadingWrap}>
      <div style={st.loadingSpinner} />
      <p style={st.loadingText}>Getting your order status…</p>
    </div>
  );

  return (
    <div style={st.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Sora:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#f7f7f7;}
        @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.25);opacity:.7}}
        @keyframes ripple{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.4);opacity:0}}
        @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(200px) rotate(720deg);opacity:0}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .step-dot-active{animation:pulse 1.8s ease-in-out infinite;}
        .confetti-piece{position:absolute;width:8px;height:8px;border-radius:2px;animation:confettiFall 1.8s ease-in forwards;}
      `}</style>

      {/* Confetti burst */}
      {confetti && (
        <div style={st.confettiWrap}>
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="confetti-piece" style={{
              left: `${5 + i * 5.5}%`,
              backgroundColor: ['#FF6B35','#E23744','#4CAF50','#FFD700','#00B4D8','#FF69B4'][i % 6],
              animationDelay: `${(i * 0.07).toFixed(2)}s`,
              animationDuration: `${1.4 + (i % 4) * 0.3}s`,
            }} />
          ))}
        </div>
      )}

      {/* ─── Top bar ─── */}
      <div style={st.topbar}>
        <button style={st.backBtn} onClick={() => navigate('/')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <p style={st.topbarTitle}>Track Order</p>
          <p style={st.topbarSub}>#{id.slice(-6).toUpperCase()}</p>
        </div>
        <button style={st.helpBtn} onClick={() => navigate('/support')}>Help</button>
      </div>

      {/* Progress bar */}
      <div style={st.progressTrack}>
        <div style={{ ...st.progressFill, width: `${((currentStep) / (STATUS_STEPS.length - 1)) * 100}%` }} />
      </div>

      {/* ─── Hero status ─── */}
      <div style={{ ...st.hero, background: isDelivered ? 'linear-gradient(135deg,#1a7a4c,#27ae60)' : 'linear-gradient(135deg,#c0392b,#e23744)' }}>
        <div style={st.heroInner}>
          <div style={st.heroIcon}>
            <span style={{ fontSize: 30 }}>{currentStatus.icon}</span>
            {!isDelivered && (
              <div style={st.ripple1} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <p style={st.heroLabel}>Current status</p>
            <h1 style={st.heroTitle}>{currentStatus.label}</h1>
            <p style={st.heroDesc}>{currentStatus.desc}</p>
          </div>
          {!isDelivered && (
            <div style={st.etaBox}>
              <p style={st.etaLabel}>ETA</p>
              <ETATimer delivered={isDelivered} />
              <p style={st.etaMin}>mins</p>
            </div>
          )}
        </div>

        {/* Step pills */}
        <div style={st.pillRow}>
          {STATUS_STEPS.map((s, i) => (
            <div key={s.key} style={{
              ...st.pill,
              background: i <= currentStep ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.10)',
              border: i === currentStep ? '1.5px solid rgba(255,255,255,0.7)' : '1.5px solid transparent',
            }}>
              <span style={{ fontSize: 13 }}>{s.icon}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={st.body}>

        {/* ─── Courier card ─── */}
        {showCourier && (
          <div style={{ ...st.card, ...st.courierCard, animation: 'slideUp .4s ease' }}>
            <div style={st.courierLeft}>
              <div style={st.avatarRing}>
                <div style={st.avatar}>{MOCK_COURIER.avatar}</div>
              </div>
              <div>
                <p style={st.courierName}>{MOCK_COURIER.name}</p>
                <div style={st.starRow}>
                  {'★★★★★'.split('').map((_, i) => (
                    <span key={i} style={{ color: i < 4 ? '#f39c12' : '#ddd', fontSize: 11 }}>★</span>
                  ))}
                  <span style={st.ratingVal}>{MOCK_COURIER.rating}</span>
                </div>
                <p style={st.vehicleText}>{MOCK_COURIER.vehicle}</p>
              </div>
            </div>
            <div style={st.courierActions}>
              <a href={`tel:${MOCK_COURIER.phone}`} style={st.callBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.61 19 19.45 19.45 0 0 1 3 10.39 19.79 19.79 0 0 1 4.11 2.17 2 2 0 0 1 6.1 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L10.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 24 16.92z"/></svg>
                Call
              </a>
              <button style={st.msgBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Chat
              </button>
            </div>
          </div>
        )}

        {/* ─── Progress steps ─── */}
        <div style={st.card}>
          <p style={st.cardTitle}>Order Progress</p>
          {STATUS_STEPS.map((step, index) => {
            const isDone   = index < currentStep;
            const isActive = index === currentStep;
            const isLast   = index === STATUS_STEPS.length - 1;

            return (
              <div key={step.key} style={st.stepRow}>
                <div style={st.stepLhs}>
                  <div
                    className={isActive ? 'step-dot-active' : ''}
                    style={{
                      ...st.stepDot,
                      background: isDone ? '#27ae60' : isActive ? '#e23744' : '#f0f0f0',
                      border: isActive ? '2.5px solid #e23744' : isDone ? 'none' : '2px solid #ddd',
                      color: (isDone || isActive) ? '#fff' : '#bbb',
                      boxShadow: isActive ? '0 0 0 6px rgba(226,55,68,.15)' : 'none',
                    }}
                  >
                    {isDone
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <span style={{ fontSize: 14, lineHeight: 1 }}>{step.icon}</span>
                    }
                  </div>
                  {!isLast && (
                    <div style={{ ...st.connector, background: isDone ? 'linear-gradient(to bottom,#27ae60,#2ecc71)' : '#ececec' }} />
                  )}
                </div>

                <div style={st.stepRhs}>
                  <div style={st.stepTop}>
                    <p style={{
                      ...st.stepLabel,
                      color: isActive ? '#1a1a1a' : isDone ? '#444' : '#bbb',
                      fontWeight: isActive ? 700 : isDone ? 600 : 400,
                    }}>
                      {step.label}
                    </p>
                    {isDone && <span style={st.doneBadge}>Done</span>}
                    {isActive && <span style={st.activeBadge}>Now</span>}
                  </div>
                  {isActive && (
                    <p style={st.stepDesc}>{step.desc}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Order summary ─── */}
        {order && (
          <div style={st.card}>
            <p style={st.cardTitle}>Order Summary</p>
            {order.items.map((item, i) => (
              <div key={i} style={{
                ...st.itemRow,
                borderBottom: i < order.items.length - 1 ? '1px solid #f5f5f5' : 'none',
              }}>
                <div style={st.qtyBadge}>{item.quantity}</div>
                <span style={st.itemName}>{item.name}</span>
                <span style={st.itemPrice}>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div style={st.summaryDivider} />
            <div style={st.summaryRow}>
              <span style={st.summaryKey}>Item total</span>
              <span style={st.summaryVal}>₹{order.totalAmount}</span>
            </div>
            <div style={st.summaryRow}>
              <span style={st.summaryKey}>Delivery fee</span>
              <span style={{ ...st.summaryVal, color: '#27ae60', fontWeight: 700 }}>FREE</span>
            </div>
            <div style={st.summaryRow}>
              <span style={{ ...st.summaryKey, color: '#1a1a1a', fontWeight: 700, fontSize: 15 }}>Total paid</span>
              <span style={{ ...st.summaryVal, color: '#e23744', fontSize: 17, fontWeight: 800 }}>₹{totalAnim}</span>
            </div>
          </div>
        )}

        {/* ─── Delivery address ─── */}
        {order?.deliveryAddress && (
          <div style={st.card}>
            <div style={st.addrHeader}>
              <div style={st.addrIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e23744" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <p style={st.addrTitle}>Delivering to</p>
            </div>
            <p style={st.addrText}>
              {order.deliveryAddress.street}, {order.deliveryAddress.city},{' '}
              {order.deliveryAddress.state} — {order.deliveryAddress.pincode}
            </p>
          </div>
        )}

        {/* ─── Rate CTA ─── */}
        {isDelivered ? (
          <div style={st.reviewWrap}>
            <p style={st.reviewPrompt}>How was your experience?</p>
            <div style={st.stars}>
              {[1,2,3,4,5].map(n => (
                <button key={n} style={st.starBtn} onClick={() => navigate(`/review/${id}`)}>★</button>
              ))}
            </div>
            <button style={st.reviewBtn} onClick={() => navigate(`/review/${id}`)}>
              Write a review & earn 50 pts 🏆
            </button>
          </div>
        ) : (
          <div style={st.supportRow}>
            <button style={st.supportBtn} onClick={() => navigate('/support')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Issue with order?
            </button>
            <button style={st.cancelBtn} onClick={() => navigate('/')}>Cancel</button>
          </div>
        )}

        <div style={{ height: 28 }} />
      </div>
    </div>
  );
};

/* ─────────── Styles ─────────── */
const st = {
  root: {
    minHeight: '100vh',
    backgroundColor: '#f7f7f7',
    fontFamily: "'Nunito', sans-serif",
    maxWidth: 480,
    margin: '0 auto',
  },
  loadingWrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100vh', backgroundColor: '#fff', gap: 16,
  },
  loadingSpinner: {
    width: 38, height: 38, borderRadius: '50%',
    border: '3px solid #f0f0f0',
    borderTop: '3px solid #e23744',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: { color: '#999', fontSize: 14, fontFamily: "'Nunito',sans-serif" },

  confettiWrap: { position: 'fixed', top: 0, left: 0, right: 0, height: 0, zIndex: 999, overflow: 'visible', pointerEvents: 'none' },

  /* top bar */
  topbar: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 16px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #f5f5f5',
    position: 'sticky', top: 0, zIndex: 100,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: '50%',
    border: '1.5px solid #ebebeb',
    background: '#fff', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#333', flexShrink: 0,
  },
  topbarTitle: { fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 600, color: '#1a1a1a' },
  topbarSub:   { fontSize: 11, color: '#aaa', fontWeight: 600, letterSpacing: '0.06em' },
  helpBtn: {
    marginLeft: 'auto', fontSize: 13, fontWeight: 700,
    color: '#e23744', background: 'transparent',
    border: 'none', cursor: 'pointer', fontFamily: "'Nunito',sans-serif",
  },

  /* progress bar */
  progressTrack: { height: 3, backgroundColor: '#f0f0f0', position: 'relative', overflow: 'hidden' },
  progressFill:  {
    height: '100%', backgroundColor: '#e23744',
    transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
    borderRadius: '0 2px 2px 0',
    background: 'linear-gradient(90deg,#c0392b,#e23744)',
  },

  /* hero */
  hero: { padding: '22px 18px 16px', color: '#fff' },
  heroInner: { display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 },
  heroIcon: {
    position: 'relative',
    width: 62, height: 62, borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  ripple1: {
    position: 'absolute', inset: -4, borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.4)',
    animation: 'ripple 2s ease-out infinite',
  },
  heroLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 },
  heroTitle: { fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 4 },
  heroDesc:  { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 },
  etaBox: {
    flexShrink: 0,
    background: 'rgba(255,255,255,0.18)',
    backdropFilter: 'blur(4px)',
    borderRadius: 12, padding: '10px 14px',
    textAlign: 'center', minWidth: 68,
  },
  etaLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 },
  etaTime:  { display: 'block', fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, lineHeight: 1 },
  etaMin:   { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600 },

  pillRow: { display: 'flex', gap: 8 },
  pill: {
    width: 36, height: 36, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.3s',
  },

  /* body */
  body: { padding: '14px 14px 0' },

  /* cards */
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: '16px 16px',
    marginBottom: 12,
    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontFamily: "'Sora',sans-serif",
    fontSize: 13, fontWeight: 700,
    color: '#1a1a1a', marginBottom: 14,
    letterSpacing: '0.01em',
  },

  /* courier */
  courierCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  courierLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  avatarRing: {
    padding: 2, borderRadius: '50%',
    background: 'linear-gradient(135deg,#e23744,#ff6b35)',
  },
  avatar: {
    width: 44, height: 44, borderRadius: '50%',
    background: '#fff', border: '2px solid #fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 700, color: '#e23744',
  },
  courierName: { fontSize: 14, fontWeight: 800, color: '#1a1a1a', marginBottom: 2 },
  starRow:     { display: 'flex', alignItems: 'center', gap: 1, marginBottom: 2 },
  ratingVal:   { fontSize: 11, fontWeight: 700, color: '#888', marginLeft: 4 },
  vehicleText: { fontSize: 11, color: '#aaa', fontWeight: 600 },
  courierActions: { display: 'flex', flexDirection: 'column', gap: 8 },
  callBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 10,
    background: '#e23744', color: '#fff',
    fontSize: 12, fontWeight: 800, fontFamily: "'Nunito',sans-serif",
    textDecoration: 'none', border: 'none', cursor: 'pointer',
  },
  msgBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 12px', borderRadius: 10,
    border: '1.5px solid #e23744', color: '#e23744',
    background: '#fff', fontSize: 12, fontWeight: 800,
    fontFamily: "'Nunito',sans-serif", cursor: 'pointer',
  },

  /* steps */
  stepRow: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  stepLhs: { display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 },
  stepDot: {
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15, transition: 'all 0.35s', flexShrink: 0,
  },
  connector: { width: 2, height: 24, borderRadius: 2, margin: '3px 0', transition: 'background 0.4s' },
  stepRhs:   { paddingTop: 7, paddingBottom: 18, flex: 1 },
  stepTop:   { display: 'flex', alignItems: 'center', gap: 8 },
  stepLabel: { fontSize: 14, transition: 'all 0.3s' },
  stepDesc:  { fontSize: 12, color: '#e23744', marginTop: 3, fontWeight: 600 },
  doneBadge: {
    fontSize: 10, fontWeight: 800, color: '#27ae60',
    background: 'rgba(39,174,96,0.1)', padding: '2px 8px', borderRadius: 20, letterSpacing: '0.04em',
  },
  activeBadge: {
    fontSize: 10, fontWeight: 800, color: '#e23744',
    background: 'rgba(226,55,68,0.08)', padding: '2px 8px', borderRadius: 20, letterSpacing: '0.04em',
  },

  /* order summary */
  itemRow:   { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0' },
  qtyBadge:  {
    minWidth: 26, height: 26, borderRadius: 7,
    background: '#fff4f4', border: '1.5px solid #fcd4d6',
    color: '#e23744', fontSize: 12, fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  itemName:  { flex: 1, fontSize: 13, color: '#555', fontWeight: 600 },
  itemPrice: { fontSize: 13, fontWeight: 700, color: '#1a1a1a' },
  summaryDivider: { borderTop: '1.5px dashed #f0f0f0', margin: '10px 0' },
  summaryRow:     { display: 'flex', justifyContent: 'space-between', marginBottom: 7, alignItems: 'center' },
  summaryKey:     { fontSize: 13, color: '#999', fontWeight: 600 },
  summaryVal:     { fontSize: 13, fontWeight: 700, color: '#1a1a1a' },

  /* address */
  addrHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  addrIcon:   {
    width: 28, height: 28, borderRadius: 8,
    background: '#fff4f4', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  addrTitle: { fontSize: 13, fontWeight: 800, color: '#1a1a1a' },
  addrText:  { fontSize: 13, color: '#888', lineHeight: 1.65, fontWeight: 500 },

  /* review */
  reviewWrap: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: '20px 18px', marginBottom: 12,
    textAlign: 'center',
    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  },
  reviewPrompt: { fontSize: 16, fontWeight: 800, color: '#1a1a1a', marginBottom: 12, fontFamily: "'Sora',sans-serif" },
  stars: { display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 },
  starBtn: {
    fontSize: 34, color: '#FFB800',
    background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1,
    transition: 'transform 0.15s',
  },
  reviewBtn: {
    width: '100%', padding: '14px 0',
    background: 'linear-gradient(135deg,#c0392b,#e23744)',
    color: '#fff', border: 'none', borderRadius: 12,
    fontSize: 14, fontWeight: 800, cursor: 'pointer',
    fontFamily: "'Nunito',sans-serif", letterSpacing: '0.02em',
    boxShadow: '0 4px 14px rgba(226,55,68,0.35)',
  },

  /* support */
  supportRow: { display: 'flex', gap: 10, marginBottom: 12 },
  supportBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: 13, borderRadius: 12,
    border: '1.5px solid #ebebeb', background: '#fff',
    fontSize: 13, fontWeight: 700, color: '#555',
    fontFamily: "'Nunito',sans-serif", cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  cancelBtn: {
    flex: 1, padding: 13, borderRadius: 12,
    border: '1.5px solid #fcd4d6', background: '#fff4f4',
    fontSize: 13, fontWeight: 700, color: '#e23744',
    fontFamily: "'Nunito',sans-serif", cursor: 'pointer',
  },
};

export default OrderTracking;