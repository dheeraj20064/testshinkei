// ─── MOCK DATABASE ───────────────────────────────────────────────────────────

const products = {
  'P001': { name: 'Laptop',   price: 999.99, stock: 10 },
  'P002': { name: 'Mouse',    price: 29.99,  stock: 50 },
  'P003': { name: 'Keyboard', price: 79.99,  stock: 30 },
  'P004': { name: 'Monitor',  price: 399.99, stock: 5  }
};

const users = {
  'U001': { name: 'Alice', coupon: 0.10, card: '4111111111111111', email: 'alice@example.com', phone: '+1234567890', loyaltyPoints: 120, loyaltyTier: 'silver' },
  'U002': { name: 'Bob',   coupon: 0.20, card: '4222222222222222', email: 'bob@example.com',   phone: '+0987654321', loyaltyPoints: 340, loyaltyTier: 'gold'   }
};

const orderHistory = {
  'U001': [
    { orderId: 'ORD-001', total: 120.00, createdAt: '2026-01-10' },
    { orderId: 'ORD-002', total: 340.00, createdAt: '2026-02-14' }
  ],
  'U002': [
    { orderId: 'ORD-003', total: 890.00, createdAt: '2026-01-22' },
    { orderId: 'ORD-004', total: 1200.00, createdAt: '2026-03-01' },
    { orderId: 'ORD-005', total: 430.00, createdAt: '2026-03-10' }
  ]
};

const promos = [
  { id: 'PROMO-1', title: 'Spring Sale', discount: '15% off next order' },
  { id: 'PROMO-2', title: 'Free Shipping', discount: 'On orders above $500' }
];

const campaigns = [
  { id: 'CAMP-1', name: 'Double Points Weekend', multiplier: 2.0, active: true },
  { id: 'CAMP-2', name: 'New User Bonus',         multiplier: 1.5, active: false }
];

const loyaltyDB   = {};
const invoiceStore = {};
const stockLog    = [];
const auditLog    = [];
const emailLog    = [];
const smsLog      = [];
const fraudLog    = [];

// ─── LEVEL 4 — deepest helpers ───────────────────────────────────────────────

function queryStockDB(productId) {
  return products[productId] ? products[productId].stock : 0;
}

function fetchProductFromDB(productId) {
  const product = products[productId];
  if (!product) throw new Error(`Product ${productId} not found`);
  return product;
}

function fetchUserCoupons(userId) {
  return users[userId] ? users[userId].coupon : 0;
}

function callPaymentGateway(card, amount) {
  return { success: true, transactionId: `TXN-${Date.now()}` };
}

function filterSuspiciousOrders(orders) {
  return orders.filter(o => o.total > 800);
}

function getRecentOrderCount(userId) {
  const history = orderHistory[userId] || [];
  const cutoff  = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return history.filter(o => new Date(o.createdAt) > cutoff).length;
}

function getAverageOrderValue(userId) {
  const history = orderHistory[userId] || [];
  if (history.length === 0) return 0;
  const total = history.reduce((sum, o) => sum + o.total, 0);
  return total / history.length;
}

function callFraudAPI(userId, riskScore) {
  const alertId = `FRAUD-${Date.now()}`;
  fraudLog.push({ alertId, userId, riskScore, flaggedAt: new Date().toISOString() });
  return { alertId, status: 'flagged' };
}

function calculateTierBenefits(tier) {
  const benefits = {
    bronze: { bonusPoints: 0,   freeShipping: false },
    silver: { bonusPoints: 10,  freeShipping: true  },
    gold:   { bonusPoints: 25,  freeShipping: true  },
    platinum:{ bonusPoints: 50, freeShipping: true  }
  };
  return benefits[tier] || benefits.bronze;
}

function checkActiveCampaigns() {
  return campaigns.filter(c => c.active);
}

function writeLoyaltyToDB(userId, points) {
  loyaltyDB[userId] = { points, updatedAt: new Date().toISOString() };
  return true;
}

function syncLoyaltyToCache(userId, points) {
  return { cached: true, userId, points, cachedAt: new Date().toISOString() };
}

function renderLineItems(items) {
  return items.map(item => {
    const p = products[item.productId];
    return `${p?.name} x${item.quantity} = $${(p?.price * item.quantity).toFixed(2)}`;
  });
}

function fetchActivePromos() {
  return promos;
}

function callEmailService(to, subject, body) {
  const emailId = `EMAIL-${Date.now()}`;
  emailLog.push({ emailId, to, subject, sentAt: new Date().toISOString() });
  return { emailId, status: 'sent' };
}

function validateEmailAddress(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function callSMSGateway(phone, message) {
  const smsId = `SMS-${Date.now()}`;
  smsLog.push({ smsId, phone, message, sentAt: new Date().toISOString() });
  return { smsId, status: 'delivered' };
}

function formatPhoneNumber(phone) {
  return phone.replace(/\D/g, '');
}

function writeStockToDB(productId, newStock) {
  if (products[productId]) {
    products[productId].stock = newStock;
  }
  return true;
}

function invalidateStockCache(productId) {
  return { invalidated: true, productId, at: new Date().toISOString() };
}

function writeAuditLog(entry) {
  auditLog.push({ ...entry, loggedAt: new Date().toISOString() });
  return true;
}

function getRestockThreshold(productId) {
  const thresholds = { 'P001': 3, 'P002': 10, 'P003': 8, 'P004': 2 };
  return thresholds[productId] || 5;
}

function callWarehouseAPI(productId, currentStock, threshold) {
  return {
    restockRequested: true,
    productId,
    currentStock,
    threshold,
    requestedAt: new Date().toISOString()
  };
}

function enrichOrderItems(items) {
  return items.map(item => ({
    ...item,
    product:   products[item.productId],
    lineTotal: (products[item.productId]?.price || 0) * item.quantity
  }));
}

function fetchUserAddress(userId) {
  const addresses = {
    'U001': { street: '123 Main St', city: 'New York',    zip: '10001' },
    'U002': { street: '456 Oak Ave', city: 'Los Angeles', zip: '90001' }
  };
  return addresses[userId] || {};
}

function applyTaxRules(subtotal, city) {
  const taxRates = { 'New York': 0.08875, 'Los Angeles': 0.0975 };
  const rate     = taxRates[city] || 0.08;
  return parseFloat((subtotal * rate).toFixed(2));
}

function writeInvoiceToDB(invoiceId, data) {
  invoiceStore[invoiceId] = data;
  return true;
}

function generateInvoiceHash(invoiceId, total) {
  return `HASH-${invoiceId}-${total}-${Date.now()}`;
}

function callInvoiceDeliveryAPI(payload) {
  return { delivered: true, deliveryId: `DLVR-${Date.now()}`, payload };
}

function formatInvoicePayload(invoiceData) {
  return {
    id:        invoiceData.invoiceId,
    recipient: invoiceData.user?.email,
    amount:    invoiceData.total,
    issuedAt:  invoiceData.issuedAt
  };
}

// ─── LEVEL 3 ─────────────────────────────────────────────────────────────────

function getWarehouseStock(productId) {
  return queryStockDB(productId);
}

function checkItemExists(productId) {
  return fetchProductFromDB(productId) !== null;
}

function checkQuantity(quantity) {
  if (quantity <= 0)   throw new Error('Quantity must be greater than 0');
  if (quantity > 100)  throw new Error('Quantity cannot exceed 100');
  return true;
}

function applyDiscount(userId, subtotal) {
  const discount = fetchUserCoupons(userId);
  return subtotal * (1 - discount);
}

function calculateTax(amount) {
  return amount * 0.08;
}

function verifyCardDetails(card) {
  if (!card || card.length < 12) throw new Error('Invalid card');
  return true;
}

function processPayment(card, amount) {
  const result = callPaymentGateway(card, amount);
  if (!result.success) throw new Error('Payment failed');
  return result.transactionId;
}

function queryOrderHistory(userId) {
  const history   = orderHistory[userId] || [];
  const suspicious = filterSuspiciousOrders(history);
  return { history, suspicious };
}

function checkOrderFrequency(userId) {
  const count = getRecentOrderCount(userId);
  return { count, isHigh: count > 5 };
}

function checkHighValueOrder(userId, total) {
  const avg    = getAverageOrderValue(userId);
  const isHigh = total > avg * 2;
  return { avg, isHigh };
}

function notifyFraudTeam(userId, riskScore) {
  return callFraudAPI(userId, riskScore);
}

function getLoyaltyTier(userId) {
  const user = users[userId];
  const tier = user?.loyaltyTier || 'bronze';
  return { tier, benefits: calculateTierBenefits(tier) };
}

function getPointsRate(productId) {
  const rates = { 'P001': 5, 'P002': 2, 'P003': 3, 'P004': 4 };
  return rates[productId] || 1;
}

function applyBonusMultiplier(basePoints) {
  const active     = checkActiveCampaigns();
  const multiplier = active.length > 0 ? active[0].multiplier : 1.0;
  return Math.floor(basePoints * multiplier);
}

function writeLoyaltyBalance(userId, newPoints) {
  writeLoyaltyToDB(userId, newPoints);
  return syncLoyaltyToCache(userId, newPoints);
}

function formatOrderSummary(orderId, items, total) {
  const lines = renderLineItems(items);
  return `Order ${orderId}\n${lines.join('\n')}\nTotal: $${total}`;
}

function attachPromoContent() {
  const activePromos = fetchActivePromos();
  return activePromos.map(p => `${p.title}: ${p.discount}`).join('\n');
}

function sendEmail(to, subject, body) {
  if (!validateEmailAddress(to)) throw new Error(`Invalid email: ${to}`);
  return callEmailService(to, subject, body);
}

function sendSMSMessage(phone, message) {
  const formatted = formatPhoneNumber(phone);
  return callSMSGateway(formatted, message);
}

function logStockMovement(productId, quantity, orderId) {
  return writeAuditLog({ type: 'STOCK_DEDUCT', productId, quantity, orderId });
}

function deductStockFromDB(productId, quantity) {
  const current  = queryStockDB(productId);
  const newStock = current - quantity;
  writeStockToDB(productId, newStock);
  invalidateStockCache(productId);
  return newStock;
}

function notifyWarehouse(productId, currentStock) {
  const threshold = getRestockThreshold(productId);
  if (currentStock <= threshold) {
    return callWarehouseAPI(productId, currentStock, threshold);
  }
  return null;
}

function fetchOrderDetails(orderId, items) {
  return { orderId, items: enrichOrderItems(items) };
}

function fetchUserProfile(userId) {
  const user    = users[userId];
  const address = fetchUserAddress(userId);
  return { userId, name: user?.name, email: user?.email, address };
}

function calculateInvoiceTotals(items, city) {
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const tax      = applyTaxRules(subtotal, city);
  return { subtotal, tax, total: parseFloat((subtotal + tax).toFixed(2)) };
}

function saveInvoiceRecord(invoiceId, data) {
  writeInvoiceToDB(invoiceId, data);
  const hash = generateInvoiceHash(invoiceId, data.total);
  return { invoiceId, hash };
}

function dispatchInvoiceToUser(invoiceData) {
  const payload = formatInvoicePayload(invoiceData);
  return callInvoiceDeliveryAPI(payload);
}

// ─── LEVEL 2 ─────────────────────────────────────────────────────────────────

function validateCart(items) {
  for (const item of items) {
    checkItemExists(item.productId);
    checkQuantity(item.quantity);
  }
  return true;
}

function checkStock(items) {
  for (const item of items) {
    const available = getWarehouseStock(item.productId);
    if (available < item.quantity) {
      throw new Error(`Not enough stock for ${item.productId}. Available: ${available}`);
    }
  }
  return true;
}

function calculateTotal(items, userId) {
  let subtotal = 0;
  for (const item of items) {
    const product = fetchProductFromDB(item.productId);
    subtotal += product.price * item.quantity;
  }
  const afterDiscount = applyDiscount(userId, subtotal);
  const tax           = calculateTax(afterDiscount);
  return parseFloat((afterDiscount + tax).toFixed(2));
}

function chargeCustomer(userId, amount) {
  const user = users[userId];
  if (!user) throw new Error(`User ${userId} not found`);
  verifyCardDetails(user.card);
  return processPayment(user.card, amount);
}

// fraud check branch
function fetchUserHistory(userId) {
  return queryOrderHistory(userId);
}

function scoreRiskLevel(userId, total) {
  const frequency  = checkOrderFrequency(userId);
  const highValue  = checkHighValueOrder(userId, total);
  let score = 0;
  if (frequency.isHigh)  score += 40;
  if (highValue.isHigh)  score += 40;
  return { score, frequency, highValue };
}

function flagIfRisky(userId, riskScore) {
  if (riskScore >= 60) {
    const alert = notifyFraudTeam(userId, riskScore);
    return { flagged: true, alert };
  }
  return { flagged: false };
}

// loyalty branch
function fetchLoyaltyAccount(userId) {
  const user      = users[userId];
  const tierInfo  = getLoyaltyTier(userId);
  return { userId, currentPoints: user?.loyaltyPoints || 0, ...tierInfo };
}

function calculatePointsEarned(items) {
  let base = 0;
  for (const item of items) {
    base += getPointsRate(item.productId) * item.quantity;
  }
  return applyBonusMultiplier(base);
}

function updateLoyaltyBalance(userId, pointsEarned) {
  const user      = users[userId];
  const newPoints = (user?.loyaltyPoints || 0) + pointsEarned;
  if (user) user.loyaltyPoints = newPoints;
  return writeLoyaltyBalance(userId, newPoints);
}

// email/sms branch
function buildEmailTemplate(orderId, items, total) {
  const summary = formatOrderSummary(orderId, items, total);
  const promoContent = attachPromoContent();
  return { subject: `Order Confirmed: ${orderId}`, body: `${summary}\n\n${promoContent}` };
}

function sendOrderEmail(userId, orderId, items, total) {
  const user     = users[userId];
  const template = buildEmailTemplate(orderId, items, total);
  return sendEmail(user.email, template.subject, template.body);
}

function sendOrderSMS(userId, orderId) {
  const user = users[userId];
  return sendSMSMessage(user.phone, `Your order ${orderId} is confirmed!`);
}

// inventory branch
function deductStock(productId, quantity, orderId) {
  const remaining = deductStockFromDB(productId, quantity);
  logStockMovement(productId, quantity, orderId);
  return remaining;
}

function checkLowStockAlert(productId, currentStock) {
  return notifyWarehouse(productId, currentStock);
}

// invoice branch
function buildInvoiceData(orderId, userId, items, total, transactionId) {
  const orderDetails = fetchOrderDetails(orderId, items);
  const userProfile  = fetchUserProfile(userId);
  const totals       = calculateInvoiceTotals(orderDetails.items, userProfile.address?.city);
  return {
    invoiceId:     `INV-${Date.now()}`,
    orderId,
    user:          userProfile,
    items:         orderDetails.items,
    total,
    calculatedTotal: totals.total,
    tax:           totals.tax,
    transactionId,
    issuedAt:      new Date().toISOString()
  };
}

function saveInvoice(invoiceData) {
  return saveInvoiceRecord(invoiceData.invoiceId, invoiceData);
}

function dispatchInvoice(invoiceData) {
  return dispatchInvoiceToUser(invoiceData);
}

// ─── LEVEL 1 — 5 major functions called by placeOrder ────────────────────────

function runFraudCheck(userId, items, total) {
  const history   = fetchUserHistory(userId);
  const risk      = scoreRiskLevel(userId, total);
  const flagResult = flagIfRisky(userId, risk.score);
  return {
    riskScore:       risk.score,
    suspiciousOrders: history.suspicious.length,
    flagged:         flagResult.flagged,
    alert:           flagResult.alert || null
  };
}

function applyLoyaltyPoints(userId, items) {
  const account      = fetchLoyaltyAccount(userId);
  const earned       = calculatePointsEarned(items);
  const syncResult   = updateLoyaltyBalance(userId, earned);
  return {
    previousPoints: account.currentPoints,
    pointsEarned:   earned,
    newTotal:       (account.currentPoints + earned),
    tier:           account.tier,
    synced:         syncResult.cached
  };
}

function sendOrderConfirmation(userId, orderId, items, total) {
  const emailResult = sendOrderEmail(userId, orderId, items, total);
  const smsResult   = sendOrderSMS(userId, orderId);
  return { email: emailResult, sms: smsResult };
}

function updateInventory(items, orderId) {
  const alerts = [];
  for (const item of items) {
    const remaining = deductStock(item.productId, item.quantity, orderId);
    const alert     = checkLowStockAlert(item.productId, remaining);
    if (alert) alerts.push(alert);
  }
  return { updated: true, alerts };
}

function generateInvoice(orderId, userId, items, total, transactionId) {
  const invoiceData    = buildInvoiceData(orderId, userId, items, total, transactionId);
  const saveResult     = saveInvoice(invoiceData);
  const dispatchResult = dispatchInvoice(invoiceData);
  return {
    invoiceId:   invoiceData.invoiceId,
    hash:        saveResult.hash,
    dispatched:  dispatchResult.delivered,
    issuedAt:    invoiceData.issuedAt
  };
}

// ─── LEVEL 0 — entry point ───────────────────────────────────────────────────

function placeOrder(userId, items) {
  validateCart(items);
  checkStock(items);
  const total         = calculateTotal(items, userId);
  const transactionId = chargeCustomer(userId, total);
  const orderId       = `ORD-${Date.now()}`;

  const fraud     = runFraudCheck(userId, items, total);
  const loyalty   = applyLoyaltyPoints(userId, items);
  const confirm   = sendOrderConfirmation(userId, orderId, items, total);
  const inventory = updateInventory(items, orderId);
  const invoice   = generateInvoice(orderId, userId, items, total, transactionId);

  return {
    orderId,
    userId,
    items,
    total,
    transactionId,
    status:          fraud.flagged ? 'under_review' : 'confirmed',
    createdAt:       new Date().toISOString(),
    fraud,
    loyalty,
    confirmation:    confirm,
    inventoryAlerts: inventory.alerts,
    invoice
  };
}

function getProducts() { return products; }

function getUsers() {
  return Object.entries(users).map(([id, u]) => ({ id, name: u.name }));
}

module.exports = { placeOrder, getProducts, getUsers };