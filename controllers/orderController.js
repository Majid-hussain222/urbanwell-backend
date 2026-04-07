const Order = require('../models/order');

exports.createOrder = async (req, res) => {
  try {
    const { userId, items, paymentMethod } = req.body;

    if (!userId || !items || !paymentMethod) {
      return res.status(400).json({ error: 'userId, items, and paymentMethod are required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items must be a non-empty array' });
    }

    // Validate each item and calculate total
    let totalAmount = 0;
    for (const item of items) {
      if (!item.productId || !item.price || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: 'Each item must have valid productId, price, and quantity >= 1' });
      }
      totalAmount += item.price * item.quantity;
    }

    const order = new Order({
      userId,
      items,
      totalAmount,
      paymentMethod,
    });

    await order.save();

    const populatedOrder = await order.populate('userId', 'name email');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) filter.userId = req.query.userId;

    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: 'Invalid order ID' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (orderStatus) {
      if (!['processing', 'shipped', 'delivered', 'cancelled'].includes(orderStatus)) {
        return res.status(400).json({ error: 'Invalid orderStatus value' });
      }
      order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      if (!['pending', 'paid', 'failed'].includes(paymentStatus)) {
        return res.status(400).json({ error: 'Invalid paymentStatus value' });
      }
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid order ID' });
  }
};
