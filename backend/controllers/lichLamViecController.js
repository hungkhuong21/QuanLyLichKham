const LichLamViec = require('../models/lichLamViecModel');

// Lấy danh sách lịch làm việc, hỗ trợ lọc
exports.getAllLichLamViec = (req, res) => {
  const filters = {};
  if (req.query.tenBacSi) filters.tenBacSi = req.query.tenBacSi;
  if (req.query.chuyenKhoa) filters.chuyenKhoa = req.query.chuyenKhoa;
  if (req.query.ngay) filters.ngay = req.query.ngay;
  LichLamViec.getAll(filters, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi lấy danh sách lịch làm việc' });
    res.json(results);
  });
};

// Lấy lịch làm việc theo id
exports.getLichLamViecById = (req, res) => {
  LichLamViec.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn' });
    if (!results || results.length === 0) return res.status(404).json({ message: 'Không tìm thấy lịch làm việc' });
    res.json(results[0]);
  });
};

// Thêm lịch làm việc mới
exports.createLichLamViec = (req, res) => {
  const data = req.body;
  if (!data.MaBacSi || !data.NgayLamViec || !data.GioBatDau || !data.GioKetThuc) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }
  LichLamViec.create(data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi tạo lịch làm việc', details: err });
    res.json({ message: 'Thêm lịch làm việc thành công', MaLich: result.insertId });
  });
};

// Cập nhật lịch làm việc
exports.updateLichLamViec = (req, res) => {
  const data = req.body;
  LichLamViec.update(req.params.id, data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi cập nhật lịch làm việc', details: err });
    res.json({ message: 'Cập nhật thành công' });
  });
};

// Xóa lịch làm việc
exports.deleteLichLamViec = (req, res) => {
  LichLamViec.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi xóa lịch làm việc', details: err });
    res.json({ message: 'Đã xóa lịch làm việc' });
  });
};
