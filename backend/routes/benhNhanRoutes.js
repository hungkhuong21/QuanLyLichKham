const express = require('express');
const router = express.Router();
const benhNhanController = require('../controllers/benhNhanController');

router.get('/search', benhNhanController.searchBenhNhan);
router.get('/', benhNhanController.getAllBenhNhan);
router.get('/:id', benhNhanController.getBenhNhanById);
router.post('/', benhNhanController.createBenhNhan);
router.put('/:id', benhNhanController.updateBenhNhan);
router.delete('/:id', benhNhanController.deleteBenhNhan);

module.exports = router;
