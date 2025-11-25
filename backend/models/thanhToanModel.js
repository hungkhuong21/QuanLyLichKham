const db = require('../config/db');

// Tạo thanh toán mới
exports.create = (data, callback) => {
  const sql = `INSERT INTO thanhtoan (MaHD, PhuongThuc, SoTien, NgayTT, TrangThai) 
               VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [
    data.MaHD,
    data.PhuongThuc,
    data.SoTien,
    data.NgayTT || new Date(),
    data.TrangThai || 'Thành công'
  ], callback);
};

// Lấy tất cả thanh toán
exports.getAll = (callback) => {
  const sql = `SELECT tt.*, hd.MaBN, hd.TongTien AS TongTienHD, hd.TrangThai AS TrangThaiHD,
               bn.HoTen AS TenBenhNhan
               FROM thanhtoan tt 
               LEFT JOIN hoadon hd ON tt.MaHD = hd.MaHD
               LEFT JOIN benhnhan bn ON hd.MaBN = bn.MaBenhNhan
               ORDER BY tt.NgayTT DESC`;
  db.query(sql, callback);
};

// Lấy thanh toán theo id
exports.getById = (id, callback) => {
  const sql = `SELECT tt.*, hd.*, bn.HoTen AS TenBenhNhan 
               FROM thanhtoan tt 
               LEFT JOIN hoadon hd ON tt.MaHD = hd.MaHD
               LEFT JOIN benhnhan bn ON hd.MaBN = bn.MaBenhNhan
               WHERE tt.MaTT = ?`;
  db.query(sql, [id], callback);
};

// Lấy thanh toán theo MaHD
exports.getByMaHD = (MaHD, callback) => {
  const sql = `SELECT tt.*, hd.*, bn.HoTen AS TenBenhNhan 
               FROM thanhtoan tt 
               LEFT JOIN hoadon hd ON tt.MaHD = hd.MaHD
               LEFT JOIN benhnhan bn ON hd.MaBN = bn.MaBenhNhan
               WHERE tt.MaHD = ? 
               ORDER BY tt.NgayTT DESC`;
  db.query(sql, [MaHD], callback);
};

// Lấy thanh toán theo MaBN (bệnh nhân)
exports.getByMaBN = (MaBN, callback) => {
  const sql = `SELECT tt.*, hd.*, bn.HoTen AS TenBenhNhan 
               FROM thanhtoan tt 
               LEFT JOIN hoadon hd ON tt.MaHD = hd.MaHD
               LEFT JOIN benhnhan bn ON hd.MaBN = bn.MaBenhNhan
               WHERE hd.MaBN = ? 
               ORDER BY tt.NgayTT DESC`;
  db.query(sql, [MaBN], callback);
};

// Cập nhật thanh toán
exports.update = (id, data, callback) => {
  db.query('SELECT * FROM thanhtoan WHERE MaTT = ?', [id], (err, results) => {
    if (err) return callback(err);
    if (!results || results.length === 0) return callback(null, { affectedRows: 0 });
    const old = results[0];
    const sql = `UPDATE thanhtoan 
                 SET PhuongThuc = ?, SoTien = ?, TrangThai = ? 
                 WHERE MaTT = ?`;
    db.query(sql, [
      data.PhuongThuc !== undefined ? data.PhuongThuc : old.PhuongThuc,
      data.SoTien !== undefined ? data.SoTien : old.SoTien,
      data.TrangThai !== undefined ? data.TrangThai : old.TrangThai,
      id
    ], callback);
  });
};

// Cập nhật trạng thái thanh toán
exports.updateTrangThai = (id, TrangThai, callback) => {
  const sql = 'UPDATE thanhtoan SET TrangThai = ? WHERE MaTT = ?';
  db.query(sql, [TrangThai, id], callback);
};

// Xóa thanh toán
exports.delete = (id, callback) => {
  db.query('DELETE FROM thanhtoan WHERE MaTT = ?', [id], callback);
};

