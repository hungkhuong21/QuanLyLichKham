const express = require('express');
const router = express.Router();
const tiepNhanController = require('../controllers/tiepNhanController');

// Tiếp nhận theo lịch (từ lịch hẹn đã có)
router.post('/theo-lich', tiepNhanController.tiepNhanTheoLich);

module.exports = router;
