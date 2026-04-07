// ============================================================
// routes/chat.js
// ============================================================
const express = require('express');
const router  = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/chatController');

router.get ('/',                          requireAuth, ctrl.getConversations);
router.post('/',                          requireAuth, ctrl.startConversation);
router.get ('/unread-count',              requireAuth, ctrl.getUnreadCount);
router.get ('/:id/messages',             requireAuth, ctrl.getMessages);
router.post('/:id/messages',             requireAuth, ctrl.sendMessage);
router.delete('/:id',                    requireAuth, ctrl.deleteConversation);

module.exports = router;


// ============================================================
// routes/notifications.js
// ============================================================
// (save this as a separate file: routes/notifications.js)
/*
const express = require('express');
const router  = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/notificationController');

router.get   ('/',                requireAuth, ctrl.getNotifications);
router.put   ('/mark-all-read',   requireAuth, ctrl.markAllRead);
router.delete('/clear-all',       requireAuth, ctrl.clearAll);
router.put   ('/:id/read',        requireAuth, ctrl.markRead);
router.delete('/:id',             requireAuth, ctrl.deleteNotification);

module.exports = router;
*/


// ============================================================
// routes/workoutHistory.js
// ============================================================
// (save this as a separate file: routes/workoutHistory.js)
/*
const express = require('express');
const router  = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/workoutLogController');

router.get ('/',    requireAuth, ctrl.getHistory);
router.post('/',    requireAuth, ctrl.createLog);
router.get ('/:id', requireAuth, ctrl.getOne);
router.put ('/:id', requireAuth, ctrl.updateLog);
router.delete('/:id', requireAuth, ctrl.deleteLog);

module.exports = router;
*/