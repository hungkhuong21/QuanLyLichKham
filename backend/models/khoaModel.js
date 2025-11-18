const db = require('../config/db');

// Lấy tất cả khoa
exports.getAll = (callback) => {
  db.query('SELECT * FROM khoa', callback);
};

// Lấy khoa theo mã
exports.getById = (id, callback) => {
  db.query('SELECT * FROM khoa WHERE MaKhoa = ?', [id], callback);
};

// Thêm mới khoa
exports.create = (data, callback) => {
  const sql = 'INSERT INTO khoa (TenKhoa, MoTa) VALUES (?, ?)';
  db.query(sql, [data.TenKhoa, data.MoTa || null], callback);
};

// Cập nhật khoa
exports.update = (id, data, callback) => {
  db.query('SELECT * FROM khoa WHERE MaKhoa = ?', [id], (err, results) => {
    if (err) return callback(err);
    if (!results || results.length === 0) return callback(null, { affectedRows: 0 });
    const old = results[0];
    const sql = 'UPDATE khoa SET TenKhoa = ?, MoTa = ? WHERE MaKhoa = ?';
    db.query(sql, [
      data.TenKhoa !== undefined ? data.TenKhoa : old.TenKhoa,
      data.MoTa !== undefined ? data.MoTa : old.MoTa,
      id
    ], callback);
  });
};

// Xóa khoa
exports.delete = (id, callback) => {
  db.query('DELETE FROM khoa WHERE MaKhoa = ?', [id], callback);
};
