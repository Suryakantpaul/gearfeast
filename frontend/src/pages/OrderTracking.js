import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000');

const STATUS_STEPS = [
  'PENDING',
  'ACCEPTED',
  'ORDER_PREPARING',
  'COURIER_ASSIGNED',
  'IN_TRANSIT',
  'DELIVERED'
];

const STATUS_LABELS = {
  PENDING: '⏳ Order Pending',
  ACCEPTED: '✅ Order Accepted',
  ORDER_PREPARING: '👨‍🍳 Preparing Your Food',
  COURIER_ASSIGNED: '🚴 Courier Assigned',
  IN_TRANSIT: '🛵 On The Way',
  DELIVERED: '🎉 Delivered!'
};

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

    return () => {
      socket.off('orderStatusUpdated');
    };
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await axiosInstance.get(`/orders/${id}`);
      setOrder(res.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : 0;

  if (loading) return <p style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</p>;

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate('/')}>
        ← Back to Home
      </button>

      <div style={styles.card}>
        <h2 style={styles.title}>Order Tracking</h2>
        <p style={styles.orderId}>Order ID: {id}</p>

        <div style={styles.statusBox}>
          <h3 style={styles.currentStatus}>
            {STATUS_LABELS[order?.status]}
          </h3>
        </div>

        <div style={styles.steps}>
          {STATUS_STEPS.map((step, index) => (
            <div key={step} style={styles.step}>
              <div style={{
                ...styles.stepDot,
                backgroundColor: index <= currentStep ? '#E24B4A' : '#ddd'
              }}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              {index < STATUS_STEPS.length - 1 && (
                <div style={{
                  ...styles.stepLine,
                  backgroundColor: index < currentStep ? '#E24B4A' : '#ddd'
                }} />
              )}
              <p style={{
                ...styles.stepLabel,
                color: index <= currentStep ? '#E24B4A' : '#999'
              }}>
                {STATUS_LABELS[step]}
              </p>
            </div>
          ))}
        </div>

        {order && (
          <div style={styles.orderDetails}>
            <h3 style={styles.sectionTitle}>Order Details</h3>
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
        )}

        {order?.status === 'DELIVERED' && !order?.review && (
          <button
            style={styles.reviewBtn}
            onClick={() => navigate(`/review/${id}`)}
          >
            Leave a Review ⭐
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '24px' },
  backBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#E24B4A',
    marginBottom: '16px'
  },
  card: {
    backgroundColor: '#fff',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    maxWidth: '600px',
    margin: '0 auto'
  },
  title: { fontSize: '24px', color: '#333', margin: '0 0 8px' },
  orderId: { color: '#999', fontSize: '13px', marginBottom: '24px' },
  statusBox: {
    backgroundColor: '#fff5f5',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '32px',
    textAlign: 'center'
  },
  currentStatus: { color: '#E24B4A', margin: 0, fontSize: '20px' },
  steps: { display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '32px' },
  step: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
  stepDot: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '13px',
    flexShrink: 0
  },
  stepLine: { width: '2px', height: '20px', marginLeft: '15px' },
  stepLabel: { fontSize: '14px', margin: 0 },
  orderDetails: {
    borderTop: '1px solid #eee',
    paddingTop: '24px'
  },
  sectionTitle: { fontSize: '18px', marginBottom: '16px', color: '#333' },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#333'
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    borderTop: '1px solid #eee',
    paddingTop: '12px',
    marginTop: '12px'
  },
  reviewBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#E24B4A',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '24px'
  }
};

export default OrderTracking;