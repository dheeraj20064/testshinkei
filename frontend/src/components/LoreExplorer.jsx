import { useState, useEffect } from 'react';
import './LoreExplorer.css';

export default function OrderDashboard() {
  const [products, setProducts] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [cart, setCart] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/order/products')
      .then(r => r.json())
      .then(d => setProducts(d.products))
      .catch(() => setError('Could not load products'));

    fetch('/api/order/users')
      .then(r => r.json())
      .then(d => {
        setUsers(d.users);
        setSelectedUser(d.users[0]?.id || '');
      })
      .catch(() => setError('Could not load users'));
  }, []);

  function addToCart(productId) {
    setCart(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  }

  function removeFromCart(productId) {
    setCart(prev => prev.filter(i => i.productId !== productId));
  }

  async function handlePlaceOrder() {
    if (!selectedUser || cart.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/order/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser, items: cart })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setResult(data.order);
      setCart([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1 className="dashboard__title">Order System</h1>
        <p className="dashboard__subtitle">Function Call Depth Tester</p>
      </header>

      <div className="dashboard__body">

        <section className="card">
          <h2 className="card__title">Select Customer</h2>
          <div className="user-list">
            {users.length === 0 ? (
              <p className="empty-msg">Loading users...</p>
            ) : (
              users.map(u => (
                <button
                  key={u.id}
                  className={`user-btn ${selectedUser === u.id ? 'active' : ''}`}
                  onClick={() => setSelectedUser(u.id)}
                >
                  {u.name} ({u.id})
                </button>
              ))
            )}
          </div>
        </section>

        <section className="card">
          <h2 className="card__title">Products</h2>
          {Object.keys(products).length === 0 ? (
            <p className="empty-msg">Loading products...</p>
          ) : (
            <div className="product-grid">
              {Object.entries(products).map(([id, p]) => (
                <div className="product-card" key={id}>
                  <div className="product-card__name">{p.name}</div>
                  <div className="product-card__price">${p.price}</div>
                  <div className="product-card__stock">Stock: {p.stock}</div>
                  <button className="btn-add" onClick={() => addToCart(id)}>
                    + Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="card__title">
            Cart {cart.length > 0 && `(${cart.length} items)`}
          </h2>
          {cart.length === 0 ? (
            <p className="empty-msg">No items added yet.</p>
          ) : (
            <>
              <div className="cart-list">
                {cart.map(item => (
                  <div className="cart-item" key={item.productId}>
                    <span className="cart-item__id">{item.productId}</span>
                    <span className="cart-item__name">
                      {products[item.productId]?.name}
                    </span>
                    <span className="cart-item__qty">x{item.quantity}</span>
                    <span className="cart-item__price">
                      ${((products[item.productId]?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                    <button
                      className="btn-remove"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="btn-order"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </>
          )}
        </section>

        {error && (
          <section className="card card--error">
            <h2 className="card__title">Error</h2>
            <p>{error}</p>
          </section>
        )}

        {result && (
          <section className="card card--success">
            <h2 className="card__title">Order Confirmed!</h2>
            <div className="result-grid">
              <div className="result-row">
                <span>Order ID</span>
                <strong>{result.orderId}</strong>
              </div>
              <div className="result-row">
                <span>Total</span>
                <strong>${result.total}</strong>
              </div>
              <div className="result-row">
                <span>Transaction</span>
                <strong>{result.transactionId}</strong>
              </div>
              <div className="result-row">
                <span>Status</span>
                <strong>{result.status}</strong>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}