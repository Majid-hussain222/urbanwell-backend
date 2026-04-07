const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const mongoose   = require('mongoose');
const cors       = require('cors');
const dotenv     = require('dotenv');
const jwt        = require('jsonwebtoken');

dotenv.config();

const app    = express();
const server = http.createServer(app);

/* ─── Socket.io ─────────────────────────────────────────── */
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
app.use((req, _res, next) => { req.io = io; next(); });

/* ─── Middleware ─────────────────────────────────────────── */
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ─── Database ───────────────────────────────────────────── */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB:', err.message); process.exit(1); });

/* ─── Routes ─────────────────────────────────────────────── */
app.use('/api/auth',             require('./routes/auth'));
app.use('/api/dietitians', require('./routes/dietitian'));
app.use('/api/discover',         require('./routes/discover'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/users',            require('./routes/user'));
app.use('/api/progress',         require('./routes/progress'));
app.use('/api/workouts',         require('./routes/workout'));
app.use('/api/workouts/history', require('./routes/workoutHistory'));
app.use('/api/trainers',         require('./routes/trainer'));
app.use('/api/nutritionists',    require('./routes/nutritionist'));
app.use('/api/gym-packages',     require('./routes/gym'));
app.use('/api/bookings',         require('./routes/booking'));
app.use('/api/meals',            require('./routes/meal'));
app.use('/api/reviews',          require('./routes/review'));
app.use('/api/chat',             require('./routes/chat'));
app.use('/api/notifications',    require('./routes/notifications'));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

/* ─── Socket.io auth + events ───────────────────────────── */
const User         = require('./models/User');
const Message      = require('./models/Message');
const Conversation = require('./models/Conversation');

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('No token'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id || decoded._id).select('-password');
    if (!user) return next(new Error('User not found'));
    socket.user = user;
    next();
  } catch { next(new Error('Invalid token')); }
});

io.on('connection', (socket) => {
  const uid = socket.user._id.toString();
  socket.join(`user_${uid}`);

  socket.on('join_conversation', async (id) => {
    const conv = await Conversation.findOne({ _id: id, user: socket.user._id });
    if (conv) socket.join(`conv_${id}`);
    else socket.emit('error', 'Access denied');
  });

  socket.on('leave_conversation', (id) => socket.leave(`conv_${id}`));

  socket.on('typing_start', ({ conversationId }) =>
    socket.to(`conv_${conversationId}`).emit('user_typing', { userId: uid, name: socket.user.name }));

  socket.on('typing_stop', ({ conversationId }) =>
    socket.to(`conv_${conversationId}`).emit('user_stop_typing', { userId: uid }));

  socket.on('send_message', async ({ conversationId, text }) => {
    try {
      if (!text?.trim()) return;
      const conv = await Conversation.findOne({ _id: conversationId, user: socket.user._id });
      if (!conv) return socket.emit('error', 'Not found');
      const msg = await Message.create({ conversation: conversationId, sender: uid, text: text.trim() });
      const pop = await Message.findById(msg._id).populate('sender', 'name role');
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: text.slice(0, 120), lastMessageAt: new Date(), $inc: { unreadPro: 1 },
      });
      io.to(`conv_${conversationId}`).emit('new_message', pop);
    } catch (e) { socket.emit('error', e.message); }
  });

  socket.on('disconnect', () => {});
});

/* ─── Start ──────────────────────────────────────────────── */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server on port ${PORT} | Socket.io enabled`));
module.exports = { app, io };