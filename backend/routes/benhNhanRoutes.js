const express = require('express');
const router = express.Router();
const benhNhanController = require('../controllers/benhNhanController');

<<<<<<< HEAD
=======
router.get('/search', benhNhanController.searchBenhNhan);
>>>>>>> b4b6cfeb909f213e1a81c974526a9106ae793471
router.get('/', benhNhanController.getAllBenhNhan);
router.get('/:id', benhNhanController.getBenhNhanById);
router.post('/', benhNhanController.createBenhNhan);
router.put('/:id', benhNhanController.updateBenhNhan);
router.delete('/:id', benhNhanController.deleteBenhNhan);

module.exports = router;
