const BenhNhan = require('../models/benhNhanModel');

// Lấy tất cả bệnh nhân
exports.getAllBenhNhan = (req, res) => {
  BenhNhan.getAll((err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi lấy danh sách bệnh nhân' });
    res.json(results);
  });
};

// Lấy bệnh nhân theo id
exports.getBenhNhanById = (req, res) => {
  BenhNhan.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn' });
    if (!results || results.length === 0) return res.status(404).json({ message: 'Không tìm thấy bệnh nhân' });
    res.json(results[0]);
  });
};

// Thêm bệnh nhân mới
exports.createBenhNhan = (req, res) => {
  const data = req.body;
  if (!data.HoTen || !data.NgaySinh || !data.GioiTinh) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }
  BenhNhan.create(data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi tạo bệnh nhân', details: err });
    res.json({ message: 'Thêm bệnh nhân thành công', MaBenhNhan: result.insertId });
  });
};

// Cập nhật bệnh nhân
exports.updateBenhNhan = (req, res) => {
  const data = req.body;
  BenhNhan.update(req.params.id, data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi cập nhật bệnh nhân', details: err });
    res.json({ message: 'Cập nhật thành công' });
  });
};

// Xóa bệnh nhân
exports.deleteBenhNhan = (req, res) => {
  BenhNhan.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi xóa bệnh nhân', details: err });
    res.json({ message: 'Đã xóa bệnh nhân' });
  });
};
