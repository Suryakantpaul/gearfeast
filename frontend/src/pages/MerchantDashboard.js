import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000');

const STATUS_COLORS = {
  PENDING: { bg: '#fff8e1', color: '#f59e0b', border: '#fcd34d' },
  ACCEPTED: { bg: '#eff6ff', color: '#3b82f6', border: '#93c5fd' },
  ORDER_PREPARING: { bg: '#f5f3ff', color: '#8b5cf6', border: '#c4b5fd' },
  COURIER_ASSIGNED: { bg: '#ecfdf5', color: '#10b981', border: '#6ee7b7' },
  IN_TRANSIT: { bg: '#fff7ed', color: '#f97316', border: '#fdba74' },
  DELIVERED: { bg: '#f0fdf4', color: '#22c55e', border: '#86efac' },
  CANCELLED: { bg: '#fef2f2', color: '#ef4444', border: '#fca5a5' }
};

const NEXT_STATUS = {
  PENDING: 'ACCEPTED',
  ACCEPTED: 'ORDER_PREPARING',
  ORDER_PREPARING: 'COURIER_ASSIGNED',
  COURIER_ASSIGNED: 'IN_TRANSIT',
  IN_TRANSIT: 'DELIVERED'
};

const STATUS_ACTIONS = {
  PENDING: { label: 'Accept Order', icon: '✅' },
  ACCEPTED: { label: 'Start Preparing', icon: '👨‍🍳' },
  ORDER_PREPARING: { label: 'Assign Courier', icon: '🚴' },
  COURIER_ASSIGNED: { label: 'Out for Delivery', icon: '🛵' },
  IN_TRANSIT: { label: 'Mark Delivered', icon: '🎉' }
};

const MerchantDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    } catch (err) { console.error(err); }
    setUpdatingId(null);
  };

  const TABS = ['ALL', 'PENDING', 'ACCEPTED', 'ORDER_PREPARING', 'IN_TRANSIT', 'DELIVERED'];

  const filteredOrders = activeTab === 'ALL'
    ? orders
    : orders.filter(o => o.status === activeTab);

  const totalRevenue = orders
    .filter(o => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const activeCount = orders.filter(o => ['ACCEPTED', 'ORDER_PREPARING', 'COURIER_ASSIGNED', 'IN_TRANSIT'].includes(o.status)).length;

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navLeft}>
          <span style={styles.logo}>⚙️ GearFeast</span>
          <span style={styles.merchantBadge}>Merchant Portal</span>
        </div>
        <div style={styles.navRight}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <span style={styles.userName}>{user?.name}</span>
          </div>
          <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📦</div>
            <div>
              <p style={styles.statNum}>{orders.length}</p>
              <p style={styles.statLabel}>Total Orders</p>
            </div>
          </div>
          <div style={{ ...styles.statCard, borderLeft: '4px solid #f59e0b' }}>
            <div style={{ ...styles.statIcon, backgroundColor: '#fff8e1' }}>⏳</div>
            <div>
              <p style={{ ...styles.statNum, color: '#f59e0b' }}>{pendingCount}</p>
              <p style={styles.statLabel}>Pending</p>
            </div>
          </div>
          <div style={{ ...styles.statCard, borderLeft: '4px solid #3b82f6' }}>
            <div style={{ ...styles.statIcon, backgroundColor: '#eff6ff' }}>🔥</div>
            <div>
              <p style={{ ...styles.statNum, color: '#3b82f6' }}>{activeCount}</p>
              <p style={styles.statLabel}>Active</p>
            </div>
          </div>
          <div style={{ ...styles.statCard, borderLeft: '4px solid #22c55e' }}>
            <div style={{ ...styles.statIcon, backgroundColor: '#f0fdf4' }}>💰</div>
            <div>
              <p style={{ ...styles.statNum, color: '#22c55e' }}>₹{totalRevenue}</p>
              <p style={styles.statLabel}>Revenue</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabsWrap}>
          {TABS.map(tab => (
            <button
              key={tab}
              style={{
                ...styles.tab,
                backgroundColor: activeTab === tab ? '#E24B4A' : '#fff',
                color: activeTab === tab ? '#fff' : '#666',
                border: activeTab === tab ? 'none' : '1px solid #eee'
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'ALL' ? 'All Orders' : tab.replace(/_/g, ' ')}
              {tab !== 'ALL' && (
                <span style={{
                  ...styles.tabCount,
                  backgroundColor: activeTab === tab ? 'rgba(255,255,255,0.3)' : '#f0f0f0',
                  color: activeTab === tab ? '#fff' : '#999'
                }}>
                  {orders.filter(o => o.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <div style={styles.loadingBox}>
            <p style={{ fontSize: '48px' }}>📦</p>
            <p style={{ color: '#999' }}>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={{ fontSize: '48px' }}>🎉</p>
            <p style={styles.emptyText}>No orders in this category</p>
          </div>
        ) : (
          <div style={styles.ordersGrid}>
            {filteredOrders.map(order => {
              const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;
              const nextStatus = NEXT_STATUS[order.status];
              const action = STATUS_ACTIONS[order.status];

              return (
                <div key={order._id} style={styles.orderCard}>
                  {/* Card Header */}
                  <div style={styles.cardHeader}>
                    <div style={styles.cardHeaderLeft}>
                      <span style={styles.orderNum}>#{order._id.slice(-6).toUpperCase()}</span>
                      <span style={styles.orderTime}>
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{
                      ...styles.statusBadge,
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                      border: `1px solid ${statusStyle.border}`
                    }}>
                      {order.status.replace(/_/g, ' ')}
                    </div>
                  </div>

                  {/* Customer */}
                  <div style={styles.customerRow}>
                    <div style={styles.customerAvatar}>
                      {order.customer?.name?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div>
                      <p style={styles.customerName}>{order.customer?.name || 'Customer'}</p>
                      <p style={styles.customerEmail}>{order.customer?.email || ''}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={styles.itemsList}>
                    {order.items.map((item, i) => (
                      <div key={i} style={styles.itemRow}>
                        <span style={styles.itemQty}>{item.quantity}x</span>
                        <span style={styles.itemName}>{item.name}</span>
                        <span style={styles.itemPrice}>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div style={styles.totalRow}>
                    <span style={styles.totalLabel}>Total Amount</span>
                    <span style={styles.totalAmount}>₹{order.totalAmount}</span>
                  </div>

                  {/* Delivery Address */}
                  {order.deliveryAddress && (
                    <div style={styles.addressRow}>
                      <span style={styles.addressIcon}>📍</span>
                      <span style={styles.addressText}>
                        {order.deliveryAddress.street}, {order.deliveryAddress.city}
                      </span>
                    </div>
                  )}

                  {/* Action Button */}
                  {nextStatus && action && (
                    <button
                      style={{
                        ...styles.actionBtn,
                        opacity: updatingId === order._id ? 0.7 : 1
                      }}
                      onClick={() => updateStatus(order._id, nextStatus)}
                      disabled={updatingId === order._id}
                    >
                      {updatingId === order._id ? (
                        'Updating...'
                      ) : (
                        <>{action.icon} {action.label}</>
                      )}
                    </button>
                  )}

                  {order.status === 'DELIVERED' && (
                    <div style={styles.deliveredBadge}>
                      ✅ Order Completed
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8f8f8', fontFamily: "'Segoe UI', sans-serif" },
  navbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 32px', backgroundColor: '#fff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    position: 'sticky', top: 0, zIndex: 100
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  logo: { color: '#E24B4A', fontSize: '22px', fontWeight: '800' },
  merchantBadge: {
    backgroundColor: '#fff5f5', color: '#E24B4A',
    padding: '4px 12px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '700',
    border: '1px solid #ffd0d0'
  },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    backgroundColor: '#E24B4A', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '15px'
  },
  userName: { fontSize: '14px', fontWeight: '600', color: '#333' },
  logoutBtn: {
    padding: '7px 16px', backgroundColor: 'transparent',
    color: '#E24B4A', border: '1.5px solid #E24B4A',
    borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
  },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '24px 32px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: {
    backgroundColor: '#fff', borderRadius: '16px',
    padding: '20px 24px', display: 'flex', gap: '16px',
    alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    borderLeft: '4px solid #E24B4A'
  },
  statIcon: {
    width: '48px', height: '48px', borderRadius: '12px',
    backgroundColor: '#fff5f5', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '24px'
  },
  statNum: { fontSize: '24px', fontWeight: '800', color: '#E24B4A', margin: '0 0 2px' },
  statLabel: { fontSize: '13px', color: '#999', margin: 0 },
  tabsWrap: { display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '4px' },
  tab: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 16px', borderRadius: '20px',
    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
    whiteSpace: 'nowrap', transition: 'all 0.2s'
  },
  tabCount: {
    padding: '2px 8px', borderRadius: '10px',
    fontSize: '11px', fontWeight: '700'
  },
  loadingBox: { textAlign: 'center', padding: '80px' },
  emptyBox: { textAlign: 'center', padding: '80px' },
  emptyText: { color: '#999', fontSize: '16px' },
  ordersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: '20px' },
  orderCard: {
    backgroundColor: '#fff', borderRadius: '16px',
    padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  cardHeaderLeft: { display: 'flex', flexDirection: 'column', gap: '2px' },
  orderNum: { fontSize: '16px', fontWeight: '800', color: '#1a1a1a' },
  orderTime: { fontSize: '12px', color: '#999' },
  statusBadge: {
    padding: '5px 12px', borderRadius: '20px',
    fontSize: '11px', fontWeight: '700'
  },
  customerRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '12px', backgroundColor: '#f8f8f8', borderRadius: '10px' },
  customerAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    backgroundColor: '#E24B4A', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '14px', flexShrink: 0
  },
  customerName: { fontSize: '14px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 2px' },
  customerEmail: { fontSize: '12px', color: '#999', margin: 0 },
  itemsList: { marginBottom: '12px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  itemQty: {
    backgroundColor: '#f0f0f0', color: '#333',
    padding: '2px 8px', borderRadius: '6px',
    fontSize: '12px', fontWeight: '700', flexShrink: 0
  },
  itemName: { flex: 1, fontSize: '14px', color: '#333' },
  itemPrice: { fontSize: '14px', fontWeight: '600', color: '#1a1a1a' },
  totalRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '12px',
    backgroundColor: '#f8f8f8', borderRadius: '10px', marginBottom: '12px'
  },
  totalLabel: { fontSize: '13px', color: '#666', fontWeight: '600' },
  totalAmount: { fontSize: '18px', fontWeight: '800', color: '#E24B4A' },
  addressRow: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' },
  addressIcon: { fontSize: '14px' },
  addressText: { fontSize: '13px', color: '#666' },
  actionBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #E24B4A, #ff6b6b)',
    color: '#fff', border: 'none', borderRadius: '12px',
    fontSize: '14px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(226,75,74,0.3)',
    transition: 'all 0.2s'
  },
  deliveredBadge: {
    textAlign: 'center', padding: '12px',
    backgroundColor: '#f0fdf4', color: '#22c55e',
    borderRadius: '12px', fontWeight: '700', fontSize: '14px'
  }
};

export default MerchantDashboard;