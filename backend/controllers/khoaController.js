const Khoa = require('../models/khoaModel');

// Lấy tất cả khoa
exports.getAllKhoa = (req, res) => {
  Khoa.getAll((err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi lấy danh sách khoa' });
    res.json(results);
  });
};

// Lấy khoa theo mã
exports.getKhoaById = (req, res) => {
  Khoa.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn' });
    if (!results || results.length === 0) return res.status(404).json({ message: 'Không tìm thấy khoa' });
    res.json(results[0]);
  });
};

// Thêm mới khoa
exports.createKhoa = (req, res) => {
  const data = req.body;
  if (!data.TenKhoa) {
    return res.status(400).json({ error: 'Thiếu tên khoa' });
  }
  Khoa.create(data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi tạo khoa', details: err });
    res.json({ message: 'Thêm khoa thành công', MaKhoa: result.insertId });
  });
};

// Cập nhật khoa
exports.updateKhoa = (req, res) => {
  const data = req.body;
  Khoa.update(req.params.id, data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi cập nhật khoa', details: err });
    res.json({ message: 'Cập nhật thành công' });
  });
};

// Xóa khoa
exports.deleteKhoa = (req, res) => {
  Khoa.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi xóa khoa', details: err });
    res.json({ message: 'Đã xóa khoa' });
  });
};
