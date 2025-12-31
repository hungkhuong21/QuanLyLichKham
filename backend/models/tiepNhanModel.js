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

// Lấy tiếp nhận theo MaLichHen
exports.getByMaLichHen = (MaLichHen, callback) => {
  const sql = `SELECT tn.*, tt.TenTrangThai 
               FROM tiepnhan tn 
               LEFT JOIN trangthaitiepnhan tt ON tn.MaTrangThai = tt.MaTrangThai 
               WHERE tn.MaLichHen = ?`;
  db.query(sql, [MaLichHen], callback);
};

