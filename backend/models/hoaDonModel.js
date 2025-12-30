const db = require('../config/db');

// Tạo hóa đơn mới
exports.create = (data, callback) => {
  const sql = `INSERT INTO hoadon (MaBN, NgayLap, TongTien, Thue, GiamGia, TrangThai) 
               VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [
    data.MaBN,
    data.NgayLap || new Date(),
    data.TongTien,
    data.Thue || 0,
    data.GiamGia || 0,
    data.TrangThai || 'Chưa thanh toán'
  ], callback);
};

// Lấy tất cả hóa đơn
exports.getAll = (callback) => {
  const sql = `SELECT hd.*, bn.HoTen AS TenBenhNhan, bn.SoDienThoai 
               FROM hoadon hd 
               LEFT JOIN benhnhan bn ON hd.MaBN = bn.MaBenhNhan 
               ORDER BY hd.NgayLap DESC`;
  db.query(sql, callback);
};

// Lấy hóa đơn theo id
exports.getById = (id, callback) => {
  const sql = `SELECT hd.*, bn.HoTen AS TenBenhNhan, bn.SoDienThoai, bn.CMND_CCCD, bn.DiaChi 
               FROM hoadon hd 
               LEFT JOIN benhnhan bn ON hd.MaBN = bn.MaBenhNhan 
               WHERE hd.MaHD = ?`;
  db.query(sql, [id], callback);
};

// Lấy hóa đơn theo MaBN (bệnh nhân)
exports.getByMaBN = (MaBN, callback) => {
  const sql = `SELECT hd.*, bn.HoTen AS TenBenhNhan 
               FROM hoadon hd 
               LEFT JOIN benhnhan bn ON hd.MaBN = bn.MaBenhNhan 
               WHERE hd.MaBN = ? 
               ORDER BY hd.NgayLap DESC`;
  db.query(sql, [MaBN], callback);
};

// Cập nhật hóa đơn
exports.update = (id, data, callback) => {
  db.query('SELECT * FROM hoadon WHERE MaHD = ?', [id], (err, results) => {
    if (err) return callback(err);
    if (!results || results.length === 0) return callback(null, { affectedRows: 0 });
    const old = results[0];
    const sql = `UPDATE hoadon 
                 SET TongTien = ?, Thue = ?, GiamGia = ?, TrangThai = ? 
                 WHERE MaHD = ?`;
    db.query(sql, [
      data.TongTien !== undefined ? data.TongTien : old.TongTien,
      data.Thue !== undefined ? data.Thue : old.Thue,
      data.GiamGia !== undefined ? data.GiamGia : old.GiamGia,
      data.TrangThai !== undefined ? data.TrangThai : old.TrangThai,
      id
    ], callback);
  });
};

// Cập nhật trạng thái hóa đơn
exports.updateTrangThai = (id, TrangThai, callback) => {
  const sql = 'UPDATE hoadon SET TrangThai = ? WHERE MaHD = ?';
  db.query(sql, [TrangThai, id], callback);
};

// Xóa hóa đơn
exports.delete = (id, callback) => {
  db.query('DELETE FROM hoadon WHERE MaHD = ?', [id], callback);
};

// Tính tổng tiền sau thuế và giảm giá
exports.calculateTotal = (TongTien, Thue, GiamGia) => {
  const thueAmount = (TongTien * Thue) / 100;
  const total = TongTien + thueAmount - GiamGia;
  return Math.max(0, total); // Đảm bảo không âm
};

