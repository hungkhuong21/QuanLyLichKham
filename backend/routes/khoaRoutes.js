const express = require('express');
const router = express.Router();
const khoaController = require('../controllers/khoaController');

router.get('/', khoaController.getAllKhoa);
router.get('/:id', khoaController.getKhoaById);
router.post('/', khoaController.createKhoa);
router.put('/:id', khoaController.updateKhoa);
router.delete('/:id', khoaController.deleteKhoa);

module.exports = router;
