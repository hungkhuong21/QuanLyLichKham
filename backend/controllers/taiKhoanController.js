const TaiKhoan = require('../models/taiKhoanModel');

// Lấy tất cả tài khoản
exports.getAllTaiKhoan = (req, res) => {
  TaiKhoan.getAll((err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi lấy danh sách tài khoản' });
    res.json(results);
  });
};

// Lấy tài khoản theo ID
exports.getTaiKhoanById = (req, res) => {
  TaiKhoan.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn' });
    if (results.length === 0) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(results[0]);
  });
};

// Thêm tài khoản
exports.createTaiKhoan = (req, res) => {
  const data = req.body;
  TaiKhoan.create(data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi tạo tài khoản' });
    res.json({ message: 'Tạo tài khoản thành công', MaTK: result.insertId });
  });
};

// Đăng nhập
exports.loginTaiKhoan = (req, res) => {
  const { TenDangNhap, MatKhauHash } = req.body;
  TaiKhoan.login(TenDangNhap, MatKhauHash, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn' });
    if (results.length === 0)
      return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    res.json({ message: 'Đăng nhập thành công', user: results[0] });
  });
};

// Cập nhật tài khoản
exports.updateTaiKhoan = (req, res) => {
  TaiKhoan.update(req.params.id, req.body, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi cập nhật' });
    res.json({ message: 'Cập nhật thành công' });
  });
};

// Xóa tài khoản
exports.deleteTaiKhoan = (req, res) => {
  TaiKhoan.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi xóa' });
    res.json({ message: 'Đã xóa tài khoản' });
  });
};
