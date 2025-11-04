const express = require('express');
const router = express.Router();
const taiKhoanController = require('../controllers/taiKhoanController');

router.get('/', taiKhoanController.getAllTaiKhoan);
router.get('/:id', taiKhoanController.getTaiKhoanById);
router.post('/register', taiKhoanController.createTaiKhoan);
router.post('/login', taiKhoanController.loginTaiKhoan);
router.put('/:id', taiKhoanController.updateTaiKhoan);
router.delete('/:id', taiKhoanController.deleteTaiKhoan);

module.exports = router;
