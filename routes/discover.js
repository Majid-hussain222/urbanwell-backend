const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/discoverController')

router.get('/gyms', ctrl.discoverGyms)

module.exports = router