const products = {
  'P001': { name: 'Laptop',   price: 999.99, stock: 10 },
  'P002': { name: 'Mouse',    price: 29.99,  stock: 50 },
  'P003': { name: 'Keyboard', price: 79.99,  stock: 30 },
  'P004': { name: 'Monitor',  price: 399.99, stock: 5  }
};

const users = {
  'U001': { name: 'Alice', coupon: 0.10, card: '4111111111111111' },
  'U002': { name: 'Bob',   coupon: 0.20, card: '4222222222222222' }
};

function queryStockDB(productId) {
  return products[productId] ? products[productId].stock : 0;
}

function fetchProductFromDB(productId) {
  const product = products[productId];
  if (!product) throw new Error(`Product ${productId} not found`);
  return product;
}

function fetchUserCoupons(userId) {
  const user = users[userId];
  return user ? user.coupon : 0;
}

function callPaymentGateway(card, amount) {
  return { success: true, transactionId: `TXN-${Date.now()}` };
}

function getWarehouseStock(productId) {
  return queryStockDB(productId);
}

function checkItemExists(productId) {
  return fetchProductFromDB(productId) !== null;
}

function checkQuantity(quantity) {
  if (quantity <= 0) throw new Error('Quantity must be greater than 0');
  if (quantity > 100) throw new Error('Quantity cannot exceed 100');
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
  const tax = calculateTax(afterDiscount);
  return parseFloat((afterDiscount + tax).toFixed(2));
}

function chargeCustomer(userId, amount) {
  const user = users[userId];
  if (!user) throw new Error(`User ${userId} not found`);
  verifyCardDetails(user.card);
  return processPayment(user.card, amount);
}

function placeOrder(userId, items) {
  validateCart(items);
  checkStock(items);
  const total = calculateTotal(items, userId);
  const transactionId = chargeCustomer(userId, total);
  return {
    orderId: `ORD-${Date.now()}`,
    userId,
    items,
    total,
    transactionId,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
}

function getProducts() {
  return products;
}

function getUsers() {
  return Object.entries(users).map(([id, u]) => ({ id, name: u.name }));
}

module.exports = { placeOrder, getProducts, getUsers };