const express = require('express');
const router = express.Router();
const tiepNhanController = require('../controllers/tiepNhanController');

// Tiếp nhận theo lịch (từ lịch hẹn đã có)
router.post('/theo-lich', tiepNhanController.tiepNhanTheoLich);

// Tìm kiếm tiếp nhận theo mã lịch hẹn, số điện thoại, cccd
router.get('/search', tiepNhanController.searchTiepNhan);

// Tìm kiếm danh sách bệnh nhân trong ngày (mã lịch hẹn, tên, sđt) - có phân trang
router.get('/tim-kiem-trong-ngay', tiepNhanController.searchDanhSachBenhNhanTrongNgay);

module.exports = router;

