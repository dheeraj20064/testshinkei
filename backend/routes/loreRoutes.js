const express = require('express');
const OrderController = require('../controllers/loreController');

const router = express.Router();

router.get('/products',   OrderController.getProducts);
router.get('/users',      OrderController.getUsers);
router.post('/place',     OrderController.placeOrder);

module.exports = router;