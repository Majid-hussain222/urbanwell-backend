const express = require('express')
const router = express.Router()
const progressController = require('../controllers/progressController')
const { requireAuth } = require('../middlewares/authMiddleware')

// ✅ Main progress list (auth user) + supports query params: ?date=YYYY-MM-DD&limit=1&page=1&sort=desc
router.get('/', requireAuth, progressController.getUserProgress)

// ✅ Create (auth user)
router.post('/', requireAuth, progressController.logProgress)

// ✅ Stats for auth user
router.get('/stats', requireAuth, progressController.getProgressStats)

// ✅ Get single progress entry (auth user only)
router.get('/:id', requireAuth, progressController.getProgressById)

// ✅ Update (auth user only)
router.put('/:id', requireAuth, progressController.updateProgress)

// ✅ Delete (auth user only)
router.delete('/:id', requireAuth, progressController.deleteProgress)

module.exports = router