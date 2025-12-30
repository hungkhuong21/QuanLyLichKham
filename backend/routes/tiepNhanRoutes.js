const express = require('express');
const router = express.Router();
const tiepNhanController = require('../controllers/tiepNhanController');

// Tiếp nhận theo lịch (từ lịch hẹn đã có)
router.post('/theo-lich', tiepNhanController.tiepNhanTheoLich);

// Tìm kiếm theo mã lịch hẹn, số điện thoại, cccd
router.get('/search', tiepNhanController.searchTiepNhan);

module.exports = router;
