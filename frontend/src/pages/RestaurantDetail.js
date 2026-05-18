import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurant();
    fetchMenu();
  }, []);

  const fetchRestaurant = async () => {
    try {
      const res = await axiosInstance.get(`/restaurants/${id}`);
      setRestaurant(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMenu = async () => {
    try {
      const res = await axiosInstance.get(`/restaurants/${id}/menu`);
      setMenuItems(res.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const exists = cart.find((c) => c._id === item._id);
    if (exists) {
      setCart(cart.map((c) =>
        c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (item) => {
    const exists = cart.find((c) => c._id === item._id);
    if (exists.quantity === 1) {
      setCart(cart.filter((c) => c._id !== item._id));
    } else {
      setCart(cart.map((c) =>
        c._id === item._id ? { ...c, quantity: c.quantity - 1 } : c
      ));
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const placeOrder = async () => {
    try {
      const orderData = {
        restaurant: id,
        items: cart.map((item) => ({
          menuItem: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: getTotalAmount(),
        deliveryAddress: {
          street: '456 Park Street',
          city: 'Durgapur',
          state: 'West Bengal',
          pincode: '713201'
        }
      };

      const res = await axiosInstance.post('/orders', orderData);
      navigate(`/order/${res.data._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</p>;

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate('/')}>
        ← Back
      </button>

      {restaurant && (
        <div style={styles.header}>
          <div style={styles.headerIcon}>🍴</div>
          <div>
            <h2 style={styles.name}>{restaurant.name}</h2>
            <p style={styles.cuisine}>{restaurant.cuisine}</p>
            <p style={styles.desc}>{restaurant.description}</p>
            <span style={styles.badge}>
              {restaurant.isOpen ? '🟢 Open' : '🔴 Closed'}
            </span>
          </div>
        </div>
      )}

      <div style={styles.body}>
        <div style={styles.menu}>
          <h3 style={styles.sectionTitle}>Menu</h3>
          {menuItems.length === 0 && (
            <p style={styles.empty}>No menu items available.</p>
          )}
          {menuItems.map((item) => {
            const cartItem = cart.find((c) => c._id === item._id);
            return (
              <div key={item._id} style={styles.menuItem}>
                <div>
                  <span style={styles.vegBadge}>
                    {item.isVeg ? '🟢' : '🔴'}
                  </span>
                  <h4 style={styles.itemName}>{item.name}</h4>
                  <p style={styles.itemDesc}>{item.description}</p>
                  <p style={styles.itemPrice}>₹{item.price}</p>
                </div>
                <div style={styles.cartControls}>
                  {cartItem ? (
                    <div style={styles.counter}>
                      <button style={styles.counterBtn} onClick={() => removeFromCart(item)}>-</button>
                      <span style={styles.counterNum}>{cartItem.quantity}</span>
                      <button style={styles.counterBtn} onClick={() => addToCart(item)}>+</button>
                    </div>
                  ) : (
                    <button style={styles.addBtn} onClick={() => addToCart(item)}>
                      ADD
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {cart.length > 0 && (
          <div style={styles.cartBox}>
            <h3 style={styles.sectionTitle}>Your Cart</h3>
            {cart.map((item) => (
              <div key={item._id} style={styles.cartItem}>
                <span>{item.name} x{item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div style={styles.total}>
              <span>Total</span>
              <span>₹{getTotalAmount()}</span>
            </div>
            <button style={styles.orderBtn} onClick={placeOrder}>
              Place Order
            </button>
          </div>
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
  header: {
    display: 'flex',
    gap: '24px',
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  headerIcon: {
    fontSize: '64px',
    backgroundColor: '#ffeaa7',
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px'
  },
  name: { margin: '0 0 4px', fontSize: '24px', color: '#333' },
  cuisine: { color: '#E24B4A', margin: '0 0 8px' },
  desc: { color: '#666', margin: '0 0 8px' },
  badge: { fontSize: '13px' },
  body: { display: 'flex', gap: '24px', alignItems: 'flex-start' },
  menu: { flex: 1 },
  sectionTitle: { fontSize: '20px', marginBottom: '16px', color: '#333' },
  empty: { color: '#666' },
  menuItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  vegBadge: { fontSize: '12px', marginBottom: '4px' },
  itemName: { margin: '0 0 4px', color: '#333' },
  itemDesc: { color: '#666', fontSize: '13px', margin: '0 0 4px' },
  itemPrice: { color: '#E24B4A', fontWeight: 'bold', margin: 0 },
  cartControls: { display: 'flex', alignItems: 'center' },
  addBtn: {
    padding: '8px 20px',
    backgroundColor: '#E24B4A',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  counter: { display: 'flex', alignItems: 'center', gap: '12px' },
  counterBtn: {
    width: '32px',
    height: '32px',
    backgroundColor: '#E24B4A',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '18px'
  },
  counterNum: { fontSize: '16px', fontWeight: 'bold' },
  cartBox: {
    width: '300px',
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: '24px'
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '14px'
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    fontSize: '16px',
    borderTop: '1px solid #eee',
    paddingTop: '12px',
    marginTop: '12px'
  },
  orderBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#E24B4A',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '16px'
  }
};

export default RestaurantDetail;