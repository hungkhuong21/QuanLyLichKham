const db = require('../config/db');

// Tạo tiếp nhận mới
exports.create = (data, callback) => {
  const sql = `INSERT INTO tiepnhan (MaBenhNhan, MaBacSi, MaKhoa, MaLichHen, MaTrangThai, NgayTiepNhan, GhiChu) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [
    data.MaBenhNhan,
    data.MaBacSi,
    data.MaKhoa,
    data.MaLichHen || null,
    data.MaTrangThai,
    data.NgayTiepNhan || new Date(),
    data.GhiChu || null
  ], callback);
};

// Lấy tất cả tiếp nhận
exports.getAll = (callback) => {
  const sql = `SELECT tn.*, tt.TenTrangThai 
               FROM tiepnhan tn 
               LEFT JOIN trangthaitiepnhan tt ON tn.MaTrangThai = tt.MaTrangThai`;
  db.query(sql, callback);
};

// Lấy tiếp nhận theo id
exports.getById = (id, callback) => {
  const sql = `SELECT tn.*, tt.TenTrangThai 
               FROM tiepnhan tn 
               LEFT JOIN trangthaitiepnhan tt ON tn.MaTrangThai = tt.MaTrangThai 
               WHERE tn.MaTiepNhan = ?`;
  db.query(sql, [id], callback);
};

// Lấy tiếp nhận theo MaLichHen
exports.getByMaLichHen = (MaLichHen, callback) => {
  const sql = `SELECT tn.*, tt.TenTrangThai 
               FROM tiepnhan tn 
               LEFT JOIN trangthaitiepnhan tt ON tn.MaTrangThai = tt.MaTrangThai 
               WHERE tn.MaLichHen = ?`;
  db.query(sql, [MaLichHen], callback);
};

// Cập nhật tiếp nhận
exports.update = (id, data, callback) => {
  db.query('SELECT * FROM tiepnhan WHERE MaTiepNhan = ?', [id], (err, results) => {
    if (err) return callback(err);
    if (!results || results.length === 0) return callback(null, { affectedRows: 0 });
    const old = results[0];
    const sql = `UPDATE tiepnhan 
                 SET MaBenhNhan = ?, MaBacSi = ?, MaKhoa = ?, MaLichHen = ?, MaTrangThai = ?, GhiChu = ? 
                 WHERE MaTiepNhan = ?`;
    db.query(sql, [
      data.MaBenhNhan !== undefined ? data.MaBenhNhan : old.MaBenhNhan,
      data.MaBacSi !== undefined ? data.MaBacSi : old.MaBacSi,
      data.MaKhoa !== undefined ? data.MaKhoa : old.MaKhoa,
      data.MaLichHen !== undefined ? data.MaLichHen : old.MaLichHen,
      data.MaTrangThai !== undefined ? data.MaTrangThai : old.MaTrangThai,
      data.GhiChu !== undefined ? data.GhiChu : old.GhiChu,
      id
    ], callback);
  });
};

// Cập nhật trạng thái tiếp nhận
exports.updateTrangThai = (id, MaTrangThai, callback) => {
  const sql = 'UPDATE tiepnhan SET MaTrangThai = ? WHERE MaTiepNhan = ?';
  db.query(sql, [MaTrangThai, id], callback);
};

// Cập nhật tiếp nhận theo MaLichHen
exports.updateByMaLichHen = (MaLichHen, data, callback) => {
  const sql = `UPDATE tiepnhan 
               SET MaTrangThai = ?, GhiChu = ? 
               WHERE MaLichHen = ?`;
  db.query(sql, [
    data.MaTrangThai,
    data.GhiChu || null,
    MaLichHen
  ], callback);
};

// Xóa tiếp nhận
exports.delete = (id, callback) => {
  db.query('DELETE FROM tiepnhan WHERE MaTiepNhan = ?', [id], callback);
};

