const ThongKe = require('../models/thongKeModel');

// Thống kê tổng quan hệ thống
exports.thongKeTongQuan = (req, res) => {
  ThongKe.thongKeTongQuan((err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi thống kê tổng quan', details: err });
    res.json(results[0] || {});
  });
};

// Thống kê doanh thu theo khoảng thời gian
exports.thongKeDoanhThu = (req, res) => {
  const { ngayBatDau, ngayKetThuc } = req.query;
  
  if (!ngayBatDau || !ngayKetThuc) {
    return res.status(400).json({ error: 'Thiếu tham số ngayBatDau và ngayKetThuc (format: YYYY-MM-DD)' });
  }
  
  ThongKe.thongKeDoanhThu(ngayBatDau, ngayKetThuc, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi thống kê doanh thu', details: err });
    res.json(results);
  });
};

// Thống kê tổng quan doanh thu
exports.thongKeTongQuanDoanhThu = (req, res) => {
  const { ngayBatDau, ngayKetThuc } = req.query;
  
  if (!ngayBatDau || !ngayKetThuc) {
    return res.status(400).json({ error: 'Thiếu tham số ngayBatDau và ngayKetThuc (format: YYYY-MM-DD)' });
  }
  
  ThongKe.thongKeTongQuanDoanhThu(ngayBatDau, ngayKetThuc, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi thống kê tổng quan doanh thu', details: err });
    res.json(results[0] || {});
  });
};

// Thống kê doanh thu theo bác sĩ
exports.thongKeDoanhThuTheoBacSi = (req, res) => {
  const { ngayBatDau, ngayKetThuc } = req.query;
  
  if (!ngayBatDau || !ngayKetThuc) {
    return res.status(400).json({ error: 'Thiếu tham số ngayBatDau và ngayKetThuc (format: YYYY-MM-DD)' });
  }
  
  ThongKe.thongKeDoanhThuTheoBacSi(ngayBatDau, ngayKetThuc, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi thống kê doanh thu theo bác sĩ', details: err });
    res.json(results);
  });
};

// Thống kê doanh thu theo khoa
exports.thongKeDoanhThuTheoKhoa = (req, res) => {
  const { ngayBatDau, ngayKetThuc } = req.query;
  
  if (!ngayBatDau || !ngayKetThuc) {
    return res.status(400).json({ error: 'Thiếu tham số ngayBatDau và ngayKetThuc (format: YYYY-MM-DD)' });
  }
  
  ThongKe.thongKeDoanhThuTheoKhoa(ngayBatDau, ngayKetThuc, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi thống kê doanh thu theo khoa', details: err });
    res.json(results);
  });
};

// Thống kê bệnh nhân
exports.thongKeBenhNhan = (req, res) => {
  const { ngayBatDau, ngayKetThuc } = req.query;
  
  // Nếu không có tham số, lấy thống kê tổng
  const ngayBD = ngayBatDau || '1900-01-01';
  const ngayKT = ngayKetThuc || '9999-12-31';
  
  ThongKe.thongKeBenhNhan(ngayBD, ngayKT, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi thống kê bệnh nhân', details: err });
    res.json(results[0] || {});
  });
};

// Thống kê lịch hẹn
exports.thongKeLichHen = (req, res) => {
  const { ngayBatDau, ngayKetThuc } = req.query;
  
  if (!ngayBatDau || !ngayKetThuc) {
    return res.status(400).json({ error: 'Thiếu tham số ngayBatDau và ngayKetThuc (format: YYYY-MM-DD)' });
  }
  
  ThongKe.thongKeLichHen(ngayBatDau, ngayKetThuc, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi thống kê lịch hẹn', details: err });
    res.json(results);
  });
};

// Thống kê phương thức thanh toán
exports.thongKePhuongThucThanhToan = (req, res) => {
  const { ngayBatDau, ngayKetThuc } = req.query;
  
  if (!ngayBatDau || !ngayKetThuc) {
    return res.status(400).json({ error: 'Thiếu tham số ngayBatDau và ngayKetThuc (format: YYYY-MM-DD)' });
  }
  
  ThongKe.thongKePhuongThucThanhToan(ngayBatDau, ngayKetThuc, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi thống kê phương thức thanh toán', details: err });
    res.json(results);
  });
};

