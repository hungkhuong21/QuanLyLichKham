const express = require('express');
const router = express.Router();
const lichLamViecController = require('../controllers/lichLamViecController');

router.get('/', lichLamViecController.getAllLichLamViec);
router.get('/:id', lichLamViecController.getLichLamViecById);
router.post('/', lichLamViecController.createLichLamViec);
router.put('/:id', lichLamViecController.updateLichLamViec);
router.delete('/:id', lichLamViecController.deleteLichLamViec);

module.exports = router;
