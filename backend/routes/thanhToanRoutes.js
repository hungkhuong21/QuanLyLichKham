const express = require('express');
const router = express.Router();
const thanhToanController = require('../controllers/thanhToanController');

// Hóa đơn
router.get('/hoadon', thanhToanController.getAllHoaDon);
router.get('/hoadon/:id', thanhToanController.getHoaDonById);
router.get('/hoadon/benhnhan/:MaBN', thanhToanController.getHoaDonByMaBN);
router.post('/hoadon', thanhToanController.createHoaDon);
router.put('/hoadon/:id', thanhToanController.updateHoaDon);

// Thanh toán
router.post('/thanh-toan', thanhToanController.thanhToanHoaDon);
router.get('/thanh-toan', thanhToanController.getAllThanhToan);
router.get('/thanh-toan/:id', thanhToanController.getThanhToanById);
router.get('/thanh-toan/hoadon/:MaHD', thanhToanController.getThanhToanByMaHD);
router.get('/thanh-toan/benhnhan/:MaBN', thanhToanController.getThanhToanByMaBN);
router.put('/thanh-toan/:id', thanhToanController.updateThanhToan);
router.delete('/thanh-toan/:id', thanhToanController.deleteThanhToan);

module.exports = router;

