const db = require('../config/db');

// Lấy tất cả tài khoản
exports.getAll = (callback) => {
  const sql = 'SELECT * FROM TaiKhoan';
  db.query(sql, callback);
};

// Lấy tài khoản theo ID
exports.getById = (id, callback) => {
  const sql = 'SELECT * FROM TaiKhoan WHERE MaTK = ?';
  db.query(sql, [id], callback);
};

// Thêm tài khoản mới
exports.create = (data, callback) => {
  const sql = `
    INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, VaiTroID, LoaiNguoiDung, MaNguoiDung)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [
    data.TenDangNhap,
    data.MatKhauHash,
    data.VaiTroID,
    data.LoaiNguoiDung,
    data.MaNguoiDung
  ], callback);
};

// Đăng nhập
exports.login = (username, password, callback) => {
  const sql = 'SELECT * FROM TaiKhoan WHERE TenDangNhap = ? AND MatKhauHash = ?';
  db.query(sql, [username, password], callback);
};

// Cập nhật tài khoản
exports.update = (id, data, callback) => {
  const sql = `
    UPDATE TaiKhoan 
    SET MatKhauHash = ?, TrangThai = ?, NgayCapNhat = NOW() 
    WHERE MaTK = ?
  `;
  db.query(sql, [data.MatKhauHash, data.TrangThai, id], callback);
};

// Xóa tài khoản
exports.delete = (id, callback) => {
  const sql = 'DELETE FROM TaiKhoan WHERE MaTK = ?';
  db.query(sql, [id], callback);
};
