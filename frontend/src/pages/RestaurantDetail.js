import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const FOOD_IMAGES = {
  'Butter Chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80',
  'Paneer Tikka': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80',
  'Dal Makhani': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80',
  'Garlic Naan': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80',
  'Mango Lassi': 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&q=80',
  'Gulab Jamun': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80',
  'Chicken Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80',
  'Veg Biryani': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80',
  'Mutton Seekh Kebab': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80',
  'Margherita Pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
  'Chicken BBQ Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
  'Pasta Arrabiata': 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=80',
  'Chicken Fried Rice': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80',
  'Veg Dim Sum': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80',
  'Chicken Manchurian': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80',
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80'
};

const CUISINE_IMAGES = {
  Indian: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
  Mughlai: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
  Italian: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  Chinese: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80',
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'
};

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('delivery');

  useEffect(() => {
    fetchRestaurant();
    fetchMenu();
  }, []);

  const fetchRestaurant = async () => {
    try {
      const res = await axiosInstance.get(`/restaurants/${id}`);
      setRestaurant(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMenu = async () => {
    try {
      const res = await axiosInstance.get(`/restaurants/${id}/menu`);
      setMenuItems(res.data);
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  const addToCart = (item) => {
    const exists = cart.find(c => c._id === item._id);
    if (exists) {
      setCart(cart.map(c => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (item) => {
    const exists = cart.find(c => c._id === item._id);
    if (exists.quantity === 1) {
      setCart(cart.filter(c => c._id !== item._id));
    } else {
      setCart(cart.map(c => c._id === item._id ? { ...c, quantity: c.quantity - 1 } : c));
    }
  };

  const getTotalAmount = () => cart.reduce((t, i) => t + i.price * i.quantity, 0);
  const getTotalItems = () => cart.reduce((t, i) => t + i.quantity, 0);

const placeOrder = () => {
    navigate('/payment', {
      state: {
        cart,
        restaurantId: id,
        totalAmount: getTotalAmount()
      }
    });
  };

  const categories = ['All', ...new Set(menuItems.map(i => i.category))];
  const filteredItems = activeCategory === 'All' ? menuItems : menuItems.filter(i => i.category === activeCategory);

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.spinner}>🍽️</div>
      <p>Loading menu...</p>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Header Image */}
      <div style={styles.headerImg}>
        <img
          src={CUISINE_IMAGES[restaurant?.cuisine] || CUISINE_IMAGES.default}
          alt={restaurant?.name}
          style={styles.headerImgSrc}
        />
        <div style={styles.headerOverlay} />
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Back</button>
        <div style={styles.headerContent}>
          <h1 style={styles.restName}>{restaurant?.name}</h1>
          <p style={styles.restCuisine}>{restaurant?.cuisine} • {restaurant?.deliveryTime}</p>
          <div style={styles.headerBadges}>
            <span style={styles.badge}>⭐ {restaurant?.rating || '4.2'}</span>
            <span style={styles.badge}>{restaurant?.isOpen ? '🟢 Open' : '🔴 Closed'}</span>
            <span style={styles.badge}>🛵 Free delivery</span>
            <button
              style={styles.bookTableBtn}
              onClick={() => navigate(`/booking/${id}`)}
            >
              🍽️ Book a Table
            </button>
          </div>
        </div>
      </div>

      {/* Delivery / Dine In Tabs */}
      <div style={styles.tabsBar}>
        <button
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'delivery' ? '#E24B4A' : '#fff',
            color: activeTab === 'delivery' ? '#fff' : '#333',
            border: activeTab === 'delivery' ? 'none' : '1.5px solid #eee'
          }}
          onClick={() => setActiveTab('delivery')}
        >
          🛵 Delivery
        </button>
        <button
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'dinein' ? '#E24B4A' : '#fff',
            color: activeTab === 'dinein' ? '#fff' : '#333',
            border: activeTab === 'dinein' ? 'none' : '1.5px solid #eee'
          }}
          onClick={() => { setActiveTab('dinein'); navigate(`/booking/${id}`); }}
        >
          🍽️ Dine In
        </button>
      </div>

      <div style={styles.body}>
        {/* Left: Menu */}
        <div style={styles.menuSection}>
          {/* Category tabs */}
          <div style={styles.catTabs}>
            {categories.map(cat => (
              <button
                key={cat}
                style={{
                  ...styles.catTab,
                  backgroundColor: activeCategory === cat ? '#E24B4A' : '#fff',
                  color: activeCategory === cat ? '#fff' : '#333',
                  border: activeCategory === cat ? 'none' : '1px solid #eee'
                }}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          {filteredItems.map(item => {
            const cartItem = cart.find(c => c._id === item._id);
            return (
              <div key={item._id} style={styles.menuItem}>
                <img
                  src={FOOD_IMAGES[item.name] || FOOD_IMAGES.default}
                  alt={item.name}
                  style={styles.foodImg}
                />
                <div style={styles.itemInfo}>
                  <div style={styles.itemTop}>
                    <span style={item.isVeg ? styles.vegDot : styles.nonVegDot}>
                      {item.isVeg ? '🟢' : '🔴'}
                    </span>
                    <h4 style={styles.itemName}>{item.name}</h4>
                  </div>
                  <p style={styles.itemDesc}>{item.description}</p>
                  <p style={styles.itemPrice}>₹{item.price}</p>
                </div>
                <div style={styles.cartControls}>
                  {cartItem ? (
                    <div style={styles.counter}>
                      <button style={styles.counterBtn} onClick={() => removeFromCart(item)}>−</button>
                      <span style={styles.counterNum}>{cartItem.quantity}</span>
                      <button style={styles.counterBtn} onClick={() => addToCart(item)}>+</button>
                    </div>
                  ) : (
                    <button style={styles.addBtn} onClick={() => addToCart(item)}>ADD +</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Cart */}
        <div style={styles.cartSection}>
          <div style={styles.cartBox}>
            <h3 style={styles.cartTitle}>🛒 Your Order</h3>
            {cart.length === 0 ? (
              <div style={styles.emptyCart}>
                <p style={{ fontSize: '40px' }}>🍽️</p>
                <p style={styles.emptyCartText}>Add items to get started</p>
              </div>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item._id} style={styles.cartItem}>
                    <div style={styles.cartItemLeft}>
                      <span style={styles.cartQty}>{item.quantity}x</span>
                      <span style={styles.cartName}>{item.name}</span>
                    </div>
                    <span style={styles.cartPrice}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div style={styles.cartDivider} />
                <div style={styles.cartTotal}>
                  <span>Subtotal</span>
                  <span>₹{getTotalAmount()}</span>
                </div>
                <div style={styles.cartTotal}>
                  <span>Delivery</span>
                  <span style={{ color: '#27AE60' }}>FREE</span>
                </div>
                <div style={{ ...styles.cartTotal, fontWeight: '700', fontSize: '16px' }}>
                  <span>Total</span>
                  <span>₹{getTotalAmount()}</span>
                </div>
                <button style={styles.orderBtn} onClick={placeOrder}>
                  Place Order • ₹{getTotalAmount()}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Cart Bar */}
      {cart.length > 0 && (
        <div style={styles.mobileCart} onClick={placeOrder}>
          <span>{getTotalItems()} items • ₹{getTotalAmount()}</span>
          <span>Place Order →</span>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8f8f8', fontFamily: "'Segoe UI', sans-serif" },
  loadingPage: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#666' },
  spinner: { fontSize: '48px', marginBottom: '16px' },
  headerImg: { position: 'relative', height: '280px' },
  headerImgSrc: { width: '100%', height: '100%', objectFit: 'cover' },
  headerOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.2))' },
  backBtn: {
    position: 'absolute', top: '20px', left: '20px',
    backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff',
    border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px',
    padding: '8px 16px', cursor: 'pointer', fontSize: '14px',
    backdropFilter: 'blur(4px)'
  },
  headerContent: { position: 'absolute', bottom: '24px', left: '24px' },
  restName: { color: '#fff', fontSize: '32px', fontWeight: '800', margin: '0 0 4px' },
  restCuisine: { color: 'rgba(255,255,255,0.8)', margin: '0 0 12px', fontSize: '15px' },
  headerBadges: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff',
    padding: '4px 12px', borderRadius: '20px', fontSize: '13px',
    backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)'
  },
  bookTableBtn: {
    padding: '8px 20px', backgroundColor: '#fff',
    color: '#E24B4A', border: 'none',
    borderRadius: '20px', cursor: 'pointer',
    fontWeight: '700', fontSize: '14px'
  },
  tabsBar: {
    display: 'flex', gap: '12px', padding: '16px 24px',
    backgroundColor: '#fff', borderBottom: '1px solid #eee'
  },
  tabBtn: {
    padding: '10px 24px', borderRadius: '20px',
    cursor: 'pointer', fontSize: '14px', fontWeight: '700',
    transition: 'all 0.2s'
  },
  body: { display: 'flex', gap: '24px', padding: '24px', maxWidth: '1200px', margin: '0 auto', alignItems: 'flex-start' },
  menuSection: { flex: 1 },
  catTabs: { display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '4px' },
  catTab: {
    padding: '8px 18px', borderRadius: '20px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap'
  },
  menuItem: {
    display: 'flex', gap: '16px', backgroundColor: '#fff',
    borderRadius: '16px', padding: '16px', marginBottom: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', alignItems: 'center'
  },
  foodImg: { width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 },
  itemInfo: { flex: 1 },
  itemTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  vegDot: { fontSize: '12px' },
  nonVegDot: { fontSize: '12px' },
  itemName: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1a1a' },
  itemDesc: { color: '#999', fontSize: '13px', margin: '0 0 8px', lineHeight: '1.4' },
  itemPrice: { color: '#1a1a1a', fontWeight: '700', fontSize: '15px', margin: 0 },
  cartControls: { flexShrink: 0 },
  addBtn: {
    padding: '8px 20px', backgroundColor: '#fff',
    color: '#E24B4A', border: '2px solid #E24B4A',
    borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px'
  },
  counter: { display: 'flex', alignItems: 'center', gap: '12px' },
  counterBtn: {
    width: '34px', height: '34px', backgroundColor: '#E24B4A',
    color: '#fff', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontSize: '20px', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  counterNum: { fontSize: '16px', fontWeight: '700', color: '#1a1a1a', minWidth: '20px', textAlign: 'center' },
  cartSection: { width: '320px', flexShrink: 0, position: 'sticky', top: '24px' },
  cartBox: {
    backgroundColor: '#fff', borderRadius: '16px',
    padding: '24px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)'
  },
  cartTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 20px' },
  emptyCart: { textAlign: 'center', padding: '24px 0' },
  emptyCartText: { color: '#999', fontSize: '14px' },
  cartItem: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '12px'
  },
  cartItemLeft: { display: 'flex', gap: '8px', alignItems: 'center' },
  cartQty: {
    backgroundColor: '#f0f0f0', color: '#333',
    padding: '2px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: '700'
  },
  cartName: { fontSize: '14px', color: '#333' },
  cartPrice: { fontSize: '14px', fontWeight: '600', color: '#1a1a1a' },
  cartDivider: { borderTop: '1px dashed #eee', margin: '16px 0' },
  cartTotal: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '14px', color: '#333', marginBottom: '8px'
  },
  orderBtn: {
    width: '100%', padding: '14px',
    backgroundColor: '#E24B4A', color: '#fff',
    border: 'none', borderRadius: '12px',
    fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '16px'
  },
  mobileCart: {
    position: 'fixed', bottom: '20px', left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#E24B4A', color: '#fff',
    padding: '14px 32px', borderRadius: '12px',
    display: 'flex', gap: '24px', alignItems: 'center',
    boxShadow: '0 4px 20px rgba(226,75,74,0.4)',
    cursor: 'pointer', fontWeight: '700', fontSize: '15px',
    zIndex: 999
  }
};

export default RestaurantDetail;