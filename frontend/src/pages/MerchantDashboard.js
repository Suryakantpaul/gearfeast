import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000');

const MerchantDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    socket.on('orderStatusUpdated', ({ orderId, status }) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    });

    return () => {
      socket.off('orderStatusUpdated');
    };
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

  const updateStatus = async (orderId, status) => {
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const STATUS_COLORS = {
    PENDING: '#FFA500',
    ACCEPTED: '#378ADD',
    ORDER_PREPARING: '#9B59B6',
    COURIER_ASSIGNED: '#1ABC9C',
    IN_TRANSIT: '#E67E22',
    DELIVERED: '#2ECC71',
    CANCELLED: '#E74C3C'
  };

  const NEXT_STATUS = {
    PENDING: 'ACCEPTED',
    ACCEPTED: 'ORDER_PREPARING',
    ORDER_PREPARING: 'COURIER_ASSIGNED',
    COURIER_ASSIGNED: 'IN_TRANSIT',
    IN_TRANSIT: 'DELIVERED'
  };

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h1 style={styles.logo}>🍽️ GearFeast — Merchant</h1>
        <div style={styles.navRight}>
          <span style={styles.welcome}>Hi, {user?.name}!</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <h2 style={styles.title}>Orders Dashboard</h2>

        {loading && <p style={styles.loading}>Loading orders...</p>}

        {orders.length === 0 && !loading && (
          <p style={styles.empty}>No orders yet.</p>
        )}

        <div style={styles.grid}>
          {orders.map((order) => (
            <div key={order._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.orderId}>#{order._id.slice(-6)}</span>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: STATUS_COLORS[order.status]
                }}>
                  {order.status}
                </span>
              </div>

              <div style={styles.cardBody}>
                <p style={styles.customer}>
                  👤 {order.customer?.name || 'Customer'}
                </p>
                {order.items.map((item, index) => (
                  <div key={index} style={styles.item}>
                    <span>{item.name} x{item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div style={styles.total}>
                  <span>Total</span>
                  <span>₹{order.totalAmount}</span>
                </div>
              </div>

              {NEXT_STATUS[order.status] && (
                <button
                  style={styles.actionBtn}
                  onClick={() => updateStatus(order._id, NEXT_STATUS[order.status])}
                >
                  Mark as {NEXT_STATUS[order.status].replace(/_/g, ' ')}
                </button>
              )}

              {order.status === 'DELIVERED' && (
                <div style={styles.delivered}>✅ Order Completed</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f5f5f5' },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  logo: { color: '#E24B4A', fontSize: '20px', margin: 0 },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { fontSize: '14px', color: '#333' },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#E24B4A',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  content: { padding: '32px' },
  title: { fontSize: '24px', color: '#333', marginBottom: '24px' },
  loading: { textAlign: 'center', color: '#666' },
  empty: { textAlign: 'center', color: '#666' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #eee'
  },
  orderId: { fontWeight: 'bold', color: '#333' },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  cardBody: { padding: '16px' },
  customer: { color: '#666', fontSize: '14px', marginBottom: '12px' },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#333',
    marginBottom: '8px'
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    borderTop: '1px solid #eee',
    paddingTop: '12px',
    marginTop: '8px'
  },
  actionBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#E24B4A',
    color: '#fff',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  delivered: {
    textAlign: 'center',
    padding: '12px',
    color: '#2ECC71',
    fontWeight: 'bold'
  }
};

export default MerchantDashboard;