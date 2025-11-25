
const express = require('express');
const router = express.Router();
const bacSiController = require('../controllers/bacSiController');

<<<<<<< HEAD
=======
router.get('/search', bacSiController.searchBacSi);
>>>>>>> b4b6cfeb909f213e1a81c974526a9106ae793471
router.get('/', bacSiController.getAllBacSi);
router.get('/:id', bacSiController.getBacSiById);
router.post('/', bacSiController.createBacSi);
router.put('/:id', bacSiController.updateBacSi);
router.delete('/:id', bacSiController.deleteBacSi);

// Thống kê bác sĩ
router.get('/thongke/active', bacSiController.getTotalActive);
router.get('/thongke/inactive', bacSiController.getTotalInactive);

module.exports = router;
