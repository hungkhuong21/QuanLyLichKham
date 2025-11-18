const express = require('express');
const router = express.Router();
const taiKhoanController = require('../controllers/taiKhoanController');

router.get('/', taiKhoanController.getAllTaiKhoan);
router.get('/:id', taiKhoanController.getTaiKhoanById);
router.post('/register', taiKhoanController.createTaiKhoan);
router.post('/login', taiKhoanController.loginTaiKhoan);
// đặt lại mật khẩu
router.post('/password-reset/request', taiKhoanController.requestPasswordReset);
router.post('/password-reset/verify', taiKhoanController.verifyOtp);
router.post('/password-reset/reset', taiKhoanController.resetPassword);
router.put('/:id', taiKhoanController.updateTaiKhoan);
router.delete('/:id', taiKhoanController.deleteTaiKhoan);

module.exports = router;
