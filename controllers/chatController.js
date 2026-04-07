// ============================================================
// controllers/chatController.js
// ============================================================
const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');
const Notification = require('../models/Notification');
const User         = require('../models/User');

/* ── helpers ── */
const err = (res, msg, status = 400) => res.status(status).json({ success: false, message: msg });

// ─── GET /api/chat/conversations ─────────────────────────────
// Returns all conversations for the logged-in user, sorted by last message
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ user: req.user._id })
      .populate('trainer',      'name specialty hourlyRate avatar rating')
      .populate('nutritionist', 'name specialty sessionPrice avatar rating')
      .populate('booking',      'sessionType date status')
      .sort({ lastMessageAt: -1 });

    // Attach latest message preview for each
    const result = await Promise.all(conversations.map(async (conv) => {
      const lastMsg = await Message.findOne({ conversation: conv._id })
        .sort({ createdAt: -1 })
        .select('text sender createdAt read');
      return { ...conv.toObject(), lastMessageData: lastMsg };
    }));

    res.json({ success: true, count: result.length, data: result });
  } catch (e) {
    err(res, e.message, 500);
  }
};

// ─── POST /api/chat/conversations ────────────────────────────
// Start or get existing conversation with a trainer / nutritionist
exports.startConversation = async (req, res) => {
  try {
    const { trainerId, nutritionistId, bookingId } = req.body;
    if (!trainerId && !nutritionistId) return err(res, 'Provide trainerId or nutritionistId');

    const query = { user: req.user._id };
    if (trainerId)      query.trainer      = trainerId;
    if (nutritionistId) query.nutritionist = nutritionistId;

    let conv = await Conversation.findOne(query)
      .populate('trainer',      'name specialty avatar rating')
      .populate('nutritionist', 'name specialty avatar rating');

    if (!conv) {
      conv = await Conversation.create({
        user: req.user._id,
        trainer:      trainerId      || null,
        nutritionist: nutritionistId || null,
        booking:      bookingId      || null,
      });
      conv = await Conversation.findById(conv._id)
        .populate('trainer',      'name specialty avatar rating')
        .populate('nutritionist', 'name specialty avatar rating');
    }

    res.json({ success: true, data: conv });
  } catch (e) {
    err(res, e.message, 500);
  }
};

// ─── GET /api/chat/conversations/:id/messages ─────────────────
// Paginated messages for a conversation + auto-marks as read
exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 50;

    // Verify user owns this conversation
    const conv = await Conversation.findOne({ _id: id, user: req.user._id });
    if (!conv) return err(res, 'Conversation not found', 404);

    const total = await Message.countDocuments({ conversation: id });
    const messages = await Message.find({ conversation: id })
      .populate('sender', 'name role avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Mark unread messages (sent TO this user) as read
    await Message.updateMany(
      { conversation: id, sender: { $ne: req.user._id }, read: false },
      { read: true, readAt: new Date() }
    );
    // Reset user's unread counter
    await Conversation.findByIdAndUpdate(id, { unreadUser: 0 });

    res.json({
      success: true,
      data: messages.reverse(),   // oldest first
      pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
  } catch (e) {
    err(res, e.message, 500);
  }
};

// ─── POST /api/chat/conversations/:id/messages ────────────────
// Send a message. Emits real-time event via Socket.io (attached to req.io)
exports.sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text?.trim()) return err(res, 'Message text is required');

    const conv = await Conversation.findOne({ _id: id, user: req.user._id })
      .populate('trainer',      'name')
      .populate('nutritionist', 'name');
    if (!conv) return err(res, 'Conversation not found', 404);

    const message = await Message.create({
      conversation: id,
      sender: req.user._id,
      text: text.trim(),
    });

    const populated = await Message.findById(message._id).populate('sender', 'name role avatar');

    // Update conversation metadata
    await Conversation.findByIdAndUpdate(id, {
      lastMessage:   text.slice(0, 120),
      lastMessageAt: new Date(),
      $inc: { unreadPro: 1 },  // professional has a new unread message
    });

    // Create notification for the professional's linked user account (if exists)
    const proName = conv.trainer?.name || conv.nutritionist?.name || 'Professional';
    // In a real system you'd find the User account associated with the trainer/nutritionist
    // For now we push a notification to the member themselves (server-side echo for demo)

    // ── Real-time via Socket.io ──
    if (req.io) {
      req.io.to(`conversation_${id}`).emit('new_message', populated);
      req.io.to(`conversation_${id}`).emit('conversation_updated', {
        _id: id, lastMessage: text.slice(0, 120), lastMessageAt: new Date(),
      });
    }

    res.status(201).json({ success: true, data: populated });
  } catch (e) {
    err(res, e.message, 500);
  }
};

// ─── GET /api/chat/unread-count ───────────────────────────────
exports.getUnreadCount = async (req, res) => {
  try {
    const result = await Conversation.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: '$unreadUser' } } },
    ]);
    const count = result[0]?.total || 0;
    res.json({ success: true, count });
  } catch (e) {
    err(res, e.message, 500);
  }
};

// ─── DELETE /api/chat/conversations/:id ──────────────────────
exports.deleteConversation = async (req, res) => {
  try {
    const conv = await Conversation.findOne({ _id: req.params.id, user: req.user._id });
    if (!conv) return err(res, 'Not found', 404);
    await Message.deleteMany({ conversation: conv._id });
    await conv.deleteOne();
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (e) {
    err(res, e.message, 500);
  }
};