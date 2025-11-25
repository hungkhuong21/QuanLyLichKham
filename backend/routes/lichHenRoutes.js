const express = require('express');
const router = express.Router();
const lichHenController = require('../controllers/lichHenController');

// Đặt lịch hẹn mới
router.post('/dat-lich', lichHenController.datLichHen);
// Tiếp nhận online
router.post('/tiep-nhan/online', lichHenController.tiepNhanOnline);
// Tiếp nhận trực tiếp
router.post('/tiep-nhan/truc-tiep', lichHenController.tiepNhanTrucTiep);
// Lấy tất cả lịch hẹn
router.get('/', lichHenController.getAllLichHen);
// Cập nhật trạng thái lịch hẹn (route cũ - giữ lại để tương thích)
router.put('/:MaLichHen/trang-thai', lichHenController.updateTrangThaiLichHen);
// Cập nhật lịch hẹn (route mới - tổng quát hơn)
router.put('/:id', lichHenController.updateLichHen);
// Xóa lịch hẹn
router.delete('/:id', lichHenController.deleteLichHen);
// Lấy lịch hẹn theo id (phải đặt cuối cùng)
router.get('/:id', lichHenController.getLichHenById);

module.exports = router;