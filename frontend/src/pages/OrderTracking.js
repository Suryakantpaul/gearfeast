import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000');

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: '📋', desc: 'Your order has been placed' },
  { key: 'ACCEPTED', label: 'Order Accepted', icon: '✅', desc: 'Restaurant accepted your order' },
  { key: 'ORDER_PREPARING', label: 'Preparing', icon: '👨‍🍳', desc: 'Chef is preparing your food' },
  { key: 'COURIER_ASSIGNED', label: 'Courier Assigned', icon: '🚴', desc: 'Delivery partner assigned' },
  { key: 'IN_TRANSIT', label: 'On The Way', icon: '🛵', desc: 'Your order is on the way' },
  { key: 'DELIVERED', label: 'Delivered', icon: '🎉', desc: 'Enjoy your meal!' },
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
      if (orderId === id) {
        setOrder((prev) => ({ ...prev, status }));
      }
    });
    return () => { socket.off('orderStatusUpdated'); };
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await axiosInstance.get(`/orders/${id}`);
      setOrder(res.data);
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  const currentStep = order ? STATUS_STEPS.findIndex(s => s.key === order.status) : 0;
  const currentStatus = STATUS_STEPS[currentStep];

  if (loading) return (
    <div style={styles.loadingPage}>
      <p style={{ fontSize: '48px' }}>🛵</p>
      <p style={{ color: '#666' }}>Loading your order...</p>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Home</button>
        <h2 style={styles.navTitle}>Order Tracking</h2>
        <span style={styles.orderId}>#{id.slice(-6)}</span>
      </div>

      <div style={styles.content}>
        {/* Status Hero */}
        <div style={styles.statusHero}>
          <div style={styles.statusIcon}>{currentStatus?.icon}</div>
          <h2 style={styles.statusTitle}>{currentStatus?.label}</h2>
          <p style={styles.statusDesc}>{currentStatus?.desc}</p>
          {order?.status !== 'DELIVERED' && (
            <div style={styles.etaBox}>
              <span style={styles.etaText}>⏱ Estimated time: 30-45 mins</span>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div style={styles.stepsCard}>
          {STATUS_STEPS.map((step, index) => {
            const isDone = index < currentStep;
            const isActive = index === currentStep;
            return (
              <div key={step.key} style={styles.stepRow}>
                <div style={styles.stepLeft}>
                  <div style={{
                    ...styles.stepDot,
                    backgroundColor: isDone || isActive ? '#E24B4A' : '#eee',
                    transform: isActive ? 'scale(1.2)' : 'scale(1)'
                  }}>
                    {isDone ? '✓' : step.icon}
                  </div>
                  {index < STATUS_STEPS.length - 1 && (
                    <div style={{
                      ...styles.stepConnector,
                      backgroundColor: isDone ? '#E24B4A' : '#eee'
                    }} />
                  )}
                </div>
                <div style={styles.stepRight}>
                  <p style={{
                    ...styles.stepLabel,
                    color: isDone || isActive ? '#1a1a1a' : '#bbb',
                    fontWeight: isActive ? '700' : '500'
                  }}>{step.label}</p>
                  {isActive && (
                    <p style={styles.stepSubLabel}>{step.desc}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Details */}
        {order && (
          <div style={styles.orderCard}>
            <h3 style={styles.cardTitle}>🧾 Order Summary</h3>
            {order.items.map((item, i) => (
              <div key={i} style={styles.itemRow}>
                <span style={styles.itemQty}>{item.quantity}x</span>
                <span style={styles.itemName}>{item.name}</span>
                <span style={styles.itemPrice}>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div style={styles.divider} />
            <div style={styles.totalRow}>
              <span>Delivery</span>
              <span style={{ color: '#27AE60' }}>FREE</span>
            </div>
            <div style={{ ...styles.totalRow, fontWeight: '700', fontSize: '16px' }}>
              <span>Total Paid</span>
              <span style={{ color: '#E24B4A' }}>₹{order.totalAmount}</span>
            </div>
          </div>
        )}

        {/* Delivery Address */}
        {order?.deliveryAddress && (
          <div style={styles.addressCard}>
            <h3 style={styles.cardTitle}>📍 Delivery Address</h3>
            <p style={styles.addressText}>
              {order.deliveryAddress.street}, {order.deliveryAddress.city},
              {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
            </p>
          </div>
        )}

        {/* Review Button */}
        {order?.status === 'DELIVERED' && (
          <button style={styles.reviewBtn} onClick={() => navigate(`/review/${id}`)}>
            ⭐ Rate your order & earn points!
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8f8f8', fontFamily: "'Segoe UI', sans-serif" },
  loadingPage: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' },
  navbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 24px', backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100
  },
  backBtn: {
    backgroundColor: 'transparent', border: 'none',
    color: '#E24B4A', fontSize: '15px', cursor: 'pointer', fontWeight: '600'
  },
  navTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
  orderId: { fontSize: '13px', color: '#999', fontWeight: '600' },
  content: { maxWidth: '600px', margin: '0 auto', padding: '24px 16px' },
  statusHero: {
    backgroundColor: '#fff', borderRadius: '20px',
    padding: '32px', textAlign: 'center',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)', marginBottom: '16px'
  },
  statusIcon: { fontSize: '56px', marginBottom: '12px' },
  statusTitle: { fontSize: '24px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 8px' },
  statusDesc: { color: '#888', fontSize: '15px', margin: '0 0 16px' },
  etaBox: {
    display: 'inline-block', backgroundColor: '#fff5f5',
    padding: '8px 20px', borderRadius: '20px'
  },
  etaText: { color: '#E24B4A', fontSize: '14px', fontWeight: '600' },
  stepsCard: {
    backgroundColor: '#fff', borderRadius: '20px',
    padding: '24px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', marginBottom: '16px'
  },
  stepRow: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
  stepLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  stepDot: {
    width: '40px', height: '40px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', color: '#fff', flexShrink: 0,
    transition: 'all 0.3s'
  },
  stepConnector: { width: '2px', height: '32px', margin: '4px 0' },
  stepRight: { paddingTop: '8px', paddingBottom: '16px', flex: 1 },
  stepLabel: { margin: '0 0 2px', fontSize: '15px' },
  stepSubLabel: { color: '#E24B4A', fontSize: '13px', margin: 0 },
  orderCard: {
    backgroundColor: '#fff', borderRadius: '20px',
    padding: '24px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', marginBottom: '16px'
  },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 16px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  itemQty: {
    backgroundColor: '#f0f0f0', color: '#333',
    padding: '2px 8px', borderRadius: '6px',
    fontSize: '13px', fontWeight: '700'
  },
  itemName: { flex: 1, fontSize: '14px', color: '#333' },
  itemPrice: { fontSize: '14px', fontWeight: '600', color: '#1a1a1a' },
  divider: { borderTop: '1px dashed #eee', margin: '16px 0' },
  totalRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '14px', color: '#333', marginBottom: '8px'
  },
  addressCard: {
    backgroundColor: '#fff', borderRadius: '20px',
    padding: '24px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', marginBottom: '16px'
  },
  addressText: { color: '#666', fontSize: '14px', margin: 0, lineHeight: '1.6' },
  reviewBtn: {
    width: '100%', padding: '16px',
    backgroundColor: '#E24B4A', color: '#fff',
    border: 'none', borderRadius: '16px',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(226,75,74,0.3)'
  }
};

export default OrderTracking;