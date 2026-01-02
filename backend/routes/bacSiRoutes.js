
const express = require('express');
const router = express.Router();
const bacSiController = require('../controllers/bacSiController');


router.get('/search', bacSiController.searchBacSi);
router.get('/', bacSiController.getAllBacSi);
router.get('/:id', bacSiController.getBacSiById);
router.post('/', bacSiController.createBacSi);
router.put('/:id', bacSiController.updateBacSi);
router.delete('/:id', bacSiController.deleteBacSi);

// Thống kê bác sĩ
router.get('/thongke/active', bacSiController.getTotalActive);
router.get('/thongke/inactive', bacSiController.getTotalInactive);

module.exports = router;
