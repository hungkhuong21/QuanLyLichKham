const express = require('express');
const router = express.Router();
const thongKeController = require('../controllers/thongKeController');

// Thống kê tổng quan hệ thống
router.get('/tong-quan', thongKeController.thongKeTongQuan);

// Thống kê doanh thu
router.get('/doanh-thu', thongKeController.thongKeDoanhThu);
router.get('/doanh-thu/tong-quan', thongKeController.thongKeTongQuanDoanhThu);
router.get('/doanh-thu/bac-si', thongKeController.thongKeDoanhThuTheoBacSi);
router.get('/doanh-thu/khoa', thongKeController.thongKeDoanhThuTheoKhoa);

// Thống kê bệnh nhân
router.get('/benh-nhan', thongKeController.thongKeBenhNhan);

// Thống kê lịch hẹn
router.get('/lich-hen', thongKeController.thongKeLichHen);

// Thống kê phương thức thanh toán
router.get('/phuong-thuc-thanh-toan', thongKeController.thongKePhuongThucThanhToan);

module.exports = router;

