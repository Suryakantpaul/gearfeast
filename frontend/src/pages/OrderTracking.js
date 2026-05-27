import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000');

const STATUS_STEPS = [
  { key: 'PENDING',          label: 'Order placed',     icon: '📋', desc: 'Your order has been placed' },
  { key: 'ACCEPTED',         label: 'Order accepted',   icon: '✅', desc: 'Restaurant accepted your order' },
  { key: 'ORDER_PREPARING',  label: 'Preparing',        icon: '👨‍🍳', desc: 'Chef is preparing your food' },
  { key: 'COURIER_ASSIGNED', label: 'Courier assigned', icon: '🚴', desc: 'Delivery partner assigned' },
  { key: 'IN_TRANSIT',       label: 'On the way',       icon: '🛵', desc: 'Your order is en route' },
  { key: 'DELIVERED',        label: 'Delivered',        icon: '🎉', desc: 'Enjoy your meal!' },
];

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    socket.emit('joinOrder', id);
    socket.on('orderStatusUpdated', ({ orderId, status }) => {
      if (orderId === id) setOrder(prev => ({ ...prev, status }));
    });
    return () => { socket.off('orderStatusUpdated'); };
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await axiosInstance.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? STATUS_STEPS.findIndex(s => s.key === order.status) : 0;
  const currentStatus = STATUS_STEPS[currentStep] ?? STATUS_STEPS[0];

  if (loading) return (
    <div style={s.loadingPage}>
      <span style={{ fontSize: 48 }}>🛵</span>
      <p style={{ color: '#888', marginTop: 12, fontFamily: "'DM Sans', sans-serif" }}>Loading your order...</p>
    </div>
  );

  return (
    <div style={s.page}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0e0e0e; }
      `}</style>

      {/* Navbar */}
      <div style={s.navbar}>
        <button style={s.backBtn} onClick={() => navigate('/')}>
          ← Home
        </button>
        <span style={s.navTitle}>Tracking</span>
        <span style={s.orderId}>#{id.slice(-6).toUpperCase()}</span>
      </div>

      {/* Status Hero */}
      <div style={s.hero}>
        <div style={s.iconRing}>{currentStatus.icon}</div>
        <div>
          <p style={s.heroLabel}>Current status</p>
          <h1 style={s.heroTitle}>{currentStatus.label}</h1>
          <p style={s.heroDesc}>{currentStatus.desc}</p>
          {order?.status !== 'DELIVERED' && (
            <div style={s.etaBox}>
              <span style={s.etaDot} />
              Est. 30–45 mins
            </div>
          )}
        </div>
      </div>

      <div style={s.body}>
        {/* Progress Steps */}
        <p style={s.sectionLabel}>Progress</p>
        <div style={s.stepsWrap}>
          {STATUS_STEPS.map((step, index) => {
            const isDone   = index < currentStep;
            const isActive = index === currentStep;
            const isLast   = index === STATUS_STEPS.length - 1;

            return (
              <div key={step.key} style={s.stepRow}>
                {/* Left rail */}
                <div style={s.stepLhs}>
                  <div style={{
                    ...s.dot,
                    ...(isDone   ? s.dotDone   : {}),
                    ...(isActive ? s.dotActive : {}),
                    ...((!isDone && !isActive) ? s.dotInactive : {}),
                  }}>
                    {isDone ? '✓' : step.icon}
                  </div>
                  {!isLast && (
                    <div style={{ ...s.connector, backgroundColor: isDone ? '#e63946' : 'rgba(255,255,255,0.08)' }} />
                  )}
                </div>

                {/* Right content */}
                <div style={s.stepRhs}>
                  <p style={{
                    ...s.stepLabel,
                    color: (isDone || isActive) ? '#f0ede6' : '#444',
                    fontWeight: isActive ? 600 : 400,
                  }}>
                    {step.label}
                  </p>
                  {isActive && <p style={s.stepSub}>{step.desc}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        {order && (
          <>
            <p style={s.sectionLabel}>Order summary</p>
            <div style={s.card}>
              {order.items.map((item, i) => (
                <div key={i} style={{
                  ...s.itemRow,
                  borderBottom: i < order.items.length - 1 ? '0.5px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  <span style={s.qty}>{item.quantity}×</span>
                  <span style={s.itemName}>{item.name}</span>
                  <span style={s.itemPrice}>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div style={s.divider} />
              <div style={s.totalRow}>
                <span>Delivery</span>
                <span style={{ color: '#4caf89', fontWeight: 500 }}>Free</span>
              </div>
              <div style={{ ...s.totalRow, ...s.grandTotal }}>
                <span>Total paid</span>
                <span style={{ color: '#ff6b35' }}>₹{order.totalAmount}</span>
              </div>
            </div>
          </>
        )}

        {/* Delivery Address */}
        {order?.deliveryAddress && (
          <>
            <p style={s.sectionLabel}>Delivery address</p>
            <div style={s.card}>
              <p style={s.addrMeta}>Dropping off at</p>
              <p style={s.addrText}>
                {order.deliveryAddress.street}, {order.deliveryAddress.city},{' '}
                {order.deliveryAddress.state} – {order.deliveryAddress.pincode}
              </p>
            </div>
          </>
        )}

        {/* Rate order */}
        {order?.status === 'DELIVERED' && (
          <button style={s.reviewBtn} onClick={() => navigate(`/review/${id}`)}>
            ⭐ Rate your order &amp; earn points
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Styles ──────────────────────────────────────────────── */
const s = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0e0e0e',
    color: '#f0ede6',
    fontFamily: "'DM Sans', sans-serif",
  },
  loadingPage: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100vh', backgroundColor: '#0e0e0e',
  },

  /* Navbar */
  navbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '0.5px solid rgba(255,255,255,0.08)',
    position: 'sticky', top: 0, zIndex: 100,
    backgroundColor: '#0e0e0e',
  },
  backBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '0.5px solid rgba(255,255,255,0.12)',
    color: '#f0ede6', fontSize: 13, fontFamily: "'DM Sans', sans-serif",
    padding: '8px 14px', borderRadius: 20, cursor: 'pointer',
  },
  navTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 17, color: '#f0ede6',
  },
  orderId: { fontSize: 12, color: '#666', letterSpacing: '0.08em', fontWeight: 500 },

  /* Hero */
  hero: {
    display: 'flex', gap: 16, alignItems: 'flex-start',
    padding: '28px 20px 22px',
    borderBottom: '0.5px solid rgba(255,255,255,0.06)',
  },
  iconRing: {
    width: 60, height: 60, borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff6b35, #e63946)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 26, flexShrink: 0,
    boxShadow: '0 0 0 8px rgba(230,57,70,0.12)',
  },
  heroLabel: {
    fontSize: 11, color: '#666', letterSpacing: '0.1em',
    textTransform: 'uppercase', fontWeight: 600, marginBottom: 4,
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28, color: '#f0ede6', lineHeight: 1.1, marginBottom: 6,
  },
  heroDesc: { fontSize: 13, color: '#888', marginBottom: 14 },
  etaBox: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'rgba(255,107,53,0.1)',
    border: '0.5px solid rgba(255,107,53,0.3)',
    padding: '7px 14px', borderRadius: 20,
    fontSize: 12, color: '#ff9966', fontWeight: 500,
  },
  etaDot: {
    width: 6, height: 6, borderRadius: '50%',
    backgroundColor: '#ff6b35', display: 'inline-block',
  },

  /* Body */
  body: { padding: '22px 20px' },
  sectionLabel: {
    fontSize: 10, letterSpacing: '0.12em', color: '#555',
    fontWeight: 600, textTransform: 'uppercase', marginBottom: 14,
  },

  /* Steps */
  stepsWrap: { marginBottom: 28 },
  stepRow: { display: 'flex', gap: 14, alignItems: 'flex-start' },
  stepLhs: { display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 },
  dot: {
    width: 34, height: 34, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15, transition: 'all 0.3s',
  },
  dotDone:    { background: '#e63946', color: '#fff', fontSize: 13, fontWeight: 700 },
  dotActive:  { background: 'transparent', border: '2px solid #e63946', color: '#f0ede6', boxShadow: '0 0 0 5px rgba(230,57,70,0.15)' },
  dotInactive:{ background: 'rgba(255,255,255,0.06)', color: '#333' },
  connector:  { width: 1, height: 28, margin: '3px 0', transition: 'background 0.3s' },
  stepRhs:    { paddingTop: 6, paddingBottom: 22, flex: 1 },
  stepLabel:  { fontSize: 14, transition: 'color 0.3s' },
  stepSub:    { fontSize: 12, color: '#ff9966', marginTop: 3 },

  /* Card */
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: 14, padding: '16px 18px', marginBottom: 20,
  },
  itemRow:   { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0' },
  qty: {
    background: 'rgba(255,255,255,0.08)', color: '#ccc',
    fontSize: 11, fontWeight: 600, padding: '3px 8px',
    borderRadius: 6, minWidth: 28, textAlign: 'center',
  },
  itemName:  { flex: 1, fontSize: 13, color: '#ccc' },
  itemPrice: { fontSize: 13, fontWeight: 500, color: '#f0ede6' },
  divider:   { borderTop: '0.5px dashed rgba(255,255,255,0.1)', margin: '12px 0' },
  totalRow:  { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', marginBottom: 8 },
  grandTotal:{ fontSize: 15, fontWeight: 600, color: '#f0ede6' },

  /* Address */
  addrMeta: { fontSize: 11, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 },
  addrText: { fontSize: 13, color: '#999', lineHeight: 1.7 },

  /* Review button */
  reviewBtn: {
    width: '100%', padding: 15,
    background: '#e63946', color: '#fff',
    border: 'none', borderRadius: 12,
    fontSize: 14, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer', letterSpacing: '0.02em',
    marginTop: 4,
  },
};

export default OrderTracking;