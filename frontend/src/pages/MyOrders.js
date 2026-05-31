import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';

const STATUS_COLORS = {
  PENDING: { bg: '#fff8e1', color: '#f59e0b' },
  ACCEPTED: { bg: '#eff6ff', color: '#3b82f6' },
  ORDER_PREPARING: { bg: '#f5f3ff', color: '#8b5cf6' },
  COURIER_ASSIGNED: { bg: '#ecfdf5', color: '#10b981' },
  IN_TRANSIT: { bg: '#fff7ed', color: '#f97316' },
  DELIVERED: { bg: '#f0fdf4', color: '#22c55e' },
  CANCELLED: { bg: '#fef2f2', color: '#ef4444' }
};

const MyOrders = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get('/orders/myorders');
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <div style={styles.navLeft}>
          <button style={styles.backBtn} onClick={() => navigate('/')}>← Back</button>
          <span style={styles.logo}>⚙️ GearFeast</span>
        </div>
        <div style={styles.navRight}>
          <span style={styles.points}>⭐ {user?.loyaltyPoints || 0} pts</span>
          <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
          <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>Logout</button>
        </div>
      </nav>

      <div style={styles.content}>
        <h2 style={styles.title}>My Orders</h2>
        <p style={styles.subtitle}>Track and manage all your orders</p>

        {loading ? (
          <div style={styles.loadingBox}>
            <p style={{ fontSize: '48px' }}>🛵</p>
            <p style={{ color: '#999' }}>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={{ fontSize: '64px' }}>🍽️</p>
            <h3 style={styles.emptyTitle}>No orders yet!</h3>
            <p style={styles.emptyText}>Looks like you haven't ordered anything yet.</p>
            <button style={styles.orderNowBtn} onClick={() => navigate('/')}>
              Order Now →
            </button>
          </div>
        ) : (
          <div style={styles.ordersList}>
            {orders.map(order => {
              const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;
              return (
                <div key={order._id} style={styles.orderCard}>
                  <div style={styles.cardHeader}>
                    <div>
                      <span style={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</span>
                      <span style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div style={{
                      ...styles.statusBadge,
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color
                    }}>
                      {order.status.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <div style={styles.restaurantRow}>
                    <span style={styles.restaurantIcon}>🍴</span>
                    <span style={styles.restaurantName}>
                      {order.restaurant?.name || 'Restaurant'}
                    </span>
                  </div>

                  <div style={styles.itemsList}>
                    {order.items.map((item, i) => (
                      <div key={i} style={styles.itemRow}>
                        <span style={styles.itemQty}>{item.quantity}x</span>
                        <span style={styles.itemName}>{item.name}</span>
                        <span style={styles.itemPrice}>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.cardFooter}>
                    <div style={styles.totalBox}>
                      <span style={styles.totalLabel}>Total</span>
                      <span style={styles.totalAmount}>₹{order.totalAmount}</span>
                    </div>
                    <div style={styles.actionBtns}>
                      {order.status !== 'DELIVERED' && (
                        <button
                          style={styles.trackBtn}
                          onClick={() => navigate(`/order/${order._id}`)}
                        >
                          Track Order 🛵
                        </button>
                      )}
                      {order.status === 'DELIVERED' && !order.review && (
                        <button
                          style={styles.reviewBtn}
                          onClick={() => navigate(`/review/${order._id}`)}
                        >
                          Rate Order ⭐
                        </button>
                      )}
                      {order.status === 'DELIVERED' && order.review && (
                        <div style={styles.reviewedBadge}>
                          ✅ Reviewed • +{order.review.loyaltyPointsEarned} pts
                        </div>
                      )}
                    </div>
                  </div>
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
  navLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  backBtn: {
    backgroundColor: 'transparent', border: 'none',
    color: '#E24B4A', fontSize: '15px', cursor: 'pointer', fontWeight: '600'
  },
  logo: { color: '#E24B4A', fontSize: '20px', fontWeight: '800' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  points: {
    fontSize: '13px', color: '#E24B4A', fontWeight: '700',
    backgroundColor: '#fff5f5', padding: '5px 12px', borderRadius: '20px'
  },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    backgroundColor: '#E24B4A', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '15px'
  },
  logoutBtn: {
    padding: '7px 16px', backgroundColor: 'transparent',
    color: '#E24B4A', border: '1.5px solid #E24B4A',
    borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
  },
  content: { maxWidth: '800px', margin: '0 auto', padding: '32px 16px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 8px' },
  subtitle: { color: '#999', fontSize: '15px', margin: '0 0 32px' },
  loadingBox: { textAlign: 'center', padding: '80px' },
  emptyBox: { textAlign: 'center', padding: '80px' },
  emptyTitle: { fontSize: '24px', fontWeight: '700', color: '#1a1a1a', margin: '16px 0 8px' },
  emptyText: { color: '#999', marginBottom: '24px' },
  orderNowBtn: {
    padding: '14px 32px', backgroundColor: '#E24B4A',
    color: '#fff', border: 'none', borderRadius: '12px',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer'
  },
  ordersList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  orderCard: {
    backgroundColor: '#fff', borderRadius: '16px',
    padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '16px'
  },
  orderId: { fontSize: '16px', fontWeight: '800', color: '#1a1a1a', display: 'block', marginBottom: '4px' },
  orderDate: { fontSize: '12px', color: '#999' },
  statusBadge: {
    padding: '6px 14px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '700'
  },
  restaurantRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
    marginBottom: '16px', padding: '10px 14px',
    backgroundColor: '#f8f8f8', borderRadius: '10px'
  },
  restaurantIcon: { fontSize: '18px' },
  restaurantName: { fontSize: '15px', fontWeight: '700', color: '#1a1a1a' },
  itemsList: { marginBottom: '16px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  itemQty: {
    backgroundColor: '#f0f0f0', color: '#333',
    padding: '2px 8px', borderRadius: '6px',
    fontSize: '12px', fontWeight: '700'
  },
  itemName: { flex: 1, fontSize: '14px', color: '#333' },
  itemPrice: { fontSize: '14px', fontWeight: '600', color: '#1a1a1a' },
  cardFooter: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '16px'
  },
  totalBox: { display: 'flex', flexDirection: 'column' },
  totalLabel: { fontSize: '12px', color: '#999' },
  totalAmount: { fontSize: '20px', fontWeight: '800', color: '#E24B4A' },
  actionBtns: { display: 'flex', gap: '10px' },
  trackBtn: {
    padding: '10px 20px', backgroundColor: '#E24B4A',
    color: '#fff', border: 'none', borderRadius: '10px',
    fontSize: '14px', fontWeight: '700', cursor: 'pointer'
  },
  reviewBtn: {
    padding: '10px 20px', backgroundColor: '#fff',
    color: '#E24B4A', border: '2px solid #E24B4A',
    borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer'
  },
  reviewedBadge: {
    padding: '10px 16px', backgroundColor: '#f0fdf4',
    color: '#22c55e', borderRadius: '10px',
    fontSize: '13px', fontWeight: '700'
  }
};

export default MyOrders;