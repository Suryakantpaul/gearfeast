import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000');

/* ─── Constants ──────────────────────────────────── */
const STATUS_META = {
  PENDING:          { label: 'Pending',          color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  dot: '#f59e0b' },
  ACCEPTED:         { label: 'Accepted',          color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', dot: '#3b82f6' },
  ORDER_PREPARING:  { label: 'Preparing',         color: '#a78bfa', bg: 'rgba(167,139,250,0.12)',dot: '#a78bfa' },
  COURIER_ASSIGNED: { label: 'Courier Assigned',  color: '#34d399', bg: 'rgba(52,211,153,0.12)', dot: '#34d399' },
  IN_TRANSIT:       { label: 'On the Way',        color: '#fb923c', bg: 'rgba(251,146,60,0.12)', dot: '#fb923c' },
  DELIVERED:        { label: 'Delivered',         color: '#4ade80', bg: 'rgba(74,222,128,0.12)', dot: '#4ade80' },
  CANCELLED:        { label: 'Cancelled',         color: '#f87171', bg: 'rgba(248,113,113,0.12)',dot: '#f87171' },
};

const NEXT_STATUS = {
  PENDING:          'ACCEPTED',
  ACCEPTED:         'ORDER_PREPARING',
  ORDER_PREPARING:  'COURIER_ASSIGNED',
  COURIER_ASSIGNED: 'IN_TRANSIT',
  IN_TRANSIT:       'DELIVERED',
};

const STATUS_ACTIONS = {
  PENDING:          { label: 'Accept Order',      icon: '✅' },
  ACCEPTED:         { label: 'Start Preparing',   icon: '👨‍🍳' },
  ORDER_PREPARING:  { label: 'Assign Courier',    icon: '🚴' },
  COURIER_ASSIGNED: { label: 'Out for Delivery',  icon: '🛵' },
  IN_TRANSIT:       { label: 'Mark Delivered',    icon: '🎉' },
};

const TABS = ['ALL', 'PENDING', 'ACCEPTED', 'ORDER_PREPARING', 'IN_TRANSIT', 'DELIVERED'];

const TAB_LABELS = {
  ALL: 'All',
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  ORDER_PREPARING: 'Preparing',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
};

/* ─── Helpers ────────────────────────────────────── */
const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' });

const initials = (name = '') =>
  name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

/* ─── Sub-components ─────────────────────────────── */
const StatCard = ({ label, value, accent, icon }) => (
  <div style={{ ...s.statCard, '--accent': accent }}>
    <div style={{ ...s.statIconBox, background: `${accent}18` }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
    </div>
    <div>
      <p style={{ ...s.statVal, color: accent }}>{value}</p>
      <p style={s.statLbl}>{label}</p>
    </div>
    <div style={{ ...s.statAccentBar, background: accent }} />
  </div>
);

const OrderCard = ({ order, updatingId, onUpdate }) => {
  const meta     = STATUS_META[order.status] || STATUS_META.PENDING;
  const next     = NEXT_STATUS[order.status];
  const action   = STATUS_ACTIONS[order.status];
  const isUpdating = updatingId === order._id;

  return (
    <div style={s.orderCard}>
      {/* Card top strip */}
      <div style={{ ...s.cardStrip, background: meta.color }} />

      {/* Header */}
      <div style={s.cardHead}>
        <div>
          <span style={s.orderId}>#{order._id.slice(-6).toUpperCase()}</span>
          <span style={s.orderTime}>{fmtDate(order.createdAt)} · {fmtTime(order.createdAt)}</span>
        </div>
        <span style={{ ...s.badge, color: meta.color, background: meta.bg }}>
          <span style={{ ...s.badgeDot, background: meta.dot }} />
          {meta.label}
        </span>
      </div>

      {/* Customer */}
      <div style={s.customerRow}>
        <div style={{ ...s.avatar, background: `${meta.color}22`, color: meta.color }}>
          {initials(order.customer?.name)}
        </div>
        <div>
          <p style={s.custName}>{order.customer?.name || 'Customer'}</p>
          <p style={s.custEmail}>{order.customer?.email || '—'}</p>
        </div>
      </div>

      {/* Items */}
      <div style={s.itemsBox}>
        {order.items.map((item, i) => (
          <div key={i} style={s.itemRow}>
            <span style={s.itemQty}>{item.quantity}×</span>
            <span style={s.itemName}>{item.name}</span>
            <span style={s.itemPrice}>₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Address */}
      {order.deliveryAddress && (
        <div style={s.addrRow}>
          <span style={{ fontSize: 13 }}>📍</span>
          <span style={s.addrText}>
            {order.deliveryAddress.street}, {order.deliveryAddress.city}
          </span>
        </div>
      )}

      {/* Footer */}
      <div style={s.cardFoot}>
        <div style={s.totalBox}>
          <span style={s.totalLbl}>Total</span>
          <span style={s.totalAmt}>₹{order.totalAmount}</span>
        </div>

        {next && action ? (
          <button
            style={{ ...s.actionBtn, opacity: isUpdating ? 0.65 : 1 }}
            onClick={() => onUpdate(order._id, next)}
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating…' : `${action.icon} ${action.label}`}
          </button>
        ) : order.status === 'DELIVERED' ? (
          <div style={s.doneTag}>✅ Completed</div>
        ) : null}
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────── */
const MerchantDashboard = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
    socket.on('orderStatusUpdated', ({ orderId, status }) => {
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    });
    return () => { socket.off('orderStatusUpdated'); };
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get('/orders/myorders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered     = activeTab === 'ALL' ? orders : orders.filter(o => o.status === activeTab);
  const totalRevenue = orders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + o.totalAmount, 0);
  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const activeCount  = orders.filter(o => ['ACCEPTED','ORDER_PREPARING','COURIER_ASSIGNED','IN_TRANSIT'].includes(o.status)).length;

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { height: 4px; width: 4px; background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={s.navbar}>
        <div style={s.navLeft}>
          <div style={s.logoMark}>G</div>
          <span style={s.logoText}>GearFeast</span>
          <span style={s.portalTag}>Merchant</span>
        </div>

        <div style={s.navCenter}>
          <div style={s.liveDot} />
          <span style={s.liveText}>Live Dashboard</span>
        </div>

        <div style={s.navRight}>
          <div style={s.userChip}>
            <div style={s.userAvatar}>{initials(user?.name)}</div>
            <span style={s.userName}>{user?.name}</span>
          </div>
          <button
            style={s.logoutBtn}
            onClick={() => { logout(); navigate('/login'); }}
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* ── Body ── */}
      <div style={s.body}>

        {/* Stats */}
        <div style={s.statsGrid}>
          <StatCard label="Total Orders"   value={orders.length}   accent="#e63946" icon="📦" />
          <StatCard label="Pending"        value={pendingCount}    accent="#f59e0b" icon="⏳" />
          <StatCard label="Active"         value={activeCount}     accent="#3b82f6" icon="🔥" />
          <StatCard label="Revenue"        value={`₹${totalRevenue}`} accent="#4ade80" icon="💰" />
        </div>

        {/* Tabs */}
        <div style={s.tabsRow}>
          {TABS.map(tab => {
            const count  = tab === 'ALL' ? orders.length : orders.filter(o => o.status === tab).length;
            const active = tab === activeTab;
            const meta   = STATUS_META[tab];
            return (
              <button
                key={tab}
                style={{
                  ...s.tab,
                  ...(active ? {
                    background: tab === 'ALL' ? '#e63946' : meta?.color,
                    color: '#fff',
                    border: 'none',
                  } : {}),
                }}
                onClick={() => setActiveTab(tab)}
              >
                {TAB_LABELS[tab]}
                <span style={{
                  ...s.tabCount,
                  background: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.07)',
                  color: active ? '#fff' : '#666',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Orders grid */}
        {loading ? (
          <div style={s.centered}>
            <span style={{ fontSize: 48 }}>📦</span>
            <p style={{ color: '#555', marginTop: 12, fontFamily: "'DM Sans', sans-serif" }}>Loading orders…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.centered}>
            <span style={{ fontSize: 48 }}>🎉</span>
            <p style={{ color: '#555', marginTop: 12, fontFamily: "'DM Sans', sans-serif" }}>No orders here yet</p>
          </div>
        ) : (
          <div style={s.grid}>
            {filtered.map((order, i) => (
              <div key={order._id} style={{ animation: `fadeUp 0.35s ease ${i * 0.05}s both` }}>
                <OrderCard order={order} updatingId={updatingId} onUpdate={updateStatus} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Styles ──────────────────────────────────────── */
const s = {
  /* Page */
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    fontFamily: "'DM Sans', sans-serif",
    color: '#f0ede6',
  },

  /* Navbar */
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: 64,
    background: '#111',
    borderBottom: '0.5px solid rgba(255,255,255,0.07)',
    position: 'sticky',
    top: 0,
    zIndex: 200,
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 32, height: 32, borderRadius: 8,
    background: '#e63946',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: '#fff',
  },
  logoText: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800, fontSize: 17, color: '#f0ede6', letterSpacing: '-0.02em',
  },
  portalTag: {
    fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: '#e63946',
    background: 'rgba(230,57,70,0.1)',
    border: '0.5px solid rgba(230,57,70,0.25)',
    padding: '3px 9px', borderRadius: 20,
  },
  navCenter: { display: 'flex', alignItems: 'center', gap: 7 },
  liveDot: {
    width: 7, height: 7, borderRadius: '50%',
    background: '#4ade80',
    animation: 'pulse-dot 2s ease-in-out infinite',
  },
  liveText: { fontSize: 12, color: '#555', letterSpacing: '0.04em' },
  navRight: { display: 'flex', alignItems: 'center', gap: 14 },
  userChip: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(255,255,255,0.05)',
    border: '0.5px solid rgba(255,255,255,0.08)',
    padding: '5px 12px 5px 5px', borderRadius: 30,
  },
  userAvatar: {
    width: 28, height: 28, borderRadius: '50%',
    background: '#e63946', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, flexShrink: 0,
  },
  userName: { fontSize: 13, color: '#ccc', fontWeight: 500 },
  logoutBtn: {
    background: 'transparent',
    border: '0.5px solid rgba(255,255,255,0.12)',
    color: '#888', fontSize: 13, padding: '7px 14px',
    borderRadius: 8, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    transition: 'color 0.2s',
  },

  /* Body */
  body: { maxWidth: 1280, margin: '0 auto', padding: '28px 32px' },

  /* Stats */
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16, marginBottom: 24,
  },
  statCard: {
    background: '#151515',
    border: '0.5px solid rgba(255,255,255,0.07)',
    borderRadius: 16, padding: '18px 20px',
    display: 'flex', alignItems: 'center', gap: 14,
    position: 'relative', overflow: 'hidden',
  },
  statIconBox: {
    width: 44, height: 44, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  statVal: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 22, fontWeight: 800, margin: '0 0 2px', letterSpacing: '-0.02em',
  },
  statLbl: { fontSize: 12, color: '#555', fontWeight: 400 },
  statAccentBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 2, borderRadius: '0 0 16px 16px', opacity: 0.6,
  },

  /* Tabs */
  tabsRow: {
    display: 'flex', gap: 6, overflowX: 'auto',
    marginBottom: 24, paddingBottom: 2,
  },
  tab: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: 20, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13, fontWeight: 500, color: '#888',
    whiteSpace: 'nowrap', transition: 'all 0.2s',
  },
  tabCount: {
    fontSize: 11, fontWeight: 600,
    padding: '2px 7px', borderRadius: 10,
  },

  /* Grid */
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 18,
  },
  centered: {
    textAlign: 'center', padding: '80px 0',
  },

  /* Order Card */
  orderCard: {
    background: '#151515',
    border: '0.5px solid rgba(255,255,255,0.07)',
    borderRadius: 16, overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    transition: 'border-color 0.2s',
  },
  cardStrip: { height: 3, width: '100%' },
  cardHead: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '14px 16px 0',
  },
  orderId: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 15, fontWeight: 800, color: '#f0ede6',
    display: 'block', letterSpacing: '-0.01em',
  },
  orderTime: {
    fontSize: 11, color: '#555', display: 'block', marginTop: 2,
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '4px 10px', borderRadius: 20,
    fontSize: 11, fontWeight: 600,
  },
  badgeDot: {
    width: 5, height: 5, borderRadius: '50%',
    animation: 'pulse-dot 2s ease-in-out infinite',
  },

  /* Customer */
  customerRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 16px',
    borderBottom: '0.5px solid rgba(255,255,255,0.05)',
  },
  avatar: {
    width: 34, height: 34, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, flexShrink: 0,
  },
  custName: { fontSize: 13, fontWeight: 500, color: '#e0e0e0', marginBottom: 1 },
  custEmail: { fontSize: 11, color: '#555' },

  /* Items */
  itemsBox: { padding: '12px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.05)' },
  itemRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    marginBottom: 8,
  },
  itemQty: {
    background: 'rgba(255,255,255,0.08)', color: '#aaa',
    fontSize: 11, fontWeight: 600,
    padding: '2px 7px', borderRadius: 5,
    flexShrink: 0,
  },
  itemName: { flex: 1, fontSize: 13, color: '#aaa' },
  itemPrice: { fontSize: 13, fontWeight: 500, color: '#f0ede6' },

  /* Address */
  addrRow: {
    display: 'flex', gap: 6, alignItems: 'flex-start',
    padding: '8px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.05)',
  },
  addrText: { fontSize: 12, color: '#555', lineHeight: 1.5 },

  /* Footer */
  cardFoot: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px', gap: 10,
  },
  totalBox: { display: 'flex', flexDirection: 'column', gap: 1 },
  totalLbl: { fontSize: 10, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 },
  totalAmt: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 18, fontWeight: 800, color: '#e63946', letterSpacing: '-0.02em',
  },
  actionBtn: {
    flex: 1, padding: '10px 14px',
    background: '#e63946', color: '#fff',
    border: 'none', borderRadius: 10,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    transition: 'opacity 0.2s',
    letterSpacing: '0.01em',
  },
  doneTag: {
    flex: 1, padding: '10px 0',
    background: 'rgba(74,222,128,0.1)',
    border: '0.5px solid rgba(74,222,128,0.2)',
    color: '#4ade80', borderRadius: 10,
    fontSize: 12, fontWeight: 600, textAlign: 'center',
  },
};

export default MerchantDashboard;