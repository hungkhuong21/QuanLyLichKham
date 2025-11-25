const db = require('../config/db');

// Lấy tất cả trạng thái tiếp nhận
exports.getAll = (callback) => {
  db.query('SELECT * FROM trangthaitiepnhan', callback);
};

// Lấy trạng thái theo id
exports.getById = (id, callback) => {
  db.query('SELECT * FROM trangthaitiepnhan WHERE MaTrangThai = ?', [id], callback);
};

// Lấy trạng thái theo tên
exports.getByTen = (tenTrangThai, callback) => {
  db.query('SELECT * FROM trangthaitiepnhan WHERE TenTrangThai = ?', [tenTrangThai], callback);
};

// Tạo trạng thái mới
exports.create = (data, callback) => {
  const sql = 'INSERT INTO trangthaitiepnhan (TenTrangThai) VALUES (?)';
  db.query(sql, [data.TenTrangThai], callback);
};

// Cập nhật trạng thái
exports.update = (id, data, callback) => {
  const sql = 'UPDATE trangthaitiepnhan SET TenTrangThai = ? WHERE MaTrangThai = ?';
  db.query(sql, [data.TenTrangThai, id], callback);
};

// Xóa trạng thái
exports.delete = (id, callback) => {
  db.query('DELETE FROM trangthaitiepnhan WHERE MaTrangThai = ?', [id], callback);
};

