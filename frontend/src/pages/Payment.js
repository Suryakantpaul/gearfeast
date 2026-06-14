import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, restaurantId, totalAmount } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const handlePayment = async () => {
    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }
    if (paymentMethod === 'upi' && !upiId) {
      setError('Please enter UPI ID');
      return;
    }
    if (paymentMethod === 'card' && (!cardNumber || !cardName || !cardExpiry || !cardCvv)) {
      setError('Please fill all card details');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.post('/orders', {
        restaurant: restaurantId,
        items: cart.map(i => ({
          menuItem: i._id,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        })),
        totalAmount,
        deliveryAddress: {
          street: '456 Park Street',
          city: 'Durgapur',
          state: 'West Bengal',
          pincode: '713201'
        }
      });
      navigate(`/order/${res.data._id}`);
    } catch (err) {
      setError('Payment failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <h2 style={styles.navTitle}>Payment</h2>
        <div />
      </nav>

      <div style={styles.content}>
        {/* Order Summary */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🧾 Order Summary</h3>
          {cart?.map((item, i) => (
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
          <div style={{ ...styles.totalRow, fontWeight: '800', fontSize: '18px' }}>
            <span>Total</span>
            <span style={{ color: '#E24B4A' }}>₹{totalAmount}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>💳 Choose Payment Method</h3>

          {error && <div style={styles.errorBox}>{error}</div>}

          {/* UPI */}
          <div
            style={{
              ...styles.paymentOption,
              borderColor: paymentMethod === 'upi' ? '#E24B4A' : '#eee',
              backgroundColor: paymentMethod === 'upi' ? '#fff5f5' : '#fff'
            }}
            onClick={() => setPaymentMethod('upi')}
          >
            <div style={styles.paymentLeft}>
              <span style={styles.paymentIcon}>📱</span>
              <div>
                <p style={styles.paymentTitle}>UPI Payment</p>
                <p style={styles.paymentSub}>GPay, PhonePe, Paytm</p>
              </div>
            </div>
            <div style={{
              ...styles.radio,
              borderColor: paymentMethod === 'upi' ? '#E24B4A' : '#ddd',
              backgroundColor: paymentMethod === 'upi' ? '#E24B4A' : '#fff'
            }} />
          </div>

          {paymentMethod === 'upi' && (
            <div style={styles.upiBox}>
              <input
                style={styles.input}
                placeholder="Enter UPI ID (e.g. name@upi)"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
              />
            </div>
          )}

          {/* Card */}
          <div
            style={{
              ...styles.paymentOption,
              borderColor: paymentMethod === 'card' ? '#E24B4A' : '#eee',
              backgroundColor: paymentMethod === 'card' ? '#fff5f5' : '#fff'
            }}
            onClick={() => setPaymentMethod('card')}
          >
            <div style={styles.paymentLeft}>
              <span style={styles.paymentIcon}>💳</span>
              <div>
                <p style={styles.paymentTitle}>Credit / Debit Card</p>
                <p style={styles.paymentSub}>Visa, Mastercard, Rupay</p>
              </div>
            </div>
            <div style={{
              ...styles.radio,
              borderColor: paymentMethod === 'card' ? '#E24B4A' : '#ddd',
              backgroundColor: paymentMethod === 'card' ? '#E24B4A' : '#fff'
            }} />
          </div>

          {paymentMethod === 'card' && (
            <div style={styles.cardBox}>
              <div style={styles.cardPreview}>
                <div style={styles.cardPreviewTop}>
                  <span style={styles.cardChip}>▪️</span>
                  <span style={styles.cardBrand}>VISA</span>
                </div>
                <p style={styles.cardNum}>
                  {cardNumber ? cardNumber.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                </p>
                <div style={styles.cardPreviewBottom}>
                  <span>{cardName || 'CARD HOLDER'}</span>
                  <span>{cardExpiry || 'MM/YY'}</span>
                </div>
              </div>
              <input
                style={styles.input}
                placeholder="Card Number"
                value={cardNumber}
                maxLength={16}
                onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))}
              />
              <input
                style={styles.input}
                placeholder="Card Holder Name"
                value={cardName}
                onChange={e => setCardName(e.target.value.toUpperCase())}
              />
              <div style={styles.cardRow}>
                <input
                  style={{ ...styles.input, flex: 1 }}
                  placeholder="MM/YY"
                  value={cardExpiry}
                  maxLength={5}
                  onChange={e => setCardExpiry(e.target.value)}
                />
                <input
                  style={{ ...styles.input, flex: 1 }}
                  placeholder="CVV"
                  value={cardCvv}
                  maxLength={3}
                  type="password"
                  onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
          )}

          {/* COD */}
          <div
            style={{
              ...styles.paymentOption,
              borderColor: paymentMethod === 'cod' ? '#E24B4A' : '#eee',
              backgroundColor: paymentMethod === 'cod' ? '#fff5f5' : '#fff'
            }}
            onClick={() => setPaymentMethod('cod')}
          >
            <div style={styles.paymentLeft}>
              <span style={styles.paymentIcon}>💵</span>
              <div>
                <p style={styles.paymentTitle}>Cash on Delivery</p>
                <p style={styles.paymentSub}>Pay when your order arrives</p>
              </div>
            </div>
            <div style={{
              ...styles.radio,
              borderColor: paymentMethod === 'cod' ? '#E24B4A' : '#ddd',
              backgroundColor: paymentMethod === 'cod' ? '#E24B4A' : '#fff'
            }} />
          </div>

          {/* Wallet */}
          <div
            style={{
              ...styles.paymentOption,
              borderColor: paymentMethod === 'wallet' ? '#E24B4A' : '#eee',
              backgroundColor: paymentMethod === 'wallet' ? '#fff5f5' : '#fff'
            }}
            onClick={() => setPaymentMethod('wallet')}
          >
            <div style={styles.paymentLeft}>
              <span style={styles.paymentIcon}>👛</span>
              <div>
                <p style={styles.paymentTitle}>GearFeast Wallet</p>
                <p style={styles.paymentSub}>Use your loyalty points</p>
              </div>
            </div>
            <div style={{
              ...styles.radio,
              borderColor: paymentMethod === 'wallet' ? '#E24B4A' : '#ddd',
              backgroundColor: paymentMethod === 'wallet' ? '#E24B4A' : '#fff'
            }} />
          </div>
        </div>

        {/* Pay Button */}
        <button
          style={{
            ...styles.payBtn,
            opacity: loading ? 0.7 : 1
          }}
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? 'Processing...' : `Pay ₹${totalAmount} →`}
        </button>

        <p style={styles.secureText}>🔒 100% Secure Payment</p>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8f8f8', fontFamily: "'Segoe UI', sans-serif" },
  navbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 24px', backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    position: 'sticky', top: 0, zIndex: 100
  },
  backBtn: {
    backgroundColor: 'transparent', border: 'none',
    color: '#E24B4A', fontSize: '15px', cursor: 'pointer', fontWeight: '600'
  },
  navTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
  content: { maxWidth: '560px', margin: '0 auto', padding: '24px 16px' },
  card: {
    backgroundColor: '#fff', borderRadius: '20px',
    padding: '24px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    marginBottom: '16px'
  },
  cardTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 20px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  itemQty: {
    backgroundColor: '#f0f0f0', color: '#333',
    padding: '2px 8px', borderRadius: '6px',
    fontSize: '13px', fontWeight: '700'
  },
  itemName: { flex: 1, fontSize: '14px', color: '#333' },
  itemPrice: { fontSize: '14px', fontWeight: '600' },
  divider: { borderTop: '1px dashed #eee', margin: '16px 0' },
  totalRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '14px', color: '#333', marginBottom: '8px'
  },
  errorBox: {
    backgroundColor: '#fff5f5', color: '#E24B4A',
    padding: '12px 16px', borderRadius: '10px',
    marginBottom: '16px', fontSize: '14px'
  },
  paymentOption: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px', borderRadius: '14px', border: '2px solid #eee',
    marginBottom: '12px', cursor: 'pointer', transition: 'all 0.2s'
  },
  paymentLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  paymentIcon: { fontSize: '28px' },
  paymentTitle: { fontSize: '15px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 2px' },
  paymentSub: { fontSize: '13px', color: '#999', margin: 0 },
  radio: {
    width: '20px', height: '20px', borderRadius: '50%',
    border: '2px solid #ddd', transition: 'all 0.2s'
  },
  upiBox: { marginBottom: '12px', padding: '0 4px' },
  cardBox: { marginBottom: '12px', padding: '0 4px' },
  cardPreview: {
    background: 'linear-gradient(135deg, #1a1a2e, #E24B4A)',
    borderRadius: '16px', padding: '24px',
    marginBottom: '16px', color: '#fff'
  },
  cardPreviewTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '24px' },
  cardChip: { fontSize: '24px' },
  cardBrand: { fontSize: '20px', fontWeight: '800', fontStyle: 'italic' },
  cardNum: { fontSize: '18px', fontWeight: '600', letterSpacing: '3px', marginBottom: '24px' },
  cardPreviewBottom: { display: 'flex', justifyContent: 'space-between', fontSize: '13px' },
  cardRow: { display: 'flex', gap: '12px' },
  input: {
    width: '100%', padding: '14px 16px',
    border: '2px solid #eee', borderRadius: '12px',
    fontSize: '15px', outline: 'none', marginBottom: '12px',
    boxSizing: 'border-box', fontFamily: "'Segoe UI', sans-serif"
  },
  payBtn: {
    width: '100%', padding: '18px',
    background: 'linear-gradient(135deg, #E24B4A, #ff6b6b)',
    color: '#fff', border: 'none', borderRadius: '16px',
    fontSize: '18px', fontWeight: '800', cursor: 'pointer',
    boxShadow: '0 6px 24px rgba(226,75,74,0.35)',
    marginBottom: '12px'
  },
  secureText: { textAlign: 'center', color: '#999', fontSize: '13px' }
};

export default Payment;