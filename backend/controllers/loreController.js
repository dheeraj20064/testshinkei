const { placeOrder, getProducts, getUsers } = require('../services/loreService');

class OrderController {
  static async getProducts(req, res, next) {
    try {
      const products = getProducts();
      res.json({ success: true, products });
    } catch (err) { next(err); }
  }

  static async getUsers(req, res, next) {
    try {
      const users = getUsers();
      res.json({ success: true, users });
    } catch (err) { next(err); }
  }

  static async placeOrder(req, res, next) {
    try {
      const { userId, items } = req.body;
      if (!userId || !items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'userId and items are required' });
      }
      const order = placeOrder(userId, items);
      res.json({ success: true, order });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = OrderController;