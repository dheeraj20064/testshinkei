import { useState, useEffect } from 'react';
import './LoreExplorer.css';

export default function OrderDashboard() {
  const [products, setProducts] = useState({});
  const [users, setUsers]       = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [cart, setCart]         = useState([]);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

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
    const product = products[productId];
    if (!product) return;
    setCart(prev => {
      const existing   = prev.find(i => i.productId === productId);
      const currentQty = existing ? existing.quantity : 0;
      if (currentQty >= product.stock) {
        alert(`Only ${product.stock} units available for ${product.name}`);
        return prev;
      }
      if (existing) {
        return prev.map(i =>
          i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  }

  function decreaseQty(productId) {
    setCart(prev =>
      prev.map(i =>
        i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i
      ).filter(i => i.quantity > 0)
    );
  }

  function removeFromCart(productId) {
    setCart(prev => prev.filter(i => i.productId !== productId));
  }

  function cartTotal() {
    return cart.reduce((sum, item) =>
      sum + (products[item.productId]?.price || 0) * item.quantity, 0
    ).toFixed(2);
  }

  async function handlePlaceOrder() {
    if (!selectedUser || cart.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/order/place', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: selectedUser, items: cart })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setResult(data.order);
      setCart([]);
      fetch('/api/order/products').then(r => r.json()).then(d => setProducts(d.products));
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
            {users.length === 0 ? <p className="empty-msg">Loading...</p>
              : users.map(u => (
                <button key={u.id}
                  className={`user-btn ${selectedUser === u.id ? 'active' : ''}`}
                  onClick={() => setSelectedUser(u.id)}>
                  {u.name} ({u.id})
                </button>
              ))}
          </div>
        </section>

        <section className="card">
          <h2 className="card__title">Products</h2>
          {Object.keys(products).length === 0 ? <p className="empty-msg">Loading...</p> : (
            <div className="product-grid">
              {Object.entries(products).map(([id, p]) => {
                const inCart     = cart.find(i => i.productId === id);
                const outOfStock = p.stock === 0;
                return (
                  <div className={`product-card ${outOfStock ? 'out-of-stock' : ''}`} key={id}>
                    <div className="product-card__name">{p.name}</div>
                    <div className="product-card__price">${p.price}</div>
                    <div className="product-card__stock">
                      Stock: <span className={p.stock <= 3 ? 'low' : ''}>{p.stock}</span>
                    </div>
                    {inCart && <div className="product-card__qty">In cart: {inCart.quantity}</div>}
                    <button className="btn-add" onClick={() => addToCart(id)} disabled={outOfStock}>
                      {outOfStock ? 'Out of Stock' : '+ Add to Cart'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="card__title">Cart {cart.length > 0 && `(${cart.length} items)`}</h2>
          {cart.length === 0 ? <p className="empty-msg">No items added yet.</p> : (
            <>
              <div className="cart-list">
                {cart.map(item => (
                  <div className="cart-item" key={item.productId}>
                    <span className="cart-item__name">{products[item.productId]?.name}</span>
                    <div className="cart-item__controls">
                      <button className="qty-btn" onClick={() => decreaseQty(item.productId)}>−</button>
                      <span className="cart-item__qty">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => addToCart(item.productId)}>+</button>
                    </div>
                    <span className="cart-item__price">
                      ${((products[item.productId]?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                    <button className="btn-remove" onClick={() => removeFromCart(item.productId)}>✕</button>
                  </div>
                ))}
              </div>
              <div className="cart-footer">
                <span className="cart-total">Total: <strong>${cartTotal()}</strong></span>
                <button className="btn-order" onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
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
            <h2 className="card__title">Order Result</h2>
            <div className="result-grid">

              <div className="result-section">
                <div className="result-section__title">Order</div>
                <div className="result-row"><span>Order ID</span><strong>{result.orderId}</strong></div>
                <div className="result-row"><span>Total</span><strong>${result.total}</strong></div>
                <div className="result-row"><span>Status</span>
                  <strong className={result.status === 'under_review' ? 'warn' : ''}>
                    {result.status}
                  </strong>
                </div>
                <div className="result-row"><span>Transaction</span><strong>{result.transactionId}</strong></div>
              </div>

              <div className="result-section">
                <div className="result-section__title">Fraud Check</div>
                <div className="result-row"><span>Risk Score</span><strong>{result.fraud?.riskScore}</strong></div>
                <div className="result-row"><span>Flagged</span><strong>{result.fraud?.flagged ? 'Yes ⚠' : 'No ✓'}</strong></div>
                <div className="result-row"><span>Suspicious Orders</span><strong>{result.fraud?.suspiciousOrders}</strong></div>
              </div>

              <div className="result-section">
                <div className="result-section__title">Loyalty</div>
                <div className="result-row"><span>Tier</span><strong>{result.loyalty?.tier}</strong></div>
                <div className="result-row"><span>Points Earned</span><strong>+{result.loyalty?.pointsEarned}</strong></div>
                <div className="result-row"><span>New Total</span><strong>{result.loyalty?.newTotal} pts</strong></div>
              </div>

              <div className="result-section">
                <div className="result-section__title">Notifications</div>
                <div className="result-row"><span>Email</span><strong>{result.confirmation?.email?.emailId}</strong></div>
                <div className="result-row"><span>SMS</span><strong>{result.confirmation?.sms?.smsId}</strong></div>
              </div>

              <div className="result-section">
                <div className="result-section__title">Invoice</div>
                <div className="result-row"><span>Invoice ID</span><strong>{result.invoice?.invoiceId}</strong></div>
                <div className="result-row"><span>Dispatched</span><strong>{result.invoice?.dispatched ? 'Yes ✓' : 'No'}</strong></div>
                <div className="result-row"><span>Hash</span><strong className="small">{result.invoice?.hash}</strong></div>
              </div>

              {result.inventoryAlerts?.length > 0 && (
                <div className="result-section result-section--warn">
                  <div className="result-section__title">Stock Alerts</div>
                  {result.inventoryAlerts.map((a, i) => (
                    <div className="result-row" key={i}>
                      <span>{a.productId}</span>
                      <strong>Restock requested ⚠</strong>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </section>
        )}

      </div>
    </div>
  );
}